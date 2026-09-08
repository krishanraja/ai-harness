#!/usr/bin/env node
/**
 * Harness renderer: one canon, every surface.
 *
 * Reads contract/paths.yaml, contract/templates/, state/fleet.yaml and
 * state/skill-registry.yaml, and writes:
 *
 *   - the three client adapters, which stop being hand-maintained prose
 *   - the marker-delimited canon block for any repository target
 *
 * Two rules the rest of the system depends on:
 *
 *   1. Nothing outside the markers is ever read, moved or rewritten. That is
 *      the "do not overwrite good stuff" guarantee, and it is structural
 *      rather than promised: this file only ever splices between two markers.
 *   2. The stamp on the start marker carries the sha256 of the block body it
 *      introduces, so detecting drift is arithmetic rather than judgement. A
 *      body whose hash does not match its own stamp was edited in place, and
 *      the reconciler turns that into a proposal, never an overwrite.
 *
 * Dependency-free on purpose: a broken lockfile must never be the reason the
 * canon goes unrendered.
 *
 *   node scripts/render.mjs                 write the adapters
 *   node scripts/render.mjs --check         render and diff, write nothing, exit 1 on drift
 *   node scripts/render.mjs --print-block   print the canon block for a repo
 *   node scripts/render.mjs --repo <path> --name <fleet name>   splice the block into a checkout
 */

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const args = process.argv.slice(2)
const has = (f) => args.includes(f)
const flag = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1] }

export const START = 'krish-canon:start'
export const END = '<!-- krish-canon:end -->'

const read = (rel) => readFileSync(join(HARNESS, rel), 'utf8')
const sha256 = (s) => createHash('sha256').update(s, 'utf8').digest('hex')

const paths = parseYaml(read('contract/paths.yaml'))
const fleet = parseYaml(read('state/fleet.yaml'))
const registry = parseYaml(read('state/skill-registry.yaml'))

const release = registry?.latest_approved_release?.release_id || 'unreleased'
const skillCount = registry?.candidate_reconciliation?.expected_skill_count || 0

/**
 * The rendered date is the date the canon last moved, not today. Rendering the
 * same commit twice must produce the same bytes, otherwise every repository
 * picks up a no-op diff every night and the signal drowns.
 */
function canonDate() {
  const override = flag('--rendered')
  if (override) return override
  try {
    const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', 'contract', 'state/skill-registry.yaml'],
      { cwd: HARNESS, encoding: 'utf8' }).trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
  } catch { /* no git, fall through */ }
  return new Date().toISOString().slice(0, 10)
}

/** Substitute {{named_root}} and any path that hangs off it, in the surface's own separator. */
function resolvePaths(text, surfaceId) {
  const surface = paths.surfaces[surfaceId]
  if (!surface) throw new Error(`render: unknown surface ${surfaceId}`)
  const sep = surface.os === 'windows' ? '\\' : '/'
  return text.replace(/\{\{([a-z_]+)\}\}((?:\/[^\s`)]+)?)/g, (whole, name, tail) => {
    if (!(name in surface)) return whole
    const root = surface[name]
    if (root === null) return `(not available on ${surfaceId})`
    return root + tail.split('/').join(sep)
  })
}

/** The canon block body for one repository, before the markers go on. */
export function renderBody(repo) {
  const rules = (repo.rules_files || []).map((f) => `\`${f}\``).join(', ') || 'none recorded'
  return read('contract/templates/canon-block.md')
    .replace(/\{\{release\}\}/g, release)
    .replace(/\{\{skill_count\}\}/g, String(skillCount))
    .replace(/\{\{rules_files\}\}/g, rules)
    .trimEnd()
}

/** The block, markers and all. The stamp hashes the body it introduces. */
export function renderBlock(repo, rendered = canonDate()) {
  const body = renderBody(repo)
  const sha = sha256(body).slice(0, 12)
  return `<!-- ${START} release=${release} sha=${sha} rendered=${rendered} -->\n${body}\n${END}`
}

/**
 * The block to write into a file that may already carry one.
 *
 * When the body is unchanged, the existing rendered date is kept. "rendered" is
 * the date this body was produced, not the date the renderer last ran, so a
 * canon commit that does not change a repository's block must not restamp ten
 * files with a new date. Churn drowns the signal, and the signal is the point.
 */
export function blockFor(existing, repo, date) {
  const next = renderBlock(repo, date)
  const had = inspect(existing || '')
  const now = inspect(next)
  if (had.present && had.intact && now.present && had.sha === now.sha && had.release === now.release) {
    return renderBlock(repo, had.rendered)
  }
  return next
}

/**
 * Splice the block into a file, touching nothing else. Returns the new text.
 * A file with no markers gains them at the end, after its own content, so the
 * repository's own words always come first.
 */
export function splice(existing, block) {
  const startRe = new RegExp(`<!--\\s*${START}[^>]*-->`)
  const s = existing.search(startRe)
  const e = existing.indexOf(END)
  if (s === -1 || e === -1 || e < s) {
    const base = existing.replace(/\s*$/, '')
    return (base ? base + '\n\n' : '') + block + '\n'
  }
  return existing.slice(0, s) + block + existing.slice(e + END.length)
}

/** Read the block out of a file and say whether its body still matches its own stamp. */
export function inspect(text) {
  const m = text.match(new RegExp(`<!--\\s*${START}\\s+release=(\\S+)\\s+sha=(\\S+)\\s+rendered=(\\S+)\\s*-->\\n([\\s\\S]*?)\\n${END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
  if (!m) return { present: false }
  const [, rel, sha, rendered, body] = m
  return { present: true, release: rel, sha, rendered, body, intact: sha256(body).slice(0, 12) === sha }
}

// ------------------------------------------------------------------ adapters
// Everything below runs only when this file is the entrypoint, so the validator
// and the reconciler can import the render functions without writing anything.
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (!isMain) { /* imported as a library */ } else {
const rendered = canonDate()
const outputs = []
for (const a of fleet.adapters) {
  const text = resolvePaths(read(a.template), a.surface).replace(/\s*$/, '') + '\n'
  outputs.push({ path: a.output, text, id: a.id })
}

// --------------------------------------------------------------------- modes
if (flag('--repo')) {
  const repoPath = flag('--repo')
  const name = flag('--name')
  const entry = fleet.repos.find((r) => r.name === name)
  if (!entry) { console.error(`render: ${name} is not in state/fleet.yaml`); process.exit(2) }
  const target = join(repoPath, entry.canon_target)
  const before = existsSync(target) ? readFileSync(target, 'utf8') : ''
  const after = splice(before, renderBlock(entry, rendered))
  if (has('--check')) {
    if (before === after) { console.log(`ok    ${name} ${entry.canon_target}`); process.exit(0) }
    console.error(`drift ${name} ${entry.canon_target}`); process.exit(1)
  }
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, after)
  console.log(`${before === after ? 'ok   ' : 'wrote'} ${name} ${entry.canon_target}`)
  process.exit(0)
}

if (has('--print-block')) {
  const name = flag('--name') || 'control-center'
  const entry = fleet.repos.find((r) => r.name === name)
  if (!entry) { console.error(`render: ${name} is not in state/fleet.yaml`); process.exit(2) }
  process.stdout.write(renderBlock(entry, rendered) + '\n')
  process.exit(0)
}

let drift = 0
for (const o of outputs) {
  const abs = join(HARNESS, o.path)
  const before = existsSync(abs) ? readFileSync(abs, 'utf8') : null
  if (before === o.text) { console.log(`ok    ${o.path}`); continue }
  drift++
  if (has('--check')) { console.error(`drift ${o.path}`); continue }
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, o.text)
  console.log(`wrote ${o.path}`)
}
console.log(`release ${release}, ${skillCount} skills, rendered ${rendered}`)
if (has('--check') && drift) {
  console.error(`\n${drift} adapter(s) differ from the render. Run: node scripts/render.mjs`)
  process.exit(1)
}
}
