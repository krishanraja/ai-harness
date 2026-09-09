#!/usr/bin/env node
/**
 * The judge panel: two benches, one protocol.
 *
 * The audit measures whether the canon is well formed. It cannot say whether a
 * change made the canon better. These two benches can, and they answer it the
 * only way this repository has evidence for: by comparison.
 *
 * Absolute scoring was tried and it failed twice in two days. Two controls over
 * identical cases moved recall by 0.250 and then 0.125 between models, the
 * stronger model scoring lower each time. Meanwhile canaries on real clients
 * found four real defects in an hour. So a judge here never returns a number.
 * It is given a before and an after and must name the clause that improved or
 * regressed, by its id from brain/rules.yaml. A finding with no clause is
 * malformed and discarded, the same way canaries.mjs refuses a malformed report.
 *
 * Two benches, in two separate calls, so neither can see the other's verdicts:
 *
 *   technical  holds the canon to the memory-systems doctrine
 *   personal   holds it to Krish's own goals and standards
 *
 * Dissent is mandatory. A review returning only improvements is discarded and
 * re-run once, told that unanimity was rejected. If it comes back unanimous
 * again the review is recorded as bench-unanimous and a person reads it. A
 * bench that agrees with everything is measuring nothing, which is the lesson
 * the eval controls taught at some expense.
 *
 *   node scripts/judge.mjs --base main --head HEAD
 *   node scripts/judge.mjs --base <release> --head <release>   whole-brain review
 *   node scripts/judge.mjs --base main --head HEAD --post 26   post it as a PR review
 *
 * Exit 0 clean, 1 a blocking regression, 2 malformed or the model refused.
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const args = process.argv.slice(2)
const has = (f) => args.includes(f)
const flag = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1] }

export const BENCHES = ['technical', 'personal']
export const VERDICTS = new Set(['improves', 'regresses', 'unchanged', 'dissent'])
const EM_DASH = '—'

// The canon. A change anywhere else is not this panel's business, and feeding
// it the whole diff would bury the part that matters in build noise.
const WATCHED = ['contract/', 'skills/', 'brain/']

const read = (rel) => readFileSync(join(HARNESS, rel), 'utf8')

export function loadBench(name) {
  const b = parseYaml(read(`brain/benches/${name}.yaml`))
  if (!Array.isArray(b.criteria) || !b.criteria.length) throw new Error(`bench ${name} has no criteria`)
  return b
}

/** Every clause id a finding is allowed to cite, plus the files in the diff. */
export function clauseUniverse() {
  const ledger = parseYaml(read('brain/rules.yaml'))
  const ids = new Set()
  for (const e of [...(ledger.contract_rules || []), ...(ledger.skill_sections || [])]) ids.add(e.id)
  return ids
}

export function diffFor(base, head) {
  const out = execFileSync('git', ['-C', HARNESS, 'diff', '--unified=3', `${base}...${head}`, '--', ...WATCHED],
    { encoding: 'utf8', maxBuffer: 1 << 26 })
  return out
}

// --------------------------------------------------------------- the protocol
const PREAMBLE = `You are one bench of a two bench review panel over a personal AI operating canon.

You are given a unified diff of a proposed change and a bench of criteria. For
each criterion, decide whether the change improves, regresses, or leaves
unchanged the property that criterion protects.

Rules you must follow exactly:

1. You compare. You never score. Do not output a number, a rating, or a
   percentage anywhere.
2. Every finding must cite a clause: a rule id from the list of valid ids you
   are given, or the path of a file in the diff. A finding with no clause is
   discarded, so a finding you cannot ground is a finding you should not make.
3. You must dissent. Return at least one finding whose verdict is "regresses"
   or "dissent". If you genuinely believe the change is clean, use "dissent" to
   name the strongest argument against it that you can construct. A panel that
   agrees with everything is measuring nothing.
4. Quote the bench. Your reason must connect to the criterion's own test.
5. Never use an em dash. Not in any field, for any reason.

Output strictly one JSON object, no prose around it, no code fence:

{"findings":[{"criterion_id":"...","verdict":"improves|regresses|unchanged|dissent","clause":"...","because":"one or two sentences"}]}

Only include criteria you have something to say about. Do not pad.`

export function systemPrompt(bench, clauseIds) {
  const lines = [PREAMBLE, '', `You are the ${bench.bench} bench.`, '']
  if (bench.source_status === 'historical') {
    lines.push('Note on your source: the document these criteria come from is marked historical by its own header and is not current guidance. Its criteria are still the best available doctrine, so apply them, but do not treat them as settled authority.', '')
  }
  lines.push('Your criteria:', '')
  for (const c of bench.criteria) {
    lines.push(`## ${c.id}${c.blocking ? ' (blocking)' : ''}`)
    lines.push(`Source says: ${String(c.quote).replace(/\s+/g, ' ').trim()}`)
    lines.push(`Your test: ${String(c.test).replace(/\s+/g, ' ').trim()}`)
    lines.push('')
  }
  lines.push(`Valid clause ids (${clauseIds.size}). Cite one of these, or a file path from the diff:`)
  lines.push([...clauseIds].join('\n'))
  return lines.join('\n')
}

/**
 * Parse and refuse.
 *
 * Everything the model returns is checked before it is allowed to count. An
 * unknown criterion, an unknown verdict, or an ungrounded clause is dropped and
 * named, so a bench that drifts is visible rather than persuasive.
 */
export function parseFindings(raw, bench, clauseIds, diffFiles) {
  const problems = []
  let obj
  const text = String(raw || '').trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) return { findings: [], problems: ['the bench returned no JSON object at all'] }
  try { obj = JSON.parse(text.slice(start, end + 1)) }
  catch (e) { return { findings: [], problems: [`the bench returned unparseable JSON: ${e.message}`] } }

  const known = new Set(bench.criteria.map((c) => c.id))
  const blocking = new Set(bench.criteria.filter((c) => c.blocking).map((c) => c.id))
  const kept = []
  for (const f of Array.isArray(obj.findings) ? obj.findings : []) {
    if (!known.has(f.criterion_id)) { problems.push(`discarded a finding naming ${f.criterion_id}, which is not a criterion on the ${bench.bench} bench`); continue }
    if (!VERDICTS.has(f.verdict)) { problems.push(`discarded a ${f.criterion_id} finding with verdict "${f.verdict}"`); continue }
    const clause = String(f.clause || '').trim()
    // An empty clause is the case to get right. `p.startsWith('')` is true for
    // every path, so a permissive prefix match silently grounds a finding that
    // cites nothing at all, which is precisely the finding this panel exists to
    // refuse. Match a rule id exactly, or a diff path exactly or with a suffix
    // such as a line number, and never the other direction.
    const grounded = clause !== '' && (clauseIds.has(clause) || diffFiles.some((p) => clause === p || clause.startsWith(`${p}:`)))
    if (!grounded) { problems.push(`discarded a ${f.criterion_id} finding citing "${clause}", which is neither a rule id nor a file in the diff`); continue }
    if (String(f.because || '').includes(EM_DASH)) f.because = String(f.because).split(EM_DASH).join(', ')
    kept.push({ bench: bench.bench, criterion_id: f.criterion_id, verdict: f.verdict, clause, because: String(f.because || '').trim(), blocking: blocking.has(f.criterion_id) })
  }
  return { findings: kept, problems }
}

export const hasDissent = (findings) => findings.some((f) => f.verdict === 'regresses' || f.verdict === 'dissent')
export const blockingRegressions = (findings) => findings.filter((f) => f.verdict === 'regresses' && f.blocking)

/**
 * Run one bench, with the mandatory second attempt when it comes back unanimous.
 * `ask` is injected so the whole protocol is testable without a model.
 */
export async function runBench(name, { diff, diffFiles, clauseIds, ask }) {
  const bench = loadBench(name)
  const system = systemPrompt(bench, clauseIds)
  const first = await ask({ system, user: diff, bench: name, attempt: 1 })
  let { findings, problems } = parseFindings(first, bench, clauseIds, diffFiles)
  let unanimous = false
  if (findings.length && !hasDissent(findings)) {
    const retry = await ask({
      system, bench: name, attempt: 2,
      user: `${diff}\n\nYour previous review returned no regression and no dissent, and was rejected for that reason. Rule 3 is not optional. Return the review again, and this time include the strongest argument against this change that you can honestly construct, as a finding with verdict "dissent".`,
    })
    const second = parseFindings(retry, bench, clauseIds, diffFiles)
    problems = [...problems, ...second.problems]
    if (hasDissent(second.findings)) findings = second.findings
    else { findings = second.findings.length ? second.findings : findings; unanimous = true }
  }
  return { bench: name, findings, problems, unanimous }
}

// ------------------------------------------------------------------ reporting
export function render(results, { base, head }) {
  const p = []
  const all = results.flatMap((r) => r.findings)
  const blocked = blockingRegressions(all)
  p.push(`## Judge panel: \`${base}\` against \`${head}\``)
  p.push('')
  p.push(blocked.length
    ? `**${blocked.length} blocking regression${blocked.length === 1 ? '' : 's'}.** Each names the clause it regressed. Overrule with a commit body line \`Ruling (Krish, YYYY-MM-DD):\`, which the observer ledgers and which becomes that rule's new source.`
    : 'No blocking regression. Advisory findings and the mandatory dissent are below.')
  p.push('')
  for (const r of results) {
    p.push(`### ${r.bench} bench`)
    p.push('')
    if (r.unanimous) p.push('> `bench-unanimous`. This bench returned no regression and no dissent twice. A bench that agrees with everything is measuring nothing, so read this one yourself rather than trusting it.')
    if (!r.findings.length) { p.push('_Nothing returned._'); p.push(''); continue }
    p.push('| Criterion | Verdict | Clause | Why |')
    p.push('|---|---|---|---|')
    for (const f of r.findings.sort((a, b) => (a.verdict === 'regresses' ? -1 : 1))) {
      const v = f.verdict === 'regresses' && f.blocking ? '**regresses**' : f.verdict
      p.push(`| ${f.criterion_id} | ${v} | \`${f.clause}\` | ${f.because.replace(/\|/g, ' ')} |`)
    }
    p.push('')
    for (const m of r.problems) p.push(`- Discarded: ${m}`)
    if (r.problems.length) p.push('')
  }
  return p.join('\n').split(EM_DASH).join(', ')
}

// ---------------------------------------------------------------- the model
async function anthropic({ system, user }) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set, so no bench can run. This is the one part of the panel that cannot be faked.')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: process.env.JUDGE_MODEL || 'claude-opus-5',
      max_tokens: 4096,
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: user }],
    }),
  })
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const body = await res.json()
  return (body.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('')
}

// ---------------------------------------------------------------------- main
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const base = flag('--base') || 'main'
  const head = flag('--head') || 'HEAD'
  const diff = flag('--diff-file') ? readFileSync(flag('--diff-file'), 'utf8') : diffFor(base, head)

  if (!diff.trim()) {
    console.log(`No change to ${WATCHED.join(', ')} between ${base} and ${head}. The panel has nothing to compare and does not invent something to say.`)
    process.exit(0)
  }

  const diffFiles = [...new Set([...diff.matchAll(/^\+\+\+ b\/(.+)$/gm)].map((m) => m[1]))]
  const clauseIds = clauseUniverse()
  const results = []
  for (const name of BENCHES) {
    try { results.push(await runBench(name, { diff, diffFiles, clauseIds, ask: anthropic })) }
    catch (e) { console.error(`FAIL  ${name} bench: ${e.message}`); process.exit(2) }
  }

  const report = render(results, { base, head })
  const out = flag('--out')
  if (out) { mkdirSync(dirname(out), { recursive: true }); writeFileSync(out, report + '\n') }
  process.stdout.write(report + '\n')

  if (report.includes(EM_DASH)) { console.error('FAIL  the report carries an em dash after filtering'); process.exit(2) }

  const blocked = blockingRegressions(results.flatMap((r) => r.findings))
  process.exit(blocked.length ? 1 : 0)
}
