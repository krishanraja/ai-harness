#!/usr/bin/env node
/** The existing brain's scoped knowledge tier. Observing never grants acceptance. */
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { digest, KNOWLEDGE_TYPES, validateEpisode } from './lib/learning-episode.mjs'
import { redact, leaks } from './lib/redact.mjs'
import { loadLedger } from './propose.mjs'

export const ROOT = resolve(fileURLToPath(import.meta.url), '../..')
export const KNOWLEDGE = 'brain/knowledge.jsonl'
export const POLICY = 'contract/repository-administration.json'
const STATUSES = new Set(['observed', 'candidate', 'accepted', 'rejected', 'superseded'])
export const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
export const policyAt = (root = ROOT) => {
  const policy = readJson(join(root, POLICY))
  const path = join(root, 'brain/acceptances.jsonl')
  if (existsSync(path)) for (const line of readFileSync(path, 'utf8').split('\n').filter(Boolean)) {
    const proof = JSON.parse(line)
    if (proof.actor !== 'Krish' || proof.github_login !== policy.owner || !/^pull-request:[0-9]+$/.test(proof.ref) || !/^[a-f0-9]{40}$/.test(proof.merge_sha) || !policy.targets.includes(proof.repository)) throw new Error('invalid_owner_merge_proof')
    if (!/^[a-f0-9]{64}$/.test(proof.knowledge_hash || '') || !/^accepted\.review\.[a-f0-9]{20}$/.test(proof.knowledge_id || '')) throw new Error('unbound_owner_merge_proof')
    if (policy.acceptances[proof.ref]) throw new Error('duplicate_owner_merge_proof')
    policy.acceptances[proof.ref] = { actor: 'Krish', repositories: [proof.repository], records: { [proof.knowledge_id]: proof.knowledge_hash } }
  }
  return policy
}
export const canonical = (v) => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical(v[k])])) : v
export const seal = (v) => digest(JSON.stringify(canonical(v)))

export function validateKnowledge(record, policy) {
  if (!record || !/^[a-z][a-z0-9._-]{2,119}$/.test(record.id || '') || !Number.isSafeInteger(record.version) || record.version < 1) throw new Error('invalid_knowledge_identity')
  if (!KNOWLEDGE_TYPES.has(record.type) || !STATUSES.has(record.status)) throw new Error('invalid_knowledge_state')
  if (typeof record.statement !== 'string' || record.statement.length < 12 || record.statement.length > 800 || leaks(record.statement) || /<!--|[\u0000-\u001f]/u.test(record.statement)) throw new Error('invalid_knowledge_statement')
  if (!record.scope || !['unknown', 'global', 'family', 'repository', 'workflow', 'task'].includes(record.scope.kind)) throw new Error('invalid_knowledge_scope')
  if (['repository', 'workflow', 'task'].includes(record.scope.kind) && !policy.targets.includes(record.scope.repository)) throw new Error('unknown_knowledge_repository')
  if (record.scope.kind === 'family' && !policy.families.includes(record.scope.family)) throw new Error('unknown_knowledge_family')
  if (['workflow', 'task'].includes(record.scope.kind) && !/^[a-z0-9._:-]{1,100}$/.test(record.scope[record.scope.kind] || '')) throw new Error('invalid_knowledge_applicability')
  if (!Array.isArray(record.evidence_ids) || !record.evidence_ids.length || record.evidence_ids.some((x) => !/^[A-Za-z0-9._:#-]{1,160}$/.test(x))) throw new Error('missing_knowledge_evidence')
  if (record.status === 'accepted') {
    const approval = policy.acceptances[record.acceptance_ref]
    if (!approval || approval.actor !== 'Krish') throw new Error('knowledge_requires_owner_acceptance')
    if (record.scope.repository && !approval.repositories.includes(record.scope.repository)) throw new Error('acceptance_outside_scope')
    if (approval.records?.[record.id] !== seal(record)) throw new Error('acceptance_content_mismatch')
  }
  for (const k of ['conditions', 'uncertainties']) {
    if (!Array.isArray(record[k]) || record[k].length > 8 || record[k].some((x) => typeof x !== 'string' || x.length > 500 || leaks(x) || /<!--|https?:\/\/|[\u0000-\u001f]/u.test(x))) throw new Error('invalid_knowledge_conditions')
  }
  for (const k of ['supersedes', 'contradicts', 'refines']) if (!Array.isArray(record[k]) || record[k].some((x) => !/^[a-z][a-z0-9._-]{2,119}$/.test(x))) throw new Error('invalid_knowledge_lineage')
  if (record.episode) validateEpisode({ schema_version: 2, repository: record.scope.repository || null, episode_id: record.episode_id, knowledge_type: record.type, episode: record.episode })
  return record
}

export function knowledgeHistory(root = ROOT, policy = policyAt(root)) {
  const path = join(root, KNOWLEDGE)
  const rows = existsSync(path) ? readFileSync(path, 'utf8').split('\n').filter(Boolean).map((s) => validateKnowledge(JSON.parse(s), policy)) : []
  const versions = new Map()
  for (const r of rows) {
    const prior = versions.get(r.id) || 0
    if (r.version !== prior + 1) throw new Error('knowledge_version_not_append_only')
    versions.set(r.id, r.version)
  }
  return rows
}

export function effectiveKnowledge(rows, { repository, workflow = null, task = null, families = [] }, policy) {
  if (!policy.targets.includes(repository)) throw new Error('repository_not_admitted')
  const latest = new Map()
  for (const r of rows) { validateKnowledge(r, policy); if (!latest.has(r.id) || latest.get(r.id).version < r.version) latest.set(r.id, r) }
  const applies = (r) => {
    const s = r.scope
    if (s.kind === 'unknown') return false
    if (s.kind === 'global') return true
    if (s.kind === 'family') return families.includes(s.family)
    return s.repository === repository && (s.kind !== 'workflow' || s.workflow === workflow) && (s.kind !== 'task' || s.task === task)
  }
  const relevant = [...latest.values()].filter(applies)
  const accepted = relevant.filter((r) => r.status === 'accepted' && policy.acceptances[r.acceptance_ref]?.repositories.includes(repository))
  const byId = new Map(accepted.map((r) => [r.id, r]))
  const removed = new Set()
  const visit = (id, stack = new Set()) => {
    if (stack.has(id)) throw new Error('knowledge_supersession_cycle')
    for (const target of byId.get(id)?.supersedes || []) {
      if (!byId.has(target)) continue
      removed.add(target)
      visit(target, new Set([...stack, id]))
    }
  }
  for (const r of accepted) visit(r.id)
  const active = accepted.filter((r) => !removed.has(r.id))
  const conflicts = active.flatMap((r) => r.contradicts.filter((id) => active.some((x) => x.id === id)).map((id) => [r.id, id]))
  return {
    accepted: active,
    conflicts,
    // Experiments and proposed preferences are available as evidence, never executable instructions.
    observations: relevant.filter((r) => r.status === 'observed' || (r.type === 'experiment' && r.status === 'accepted')),
    candidates: relevant.filter((r) => r.status === 'candidate'),
    superseded: accepted.filter((r) => removed.has(r.id)),
  }
}

export function observationKnowledge(observation, policy) {
  if (!observation.id || !observation.quote) return null
  if (!new Set(['ruling', 'correction', 'failure', 'successful_pattern', 'preference', 'friction', 'revert', 'contradiction', 'repeated_manual_step', 'missed_trigger', 'false_trigger']).has(observation.class)) return null
  const repository = policy.targets.includes(observation.repo) ? observation.repo : null
  const type = observation.knowledge_type || ({ ruling: 'requirement', correction: 'requirement', preference: 'preference', successful_pattern: 'procedure' }[observation.class] || 'hypothesis')
  const statement = redact(observation.quote).replace(/\s+/g, ' ').trim().slice(0, 800)
  if (statement.length < 12) return null
  const context = observation.episode || {}
  return validateKnowledge({
    id: `evidence.${digest(`${observation.episode_id || observation.ruling_key || observation.id}\0${observation.class}\0${repository || 'unknown'}`).slice(0, 20)}`,
    version: 1,
    type,
    status: ['experiment', 'fact', 'hypothesis'].includes(type) ? 'observed' : 'candidate',
    scope: repository ? { kind: 'repository', repository } : { kind: 'unknown' },
    statement,
    conditions: (context.conditions || []).map((s) => redact(s)).slice(0, 8),
    uncertainties: [...(context.uncertainties || []), 'Evidence does not establish an accepted requirement or a causal conclusion.'].slice(0, 8),
    evidence_ids: [observation.id],
    episode_id: observation.episode_id || null,
    ...(observation.episode_id ? { episode: context } : {}),
    source_revision: observation.source_revision || null,
    supersedes: [], contradicts: [], refines: [],
  }, policy)
}

export function consolidateKnowledge({ root = ROOT, rows = loadLedger(root), write = false } = {}) {
  const policy = policyAt(root)
  const history = knowledgeHistory(root, policy)
  const seen = new Set(history.map((r) => r.id))
  const fresh = []
  for (const row of rows) {
    const r = observationKnowledge(row, policy)
    if (!r || seen.has(r.id)) continue
    seen.add(r.id); fresh.push(r)
  }
  if (write && fresh.length) {
    mkdirSync(dirname(join(root, KNOWLEDGE)), { recursive: true })
    appendFileSync(join(root, KNOWLEDGE), fresh.map((r) => JSON.stringify(r)).join('\n') + '\n')
  }
  return { fresh, total: history.length + fresh.length, unknown_scope: [...history, ...fresh].filter((r) => r.scope.kind === 'unknown').length }
}

/** A narrow revision is a delta. Only a verified owner decision can supersede named requirements. */
export function accumulateBrief(prior, revision) {
  const decisions = new Map((prior.decisions || []).map((d) => [d.id, { ...d }]))
  const conflicts = [...(prior.conflicts || [])]
  for (const change of revision.changes || []) {
    if (change.supersedes?.length && change.actor !== 'Krish') throw new Error('supersession_requires_owner')
    for (const id of change.supersedes || []) {
      if (!decisions.has(id)) throw new Error('supersession_target_unknown')
      decisions.set(id, { ...decisions.get(id), status: 'superseded', superseded_by: change.id })
    }
    if (decisions.has(change.id) && seal(decisions.get(change.id)) !== seal(change)) throw new Error('decision_id_conflict')
    decisions.set(change.id, { ...change, status: change.status || 'proposed' })
    for (const id of change.contradicts || []) if (decisions.get(id)?.status !== 'superseded') conflicts.push([change.id, id])
  }
  return { ...prior, latest_request: revision.request, decisions: [...decisions.values()], conflicts, trade_offs: revision.trade_offs || [] }
}

export function profiles(root = ROOT) {
  const dir = join(root, 'brain/repositories')
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => readJson(join(dir, f))) : []
}

const main = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (main) {
  const args = process.argv.slice(2)
  const flag = (f) => args[args.indexOf(f) + 1]
  if (args.includes('--consolidate')) {
    const r = consolidateKnowledge({ write: args.includes('--write') })
    console.log(JSON.stringify({ added: r.fresh.length, total: r.total, unknown_scope: r.unknown_scope }))
  } else if (args.includes('--repo')) {
    const repo = flag('--repo')
    const profile = profiles().find((p) => p.repository === repo)
    if (!profile) throw new Error('repository_not_admitted')
    const view = effectiveKnowledge(knowledgeHistory(), { repository: repo, workflow: args.includes('--workflow') ? flag('--workflow') : null, families: profile.families || [] }, policyAt())
    console.log(JSON.stringify({ repository: repo, ...view }, null, 2))
  } else console.log('Use --consolidate [--write], or --repo <name> [--workflow <stage>].')
}
