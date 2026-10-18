#!/usr/bin/env node
/**
 * The process reviews itself, once a week, inside the same run.
 *
 * Krish asked for a weekly look at whether the learning loop is working, and
 * for it not to become more machinery to maintain (Ruling, Krish, 2026-10-14).
 * So this is deterministic, needs no model, and has exactly one lever: it may
 * propose an edit to contract/learning-policy.yaml, as an ordinary change
 * request that competes for the same decision budget. It never edits code, never
 * adds a stage, and is measured by the same scoreboard as everything else.
 *
 * Diagnostics, first match wins, silent when healthy:
 *
 *   low acceptance    fewer than half of the change requests decided in the
 *                     last 28 days were merged (at least four decided): raise
 *                     the ordinary threshold, or once it is at five, ask for
 *                     fewer decisions a week
 *   dead type         a candidate type with three or more decided change
 *                     requests and none merged in the retirement window:
 *                     retire it (disabled_types)
 *   always-on drift   the always-on surface grew two weeks running: keep a
 *                     second consolidation slot
 *
 *   node scripts/process-review.mjs [--dry-run] [--dir changes]
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPolicy } from './propose.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const num = (v, d) => (v === undefined || v === null || v === '' ? d : Number(v))
const jsonl = (p) => (existsSync(p) ? readFileSync(p, 'utf8').split('\n').filter((l) => l.trim()).flatMap((l) => { try { return [JSON.parse(l)] } catch { return [] } }) : [])
const TYPES = ['ineffective-change', 'inbound-edit', 'ruling-cluster', 'correction-cluster', 'standing-condition', 'canary-failure', 'consolidation', 'friction', 'pattern', 'process']
const NEVER_RETIRE = new Set(['process', 'ineffective-change'])

/** The candidate type a change-request branch was opened for. */
export function typeOfBranch(branch) {
  const rest = String(branch).replace(/^harness\/change-\d{4}-\d{2}-\d{2}-/, '')
  return TYPES.filter((t) => rest.startsWith(`${t}-`)).sort((a, b) => b.length - a.length)[0] || null
}

/** Final outcome per change request, from brain/proposals.jsonl. */
export function decided(proposals) {
  const latest = new Map()
  const order = { opened: 0, closed: 1, expired: 1, merged: 2 }
  for (const p of proposals) {
    if (p.kind !== 'change') continue
    const prev = latest.get(p.pr)
    if (!prev || (order[p.event] ?? -1) >= (order[prev.event] ?? -1)) latest.set(p.pr, p)
  }
  return [...latest.values()].filter((p) => p.event !== 'opened').map((p) => ({ ...p, type: typeOfBranch(p.branch) }))
}

/** Set one value in the policy file, keeping every other byte. Supports top-level and one level of nesting. */
export function setPolicyValue(text, path, value) {
  const [a, b] = path.split('.')
  const render = Array.isArray(value) ? `[${value.join(', ')}]` : String(value)
  const lines = text.split('\n')
  if (!b) {
    const i = lines.findIndex((l) => l.startsWith(`${a}:`))
    if (i === -1) throw new Error(`policy has no ${a}`)
    lines[i] = `${a}: ${render}`
    return lines.join('\n')
  }
  const s = lines.findIndex((l) => l === `${a}:`)
  if (s === -1) throw new Error(`policy has no section ${a}`)
  for (let i = s + 1; i < lines.length && (lines[i].startsWith(' ') || !lines[i].trim()); i++) {
    if (lines[i].startsWith(`  ${b}:`)) { lines[i] = `  ${b}: ${render}`; return lines.join('\n') }
  }
  throw new Error(`policy has no ${path}`)
}

export function diagnose({ scoreboard = [], proposals = [], policy, today }) {
  const from28 = new Date(Date.parse(`${today}T00:00:00Z`) - 28 * 86400000).toISOString()
  const all = decided(proposals)
  const recent = all.filter((p) => String(p.at) >= from28)
  const merged = recent.filter((p) => p.event === 'merged').length
  if (recent.length >= 4 && merged / recent.length < 0.5) {
    const ordinary = num(policy.thresholds?.ordinary, 3)
    const budget = num(policy.decision_budget, 3)
    const edit = ordinary < 5 ? { path: 'thresholds.ordinary', from: ordinary, to: ordinary + 1 } : budget > 1 ? { path: 'decision_budget', from: budget, to: budget - 1 } : null
    if (edit) {
      return {
        key: 'low-acceptance', edit,
        title: edit.path === 'decision_budget' ? 'Ask for one fewer decision a week' : 'Raise the bar for an ordinary pattern by one occurrence',
        why: `${merged} of ${recent.length} change requests decided in the last 28 days were merged. Below half means the brief is offering changes Krish does not want; a higher bar offers fewer, stronger ones.`,
        evidence: recent.map((p) => `pr-${p.pr}`),
      }
    }
  }
  const windowStart = new Date(Date.parse(`${today}T00:00:00Z`) - num(policy.retirement?.idle_weeks, 6) * 7 * 86400000).toISOString()
  const byType = {}
  for (const p of all.filter((x) => String(x.at) >= windowStart && x.type)) (byType[p.type] = byType[p.type] || []).push(p)
  for (const [type, ps] of Object.entries(byType)) {
    if (NEVER_RETIRE.has(type) || (policy.disabled_types || []).includes(type)) continue
    if (ps.length >= 3 && !ps.some((p) => p.event === 'merged')) {
      return {
        key: `retire-${type}`, edit: { path: 'disabled_types', from: policy.disabled_types || [], to: [...(policy.disabled_types || []), type] },
        title: `Retire the ${type} candidate type`,
        why: `${ps.length} ${type} change requests were decided in the retirement window and none was merged. A type that never earns a merge is noise in the brief.`,
        evidence: ps.map((p) => `pr-${p.pr}`),
      }
    }
  }
  const last2 = scoreboard.slice(-2)
  const slots = num(policy.consolidation?.slots, 1)
  if (last2.length === 2 && last2.every((r) => num(r.always_on_delta, 0) > 0) && slots < 2) {
    return {
      key: 'always-on-drift', edit: { path: 'consolidation.slots', from: slots, to: slots + 1 },
      title: 'Keep a second consolidation slot while the always-on surface is growing',
      why: `The always-on surface grew two weeks running (${last2.map((r) => `${r.week} +${r.always_on_delta}`).join(', ')}). Smarter must not mean heavier.`,
      evidence: last2.map((r) => `scoreboard-${r.week}`),
    }
  }
  return null
}

export function writePackage(diag, { root = HARNESS, dir, today }) {
  const slug = `process-${today}`
  const pkg = join(dir, slug)
  const policyText = readFileSync(join(root, 'contract/learning-policy.yaml'), 'utf8')
  const after = setPolicyValue(policyText, diag.edit.path, diag.edit.to)
  mkdirSync(join(pkg, 'files/contract'), { recursive: true })
  writeFileSync(join(pkg, 'files/contract/learning-policy.yaml'), after)
  const from = Array.isArray(diag.edit.from) ? `[${diag.edit.from.join(', ')}]` : diag.edit.from
  const to = Array.isArray(diag.edit.to) ? `[${diag.edit.to.join(', ')}]` : diag.edit.to
  writeFileSync(join(pkg, 'change.json'), JSON.stringify({
    slug, type: 'process', candidate_id: `process:${diag.key}`,
    title: diag.title,
    why: `${diag.why} The change: ${diag.edit.path} from ${from} to ${to} in contract/learning-policy.yaml.`,
    evidence_ids: diag.evidence,
    alternative_explanations: 'A short run of weeks can be noise: one busy or quiet week moves these numbers. The scoreboard keeps measuring after the change, and the same review can move the value back.',
    if_wrong: 'The brief offers too few or too many changes. The scoreboard shows it within two weeks, and the next process review proposes the reverse.',
    validation: 'The next two scoreboard rows: acceptance, always-on delta and decisions asked move in the intended direction.',
    rollback: `Revert this pull request, which restores ${diag.edit.path} to ${from}.`,
  }, null, 2) + '\n')
  return pkg
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const args = process.argv.slice(2)
  const flag = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1] }
  const today = new Date().toISOString().slice(0, 10)
  const diag = diagnose({
    scoreboard: jsonl(join(HARNESS, 'state/scoreboard.jsonl')),
    proposals: jsonl(join(HARNESS, 'brain/proposals.jsonl')),
    policy: loadPolicy(), today,
  })
  if (!diag) { console.log('process review: healthy, or not enough evidence yet. Nothing proposed.'); console.log('used=0'); process.exit(0) }
  console.log(`process review: ${diag.title}\n  ${diag.why}`)
  if (args.includes('--dry-run')) { console.log('used=0'); process.exit(0) }
  const pkg = writePackage(diag, { dir: resolve(flag('--dir') || join(HARNESS, 'changes')), today })
  console.log(`wrote ${pkg}`)
  console.log('used=1')
}
