#!/usr/bin/env node
/**
 * The change guard: what a steward-drafted change request may contain.
 *
 * The weekly steward drafts change packages with a model that holds no write
 * credential. Nothing it writes reaches a branch until this guard passes it,
 * and the guard is deterministic, so a prompt-injected or careless draft is
 * refused by arithmetic, not by asking the model to behave.
 *
 * A package is a directory:
 *
 *   changes/<slug>/change.json   what and why (schema below)
 *   changes/<slug>/files/<path>  the full new content of each changed file,
 *                                at its repository-relative path
 *
 * change.json:
 *   slug                      lowercase words joined by hyphens
 *   type                      the candidate type it answers, or "process"
 *   candidate_id              the brief's candidate id
 *   title                     one line
 *   why                       the evidence-backed reason, plain words
 *   evidence_ids              ledger ids from the brief
 *   alternative_explanations  at least one reading that does not support it
 *   if_wrong                  what breaks and who notices first
 *   validation                the case or check that shows it worked
 *   rollback                  the exact way back
 *   growth_justified          optional: why always-on growth earns its place
 *   supersedes                optional: { "<old rule id>": "<new rule id>" }
 *
 * What the guard refuses is listed in checkPackage below. The budget numbers
 * come from contract/context-budget.yaml and contract/learning-policy.yaml.
 *
 *   node scripts/change-guard.mjs changes/<slug> [changes/<slug> ...]
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadBudget, measure, reader } from './context-budget.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const num = (v, d) => (v === undefined || v === null || v === '' ? d : Number(v))

export const LIMITS = { canonFiles: 4, changedLines: 150, skillLines: 500 }
export const DENIED_SKILLS = new Set(['ctrl-capture', 'harness-maintainer'])
const REQUIRED = ['slug', 'type', 'candidate_id', 'title', 'why', 'evidence_ids', 'alternative_explanations', 'if_wrong', 'validation', 'rollback']
const TYPES = new Set(['ineffective-change', 'inbound-edit', 'ruling-cluster', 'correction-cluster', 'friction', 'pattern', 'standing-condition', 'canary-failure', 'consolidation', 'process'])

const SECRET = [
  /\bgh(?:p|o|u|s|r)_[A-Za-z0-9]{20,}\b/i, /\bvcp_[A-Za-z0-9_-]{20,}\b/i, /\bsbp_[A-Za-z0-9_-]{20,}\b/i,
  /\bsk_(?:user_)?[A-Za-z0-9_-]{20,}\b/i, /\bsk-(?:ant|proj)-[A-Za-z0-9_-]{16,}/i,
  /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/i, /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
]
const FORBIDDEN = [
  [/Ruling\s*\(/i, 'a Ruling line: only Krish records a ruling, and a change request must never be able to overrule its own review'],
  [/^\s*[-*]?\s*Krish,\s*\d{4}-\d{2}-\d{2}\s*:/im, 'a "Krish, DATE:" ruling line'],
  [/Harness-Steward/i, 'a Harness-Steward trailer, which only the opening step writes'],
  [/\u2014/, 'an em dash'],
  [/<!--/, 'an HTML comment, which hides text from a reviewer'],
  [/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/, 'a zero-width or bidirectional control character'],
  [/(^|[\s(])@[A-Za-z0-9][A-Za-z0-9-]{0,38}\b/, 'an @mention, which would notify someone'],
]

/** Where a steward change may write, and what kind of write it is. */
export function classifyPath(path, type) {
  if (path.includes('..') || path.startsWith('/')) return { ok: false, why: 'escapes the repository' }
  if (path === 'contract/learning-policy.yaml') return type === 'process' ? { ok: true, kind: 'policy' } : { ok: false, why: 'only a process change may tune the learning policy' }
  if (type === 'process') return { ok: false, why: 'a process change may touch contract/learning-policy.yaml and nothing else' }
  let m = path.match(/^skills\/([a-z0-9-]+)\/SKILL\.md$/)
  if (m) return DENIED_SKILLS.has(m[1]) ? { ok: false, why: `${m[1]} governs the loop itself and is changed only in a session` } : { ok: true, kind: 'skill', skill: m[1] }
  m = path.match(/^skills\/([a-z0-9-]+)\/(?:references|leaves)\/[A-Za-z0-9._/-]+\.md$/)
  if (m) return DENIED_SKILLS.has(m[1]) ? { ok: false, why: `${m[1]} governs the loop itself and is changed only in a session` } : { ok: true, kind: 'reference', skill: m[1] }
  if (/^contract\/(?:krish-operating-contract|skill-routing-contract)\.md$/.test(path)) return { ok: true, kind: 'contract' }
  if (/^evals\/[a-z0-9-]+-cases\.jsonl$/.test(path)) return { ok: true, kind: 'eval' }
  return { ok: false, why: 'outside what a steward change request may touch' }
}

/** Lines added and removed between two texts, by longest common subsequence. */
export function lineDiff(before, after) {
  const a = before.split('\n')
  const b = after.split('\n')
  const n = a.length
  const m = b.length
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1))
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1])
  const added = []
  const removed = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) { i++; j++ } else if (L[i + 1][j] >= L[i][j + 1]) { removed.push(a[i++]) } else { added.push(b[j++]) }
  }
  while (i < n) removed.push(a[i++])
  while (j < m) added.push(b[j++])
  return { added, removed }
}

const frontMatter = (text) => { const m = String(text).match(/^---\n([\s\S]*?)\n---/); return m ? m[1] : null }

function listFiles(dir, base = dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...listFiles(p, base))
    else out.push(relative(base, p).split('\\').join('/'))
  }
  return out
}

export function checkPackage(dir, { root = HARNESS, budget = loadBudget(root) } = {}) {
  const problems = []
  const files = []
  let change = null
  try { change = JSON.parse(readFileSync(join(dir, 'change.json'), 'utf8')) } catch (e) { return { ok: false, problems: [`change.json is missing or not JSON: ${e.message}`], files, change } }

  for (const k of REQUIRED) if (change[k] === undefined || change[k] === '' || (Array.isArray(change[k]) && !change[k].length)) problems.push(`change.json is missing ${k}`)
  if (change.slug && !/^[a-z0-9][a-z0-9-]{2,50}$/.test(change.slug)) problems.push('slug must be 3 to 51 lowercase letters, digits or hyphens')
  if (change.type && !TYPES.has(change.type)) problems.push(`unknown type ${change.type}`)
  const prose = Object.entries(change).filter(([, v]) => typeof v === 'string' || Array.isArray(v)).map(([, v]) => (Array.isArray(v) ? v.join(' ') : v)).join('\n')
  for (const [re, why] of FORBIDDEN) if (re.test(prose)) problems.push(`change.json carries ${why}`)
  if (SECRET.some((re) => re.test(prose))) problems.push('change.json carries a secret-shaped string')
  if (/https?:\/\//i.test(prose)) problems.push('change.json carries a URL; evidence is cited by ledger id')

  const filesDir = join(dir, 'files')
  const paths = existsSync(filesDir) ? listFiles(filesDir) : []
  if (!paths.length) problems.push('the package changes no file')
  const base = reader(null, root)
  let changedLines = 0
  let canon = 0
  let evalLines = 0
  for (const path of paths) {
    const c = classifyPath(path, change.type)
    if (!c.ok) { problems.push(`${path}: ${c.why}`); continue }
    const abs = join(root, path)
    if (!existsSync(abs)) { problems.push(`${path}: a change request edits existing files; it never creates one`); continue }
    const before = readFileSync(abs, 'utf8')
    const after = readFileSync(join(filesDir, path), 'utf8')
    if (before === after) { problems.push(`${path}: unchanged`); continue }
    const d = lineDiff(before, after)
    files.push({ path, kind: c.kind, added: d.added.length, removed: d.removed.length })
    const addedText = d.added.join('\n')
    for (const [re, why] of FORBIDDEN) if (re.test(addedText)) problems.push(`${path}: adds ${why}`)
    if (SECRET.some((re) => re.test(addedText))) problems.push(`${path}: adds a secret-shaped string`)
    for (const url of addedText.match(/https?:\/\/[^\s)>"'`]+/gi) || []) if (!before.includes(url)) problems.push(`${path}: adds a URL that was not already there (${url.slice(0, 60)})`)

    if (c.kind === 'eval') {
      const norm = before.endsWith('\n') ? before : `${before}\n`
      if (!after.startsWith(norm) && !after.startsWith(before)) { problems.push(`${path}: eval files are append-only`); continue }
      const tail = after.slice(after.startsWith(norm) ? norm.length : before.length).split('\n').filter((l) => l.trim())
      for (const line of tail) { try { const o = JSON.parse(line); if (!o.id) problems.push(`${path}: an appended case has no id`) } catch { problems.push(`${path}: an appended line is not JSON`) } }
      evalLines += tail.length
      continue
    }
    if (c.kind !== 'policy') canon++
    changedLines += d.added.length + d.removed.length
    if (c.kind === 'skill') {
      const fb = frontMatter(before)
      const fa = frontMatter(after)
      if (fb === null || fa === null) problems.push(`${path}: front matter is missing`)
      else {
        const lb = fb.split('\n')
        const la = fa.split('\n')
        const name = (ls) => ls.find((l) => /^name:/.test(l))
        if (name(lb) !== name(la)) problems.push(`${path}: the skill name may not change`)
        const others = (ls) => ls.filter((l) => !/^description:/.test(l)).join('\n')
        if (others(lb) !== others(la)) problems.push(`${path}: front matter other than the description may not change`)
        const reviewed = (ls) => ((ls.find((l) => /^description:/.test(l)) || '').match(/Last reviewed \d{4}-\d{2}-\d{2}/) || [''])[0]
        if (reviewed(lb) !== reviewed(la)) problems.push(`${path}: a reviewed date moves only with a review`)
      }
      if (after.split('\n').length >= LIMITS.skillLines) problems.push(`${path}: a SKILL.md must stay under ${LIMITS.skillLines} lines`)
    }
  }
  if (canon > LIMITS.canonFiles) problems.push(`changes ${canon} canon files; the limit is ${LIMITS.canonFiles}`)
  if (changedLines > LIMITS.changedLines) problems.push(`changes ${changedLines} lines; the limit is ${LIMITS.changedLines}`)
  if (canon && !evalLines) problems.push('a canon change must append at least one eval case that would catch a regression')

  // The always-on surface: overlay the package on the working tree and measure.
  const overlay = { read: (p) => (paths.includes(p) ? readFileSync(join(filesDir, p), 'utf8') : base.read(p)), list: base.list }
  const before = measure(budget, base).total
  const after = measure(budget, overlay).total
  const delta = after - before
  const cap = num(budget.hard_cap_chars, 400)
  if (delta > cap) problems.push(`grows the always-on surface by ${delta} characters; the hard cap is ${cap}`)
  else if (delta > 0 && !String(change.growth_justified || '').trim()) problems.push(`grows the always-on surface by ${delta} characters with no growth_justified`)

  return { ok: !problems.length, problems, files, change, delta, changedLines, evalLines }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const dirs = process.argv.slice(2)
  if (!dirs.length) { console.error('usage: change-guard.mjs <package dir> [...]'); process.exit(2) }
  let bad = 0
  for (const d of dirs) {
    const r = checkPackage(d)
    console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${d}  (${r.files.length} file(s), ${r.changedLines ?? 0} changed line(s), ${r.evalLines ?? 0} eval case(s), always-on ${r.delta > 0 ? '+' : ''}${r.delta ?? 0})`)
    for (const p of r.problems) console.log(`      ${p}`)
    if (!r.ok) bad++
  }
  process.exit(bad ? 1 : 0)
}
