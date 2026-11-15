#!/usr/bin/env node
/**
 * The branches the weekly sweep keeps, across the fleet, for the weekly digest.
 *
 * Ruling (Krish, 2026-11-15): the branches the weekly sweep keeps are listed in
 * his weekly report. The sweep (.github/scripts/branch_sweep.py, copied into
 * every repository) prints them to its own job log, which nobody reads. So the
 * digest reads every repository that carries the sweep and applies the sweep's
 * own rules, read-only, to say which branches it keeps and why, how old each
 * one's last commit is, and whether it has a pull request. A kept branch with
 * work not on main, no open pull request and a last commit more than a day old
 * needs a pull request or Krish's yes to remove (the canon's one-day rule).
 *
 * The rules here mirror branch_sweep.py; scripts/test-kept-branches.mjs fails
 * when its KEEP_NAMES drift from the Python copy. Nothing here deletes, writes
 * or comments: GET requests only, on the one fleet token the digest already
 * uses (FLEET_TOKEN).
 *
 *   node scripts/kept-branches.mjs [--repo <name>]   prints the section
 */

import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Gh } from './lib/github.mjs'
import { parseYaml } from './lib/yaml.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
export const SWEEP_WORKFLOW = '.github/workflows/branch-sweep.yml'
export const KEEP_NAMES = new Set(['gh-pages', 'floor/rejections', 'inspo/new-drops'])
const DAY = 86400000
const PER_REPO = 40

/**
 * The sweep's decision for one branch, given what it reads. Pure.
 * Returns null when the sweep deletes it or never considers it, else the reason it keeps it.
 * compare: { ahead_by } | { error: status } | undefined (not needed).
 */
export function keepReason(branch, { defaultBranch, openRefs, mergedHeads, compare }) {
  const { name, sha } = branch
  if (name === defaultBranch || KEEP_NAMES.has(name)) return null
  if (branch.protected) return 'protected'
  if (openRefs.has(name)) return 'open pull request'
  if (mergedHeads.get(name)?.has(sha)) return null
  if (!compare) return `has work not on ${defaultBranch}`
  if (compare.error) return `compare failed: HTTP ${compare.error}`
  if (compare.ahead_by === 0) return null
  return `has work not on ${defaultBranch}`
}

/** Open refs, merged heads and each branch's own pull requests, from pulls?state=all. Pure. */
export function pullIndex(pulls, fullName) {
  const own = (side) => side?.repo?.full_name === fullName
  const openRefs = new Set(), mergedHeads = new Map(), openHead = new Map(), closedHead = new Map()
  for (const p of pulls) {
    const ref = p.head?.ref
    if (p.state === 'open') {
      openRefs.add(p.base?.ref)
      if (own(p.head)) { openRefs.add(ref); if (!openHead.has(ref)) openHead.set(ref, p.number) }
    } else if (own(p.head)) {
      if (p.merged_at) { if (!mergedHeads.has(ref)) mergedHeads.set(ref, new Set()); mergedHeads.get(ref).add(p.head.sha) }
      else if (!closedHead.has(ref) || p.number > closedHead.get(ref)) closedHead.set(ref, p.number)
    }
  }
  return { openRefs, mergedHeads, openHead, closedHead }
}

/** Whether a kept branch needs a pull request or Krish's yes to remove. Pure. */
export const needsYou = (row) => !row.pr && /^(has work not on|compare failed)/.test(row.reason) && row.age_days !== null && row.age_days > 1

async function paged(gh, path) {
  const out = []
  for (let page = 1; page <= 30; page++) {
    const batch = await gh.req('GET', `${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`)
    out.push(...batch)
    if (batch.length < 100) break
  }
  return out
}

/** One repository's kept branches. Read-only. Returns null when the repository has no sweep. */
export async function keptIn(gh, repo, { now = Date.now() } = {}) {
  const base = `/repos/${gh.owner}/${repo}`
  const info = await gh.req('GET', base)
  const defaultBranch = info.default_branch
  if (!(await gh.getFile(repo, SWEEP_WORKFLOW, defaultBranch))) return null
  const branches = await paged(gh, `${base}/branches`)
  const { openRefs, mergedHeads, openHead, closedHead } = pullIndex(await paged(gh, `${base}/pulls?state=all`), info.full_name)
  const rows = []
  for (const b of branches) {
    const branch = { name: b.name, sha: b.commit?.sha, protected: b.protected }
    let compare
    const needCompare = !(branch.name === defaultBranch || KEEP_NAMES.has(branch.name) || branch.protected || openRefs.has(branch.name) || mergedHeads.get(branch.name)?.has(branch.sha))
    if (needCompare) {
      try { compare = { ahead_by: (await gh.req('GET', `${base}/compare/${encodeURIComponent(defaultBranch)}...${branch.sha}`)).ahead_by } } catch (e) { compare = { error: e.status || 'unknown' } }
    }
    const reason = keepReason(branch, { defaultBranch, openRefs, mergedHeads, compare })
    if (!reason) continue
    let last = null
    try {
      const c = await gh.req('GET', `${base}/commits/${branch.sha}`)
      last = c.commit?.committer?.date || c.commit?.author?.date || null
    } catch { /* an unreadable date stays unknown, never a guess */ }
    const age = last ? Math.floor((now - Date.parse(last)) / DAY) : null
    rows.push({ repo, name: branch.name, reason, last_commit: last ? last.slice(0, 10) : null, age_days: age, pr: openHead.get(branch.name) || null, closed_pr: closedHead.get(branch.name) || null })
  }
  return { repo, default_branch: defaultBranch, rows: sortOldest(rows) }
}

const sortOldest = (rows) => [...rows].sort((a, b) => (b.age_days ?? -1) - (a.age_days ?? -1) || a.name.localeCompare(b.name))

/** Every fleet repository that carries the sweep. Read-only; one unreadable repository never hides the rest. */
export async function keptAcrossFleet(gh, fleet, { now = Date.now(), only = null } = {}) {
  const repos = [], unreadable = []
  for (const entry of fleet.repos || []) {
    if (only && entry.name.toLowerCase() !== String(only).toLowerCase()) continue
    try {
      const r = await keptIn(gh, entry.name, { now })
      if (r) repos.push(r)
    } catch (e) { unreadable.push({ repo: entry.name, reason: e.status ? `github-${e.status}` : 'error' }) }
  }
  return { date: new Date(now).toISOString().slice(0, 10), repos, unreadable }
}

const prText = (row) => row.pr ? `open pull request #${row.pr}` : row.closed_pr ? `no open pull request (#${row.closed_pr} was closed unmerged)` : 'no pull request'
const ageText = (row) => row.last_commit ? `last commit ${row.last_commit} (${row.age_days} day${row.age_days === 1 ? '' : 's'})` : 'last commit unknown'

/** The digest section, as markdown lines. Pure. */
export function keptSection(report, { perRepo = PER_REPO } = {}) {
  if (!report) return []
  const lines = ['## Branches kept by the sweep', '']
  const all = report.repos.flatMap((r) => r.rows)
  const flagged = all.filter(needsYou).length
  const withKept = report.repos.filter((r) => r.rows.length)
  lines.push(all.length
    ? `${all.length} branch${all.length === 1 ? '' : 'es'} kept across ${withKept.length} of ${report.repos.length} repositories with the weekly sweep, read ${report.date}. ${flagged ? `${flagged} need${flagged === 1 ? 's' : ''} a pull request or your yes to remove.` : 'None needs you: each has a pull request, is protected or is a day old or less.'} Oldest first.`
    : `No branches kept in the ${report.repos.length} repositories with the weekly sweep, read ${report.date}.`)
  lines.push('')
  for (const r of withKept) {
    lines.push(`### ${r.repo}`, '')
    for (const row of r.rows.slice(0, perRepo)) {
      lines.push(`- \`${row.name}\`: ${row.reason}; ${ageText(row)}; ${prText(row)}.${needsYou(row) ? ' **Needs a pull request or your yes to remove.**' : ''}`)
    }
    if (r.rows.length > perRepo) lines.push(`- and ${r.rows.length - perRepo} more, ${r.rows.slice(perRepo).filter(needsYou).length} of them needing you; \`node scripts/kept-branches.mjs --repo ${r.repo}\` lists them all.`)
    lines.push('')
  }
  if (report.unreadable.length) lines.push(`Could not read: ${report.unreadable.map((u) => `${u.repo} (${u.reason})`).join(', ')}.`, '')
  return lines
}

/** The digest decision when a kept branch needs Krish, or null. Pure. */
export function keptBlocker(report, { max = 6 } = {}) {
  if (!report) return null
  const flagged = sortOldest(report.repos.flatMap((r) => r.rows).filter(needsYou))
  if (!flagged.length) return null
  const shown = flagged.slice(0, max).map((r) => `${r.repo}/${r.name} (${r.age_days} days)`)
  return {
    kind: 'branches', only_you: 'permission',
    title: flagged.length === 1 ? '1 branch needs a pull request or your yes to remove' : `${flagged.length} branches need a pull request or your yes to remove`,
    detail: `${shown.join('; ')}${flagged.length > max ? `; and ${flagged.length - max} more` : ''}. Each holds work not on its main branch and has had no open pull request for over a day, so the weekly sweep keeps it. Say which to remove, or ask a session to open a pull request for it. Every kept branch is listed under "Branches kept by the sweep" below.`,
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const args = process.argv.slice(2), at = args.indexOf('--repo')
  const token = process.env.FLEET_TOKEN || process.env.GITHUB_TOKEN
  if (!token) { console.error('FLEET_TOKEN (or GITHUB_TOKEN) is not set; the branches cannot be read.'); process.exit(1) }
  const fleet = parseYaml(readFileSync(join(HARNESS, 'state/fleet.yaml'), 'utf8'))
  const gh = new Gh(token, { owner: fleet.owner, dryRun: true })
  const report = await keptAcrossFleet(gh, fleet, { only: at < 0 ? null : args[at + 1] })
  const blocker = keptBlocker(report)
  console.log([...(blocker ? [`${blocker.title}.`, ''] : []), ...keptSection(report)].join('\n'))
}
