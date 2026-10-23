#!/usr/bin/env node
/**
 * The weekly digest: silent unless there is something only Krish can do.
 *
 * Krish asked for a guardian he does not have to keep checking on. So the
 * digest says nothing in a week where no change request is ready and nothing
 * is blocked, says it at most once per ISO week, and asks at most
 * decision_budget things. When it does speak it writes:
 *
 *   state/digest/<date>.md     the decisions, each a link to a ready pull
 *                              request, plus the scoreboard line
 *   state/digest/latest.json   what was sent, so a second run that week is silent
 *
 * and leaves ONE item for his Control Center list (lane on_you, closes on his
 * word) in latest.json on main. The engine's board takes such an item only
 * from Krish or from Control Center, so Control Center's connections sweep
 * reads the committed record and writes it (Control Center
 * api/_harnessDigest.ts); this script only confirms it by reading the board
 * back with CONTENT_ENGINE_KEY. Ruling (Krish, 2026-10-23): route the harness
 * digest through Control Center.
 *
 * Called by scripts/steward-housekeeping.mjs; exported for its tests.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { isoWeek } from './scoreboard.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const num = (v, d) => (v === undefined || v === null || v === '' ? d : Number(v))
export const ENGINE_URL = 'https://content-engine-flame-nu.vercel.app'
const REPO_URL = 'https://github.com/krishanraja/ai-harness'
const HEX = /^[a-f0-9]{64}$/
const digestHash = (value) => createHash('sha256').update(value).digest('hex')
export const loadNotificationPolicy = () => JSON.parse(readFileSync(join(HARNESS, 'config/harness-notifications.json'), 'utf8'))
const incidentGate = (policy) => {
  if (policy?.schema_version !== 1 || policy.route !== 'existing-content-engine-workbench' || typeof policy.enabled !== 'boolean' || !Number.isSafeInteger(policy.max_acknowledged_incidents) || policy.max_acknowledged_incidents < 1 || policy.max_acknowledged_incidents > 512) throw new Error('incident_notification_policy_invalid')
  if (policy.enabled && !/^[a-zA-Z0-9:._-]{3,120}$/.test(policy.approval_ref || '')) throw new Error('incident_notification_approval_required')
  return policy.enabled
}

/** The observing owner supplies a stable occurrence hash; wording never identifies an incident. */
export function incidentKey(incident) {
  if (!incident || Object.keys(incident).some((key) => !['id', 'generation_sha256', 'state', 'actionable'].includes(key)) || !/^[a-z][a-z0-9._-]{1,79}$/.test(incident.id || '') || !HEX.test(incident.generation_sha256 || '') || !['active', 'resolved'].includes(incident.state) || typeof incident.actionable !== 'boolean') throw new Error('incident_identity_invalid')
  return digestHash(`harness-incident\0${incident.id}\0${incident.generation_sha256}`)
}
const digestFilename = (digest) => digest.notification_kind === 'incident'
  ? `${digest.date}-incident-${digest.notification_key.slice(0, 40)}.md`
  : `${digest.date}.md`

/**
 * ready:    [{ number, title, html_url, created_at }] change requests whose checks
 *           passed and whose judge measured them
 * blockers: [{ kind, title, detail, only_you }] something only Krish can unblock
 */
export function buildDigest({ ready = [], blockers = [], scoreboard = null, today, policy, lastSent = null, notifications = loadNotificationPolicy() }) {
  const week = isoWeek(today)
  const enabled = incidentGate(notifications), priorKeys = lastSent?.incident_keys || []
  if (!Array.isArray(priorKeys) || priorKeys.some((key) => !HEX.test(key))) throw new Error('incident_history_invalid')
  const acknowledged = new Set(priorKeys)
  const seenIncidents = new Set()
  const eligible = blockers.filter((blocker) => {
    if (!blocker.incident) return true
    const key = incidentKey(blocker.incident)
    if (!enabled || blocker.incident.state !== 'active' || !blocker.incident.actionable || acknowledged.has(key) || seenIncidents.has(key)) return false
    seenIncidents.add(key)
    return true
  })
  const sameWeek = lastSent?.week === week
  const novel = eligible.filter((blocker) => blocker.incident)
  if (sameWeek && !novel.length) return null
  const selectedBlockers = sameWeek ? novel : eligible
  if (!(sameWeek ? 0 : ready.length) && !selectedBlockers.length) return null
  const budget = num(policy?.decision_budget, 3)
  const decisions = [
    ...selectedBlockers.map((b) => ({ kind: b.kind, title: b.title, detail: b.detail, only_you: b.only_you || 'permission', ...(b.incident ? { incident_key: incidentKey(b.incident) } : {}) })),
    ...(sameWeek ? [] : [...ready]).sort((a, b) => String(a.created_at).localeCompare(String(b.created_at))).map((p) => ({ kind: 'merge', title: p.title.replace(/^Change request:\s*/, ''), pr: p.number, url: p.html_url, delivery: p.head?.ref?.startsWith('harness/repository-learning-') ? 'repository' : 'canon', only_you: 'permission' })),
  ].slice(0, budget)
  if (!decisions.length) return null
  const newKeys = [...new Set(decisions.filter((decision) => decision.incident_key).map((decision) => decision.incident_key))].sort()
  const incidentKeys = [...new Set([...priorKeys, ...newKeys])].sort()
  if (incidentKeys.length > notifications.max_acknowledged_incidents) throw new Error('incident_history_limit')

  const lines = [`# Harness digest, ${week}`, '']
  lines.push(decisions.length === 1 ? 'One thing needs you this week.' : `${decisions.length} things need you this week.`, '')
  for (const [i, d] of decisions.entries()) {
    if (d.kind === 'merge') lines.push(`${i + 1}. **Merge or close** [#${d.pr}](${d.url}): ${d.title}. ${d.delivery==='repository'?'Merging accepts this scoped knowledge and schedules checked repository delivery.':'Merging accepts the change and starts the normal release process.'}`)
    else lines.push(`${i + 1}. **${d.title}.** ${d.detail}`)
  }
  lines.push('')
  if (scoreboard) {
    const s = scoreboard
    const acc = s.change_requests?.acceptance
    lines.push('## Scoreboard', '')
    lines.push(`- Repeated corrections (same correction given twice, 28 days): ${s.repeated_correction_rate ?? 'not measured yet'}`)
    lines.push(`- Change requests accepted: ${acc === null || acc === undefined ? 'none decided yet' : acc}`)
    lines.push(`- Always-on context: ${Number(s.always_on_chars).toLocaleString('en-US')} characters${s.always_on_delta ? ` (${s.always_on_delta > 0 ? '+' : ''}${s.always_on_delta} this week)` : ''}`)
    lines.push(`- Real work signals captured this week: ${s.work_signals_week}`)
    if(s.repository_administration){
      const repos=s.repository_administration.repositories||[]
      lines.push(`- Repository views verified or current: ${repos.filter(r=>['verified','current'].includes(r.delivery)).length}/${repos.length}. History coverage remains unknown without source receipts.`)
      for(const repo of repos){
        const use=repo.observed_use||{},effect=repo.effectiveness||{}
        lines.push(`- ${repo.repository}: ${use.loaded||0} observed loads; ${use.application_checks||0} application checks; comparable opportunities ${effect.opportunities??'unmeasured'}; repeated avoidable failures ${effect.repeated_failures??'unmeasured'}.`)
      }
    }
    lines.push('')
  }
  const merges = decisions.filter((d) => d.kind === 'merge').length
  const title = selectedBlockers.length && !merges
    ? `Harness: ${decisions[0].title.toLowerCase()}`
    : `Harness: ${merges} change${merges === 1 ? '' : 's'} ready for your merge${selectedBlockers.length ? `, and ${selectedBlockers.length} blocker` : ''}`
  return { week, date: today, decisions, md: lines.join('\n'), title, only_you: decisions[0].only_you,
    ...(incidentKeys.length ? { incident_keys: incidentKeys } : {}),
    ...(newKeys.length ? { notification_kind: 'incident', notification_key: digestHash(newKeys.join('\0')), notification_approval_ref: notifications.approval_ref } : {}),
  }
}

/** The one board item, per Control Center's gate: on_you, a reason only he can act, a link, a close. */
export function boardItem(digest, { date }) {
  if (digest.notification_kind === 'incident' && !HEX.test(digest.notification_key || '')) throw new Error('incident_delivery_identity_invalid')
  return {
    id: digest.notification_kind === 'incident' ? `harness-incident-${digest.notification_key.slice(0, 40)}` : `harness-digest-${digest.week.toLowerCase()}`,
    lane: 'on_you',
    area: 'Harness',
    title: digest.title,
    detail: digest.decisions.map((d) => d.title).join('; ').slice(0, 400),
    only_you: digest.only_you,
    link: `${REPO_URL}/blob/main/state/digest/${digestFilename({ ...digest, date })}`,
    link_label: 'Open the digest',
    closes_on: 'his_word',
  }
}

/** Read the board for the item Control Center writes. Never writes. */
export async function confirmBoard(item, { key, url = ENGINE_URL, fetchImpl = fetch } = {}) {
  if (!key) return { sent: false, reason: 'CONTENT_ENGINE_KEY is not set, so delivery could not be confirmed' }
  const endpoint = `${url.replace(/\/+$/, '')}/api/workbench`
  const check = await fetchImpl(endpoint, { method: 'GET', headers: { authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(30000) })
  let data
  try { data = JSON.parse(await check.text()) } catch { throw new Error('board_readback_invalid') }
  if (!check.ok || data?.ok !== true || !Array.isArray(data.items)) throw new Error('board_readback_invalid')
  const found = data.items.find(row => row?.id === item.id)
  if (!found) return { sent: false, awaiting: true, reason: 'awaiting_control_center' }
  if (['done', 'archived'].includes(found.lane)) return { sent: false, closed: true, reason: 'Krish already closed this item' }
  if (!Object.keys(item).every(k => found[k] === item[k])) throw new Error('board_readback_mismatch')
  return { sent: true, readback: true }
}

const saveLatest = (record, root) => {
  const dir = join(root, 'state/digest')
  mkdirSync(dir, { recursive: true })
  const target = join(dir, 'latest.json'), temporary = target + '.tmp'
  writeFileSync(temporary, JSON.stringify(record, null, 2) + '\n')
  renameSync(temporary, target)
}
export function writeDigest(digest, root = HARNESS) {
  const dir = join(root, 'state/digest')
  mkdirSync(dir, { recursive: true })
  const record = { ...digest, delivery: { status: 'pending', item: boardItem(digest, { date: digest.date }) } }
  const existing = pendingDigest(root)
  if (existing && JSON.stringify(existing) !== JSON.stringify(record)) throw new Error('digest_delivery_pending')
  if (existing) return existing
  writeFileSync(join(dir, digestFilename(digest)), digest.md + '\n')
  saveLatest(record, root)
  return record
}

export function lastSent(root = HARNESS) {
  const p = join(root, 'state/digest/latest.json')
  const record = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null
  // Historical records without a receipt never prove a successful delivery.
  return ['delivered', 'closed-by-owner'].includes(record?.delivery?.status) ? record : null
}

export function pendingDigest(root = HARNESS) {
  const p = join(root, 'state/digest/latest.json')
  const record = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null
  return record?.delivery?.status === 'pending' ? record : null
}

export async function verifyPublishedPending(record, { token = process.env.GITHUB_TOKEN, fetchImpl = fetch } = {}) {
  if (!token) throw new Error('digest_durable_read_auth_missing')
  const response = await fetchImpl('https://api.github.com/repos/krishanraja/ai-harness/contents/state/digest/latest.json?ref=main', {
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28' },
    signal: AbortSignal.timeout(30000),
  })
  let file, persisted
  try { file = await response.json(); persisted = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')) } catch { throw new Error('digest_durable_read_invalid') }
  if (!response.ok || file.encoding !== 'base64' || JSON.stringify(persisted) !== JSON.stringify(record)) throw new Error('digest_pending_not_committed')
  return true
}

export async function deliverPending({ root = HARNESS, verifyDurable = verifyPublishedPending, notifications = loadNotificationPolicy(), ...transport } = {}) {
  const record = pendingDigest(root)
  if (!record) return { sent: false, reason: 'no_pending_digest' }
  if (record.notification_kind === 'incident' && (!incidentGate(notifications) || record.notification_approval_ref !== notifications.approval_ref)) throw new Error('incident_notification_not_approved')
  if (await verifyDurable(record) !== true) throw new Error('digest_pending_not_committed')
  const result = await confirmBoard(record.delivery.item, transport)
  if (result.sent || result.closed) {
    saveLatest({ ...record, delivery: { ...record.delivery,
      status: result.closed ? 'closed-by-owner' : 'delivered',
      readback: result.readback === true, completed_at: new Date().toISOString() } }, root)
  }
  return result
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv.includes('--deliver-pending')) {
  try {
    const result = await deliverPending({ key: process.env.CONTENT_ENGINE_KEY, url: process.env.CONTENT_ENGINE_URL || undefined })
    console.log(JSON.stringify({ sent: result.sent, closed: result.closed === true, pending: !result.sent && !result.closed && result.reason !== 'no_pending_digest', awaiting_control_center: result.awaiting === true }))
    // Waiting for Control Center's next sweep is normal; an unconfirmable board is not.
    if (!result.sent && !result.closed && !result.awaiting && result.reason !== 'no_pending_digest') process.exitCode = 1
  } catch { console.error('digest_delivery_unverified'); process.exitCode = 1 }
}
