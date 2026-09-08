#!/usr/bin/env node
/**
 * Surface reconciliation, moved off the machine.
 *
 * This is the deterministic core of what the SURFACE Codex schedule did in its
 * steps 2 to 5: inventory an installed skill surface, hash it with the
 * repository's own algorithm, compare it against the canonical tree, and
 * classify every artifact. Doing it here rather than on the host means the
 * classification is reproducible, reviewable, and survives the machine being
 * switched off.
 *
 * The one thing it deliberately does NOT do is decide. Novel local content is
 * reported, never merged and never discarded, in the same spirit as the
 * reconciler's inbound-edit rule: unknown drift is a hard stop, not an
 * automatic backup-and-overwrite path.
 *
 * The hash is the repository's own `sha256-path-nul-file-sha256-ordinal-v1`:
 * for each record sorted by ordinal path comparison, concatenate the UTF-8
 * portable path, one NUL byte, and the raw 32 bytes of that file's SHA-256,
 * then SHA-256 the concatenation. Reimplemented here so a Linux job produces
 * the same aggregate a Windows host does, which is the whole point.
 *
 *   node scripts/reconcile-surface.mjs --snapshot <dir>   [--surface <id>] [--out <path>]
 *   node scripts/reconcile-surface.mjs --manifest <json>  [--surface <id>] [--out <path>]
 *
 * --snapshot   a directory holding the host's installed skills, one directory
 *              per skill, exactly as the host has them.
 * --manifest   a JSON object mapping portable relative path to sha256 hex, or
 *              a release manifest with a skills array.
 */

import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const args = process.argv.slice(2)
const flag = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1] }
const snapshotDir = flag('--snapshot')
const manifestPath = flag('--manifest')
const surfaceId = flag('--surface') || 'unnamed-surface'

if (!snapshotDir && !manifestPath) {
  console.error('reconcile-surface: give it --snapshot <dir> or --manifest <json>.')
  process.exit(2)
}

const registry = parseYaml(readFileSync(join(HARNESS, 'state/skill-registry.yaml'), 'utf8'))
const approved = registry?.latest_approved_release?.release_id || 'unknown'
const today = new Date().toISOString().slice(0, 10)

// Provider-managed directories are excluded from parity by contract rather than
// treated as drift. Recording them as exclusions is the honest answer; calling
// them extras would make every run look dirty.
const PROVIDER_MANAGED = [/(^|\/)\.system(\/|$)/, /(^|\/)plugins\/cache(\/|$)/, /(^|\/)\.git(\/|$)/, /(^|\/)node_modules(\/|$)/]
const isProviderManaged = (p) => PROVIDER_MANAGED.some((re) => re.test(p))

const portable = (p) => p.split(sep).join('/')
const sha256File = (abs) => createHash('sha256').update(readFileSync(abs)).digest()

function walk(root, base = root, out = []) {
  for (const e of readdirSync(root)) {
    const abs = join(root, e)
    const rel = portable(relative(base, abs))
    if (statSync(abs).isDirectory()) walk(abs, base, out)
    else out.push({ path: rel, abs })
  }
  return out
}

/** The repository's own aggregate, reimplemented so any host can be compared from anywhere. */
function aggregate(records) {
  const sorted = [...records].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
  const h = createHash('sha256')
  for (const r of sorted) {
    h.update(Buffer.from(r.path, 'utf8'))
    h.update(Buffer.from([0]))
    h.update(r.digest)
  }
  return h.digest('hex').toUpperCase()
}

// --------------------------------------------------------------- canonical
const skillsRoot = join(HARNESS, 'skills')
const canonical = new Map()
for (const rec of walk(skillsRoot)) {
  if (isProviderManaged(rec.path)) continue
  canonical.set(rec.path, sha256File(rec.abs))
}

// ------------------------------------------------------------------ surface
const surface = new Map()
const excluded = []
if (snapshotDir) {
  if (!existsSync(snapshotDir)) { console.error(`reconcile-surface: ${snapshotDir} does not exist.`); process.exit(2) }
  for (const rec of walk(snapshotDir)) {
    if (isProviderManaged(rec.path)) { excluded.push(rec.path); continue }
    surface.set(rec.path, sha256File(rec.abs))
  }
} else {
  const raw = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const entries = Array.isArray(raw.skills)
    ? raw.skills.map((s) => [`${s.name}/SKILL.md`, s.source_skill_sha256])
    : Object.entries(raw)
  for (const [p, hex] of entries) {
    const path = portable(p)
    if (isProviderManaged(path)) { excluded.push(path); continue }
    if (typeof hex !== 'string' || !/^[0-9a-f]{64}$/i.test(hex)) continue
    surface.set(path, Buffer.from(hex, 'hex'))
  }
}

// --------------------------------------------------------------- classify
const exact = [], drifted = [], novel = [], missing = []
for (const [p, d] of surface) {
  const c = canonical.get(p)
  if (!c) novel.push(p)
  else if (c.equals(d)) exact.push(p)
  else drifted.push(p)
}
for (const p of canonical.keys()) if (!surface.has(p)) missing.push(p)

const surfaceAgg = aggregate([...surface].map(([path, digest]) => ({ path, digest })))
const canonAgg = aggregate([...canonical].map(([path, digest]) => ({ path, digest })))

const recorded = registry?.surface_deployments?.[surfaceId] || null
const skillNames = (p) => p.split('/')[0]
const novelSkills = [...new Set(novel.map(skillNames))]
const driftedSkills = [...new Set(drifted.map(skillNames))]

// ---------------------------------------------------------------- report
const out = []
const p = (s = '') => out.push(s)
p(`# Surface reconciliation: ${surfaceId}, ${today}`)
p()
p(`- Canonical tree: ${canonical.size} files, aggregate \`${canonAgg}\` (approved release \`${approved}\`)`)
p(`- Surface read: ${surface.size} files, aggregate \`${surfaceAgg}\``)
p(`- Provider-managed exclusions: ${excluded.length}`)
if (recorded) {
  p(`- Registry says this surface was on \`${recorded.release_id}\` at ${recorded.deployed_at}, aggregate \`${recorded.installed_ordinal_aggregate_sha256}\``)
  const matchesRecord = recorded.installed_ordinal_aggregate_sha256 === surfaceAgg
  p(`- Matches its own last deployment record: **${matchesRecord ? 'yes' : 'no'}**`)
}
p()
// Both comparisons above are same-side: this script's aggregate against an
// aggregate this script wrote. That is the only way the number is worth
// anything, and it is worth stating in the output because the mistake is easy
// and was made twice.
//
// On 2026-09-08 and again on 2026-09-09 an aggregate computed here was handed
// to a Windows host and asked to match what its own tooling reported. It did
// not, either time. SURFACE reported F7C08490... over 139 files while this
// script reported 4CBF02F3... over 139 files of the same release, with the
// host's per-skill hashes all exact and its audit reporting zero drift.
// Eighteen path and encoding conventions were tried against the host's value
// and none reproduced it, so the two sides are hashing different file sets, not
// the same set differently. Equal counts hid that.
//
// The bytes were never in question on either occasion. The check was.
p('> The aggregate compares this surface to its own deployment record, written by this script. It is not comparable to a figure computed by a host\'s own tooling: the two walk different roots and disagree on which files belong. Per-file classification below is the parity contract. A host reporting every skill exact and an aggregate that differs from this one is reporting agreement, not drift.')
p()
p('| Class | Files | Skills |')
p('|---|---:|---|')
p(`| exact | ${exact.length} | |`)
p(`| drifted (same path, different bytes) | ${drifted.length} | ${driftedSkills.join(', ') || ''} |`)
p(`| novel (on the host, not in the repository) | ${novel.length} | ${novelSkills.join(', ') || ''} |`)
p(`| missing (in the repository, not on the host) | ${missing.length} | ${[...new Set(missing.map(skillNames))].join(', ') || ''} |`)
p()

if (novel.length) {
  p('## Novel content, on the host and nowhere else')
  p()
  p('This is the material the machine schedule existed to protect. Nothing here is merged or discarded by this script: each file is either work that belongs in the canon, or local drift that should be retired deliberately. Until one of those is chosen, it stays exactly as it is.')
  p()
  for (const f of novel.slice(0, 80)) p(`- \`${f}\``)
  if (novel.length > 80) p(`- ... ${novel.length - 80} more`)
  p()
}
if (drifted.length) {
  p('## Drifted, same path and different bytes')
  p()
  p('The host and the repository disagree about these files. Neither is automatically right: the host may carry an edit nobody committed, or it may simply be behind. Resolve each one before installing over it.')
  p()
  for (const f of drifted.slice(0, 80)) p(`- \`${f}\``)
  if (drifted.length > 80) p(`- ... ${drifted.length - 80} more`)
  p()
}
if (missing.length) {
  p('## Missing from the host')
  p()
  p('In the canonical tree and not installed. Normally this means the host is behind a release, which an install fixes.')
  p()
  for (const f of missing.slice(0, 60)) p(`- \`${f}\``)
  if (missing.length > 60) p(`- ... ${missing.length - 60} more`)
  p()
}
if (excluded.length) {
  p('## Provider-managed, excluded from parity by contract')
  p()
  for (const f of [...new Set(excluded.map(skillNames))].slice(0, 30)) p(`- \`${f}\``)
  p()
}

p('## The verdict')
p()
if (!novel.length && !drifted.length && !missing.length) {
  p(`This surface is byte-identical to the canonical tree. There is nothing on it that is not also in \`krishanraja/ai-harness\`, so it can be rebuilt from a release at any time and nothing is lost by switching the host off.`)
} else if (novel.length || drifted.length) {
  p(`This surface carries ${novel.length} file(s) that exist nowhere else and ${drifted.length} that disagree with the canon. Those must be resolved before the host's schedule is retired, because after that nothing will be watching for them again.`)
} else {
  p(`This surface is behind the canon by ${missing.length} file(s) and carries nothing unique. An install brings it current and nothing is at risk.`)
}
p()

const text = out.join('\n') + '\n'
const outPath = flag('--out')
if (outPath) { mkdirSync(dirname(outPath), { recursive: true }); writeFileSync(outPath, text) }
process.stdout.write(text)
console.log(`\nSummary: exact=${exact.length} drifted=${drifted.length} novel=${novel.length} missing=${missing.length}`)
if (novel.length || drifted.length) process.exit(1)
