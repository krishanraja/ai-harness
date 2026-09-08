#!/usr/bin/env node
/**
 * One-time seed for repositories that have no agent entry file yet.
 *
 * Codex reads AGENTS.md natively, so that is the entry file everywhere. Where a
 * repository already has one, this script does not touch it: it only adds the
 * header for repositories that have none, built from that repository's own
 * NOW.md frontmatter so the header states facts the repo already asserts rather
 * than facts this script invents.
 *
 * Everything it writes is outside the canon markers and is human-owned from the
 * moment it lands. The renderer never reads it again.
 *
 *   node scripts/seed-agents.mjs --repos-root <dir> [--dry-run]
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'
import { blockFor, splice } from './render.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const args = process.argv.slice(2)
const flag = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1] }
const dry = args.includes('--dry-run')
const root = flag('--repos-root') || join(HARNESS, '..')

const fleet = parseYaml(readFileSync(join(HARNESS, 'state/fleet.yaml'), 'utf8'))

const fm = (repoDir) => {
  const p = join(repoDir, 'NOW.md')
  if (!existsSync(p)) return {}
  const m = readFileSync(p, 'utf8').match(/^---\n([\s\S]*?)\n---/)
  if (!m) return {}
  const out = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/)
    if (kv) out[kv[1]] = kv[2].trim()
  }
  return out
}

function header(repo, meta) {
  const product = meta.product || repo.name
  const history = meta.history_log || 'docs/history/LOG.md'
  const own = (repo.rules_files || []).filter((f) => f !== 'AGENTS.md').map((f) => `\`${f}\``)
  const lines = [
    '# AGENTS.md',
    '',
    `Entry file for coding agents working in ${product}. Codex reads this file natively;`,
    'Claude Code and Cursor are routed here by their own rules.',
    '',
    '**Read `NOW.md` first.** It is the current state of this repository in one file: what',
    'it is, who it is for, what changed recently, what is waiting, and what not to trust.',
    'It is validated on every push to `main` and reconciled against the code nightly, so it',
    `is never more than a day behind the tree. Chronology lives in \`${history}\`.`,
  ]
  if (own.length) {
    lines.push('', `This repository's own rules and deeper state: ${own.join(', ')}. They outrank the`, 'canon below on anything specific to this repository.')
  }
  return lines.join('\n')
}

let seeded = 0, spliced = 0
for (const repo of fleet.repos) {
  const dir = join(root, repo.checkout || repo.name)
  if (!existsSync(dir)) { console.log(`skip  ${repo.name} (no checkout at ${dir})`); continue }
  const target = join(dir, repo.canon_target)
  let text = existsSync(target) ? readFileSync(target, 'utf8') : null
  if (text === null) { text = header(repo, fm(dir)) + '\n'; seeded++ }
  const after = splice(text, blockFor(existsSync(target) ? readFileSync(target, 'utf8') : '', repo))
  const before = existsSync(target) ? readFileSync(target, 'utf8') : null
  if (after === before) { console.log(`ok    ${repo.name}/${repo.canon_target}`); continue }
  spliced++
  if (dry) { console.log(`would ${before === null ? 'create' : 'update'} ${repo.name}/${repo.canon_target}`); continue }
  writeFileSync(target, after)
  console.log(`${before === null ? 'create' : 'update'} ${repo.name}/${repo.canon_target}`)
}
console.log(`\n${seeded} entry file(s) seeded, ${spliced} file(s) written.`)
