#!/usr/bin/env node
/** Notification preparation and retry fixtures. Never sends to a real work board. */
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { boardItem, buildDigest, deliverPending, incidentKey, lastSent, loadNotificationPolicy, pendingDigest, writeDigest } from './digest.mjs'

const defaults = loadNotificationPolicy()
const approved = { ...defaults, enabled: true, approval_ref: 'fixture-only-notification-approval' }
const today = '2026-10-18', policy = { decision_budget: 3 }
const blocker = (generation = 'a', extra = {}) => ({
  kind: 'source-access', title: 'Restore the required source connection', detail: 'The independently observed source receipt is unavailable; restore the existing authorized source access.', only_you: 'credential',
  incident: { id: 'required-source-one', generation_sha256: generation.repeat(64), state: 'active', actionable: true }, ...extra,
})
const build = (extra = {}) => buildDigest({ today, policy, blockers: [blocker()], notifications: approved, ...extra })
const ready = { number: 7, title: 'Ready change', html_url: 'https://github.com/krishanraja/ai-harness/pull/7', created_at: '2026-10-17T01:00:00.000Z' }
const weekly = buildDigest({ today, policy, ready: [ready] })

assert.equal(defaults.enabled, false)
assert.equal(defaults.approval_ref, null)
assert.equal(build({ notifications: defaults }), null, 'New incident messages stay disabled by default')
assert.throws(() => build({ notifications: { ...approved, approval_ref: null } }), /approval_required/)
assert.throws(() => build({ notifications: { ...approved, route: 'new-email-destination' } }), /policy_invalid/)
assert.ok(buildDigest({ today, policy, blockers: [{ kind: 'credential', title: 'Replace the existing key', detail: 'A standing weekly blocker.', only_you: 'credential' }] }), 'Existing weekly behavior remains available')

const incident = build({ lastSent: weekly, ready: [ready] })
assert.equal(incident.decisions.length, 1)
assert.equal(incident.notification_kind, 'incident')
assert.equal(incident.decisions[0].pr, undefined, 'A new material incident is not suppressed by a prior weekly digest or padded with repeat PR decisions')
assert.notEqual(boardItem(weekly, { date: today }).id, boardItem(incident, { date: today }).id)
assert.match(boardItem(incident, { date: today }).id, /^harness-incident-[a-f0-9]{40}$/)
assert.equal(build({ lastSent: incident }), null)
assert.equal(build({ lastSent: incident, today: '2026-10-20' }), null, 'An unchanged occurrence is not a fresh incident when a week rolls over')
assert.equal(build({ lastSent: incident, blockers: [blocker('a', { title: 'Reword the same source problem' })] }), null, 'Changing wording cannot create a new incident identity')
assert.equal(build({ blockers: [blocker('a', { incident: { ...blocker().incident, actionable: false } })] }), null)
assert.equal(build({ blockers: [blocker('a', { incident: { ...blocker().incident, state: 'resolved' } })] }), null, 'Recovery is quiet; the observer does not reopen or auto-close an owner-controlled item')
assert.throws(() => incidentKey({ ...blocker().incident, private_text: 'A private field must not enter a receipt' }), /identity_invalid/)
assert.throws(() => incidentKey({ ...blocker().incident, generation_sha256: 'wording' }), /identity_invalid/)

const later = build({ lastSent: incident, blockers: [blocker('b')] })
assert.notEqual(later.notification_key, incident.notification_key)
assert.notEqual(boardItem(later, { date: today }).id, boardItem(incident, { date: today }).id, 'A new occurrence gets a new item even after the owner closed the earlier item')
assert.equal(later.incident_keys.length, 2)
assert.equal(build({ lastSent: later, blockers: [blocker('a'), blocker('b')] }), null, 'The latest receipt retains prior acknowledged identities')
assert.equal(build({ blockers: [blocker('a'), blocker('a')] }).decisions.length, 1, 'Duplicate observations do not consume two decisions')
const firstLimited = build({ policy: { decision_budget: 1 }, blockers: [blocker('a'), blocker('b')] })
assert.equal(firstLimited.incident_keys.length, 1)
const secondLimited = build({ policy: { decision_budget: 1 }, lastSent: firstLimited, blockers: [blocker('a'), blocker('b')] })
assert.equal(secondLimited.decisions[0].incident_key, incidentKey(blocker('b').incident), 'A deferred incident is not marked acknowledged before its own delivery')
assert.throws(() => build({ lastSent: firstLimited, blockers: [blocker('b')], notifications: { ...approved, max_acknowledged_incidents: 1 } }), /history_limit/, 'A full dedupe history fails closed rather than forgetting earlier incidents')
const nextWeekly = buildDigest({ today: '2026-10-20', policy, ready: [ready], lastSent: later, notifications: defaults })
assert.deepEqual(nextWeekly.incident_keys, later.incident_keys, 'Disabling extra messages preserves known delivered incident identities')

const root = mkdtempSync(join(tmpdir(), 'harness-incidents-'))
try {
  const pending = writeDigest(incident, root)
  const firstFile = readdirSync(join(root, 'state/digest')).find((name) => name.endsWith('.md'))
  assert.ok(firstFile.includes(incident.notification_key.slice(0, 40)))
  const firstBytes = readFileSync(join(root, 'state/digest', firstFile), 'utf8')
  assert.deepEqual(writeDigest(incident, root), pending)
  assert.throws(() => writeDigest(later, root), /delivery_pending/, 'A new incident cannot overwrite an unresolved durable pending delivery')
  let calls = 0
  await assert.rejects(() => deliverPending({ root, notifications: defaults, verifyDurable: async () => true, key: 'fixture-key', fetchImpl: async () => { calls++; return new Response('{}') } }), /not_approved/)
  assert.equal(calls, 0, 'Disabling the policy stops an already-prepared extra incident before any send')
  await assert.rejects(() => deliverPending({ root, notifications: { ...approved, approval_ref: 'different-fixture-approval' }, verifyDurable: async () => true }), /not_approved/)
  await assert.rejects(() => deliverPending({ root, notifications: approved, verifyDurable: async () => false, key: 'fixture-key', fetchImpl: async () => { calls++; return new Response('{}') } }), /not_committed/)
  assert.equal(calls, 0)
  const read = (items) => async (_url, init) => { calls++; assert.equal(init.method, 'GET', 'The harness never writes the board'); return new Response(JSON.stringify({ ok: true, items })) }
  await assert.rejects(() => deliverPending({ root, notifications: approved, verifyDurable: async () => true, key: 'fixture-key', fetchImpl: read([{ ...pending.delivery.item, title: 'other' }]) }), /readback_mismatch/)
  assert.deepEqual(pendingDigest(root), pending)
  assert.equal(lastSent(root), null, 'A differing board item is not delivered')
  assert.equal((await deliverPending({ root, notifications: approved, verifyDurable: async () => true, key: 'fixture-key', fetchImpl: read([]) })).awaiting, true, 'Until Control Center writes it, the incident waits')
  await deliverPending({ root, notifications: approved, verifyDurable: async () => true, key: 'fixture-key', fetchImpl: read([pending.delivery.item]) })
  assert.equal(lastSent(root).delivery.status, 'delivered')
  assert.deepEqual(lastSent(root).incident_keys, incident.incident_keys)
  assert.equal(pendingDigest(root), null)
  assert.equal((await deliverPending({ root, notifications: approved })).reason, 'no_pending_digest')

  const newIncident = build({ lastSent: lastSent(root), blockers: [blocker('b')] })
  const secondPending = writeDigest(newIncident, root)
  assert.notEqual(secondPending.delivery.item.id, pending.delivery.item.id)
  assert.equal(readFileSync(join(root, 'state/digest', firstFile), 'utf8'), firstBytes, 'A later same-day incident keeps the earlier linked report intact')
  await deliverPending({ root, notifications: approved, verifyDurable: async () => true, key: 'fixture-key', fetchImpl: read([{ ...secondPending.delivery.item, lane: 'done' }]) })
  assert.equal(lastSent(root).delivery.status, 'closed-by-owner')
  assert.equal(build({ lastSent: lastSent(root), blockers: [blocker('b')] }), null, 'The same closed occurrence never reopens')
  assert.ok(build({ lastSent: lastSent(root), blockers: [blocker('c')] }), 'A subsequent materially different occurrence remains visible after closure')
} finally { rmSync(root, { recursive: true, force: true }) }
console.log('HARNESS INCIDENTS OK: disabled approval gate, later weekly incidents, stable occurrences, bounded dedupe, durable pending/retry/readback and owner closure')
