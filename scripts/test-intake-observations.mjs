#!/usr/bin/env node
/**
 * The dispatch intake writes to a public ledger, so it must refuse anything the
 * importer would refuse, and more: a summary that still carries a name, path or
 * secret, an oversized batch, a malformed id. It must record a lesson once
 * however many times it arrives, and its command line must print counts only.
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { intake, MAX_EVENTS } from './intake-observations.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
let passed = 0
let failed = 0
const test = (name, condition) => {
  if (condition) passed += 1
  else failed += 1
  console.log(`${condition ? 'ok  ' : 'FAIL'}  ${name}`)
}

const now = new Date('2026-10-15T12:00:00Z')
const base = (i, over = {}) => ({ event_id: `session-miner:codex:${String(i).padStart(24, '0')}`, schema_version: 1, occurred_at: '2026-10-14T09:00:00Z', surface: 'codex', kind: 'preference', summary: `Wants a ten-row test before any full batch, case ${i}.`, evidence_ref: 'session:0123456789abcdef', related_skill_or_rule: null, outcome: 'unknown', severity: 'low', confidence: 'medium', ...over })

const dir = mkdtempSync(join(tmpdir(), 'intake-'))
const r = intake({ events: [base(1), base(2), base(1)] }, { ledgerDir: dir, now })
test('valid envelopes are accepted and a repeat inside one batch is recorded once', r.fresh.length === 2 && r.duplicates === 1)
writeFileSync(join(dir, '2026-10.jsonl'), r.fresh.map((x) => JSON.stringify(x)).join('\n') + '\n')
const again = intake({ events: [base(1), base(3)] }, { ledgerDir: dir, now })
test('a lesson already in the ledger is not recorded again', again.fresh.length === 1 && again.duplicates === 1)

const bad = intake({ events: [
  base(10, { event_id: 'short' }),
  base(11, { summary: 'Krish told Dana Whitlock to stop.' }),
  base(12, { summary: 'Never write to C:\\Users\\krish\\notes.txt again, please.' }),
  base(13, { kind: 'gossip' }),
  base(14, { surface: 'perplexity-lab' }),
  base(15, { summary: 'too short' }),
  base(16, { summary: `Use key ${['sk', 'ant', 'api03', 'q'.repeat(30)].join('-')} for the judge panel.` }),
  null,
] }, { ledgerDir: dir, now })
test('malformed ids, names, paths, secrets, unknown enums and short summaries are all refused', bad.fresh.length === 0 && Object.values(bad.rejected).reduce((a, b) => a + b, 0) === 8)
test('refusals are counted by reason', bad.rejected.invalid_event_id === 1 && bad.rejected.redaction_failed >= 2 && bad.rejected.invalid_kind === 1 && bad.rejected.invalid_surface === 1)

let threw = false
try { intake({ events: Array.from({ length: MAX_EVENTS + 1 }, (_, i) => base(i)) }, { ledgerDir: dir, now }) } catch { threw = true }
test('an oversized batch is refused whole', threw)
threw = false
try { intake({ events: 'nope' }, { ledgerDir: dir, now }) } catch { threw = true }
test('a payload without an events array is refused', threw)

const evDir = mkdtempSync(join(tmpdir(), 'intake-cli-'))
const eventPath = join(evDir, 'event.json')
writeFileSync(eventPath, JSON.stringify({ action: 'harness-observations', client_payload: { producer: 'session-miner', events: [base(40), base(41, { summary: 'Krish told Dana Whitlock to stop.' })] } }))
const stdout = execFileSync(process.execPath, [join(HARNESS, 'scripts/intake-observations.mjs'), '--file', eventPath, '--dry-run'], { encoding: 'utf8' })
test('the command line prints counts only, never a summary', /1 new, 0 already recorded, 1 refused/.test(stdout) && !/ten-row|Dana/.test(stdout))

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) process.exit(1)
console.log('OBSERVATION INTAKE OK')
