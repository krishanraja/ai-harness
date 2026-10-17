#!/usr/bin/env node
/**
 * The scoreboard: is the brain getting smarter and leaner, or only busier?
 *
 * One row per ISO week in state/scoreboard.jsonl, computed from evidence the
 * repository already holds. It is never pushed at Krish; the weekly digest
 * quotes it and the process review reads it.
 *
 *   repeated_correction_rate   share of direct corrections and rulings in the
 *                              last 28 days that had to be given on two or more
 *                              days. The same correction twice is a failure to learn.
 *   change_acceptance          merged / decided steward change requests, all time.
 *   median_hours_to_decision   how long a change request waited for him.
 *   always_on_chars            the context every session pays for, and its delta.
 *   real_use_citation_share    live rules cited by real use (not synthetic canaries).
 *   canary_pass_rate           latest canary report per surface.
 *   decisions_asked            in this week's digest.
 *   auto_merge_revisit_due     the revisit trigger in contract/learning-policy.yaml.
 *
 *   node scripts/scoreboard.mjs [--json] [--append] [--force]
 *
 * --append writes this week's row once, and only on a Sunday (UTC) unless
 * --force: the Sunday observer run closes the week, and the weekly proposer
 * runs an hour later on the same day.
 */

import { existsSync, readFileSync, readdirSync, appendFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'
import { loadLedger, loadPolicy, normaliseRulings, cluster } from './propose.mjs'
import { loadBudget, measure, reader } from './context-budget.mjs'
import { repositoryHealth } from './repository-health.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const num = (v, d) => (v === undefined || v === null || v === '' ? d : Number(v))
const jsonl = (p) => (existsSync(p) ? readFileSync(p, 'utf8').split('\n').filter((l) => l.trim()).flatMap((l) => { try { return [JSON.parse(l)] } catch { return [] } }) : [])

export function isoWeek(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`)
  const day = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - day + 3)
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  const week = 1 + Math.round(((d - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

const daysBefore = (today, n) => new Date(Date.parse(`${today}T00:00:00Z`) - n * 86400000).toISOString().slice(0, 10)
const median = (xs) => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }

/** Repeated-correction rate over a window: clusters of direct corrections given on two or more days. */
export function repeatedCorrectionRate(rows, { today, windowDays = 28, jaccard = 0.5 }) {
  const from = daysBefore(today, windowDays)
  const inWin = rows.filter((r) => (r.seen_at || r.dated || '') >= from)
  const prior = rows.filter((r) => (r.seen_at || r.dated || '') < from)
  const direct = [...normaliseRulings(inWin, prior), ...inWin.filter((r) => r.class === 'correction')]
  const clusters = cluster(direct, jaccard, () => 'direct')
  if (!clusters.length) return { rate: null, clusters: 0, repeated: 0 }
  const repeated = clusters.filter((c) => new Set(c.rows.map((r) => r.dated || r.seen_at)).size >= 2).length
  return { rate: Number((repeated / clusters.length).toFixed(3)), clusters: clusters.length, repeated }
}

/** Steward change-request outcomes from brain/proposals.jsonl. */
export function changeOutcomes(proposals) {
  const latest = new Map()
  for (const p of proposals) {
    if (p.kind !== 'change') continue
    const order = { opened: 0, closed: 1, expired: 1, merged: 2 }
    const prev = latest.get(p.pr)
    if (!prev || (order[p.event] ?? -1) >= (order[prev.event] ?? -1)) latest.set(p.pr, p)
  }
  const all = [...latest.values()]
  const merged = all.filter((p) => p.event === 'merged').length
  const closed = all.filter((p) => p.event === 'closed').length
  const expired = all.filter((p) => p.event === 'expired').length
  const decided = merged + closed + expired
  return {
    opened: all.length, open: all.filter((p) => p.event === 'opened').length, merged, closed, expired,
    acceptance: decided ? Number((merged / decided).toFixed(3)) : null,
    median_hours_to_decision: median(all.filter((p) => p.hours_to_decision !== undefined && p.event !== 'opened').map((p) => p.hours_to_decision)),
  }
}

export function canaryPassRate(root) {
  const dir = join(root, 'state/canaries')
  const latest = {}
  for (const f of existsSync(dir) ? readdirSync(dir).filter((x) => x.endsWith('.json')).sort() : []) {
    try { const r = JSON.parse(readFileSync(join(dir, f), 'utf8')); latest[r.surface] = r } catch { /* skip */ }
  }
  let results = 0
  let failures = 0
  for (const r of Object.values(latest)) { results += (r.results || []).length; failures += (r.failures || []).length }
  return results ? Number(((results - failures) / results).toFixed(3)) : null
}

export function computeScoreboard({ root = HARNESS, today = new Date().toISOString().slice(0, 10), rows = loadLedger(root), policy = loadPolicy(root) } = {}) {
  const proposals = jsonl(join(root, 'brain/proposals.jsonl'))
  const history = jsonl(join(root, 'state/scoreboard.jsonl'))
  const usage = jsonl(join(root, 'brain/usage.jsonl'))
  const rules = parseYaml(readFileSync(join(root, 'brain/rules.yaml'), 'utf8'))
  const live = [...(rules.contract_rules || []), ...(rules.skill_sections || [])].filter((e) => e.status === 'live' || e.status === 'contested')
  const realCited = new Set(usage.filter((u) => u.evidence_class !== 'synthetic-evaluation' && u.producer !== 'canary').map((u) => u.rule_id))
  const alwaysOn = measure(loadBudget(root), reader(null, root)).total
  const prev = history.filter((h) => h.week !== isoWeek(today)).at(-1)
  const weekFrom = daysBefore(today, 7)
  const standingPath = join(root, 'state/observations/standing.json')
  const standing = existsSync(standingPath) ? Object.values(JSON.parse(readFileSync(standingPath, 'utf8'))) : []
  const digestPath = join(root, 'state/digest/latest.json')
  const digest = existsSync(digestPath) ? JSON.parse(readFileSync(digestPath, 'utf8')) : null
  const reverts = rows.filter((r) => r.class === 'revert' && r.repo === 'ai-harness' && (r.dated || '') >= daysBefore(today, 28)).length
  const changes = changeOutcomes(proposals)
  const row = {
    week: isoWeek(today), computed: today,
    observations_week: rows.filter((r) => (r.seen_at || '') >= weekFrom).length,
    work_signals_week: rows.filter((r) => r.source === 'harness-inbox' && (r.seen_at || '') >= weekFrom).length,
    repeated_correction_rate: repeatedCorrectionRate(rows, { today }).rate,
    change_requests: changes,
    always_on_chars: alwaysOn,
    always_on_delta: prev ? alwaysOn - prev.always_on_chars : null,
    live_rules: live.length,
    real_use_citation_share: live.length ? Number((live.filter((e) => realCited.has(e.id)).length / live.length).toFixed(3)) : null,
    canary_pass_rate: canaryPassRate(root),
    decisions_asked: digest && digest.week === isoWeek(today) ? (digest.decisions || []).length : 0,
    standing_open: standing.filter((e) => e.open).length,
    standing_closed_28d: standing.filter((e) => !e.open && (e.closed_at || '') >= daysBefore(today, 28)).length,
    reverts_28d: reverts,
    ...(existsSync(join(root,'contract/repository-administration.json')) ? {repository_administration:repositoryHealth(root)} : {}),
  }
  const weeks = num(policy.revisit?.auto_merge_after_weeks, 4)
  const minAcc = num(policy.revisit?.auto_merge_min_acceptance, 0.8)
  const recent = [...history.filter((h) => h.week !== row.week), row].slice(-weeks)
  row.auto_merge_revisit_due = recent.length >= weeks && recent.every((h) => h.change_requests?.acceptance !== null && h.change_requests?.acceptance >= minAcc) && reverts === 0
  return row
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const args = process.argv.slice(2)
  const row = computeScoreboard()
  if (args.includes('--append')) {
    const path = join(HARNESS, 'state/scoreboard.jsonl')
    const exists = jsonl(path).some((h) => h.week === row.week)
    const sunday = new Date().getUTCDay() === 0
    if (exists) console.log(`scoreboard: ${row.week} already recorded.`)
    else if (!sunday && !args.includes('--force')) console.log('scoreboard: not Sunday (UTC), nothing appended.')
    else { appendFileSync(path, JSON.stringify(row) + '\n'); console.log(`scoreboard: appended ${row.week}.`) }
  }
  if (args.includes('--json') || !args.includes('--append')) console.log(JSON.stringify(row, null, args.includes('--json') ? 0 : 2))
}
