#!/usr/bin/env node
/**
 * The canon is not exempt from the treatment it gives everyone else.
 *
 * This is the harness auditing itself against its own quality standard, every
 * night, and turning what it finds into findings rather than into silent edits.
 * The distinction matters and is written into the standard itself:
 * "Review-date expiry opens a finding; it does not silently rewrite a skill."
 * Nothing here writes to a skill. Ever.
 *
 * What it measures, and where the rule comes from:
 *
 *   registry vs tree       every skill has a row, every row has a skill
 *   freshness              reviewed + freshness_sla_days against today (Gate 8)
 *   main-file limit        SKILL.md under 500 lines (Gate 3)
 *   functional overlap     more than 20 percent between two skills (Gate 1)
 *   duplicate doctrine     the same paragraph in two skills (Gate 3)
 *   volatile facts         an absolute path or a hard-coded count in a skill (Gate 3)
 *   routing coverage       every production skill occupies a named route (Gate 1)
 *   surface parity         surface_deployments against the approved release (Gate 9)
 *   trigger accuracy       whether it has been measured at all (Gate 2)
 *
 *   node scripts/audit-harness.mjs [--out <path>] [--strict]
 *
 * --strict exits non-zero on any finding. Without it the audit reports and
 * exits 0, because a finding is work to schedule, not a broken build.
 */

import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'
import { ROUTER_PROMPT_SHA } from './lib/router-prompt.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const args = process.argv.slice(2)
const flag = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1] }
const strict = args.includes('--strict')
const today = flag('--today') || new Date().toISOString().slice(0, 10)

const read = (rel) => readFileSync(join(HARNESS, rel), 'utf8')
const registryText = read('state/skill-registry.yaml')
const registry = parseYaml(registryText)
const routing = read('contract/skill-routing-contract.md')

const findings = []
const notes = []
const F = (klass, subject, detail, action) => findings.push({ klass, subject, detail, action })
const N = (s) => notes.push(s)

// ------------------------------------------------------------ registry rows
// The registry stores skill rows as inline flow maps, which the reader keeps as
// strings. Parse them here rather than widening the reader for one shape.
const rowRe = /\{name:\s*([a-z0-9-]+),\s*role:\s*([a-z0-9-]+),\s*owner:\s*([^,]+),\s*reviewed:\s*(\d{4}-\d{2}-\d{2}),\s*freshness_sla_days:\s*(\d+)\}/g
const rows = [...registryText.matchAll(rowRe)].map((m) => ({
  name: m[1], role: m[2], owner: m[3].trim(), reviewed: m[4], sla: Number(m[5]),
}))

const skillDirs = readdirSync(join(HARNESS, 'skills'))
  .filter((d) => statSync(join(HARNESS, 'skills', d)).isDirectory())

// ------------------------------------------------------- registry vs the tree
const named = new Set(rows.map((r) => r.name))
for (const d of skillDirs) if (!named.has(d)) F('ungoverned', d, `skills/${d} exists in the tree with no row in state/skill-registry.yaml.`, 'Register it, or mark it external and say which surface owns it.')
for (const r of rows) if (!skillDirs.includes(r.name)) F('orphan-row', r.name, `state/skill-registry.yaml carries a row for ${r.name} with no skills/${r.name} directory.`, 'Remove the row, or restore the skill from the release it was cut from.')
N(`${skillDirs.length} skill directories, ${rows.length} registry rows.`)

// --------------------------------------------------------------- freshness
const days = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000)
const expired = rows
  .map((r) => ({ ...r, due: new Date(new Date(r.reviewed).getTime() + r.sla * 86400000).toISOString().slice(0, 10) }))
  .filter((r) => r.due < today)
  .sort((a, b) => a.due.localeCompare(b.due))
for (const r of expired) F('freshness', r.name, `Reviewed ${r.reviewed} with a ${r.sla} day SLA, so it was due ${r.due}, ${days(r.due, today)} days ago.`, 'Review it and move the date. Never move the date without reviewing it.')

// --------------------------------------------------- main file limit, Gate 3
const skillText = {}
for (const d of skillDirs) {
  const p = join('skills', d, 'SKILL.md')
  if (!existsSync(join(HARNESS, p))) { F('structure', d, `skills/${d} has no SKILL.md.`, 'Add one or retire the directory.'); continue }
  const t = read(p)
  skillText[d] = t
  const n = t.split('\n').length
  if (n > 500) F('main-file-limit', d, `SKILL.md is ${n} lines, over the 500 line limit in Gate 3.`, 'Move detail into a one-level reference and route to it explicitly.')
}

// ------------------------------------------------- functional overlap, Gate 1
// Shingled Jaccard on word 5-grams. Cheap, order-insensitive, and good enough
// to say "these two look like the same skill" without pretending to be a judge.
const shingle = (t) => {
  const w = t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
  const s = new Set()
  for (let i = 0; i + 5 <= w.length; i++) s.add(w.slice(i, i + 5).join(' '))
  return s
}
const shingles = Object.fromEntries(Object.entries(skillText).map(([k, v]) => [k, shingle(v)]))
const overlaps = []
const namesList = Object.keys(shingles)
for (let i = 0; i < namesList.length; i++) {
  for (let j = i + 1; j < namesList.length; j++) {
    const a = shingles[namesList[i]], b = shingles[namesList[j]]
    if (a.size < 40 || b.size < 40) continue
    let inter = 0
    for (const s of a) if (b.has(s)) inter++
    const jac = inter / (a.size + b.size - inter)
    if (jac > 0.2) overlaps.push({ a: namesList[i], b: namesList[j], pct: Math.round(jac * 100) })
  }
}
for (const o of overlaps.sort((x, y) => y.pct - x.pct)) F('overlap', `${o.a} + ${o.b}`, `Roughly ${o.pct} percent shared 5-gram content, over the 20 percent Gate 1 threshold.`, 'Consolidate, or state an explicit producer, validator or context distinction in both descriptions.')
N(`${overlaps.length} skill pairs over the 20 percent overlap threshold, measured on word 5-grams.`)

// ----------------------------------------------- duplicate doctrine, Gate 3
const paraOwners = new Map()
for (const [name, t] of Object.entries(skillText)) {
  for (const para of t.split(/\n\s*\n/)) {
    const p = para.trim().replace(/\s+/g, ' ')
    if (p.length < 120 || p.startsWith('#') || p.startsWith('|')) continue
    if (!paraOwners.has(p)) paraOwners.set(p, new Set())
    paraOwners.get(p).add(name)
  }
}
const dupes = [...paraOwners.entries()].filter(([, owners]) => owners.size > 1)
for (const [p, owners] of dupes.slice(0, 12)) F('duplicate-doctrine', [...owners].join(' + '), `The same paragraph appears in ${owners.size} skills: "${p.slice(0, 110)}..."`, 'Move the shared rule into contract/krish-operating-contract.md or a single owned skill, per Gate 3.')
if (dupes.length > 12) N(`${dupes.length - 12} further duplicate paragraphs not listed.`)
N(`${dupes.length} paragraphs of 120 characters or more appear in more than one skill.`)

// ------------------------------------------------------ volatile facts, Gate 3
const ABS = /[A-Z]:\\Users\\|[A-Z]:\\My Drive/
for (const [name, t] of Object.entries(skillText)) {
  const lines = t.split('\n')
  const hits = lines.map((l, i) => (ABS.test(l) ? i + 1 : 0)).filter(Boolean)
  if (hits.length) F('volatile-path', name, `skills/${name}/SKILL.md carries a machine-specific absolute path on ${hits.length === 1 ? `line ${hits[0]}` : `lines ${hits.slice(0, 6).join(', ')}${hits.length > 6 ? ' and more' : ''}`}.`, 'Replace it with a named root from contract/paths.yaml, resolved at render time.')
}

// ------------------------------- self-executing authority and volatile facts, Gates 3 and 5
//
// Added 2026-09-08 after the SURFACE machine job caught something this audit did
// not. It refused to install a new mindmake-os because the skill instructed
// deletion of any rediscovered copy and direct pushes to another repository's
// main, both irreversible external mutations that the operating contract
// reserves for explicit scoped approval, and because it embedded a cron
// schedule while claiming to carry no fact that can go stale.
//
// Structure and paths were all this audit checked. A skill can pass every
// structural gate and still tell an agent to delete something, so these three
// checks close that gap in the cloud rather than leaving it to one host.
// Precise on purpose, at the cost of missing some cases. The first draft of
// these checks flagged the word "cron" in a section-map row and krish-voice
// saying "drop subject pronouns", which is exactly the noise that teaches you
// to stop reading the report. A check that fires rarely and correctly is worth
// more than one that fires often and is usually wrong.

// A clock time with a zone, or a real cron expression. The bare words "cron",
// "weekly" or "each week" describe a thing; a time is the fact that goes stale.
const CLOCK = /\b\d{1,2}:\d{2}\s*(?:UTC|GMT|AEST|AEDT|Z)\b/
const CRON_EXPR = /(?:^|[\s`"'(])[\d*][\d*\/,-]*\s+[\d*][\d*\/,-]*\s+[\d*][\d*\/,-]*\s+[\d*][\d*\/,-]*\s+[\d*][\d*\/,-]*(?:[\s`"')]|$)/

// An imperative destructive verb whose object is a real resource, not prose.
const DESTRUCTIVE_IMPERATIVE = /^\s*(?:[-*]\s*|\d+\.\s*)?(delete|purge|wipe|uninstall|revoke)\b/i
const RESOURCE = /\b(file|files|copy|copies|directory|folder|repo|repository|branch|key|token|credential|secret|record|row|table|skill|mirror|snapshot|backup|them|it)\b/i
const HEDGED = /\b(approval|approve|ask|confirm|permission|explicit|gate|never|do not|don't|stop|report|only after|must not)\b/i

const NEVER_STALE = /\b(can never go stale|cannot go stale|never goes stale|no fact that can go stale|does not go stale)\b/i
const DIRECT_PUSH = /\bdirect push\b|\bpush (?:straight |directly )?to `?main`?\b/i

for (const [name, t] of Object.entries(skillText)) {
  t.split('\n').forEach((line, i) => {
    const at = `skills/${name}/SKILL.md:${i + 1}`
    const trimmed = line.trim()
    if (DESTRUCTIVE_IMPERATIVE.test(trimmed) && RESOURCE.test(trimmed) && !HEDGED.test(trimmed)) {
      F('self-executing-authority', name, `${at} instructs a destructive action on a resource with no approval gate: "${trimmed.slice(0, 120)}"`, 'The operating contract reserves deletion, uninstallation and revocation for explicit scoped approval. Say report and stop, or name the gate.')
    }
    if (DIRECT_PUSH.test(line)) F('self-executing-authority', name, `${at} instructs a direct push: "${trimmed.slice(0, 120)}"`, "Pushing straight to a branch is the owning repository's call to permit, not a skill's to instruct. Say pull request, and defer to that repository's own rules.")
    if (CLOCK.test(line) || CRON_EXPR.test(line)) F('volatile-fact', name, `${at} embeds a clock time or a cron expression: "${trimmed.slice(0, 120)}"`, 'Gate 3 forbids embedding a volatile schedule that can be retrieved live. Name where the schedule is defined instead of restating it.')
    if (NEVER_STALE.test(line)) F('self-refuting', name, `${at} claims it cannot go stale: "${trimmed.slice(0, 120)}"`, 'Anything carrying section numbers, repository names or dates can go stale. Say what would make it wrong instead of claiming nothing could.')
  })
}

// ------------------------------------------------------ routing coverage, Gate 1
for (const r of rows) {
  if (!routing.includes(`\`${r.name}\``)) F('unrouted', r.name, `${r.name} is in the registry but never named in contract/skill-routing-contract.md.`, 'Give it a named route, or move it out of the production set. A skill nothing routes to is a skill nothing runs.')
}

// ------------------------------------------- reachable triggers, Gates 1 and 2
//
// A skill's description declares when it should fire. agents/openai.yaml decides
// whether the client may fire it at all. Those two can disagree, and when they
// do the description wins on paper and the flag wins in production, so the skill
// silently does nothing.
//
// That is not hypothetical. video-engine declared "launch when the first message
// equals `Video engine`" while its adapter set allow_implicit_invocation: false,
// which on Codex removes the skill from the discoverable catalog. The positive
// half of its own contract was unreachable for a day and every negative test
// still passed, because a skill that cannot start also cannot start wrongly.
// SURFACE found it by sending the exact phrase. Nothing in the cloud did.
//
// The distinction the check makes is between a description that promises to fire
// on something the user says, and one that says it is invoked only by another
// skill or by name. design-intelligence-search is the second kind: "Manual-only
// ... Never trigger directly from a user's ... request". false is correct there.
const MANUAL_ONLY = /\bmanual[- ]only\b|\bonly when\b[^.]{0,80}\bexplicitly delegat|\bnever trigger directly\b|\binvoked only by\b/i
const POSITIVE_TRIGGER = /\b(use|launch|start|invoke|trigger|run)\b[^.]{0,120}\bwhen\b/i
for (const dir of skillDirs) {
  const adapterPath = join(HARNESS, 'skills', dir, 'agents/openai.yaml')
  if (!existsSync(adapterPath)) continue
  const adapter = readFileSync(adapterPath, 'utf8')
  if (!/^\s*allow_implicit_invocation:\s*false\s*$/m.test(adapter)) continue
  const desc = (skillText[dir] || '').match(/description:\s*"([^"]*)"/)?.[1] || ''
  if (MANUAL_ONLY.test(desc)) continue
  if (!POSITIVE_TRIGGER.test(desc)) continue
  F(
    'unreachable-trigger',
    dir,
    `${dir} declares a positive trigger in its description but its agents/openai.yaml sets allow_implicit_invocation: false, which stops the client firing it on anything the user says.`,
    'Either set the flag true and let the description carry the narrowness, or rewrite the description as manual-only. As it stands the skill cannot fire, and every negative trigger test passes for the wrong reason.',
  )
}

// -------------------------------------------------------- surface parity, Gate 9
const approved = registry?.latest_approved_release?.release_id
const surfaces = registry?.surface_deployments || {}
for (const [id, s] of Object.entries(surfaces)) {
  if (!s || typeof s !== 'object') continue
  const age = s.deployed_at ? days(s.deployed_at, today) : null
  if (s.release_id && approved && s.release_id !== approved) {
    F('surface-parity', id, `Installed ${s.release_id} while the approved release is ${approved}${age === null ? '' : `, last deployed ${s.deployed_at}, ${age} days ago`}.`, 'This surface pulls its own release. Until it reports back, the gap is evidence, not a broken pipeline.')
  } else if (age !== null && age > 30) {
    N(`${id}: on the approved release, but its last report is ${age} days old.`)
  }
}

// ------------------------------------------------------ trigger accuracy, Gate 2
//
// Gate 2 asks for precision and recall on a held-out suite: 100 percent for
// core skills, at least 95 percent for routed ones. The question is not whether
// a number is pretty, it is whether a number exists at all and whether it is
// where a reader would look for it.
const evidenced = new Set()
{
  const block = registryText.split(/^evaluation_evidence:\s*$/m)[1]
  if (block) {
    for (const line of block.split('\n')) {
      if (/^[a-z_]+:\s*$/.test(line)) break
      const m = line.match(/^  ([a-z0-9-]+):\s*$/)
      if (m) evidenced.add(m[1])
    }
  }
}
const loose = readdirSync(join(HARNESS, 'state'))
  .map((f) => (f.match(/^results-(.+?)-independent-\d{4}-\d{2}-\d{2}\.md$/) || [])[1])
  .filter(Boolean)
// state/evals/ is the machine-written half, added 2026-09-08. The audit reads
// the directory rather than only the registry, so a result written by
// scripts/eval.mjs can never again be produced and then orphaned, which is what
// happened to the nineteen loose files from 5 August.
const measured = new Map()
let latestRun = null
const evalsDir = join(HARNESS, 'state/evals')
if (existsSync(evalsDir)) {
  for (const f of readdirSync(evalsDir).filter((x) => x.endsWith('.json')).sort()) {
    try {
      const r = JSON.parse(readFileSync(join(evalsDir, f), 'utf8'))
      latestRun = { file: f, measured_at: r.measured_at, model: r.model, cases: r.cases_run, aborted: r.aborted }
      for (const [name, s] of Object.entries(r.by_skill || {})) measured.set(name, { ...s, run: f })
    } catch { W(`state/evals/${f} does not parse as JSON`) }
  }
}

const unevidenced = rows.filter((r) => !evidenced.has(r.name) && !measured.has(r.name))
if (unevidenced.length) {
  F('unevidenced', 'evaluation coverage',
    `${unevidenced.length} of ${rows.length} skills have no evaluation evidence anywhere: no evaluation_evidence row in state/skill-registry.yaml and no measurement in state/evals/. ${loose.length} per-skill result files sit in state/ as loose markdown from 2026-08-05 and were never folded in.`,
    'Run scripts/eval.mjs, which writes to state/evals/ where this audit reads it. A number in a file nobody reads is not a measurement.')
}

// An eval run whose own control says the instrument is unstable is not
// evidence, and must not close the coverage finding or be read as a statement
// about a skill. Checked before the Gate 2 bar is applied, because applying a
// bar to an invalid number is worse than having no number: it manufactures a
// verdict.
let instrumentValid = true
{
  const controls = existsSync(evalsDir)
    ? readdirSync(evalsDir).filter((f) => f.endsWith('.json')).map((f) => {
        try { return JSON.parse(readFileSync(join(evalsDir, f), 'utf8')) } catch { return null }
      }).filter((r) => r && r.control)
    : []
  const latest = controls.sort((a, b) => String(a.measured_at).localeCompare(String(b.measured_at))).pop()
  // The prompt the control was taken against, compared to the one in the tree.
  // Without this a control clears an instrument it never ran on: rewriting the
  // router prompt changes what is being measured and leaves every other field
  // in the file looking current. It fails closed. A control with no stamp
  // predates the stamp and cannot vouch for anything.
  const currentPrompt = ROUTER_PROMPT_SHA
  if (latest) {
    const d = Math.abs((latest.control.recall_a ?? 0) - (latest.control.recall_b ?? 0))
    const stamp = latest.router_prompt_sha256 || latest.control.router_prompt_sha256 || null
    if (d > 0.1) {
      instrumentValid = false
      F('instrument', 'trigger eval harness', `A control over ${latest.cases_run} identical cases moved recall by ${d.toFixed(3)} between ${latest.control.model_a} and ${latest.control.model_b}${latest.control.recall_b < latest.control.recall_a ? ', with the stronger model scoring lower' : ''}. The instrument is a larger variable than the subject, so no accuracy figure it produces describes a skill.`, 'Fix scripts/eval.mjs before reading any of its numbers as quality: a more capable model doing worse at a classification task is a prompt problem. Do not write these figures into the registry.')
    } else if (stamp !== currentPrompt) {
      instrumentValid = false
      F('instrument', 'trigger eval harness', `The most recent control passed at a recall delta of ${d.toFixed(3)}, but it was taken against router prompt ${stamp || 'an unstamped version'} while scripts/eval.mjs now sends ${currentPrompt}. It does not describe the current instrument.`, 'Run scripts/eval.mjs with --compare against the current prompt. A control cannot vouch for a prompt it never ran on, so accuracy stays unreported until it does.')
    } else {
      N(`Control: recall moved only ${d.toFixed(3)} between ${latest.control.model_a} and ${latest.control.model_b} on router prompt ${currentPrompt}, so the instrument is stable enough to read.`)
    }
  } else {
    N('No control run in state/evals yet, so no eval number has been validated as measuring the skills rather than the harness.')
  }
}

// Gate 2: 100 percent on core and always-on skills, at least 95 percent on
// routed ones, with no high-consequence false positive. Skipped entirely when
// the instrument has not been shown to be valid.
const CORE = new Set(['krish-principles', 'strategy-brief', 'verification-loop', 'take-the-brief'])
for (const [name, s] of instrumentValid ? measured : []) {
  const bar = CORE.has(name) ? 1 : 0.95
  if (s.accuracy !== null && s.accuracy < bar) {
    F('trigger-accuracy', name, `Measured accuracy ${s.accuracy} against a Gate 2 bar of ${bar} for ${CORE.has(name) ? 'a core' : 'a routed'} skill, over ${s.cases} cases (${s.run}).`, 'Tighten the description or the routing entry, then re-run. Lowering the bar to manufacture a pass is the one thing Gate 7 forbids outright.')
  }
  if (s.fp > 0 && CORE.has(name) === false && s.precision !== null && s.precision < 1) {
    N(`${name}: ${s.fp} false positive(s), precision ${s.precision}. Gate 2 forbids a high-consequence false positive; check whether any of these is one.`)
  }
}
if (latestRun) {
  const age = days(latestRun.measured_at.slice(0, 10), today)
  if (latestRun.aborted) F('eval-run', 'last evaluation run', `${latestRun.file} aborted: ${latestRun.aborted}`, 'Raise the cap or narrow the run, then re-run. A partial run scores only what it reached.')
  if (age > 35) F('eval-run', 'evaluation freshness', `The newest measurement in state/evals/ is ${latestRun.file}, ${age} days old.`, 'Gate 8 treats an expired measurement like an expired review. Re-run the suite.')
  N(`${measured.size} skills measured in ${latestRun.file} (${latestRun.cases} cases, ${latestRun.model}, ${age} days old).`)
} else {
  N('state/evals/ holds no run yet, so every trigger-accuracy number is still an assertion.')
}
N(`${evidenced.size} skills have evaluation_evidence in the registry; ${loose.length} more have loose result files in state/.`)

// -------------------------------------------------------- the other clock
//
// Two clocks, each watching the other. The observer writes a heartbeat; this
// audit reads it and opens a finding when it has gone quiet. The three weekly
// Documentation Refresh Routines died by simply stopping, and nothing noticed
// for weeks, because nothing was watching them. A scheduled job with no
// watchdog is a scheduled job you will eventually stop trusting.
{
  const hbPath = join(HARNESS, 'state/heartbeats.json')
  if (!existsSync(hbPath)) {
    N('state/heartbeats.json does not exist yet, so the observer has never run.')
  } else {
    const hb = JSON.parse(readFileSync(hbPath, 'utf8'))
    for (const [who, beat] of Object.entries(hb)) {
      if (!beat || !beat.last_run) {
        F('heartbeat', who, `${who} has an entry in state/heartbeats.json with no last_run.`, 'Fix the writer, or remove the entry so it stops looking like a live clock.')
        continue
      }
      const age = Math.round((Date.now() - new Date(beat.last_run)) / 3600000)
      if (age > 48) F('heartbeat', who, `${who} last ran ${beat.last_run}, ${age} hours ago, past the 48 hour limit.`, 'Check the workflow. A silent clock is the failure mode this watchdog exists for, so treat a stale heartbeat as an outage rather than as noise.')
      else N(`${who} heartbeat is ${age} hours old.`)
    }
  }
}

// --------------------------------------------------------------------- report
const out = []
const p = (s = '') => out.push(s)
p(`# Harness audit ${today}`)
p()
p(`Release \`${approved}\`, ${skillDirs.length} skills, ${findings.length} finding${findings.length === 1 ? '' : 's'}.`)
p()
p('Nothing in this report was fixed automatically. A finding is a decision for a person; a skill that rewrites the rule it is judged by is the failure this audit exists to prevent.')
p()
if (!findings.length) p('No findings.')
else {
  const byClass = {}
  for (const f of findings) (byClass[f.klass] = byClass[f.klass] || []).push(f)
  p('| Class | Count |')
  p('|---|---:|')
  for (const [k, v] of Object.entries(byClass).sort((a, b) => b[1].length - a[1].length)) p(`| ${k} | ${v.length} |`)
  p()
  for (const [k, v] of Object.entries(byClass)) {
    p(`## ${k}`)
    p()
    for (const f of v) { p(`**${f.subject}.** ${f.detail}`); p(); p(`> ${f.action}`); p() }
  }
}
p('## Measured, no finding')
p()
for (const n of notes) p(`- ${n}`)
p()

const text = out.join('\n') + '\n'
const outPath = flag('--out')
if (outPath) { mkdirSync(dirname(outPath), { recursive: true }); writeFileSync(outPath, text) }
process.stdout.write(text)
if (strict && findings.length) process.exit(1)
