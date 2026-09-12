#!/usr/bin/env node
/**
 * The canary instrument.
 *
 * This replaced scripts/eval.mjs on 2026-09-08. The doctrine is in
 * contract/canary-contract.md; this file is the mechanism.
 *
 * A canary is a message sent to a real client on a real surface in a fresh task.
 * Two things follow from that and shape everything here:
 *
 *   1. It costs a minute of a person's or an agent's attention, so the set must
 *      be small, chosen deterministically, and honest about what it skips.
 *   2. A negative canary passes for free on a surface where the skill cannot
 *      fire at all. SURFACE proved that on 2026-09-08: video-engine's two
 *      negatives passed while its positive failed, because the skill had been
 *      removed from the client's catalog. Every negative there was vacuous and
 *      read as health.
 *
 * So a negative result is VOID on a surface where no positive passed. That is
 * arithmetic, not judgement, and it is the single rule this instrument exists
 * to enforce.
 *
 * Note what --record does with a failure: it records it and exits non-zero. A
 * malformed report is refused and stored nowhere, because it is not evidence
 * about anything. A failing surface is the most valuable evidence this
 * instrument produces and is always kept.
 *
 *   node scripts/canaries.mjs --sheet [--release <id>] [--surface <id>] [--out <path>]
 *   node scripts/canaries.mjs --sheet-json [--release <id>]
 *   node scripts/canaries.mjs --verify <report.json>
 *   node scripts/canaries.mjs --record <report.json>
 *
 * --sheet   renders the canary sheet for a release: what to send, where, and
 *           what each outcome would mean. Deterministic, so the same release
 *           always produces the same sheet and a report can be checked against it.
 * --verify  checks a submitted report against the sheet and the vacuity rule.
 * --record  verifies, then writes it to state/canaries/ for the audit to read.
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'
import { appendUsage, ruleIds, ruleIdsForSkill } from './brain-usage.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const args = process.argv.slice(2)
const flag = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1] }

const registry = parseYaml(readFileSync(join(HARNESS, 'state/skill-registry.yaml'), 'utf8'))
const RELEASE = flag('--release') || registry?.latest_approved_release?.release_id || 'unreleased'

// ------------------------------------------------------------------ tiers
//
// Tier 1 is not "the important skills". It is the skills where a silent failure
// is expensive or where the trigger is narrow enough that it can break without
// looking broken. Every one of these is on the list because of something that
// actually happened, not because it felt significant.
const TIER1 = {
  'krish-principles': 'A core skill. If it stops firing, everything downstream loses the standard it is judged against, and nothing errors.',
  'strategy-brief': 'A core skill, same reason.',
  'verification-loop': 'A core skill, and the one that makes every other claim checkable.',
  'take-the-brief': 'A core skill, and the entry point most work arrives through.',
  'video-engine': 'The narrowest trigger in the set, and the one that shipped unable to launch on 2026-09-08 with byte-perfect parity.',
  'design-intelligence-search': 'Manual-only by contract. A skill that is supposed to never self-trigger is exactly the kind whose containment nothing notices breaking.',
  'mindmake-os': 'It carries operating doctrine, and on 2026-09-08 it shipped instructing a self-executing deletion and a direct push to another repository main.',
}

const suites = readdirSync(join(HARNESS, 'evals'))
  .filter((f) => /-trigger-cases\.jsonl$/.test(f))
  .map((f) => f.replace(/-trigger-cases\.jsonl$/, ''))

const casesFor = (skill) => {
  const p = join(HARNESS, 'evals', `${skill}-trigger-cases.jsonl`)
  if (!existsSync(p)) return []
  return readFileSync(p, 'utf8').split('\n').filter((l) => l.trim()).map((l) => {
    try { return JSON.parse(l) } catch { return null }
  }).filter(Boolean)
}

/**
 * Which skills changed in this release.
 *
 * Compared against the superseded release's recorded tree, not against git, so
 * this works from a clean checkout with no history and gives the same answer on
 * a machine as in the cloud.
 */
function changedSkills() {
  const prev = registry?.superseded_approved_release?.skills_tree_aggregate_sha256
  const cur = registry?.latest_approved_release?.skills_tree_aggregate_sha256
  // Without both aggregates there is nothing to compare, and guessing which
  // skills moved would put skills on the sheet for no reason. Say so instead.
  if (!prev || !cur) return { known: false, skills: [] }
  if (prev === cur) return { known: true, skills: [] }

  const declared = registry?.latest_approved_release?.changed_skills
  if (!Array.isArray(declared)) return { known: false, skills: [] }
  const skills = [...new Set(declared.map((name) => String(name).trim()).filter(Boolean))]
  const unknown = skills.filter((name) => !suites.includes(name))
  if (unknown.length) throw new Error(`Approved changed_skills have no trigger suite: ${unknown.join(', ')}`)
  return { known: true, skills }
}

/**
 * Deterministic rotation, so nothing waits forever and staleness is bounded.
 *
 * Seeded on the release id rather than on a date or a counter, so the same
 * release always renders the same sheet however many times it is rendered.
 */
function rotation(pool, n) {
  const seed = parseInt(createHash('sha256').update(RELEASE).digest('hex').slice(0, 8), 16)
  const sorted = [...pool].sort()
  const out = []
  for (let i = 0; i < Math.min(n, sorted.length); i++) out.push(sorted[(seed + i * 7) % sorted.length])
  return [...new Set(out)]
}

/**
 * Pick the canaries for one skill.
 *
 * At most four, and a positive is mandatory: a set with no positive cannot
 * produce evidence, only the appearance of it.
 */
/**
 * Is this skill invoked only by name, never by the client routing to it?
 *
 * It matters because an implicit positive canary for such a skill CANNOT pass,
 * and a canary that cannot pass is a check that reports failure forever while
 * measuring nothing. SURFACE hit exactly this on 2026-09-08: all four
 * design-intelligence-search canaries came back `unreachable` because the skill
 * is absent from the Codex catalog BY DESIGN, its adapter setting
 * allow_implicit_invocation: false and its description saying "Manual-only ...
 * Never trigger directly from a user's request".
 *
 * That is the skill working. Reporting it as a failure is the same defect as
 * the video-engine flag: a test whose passing condition the design forbids.
 */
function manualOnly(skill) {
  const adapter = join(HARNESS, 'skills', skill, 'agents/openai.yaml')
  if (!existsSync(adapter)) return null
  const text = readFileSync(adapter, 'utf8')
  if (!/^\s*allow_implicit_invocation:\s*false\s*$/m.test(text)) return null
  // The adapter's own default_prompt IS the explicit invocation. Using it means
  // the canary sends what the client would send, rather than a phrase invented
  // here that nothing else agrees with.
  const m = text.match(/^\s*default_prompt:\s*"([^"]+)"\s*$/m)
  return { prompt: m ? m[1] : null }
}

function pick(skill) {
  const all = casesFor(skill)
  const shortest = (a, b) => String(a.prompt || '').length - String(b.prompt || '').length
  const positives = all.filter((c) => c.should_trigger === true).sort(shortest)
  const collisions = all.filter((c) => c.category === 'adversarial_collision' && c.should_trigger !== true)
  const negatives = all.filter((c) => c.category === 'negative')

  const chosen = []
  const manual = manualOnly(skill)
  if (manual) {
    // One positive, and it is the EXPLICIT invocation. The trigger cases were
    // written for implicit routing and cannot fire this skill on any client
    // that honours its adapter, so selecting them would guarantee a failure
    // that says nothing.
    if (manual.prompt) {
      chosen.push({
        id: `${skill}-explicit-001`,
        prompt: manual.prompt,
        should_trigger: true,
        category: 'explicit',
        role: 'positive-explicit',
        load_bearing: true,
      })
    }
    // And one implicit positive, INVERTED: this skill must NOT be reachable by
    // routing. `unreachable` or `not-fired` is the pass. That is the actual
    // containment property, and it was never being tested before, because the
    // same case was being asserted the other way round.
    if (positives[0]) {
      chosen.push({
        ...positives[0],
        id: `${positives[0].id}`,
        should_trigger: false,
        role: 'containment',
        load_bearing: false,
        containment_note: 'Manual-only: routing to this skill implicitly is the failure, not the pass.',
      })
    }
  } else {
    // The canonical form first: the shortest positive is almost always the plain
    // way a person would actually ask.
    if (positives[0]) chosen.push({ ...positives[0], role: 'positive', load_bearing: true })
    // One more positive from the other end, to catch a trigger that only works
    // for the exact canonical phrasing.
    if (positives.length > 1) chosen.push({ ...positives[positives.length - 1], role: 'positive', load_bearing: true })
  }
  // The sharpest negative is a collision: another skill could plausibly claim it.
  const c = collisions.find((x) => x.expected_route || x.neighbor) || collisions[0]
  if (c) chosen.push({ ...c, role: 'collision', load_bearing: false })
  if (negatives[0]) chosen.push({ ...negatives[0], role: 'negative', load_bearing: false })
  return chosen
}

const changed = changedSkills()
const tier3 = rotation(suites.filter((s) => !(s in TIER1)), 3)
const selected = [...new Set([...Object.keys(TIER1).filter((s) => suites.includes(s)), ...changed.skills, ...tier3])]

// ------------------------------------------------------------------ the sheet
function sheetObject() {
  const cases = []
  for (const skill of selected) {
    for (const c of pick(skill)) {
      cases.push({
        id: c.id,
        skill,
        prompt: c.prompt,
        role: c.role,
        load_bearing: c.load_bearing,
        should_trigger: c.should_trigger === true,
        expected_route: c.expected_route || null,
      })
    }
  }
  return {
    schema_version: 1,
    release: RELEASE,
    skills: selected,
    cases,
  }
}

function sheet() {
  const out = []
  const p = (s = '') => out.push(s)
  p(`# Canary sheet: ${RELEASE}`)
  p()
  p('Send each message as the **first message in a fresh task**, on the surface named. Record what happened, not what should have happened.')
  p()
  p('Outcomes, and only these four: `fired`, `not-fired`, `wrong-skill` (name it), `unreachable` (absent from the catalog, or the client refused).')
  p()
  p('`not-fired` and `unreachable` look identical from the outside and mean opposite things. Collapsing them is how a launcher that could not launch passed three canaries on 2026-09-08. If a skill is missing from the catalog, that is `unreachable`.')
  p()
  p('**A negative result proves nothing on a surface where no positive passed.** A skill that cannot fire also cannot fire wrongly.')
  p()
  let n = 0
  for (const skill of selected) {
    const chosen = pick(skill)
    if (!chosen.length) continue
    const why = TIER1[skill] || (changed.skills.includes(skill) ? 'Its bytes changed in this release.' : 'On rotation this release, so coverage does not go permanently stale.')
    p(`## ${skill}`)
    p()
    p(`> ${why}`)
    p()
    p('| # | Send | Expect | Load-bearing |')
    p('|---|---|---|---|')
    for (const c of chosen) {
      n++
      const expect = c.should_trigger === true
        ? (c.role === 'positive-explicit' ? `\`fired\`, ${skill}. This is the EXPLICIT invocation, the only way a manual-only skill can be reached.` : `\`fired\`, ${skill}`)
        : c.role === 'containment'
          ? `\`unreachable\` or \`not-fired\`. ${skill} is manual-only, so the client routing to it here would be the failure.`
          : c.expected_route
            ? `not ${skill}; \`wrong-skill\` naming \`${c.expected_route}\` is the correct outcome here`
            : `not ${skill}. \`not-fired\` or \`wrong-skill\` naming any OTHER skill both pass; only ${skill} firing is a failure.`
      p(`| ${c.id} | \`${String(c.prompt).replace(/\|/g, '\\|').replace(/\n/g, ' ⏎ ')}\` | ${expect} | ${c.load_bearing ? '**yes**' : 'no'} |`)
    }
    p()
  }
  p('---')
  p()
  p(`${n} canaries across ${selected.length} skills, of ${suites.length} with cases. Coverage is deliberately partial; \`node scripts/audit-harness.mjs\` names what has never been canaried.`)
  p()
  p(`Report shape, one file per surface, to \`state/canaries/${RELEASE}-<surface-id>.json\`:`)
  p()
  p('```json')
  p(JSON.stringify({
    schema_version: 1,
    release: RELEASE,
    surface: 'codex-current',
    client: 'codex',
    ran_at: '2026-09-08',
    ran_by: 'Krish Raja',
    results: [{ id: 'video-engine-trigger-001', outcome: 'fired', note: 'Skill(video-engine) then 16 Bash calls.' }],
  }, null, 2))
  p('```')
  p()
  p('Then `node scripts/canaries.mjs --record <that file>`. A malformed report is refused and stored nowhere. A FAILING report is recorded, marked, and exits non-zero: a canary failure is the most valuable thing this produces and is never the thing that gets discarded.')
  return out.join('\n') + '\n'
}

// ----------------------------------------------------------------- verifying
const OUTCOMES = new Set(['fired', 'not-fired', 'wrong-skill', 'unreachable'])

function verify(reportPath) {
  const report = JSON.parse(readFileSync(reportPath, 'utf8'))
  const problems = []
  const notes = []

  if (report.schema_version !== 1) problems.push(`schema_version must be 1, got ${report.schema_version}.`)
  if (!report.surface) problems.push('No surface id. A canary result with no surface cannot be evidence about anything.')
  if (!report.release) problems.push('No release id.')
  if (report.release && report.release !== RELEASE) notes.push(`Report is for ${report.release}; the approved release is ${RELEASE}.`)

  const byId = new Map()
  for (const skill of selected) for (const c of pick(skill)) byId.set(c.id, { ...c, skill })

  const results = Array.isArray(report.results) ? report.results : []
  if (!results.length) problems.push('No results.')

  // Per skill: did a load-bearing positive actually pass on this surface?
  const positivePassed = new Set()
  const sawSkill = new Set()
  const seenIds = new Set()
  const outcomeFailures = []
  for (const r of results) {
    const c = byId.get(r.id)
    if (!c) { notes.push(`${r.id} is not on this release's sheet; recorded, not counted.`); continue }
    if (seenIds.has(r.id)) { problems.push(`${r.id} appears more than once.`); continue }
    seenIds.add(r.id)
    if (!OUTCOMES.has(r.outcome)) { problems.push(`${r.id} has outcome "${r.outcome}", which is not one of the four.`); continue }
    sawSkill.add(c.skill)
    if (c.load_bearing && c.should_trigger === true && r.outcome === 'fired') positivePassed.add(c.skill)

    if (c.should_trigger === true && r.outcome !== 'fired') {
      outcomeFailures.push(`${r.id}: expected ${c.skill} to fire, observed ${r.outcome}.`)
    } else if (c.should_trigger !== true && c.expected_route) {
      const routeValues = Array.isArray(c.expected_route) ? c.expected_route : [c.expected_route]
      const allowed = routeValues
        .flatMap((value) => String(value).split(/\s+or\s+|,/i))
        .map((x) => x.trim())
        .filter(Boolean)
      const named = String(r.note || '').toLowerCase()
      if (r.outcome !== 'wrong-skill' || !allowed.some((skill) => named.includes(skill.toLowerCase()))) {
        outcomeFailures.push(`${r.id}: expected wrong-skill naming one of ${allowed.join(', ')}, observed ${r.outcome}${r.note ? ` (${r.note})` : ''}.`)
      }
    } else if (c.should_trigger !== true) {
      // A negative case asserts ONE thing: the target skill must not fire. It
      // does not assert that nothing fires.
      //
      // The first version demanded `not-fired` here, and SURFACE reported four
      // "containment failures" against it on 2026-09-08: `VIDEO ENGINE!`
      // correctly did not load video-engine and did load other doctrine skills,
      // which is the always-on set behaving exactly as designed. The case was
      // passing and the checker called it a failure, which is the same shape as
      // every other defect corrected that day: a check that cannot be satisfied
      // by correct behaviour.
      //
      // So `wrong-skill` is a PASS, provided the skill it names is not the
      // target. `unreachable` is neither: the target did not fire, but for a
      // reason that says nothing about the trigger, and the vacuity rule below
      // already voids it.
      const named = String(r.note || '').toLowerCase()
      if (r.outcome === 'fired') {
        outcomeFailures.push(`${r.id}: ${c.skill} fired on a message that must not trigger it${r.note ? ` (${r.note})` : ''}.`)
      } else if (r.outcome === 'wrong-skill' && named.includes(c.skill.toLowerCase())) {
        outcomeFailures.push(`${r.id}: reported wrong-skill but the note names ${c.skill}, which is the skill this case forbids${r.note ? ` (${r.note})` : ''}.`)
      }
    }
  }

  const missing = [...byId.keys()].filter((id) => !seenIds.has(id))
  if (missing.length) problems.push(`Missing results for ${missing.join(', ')}.`)

  // The rule. A negative or collision result on a skill with no passing
  // positive is vacuous, and saying so is the whole point of this file.
  const vacuous = []
  for (const r of results) {
    const c = byId.get(r.id)
    if (!c || c.load_bearing) continue
    if (!positivePassed.has(c.skill)) vacuous.push({ id: r.id, skill: c.skill, outcome: r.outcome })
  }

  // A skill with no passing positive is a FAILING SURFACE, not a malformed
  // report, and the difference decides whether the evidence survives.
  //
  // The first version of this file pushed it into `problems`, which made
  // --record refuse the whole file. That would have thrown away the single most
  // valuable canary result this instrument has ever produced: SURFACE, 2026-09-08,
  // video-engine unreachable. A failure that cannot be recorded is a failure
  // nobody can act on later, which is the shape of the thing being replaced.
  //
  // So it is a failure, it is loud, it is recorded, and it exits non-zero.
  const failing = [...outcomeFailures]
  for (const skill of sawSkill) {
    if (!positivePassed.has(skill)) {
      const pos = results.filter((r) => byId.get(r.id)?.skill === skill && byId.get(r.id)?.should_trigger === true)
      const how = pos.length ? pos.map((r) => `${r.id} came back ${r.outcome}`).join(', ') : 'no positive was run at all'
      failing.push(`${skill}: no positive canary passed on ${report.surface} (${how}). Every negative result for ${skill} in this report is void, and ${skill} is unmeasured on this surface, not passing.`)
    }
  }

  const unreachable = results.filter((r) => r.outcome === 'unreachable')
  if (unreachable.length) {
    notes.push(`${unreachable.length} canaries reported unreachable. That is a skill the client cannot see, not a trigger declining: check the adapter's allow_implicit_invocation and the installed catalog before reading anything else in this report.`)
  }

  return { report, problems, failing, notes, vacuous, positivePassed: [...positivePassed], covered: [...sawSkill] }
}

// -------------------------------------------------------------------- run
if (args.includes('--sheet-json')) {
  process.stdout.write(JSON.stringify(sheetObject(), null, 2) + '\n')
} else if (args.includes('--sheet')) {
  const text = sheet()
  const out = flag('--out')
  if (out) { mkdirSync(join(out, '..'), { recursive: true }); writeFileSync(out, text) }
  else process.stdout.write(text)
} else if (args.includes('--verify') || args.includes('--record')) {
  const path = flag('--verify') || flag('--record')
  if (!path) { console.error('canaries: give it a report file.'); process.exit(2) }
  const v = verify(path)
  for (const n of v.notes) console.log(`note: ${n}`)
  if (v.vacuous.length) {
    console.log('')
    console.log('Void results, recorded and not counted:')
    for (const x of v.vacuous) console.log(`- ${x.id} (${x.skill}) came back ${x.outcome} with no passing positive for ${x.skill} on this surface.`)
  }
  // Malformed is refused and never recorded: a report that cannot be read is
  // not evidence about anything.
  if (v.problems.length) {
    console.error('')
    console.error('Canary report REFUSED as malformed, nothing recorded:')
    for (const p of v.problems) console.error(`- ${p}`)
    process.exit(2)
  }
  if (v.failing.length) {
    console.error('')
    console.error('CANARY FAILURE on this surface:')
    for (const f of v.failing) console.error(`- ${f}`)
  } else {
    console.log(`\nCanary report accepted: ${v.covered.length} skills exercised on ${v.report.surface}, ${v.positivePassed.length} with a passing positive.`)
  }
  if (args.includes('--record')) {
    // --out-dir exists for the regression suite. Without it the tests wrote a
    // report into the repository's own state/canaries and deleted it again,
    // which leaves a stray file behind on any failure. A stray file dirties the
    // working tree, and Invoke-HarnessSync.ps1 refuses to run on a dirty tree,
    // so a failed test run would have wedged the daily job on both machines.
    const dir = flag('--out-dir') || join(HARNESS, 'state/canaries')
    mkdirSync(dir, { recursive: true })
    const dest = join(dir, `${v.report.release}-${v.report.surface}.json`)
    // The verdict is written into the file so a reader of state/canaries/ can
    // never mistake a recorded failure for recorded success.
    writeFileSync(dest, JSON.stringify({
      ...v.report,
      verdict: v.failing.length ? 'failed' : 'passed',
      failures: v.failing,
      void_results: v.vacuous,
    }, null, 2) + '\n')
    console.log(`Recorded ${dest}${v.failing.length ? ' as a FAILURE' : ''}`)

    // A skill whose positive canary fired was reachable on a live client, which
    // is the only evidence this repository has that its chapters could actually
    // apply to anything. Recorded per chapter, so brain/usage.jsonl can answer
    // the question brain/rules.yaml cannot: which rules are load bearing.
    //
    // Only positives, and only the ones that passed. A negative result is void
    // on a surface where no positive passed, and a void result recorded as a
    // citation would be exactly the vacuous evidence this file exists to refuse.
    const ref = `${v.report.release}-${v.report.surface}`
    const rows = v.positivePassed.flatMap((skill) =>
      ruleIdsForSkill(skill).map((rule_id) => ({ rule_id, producer: 'canary', ref, verdict: 'fired' })))
    // The citation ledger follows --out-dir for the same reason the recorded
    // report does. The regression suite drives this exact path with a fixture
    // surface, and without this the fixture's citations land in the real
    // brain/usage.jsonl, where they are indistinguishable from evidence. A
    // provenance ledger holding invented rows is worse than an empty one.
    const usageRoot = flag('--out-dir') ? join(flag('--out-dir'), 'brain-usage-root') : HARNESS
    const wrote = appendUsage(rows, { root: usageRoot, validIds: ruleIds() })
    if (wrote.length) console.log(`Recorded ${wrote.length} rule citation(s) in brain/usage.jsonl from ${v.positivePassed.length} passing positive(s).`)
  }
  if (v.failing.length) process.exit(1)
} else {
  console.error('canaries: --sheet, --sheet-json, --verify <report.json>, or --record <report.json>.')
  process.exit(2)
}
