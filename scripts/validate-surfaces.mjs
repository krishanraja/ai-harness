#!/usr/bin/env node
/**
 * Surface validator: the hard gate the renderer runs behind.
 *
 * It asserts the things that, if they ever stopped being true, would let the
 * canon rot quietly rather than loudly:
 *
 *   - the canon block is short enough to be worth reading on every request
 *   - the block body still matches the sha256 on its own start marker
 *   - the adapters are what the templates render, not hand edits
 *   - the fleet list here and the docs steward's fleet.json name the same repos
 *   - no machine-specific absolute path has crept back into the canon
 *   - no em dash, the one voice rule that is machine-checkable
 *
 * Dependency-free, and it never writes.
 *
 *   node scripts/validate-surfaces.mjs [--fleet-json <path to control-center fleet.json>]
 *                                      [--repos-root <dir holding the checkouts>]
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'
import { renderBlock, inspect, START } from './render.mjs'
import { check as checkRuleProvenance, extract as extractRules } from './brain-rules.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const args = process.argv.slice(2)
const flag = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1] }

const MAX_BLOCK_LINES = 60

const fail = []
const warn = []
const ok = []
const F = (m) => fail.push(m)
const W = (m) => warn.push(m)
const O = (m) => ok.push(m)

const read = (rel) => readFileSync(join(HARNESS, rel), 'utf8')
const fleet = parseYaml(read('state/fleet.yaml'))
const paths = parseYaml(read('contract/paths.yaml'))

// -------------------------------------------------------------- block length
for (const repo of fleet.repos) {
  const block = renderBlock(repo)
  const lines = block.split('\n').length
  if (lines > MAX_BLOCK_LINES) F(`canon block for ${repo.name} is ${lines} lines, limit ${MAX_BLOCK_LINES}`)
  const state = inspect(block)
  if (!state.present) F(`canon block for ${repo.name} does not parse back`)
  else if (!state.intact) F(`canon block for ${repo.name} does not match its own stamp`)
}
O(`canon block renders and self-verifies for ${fleet.repos.length} repos, longest under ${MAX_BLOCK_LINES} lines`)

// ------------------------------------------------------------------ adapters
const REQUIRED = ['krish-operating-contract.md', 'skill-routing-contract.md', 'krish-principles', 'strategy-brief', 'verification-loop']
for (const a of fleet.adapters) {
  const abs = join(HARNESS, a.output)
  if (!existsSync(abs)) { F(`missing adapter ${a.output}`); continue }
  const text = readFileSync(abs, 'utf8')
  for (const r of REQUIRED) if (!text.includes(r)) F(`adapter ${a.output} lost the ${r} reference`)
  if (!existsSync(join(HARNESS, a.template))) F(`adapter ${a.output} names a template that does not exist: ${a.template}`)
}
O(`${fleet.adapters.length} adapters present, each carrying all ${REQUIRED.length} required references`)

// ------------------------------------------------ paths.yaml covers everything
const named = Object.keys(paths.roots)
for (const [id, s] of Object.entries(paths.surfaces)) {
  for (const n of named) if (!(n in s)) F(`surface ${id} does not define the named root ${n}`)
  if (!s.os) F(`surface ${id} does not declare an os`)
}
for (const t of [...fleet.adapters.map((a) => a.template), 'contract/templates/canon-block.md']) {
  const text = read(t)
  for (const m of text.matchAll(/\{\{([a-z_]+)\}\}/g)) {
    const n = m[1]
    if (['release', 'sha', 'rendered', 'skill_count', 'rules_files'].includes(n)) continue
    if (!named.includes(n)) F(`template ${t} uses {{${n}}}, which is not a named root in contract/paths.yaml`)
  }
}
O(`${Object.keys(paths.surfaces).length} surfaces define all ${named.length} named roots`)

// --------------------------------------------- no absolute paths in the canon
const canonFiles = []
const walk = (dir) => {
  for (const e of readdirSync(join(HARNESS, dir))) {
    const rel = `${dir}/${e}`
    if (statSync(join(HARNESS, rel)).isDirectory()) walk(rel)
    else if (/\.(md|mdc)$/.test(e)) canonFiles.push(rel)
  }
}
walk('contract')
const ABS = /[A-Z]:\\Users\\|[A-Z]:\\My Drive|\/home\/[a-z]+\//
for (const f of canonFiles) {
  if (f.startsWith('contract/templates/')) continue
  const text = read(f)
  text.split('\n').forEach((line, i) => { if (ABS.test(line)) F(`${f}:${i + 1} carries a machine-specific absolute path; move it to contract/paths.yaml`) })
}
O(`${canonFiles.length} canon files carry no machine-specific absolute path`)

// ----------------------------------------------------------------- no em dash
// Written as an escape rather than the character itself so this file obeys the
// rule it enforces. brain/ is included because it is canon: everything the
// judge panel and the provenance ledger read is built from these files.
const EM_DASH = '\u2014'
const brainFiles = []
if (existsSync(join(HARNESS, 'brain'))) {
  const walkBrain = (dir) => {
    for (const e of readdirSync(join(HARNESS, dir))) {
      const rel = `${dir}/${e}`
      if (statSync(join(HARNESS, rel)).isDirectory()) walkBrain(rel)
      else if (/\.(md|ya?ml|jsonl)$/.test(e)) brainFiles.push(rel)
    }
  }
  walkBrain('brain')
}
for (const f of [...canonFiles, ...brainFiles, ...fleet.adapters.map((a) => a.output), 'state/fleet.yaml']) {
  const text = read(f)
  text.split('\n').forEach((line, i) => { if (line.includes(EM_DASH)) F(`${f}:${i + 1} contains an em dash`) })
}
O(`no em dash in the canon, the templates, the rendered adapters or the ${brainFiles.length} brain files`)

// --------------------------------------------------- provenance on every rule
// Every rule in both contracts, and every chapter of every skill, must have an
// entry in brain/rules.yaml carrying its hash and where it came from. Without
// this, "who decided this and when" is unanswerable for almost the whole canon,
// and an edit to a rule is indistinguishable from the rule having always said
// that. The ledger is a sidecar so the contracts stay readable prose.
if (!existsSync(join(HARNESS, 'brain/rules.yaml'))) {
  F('brain/rules.yaml does not exist, so no rule in the canon carries provenance')
} else {
  const { problems, counts } = checkRuleProvenance(read('brain/rules.yaml'))
  for (const m of problems) F(m)
  if (!problems.length) O(`${counts.contract_rules} contract rules and ${counts.skill_sections} skill chapters each carry a hash and a source`)
}

// ------------------------------------------------ two live rules, one meaning
// The memory doctrine puts conflict detection at write time first on its list
// of underused techniques, and brain/stores.yaml already records the concrete
// instance: the em dash rule is live in the canon AND live in the abandoned
// standards_registry, "live on both sides", with nothing reconciling 314
// entries against 122. That one is cross-store and is tracked by `contested_by`.
// This check is the other half, inside the canon: two rules in the two
// contracts that say the same thing in different words.
//
// A warning, never a failure. Overlap is evidence a person should read, not
// arithmetic that proves duplication, and the panel is advisory for the same
// reason. Deterministic: token overlap, no model, no embedding.
{
  const STOP = new Set('a an and are as at be but by for from in into is it its no not of on or that the their this to with without you your never always must may can when where which what how who whom whose do does did done'.split(' '))
  const norm = (t) => [...new Set(String(t).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)))]
  const rules = extractRules().contractRules.map((r) => ({ id: r.id, file: r.file, toks: new Set(norm(r.text)) }))
  const pairs = []
  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const a = rules[i], b = rules[j]
      // Only across the two contracts. Two chapters of one contract restating
      // each other is a drafting matter; the same rule live in both is the one
      // that makes "which contract wins" unanswerable.
      if (a.file === b.file) continue
      const smaller = a.toks.size <= b.toks.size ? a.toks : b.toks
      if (smaller.size < 4) continue
      let shared = 0
      for (const t of smaller) if ((smaller === a.toks ? b.toks : a.toks).has(t)) shared++
      const overlap = shared / smaller.size
      if (overlap >= 0.7) pairs.push({ a: a.id, b: b.id, overlap })
    }
  }
  for (const x of pairs.sort((m, n) => n.overlap - m.overlap)) {
    W(`${x.a} and ${x.b} live in different contracts and share ${Math.round(x.overlap * 100)} percent of their meaningful words. Decide which one owns the rule, or record why both exist.`)
  }
  if (!pairs.length) O(`no live rule in one contract restates a live rule in the other above the 70 percent overlap bar (${rules.length} rules compared)`)
}

// ------------------------------------------------- fleet parity with the docs steward
const fleetJsonPath = flag('--fleet-json')
  || [join(HARNESS, '../control-center/docs/steward/fleet.json'), join(HARNESS, '.steward/fleet.json')].find((p) => existsSync(p))
if (!fleetJsonPath || !existsSync(fleetJsonPath)) {
  W('control-center docs/steward/fleet.json not reachable, so repo parity was not checked')
} else {
  const docs = JSON.parse(readFileSync(fleetJsonPath, 'utf8'))
  const lc = (n) => n.toLowerCase()
  const docsNames = new Set(docs.repos.map((r) => lc(r.name)))
  const hereNames = new Set(fleet.repos.map((r) => lc(r.name)))
  for (const n of docsNames) if (!hereNames.has(n)) F(`${n} is in the docs steward fleet but not in state/fleet.yaml`)
  for (const n of hereNames) if (!docsNames.has(n) && n !== lc('ai-harness')) F(`${n} is in state/fleet.yaml but not in the docs steward fleet`)
  if (!hereNames.has(lc('ai-harness'))) F('state/fleet.yaml does not carry ai-harness; the canon must not be exempt from its own treatment')
  O(`repo parity with docs/steward/fleet.json: ${docsNames.size} steward repos, ${hereNames.size} harness surfaces`)
}

// ------------------------------------------------ blocks in the checkouts, if present
const reposRoot = flag('--repos-root') || join(HARNESS, '..')
let checked = 0
for (const repo of fleet.repos) {
  const target = join(reposRoot, repo.checkout || repo.name, repo.canon_target)
  if (!existsSync(target)) continue
  const text = readFileSync(target, 'utf8')
  if (!text.includes(START)) continue
  checked++
  const state = inspect(text)
  if (!state.present) { F(`${repo.name}/${repo.canon_target} has a start marker the validator cannot parse`); continue }
  if (!state.intact) W(`${repo.name}/${repo.canon_target} was edited inside the markers; the reconciler will raise a proposal, nothing is overwritten`)
}
if (checked) O(`${checked} checked-out repos carry a parseable canon block`)

// --------------------------------------------------------------------- report
for (const m of ok) console.log(`ok    ${m}`)
for (const m of warn) console.log(`warn  ${m}`)
for (const m of fail) console.error(`FAIL  ${m}`)
if (fail.length) { console.error(`\n${fail.length} failure(s).`); process.exit(1) }
console.log(`\nSURFACES VALID: ${ok.length} checks passed, ${warn.length} warning(s).`)
