#!/usr/bin/env node
/** Deterministic repository administration views. Only declared regions/files can change. */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve, posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import { policyAt, profiles, knowledgeHistory, effectiveKnowledge, seal, ROOT } from './repository-brain.mjs'
import { digest } from './lib/learning-episode.mjs'
import { leaks } from './lib/redact.mjs'

export const ADMIN = 'krish-repo-admin'
export const CONTEXT = 'krish-repo-context'
export const TARGET_CHECK = '.github/workflows/harness-repository-context.yml'
export const targetCheck = () => readFileSync(join(ROOT, 'contract/templates/repository-context-workflow.yml'), 'utf8')
export const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length
const safePath = (s) => typeof s === 'string' && /^(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+$/.test(s) && !s.split('/').includes('..') && !s.startsWith('.')
const sourcePath = (s) => safePath(s) || /^\.(?:agents|claude|github)\/(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+$/.test(s) && !s.split('/').includes('..')

export function validateProfile(p, policy = policyAt()) {
  if (p.schema_version !== 1 || !policy.targets.includes(p.repository) || policy.excluded.includes(p.repository) || p.enabled !== true) throw new Error('repository_not_admitted')
  if (p.entrypoints.agents !== 'AGENTS.md' || p.entrypoints.claude !== 'CLAUDE.md' || p.context_path !== 'docs/HARNESS_CONTEXT.md') throw new Error('profile_target_not_allowed')
  if (!Array.isArray(p.sources) || !p.sources.length || p.sources.length > 25) throw new Error('invalid_profile_sources')
  if (!Array.isArray(p.families) || p.families.some((f) => !policy.families.includes(f))) throw new Error('invalid_profile_family')
  if ((p.bootstrap_notes || []).some((s) => typeof s !== 'string' || s.length > 800 || leaks(s) || /[<>\n\r]/.test(s))) throw new Error('invalid_bootstrap_note')
  for (const s of p.sources) if (!sourcePath(s.path) || !/^[a-z][a-z0-9-]*$/.test(s.role) || typeof s.label !== 'string' || leaks(s.label) || /[<>\n\r]/.test(s.label)) throw new Error('invalid_profile_source')
  for (const w of p.workflows || []) {
    if (!/^[a-z][a-z0-9-]*$/.test(w.id) || !Array.isArray(w.read) || w.read.some((f) => !p.sources.some((s) => s.path === f))) throw new Error('invalid_profile_workflow')
    if (!Array.isArray(w.checks) || w.checks.some((c) => typeof c !== 'string' || /[\n\r`<>]/.test(c) || leaks(c))) throw new Error('invalid_profile_check')
  }
  if (!Number.isSafeInteger(p.bootstrap_limit_chars) || p.bootstrap_limit_chars < 1) throw new Error('missing_bootstrap_baseline')
  return p
}

export function inspectRegion(text, kind = ADMIN) {
  const starts = [...String(text).matchAll(new RegExp(`<!-- ${kind}:start brain=([a-f0-9]{12}) sha=([a-f0-9]{12}) -->`, 'g'))]
  const ends = [...String(text).matchAll(new RegExp(`<!-- ${kind}:end -->`, 'g'))]
  const mentions = String(text).includes(`<!-- ${kind}:`)
  if (!starts.length && !ends.length && !mentions) return { present: false }
  if (starts.length !== 1 || ends.length !== 1 || ends[0].index <= starts[0].index) throw new Error('malformed_managed_region')
  const start = starts[0].index, end = ends[0].index + ends[0][0].length
  const body = String(text).slice(start + starts[0][0].length, ends[0].index).replace(/^\r?\n|\r?\n$/g, '')
  return { present: true, start, end, body, brain: starts[0][1], sha: starts[0][2], intact: digest(body).slice(0, 12) === starts[0][2] }
}

export function region(body, revision, kind = ADMIN) {
  return `<!-- ${kind}:start brain=${revision} sha=${digest(body).slice(0, 12)} -->\n${body}\n<!-- ${kind}:end -->`
}

export function spliceRegion(text, block, kind = ADMIN) {
  const found = inspectRegion(text, kind)
  if (found.present && !found.intact) throw new Error('managed_region_human_drift')
  if (found.present) return text.slice(0, found.start) + block + text.slice(found.end)
  return text + (text.endsWith('\n\n') ? '' : text.endsWith('\n') ? '\n' : '\n\n') + block + '\n'
}

export function bootstrapMeasure(read) {
  const seen = new Set(), active = new Set(), missing = new Set()
  let total = 0
  const visit = (path, nativeImport = false) => {
    if (active.has(path)) { if (nativeImport) throw new Error('instruction_import_cycle'); return }
    if (seen.has(path)) return
    const text = read(path)
    if (text == null) { missing.add(path); return }
    seen.add(path); active.add(path); total += text.length
    for (const paragraph of text.split(/\n\s*\n/)) {
      const line = paragraph.replace(/\n/g, ' ')
      const native = [...line.matchAll(/(?:^|\s)@([A-Za-z0-9_.\/-]+\.md)\b/g)].map((m) => m[1])
      const mandatory = /^\s*(?:[-*]\s*)?(?:\*\*)?(?:read\b.*\bfirst\b|start every session\b|before doing anything\b)|\bmust then read\b|^\s*(?:\*\*)?read\b.*\bthen\b/i.test(line) ? [...line.matchAll(/`([A-Za-z0-9_.\/-]+\.md)`/g)].map((m) => m[1]) : []
      const relative = (next) => read(next) != null ? next : posix.normalize(posix.join(posix.dirname(path), next))
      for (const next of native) if (sourcePath(next)) visit(relative(next), true)
      for (const next of mandatory) if (sourcePath(next)) visit(relative(next))
    }
    active.delete(path)
  }
  for (const path of ['AGENTS.md', 'CLAUDE.md']) if (read(path) != null) visit(path)
  return { chars: total, files: [...seen].sort(), missing: [...missing].sort() }
}

export function renderAdministration(profile, history, policy = policyAt()) {
  validateProfile(profile, policy)
  const view = effectiveKnowledge(history, { repository: profile.repository, families: profile.families || [] }, policy)
  const views = [view, ...(profile.workflows || []).map((w) => effectiveKnowledge(history, { repository: profile.repository, workflow: w.id, families: profile.families || [] }, policy))]
  if (views.some(v=>v.conflicts.length)) throw new Error('unresolved_accepted_knowledge_conflict')
  const applicable = [...new Map(views.flatMap((v) => v.accepted).map((r) => [r.id, r])).values()]
  const semantic = { repository: profile.repository, families: profile.families, sources: profile.sources, workflows: profile.workflows, bootstrap_notes: profile.bootstrap_notes || [], accepted: applicable }
  const revision = seal(semantic).slice(0, 12)
  const body = [
    '## Administer this repository', '',
    `Use \`${profile.context_path}\` for the owning workflow, source of truth and checks. Preserve the goal and accepted decisions when a revision changes one part; explain material trade-offs. Verify the downstream result. Record corrections and observed outcomes through the existing capture path. Experimental results retain their conditions; inferred requirements remain proposals.`,
    ...(profile.bootstrap_notes || []).map((s) => `\n${s}`),
  ].join('\n')
  if (words(body) > policy.managed_words) throw new Error('administration_context_over_budget')
  const out = [
    `# ${profile.repository}: operating context`, '',
    'Generated from the central ai-harness brain. This is a route inventory, not a certification of current architecture. Read the section for the work at hand; repository-owned sources establish current facts. The nightly publisher rechecks source paths and named commands. This file grants no product action or spending authority.', '',
    '## Sources and system boundaries', '',
    ...profile.sources.map((s) => `- ${s.label} (${s.role}): \`${s.path}\`.`), '',
    '## Workflows', '',
    ...(profile.workflows || []).flatMap((w) => [`### ${w.id}: ${w.label}`, '', `Read: ${w.read.map((p) => `\`${p}\``).join(', ')}.`, `Checks: ${w.checks.length ? w.checks.map((c) => `\`${c}\``).join('; ') : 'use the owning repository source; no command is inferred'}.`, 'Run only within existing authority. Check inputs, the owning stage, and the downstream artifact actually consumed.', '']),
    '## Accepted operating knowledge', '',
    ...applicable.filter((r) => r.type !== 'experiment').map((r) => `- ${r.statement}${r.conditions.length ? ' Applies when: ' + r.conditions.join('; ') + '.' : ''}${r.uncertainties.length ? ' Uncertainty: ' + r.uncertainties.join('; ') + '.' : ''} [${r.id}@${r.version}; ${r.scope.kind}${r.scope.workflow ? ':' + r.scope.workflow : ''}]`), '',
    '## Learning and decisions', '',
    'Keep an accumulated working brief: goal, accepted decisions, requested delta, conditions, unresolved questions and observed outcome. A narrow revision preserves other decisions. Distinguish an explicit owner instruction from an interpretation, and a failed experiment from an operational defect. Read native feedback/experiment records for the specific task; a result for another audience or stage is not a prohibition here.', '',
    'The brain retains evidence and proposals separately. Newly observed evidence never approves itself. When a failure repeats, diagnose missing knowledge, interpretation, retrieval, stale instructions, ignored guidance or the owning code before adding another rule.', '',
    `Acceptance: ${policy.approval}. Effective knowledge IDs and their acceptance references are in ai-harness \`${KNOWLEDGE_PATH}\`. Source inventory revision: \`${profile.source_revision}\`.`,
  ].join('\n')
  if (words(out) > policy.context_words) throw new Error('repository_reference_over_budget')
  return { revision, block: region(body, revision), context: region(out, revision, CONTEXT) + '\n', accepted_ids: applicable.map((r) => r.id) }
}
const KNOWLEDGE_PATH = 'brain/knowledge.jsonl'

export function planAdministration(profile, files, history, { policy = policyAt(), migration = null } = {}) {
  validateProfile(profile, policy)
  const read = (p) => files[p] ?? null
  const before = bootstrapMeasure(read)
  for (const source of profile.sources) if (read(source.path) == null) throw new Error(`source_missing:${source.path}`)
  if (read('package.json')) {
    const pkg=JSON.parse(read('package.json'))
    for(const workflow of profile.workflows||[])for(const command of workflow.checks){
      const match=command.match(/^npm (?:run ([a-zA-Z0-9:_-]+)|(?:test)(?=\s|$))/)
      if(match&&!pkg.scripts?.[match[1]||'test'])throw new Error(`profile_command_missing:${match[1]||'test'}`)
    }
  }
  const rendered = renderAdministration(profile, history, policy)
  const changes = {}
  let agents = read('AGENTS.md')
  if (agents == null) throw new Error('repository_entry_missing')
  if (migration) {
    if (migration.acceptance !== policy.approval) throw new Error('migration_not_approved')
    for (const [path, change] of Object.entries(migration.files)) {
      if (!['AGENTS.md', 'CLAUDE.md'].includes(path) || digest(read(path) || '') !== change.before_sha256) throw new Error('migration_source_moved')
      if (change.edits) {
        let text = read(path), end = text.length
        for (const edit of [...change.edits].sort((a, b) => b.start - a.start)) {
          if (!Number.isSafeInteger(edit.start) || !Number.isSafeInteger(edit.end) || edit.start < 0 || edit.end > end || edit.start > edit.end) throw new Error('invalid_migration_range')
          text = text.slice(0, edit.start) + edit.replacement + text.slice(edit.end); end = edit.start
        }
        changes[path] = text
      } else changes[path] = change.prefix_end == null ? change.after : change.after_prefix + read(path).slice(change.prefix_end)
    }
    agents = changes['AGENTS.md'] ?? agents
  }
  changes['AGENTS.md'] = spliceRegion(agents, rendered.block)
  if (read('CLAUDE.md') == null && !changes['CLAUDE.md']) changes['CLAUDE.md'] = '@AGENTS.md\n'
  const previousContext = read(profile.context_path)
  if (previousContext != null) {
    const found = inspectRegion(previousContext, CONTEXT)
    if (!found.present || !found.intact || previousContext.slice(0, found.start).trim() || previousContext.slice(found.end).trim()) throw new Error('repository_context_human_drift')
  }
  changes[profile.context_path] = rendered.context
  if (read(TARGET_CHECK) == null) changes[TARGET_CHECK] = targetCheck()
  else if (read(TARGET_CHECK) !== targetCheck()) throw new Error('repository_context_check_drift')
  const afterFiles = { ...files, ...changes }
  const after = bootstrapMeasure((p) => afterFiles[p] ?? null)
  if (after.missing.length) throw new Error(`bootstrap_source_missing:${after.missing[0]}`)
  if (after.chars > profile.bootstrap_limit_chars && after.chars > before.chars) throw new Error(`bootstrap_context_growth:${after.chars - Math.max(profile.bootstrap_limit_chars, before.chars)}`)
  for (const key of Object.keys(changes)) if (changes[key] === read(key)) delete changes[key]
  if (Object.keys(changes).length > policy.max_files) throw new Error('too_many_administration_files')
  return { repository: profile.repository, ...rendered, changes, before, after, input_seal: seal(files), managed_before: Object.fromEntries(Object.keys(changes).map((p) => [p, digest(read(p) || '')])) }
}

/** Restore an earlier managed view, preserving intervening human text or refusing an ambiguous migration. */
export function rollbackFile(prior, delivered, current, kind = ADMIN) {
  if (current === delivered) return prior
  if (prior == null) throw new Error('rollback_new_file_has_human_changes')
  const before = inspectRegion(prior, kind), was = inspectRegion(delivered, kind), now = inspectRegion(current, kind)
  if (!was.present || !now.present || !now.intact || now.sha !== was.sha) throw new Error('rollback_target_drift')
  if (before.present) return current.slice(0, now.start) + prior.slice(before.start, before.end) + current.slice(now.end)
  const without = (text, r) => text.slice(0, r.start).replace(/\n\n$/, '\n') + text.slice(r.end).replace(/^\n/, '')
  const deliveredOutside = without(delivered, was), currentOutside = without(current, now)
  if (deliveredOutside === prior) return currentOutside
  // Initial migration can change the header while a later canon sync changes its own region.
  const marker = '<!-- krish-canon:start'
  const a = prior.indexOf(marker), b = deliveredOutside.indexOf(marker), c = currentOutside.indexOf(marker)
  if (a >= 0 && b >= 0 && c >= 0 && deliveredOutside.slice(0, b) === currentOutside.slice(0, c)) return prior.slice(0, a) + currentOutside.slice(c)
  throw new Error('rollback_migration_needs_reconciliation')
}

const main = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (main) {
  const args = process.argv.slice(2), flag = (f) => args[args.indexOf(f) + 1]
  const repository = flag('--repo'), dir = resolve(flag('--checkout') || '.')
  const profile = profiles().find((p) => p.repository.toLowerCase() === String(repository).toLowerCase())
  if (!profile) throw new Error('repository_not_admitted')
  const paths = [...new Set(['AGENTS.md', 'CLAUDE.md', TARGET_CHECK, profile.context_path, ...profile.sources.map((s) => s.path)])]
  const files = Object.fromEntries(paths.map((p) => [p, existsSync(join(dir, p)) ? readFileSync(join(dir, p), 'utf8') : null]))
  const migrationPath = join(ROOT, 'state/repository-administration/migrations', `${profile.repository}.json`)
  const migration = !inspectRegion(files['AGENTS.md'] || '').present && existsSync(migrationPath) ? JSON.parse(readFileSync(migrationPath, 'utf8')) : null
  const plan = planAdministration(profile, files, knowledgeHistory(), { migration })
  if (args.includes('--write')) for (const [path, text] of Object.entries(plan.changes)) { mkdirSync(dirname(join(dir, path)), { recursive: true }); writeFileSync(join(dir, path), text) }
  console.log(JSON.stringify({ repository: plan.repository, revision: plan.revision, files: Object.keys(plan.changes), bootstrap_before: plan.before.chars, bootstrap_after: plan.after.chars, mode: args.includes('--write') ? 'local-write' : 'plan' }))
}
