#!/usr/bin/env node
/**
 * Trigger evaluation, in the cloud, with the numbers written down.
 *
 * The registry has carried evaluation evidence for two skills out of
 * twenty-nine since August, while nineteen per-skill result files sat in
 * state/ never folded in. So the file a reader consults to ask "is this skill
 * any good" answered for two. Gate 2 asks for precision and recall on a
 * held-out suite: 100 percent for core skills, at least 95 percent for routed
 * ones. Nothing was measuring it because the suites only ran by hand, on
 * Windows, against claude.exe.
 *
 * This runs the 621 trigger cases against the API on ubuntu, scores them
 * deterministically, and writes results to state/evals/. The audit reads that
 * directory, so a result can never again be written and then orphaned.
 *
 * Two things it does not do. It does not judge behaviour: that needs a
 * separate judge pass and is not this script. And it never writes to
 * state/skill-registry.yaml, because a measurement is evidence and changing the
 * register is a decision.
 *
 * On prompt caching: the router block is every skill's name and description,
 * about 6,000 tokens, and it is byte-identical across all 621 calls. That is
 * the textbook cache shape, and it is above Haiku 4.5's 4,096 token minimum
 * cacheable prefix, so the breakpoint actually engages. Below that minimum a
 * cache_control block is silently ignored and you pay full price while
 * believing you are not, which is the failure this script reports rather than
 * hides: it prints cache reads and creations every run.
 *
 *   node scripts/eval.mjs [--skill <name>] [--limit <n>] [--max-tokens <n>]
 *                         [--model <id>] [--out <dir>] [--dry-run]
 *
 * ANTHROPIC_API_KEY is required. The run aborts at the token cap rather than
 * finishing an unbounded spend.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const args = process.argv.slice(2)
const flag = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1] }
const dryRun = args.includes('--dry-run')

const MODEL = flag('--model') || 'claude-haiku-4-5-20251001'
const ONLY = flag('--skill')
const LIMIT = Number(flag('--limit') || 0)
const TOKEN_CAP = Number(flag('--max-tokens') || 4_000_000)
const OUT_DIR = flag('--out') || join(HARNESS, 'state/evals')
const today = new Date().toISOString().slice(0, 10)

const key = process.env.ANTHROPIC_API_KEY
if (!key && !dryRun) {
  console.error('::error::ANTHROPIC_API_KEY is not set. Trigger accuracy has read as unmeasured since August precisely because nothing could run unattended; failing here rather than skipping quietly is the point.')
  process.exit(1)
}

// ------------------------------------------------------------- the router block
// Exactly what a client sees when it decides which skill to load: every name and
// description, nothing else. Byte-identical for every case, which is what makes
// it cacheable.
const skillDirs = readdirSync(join(HARNESS, 'skills')).filter((d) => statSync(join(HARNESS, 'skills', d)).isDirectory())
const descriptions = []
for (const d of skillDirs) {
  const p = join(HARNESS, 'skills', d, 'SKILL.md')
  if (!existsSync(p)) continue
  const fm = readFileSync(p, 'utf8').match(/^---\n([\s\S]*?)\n---/)
  if (!fm) continue
  const desc = (fm[1].match(/description:\s*"([\s\S]*?)"\s*$/m) || fm[1].match(/description:\s*(.+)$/m) || [])[1] || ''
  descriptions.push(`- ${d}: ${desc.replace(/\s+/g, ' ').trim()}`)
}
const routerBlock = descriptions.join('\n')

const SYSTEM = [
  {
    type: 'text',
    text: [
      'You are the skill router for a curated set of agent skills. Given a user message, decide which skills, if any, that message should load.',
      '',
      'Rules that decide the answer:',
      '- The narrowest applicable skill wins. A broad "always" or "mandatory" claim inside a description never overrides this.',
      '- Load nothing when the message is ordinary conversation, or when it merely mentions a topic a skill covers without asking for that skill\'s work.',
      '- A skill whose description states an exact trigger phrase fires only on that exact phrase, never on a paraphrase or a mention.',
      '',
      'The available skills:',
      '',
      routerBlock,
      '',
      'Answer with JSON only: {"skills": ["name", ...]} listing every skill that should load, or {"skills": []} for none. No prose.',
    ].join('\n'),
    // The breakpoint goes at the end of the shared portion and nowhere else.
    // Putting it after the varying question would cache nothing.
    cache_control: { type: 'ephemeral' },
  },
]

// ------------------------------------------------------------------ the cases
const suites = readdirSync(join(HARNESS, 'evals')).filter((f) => /-trigger-cases\.jsonl$/.test(f))
const cases = []
for (const f of suites) {
  const skill = f.replace(/-trigger-cases\.jsonl$/, '')
  if (ONLY && skill !== ONLY) continue
  for (const line of readFileSync(join(HARNESS, 'evals', f), 'utf8').split('\n')) {
    if (!line.trim()) continue
    try {
      const c = JSON.parse(line)
      cases.push({ ...c, suite: skill, target: c.skill || skill })
    } catch { console.log(`::warning::unparseable case in ${f}`) }
  }
}
const selected = LIMIT ? cases.slice(0, LIMIT) : cases
console.log(`${selected.length} trigger cases across ${new Set(selected.map((c) => c.suite)).size} suites, model ${MODEL}`)
console.log(`Router block: ${routerBlock.length} characters, roughly ${Math.round(routerBlock.length / 3.7)} tokens.`)

if (dryRun) {
  console.log('Dry run. Nothing called, nothing written.')
  process.exit(0)
}

// ---------------------------------------------------------------------- run
const usage = { input: 0, output: 0, cache_read: 0, cache_write: 0 }
const results = []
let aborted = null

const call = async (prompt) => {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 200, system: SYSTEM, messages: [{ role: 'user', content: prompt }] }),
  })
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`)
  return res.json()
}

for (const [i, c] of selected.entries()) {
  const spent = usage.input + usage.output + usage.cache_read + usage.cache_write
  if (spent > TOKEN_CAP) { aborted = `token cap ${TOKEN_CAP.toLocaleString()} reached after ${i} cases`; break }
  try {
    const r = await call(String(c.prompt ?? c.scenario ?? ''))
    usage.input += r.usage?.input_tokens || 0
    usage.output += r.usage?.output_tokens || 0
    usage.cache_read += r.usage?.cache_read_input_tokens || 0
    usage.cache_write += r.usage?.cache_creation_input_tokens || 0

    const text = (r.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('')
    let picked = []
    try { picked = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}').skills || [] } catch { /* unparseable answer is a fail, not a crash */ }
    const fired = picked.includes(c.target)
    const expected = c.should_trigger === true
    results.push({ id: c.id, suite: c.suite, target: c.target, category: c.category, expected, fired, picked, pass: fired === expected })
  } catch (e) {
    results.push({ id: c.id, suite: c.suite, target: c.target, category: c.category, expected: c.should_trigger === true, error: e.message, pass: false })
  }
  if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${selected.length}, cache read ${usage.cache_read.toLocaleString()} tokens`)
}

// ------------------------------------------------------------------- scoring
// Precision and recall per skill, which is what Gate 2 asks for. An aggregate
// pass rate would hide a skill that never fires behind twenty that do.
const bySkill = {}
for (const r of results) {
  const s = (bySkill[r.target] ||= { tp: 0, fp: 0, tn: 0, fn: 0, errors: 0, cases: 0 })
  s.cases++
  if (r.error) { s.errors++; continue }
  if (r.expected && r.fired) s.tp++
  else if (!r.expected && r.fired) s.fp++
  else if (!r.expected && !r.fired) s.tn++
  else s.fn++
}
for (const s of Object.values(bySkill)) {
  s.precision = s.tp + s.fp ? +(s.tp / (s.tp + s.fp)).toFixed(3) : null
  s.recall = s.tp + s.fn ? +(s.tp / (s.tp + s.fn)).toFixed(3) : null
  s.accuracy = s.cases ? +((s.tp + s.tn) / s.cases).toFixed(3) : null
}

const payload = {
  run: `${today}-triggers`,
  measured_at: new Date().toISOString(),
  model: MODEL,
  source_commit: process.env.GITHUB_SHA || null,
  cases_run: results.length,
  cases_available: cases.length,
  aborted,
  usage,
  cache_effectiveness: usage.cache_read + usage.input ? +(usage.cache_read / (usage.cache_read + usage.input)).toFixed(3) : 0,
  by_skill: bySkill,
  failures: results.filter((r) => !r.pass).map((r) => ({ id: r.id, target: r.target, category: r.category, expected: r.expected, fired: r.fired, picked: r.picked, error: r.error })),
}

mkdirSync(OUT_DIR, { recursive: true })
const outPath = join(OUT_DIR, `${today}-triggers.json`)
writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n')

// -------------------------------------------------------------------- report
console.log(`\n${results.length} cases run${aborted ? `, ABORTED: ${aborted}` : ''}`)
console.log(`Tokens: ${usage.input.toLocaleString()} input, ${usage.output.toLocaleString()} output, ${usage.cache_read.toLocaleString()} cache read, ${usage.cache_write.toLocaleString()} cache write`)
console.log(`Cache effectiveness: ${(payload.cache_effectiveness * 100).toFixed(1)} percent of input served from cache`)
if (usage.cache_read === 0 && results.length > 5) {
  console.log('::warning::Zero cache reads across the whole run. The breakpoint is not engaging: check that the shared prefix is above this model\'s minimum cacheable length and that nothing before the breakpoint varies between calls.')
}
console.log('\n| Skill | Cases | Precision | Recall | Accuracy | Errors |')
console.log('|---|---:|---:|---:|---:|---:|')
for (const [n, s] of Object.entries(bySkill).sort((a, b) => (a[1].accuracy ?? 1) - (b[1].accuracy ?? 1))) {
  console.log(`| ${n} | ${s.cases} | ${s.precision ?? ''} | ${s.recall ?? ''} | ${s.accuracy ?? ''} | ${s.errors || ''} |`)
}
console.log(`\nWritten: ${outPath.replace(HARNESS + '/', '')}`)
console.log('Nothing in state/skill-registry.yaml was changed. A measurement is evidence; changing the register is a decision.')
