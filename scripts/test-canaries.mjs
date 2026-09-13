#!/usr/bin/env node

import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { parseYaml } from './lib/yaml.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const instrument = join(HARNESS, 'scripts/canaries.mjs')
const release = 'v2026.09.08.2'
const scratch = mkdtempSync(join(tmpdir(), 'ai-harness-canary-test-'))

const run = (args) => spawnSync(process.execPath, [instrument, ...args, '--release', release], {
  cwd: HARNESS,
  encoding: 'utf8',
})

const check = (condition, message) => {
  if (!condition) throw new Error(message)
}

try {
  const sheetRun = run(['--sheet-json'])
  check(sheetRun.status === 0, `sheet JSON exited ${sheetRun.status}: ${sheetRun.stderr}`)
  const sheet = JSON.parse(sheetRun.stdout)
  const registry = parseYaml(readFileSync(join(HARNESS, 'state/skill-registry.yaml'), 'utf8'))
  const declaredChanged = registry?.latest_approved_release?.changed_skills || []
  for (const skill of declaredChanged) {
    if (skill === 'krish-principles') {
      for (const adapter of ['adapters/claude/CLAUDE.md', 'adapters/codex/AGENTS.md', 'adapters/cursor/krish-core.mdc']) {
        check(readFileSync(join(HARNESS, adapter), 'utf8').includes('skills\\krish-principles\\SKILL.md'),
          `${adapter} lost its directly imported krish-principles invariant`)
      }
      continue
    }
    check(sheet.skills.includes(skill), `release sheet omitted declared changed skill ${skill}`)
  }
  check(sheet.skills.length >= 7, `expected at least 7 tier-one skills, got ${sheet.skills.length}`)
  check(!sheet.skills.includes('core'), 'sheet invented a non-invocable skill from the core trigger filename')
  check(!sheet.skills.includes('krish-principles'),
    'directly imported krish-principles must be checked as an adapter invariant, not as an invocation canary')
  for (const skill of ['strategy-brief', 'verification-loop']) {
    check(sheet.skills.includes(skill), `sheet omitted real core skill ${skill}`)
    check(sheet.cases.some((canary) => canary.skill === skill && canary.should_trigger),
      `sheet has no positive canary for real core skill ${skill}`)
  }
  for (const id of ['strategy-trigger-001', 'strategy-trigger-011', 'verification-trigger-001', 'verification-trigger-005']) {
    check(sheet.cases.some((canary) => canary.id === id), `sheet omitted pinned representative canary ${id}`)
  }
  check(!sheet.cases.some((canary) => ['strategy-trigger-006', 'strategy-trigger-025'].includes(canary.id)),
    'sheet selected a phase-ambiguous strategy canary instead of the pinned representatives')
  check(!sheet.cases.some((canary) => canary.role === 'positive' && /trigger-0(?:17|18|19|20|21)$/.test(canary.id)),
    'sheet selected an adversarial collision as an ordinary positive sentinel')

  const results = sheet.cases.map((canary) => {
    if (canary.should_trigger) return { id: canary.id, outcome: 'fired', note: `${canary.skill} loaded.` }
    if (canary.expected_route) {
      const route = Array.isArray(canary.expected_route) ? canary.expected_route[0] : String(canary.expected_route).split(/\s+or\s+/i)[0]
      return { id: canary.id, outcome: 'wrong-skill', note: `${route} loaded.` }
    }
    return { id: canary.id, outcome: 'not-fired', note: 'Nothing loaded.' }
  })

  const passing = {
    schema_version: 1,
    release,
    surface: 'canary-test-surface',
    client: 'test',
    ran_at: '2026-09-08',
    ran_by: 'scripts/test-canaries.mjs',
    asked_by: 'Harness regression suite fixture.',
    results,
  }
  const passingPath = join(scratch, 'passing.json')
  writeFileSync(passingPath, JSON.stringify(passing, null, 2) + '\n')
  const passRun = run(['--verify', passingPath])
  check(passRun.status === 0, `valid report exited ${passRun.status}: ${passRun.stderr}`)

  const failing = structuredClone(passing)
  const ordinaryNegative = sheet.cases.find((canary) => !canary.should_trigger && !canary.expected_route)
  failing.results.find((result) => result.id === ordinaryNegative.id).outcome = 'fired'
  const failingPath = join(scratch, 'failing.json')
  writeFileSync(failingPath, JSON.stringify(failing, null, 2) + '\n')
  const failRun = run(['--verify', failingPath])
  check(failRun.status === 1, `failing report exited ${failRun.status}, expected 1`)
  check(failRun.stderr.includes(ordinaryNegative.id), 'failing report did not name the incorrect canary')

  // The case SURFACE actually hit on 2026-09-08, and the one the suite did not
  // cover, which is why a semantic change to it passed the tests unchanged.
  //
  // A negative case asserts ONE thing: the target must not fire. It does not
  // assert that nothing fires. `VIDEO ENGINE!` correctly did not load
  // video-engine and did load other doctrine skills, which is the always-on set
  // behaving as designed, and the checker called that a containment failure.
  const otherSkillFired = structuredClone(passing)
  const on = otherSkillFired.results.find((result) => result.id === ordinaryNegative.id)
  const otherSkill = sheet.skills.find((skill) => skill !== ordinaryNegative.skill)
  on.outcome = 'wrong-skill'
  on.note = `${otherSkill} loaded, which is a different skill doing its job.`
  const otherPath = join(scratch, 'other-skill-fired.json')
  writeFileSync(otherPath, JSON.stringify(otherSkillFired, null, 2) + '\n')
  const otherRun = run(['--verify', otherPath])
  check(otherRun.status === 0, `a negative case where a DIFFERENT skill fired should pass, exited ${otherRun.status}: ${otherRun.stderr}`)

  // An expected route outside the canonical skill catalog cannot be observed
  // by this instrument. It proves target containment only and remains partial.
  const externalRouteCase = sheet.cases.find((canary) => canary.expected_route && String(canary.expected_route).includes('task system'))
  check(Boolean(externalRouteCase), 'sheet has no external-route case for the observability regression')
  const externalRoute = structuredClone(passing)
  const er = externalRoute.results.find((result) => result.id === externalRouteCase.id)
  er.outcome = 'wrong-skill'
  er.note = 'krish-principles loaded; the external task system is not observable.'
  const externalRoutePath = join(scratch, 'external-route.json')
  writeFileSync(externalRoutePath, JSON.stringify(externalRoute, null, 2) + '\n')
  const externalRouteRun = run(['--record', externalRoutePath, '--out-dir', join(scratch, 'external-route-record')])
  check(externalRouteRun.status === 0, `an external expected route should be partial, not failed: ${externalRouteRun.stderr}`)
  const externalRecorded = JSON.parse(readFileSync(join(scratch, 'external-route-record', `${release}-${externalRoute.surface}.json`), 'utf8'))
  check(externalRecorded.verdict === 'partial', `external route verdict was ${externalRecorded.verdict}, expected partial`)
  check(externalRecorded.unmeasured_routes.some((gap) => gap.id === externalRouteCase.id), 'external route gap was not retained in the report')

  // The other half of the same rule: naming the forbidden skill itself is still
  // a failure, however the outcome is labelled. Without this, "wrong-skill" is
  // an escape hatch that launders a containment breach into a pass.
  const namedTheTarget = structuredClone(passing)
  const nt = namedTheTarget.results.find((result) => result.id === ordinaryNegative.id)
  nt.outcome = 'wrong-skill'
  nt.note = `${ordinaryNegative.skill} loaded.`
  const namedPath = join(scratch, 'named-the-target.json')
  writeFileSync(namedPath, JSON.stringify(namedTheTarget, null, 2) + '\n')
  const namedRun = run(['--verify', namedPath])
  check(namedRun.status === 1, `wrong-skill naming the forbidden skill should fail, exited ${namedRun.status}`)
  check(namedRun.stderr.includes(ordinaryNegative.id), 'the named-the-target failure did not name the canary')

  // A POSITIVE coming back not-fired is the single most important failure this
  // instrument detects, and it was not covered: the only flipped case was a
  // negative. A verifier that had lost its positive handling entirely would
  // have passed the suite.
  const positiveCase = sheet.cases.find((canary) => canary.should_trigger)
  const deadPositive = structuredClone(passing)
  deadPositive.results.find((result) => result.id === positiveCase.id).outcome = 'not-fired'
  const deadPositivePath = join(scratch, 'dead-positive.json')
  writeFileSync(deadPositivePath, JSON.stringify(deadPositive, null, 2) + '\n')
  const deadPositiveRun = run(['--verify', deadPositivePath])
  check(deadPositiveRun.status === 1, `a positive returning not-fired must fail, exited ${deadPositiveRun.status}`)
  check(deadPositiveRun.stderr.includes(positiveCase.id), 'the dead-positive failure did not name the canary')

  // The 2026-09-08 SURFACE shape exactly: the positive is unreachable and the
  // negatives all "pass". The negatives must be voided and the skill reported
  // unmeasured. This is the rule the whole file exists for and nothing tested it.
  const unreachablePositive = structuredClone(passing)
  for (const result of unreachablePositive.results) {
    const canary = sheet.cases.find((x) => x.id === result.id)
    if (canary.skill !== positiveCase.skill) continue
    result.outcome = canary.should_trigger ? 'unreachable' : 'not-fired'
    result.note = canary.should_trigger ? 'absent from the client catalog' : 'nothing loaded'
  }
  const unreachablePath = join(scratch, 'unreachable-positive.json')
  writeFileSync(unreachablePath, JSON.stringify(unreachablePositive, null, 2) + '\n')
  const unreachableRun = run(['--verify', unreachablePath])
  check(unreachableRun.status === 1, `an unreachable positive must fail, exited ${unreachableRun.status}`)
  check(unreachableRun.stderr.includes('void') || unreachableRun.stdout.includes('Void'), 'the unreachable-positive run did not void the negatives')
  check(unreachableRun.stderr.includes('unmeasured'), 'the unreachable-positive run did not report the skill unmeasured')

  // A duplicated id is a malformed report, not a failing one, so exit 2.
  const duplicated = structuredClone(passing)
  duplicated.results.push(structuredClone(duplicated.results[0]))
  const duplicatedPath = join(scratch, 'duplicated.json')
  writeFileSync(duplicatedPath, JSON.stringify(duplicated, null, 2) + '\n')
  const duplicatedRun = run(['--verify', duplicatedPath])
  check(duplicatedRun.status === 2, `a duplicated id must be refused as malformed, exited ${duplicatedRun.status}`)

  // --record is the mode Invoke-HarnessSync.ps1 actually calls, and it was
  // never exercised. Check the round trip writes the verdict, since a recorded
  // failure that reads as a pass is the worst outcome this file can produce.
  const realLedger = join(HARNESS, 'brain/usage.jsonl')
  const beforeLedger = existsSync(realLedger) ? readFileSync(realLedger, 'utf8') : null
  const recordDir = join(scratch, 'record-root')
  const recordRun = run(['--record', deadPositivePath, '--out-dir', recordDir])
  check(recordRun.status === 1, `--record of a failing report must exit 1, exited ${recordRun.status}`)
  const written = join(recordDir, `${release}-${passing.surface}.json`)
  const recorded = JSON.parse(readFileSync(written, 'utf8'))
  check(recorded.verdict === 'failed', `recorded verdict was ${recorded.verdict}, expected failed`)
  check(Array.isArray(recorded.failures) && recorded.failures.length > 0, 'recorded file carried no failures')

  // The citation ledger must follow --out-dir. If it does not, this very test
  // writes fixture citations into the real brain/usage.jsonl, where a rule that
  // nothing has ever exercised reads as load bearing. That happened once, on
  // the run that added this check, and it put 46 invented rows in the ledger.
  const usageLedger = join(recordDir, 'brain-usage-root', 'brain', 'usage.jsonl')
  check(existsSync(usageLedger), 'the record path wrote no citation ledger under --out-dir')
  const cited = readFileSync(usageLedger, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l))
  check(cited.length > 0, 'a report with passing positives must record at least one citation')
  check(cited.every((r) => r.producer === 'canary' && r.verdict === 'fired'), 'every canary citation must be recorded as a fired positive')
  // A citation follows reachability, which is the same thing positivePassed
  // means everywhere else in this file: a skill with a passing positive was
  // reachable on that client, whatever else in the report failed. Killing ONE
  // of a skill's positives does not make it unreachable, so it still counts.
  //
  // The vacuity rule is what must hold, and the unreachable fixture is the one
  // that tests it: a skill whose positive could not fire records nothing, so a
  // rule is never credited by a void negative.
  const voidDir = join(scratch, 'unreachable-root')
  run(['--record', unreachablePath, '--out-dir', voidDir])
  const voidLedger = join(voidDir, 'brain-usage-root', 'brain', 'usage.jsonl')
  const voidCited = existsSync(voidLedger)
    ? readFileSync(voidLedger, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l))
    : []
  check(!voidCited.some((r) => r.rule_id.startsWith(`${positiveCase.skill}.`)),
    `${positiveCase.skill} was unreachable on that surface and must record no citation; a void negative is not evidence`)
  check((existsSync(realLedger) ? readFileSync(realLedger, 'utf8') : null) === beforeLedger,
    'the regression suite must never write into the real citation ledger')

  const incomplete = structuredClone(passing)
  const removed = incomplete.results.pop()
  const incompletePath = join(scratch, 'incomplete.json')
  writeFileSync(incompletePath, JSON.stringify(incomplete, null, 2) + '\n')
  const incompleteRun = run(['--verify', incompletePath])
  check(incompleteRun.status === 2, `incomplete report exited ${incompleteRun.status}, expected 2`)
  check(incompleteRun.stderr.includes(removed.id), 'incomplete report did not name the missing canary')

  console.log('Canary instrument regression tests passed.')
} finally {
  const expectedPrefix = join(tmpdir(), 'ai-harness-canary-test-')
  if (scratch.startsWith(expectedPrefix)) rmSync(scratch, { recursive: true, force: true })
}
