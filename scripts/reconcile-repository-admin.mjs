#!/usr/bin/env node
/** GitHub-only publication of deterministic views. No model holds this writer's credential. */
import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Gh } from './lib/github.mjs'
import { parseYaml } from './lib/yaml.mjs'
import { policyAt, profiles, knowledgeHistory, ROOT, seal } from './repository-brain.mjs'
import { planAdministration, inspectRegion, rollbackFile, CONTEXT, TARGET_CHECK, renderAdministration } from './repository-admin.mjs'

export const BRANCH = 'harness/repository-administration'
export function checksPassed(checks) {
  const runs = checks.runs || [], statuses = Object.values(checks.statuses || {})
  return runs.some((r) => r.status === 'completed' && r.conclusion === 'success') && runs.every((r) => r.status === 'completed' && ['success', 'skipped', 'neutral'].includes(r.conclusion)) && statuses.every((s) => s === 'success')
}

export async function rollbackRepository({ receipt, gh, profile, write = false }) {
  const policy = policyAt()
  if (!policy.targets.includes(receipt.repository) || receipt.repository !== profile.repository || !receipt.merge || !receipt.rollback?.base) throw new Error('rollback_not_authorized')
  const repo = receipt.repository, { branch } = await gh.defaultBranch(repo), head = await gh.headSha(repo, branch)
  const changes = {}
  for (const path of receipt.rollback.files) {
    if (!['AGENTS.md', 'CLAUDE.md', profile.context_path, TARGET_CHECK].includes(path)) throw new Error('rollback_path_not_owned')
    const prior = (await gh.getFile(repo, path, receipt.rollback.base))?.text ?? null
    const delivered = (await gh.getFile(repo, path, receipt.merge))?.text ?? null
    const current = (await gh.getFile(repo, path, head))?.text ?? null
    changes[path] = rollbackFile(prior, delivered, current, path === profile.context_path ? CONTEXT : undefined)
  }
  if (!write) return { repository: repo, status: 'rollback-planned', files: Object.keys(changes) }
  const rollbackBranch = `harness/admin-rollback-${receipt.merge.slice(0, 12)}`
  if (await gh.branchExists(repo, rollbackBranch)) throw new Error('rollback_branch_requires_readback')
  await gh.createBranch(repo, rollbackBranch, head)
  const commit = await gh.commitFiles(repo, rollbackBranch, head, changes, `docs(harness): restore prior administration view\n\nRollback of ${receipt.merge}; only the approved managed delta is restored.`)
  const pr = await gh.openPull(repo, { title: 'Restore the prior repository administration view', head: rollbackBranch, base: branch, body: `Exact managed rollback of \`${receipt.merge}\` to the prior content at \`${receipt.rollback.base}\`. Intervening human content was preserved or the planner refused the change.` })
  return { repository: repo, status: 'rollback-pull-request', head: commit.sha, pr: pr.number }
}

export async function reconcileRepository({ profile, gh, policy = policyAt(), history = knowledgeHistory(), migration = null, write = false, merge = false }) {
  // Check admission before any request, including reads.
  if (!policy.targets.includes(profile.repository) || policy.excluded.includes(profile.repository) || profile.enabled !== true) return { repository: profile.repository, status: 'excluded' }
  const repo = profile.repository, { branch } = await gh.defaultBranch(repo)
  const base = await gh.headSha(repo, branch)
  const paths = [...new Set(['AGENTS.md', 'CLAUDE.md', TARGET_CHECK, profile.context_path, ...profile.sources.map((s) => s.path)])]
  const files = {}
  for (const path of paths) files[path] = (await gh.getFile(repo, path, base))?.text ?? null
  const initial = !inspectRegion(files['AGENTS.md'] || '').present
  const plan = planAdministration(profile, files, history, { policy, migration: initial ? migration : null })
  const proof = { repository: repo, base, brain_revision: plan.revision, before: plan.before.chars, after: plan.after.chars, files: Object.keys(plan.changes), source_seal: plan.input_seal, source_check: 'current-source-paths-hashes-and-named-commands', accepted_ids: plan.accepted_ids }
  if (!Object.keys(plan.changes).length) return { ...proof, status: 'current' }
  if (!write) return { ...proof, status: 'planned' }
  if (await gh.headSha(repo, branch) !== base) throw new Error('source_base_moved')
  // A new rendered view gets a fresh branch; squash merges need not retain ancestry with an old branch.
  const publicationBranch = `${BRANCH}-${seal({ block: plan.block, context: plan.context }).slice(0, 12)}`
  let pr = await gh.findPull(repo, publicationBranch, branch)
  if(!pr)pr=await gh.findPull(repo,BRANCH,branch) // adopt the already checked initial rollout PRs
  if (pr) {
    const prFiles = await gh.req('GET', `/repos/${gh.owner}/${repo}/pulls/${pr.number}/files?per_page=100`)
    if (prFiles.length !== Object.keys(plan.changes).length || prFiles.some((f) => !(f.filename in plan.changes))) throw new Error('administration_pr_has_unowned_changes')
    // A changed source or a human branch edit needs reconciliation, not a blind regeneration.
    for (const [path, expected] of Object.entries(plan.changes)) if ((await gh.getFile(repo, path, pr.head.sha))?.text !== expected) throw new Error('administration_pr_or_source_moved')
  } else {
    let head
    if (await gh.branchExists(repo, publicationBranch)) {
      head = await gh.headSha(repo, publicationBranch)
      // A prior merge may leave the branch. Use a fresh commit from current main, never force-reset it.
      const compare = await gh.req('GET', `/repos/${gh.owner}/${repo}/compare/${head}...${base}`)
      if (!['ahead', 'identical'].includes(compare.status)) throw new Error('administration_branch_has_unknown_drift')
      if (head !== base) await gh.req('PATCH', `/repos/${gh.owner}/${repo}/git/refs/heads/${encodeURIComponent(publicationBranch)}`, { sha: base, force: false })
    } else await gh.createBranch(repo, publicationBranch, base)
    const candidate = await gh.commitFiles(repo, publicationBranch, base, plan.changes, `docs(harness): maintain repository administration\n\nApproved plan: ${policy.approval}.\nBrain-View: ${plan.revision}\nSource-Base: ${base}\nInput-Seal: ${plan.input_seal}\nOnly declared administration regions and approved initial migrations changed.`)
    pr = await gh.openPull(repo, { title: 'Maintain the repository operating guide from the brain', head: publicationBranch, base: branch, body: `Generated from accepted knowledge under approved plan \`${policy.approval}\`.\n\nWhole-system sources, workflows and checks stay repository-specific. Evidence and inferred preferences cannot promote themselves.\n\n- Brain view: \`${plan.revision}\`\n- Source base: \`${base}\`\n- Bootstrap: ${plan.before.chars} -> ${plan.after.chars} characters\n- Changed files: ${Object.keys(plan.changes).map((p) => `\`${p}\``).join(', ')}\n- Input seal: \`${plan.input_seal}\`\n\nRollback restores only the managed content against this base; evidence remains append-only.` })
    pr = { ...pr, head: { sha: candidate.sha } }
  }
  const result = { ...proof, status: 'pull-request', pr: pr.number, head: pr.head.sha }
  if (!merge) return result
  if (!checksPassed(await gh.checksFor(repo, pr.head.sha))) return { ...result, status: 'awaiting-checks' }
  const latest = await gh.req('GET', `/repos/${gh.owner}/${repo}/pulls/${pr.number}`)
  if (latest.head.sha !== pr.head.sha || latest.base.ref !== branch || await gh.headSha(repo, branch) !== base) throw new Error('administration_merge_base_moved')
  const merged = await gh.req('PUT', `/repos/${gh.owner}/${repo}/pulls/${pr.number}/merge`, { sha: pr.head.sha, merge_method: 'squash', commit_title: `docs(harness): maintain repository administration (#${pr.number})` })
  if (merged.merged !== true) throw new Error('administration_merge_not_confirmed')
  for (const [path, expected] of Object.entries(plan.changes)) if ((await gh.getFile(repo, path, merged.sha))?.text !== expected) throw new Error('administration_target_readback_failed')
  return { ...result, status: 'verified', merge: merged.sha, rollback: { base, managed_before: plan.managed_before, files: Object.keys(plan.changes) } }
}

export async function reconcileFleet({ gh, root = ROOT, write = false, merge = false, only = null } = {}) {
  const policy = policyAt(root), history = knowledgeHistory(root), targets = profiles(root)
  const fleet = parseYaml(readFileSync(join(root, 'state/fleet.yaml'), 'utf8'))
  const results = []
  const previousPath = join(root, 'state/repository-administration/latest.json')
  const previous = existsSync(previousPath) ? JSON.parse(readFileSync(previousPath, 'utf8')) : null
  let pilotsReady = !only || policy.pilots.some((p) => p.toLowerCase() === only.toLowerCase()) || policy.pilots.every((name) => previous?.results?.some((r) => r.repository === name && ['current', 'verified'].includes(r.status) && r.brain_revision === renderAdministration(targets.find((p) => p.repository === name), history, policy).revision))
  for (const name of [...policy.pilots, ...policy.targets.filter((n) => !policy.pilots.includes(n))]) {
    if (only && name.toLowerCase() !== only.toLowerCase()) continue
    const profile = targets.find((p) => p.repository === name)
    if (!profile || fleet.repos.find((r) => r.name === name)?.canon_sync === false || policy.excluded.includes(name)) { results.push({ repository: name, status: 'excluded' }); continue }
    if (!policy.pilots.includes(name) && !pilotsReady) { results.push({ repository: name, status: 'awaiting-pilots' }); continue }
    const path = join(root, 'state/repository-administration/migrations', `${name}.json`)
    try {
      const row = await reconcileRepository({ profile, gh, policy, history, migration: existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null, write, merge })
      results.push(row)
      if (policy.pilots.includes(name) && !['current', 'verified'].includes(row.status)) pilotsReady = false
    } catch (error) {
      results.push({ repository: name, status: 'blocked', reason: error.status ? `github-${error.status}` : String(error.message).replace(/[^a-zA-Z0-9_:.-]/g, '-').slice(0, 160) })
      if (policy.pilots.includes(name)) pilotsReady = false
    }
  }
  return { schema_version: 1, generated_at: new Date().toISOString(), approval: policy.approval, results }
}

const main = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (main) {
  const args = process.argv.slice(2), flag = (f) => args[args.indexOf(f) + 1]
  const gh = new Gh(process.env.FLEET_TOKEN)
  if (args.includes('--rollback')) {
    const receipt=JSON.parse(readFileSync(flag('--rollback'),'utf8'))
    const profile=profiles().find(p=>p.repository===receipt.repository)
    if(!profile)throw new Error('rollback_not_authorized')
    console.log(JSON.stringify(await rollbackRepository({receipt,profile,gh,write:args.includes('--write')}),null,2))
    process.exit(0)
  }
  const report = await reconcileFleet({ gh, write: args.includes('--write'), merge: args.includes('--merge'), only: args.includes('--repo') ? flag('--repo') : null })
  if (args.includes('--write')) {
    const path=join(ROOT,'state/repository-administration/deployments.jsonl')
    const seen=new Set(existsSync(path)?readFileSync(path,'utf8').split('\n').filter(Boolean).map(s=>JSON.parse(s).id):[])
    for(const row of report.results.filter(r=>r.status==='verified')) {
      const id=`${row.repository}:${row.merge}`
      if(!seen.has(id)){mkdirSync(dirname(path),{recursive:true});appendFileSync(path,JSON.stringify({id,at:report.generated_at,...row})+'\n');seen.add(id)}
    }
  }
  const output = args.includes('--out') ? flag('--out') : null
  if (output) { mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, JSON.stringify(report, null, 2) + '\n') }
  console.log(JSON.stringify(report, null, 2))
  if (report.results.some((r) => r.status === 'blocked')) process.exitCode = 1
}
