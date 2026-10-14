#!/usr/bin/env node
/**
 * Invariants of .github/workflows/harness-steward.yml that a YAML edit could
 * silently undo. Each one is a guarantee that failed once in production:
 *
 *   - the observer appended brain/proposals.jsonl on the runner and never
 *     committed it, so proposal outcomes stopped being recorded;
 *   - the judge treated an unmeasured run (a rejected key) as a pass, so canon
 *     changes merged green and unreviewed.
 *
 * Text checks on purpose: no YAML dependency, and the assertion names the line
 * a reader would look for.
 */

import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const yml = readFileSync(join(HARNESS, '.github/workflows/harness-steward.yml'), 'utf8')

let passed = 0
let failed = 0
const test = (name, condition) => {
  if (condition) passed += 1
  else failed += 1
  console.log(`${condition ? 'ok  ' : 'FAIL'}  ${name}`)
}

/** The text of one job, from its key to the next top-level job key. */
function job(text, name) {
  const start = text.search(new RegExp(`^  ${name}:\\s*$`, 'm'))
  if (start === -1) return ''
  const rest = text.slice(start + 1)
  const next = rest.search(/^  [a-z][a-z0-9-]*:\s*$/m)
  return next === -1 ? text.slice(start) : text.slice(start, start + 1 + next)
}

const observe = job(yml, 'observe')
const judge = job(yml, 'judge')
const surfaces = job(yml, 'surfaces')

test('the observer commits brain/proposals.jsonl', /git add [^\n]*brain\/proposals\.jsonl/.test(observe))
test('the observer detects untracked files before deciding there is nothing to commit', /git status --porcelain -- [^\n]*brain\/proposals\.jsonl/.test(observe))
test('the judge fails on an unmeasured run as well as a blocking one', /verdict == '2'/.test(judge) && /verdict == '1'/.test(judge))
test('the judge records a harness/judge status', /context="harness\/judge"/.test(judge) && /statuses: write/.test(judge))
test('a judge status reads measured only on exit 0', /0\) state=success; desc="measured/.test(judge) && !/\*\) state=success/.test(judge))
test('the observer suite runs on every push', /node scripts\/test-observe\.mjs/.test(surfaces))
test('this suite runs on every push', /node scripts\/test-steward-workflow\.mjs/.test(surfaces))
test('every pull request reports its always-on context change', /node scripts\/context-budget\.mjs --base/.test(surfaces))

const propose = job(yml, 'propose')
const housekeeping = job(yml, 'housekeeping')
const draftStep = propose.slice(propose.indexOf('- name: Draft change packages'), propose.indexOf('- name: Guard and open change requests'))
test('the propose job token is read-only', /permissions:\n      contents: read\n      pull-requests: read\n/.test(propose) && !/contents: write/.test(propose))
test('the propose checkout keeps no credentials', /persist-credentials: false/.test(propose))
test('the model may only read and write under changes/', /--allowedTools "Read,Glob,Grep,Write\(changes\/\*\*\),Edit\(changes\/\*\*\)"/.test(draftStep) && /--disallowedTools "Bash/.test(draftStep))
test('the model step never sees the fleet token', draftStep.length > 0 && !/FLEET_TOKEN/.test(draftStep))
test('only the guarded opening step holds the fleet token', propose.split('\n').filter((l) => /FLEET_TOKEN/.test(l)).length === 1 && /open-changes\.mjs/.test(propose))
test('housekeeping runs nightly and decides the digest', /node scripts\/steward-housekeeping\.mjs/.test(housekeeping) && /state\/digest/.test(housekeeping))
for (const t of ['test-change-guard', 'test-digest', 'test-process-review', 'test-redact', 'test-session-miner']) test(`${t} runs on every push`, new RegExp(`node scripts/${t}\\.mjs`).test(surfaces))

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) process.exit(1)
console.log('STEWARD WORKFLOW OK')
