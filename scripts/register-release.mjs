#!/usr/bin/env node
/**
 * Register a published harness release, and later its installs, without a
 * person in the loop.
 *
 * Krish ruled on 2026-10-15 that merging a change to main approves the release
 * built from it, and that releases are cut and installed automatically. Until
 * then every release was registered by hand ("release: register vX"), and the
 * PC's installer refuses any release whose registry entry lacks approved_by, so
 * an automatic release that nobody registered would have blocked every PC run.
 *
 * Two modes, both deterministic text edits of state/skill-registry.yaml that
 * leave everything else in the file byte-for-byte alone:
 *
 *   register   rotate the three release blocks (latest approved, previous
 *              published, superseded), record the new release with its
 *              manifest hash, a skills-tree aggregate recomputed from the git
 *              objects at its source commit, and the skills that changed, and
 *              mark every surface not on it as awaiting, which is what
 *              scripts/validate-release-coherence.mjs requires.
 *   reconcile  after a PC install's evidence is merged, move each awaiting
 *              surface whose state/deployments record shows a verified install
 *              onto the release.
 *
 *   node scripts/register-release.mjs --manifest <release-vX.json> --published-at <iso>
 *        [--previous-manifest <json>] [--registry <path>] [--today <yyyy-mm-dd>] [--dry-run]
 *   node scripts/register-release.mjs --reconcile-deployments [--registry <path>] [--dry-run]
 *
 * Run scripts/render-current-state.mjs afterwards so CURRENT.md agrees.
 */

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const ALGORITHM = 'sha256-path-nul-file-sha256-ordinal-v1'
const NUL = String.fromCharCode(0)
const CLOUD_UPLOAD = new Set(['claude-cloud', 'claude-secondary-cloud', 'perplexity-cloud'])
const FOLLOWS_MAIN = new Set(['codex-cloud'])

/**
 * The repository's skills-tree aggregate (see scripts/reconcile-surface.mjs for
 * why every detail matters), computed from the committed objects at `commit`
 * so it never depends on a working tree.
 */
export function skillsAggregate(commit, { root = HARNESS, run = execFileSync } = {}) {
  const git = (args, input) => run('git', args, { cwd: root, input, maxBuffer: 1 << 28 })
  const names = String(git(['ls-tree', '-r', '--name-only', commit, '--', 'skills/'])).split('\n').filter(Boolean)
  const lines = []
  for (const name of names) {
    const bytes = git(['cat-file', 'blob', `${commit}:${name}`])
    const digest = createHash('sha256').update(bytes).digest('hex').toUpperCase()
    lines.push(`${name.slice('skills/'.length)}${NUL}${digest}`)
  }
  lines.sort()
  return { aggregate: createHash('sha256').update(Buffer.from(lines.join('\n'), 'utf8')).digest('hex').toUpperCase(), files: names.length }
}

/** Skills whose source bytes differ from the previous release, plus new ones. */
export function changedSkills(manifest, previous) {
  const before = new Map((previous?.skills || []).map((s) => [s.name, s.source_skill_sha256]))
  return (manifest.skills || []).filter((s) => before.get(s.name) !== s.source_skill_sha256).map((s) => s.name).sort()
}

/** [start, end) line indexes of a top-level block `key:`, or null. */
function blockRange(lines, key) {
  const start = lines.findIndex((l) => l === `${key}:` || l.startsWith(`${key}: `) || l.startsWith(`${key}:\t`))
  if (start === -1) return null
  let end = start + 1
  while (end < lines.length && (lines[end] === '' || /^\s/.test(lines[end]) || lines[end].startsWith('#'))) end++
  // Trailing blank lines belong to the gap, not the block.
  while (end > start + 1 && lines[end - 1] === '') end--
  return [start, end]
}

export function getBlock(text, key) {
  const lines = text.split('\n')
  const r = blockRange(lines, key)
  return r ? lines.slice(r[0], r[1]).join('\n') : null
}

export function replaceBlock(text, key, block) {
  const lines = text.split('\n')
  const r = blockRange(lines, key)
  if (!r) throw new Error(`state/skill-registry.yaml has no top-level ${key} block`)
  return [...lines.slice(0, r[0]), ...block.split('\n'), ...lines.slice(r[1])].join('\n')
}

/** A scalar field directly under a block (two-space indent). */
export function scalar(block, field) {
  const m = new RegExp(`^  ${field}:[ \\t]*(.*)$`, 'm').exec(block || '')
  return m ? m[1].trim() : null
}

const folded = (text) => {
  const words = text.split(/\s+/)
  const out = []
  let line = ''
  for (const w of words) {
    if ((line + ' ' + w).trim().length > 84) { out.push(`    ${line.trim()}`); line = w } else line += ` ${w}`
  }
  if (line.trim()) out.push(`    ${line.trim()}`)
  return out.join('\n')
}

/** The new registry text with `manifest` recorded as the latest approved release. */
export function registerRelease(text, { manifest, manifestSha, publishedAt, aggregate, changed, today }) {
  const id = manifest.release_id
  if (!/^v\d{4}\.\d{2}\.\d{2}\.\d+$/.test(id || '')) throw new Error(`invalid release id ${id}`)
  if (manifest.validation !== 'passed' || manifest.working_tree !== 'clean') throw new Error('the manifest does not record a passed validation from a clean tree')
  const latest = getBlock(text, 'latest_approved_release')
  const previous = getBlock(text, 'previous_published_release')
  const oldId = scalar(latest, 'release_id')
  if (oldId === id) throw new Error(`${id} is already the latest approved release`)
  const short = String(manifest.source_commit).slice(0, 12)
  const next = [
    'latest_approved_release:',
    `  release_id: ${id}`,
    `  tag: harness-${id}`,
    `  source_commit: ${manifest.source_commit}`,
    '  published: true',
    '  immutable: true',
    `  published_at: ${publishedAt}`,
    `  manifest_sha256: ${manifestSha}`,
    `  release_url: https://github.com/krishanraja/ai-harness/releases/tag/harness-${id}`,
    `  skills_tree_aggregate_sha256: ${aggregate}`,
    `  artifact_hash_algorithm: ${ALGORITHM}`,
    ...(changed.length ? ['  changed_skills:', ...changed.map((s) => `    - ${s}`)] : ['  changed_skills: []']),
    `  approved_at: ${today}`,
    '  approved_by: Krish Raja',
    '  approval_basis: >-',
    folded(`Standing ruling (Krish, 2026-10-15): merging a change to main approves the release built from it. Cut automatically from main at ${short} after validate-and-repeat-build passed; this record was written by scripts/register-release.mjs.`),
    '  supersedes_reason: >-',
    folded(`${oldId} remains the immutable immediate rollback target.`),
    '  hash_provenance: >-',
    folded(`manifest_sha256 is the SHA-256 of release-${id}.json downloaded from the release. skills_tree_aggregate_sha256 was recomputed from the committed git objects at source_commit by scripts/register-release.mjs with the ${ALGORITHM} record format.`),
  ].join('\n')
  const rollback = [
    'previous_published_release:',
    ...['release_id', 'tag', 'source_commit'].map((f) => `  ${f}: ${scalar(latest, f)}`),
    '  immutable: true',
    ...['published_at', 'manifest_sha256', 'skills_tree_aggregate_sha256'].map((f) => `  ${f}: ${scalar(latest, f)}`),
    '  status: immediate-immutable-rollback-baseline',
  ].join('\n')
  const superseded = [
    'superseded_approved_release:',
    ...['release_id', 'tag', 'source_commit'].map((f) => `  ${f}: ${scalar(previous, f)}`),
    '  immutable: true',
    ...['published_at', 'manifest_sha256', 'skills_tree_aggregate_sha256'].map((f) => `  ${f}: ${scalar(previous, f)}`),
    '  note: >-',
    folded(`Retained as the second immutable rollback target after ${oldId}.`),
  ].join('\n')
  let out = replaceBlock(text, 'superseded_approved_release', superseded)
  out = replaceBlock(out, 'previous_published_release', rollback)
  out = replaceBlock(out, 'latest_approved_release', next)
  return markAwaiting(out, id)
}

/** Every surface not on `id` gets a status that says what it is waiting for. */
export function markAwaiting(text, id) {
  return editSurfaces(text, (surface, fields) => {
    if (fields.release_id === id) return null
    if (CLOUD_UPLOAD.has(surface)) return { status: `stale-manual-cloud-upload-required-for-${id}` }
    if (FOLLOWS_MAIN.has(surface)) return { status: `awaiting-environment-refresh-for-${id}` }
    return { status: `awaiting-automatic-install-of-${id}` }
  })
}

/**
 * Rewrite fields of entries under surface_deployments. `fn(surface, fields)`
 * returns the scalar fields to set (or null), and may set `evidence` to an
 * array. Unlisted fields and comments are kept.
 */
function editSurfaces(text, fn) {
  const lines = text.split('\n')
  const r = blockRange(lines, 'surface_deployments')
  if (!r) throw new Error('state/skill-registry.yaml has no surface_deployments block')
  const body = lines.slice(r[0] + 1, r[1])
  const entries = []
  for (let i = 0; i < body.length; i++) if (/^  [A-Za-z0-9][\w.-]*:\s*$/.test(body[i])) entries.push(i)
  const rebuilt = []
  let cursor = 0
  for (let n = 0; n < entries.length; n++) {
    const start = entries[n]
    const end = n + 1 < entries.length ? entries[n + 1] : body.length
    rebuilt.push(...body.slice(cursor, start))
    const name = body[start].trim().replace(/:$/, '')
    let entry = body.slice(start, end)
    const fields = {}
    for (const l of entry) { const m = /^    ([a-z_]+):[ \t]*(.*)$/.exec(l); if (m) fields[m[1]] = m[2].trim() }
    const set = fn(name, fields)
    if (set) {
      for (const [k, v] of Object.entries(set)) {
        const at = entry.findIndex((l) => new RegExp(`^    ${k}:`).test(l))
        const replacement = Array.isArray(v) ? [`    ${k}:`, ...v.map((x) => `      - ${x}`)] : [`    ${k}: ${v}`]
        if (at === -1) { entry = [...entry, ...replacement]; continue }
        let stop = at + 1
        while (stop < entry.length && /^      /.test(entry[stop])) stop++
        entry = [...entry.slice(0, at), ...replacement, ...entry.slice(stop)]
      }
    }
    rebuilt.push(...entry)
    cursor = end
  }
  rebuilt.push(...body.slice(cursor))
  return [...lines.slice(0, r[0] + 1), ...rebuilt, ...lines.slice(r[1])].join('\n')
}

const VERIFIED = /installed-and-hash-verified|hash-verified/

// Which machine clock reports for which surface (Resolve-HostDefinition in
// scripts/Invoke-HarnessSync.ps1): LORIMER installs Claude Code, Codex and
// Cursor; SURFACE installs Codex only.
const HOST_CLOCK = { 'claude-code-user': 'harness-sync-lorimer', 'codex-current': 'harness-sync-lorimer', 'cursor-primary': 'harness-sync-lorimer', 'codex-surface-07a67cda9f99': 'harness-sync-surface' }

/**
 * Move awaiting surfaces onto the latest release. A committed install record
 * (state/deployments) is hash-verified evidence. Without one, a machine
 * heartbeat that reports `ok` for this release is honest but weaker evidence,
 * and the status says which it was.
 */
export function reconcileDeployments(text, { root = HARNESS, today = new Date().toISOString().slice(0, 10), aggregateFor = skillsAggregate } = {}) {
  const latest = getBlock(text, 'latest_approved_release')
  const id = scalar(latest, 'release_id')
  const commit = scalar(latest, 'source_commit')
  const hbPath = join(root, 'state/heartbeats.json')
  const heartbeats = existsSync(hbPath) ? JSON.parse(readFileSync(hbPath, 'utf8')) : {}
  const updated = []
  let tree = null
  const out = editSurfaces(text, (surface, fields) => {
    if (fields.status !== `awaiting-automatic-install-of-${id}`) return null
    const record = join(root, 'state/deployments', `${id}-${surface}.json`)
    if (!existsSync(record)) {
      const beat = heartbeats[HOST_CLOCK[surface]]
      if (!beat || beat.release !== id || beat.status !== 'ok') return null
      updated.push(surface)
      return {
        previous_release: fields.release_id,
        release_id: id,
        source_commit: commit,
        deployed_at: String(beat.last_run).slice(0, 10),
        evidence: ['state/heartbeats.json'],
        status: 'current-reported-by-machine-heartbeat-install-record-not-committed',
      }
    }
    const d = JSON.parse(readFileSync(record, 'utf8'))
    if (d.release_id !== id || !VERIFIED.test(String(d.result || ''))) return null
    tree = tree || aggregateFor(commit, { root })
    const count = Array.isArray(d.skills) ? d.skills.length : null
    const canary = join(root, 'state/canaries', `${id}-${surface}.json`)
    updated.push(surface)
    return {
      previous_release: fields.release_id,
      release_id: id,
      source_commit: commit,
      ...(count ? { installed_skill_count: count, per_skill_hashes_exact: count } : {}),
      installed_file_count: tree.files,
      installed_ordinal_aggregate_sha256: tree.aggregate,
      deployed_at: String(d.deployed_at_utc || today).slice(0, 10),
      deployed_at_utc: d.deployed_at_utc || today,
      evidence: [...(existsSync(canary) ? [`state/canaries/${id}-${surface}.json`] : []), `state/deployments/${id}-${surface}.json`],
      status: 'current-installed-hash-verified-automatic-install',
    }
  })
  return { text: out, updated }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const args = process.argv.slice(2)
  const flag = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1] }
  const registryPath = resolve(flag('--registry') || join(HARNESS, 'state/skill-registry.yaml'))
  const dryRun = args.includes('--dry-run')
  const text = readFileSync(registryPath, 'utf8')
  try {
    if (args.includes('--reconcile-deployments')) {
      const r = reconcileDeployments(text)
      if (!dryRun && r.updated.length) writeFileSync(registryPath, r.text)
      console.log(r.updated.length ? `Reconciled onto the latest release: ${r.updated.join(', ')}.` : 'No awaiting surface has a verified install record yet.')
    } else {
      const manifestPath = flag('--manifest')
      const publishedAt = flag('--published-at')
      if (!manifestPath || !publishedAt) throw new Error('--manifest and --published-at are required')
      const raw = readFileSync(manifestPath)
      const manifest = JSON.parse(raw.toString('utf8'))
      const previous = flag('--previous-manifest') ? JSON.parse(readFileSync(flag('--previous-manifest'), 'utf8')) : null
      const { aggregate } = skillsAggregate(manifest.source_commit)
      const out = registerRelease(text, {
        manifest,
        manifestSha: createHash('sha256').update(raw).digest('hex').toUpperCase(),
        publishedAt,
        aggregate,
        changed: previous ? changedSkills(manifest, previous) : (manifest.skills || []).map((s) => s.name).sort(),
        today: flag('--today') || new Date().toISOString().slice(0, 10),
      })
      if (!dryRun) writeFileSync(registryPath, out)
      console.log(`Registered ${manifest.release_id} (aggregate ${aggregate.slice(0, 12)}).`)
    }
  } catch (error) {
    console.error(`::error::${error.message}`)
    process.exit(1)
  }
}
