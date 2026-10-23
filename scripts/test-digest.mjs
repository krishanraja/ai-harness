#!/usr/bin/env node
/**
 * The digest stays silent unless only Krish can act, speaks at most once a week,
 * and asks at most the decision budget. Housekeeping marks a change ready only
 * when it was measured. No network: the board call is stubbed.
 */

import { buildDigest, boardItem, confirmBoard, writeDigest, pendingDigest, lastSent, deliverPending, verifyPublishedPending } from './digest.mjs'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { decide, silentClocks, silentBlocker, blockedClocks, blockedBlocker, PC_REPAIR } from './steward-housekeeping.mjs'
import { loadPolicy } from './propose.mjs'

let passed = 0
let failed = 0
const test = (name, condition) => {
  if (condition) passed += 1
  else failed += 1
  console.log(`${condition ? 'ok  ' : 'FAIL'}  ${name}`)
}

const policy = loadPolicy()
const pr = (n, created = '2026-10-12T00:00:00Z') => ({ number: n, title: `Change request: change ${n}`, html_url: `https://github.com/krishanraja/ai-harness/pull/${n}`, created_at: created })

test('a week with nothing ready and nothing blocked is silent', buildDigest({ today: '2026-10-14', policy }) === null)
const one = buildDigest({ ready: [pr(130)], today: '2026-10-14', policy })
test('one ready change produces one decision', one && one.decisions.length === 1 && one.decisions[0].pr === 130)
test('a second run in the same ISO week is silent', buildDigest({ ready: [pr(130)], today: '2026-10-16', policy, lastSent: { week: one.week } }) === null)
test('the next week speaks again', buildDigest({ ready: [pr(130)], today: '2026-10-20', policy, lastSent: { week: one.week } }) !== null)
const many = buildDigest({ ready: [pr(1, '2026-10-13T00:00:00Z'), pr(2, '2026-10-10T00:00:00Z'), pr(3), pr(4), pr(5)], today: '2026-10-14', policy })
test('never more than the decision budget', many.decisions.length === Number(policy.decision_budget))
test('the oldest ready change is asked first', many.decisions[0].pr === 2)
const blocked = buildDigest({ blockers: [{ kind: 'credential', only_you: 'credential', title: 'Replace the judge panel key', detail: 'x' }], today: '2026-10-14', policy })
test('a blocker alone speaks, as a credential ask', blocked && blocked.only_you === 'credential' && /judge panel key/i.test(blocked.title))
test('the digest never carries an em dash', !(many.md + blocked.md).includes('\u2014'))

const item = boardItem(one, { date: '2026-10-14' })
test('the board item passes the Control Center gate shape', item.lane === 'on_you' && item.closes_on === 'his_word' && /^https:\/\//.test(item.link) && item.only_you === 'permission' && /^[a-z0-9][a-z0-9-]{1,79}$/.test(item.id))

const board = (items, status = 200) => async (_url, init) => {
  if (init?.method !== 'GET') throw new Error('the harness never writes the board')
  return new Response(JSON.stringify({ ok: true, items }), { status })
}
let seen = null
const r = await confirmBoard(item, { key: 'fixture-key', fetchImpl: async (url, init) => { seen = { url, init }; return board([item])(url, init) } })
test('delivery is confirmed by a bearer read of the board, never a write', r.sent && r.readback && seen.init.method === 'GET' && seen.init.headers.authorization === 'Bearer fixture-key' && seen.url.endsWith('/api/workbench'))
test('with no key delivery cannot be confirmed and says why', (await confirmBoard(item, { key: '' })).sent === false)
const waiting = await confirmBoard(item, { key: 'k', fetchImpl: board([]) })
test('an item Control Center has not written yet is awaited, not an error', waiting.sent === false && waiting.awaiting === true)
const closed = await confirmBoard(item, { key: 'k', fetchImpl: board([{ ...item, lane: 'done' }]) })
test('an item Krish already cleared is closed by him', closed.sent === false && closed.closed === true)
for (const [label, response] of [
  ['a success page instead of JSON', new Response('<html>secret fixture</html>')],
  ['a body without an items list', new Response('{"ok":true}')],
  ['a failed read', new Response('nope', { status: 500 })],
]) {
  let refused = false
  try { await confirmBoard(item, { key: 'fixture-key', fetchImpl: async () => response }) } catch { refused = true }
  test(`${label} never proves delivery`, refused)
}
let mismatchRefused = false
try { await confirmBoard(item, { key: 'fixture-key', fetchImpl: board([{ ...item, area: 'wrong' }]) }) } catch { mismatchRefused = true }
test('readback checks every item-owned field', mismatchRefused)
const digestRoot = mkdtempSync(join(tmpdir(), 'harness-digest-'))
try {
  writeDigest(one, digestRoot)
  const pending = pendingDigest(digestRoot)
  test('preparation is pending and never a sent receipt', pending.delivery.status === 'pending' && lastSent(digestRoot) === null)
  let boardCalls = 0
  try { await deliverPending({ root: digestRoot, verifyDurable: async () => false, key: 'fixture-key', fetchImpl: async () => { boardCalls++; return new Response('{}') } }) } catch {}
  test('an uncommitted pending item cannot be sent', boardCalls === 0 && pendingDigest(digestRoot).delivery.status === 'pending')
  const publishedFetch = async () => new Response(JSON.stringify({ encoding: 'base64', content: Buffer.from(JSON.stringify(pending)).toString('base64') }))
  test('durability requires authoritative main readback of the exact pending payload', await verifyPublishedPending(pending, { token: 'fixture-key', fetchImpl: publishedFetch }))
  let durableMismatch = false
  try { await verifyPublishedPending({ ...pending, date: 'wrong' }, { token: 'fixture-key', fetchImpl: publishedFetch }) } catch { durableMismatch = true }
  test('a different main payload cannot authorize delivery', durableMismatch)
  const before = await deliverPending({ root: digestRoot, verifyDurable: async () => true, key: 'fixture-key', fetchImpl: board([]) })
  test('until Control Center writes it the exact durable pending item waits', before.awaiting === true && JSON.stringify(pendingDigest(digestRoot)) === JSON.stringify(pending) && lastSent(digestRoot) === null)
  await deliverPending({ root: digestRoot, verifyDurable: async () => true, key: 'fixture-key', fetchImpl: board([pending.delivery.item]) })
  test('once it is on the board, verified delivery is recorded', pendingDigest(digestRoot) === null && lastSent(digestRoot).delivery.readback === true)
  const repeat = await deliverPending({ root: digestRoot, verifyDurable: async () => { throw new Error('must not run') } })
  test('delivered item is not confirmed twice', repeat.reason === 'no_pending_digest')
  writeDigest(one, digestRoot)
  await deliverPending({ root: digestRoot, verifyDurable: async () => true, key: 'fixture-key', fetchImpl: board([{ ...pendingDigest(digestRoot).delivery.item, lane: 'done' }]) })
  test('an owner-closed item stays closed', lastSent(digestRoot).delivery.status === 'closed-by-owner' && pendingDigest(digestRoot) === null)
  const workflow = readFileSync('.github/workflows/harness-steward.yml', 'utf8')
  test('workflow commits pending state before the only delivery step', workflow.indexOf('name: Commit the digest') < workflow.indexOf('node scripts/digest.mjs --deliver-pending'))
  test('housekeeping has no immediate delivery path', !readFileSync('scripts/steward-housekeeping.mjs', 'utf8').includes('deliverPending'))
} finally { rmSync(digestRoot, { recursive: true, force: true }) }

// --------------------------------------------------------------- housekeeping
const today = '2026-10-20'
const green = { statuses: { 'harness/judge': 'success' }, runs: [{ name: 'validate', status: 'completed', conclusion: 'success' }, { name: 'judge', status: 'completed', conclusion: 'success' }] }
const change = (o) => ({ number: 140, draft: true, created_at: '2026-10-18T21:40:00Z', head: { ref: 'harness/change-2026-10-18-pattern-close-on-a-move', sha: 'abc' }, ...o })
test('an open proposal document is closed as superseded', decide({ head: { ref: 'harness/proposals-2026-09-28' }, created_at: '2026-09-28T00:00:00Z' }, null, { today, expiryDays: 14 }).action === 'close')
test('a measured, green draft is marked ready', decide(change(), green, { today, expiryDays: 14 }).action === 'mark-ready')
test('an unmeasured draft stays draft and becomes a blocker after a day', (() => { const d = decide(change(), { ...green, statuses: { 'harness/judge': 'error' } }, { today, expiryDays: 14 }); return d.action === 'none' && d.blocker === 'judge-unmeasured' })())
test('a draft with a running check waits', decide(change(), { ...green, runs: [{ name: 'validate', status: 'in_progress', conclusion: null }] }, { today, expiryDays: 14 }).action === 'none')
test('a draft with a failed check is never marked ready', decide(change(), { ...green, runs: [{ name: 'validate', status: 'completed', conclusion: 'failure' }] }, { today, expiryDays: 14 }).action === 'none')
test('a change request past expiry closes', decide(change({ created_at: '2026-10-01T00:00:00Z' }), green, { today, expiryDays: 14 }).action === 'close')
test('a pull request that is not the steward\'s is left alone', decide({ head: { ref: 'feature/x' }, created_at: '2026-10-01T00:00:00Z' }, null, { today, expiryDays: 14 }).action === 'none')
const scoped=change({head:{ref:'harness/repository-learning-example',sha:'abc'}})
test('a measured repository learning proposal reaches the same review queue',decide(scoped,green,{today,expiryDays:14}).action==='mark-ready')
test('repository learning digest explains the accepted-view delivery that follows a merge',buildDigest({ready:[{...pr(7),head:scoped.head}],today,policy}).md.includes('schedules checked repository delivery'))

const hb = { 'harness-sync-lorimer': { last_run: '2026-10-06T21:44:07Z', status: 'ok' }, 'harness-sync-surface': { last_run: '2026-10-06T21:55:19Z' }, 'openclaw-vps': { last_run: '2026-09-19T09:05:09Z', retiring: '2026-09-20' } }
const silent = silentClocks(hb, { now: new Date('2026-10-15T08:00:00Z'), limits: { 'harness-sync-lorimer': 3, 'openclaw-vps': 3 } })
test('a PC sync silent nine days is caught; a retiring clock and an unwatched one are not', silent.length === 1 && silent[0].clock === 'harness-sync-lorimer' && silent[0].since === '2026-10-06' && silent[0].days === 8)
test('a clock that beat yesterday is not silent', silentClocks(hb, { now: new Date('2026-10-07T09:00:00Z'), limits: { 'harness-sync-lorimer': 3 } }).length === 0)
const sb = silentBlocker(silent)
test('the silent-PC blocker names the clock, the date and the one-line fix', sb.title === 'Your PC stopped checking in' && sb.detail.includes('2026-10-06') && sb.detail.includes(PC_REPAIR) && silentBlocker([]) === null)
test('the silent-PC blocker reaches the digest', buildDigest({ blockers: [sb], today: '2026-10-15', policy }).decisions[0].title === 'Your PC stopped checking in')

// A PC that runs every night but cannot install (LORIMER, 2026-10-16).
const once = { 'harness-sync-lorimer': { last_run: '2026-10-16T07:45:36Z', status: 'blocked', release: 'v2026.10.15.2' } }
test('one blocked run stays quiet, however long ago it was (the PC may simply be off)', blockedClocks(once, { limits: { 'harness-sync-lorimer': 2 } }).length === 0)
const twice = { 'harness-sync-lorimer': { last_run: '2026-10-16T22:31:00Z', status: 'blocked', release: 'v2026.10.15.2', reason: 'checkout-untracked', failing_since: '2026-10-16T07:45:36Z', failing_runs: 2 } }
const stuck = blockedClocks(twice, { limits: { 'harness-sync-lorimer': 2 } })
test('two blocked runs in a row are caught with their reason', stuck.length === 1 && stuck[0].since === '2026-10-16' && stuck[0].runs === 2 && stuck[0].reason === 'checkout-untracked')
test('an ok clock is never blocked', blockedClocks({ 'harness-sync-lorimer': { last_run: '2026-10-17T22:31:00Z', status: 'ok', failing_runs: 5 } }, { limits: { 'harness-sync-lorimer': 2 } }).length === 0)
const bb = blockedBlocker(stuck)
test('the blocked-PC blocker says why in plain words, with the release and the one-line fix', bb.title === 'Your PC cannot install the latest release' && bb.detail.includes('files git does not track') && bb.detail.includes('v2026.10.15.2') && bb.detail.includes('2 runs in a row') && bb.detail.includes(PC_REPAIR) && !bb.detail.includes('checkout-untracked') && blockedBlocker([]) === null)
test('a span that changed reason says so instead of telling the latest as the only one', (() => { const s = blockedClocks({ 'harness-sync-lorimer': { status: 'blocked', reason: 'install-failed', failing_runs: 3, failing_since: '2026-10-16T07:45:36Z', reasons: [{ reason: 'checkout-untracked', since: '2026-10-16T07:45:36Z' }, { reason: 'install-failed', since: '2026-10-17T22:31:00Z' }] } }, { limits: { 'harness-sync-lorimer': 2 } }); const d = blockedBlocker(s).detail; return s[0].reason === 'install-failed' && d.includes('its latest run said the installer stopped part way') && d.includes('2 different reasons') })())
test('a latest run with no reason is not given an earlier run\'s word as its own', (() => { const s = blockedClocks({ 'harness-sync-lorimer': { status: 'blocked', failing_runs: 2, failing_since: '2026-10-16T07:45:36Z', reasons: [{ reason: 'checkout-untracked', since: '2026-10-16T07:45:36Z' }] } }, { limits: { 'harness-sync-lorimer': 2 } }); const d = blockedBlocker(s).detail; return s[0].reason === null && s[0].earlier === 'checkout-untracked' && d.includes('its latest run gave no reason; an earlier run in this span said the harness folder') })())
test('a reason nobody worded still reads as a sentence, and a missing run count is not invented', (() => { const d = blockedBlocker([{ clock: 'harness-sync-lorimer', since: '2026-10-16', reason: 'not-a-reason', release: 'unknown' }]).detail; return d.includes('could not name') && !/runs in a row/.test(d) })())
test('a date or run count that is not one never reaches the text', (() => { const d = blockedBlocker([{ clock: 'harness-sync-lorimer', since: '<b>x', runs: '2; rm', reason: 'other', release: 'v2026.10.15.2' }]).detail; return !d.includes('<b>') && !d.includes('2; rm') && d.includes('harness-sync-lorimer has been blocked on v2026.10.15.2') })())
test('a release that is not a release id never reaches the text', !blockedBlocker([{ clock: 'harness-sync-lorimer', since: '2026-10-16', runs: 2, reason: 'other', release: 'C:\\Users\\someone' }]).detail.includes('someone'))
test('the blocked-PC blocker reaches the digest', buildDigest({ blockers: [bb], today: '2026-10-17', policy }).decisions[0].title === 'Your PC cannot install the latest release')
test('the policy watches the PC for both silence and blocking', policy.guardian?.silent_days?.['harness-sync-lorimer'] > 0 && policy.guardian?.blocked_runs?.['harness-sync-lorimer'] >= 2)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) process.exit(1)
console.log('DIGEST OK')
