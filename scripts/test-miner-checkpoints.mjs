#!/usr/bin/env node
/** Exercise loss recovery and the actual receipt-bound intake, without network writes. */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { makeCloudCheckpoints, validateCloudCheckpoint, cloudCheckpointState, resumeCloudCursor, cloudSessionHash } from './lib/miner-checkpoint.mjs'
import { readCloudCheckpointState, verifyCloudCheckpoints, dispatchCloudCheckpoints, acknowledgePending, cloudCursor, toEnvelope } from './mine-sessions.mjs'
import { intake } from './intake-observations.mjs'

const dir = mkdtempSync(join(tmpdir(), 'miner-checkpoints-'))
try {
  const session = 'private-provider-session', event = 'private-provider-event', at = '2026-10-17T12:00:00Z'
  const envelope = toEnvelope({ kind: 'preference', summary: 'Retain the established decisions while changing one requested dimension.', severity: 'medium', confidence: 'high' }, { surface: 'claude-code-web', session, source_event_id: event, at })
  const cursor = { [session]: { at, ids: [event] } }
  const [checkpoint] = makeCloudCheckpoints(cursor, [envelope])
  const publicText = JSON.stringify(checkpoint)
  assert.ok(!publicText.includes(session) && !publicText.includes(event) && !publicText.includes(envelope.summary), 'Public progress contains neither provider identifiers nor content')
  assert.equal(validateCloudCheckpoint(checkpoint), checkpoint)
  assert.throws(() => validateCloudCheckpoint({ ...checkpoint, ignored: true }), /invalid_cloud_checkpoint/)
  assert.throws(() => validateCloudCheckpoint({ ...checkpoint, cursors: [{ ...checkpoint.cursors[0], at: 'later' }] }), /invalid_cloud_checkpoint_cursor/)
  assert.throws(() => validateCloudCheckpoint({ ...checkpoint, checkpoint_id: `checkpoint:${'f'.repeat(64)}` }), /content_mismatch/)
  const micro = '2026-10-18T14:19:02.645108Z'
  const [microCheckpoint] = makeCloudCheckpoints({ [session]: { at: micro, ids: [event] } }, [])
  assert.equal(validateCloudCheckpoint(microCheckpoint).cursors[0].at, micro, 'Cloud provider timestamps with microseconds are valid progress')
  assert.throws(() => validateCloudCheckpoint({ ...microCheckpoint, cursors: [{ ...microCheckpoint.cursors[0], at: '2026-10-18T14:19:02.6451089Z' }] }), /invalid_cloud_checkpoint_cursor/)
  const checkpointPath = join(dir, 'checkpoints.jsonl')
  assert.throws(() => intake({ producer: 'session-miner', events: [], checkpoint }, { ledgerDir: dir, checkpointPath }), /receipt_missing/, 'A dispatch acceptance cannot masquerade as storage acknowledgement')
  const row = intake({ events: [envelope] }, { ledgerDir: dir, checkpointPath }).fresh[0]
  writeFileSync(join(dir, '2026-10.jsonl'), JSON.stringify(row) + '\n')
  assert.equal(intake({ producer: 'session-miner', events: [], checkpoint }, { ledgerDir: dir, checkpointPath }).checkpoint.checkpoint_id, checkpoint.checkpoint_id)
  const [conflict] = makeCloudCheckpoints(cursor, [{ ...envelope, summary: 'A changed paraphrase is a different payload and cannot claim the old receipt.' }])
  assert.throws(() => intake({ producer: 'session-miner', events: [], checkpoint: conflict }, { ledgerDir: dir, checkpointPath }), /receipt_conflict/)
  writeFileSync(checkpointPath, publicText + '\n')
  assert.equal(intake({ producer: 'session-miner', events: [], checkpoint }, { ledgerDir: dir, checkpointPath }).checkpoint, null, 'A resend is idempotent')
  const durable = cloudCheckpointState(publicText + '\n')
  const turns = [{ session, at, source_event_id: event }, { session, at, source_event_id: 'later-page-event' }]
  const recovered = resumeCloudCursor(turns, {}, durable.cursors)
  assert.deepEqual(cloudCursor(turns, recovered).turns.map((turn) => turn.fresh), [false, true], 'Lost local state resumes durably and retains unseen equal-timestamp events')
  assert.equal(Object.keys(durable.cursors)[0], cloudSessionHash(session))
  const [older] = makeCloudCheckpoints({ [session]: { at: '2026-10-16T12:00:00Z', ids: ['older'] } }, [])
  assert.equal(cloudCheckpointState([publicText, JSON.stringify(older)].join('\n')).cursors[cloudSessionHash(session)].at, at, 'An older concurrent run cannot rewind progress')
  const [equal] = makeCloudCheckpoints({ [session]: { at, ids: ['later-page-event'] } }, [])
  assert.equal(cloudCheckpointState([publicText, JSON.stringify(equal)].join('\n')).cursors[cloudSessionHash(session)].ids.length, 2, 'Concurrent timestamp ties retain both event sets')
  const revision = 'a'.repeat(40), requested = []
  const run = (command, args) => {
    assert.equal(command, 'gh'); requested.push(args[1])
    if (args[1].endsWith('/git/ref/heads/main')) return JSON.stringify({ object: { sha: revision } })
    assert.ok(args[1].endsWith(`?ref=${revision}`), 'Readback uses a pinned revision')
    if (args[1].includes('/contents/state/observations?')) return JSON.stringify([{ name: '2026-10.jsonl' }])
    if (args[1].includes('/contents/state/observations/')) return JSON.stringify({ content: Buffer.from(JSON.stringify(row) + '\n').toString('base64') })
    return JSON.stringify({ encoding: 'base64', content: Buffer.from(publicText + '\n').toString('base64') })
  }
  assert.equal(readCloudCheckpointState({ run }).revision, revision)
  assert.equal(verifyCloudCheckpoints([checkpoint], { run }), true)
  assert.equal(verifyCloudCheckpoints([conflict], { run }), false)
  assert.throws(() => readCloudCheckpointState({ run: (command, args) => args[1].includes('/contents/state/observations/') ? JSON.stringify({ content: '' }) : run(command, args) }), /receipt_missing/, 'Recovery independently checks every checkpoint against the same pinned observation ledger')
  const sent = []
  dispatchCloudCheckpoints([checkpoint], { run: (command, args, options) => { assert.equal(command, 'gh'); assert.ok(Buffer.byteLength(options.input, 'utf8') <= 60000); sent.push(JSON.parse(options.input)) } })
  assert.equal(sent[0].client_payload.events.length, 0)
  assert.equal(sent[0].client_payload.checkpoint.checkpoint_id, checkpoint.checkpoint_id)
  const cursorPath = join(dir, 'cursor.json'), pendingPath = join(dir, 'pending.json'), pending = { envelopes: [envelope], next_cursor: cursor, checkpoints: [checkpoint] }
  writeFileSync(pendingPath, JSON.stringify(pending))
  assert.equal(acknowledgePending(pending, { cursorPath, pendingPath, verify: () => true, verifyCheckpoints: () => false }), false)
  assert.equal(existsSync(cursorPath), false, 'Lesson receipt alone cannot advance a cloud cursor')
  assert.ok(existsSync(pendingPath))
  assert.equal(acknowledgePending(pending, { cursorPath, pendingPath, verify: () => true, verifyCheckpoints: () => true }), true)
  assert.deepEqual(JSON.parse(readFileSync(cursorPath, 'utf8')), cursor)
  const [empty] = makeCloudCheckpoints(cursor, [])
  assert.equal(intake({ producer: 'session-miner', events: [], checkpoint: empty }, { ledgerDir: dir, checkpointPath }).checkpoint.receipts.length, 0, 'An explicit no-lesson interpretation still has durable progress')
  const many = Object.fromEntries(Array.from({ length: 450 }, (_, index) => [`session-${index}`, { at, ids: [`event-${index}`] }]))
  const chunks = makeCloudCheckpoints(many, [envelope])
  assert.equal(chunks.reduce((count, part) => count + part.cursors.length, 0), 450)
  assert.ok(chunks.every((part) => part.cursors.length <= 200 && Buffer.byteLength(JSON.stringify(part), 'utf8') <= 55000))
  // The hosted cloud worker runs Linux; portable helpers above also run in Windows CI.
  if (process.platform !== 'win32') {
  // Drive the real CLI failure path with an existing cursor; no authenticated API is called for this source.
  const cliState = join(dir, 'state'), source = join(dir, 'events.json'), fake = join(dir, 'fake-extractor')
  writeFileSync(source, JSON.stringify([{ role: 'user', text: 'No, never discard the earlier decisions when changing the title.', session: 'test', at }]))
  writeFileSync(fake, '#!/bin/sh\nprintf "%s\\n" "I cannot process this request."\n', { mode: 0o755 })
  mkdirSync(cliState)
  const existingCursor = '{"unchanged": 5}\n'
  writeFileSync(join(cliState, 'cursor-events-json.json'), existingCursor)
  const first = spawnSync(process.execPath, ['scripts/mine-sessions.mjs', '--source', 'events-json', '--path', source, '--state', cliState, '--dry-run'], { cwd: resolve(import.meta.dirname, '..'), env: { ...process.env, HARNESS_CLAUDE_CLI: fake }, encoding: 'utf8' })
  assert.equal(first.status, 1)
  assert.ok(/nothing was sent and the cursor did not move/.test(first.stderr))
  assert.equal(readFileSync(join(cliState, 'cursor-events-json.json'), 'utf8'), existingCursor)
  assert.equal(existsSync(join(cliState, 'plan-events-json.json')), false)
  // Run the actual cloud CLI against a local GitHub double: a fresh worker must not call the extractor again.
  const cloudInput = join(dir, 'cloud-input'), cloudState = join(dir, 'cloud-one'), freshState = join(dir, 'cloud-two'), bin = join(dir, 'bin')
  mkdirSync(cloudInput); mkdirSync(bin)
  const saved = join(dir, 'remote-checkpoints.jsonl'), extractionCount = join(dir, 'extractor-calls')
  const fakeGhPath = join(bin, 'gh'), emptyExtractor = join(dir, 'empty-extractor')
  writeFileSync(join(cloudInput, 'provider-tools.jsonl'), [
    { type: 'assistant', message: { content: [{ type: 'tool_use', id: 'fetch', name: 'list_events', input: { session_id: session } }] } },
    { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 'fetch', content: JSON.stringify({ ccr: { data: [{ created_at: at, user: { uuid: event, internal_anthropic_catchall: { message: { content: 'No, never discard established decisions during an iteration.' } } } }] } }) }] } },
  ].map((line) => JSON.stringify(line)).join('\n') + '\n')
  writeFileSync(fakeGhPath, `#!${process.execPath}
const fs = require('node:fs'); const args = process.argv.slice(2); const path = process.env.MINER_FAKE_REMOTE;
if (args.includes('POST')) { const body = JSON.parse(fs.readFileSync(0, 'utf8')); if (body.client_payload.checkpoint) fs.appendFileSync(path, JSON.stringify(body.client_payload.checkpoint) + '\\n'); process.exit(0); }
const endpoint = args[1];
if (endpoint.endsWith('/git/ref/heads/main')) { process.stdout.write(JSON.stringify({ object: { sha: 'a'.repeat(40) } })); process.exit(0); }
if (!fs.existsSync(path)) { process.stderr.write('HTTP 404: Not Found'); process.exit(1); }
process.stdout.write(JSON.stringify({ encoding: 'base64', content: fs.readFileSync(path).toString('base64') }));
`, { mode: 0o755 })
  writeFileSync(emptyExtractor, `#!${process.execPath}
require('node:fs').appendFileSync(process.env.MINER_FAKE_EXTRACT_COUNT, '1\\n'); process.stdout.write('[]');
`, { mode: 0o755 })
  const cloudEnv = { ...process.env, PATH: `${bin}:${process.env.PATH}`, HARNESS_CLAUDE_CLI: emptyExtractor, MINER_FAKE_REMOTE: saved, MINER_FAKE_EXTRACT_COUNT: extractionCount }
  const submitted = spawnSync(process.execPath, ['scripts/mine-sessions.mjs', '--source', 'cloud-events', '--path', cloudInput, '--state', cloudState, '--submit', 'dispatch'], { cwd: resolve(import.meta.dirname, '..'), env: cloudEnv, encoding: 'utf8' })
  assert.equal(submitted.status, 0, submitted.stderr)
  assert.ok(existsSync(join(cloudState, 'cursor-cloud-events.json')))
  assert.equal(cloudCheckpointState(readFileSync(saved, 'utf8')).checkpoints.size, 1)
  const beforeRestart = readFileSync(extractionCount, 'utf8')
  const resumed = spawnSync(process.execPath, ['scripts/mine-sessions.mjs', '--source', 'cloud-events', '--path', cloudInput, '--state', freshState, '--dry-run'], { cwd: resolve(import.meta.dirname, '..'), env: cloudEnv, encoding: 'utf8' })
  assert.equal(resumed.status, 0, resumed.stderr)
  assert.equal(readFileSync(extractionCount, 'utf8'), beforeRestart, 'The real fresh-worker CLI resumes from GitHub and does not reinterpret acknowledged events')
  assert.equal(existsSync(join(freshState, 'cursor-cloud-events.json')), false, 'Dry run never advances local progress')
  }
  console.log('MINER CHECKPOINTS OK: strict malformed-output failure, authenticated pinned readback, receipt-bound opaque resumption, no premature cursor advancement')
} finally { rmSync(dir, { recursive: true, force: true }) }
