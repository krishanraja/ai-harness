#!/usr/bin/env node
/**
 * The digest stays silent unless only Krish can act, speaks at most once a week,
 * and asks at most the decision budget. Housekeeping marks a change ready only
 * when it was measured. No network: the board call is stubbed.
 */

import { buildDigest, boardItem, sendBoard } from './digest.mjs'
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

let sentBody = null
const fakeFetch = async (url, init) => { sentBody = { url, init }; return new Response('{"ok":true}', { status: 200 }) }
const r = await sendBoard(item, { key: 'fixture-key', fetchImpl: fakeFetch })
test('the board write is an upsert from claude_code with a bearer key', r.sent && JSON.parse(sentBody.init.body).action === 'upsert_items' && JSON.parse(sentBody.init.body).client === 'claude_code' && sentBody.init.headers.authorization === 'Bearer fixture-key' && sentBody.url.endsWith('/api/workbench'))
test('with no key the board is skipped and says why', (await sendBoard(item, { key: '' })).sent === false)
const closed = await sendBoard(item, { key: 'k', fetchImpl: async () => new Response('{"error":"krish_closed_it"}', { status: 409 }) })
test('an item Krish already closed is not an error', closed.sent === false && /closed/.test(closed.reason))
let threw = false
try { await sendBoard(item, { key: 'k', fetchImpl: async () => new Response('nope', { status: 500 }) }) } catch { threw = true }
test('a failed board write is loud', threw)

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

const hb = { 'harness-sync-lorimer': { last_run: '2026-10-06T21:44:07Z', status: 'ok' }, 'harness-sync-surface': { last_run: '2026-10-06T21:55:19Z' }, 'openclaw-vps': { last_run: '2026-09-19T09:05:09Z', retiring: '2026-09-20' } }
const silent = silentClocks(hb, { now: new Date('2026-10-15T08:00:00Z'), limits: { 'harness-sync-lorimer': 3, 'openclaw-vps': 3 } })
test('a PC sync silent nine days is caught; a retiring clock and an unwatched one are not', silent.length === 1 && silent[0].clock === 'harness-sync-lorimer' && silent[0].since === '2026-10-06' && silent[0].days === 8)
test('a clock that beat yesterday is not silent', silentClocks(hb, { now: new Date('2026-10-07T09:00:00Z'), limits: { 'harness-sync-lorimer': 3 } }).length === 0)
const sb = silentBlocker(silent)
test('the silent-PC blocker names the clock, the date and the one-line fix', sb.title === 'Your PC stopped checking in' && sb.detail.includes('2026-10-06') && sb.detail.includes(PC_REPAIR) && silentBlocker([]) === null)
test('the silent-PC blocker reaches the digest', buildDigest({ blockers: [sb], today: '2026-10-15', policy }).decisions[0].title === 'Your PC stopped checking in')

// A PC that runs every night but cannot install (LORIMER, 2026-10-16).
const once = { 'harness-sync-lorimer': { last_run: '2026-10-16T07:45:36Z', status: 'blocked', release: 'v2026.10.15.2' } }
test('one blocked night stays quiet', blockedClocks(once, { now: new Date('2026-10-16T20:40:00Z'), limits: { 'harness-sync-lorimer': 1 } }).length === 0)
const twice = { 'harness-sync-lorimer': { last_run: '2026-10-16T22:31:00Z', status: 'blocked', release: 'v2026.10.15.2', reason: 'checkout-dirty', failing_since: '2026-10-16T07:45:36Z' } }
const stuck = blockedClocks(twice, { now: new Date('2026-10-17T20:40:00Z'), limits: { 'harness-sync-lorimer': 1 } })
test('two blocked nights in a row are caught with their reason', stuck.length === 1 && stuck[0].since === '2026-10-16' && stuck[0].reason === 'checkout-dirty')
test('an ok clock is never blocked', blockedClocks({ 'harness-sync-lorimer': { last_run: '2026-10-17T22:31:00Z', status: 'ok' } }, { now: new Date('2026-10-20T00:00:00Z'), limits: { 'harness-sync-lorimer': 1 } }).length === 0)
const bb = blockedBlocker(stuck)
test('the blocked-PC blocker says why in plain words, with the release and the one-line fix', bb.title === 'Your PC cannot install the latest release' && bb.detail.includes('edits nobody committed') && bb.detail.includes('v2026.10.15.2') && bb.detail.includes(PC_REPAIR) && !bb.detail.includes('checkout-dirty') && blockedBlocker([]) === null)
test('a reason nobody worded still reads as a sentence', blockedBlocker([{ clock: 'harness-sync-lorimer', since: '2026-10-16', reason: 'unrecognised', release: 'unknown' }]).detail.includes('could not name'))
test('the blocked-PC blocker reaches the digest', buildDigest({ blockers: [bb], today: '2026-10-17', policy }).decisions[0].title === 'Your PC cannot install the latest release')
test('the policy watches the PC for both silence and blocking', policy.guardian?.silent_days?.['harness-sync-lorimer'] > 0 && policy.guardian?.blocked_days?.['harness-sync-lorimer'] > 0)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) process.exit(1)
console.log('DIGEST OK')
