#!/usr/bin/env node

import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { importHarnessEvents, observationId, toObservation } from './import-harness-events.mjs'

let passed = 0
let failed = 0
const test = (name, condition) => {
  if (condition) passed += 1
  else failed += 1
  console.log(`${condition ? 'ok  ' : 'FAIL'}  ${name}`)
}

const event = {
  inbox_id: 1,
  event_id: 'codex:session:01J0000000000000',
  schema_version: 1,
  occurred_at: '2026-09-12T10:00:00.000Z',
  received_at: '2026-09-12T10:01:00.000Z',
  surface: 'codex',
  kind: 'explicit_correction',
  summary: 'Krish corrected the agent for treating a green job as a completed outcome.',
  evidence_ref: 'session:01J0000000000000#turn-18',
  related_skill_or_rule: 'krish-build.green-checkmark',
  outcome: 'corrected',
  severity: 'high',
  confidence: 'high',
  payload_sha256: 'a'.repeat(64),
}

const row = toObservation(event, '2026-09-12')
test('maps an explicit correction to the direct correction class', row.class === 'correction')
test('uses a stable non-source id', row.id === observationId(event.event_id) && row.id.length === 16)
test('keeps the opaque evidence reference without adding a transcript', row.evidence_ref === event.evidence_ref && !('transcript' in row))

let rejectedPrivate = false
try { toObservation({ ...event, evidence_ref: 'C:\\Users\\person\\session.json' }, '2026-09-12') } catch (error) { rejectedPrivate = error.message === 'private_shape_rejected' }
test('rejects a private machine path in exported evidence', rejectedPrivate)

const root = mkdtempSync(join(tmpdir(), 'harness-inbox-test-'))
const cursorPath = join(root, 'inbox-cursor.json')
let calls = 0
const fetchImpl = async () => {
  calls += 1
  return new Response(JSON.stringify({ ok: true, events: [event], next_cursor: 1, has_more: false }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}
const options = { baseUrl: 'https://example.invalid/api/harness/export', token: 'fixture-token', ledgerDir: root, cursorPath, fetchImpl, now: new Date('2026-09-12T12:00:00Z') }
const first = await importHarnessEvents(options)
const second = await importHarnessEvents(options)
const ledger = readFileSync(join(root, '2026-09.jsonl'), 'utf8').trim().split('\n')
test('imports one event and advances the cursor', first.imported === 1 && first.cursor === 1)
test('a repeated page is idempotent', second.imported === 0 && ledger.length === 1 && calls === 2)

const pagedRoot = mkdtempSync(join(tmpdir(), 'harness-inbox-paged-'))
let pageCalls = 0
const paged = await importHarnessEvents({
  ...options,
  ledgerDir: pagedRoot,
  cursorPath: join(pagedRoot, 'cursor.json'),
  fetchImpl: async () => {
    pageCalls += 1
    const nextEvent = { ...event, inbox_id: pageCalls, event_id: `codex:session:01J000000000000${pageCalls}`, payload_sha256: String(pageCalls).repeat(64) }
    return new Response(JSON.stringify({ ok: true, events: [nextEvent], next_cursor: pageCalls, has_more: pageCalls === 1 }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  },
})
test('follows bounded pagination without skipping events', paged.imported === 2 && paged.cursor === 2 && pageCalls === 2)

let rejectedHtml = false
try {
  await importHarnessEvents({ ...options, ledgerDir: mkdtempSync(join(tmpdir(), 'harness-inbox-html-')), cursorPath: join(root, 'html-cursor.json'), fetchImpl: async () => new Response('<html>error</html>', { status: 200, headers: { 'content-type': 'text/html' } }) })
} catch (error) {
  rejectedHtml = /content_type=text\/html/.test(error.message)
}
test('does not trust HTTP 200 with a non-JSON body', rejectedHtml)

console.log(`\n${failed === 0 ? 'HARNESS EVENT IMPORT OK' : 'HARNESS EVENT IMPORT FAILURES'}: ${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
