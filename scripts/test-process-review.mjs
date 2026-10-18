#!/usr/bin/env node
/**
 * The process review proposes only policy edits, only when the scoreboard says
 * something is wrong, and is silent when it is healthy.
 */

import { mkdtempSync, readFileSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { diagnose, setPolicyValue, typeOfBranch, writePackage } from './process-review.mjs'
import { checkPackage } from './change-guard.mjs'
import { loadPolicy } from './propose.mjs'
import { parseYaml } from './lib/yaml.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
let passed = 0
let failed = 0
const test = (name, condition) => {
  if (condition) passed += 1
  else failed += 1
  console.log(`${condition ? 'ok  ' : 'FAIL'}  ${name}`)
}

const policy = loadPolicy()
const today = '2026-11-15'
const ev = (pr, type, event, at = '2026-11-01T00:00:00Z') => [{ kind: 'change', pr, event: 'opened', branch: `harness/change-2026-10-25-${type}-x${pr}`, at: '2026-10-25T00:00:00Z' }, { kind: 'change', pr, event, branch: `harness/change-2026-10-25-${type}-x${pr}`, at }]

test('typeOfBranch reads hyphenated types', typeOfBranch('harness/change-2026-10-25-ruling-cluster-agents-act') === 'ruling-cluster' && typeOfBranch('harness/change-2026-10-25-pattern-x') === 'pattern')
test('silent with no evidence', diagnose({ policy, today }) === null)
test('silent when acceptance is healthy', diagnose({ proposals: [...ev(1, 'pattern', 'merged'), ...ev(2, 'friction', 'merged'), ...ev(3, 'pattern', 'closed'), ...ev(4, 'consolidation', 'merged')], policy, today }) === null)

const low = diagnose({ proposals: [...ev(1, 'pattern', 'closed'), ...ev(2, 'friction', 'expired'), ...ev(3, 'pattern', 'closed'), ...ev(4, 'consolidation', 'merged')], policy, today })
test('low acceptance raises the ordinary threshold by one', low && low.edit.path === 'thresholds.ordinary' && low.edit.to === Number(policy.thresholds.ordinary) + 1)

const dead = diagnose({ proposals: [...ev(1, 'friction', 'closed', '2026-10-20T00:00:00Z'), ...ev(2, 'friction', 'expired', '2026-10-15T00:00:00Z'), ...ev(3, 'friction', 'closed', '2026-10-10T00:00:00Z'), ...ev(5, 'pattern', 'merged', '2026-09-20T00:00:00Z'), ...ev(6, 'pattern', 'merged', '2026-09-21T00:00:00Z')], policy, today })
test('a type that never earns a merge is retired', dead && dead.edit.path === 'disabled_types' && dead.edit.to.includes('friction'))

const drift = diagnose({ scoreboard: [{ week: '2026-W45', always_on_delta: 120 }, { week: '2026-W46', always_on_delta: 40 }], policy, today })
test('two weeks of always-on growth keep a second consolidation slot', drift && drift.edit.path === 'consolidation.slots' && drift.edit.to === 2)

const text = readFileSync(join(HARNESS, 'contract/learning-policy.yaml'), 'utf8')
const edited = setPolicyValue(text, 'thresholds.ordinary', 4)
test('setPolicyValue changes one line and keeps every other byte', edited.split('\n').filter((l, i) => l !== text.split('\n')[i]).length === 1 && parseYaml(edited).thresholds.ordinary === 4)
test('setPolicyValue writes an inline list', parseYaml(setPolicyValue(text, 'disabled_types', ['friction'])).disabled_types[0] === 'friction')

const dir = mkdtempSync(join(tmpdir(), 'process-review-'))
const pkg = writePackage(low, { dir, today })
const guard = checkPackage(pkg)
test('the package the review writes passes the change guard', guard.ok)
test('and it touches only the policy file', guard.files.length === 1 && guard.files[0].path === 'contract/learning-policy.yaml' && readdirSync(join(pkg, 'files')).length === 1)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) process.exit(1)
console.log('PROCESS REVIEW OK')
