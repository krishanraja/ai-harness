#!/usr/bin/env node
/**
 * The always-on context budget: measure it, and the change a commit range makes.
 *
 * "Smarter" that costs every session more context is not free; the catalogue and
 * the always-on skills are paid for on every turn of every client. The surface
 * is declared in contract/context-budget.yaml and measured in characters.
 *
 *   node scripts/context-budget.mjs                       measure the working tree
 *   node scripts/context-budget.mjs --base <ref> --head <ref>   the change between two refs
 *   node scripts/context-budget.mjs --base <ref> --head <ref> --enforce
 *        fail when the range grows the surface without a `Growth justified:` line
 *   --json   machine-readable output
 *
 * Dependency-free. Reading a ref goes through `git show`, so it never checks
 * anything out.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const args = process.argv.slice(2)
const has = (f) => args.includes(f)
const flag = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1] }

export function loadBudget(root = HARNESS) {
  return parseYaml(readFileSync(join(root, 'contract/context-budget.yaml'), 'utf8'))
}

/** The `description:` value from a SKILL.md front matter, or ''. */
export function description(text) {
  const fm = String(text).match(/^---\n([\s\S]*?)\n---/)
  if (!fm) return ''
  const m = fm[1].match(/^description:\s*(.*)$/m)
  if (!m) return ''
  return m[1].trim().replace(/^"(.*)"$/, '$1')
}

/** A reader for the working tree, or for one git ref. Missing files read as ''. */
export function reader(ref = null, root = HARNESS) {
  if (!ref) return { read: (p) => (existsSync(join(root, p)) ? readFileSync(join(root, p), 'utf8') : ''), list: (dir) => (existsSync(join(root, dir)) ? readdirSync(join(root, dir)) : []) }
  const git = (a) => { try { return execFileSync('git', ['-C', root, ...a], { encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] }) } catch { return '' } }
  return {
    read: (p) => git(['show', `${ref}:${p}`]),
    list: (dir) => git(['ls-tree', '--name-only', `${ref}:${dir}`]).split('\n').filter(Boolean),
  }
}

export function measure(budget, r) {
  const files = {}
  for (const f of budget.files || []) files[f] = r.read(f).length
  let descriptions = 0
  for (const name of r.list('skills')) descriptions += description(r.read(`skills/${name}/SKILL.md`)).length
  const fileTotal = Object.values(files).reduce((a, b) => a + b, 0)
  return { files, file_total: fileTotal, descriptions, total: fileTotal + descriptions }
}

export function delta(before, after) {
  const files = {}
  for (const f of new Set([...Object.keys(before.files), ...Object.keys(after.files)])) {
    const d = (after.files[f] || 0) - (before.files[f] || 0)
    if (d) files[f] = d
  }
  return { files, descriptions: after.descriptions - before.descriptions, total: after.total - before.total }
}

/** True when a commit body in the range states why the growth earns its place. */
export function justified(log) {
  return /^Growth justified:\s*\S/m.test(String(log))
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const budget = loadBudget()
  const base = flag('--base')
  const head = flag('--head')
  if (!base) {
    const m = measure(budget, reader())
    if (has('--json')) { console.log(JSON.stringify(m)); process.exit(0) }
    console.log(`Always-on context: ${m.total.toLocaleString('en-US')} characters (${m.file_total.toLocaleString('en-US')} in files, ${m.descriptions.toLocaleString('en-US')} in skill descriptions).`)
    process.exit(0)
  }
  const before = measure(budget, reader(base))
  const after = measure(budget, reader(head === 'WORKTREE' ? null : head || 'HEAD'))
  const d = delta(before, after)
  // A shallow clone may not hold the merge base; an unreadable log is "no
  // justification found", never a crash that hides the measurement.
  let log = ''
  if (head && head !== 'WORKTREE') { try { log = execFileSync('git', ['-C', HARNESS, 'log', '--format=%B', `${base}..${head}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }) } catch { log = '' } }
  const ok = d.total <= 0 || justified(log)
  if (has('--json')) console.log(JSON.stringify({ before: before.total, after: after.total, delta: d, justified: justified(log), ok }))
  else {
    const sign = (n) => (n > 0 ? `+${n}` : `${n}`)
    console.log(`### Always-on context\n`)
    console.log(`${before.total.toLocaleString('en-US')} -> ${after.total.toLocaleString('en-US')} characters (${sign(d.total)}). Policy: ${budget.policy}.`)
    for (const [f, n] of Object.entries(d.files)) console.log(`- ${f}: ${sign(n)}`)
    if (d.descriptions) console.log(`- skill descriptions: ${sign(d.descriptions)}`)
    if (d.total > 0) console.log(justified(log) ? '\nGrowth is justified in a commit body.' : '\nGrowth without a `Growth justified:` line in any commit body.')
  }
  if (has('--enforce') && !ok) process.exit(1)
}
