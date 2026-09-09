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
 *   canary coverage        which skills a positive canary has actually fired on (Gate 2)
 *
 *   node scripts/audit-harness.mjs [--out <path>] [--strict]
 *
 * --strict exits non-zero on any finding. Without it the audit reports and
 * exits 0, because a finding is work to schedule, not a broken build.
 */

import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'

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

// ------------------------------------------- description budget, Gates 1 and 2
//
// Every trigger contract in this harness lives in description text. Codex
// reported on 2026-09-08: "Skill descriptions were shortened to fit the skills
// context budget." A truncated description is a silently rewritten contract, and
// the exclusions are the part most likely to be cut, because they come last.
//
// video-engine is the sharp case. Its description spends most of its length on
// what must NOT trigger it: terminal punctuation, extra words, quoted mentions,
// later turns, the dollar form, and any ordinary request that merely mentions
// video. Truncate that and the narrow launcher becomes a wide one, on the client
// where truncation was actually observed. It held on 2026-09-08 and nothing
// guarantees it holds next time.
//
// No published budget exists, so this cannot check a real limit. What it can do
// is keep the total from growing unnoticed and name the skills carrying the most
// risk, so the answer to "did we get closer to the cliff this month" is a number.
{
  const lens = []
  for (const d of skillDirs) {
    const fm = (skillText[d] || '').match(/^---\n([\s\S]*?)\n---/)
    if (!fm) continue
    const m = fm[1].match(/description:\s*"([\s\S]*?)"\s*$/m) || fm[1].match(/description:\s*(.+)$/m)
    const desc = (m ? m[1] : '').replace(/\s+/g, ' ').trim()
    if (desc) lens.push({ name: d, len: desc.length, negated: /\bnever\b|\bmust not\b|\bdo not\b|\bnot\b/i.test(desc) })
  }
  const total = lens.reduce((s, r) => s + r.len, 0)
  // The router block measured 5,991 tokens on 2026-09-08 against Codex's
  // unpublished budget. Recorded as the observation it is, not as a limit.
  N(`Skill descriptions total ${total.toLocaleString()} characters across ${lens.length} skills, longest ${Math.max(...lens.map((r) => r.len))}. Codex reports shortening these to fit its context budget, so the total is the exposure.`)
  for (const r of lens.filter((r) => r.len > 900 && r.negated).sort((a, b) => b.len - a.len)) {
    F('description-budget', r.name, `Its description is ${r.len} characters and carries negative trigger conditions, on a client that reports shortening descriptions to fit a context budget. Exclusions sit at the end of a description and are what a truncation removes first.`, 'Shorten it, or move the exclusions ahead of the elaboration so a cut removes detail rather than the contract. A trigger that only holds while the text survives intact is not enforced.')
  }
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

// ---------------------------------------------------- canary coverage, Gate 2
//
// Gate 2 used to be answered by scripts/eval.mjs: 613 cases against the API,
// precision and recall per skill. Krish retired it on 2026-09-08 after two
// controls showed the apparatus was a larger variable than the skills, and
// after four canaries on two Windows hosts found in an hour what 613 automated
// cases had missed over two days, including a launcher that could not launch.
//
// So the evidence is now what a real client did on a real surface, and this
// section reads state/canaries/ instead of state/evals/. The doctrine is in
// contract/canary-contract.md and the mechanism is scripts/canaries.mjs.
//
// The one rule that decides everything: a negative result is void on a surface
// where no positive passed, because a skill that cannot fire also cannot fire
// wrongly. So a skill's coverage counts only surfaces where a POSITIVE canary
// fired. That is why the count below is not simply "did we run something".
const canaryDir = join(HARNESS, 'state/canaries')
const canaryReports = existsSync(canaryDir)
  ? readdirSync(canaryDir).filter((f) => f.endsWith('.json')).map((f) => {
      try { return { file: f, ...JSON.parse(readFileSync(join(canaryDir, f), 'utf8')) } } catch { return null }
    }).filter(Boolean)
  : []

// A canary id carries its skill as the suite prefix, and the suite files are
// the authority for which is which. Built from the tree rather than parsed out
// of the id, so a renamed suite cannot silently orphan its evidence.
const idToSkill = new Map()
for (const f of readdirSync(join(HARNESS, 'evals')).filter((x) => /-trigger-cases\.jsonl$/.test(x))) {
  const skill = f.replace(/-trigger-cases\.jsonl$/, '')
  for (const line of readFileSync(join(HARNESS, 'evals', f), 'utf8').split('\n')) {
    if (!line.trim()) continue
    try { const c = JSON.parse(line); if (c.id) idToSkill.set(c.id, { skill, positive: c.should_trigger === true }) } catch { /* a malformed line is not evidence */ }
  }
}

// skill -> Set of surfaces where a positive fired, and skill -> newest date
const provenOn = new Map()
const lastSeen = new Map()
const unreachableOn = new Map()
for (const r of canaryReports) {
  for (const res of r.results || []) {
    const meta = idToSkill.get(res.id)
    if (!meta) continue
    if (res.outcome === 'unreachable') {
      const key = `${meta.skill}\0${r.surface}\0${r.release}`
      const existing = unreachableOn.get(key)
      if (existing) existing.canaries++
      else unreachableOn.set(key, { skill: meta.skill, surface: r.surface, release: r.release, canaries: 1 })
    }
    if (!meta.positive || res.outcome !== 'fired') continue
    if (!provenOn.has(meta.skill)) provenOn.set(meta.skill, new Set())
    provenOn.get(meta.skill).add(r.surface)
    const d = String(r.ran_at || '').slice(0, 10)
    if (d && (!lastSeen.has(meta.skill) || lastSeen.get(meta.skill) < d)) lastSeen.set(meta.skill, d)
  }
}

// For a manual-only skill, `unreachable` on an IMPLICIT route is the contract
// holding, not a defect. design-intelligence-search sets
// allow_implicit_invocation: false and says "Manual-only ... Never trigger
// directly", so a client that cannot route to it is doing what it was told.
//
// The canary sheet now sends such a skill its EXPLICIT invocation as the
// load-bearing positive and inverts the implicit case into a containment test,
// so this exclusion is narrow: it suppresses the finding only where being
// unreachable IS the specification. If the explicit positive also comes back
// unreachable, provenOn stays empty and the uncanaried finding below says so.
const manualOnlySkills = new Set(skillDirs.filter((d) => {
  const adapter = join(HARNESS, 'skills', d, 'agents/openai.yaml')
  return existsSync(adapter) && /^\s*allow_implicit_invocation:\s*false\s*$/m.test(readFileSync(adapter, 'utf8'))
}))

// An unreachable skill is otherwise the sharpest finding this instrument can
// produce: the bytes are right and the client cannot see it. It is never a
// trigger declining.
for (const u of unreachableOn.values()) {
  if (manualOnlySkills.has(u.skill)) {
    N(`${u.skill} reported unreachable by ${u.canaries} implicit ${u.canaries === 1 ? 'canary' : 'canaries'} on ${u.surface}. That is its contract: it is manual-only and the client is correctly unable to route to it. Its explicit invocation is what proves it works.`)
    continue
  }
  F('unreachable-on-surface', `${u.skill} on ${u.surface}`, `${u.canaries} ${u.canaries === 1 ? 'canary' : 'canaries'} reported ${u.skill} unreachable on ${u.surface} at ${u.release}: the client could not see the skill at all.`, 'This is not a trigger declining. Check the adapter\'s allow_implicit_invocation and the installed catalog. Byte parity does not imply reachability, and only a positive canary can tell them apart.')
}

const CORE = new Set(['krish-principles', 'strategy-brief', 'verification-loop', 'take-the-brief'])
const neverProven = rows.map((r) => r.name).filter((n) => !provenOn.has(n))
if (neverProven.length) {
  const core = neverProven.filter((n) => CORE.has(n))
  F('uncanaried', 'coverage', `${neverProven.length} of ${rows.length} skills have never had a positive canary fire on any surface${core.length ? `, including ${core.length} core skill(s): ${core.join(', ')}` : ''}.`, 'Run `node scripts/canaries.mjs --sheet` and work the sheet on a machine, then `--record` the report. Coverage is expected to be partial; it is reported as a number rather than left as an impression, and absence is never read as health.')
}
for (const [skill, d] of lastSeen) {
  const age = days(d, today)
  if (age > 60) F('canary-stale', skill, `Its last passing positive canary was ${d}, ${age} days ago, on ${[...provenOn.get(skill)].join(', ')}.`, 'Re-run it. Gate 8 treats an expired measurement the way it treats an expired review.')
}
N(`${provenOn.size} of ${rows.length} skills have a positive canary that fired on at least one surface, across ${canaryReports.length} report(s) in state/canaries/.`)
if (!canaryReports.length) N('state/canaries/ is empty. Nothing about trigger behaviour is measured yet, which is the honest state after retiring the eval harness rather than a regression.')


// -------------------------------------------------------- the other clock
//
// Two clocks, each watching the other. The observer writes a heartbeat; this
// audit reads it and opens a finding when it has gone quiet. The three weekly
// Documentation Refresh Routines died by simply stopping, and nothing noticed
// for weeks, because nothing was watching them. A scheduled job with no
// watchdog is a scheduled job you will eventually stop trusting.
{
  // The clocks that are SUPPOSED to exist, named here rather than discovered.
  //
  // Until now this loop iterated whatever keys the file happened to contain, so
  // a clock that never started was invisible: no entry, no finding, silence
  // reading as health. That is the exact failure this watchdog exists to catch,
  // reproduced inside the watchdog. A writer that has never written once is a
  // worse outage than one that stopped, and it was the only kind that could not
  // be seen.
  //
  // session-feed is the second half of "two clocks, each watching the other".
  // It has never run. It would collect Claude Code session metadata, which is
  // the one learning-loop input reachable for laptop sessions as well as cloud
  // ones, and its heartbeat is what would let this audit fail loudly if the
  // feed went quiet. Creating it is a standing scheduled job in Krish's account
  // and is his call, not mine: three weekly Routines were disabled in September
  // precisely because they failed silently. So it is named and reported missing
  // rather than quietly added.
  const EXPECTED_CLOCKS = {
    'harness-sync-lorimer': 'the Windows Scheduled Task installed by scripts/Invoke-HarnessSync.ps1 on LORIMER',
    'harness-sync-surface': 'the Windows Scheduled Task installed by scripts/Invoke-HarnessSync.ps1 on SURFACE',
    observer: 'scripts/observe.mjs, nightly in harness-steward.yml',
    'session-feed': 'a scheduled Routine collecting Claude Code session metadata, never created',
    'openclaw-vps': 'the hourly heartbeat posted by scripts/vps-heartbeat.sh on the OpenClaw VPS, declared 2026-09-09',
  }
  const hbPath = join(HARNESS, 'state/heartbeats.json')
  if (!existsSync(hbPath)) {
    F('heartbeat', 'all clocks', 'state/heartbeats.json does not exist, so no scheduled job has ever reported in.', 'Run the observer. Until a heartbeat exists, nothing can tell a healthy system from a dead one.')
  } else {
    const hb = JSON.parse(readFileSync(hbPath, 'utf8'))
    for (const [who, where] of Object.entries(EXPECTED_CLOCKS)) {
      if (!(who in hb)) {
        F('heartbeat', who, `${who} is an expected clock with no entry in state/heartbeats.json, so it has never run once.`, `${where}. A writer that has never written is invisible to a watchdog that only reads the entries it finds, which is why the expected set is declared rather than discovered.`)
      }
    }
    for (const [who, beat] of Object.entries(hb)) {
      if (!beat || !beat.last_run) {
        F('heartbeat', who, `${who} has an entry in state/heartbeats.json with no last_run.`, 'Fix the writer, or remove the entry so it stops looking like a live clock.')
        continue
      }
      const age = Math.round((Date.now() - new Date(beat.last_run)) / 3600000)
      if (beat.status === 'blocked') F('heartbeat', who, `${who} last reported a blocked machine run at ${beat.last_run}.`, 'Read the machine evidence pull request. A current clock proves the task ran; it does not turn a refused install or failed canary into health.')
      if (age > 48) F('heartbeat', who, `${who} last ran ${beat.last_run}, ${age} hours ago, past the 48 hour limit.`, 'Check the workflow. A silent clock is the failure mode this watchdog exists for, so treat a stale heartbeat as an outage rather than as noise.')
      else N(`${who} heartbeat is ${age} hours old.`)
    }
  }
}

// ------------------------------------------------------------------- stores
// The brain is not the only memory, and pretending otherwise is how a second
// live rule set goes unnoticed for four months.
//
// brain/stores.yaml classifies every store that holds something memory shaped.
// This turns two of those classifications into standing findings: a store the
// brain says it feeds on that has gone quiet, and a store carrying content that
// belongs in the brain and has not been moved. Neither is fixed automatically.
// Migrating a store is a reading job with judgement in it, which is exactly the
// kind of thing this audit names and never performs.
{
  const p = join(HARNESS, 'brain/stores.yaml')
  if (!existsSync(p)) {
    F('stores', 'brain/stores.yaml', 'brain/stores.yaml does not exist, so nothing records which other memories exist or what is to become of them.', 'Restore it. The canon being well formed says nothing about whether it is the only memory.')
  } else {
    const doc = parseYaml(readFileSync(p, 'utf8'))
    const stores = doc.stores || []
    const days = (d) => Math.round((Date.now() - new Date(d)) / 86400000)
    for (const st of stores) {
      if (st.disposition === 'feed' && st.last_write && days(st.last_write) > 30) {
        F('store-dead', st.id, `${st.id} is declared an input the brain feeds on and has not been written since ${st.last_write}, ${days(st.last_write)} days ago.`, 'Either the thing that writes it is broken, or it is not really an input. Both are worth knowing; a silent input is indistinguishable from a healthy one.')
      }
      if (st.disposition === 'migrate') {
        const scale = st.active_rows ? `${st.active_rows} of ${st.rows} rows still marked active` : (st.rows ? `${st.rows} row(s)` : 'content')
        F('store-unmigrated', st.id, `${st.id} holds ${scale} that brain/stores.yaml says belongs in the brain, and it has not been moved.`, String(st.action || 'Triage it against brain/rules.yaml.').replace(/\s+/g, ' ').trim())
      }
    }
    N(`brain/stores.yaml classifies ${stores.length} stores: ${['canon', 'feed', 'migrate', 'retire', 'reference'].map((d) => `${stores.filter((x) => x.disposition === d).length} ${d}`).join(', ')}.`)
  }
}

// ------------------------------------------------------- reads and writes
// Every surface should both read from the brain and write back to it. A surface
// that only reads is a place where a ruling made in conversation is lost, which
// is the single largest hole in the loop: claude.ai chat is the biggest reader
// in the fleet and has never written one thing back.
{
  const fleetDoc = parseYaml(read('state/fleet.yaml'))
  const surfaces = fleetDoc.surface_contracts || []
  for (const s of surfaces) {
    if (!s.writes || s.writes === 'nothing') {
      F('surface-contract', s.id, `${s.id} reads from the brain and writes nothing back.`, String(s.gap || 'Give it a write path, or record why it cannot have one. Until then, anything decided on this surface is lost when the session ends.').replace(/\s+/g, ' ').trim())
    }
  }
  if (surfaces.length) N(`${surfaces.length} surfaces declare what they read and write.`)
}

// ------------------------------------------------------------- bench sources
// The two judge benches are built from documents that do not live in this
// repository: the memory doctrine is in a venture repo, the personal standard
// is a Google Sheet. A bench pointed at a document it cannot version silently
// changes underneath its own verdicts, so each is snapshotted under
// brain/benches/sources/ with its hash.
//
// This checks the snapshot against its own manifest. Comparing the snapshot
// against the LIVE document is a machine-side check: the Actions runner has no
// Drive access and no venture checkout, and it is not given either. So the
// runner proves the snapshot has not been tampered with, and a person refreshes
// it when the source moves.
{
  const manifestPath = join(HARNESS, 'brain/benches/sources/MANIFEST.yaml')
  if (!existsSync(manifestPath)) {
    if (existsSync(join(HARNESS, 'brain/benches'))) {
      F('bench-source', 'MANIFEST.yaml', 'brain/benches/sources/MANIFEST.yaml is missing, so no bench criterion can be traced to a versioned source.', 'Restore it. A criterion with no quotable, hashed source is an opinion.')
    }
  } else {
    const manifest = parseYaml(readFileSync(manifestPath, 'utf8'))
    for (const src of manifest.sources || []) {
      const file = join(HARNESS, 'brain/benches/sources', src.file)
      if (!existsSync(file)) {
        F('bench-source', src.id, `${src.file} is named in the manifest and does not exist.`, 'Restore the snapshot or remove the bench that cites it.')
        continue
      }
      const raw = readFileSync(file)
      const actual = createHash('sha256').update(raw).digest('hex')
      if (actual !== src.sha256) {
        F('bench-source-stale', src.id, `${src.file} hashes to ${actual.slice(0, 16)} but the manifest records ${String(src.sha256).slice(0, 16)}.`, 'A snapshot is a verbatim capture and is never edited. Either it was changed by hand, or a refresh landed without updating the manifest. Fix the manifest only if the new bytes are a genuine recapture.')
        continue
      }
      // The sheet states its own version in its own text. If the manifest
      // claims a version the file does not contain, one of them is lying.
      if (src.version && !raw.toString('utf8').includes(src.version)) {
        F('bench-source-stale', src.id, `The manifest records ${src.version}, and that string does not appear in ${src.file}.`, 'Recapture the source, or correct the manifest. A bench that cites a version its own snapshot does not carry cannot be checked by a reader.')
        continue
      }
      N(`bench source ${src.id} matches its manifest hash${src.status === 'historical' ? ', and is marked historical by its own header' : ''}.`)
    }
  }
}

// ------------------------------------------------------ did the change work
// The only check here that measures trajectory rather than hygiene.
//
// Every other class asks whether the canon is well formed today. This one asks
// whether last month's accepted change actually did anything, which is the
// question a system that claims to learn has to be able to answer about itself.
//
// A proposal that was merged and named a class of finding it would fix should
// make that finding go away. When it does not, either the change was never
// applied or it did not work, and both are worth saying out loud. Pull request
// 8 is the founding case: it proposed three routing-contract rows, merged with
// one file changed, and all three are still unrouted today.
//
// Blocks whose verdict was "nothing-changes" are excluded. Those deliberately
// declined to act, so the finding recurring is the gate working as designed and
// counting it here would bury the real signal in noise.
{
  const path = join(HARNESS, 'brain/proposals.jsonl')
  const rows = []
  if (existsSync(path)) {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      if (!line.trim()) continue
      try { rows.push(JSON.parse(line)) } catch { /* a malformed line is not a reason to stop the audit */ }
    }
  }
  // The ledger is append-only, so a later row amends an earlier one rather than
  // replacing it. What a merged proposal claimed to fix can therefore arrive in
  // its own row or in an amendment, and both have to be read.
  const merged = rows.filter((r) => r.event === 'merged')
  const amendments = rows.filter((r) => r.amends)
  let checked = 0
  for (const base of merged) {
    const m = { ...base }
    // amends is one id or several: a single amendment can carry a field that
    // several rows were missing, and forcing one row per amended id would mean
    // writing the same correction three times.
    const amends = (a) => (Array.isArray(a.amends) ? a.amends : [a.amends])
    for (const a of amendments.filter((a) => amends(a).includes(base.id))) Object.assign(m, { ...a, id: base.id, event: base.event })
    for (const a of m.addresses || []) {
      if (a.verdict === 'nothing-changes') continue
      checked++
      const still = (a.subjects || []).filter((sub) => findings.some((f) => f.klass === a.class && f.subject === sub))
      if (!still.length) { N(`proposal ${m.proposal} closed its ${a.class} findings.`); continue }
      const days = Math.round((Date.now() - new Date(m.at)) / 86400000)
      F('proposal-ineffective', `${m.proposal} (pull request ${m.pr})`,
        `Merged ${days} day(s) ago naming ${a.subjects.length} ${a.class} finding(s) it would fix. ${still.length} of them are still open: ${still.join(', ')}.`,
        `Read the proposal and decide which it is: the change was accepted but never applied, or it was applied and did not work. ${m.changed_files === 1 ? 'This one changed a single file, the proposal document itself, so nothing was ever applied.' : ''} Accepting a proposal and applying it are different events, and only the second one closes a finding.`)
    }
  }
  if (merged.length) N(`${merged.length} merged proposal(s) in brain/proposals.jsonl, ${checked} acted-on cluster(s) checked for recurrence.`)
}

// ------------------------------------------------------------------- em dash
// "No em dashes anywhere, even in code" is a standing rule, and it is one of
// the few voice rules a machine can check exactly. validate-surfaces.mjs makes
// it a hard failure for the contracts, the rendered adapters and brain/, which
// are the files the canon is built from. Everywhere else it is reported here
// instead of refused, on the precedent Krish set for loose files at a skills
// root on 2026-09-08: record what nothing has ever measured, and let a climbing
// number be visible rather than merely tolerated.
//
// Vendored third-party trees are excluded. They are not ours to rewrite, and
// the routing contract already suppresses the upstream they came from.
{
  const hits = []
  const walkFor = (rel) => {
    const abs = join(HARNESS, rel)
    if (!existsSync(abs)) return
    for (const e of readdirSync(abs)) {
      const next = `${rel}/${e}`
      if (statSync(join(HARNESS, next)).isDirectory()) { if (e !== 'vendor') walkFor(next); continue }
      if (!/\.md$/.test(e)) continue
      const text = readFileSync(join(HARNESS, next), 'utf8')
      text.split('\n').forEach((line, i) => { if (line.includes('\u2014')) hits.push(`${next}:${i + 1}`) })
    }
  }
  walkFor('skills')
  walkFor('docs/proposals')
  if (hits.length) {
    const files = [...new Set(hits.map((h) => h.split(':')[0]))]
    F('em-dash', `${hits.length} lines in ${files.length} files`,
      `The canon carries ${hits.length} em dashes outside the files the validator refuses on: ${files.slice(0, 12).join(', ')}${files.length > 12 ? ', and more' : ''}.`,
      'Replace each with the punctuation the sentence actually needs, one at a time, rather than a blanket substitution. This is content, so it belongs in its own change and not folded into an unrelated one.')
  } else N('no em dash in skills/ or docs/proposals/.')
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
