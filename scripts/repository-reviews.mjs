#!/usr/bin/env node
/** Scoped change requests: proposing is automatic; only a verified owner merge accepts meaning. */
import { existsSync, readFileSync, appendFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Gh } from './lib/github.mjs'
import { ROOT, policyAt, seal, knowledgeHistory, KNOWLEDGE, validateKnowledge, profiles, effectiveKnowledge } from './repository-brain.mjs'
import { buildCandidates, loadLedger, loadPolicy } from './propose.mjs'
import { leaks } from './lib/redact.mjs'

export const REVIEWS = 'brain/reviews.jsonl'
export const ACCEPTANCES = 'brain/acceptances.jsonl'
export const REVIEW_BRANCH = 'harness/repository-learning-'
const lines = (s) => String(s || '').split('\n').filter(Boolean).map(JSON.parse)
const read = (root, path) => existsSync(join(root, path)) ? readFileSync(join(root, path), 'utf8') : ''
export function repositoryCandidates(root = ROOT) {
  const today = new Date().toISOString().slice(0, 10), cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
  const result = buildCandidates({ root, rows: loadLedger(root), policy: loadPolicy(root), today, cutoff })
  const done = new Set(lines(read(root, REVIEWS)).map((r) => r.candidate_id))
  const policy=policyAt(root),history=knowledgeHistory(root),inventories=profiles(root)
  return result.repositoryCandidates.filter((r) => policy.targets.includes(r.repository) && !done.has(r.id)).slice(0, 6).map(c=>{
    const p=inventories.find(p=>p.repository===c.repository),views=[null,...(p?.workflows||[]).map(w=>w.id)].map(workflow=>effectiveKnowledge(history,{repository:c.repository,workflow,families:p?.families||[]},policy))
    return {...c,allowed_workflows:(p?.workflows||[]).map(w=>w.id),accepted_context:[...new Map(views.flatMap(v=>v.accepted).map(r=>[r.id,r])).values()]}
  })
}

export function validateReview(proposal, candidates, policy) {
  if(JSON.stringify(proposal).includes('\u2014'))throw new Error('review_emdash')
  const c = candidates.find((x) => x.id === proposal.candidate_id)
  if (!c || proposal.repository !== c.repository || !policy.targets.includes(proposal.repository)) throw new Error('review_scope_not_earned')
  const allowed = new Set(['candidate_id', 'repository', 'workflow', 'type', 'statement', 'conditions', 'uncertainties', 'why', 'alternative_explanations', 'if_wrong', 'validation', 'rollback', 'supersedes', 'refines', 'contradicts'])
  if (Object.keys(proposal).some((k) => !allowed.has(k))) throw new Error('review_unknown_field')
  for (const key of ['statement', 'why', 'alternative_explanations', 'if_wrong', 'validation', 'rollback']) if (typeof proposal[key] !== 'string' || proposal[key].length < 12 || proposal[key].length > 800 || leaks(proposal[key]) || /<!--|https?:\/\/|[\u0000-\u001f]/u.test(proposal[key])) throw new Error('invalid_review_text')
  if (!['requirement', 'preference', 'procedure', 'hypothesis', 'experiment', 'fact', 'working_decision'].includes(proposal.type)) throw new Error('invalid_review_type')
  if(proposal.type==='working_decision')throw new Error('temporary_decisions_stay_in_native_task_briefs')
  if(proposal.workflow&&!(c.allowed_workflows||[]).includes(proposal.workflow))throw new Error('review_workflow_outside_repository')
  const record = { ...proposal, id: `review.${seal(proposal).slice(0, 20)}`, evidence_ids: [...new Set(c.evidence.map((e) => e.id))], conditions: proposal.conditions || [], uncertainties: proposal.uncertainties || [], supersedes: proposal.supersedes || [], refines: proposal.refines || [], contradicts: proposal.contradicts || [] }
  validateKnowledge({ ...record, version: 1, status: 'candidate', scope: { kind: proposal.workflow?'workflow':'repository', repository: c.repository, ...(proposal.workflow?{workflow:proposal.workflow}:{}) } }, policy)
  return record
}

export async function openReviews({ gh, proposals, root = ROOT }) {
  const policy = policyAt(root), candidates = repositoryCandidates(root)
  const open = await gh.openPulls('ai-harness')
  const budget = Math.max(0, Number(loadPolicy(root).decision_budget || 3) - open.filter((p) => /^harness\/(?:change-|repository-learning-)/.test(p.head?.ref || '')).length)
  const results = []
  for (const proposal of proposals.slice(0, budget)) {
    // One model-written proposal that breaks the gate is refused and named; it never takes
    // the others down with it (a single invalid_review_text failed the whole 2026-10-19 run).
    let r
    try { r = validateReview(proposal, candidates, policy) } catch (e) {
      results.push({ candidate_id: typeof proposal?.candidate_id === 'string' ? proposal.candidate_id : null, status: 'refused', reason: e instanceof Error ? e.message : 'invalid_review' })
      continue
    }
    const branch = `${REVIEW_BRANCH}${r.id.slice(-20)}`
    if (await gh.branchExists('ai-harness', branch)) { results.push({ id: r.id, status: 'already-proposed' }); continue }
    const { branch: base } = await gh.defaultBranch('ai-harness'), head = await gh.headSha('ai-harness', base)
    const current = (await gh.getFile('ai-harness', REVIEWS, head))?.text || ''
    await gh.createBranch('ai-harness', branch, head)
    await gh.commitFiles('ai-harness', branch, head, { [REVIEWS]: current + JSON.stringify(r) + '\n' }, `brain: propose scoped repository learning\n\nCandidate: ${r.candidate_id}. No acceptance or deployment occurs on this branch.`)
    const pr = await gh.openPull('ai-harness', { title: `Review operating knowledge for ${r.repository}`, head: branch, base, draft: true, body: `Proposed knowledge: ${r.statement}\n\nConditions: ${r.conditions.join('; ') || 'AWAITING, verify the proposed applicability.'}\n\nWhy: ${r.why}\n\nAlternative explanation: ${r.alternative_explanations}\n\nIf wrong: ${r.if_wrong}\n\nValidation: ${r.validation}\n\nRollback: ${r.rollback}\n\nEvidence: ${r.evidence_ids.join(', ')}\n\nMerging this change as the repository owner accepts this exact scoped proposal. The promotion worker verifies the owner merge before adding accepted knowledge. Closing it leaves the evidence unchanged.` })
    results.push({ id: r.id, status: 'proposed', pr: pr.number })
  }
  return results
}

export async function promoteOwnerReviews({ gh, root = ROOT, write = false }) {
  const policy = policyAt(root), done = new Set(lines(read(root, ACCEPTANCES)).map((r) => r.review_id)), results = []
  const history = knowledgeHistory(root, policy)
  for (const p of await gh.listPulls('ai-harness', { state: 'closed' })) {
    if (!p.merged_at || !p.head?.ref?.startsWith(REVIEW_BRANCH)) continue
    const pr = await gh.req('GET', `/repos/${gh.owner}/ai-harness/pulls/${p.number}`)
    if (pr.merged_by?.login !== policy.owner) continue
    const files = await gh.req('GET', `/repos/${gh.owner}/ai-harness/pulls/${p.number}/files?per_page=100`)
    if (files.length !== 1 || files[0].filename !== REVIEWS) throw new Error('owner_review_changed_other_files')
    const mergeCommit = await gh.req('GET', `/repos/${gh.owner}/ai-harness/git/commits/${pr.merge_commit_sha}`)
    const before = (await gh.getFile('ai-harness', REVIEWS, mergeCommit.parents[0].sha))?.text || ''
    const after = (await gh.getFile('ai-harness', REVIEWS, pr.merge_commit_sha))?.text || ''
    if (!after.startsWith(before)) throw new Error('review_history_rewritten')
    const additions = lines(after.slice(before.length))
    if (additions.length !== 1) throw new Error('owner_review_must_accept_one_record')
    for (const r of additions) {
      if (done.has(r.id)) continue
      const proof = { ref: `pull-request:${p.number}`, actor: 'Krish', github_login: pr.merged_by.login, merge_sha: pr.merge_commit_sha, repository: r.repository, review_id: r.id, record_hash: seal(r) }
      if (!policy.targets.includes(r.repository)) throw new Error('owner_review_outside_admission')
      const accepted = { id: `accepted.${r.id}`, version: 1, type: r.type, status: 'accepted', scope: { kind: r.workflow?'workflow':'repository', repository: r.repository, ...(r.workflow?{workflow:r.workflow}:{}) }, statement: r.statement, conditions: r.conditions, uncertainties: r.uncertainties, evidence_ids: r.evidence_ids, acceptance_ref: proof.ref, supersedes: r.supersedes, refines: r.refines, contradicts: r.contradicts }
      proof.knowledge_id = accepted.id; proof.knowledge_hash = seal(accepted)
      const approvedPolicy = { ...policy, acceptances: { ...policy.acceptances, [proof.ref]: { actor: 'Krish', repositories: [r.repository], records: { [accepted.id]: proof.knowledge_hash } } } }
      validateKnowledge(accepted, approvedPolicy)
      if (history.some((x) => x.id === accepted.id)) { done.add(r.id); continue }
      if (write) {
        for (const path of [ACCEPTANCES, KNOWLEDGE]) mkdirSync(dirname(join(root, path)), { recursive: true })
        appendFileSync(join(root, ACCEPTANCES), JSON.stringify(proof) + '\n')
        appendFileSync(join(root, KNOWLEDGE), JSON.stringify(accepted) + '\n')
      }
      done.add(r.id); results.push({ id: accepted.id, repository: r.repository, approval: proof.ref })
    }
  }
  return results
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  if (args.includes('--brief')) writeFileSync('repository-candidates.json', JSON.stringify(repositoryCandidates(), null, 2) + '\n')
  else if (args.includes('--promote')) console.log(JSON.stringify(await promoteOwnerReviews({ gh: new Gh(process.env.FLEET_TOKEN), write: args.includes('--write') })))
  else if (args.includes('--open')) {
    const dir = join(ROOT, 'repository-proposals')
    const proposals = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8'))) : []
    console.log(JSON.stringify(await openReviews({ gh: new Gh(process.env.FLEET_TOKEN), proposals })))
  }
}
