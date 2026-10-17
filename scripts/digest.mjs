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
 * and puts ONE item on his Control Center list through the content engine's
 * work board (lane on_you, closes on his word), the one way an agent reaches
 * that list (Control Center ADR-034). The board needs CONTENT_ENGINE_KEY; if it
 * is not set the digest file is still written and the run says so plainly.
 *
 * Called by scripts/steward-housekeeping.mjs; exported for its tests.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isoWeek } from './scoreboard.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const num = (v, d) => (v === undefined || v === null || v === '' ? d : Number(v))
export const ENGINE_URL = 'https://content-engine-flame-nu.vercel.app'
const REPO_URL = 'https://github.com/krishanraja/ai-harness'

/**
 * ready:    [{ number, title, html_url, created_at }] change requests whose checks
 *           passed and whose judge measured them
 * blockers: [{ kind, title, detail, only_you }] something only Krish can unblock
 */
export function buildDigest({ ready = [], blockers = [], scoreboard = null, today, policy, lastSent = null }) {
  const week = isoWeek(today)
  if (lastSent && lastSent.week === week) return null
  if (!ready.length && !blockers.length) return null
  const budget = num(policy?.decision_budget, 3)
  const decisions = [
    ...blockers.map((b) => ({ kind: b.kind, title: b.title, detail: b.detail, only_you: b.only_you || 'permission' })),
    ...[...ready].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at))).map((p) => ({ kind: 'merge', title: p.title.replace(/^Change request:\s*/, ''), pr: p.number, url: p.html_url, delivery: p.head?.ref?.startsWith('harness/repository-learning-') ? 'repository' : 'canon', only_you: 'permission' })),
  ].slice(0, budget)

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
  const title = blockers.length && !merges
    ? `Harness: ${decisions[0].title.toLowerCase()}`
    : `Harness: ${merges} change${merges === 1 ? '' : 's'} ready for your merge${blockers.length ? `, and ${blockers.length} blocker` : ''}`
  return { week, date: today, decisions, md: lines.join('\n'), title, only_you: decisions[0].only_you }
}

/** The one board item, per Control Center's gate: on_you, a reason only he can act, a link, a close. */
export function boardItem(digest, { date }) {
  return {
    id: `harness-digest-${digest.week.toLowerCase()}`,
    lane: 'on_you',
    area: 'Harness',
    title: digest.title,
    detail: digest.decisions.map((d) => d.title).join('; ').slice(0, 400),
    only_you: digest.only_you,
    link: `${REPO_URL}/blob/main/state/digest/${date}.md`,
    link_label: 'Open the digest',
    closes_on: 'his_word',
  }
}

export async function sendBoard(item, { key, url = ENGINE_URL, fetchImpl = fetch } = {}) {
  if (!key) return { sent: false, reason: 'CONTENT_ENGINE_KEY is not set, so the board item was not written' }
  const res = await fetchImpl(`${url.replace(/\/+$/, '')}/api/workbench`, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'upsert_items', client: 'claude_code', items: [item] }),
  })
  const text = await res.text()
  if (res.status === 409 && /krish_closed_it/.test(text)) return { sent: false, reason: 'Krish already closed this week\'s item' }
  if (res.status < 200 || res.status >= 300) throw new Error(`board write ${res.status}: ${text.slice(0, 200)}`)
  return { sent: true }
}

export function writeDigest(digest, root = HARNESS) {
  const dir = join(root, 'state/digest')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, `${digest.date}.md`), digest.md + '\n')
  writeFileSync(join(dir, 'latest.json'), JSON.stringify({ week: digest.week, date: digest.date, decisions: digest.decisions }, null, 2) + '\n')
}

export function lastSent(root = HARNESS) {
  const p = join(root, 'state/digest/latest.json')
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null
}
