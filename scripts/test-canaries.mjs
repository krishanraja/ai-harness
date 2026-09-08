#!/usr/bin/env node

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

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
  check(sheet.cases.length === 25, `expected 25 cases, got ${sheet.cases.length}`)
  check(sheet.skills.length === 7, `expected 7 skills, got ${sheet.skills.length}`)

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
  on.outcome = 'wrong-skill'
  on.note = 'krish-principles loaded, which is the always-on doctrine set doing its job.'
  const otherPath = join(scratch, 'other-skill-fired.json')
  writeFileSync(otherPath, JSON.stringify(otherSkillFired, null, 2) + '\n')
  const otherRun = run(['--verify', otherPath])
  check(otherRun.status === 0, `a negative case where a DIFFERENT skill fired should pass, exited ${otherRun.status}: ${otherRun.stderr}`)

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
