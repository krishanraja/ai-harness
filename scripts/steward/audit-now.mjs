#!/usr/bin/env node
/**
 * The NOW.md audit: fixed, objective rules, every night, every repository
 * (Ruling, Krish, 2026-10-28: "there needs to be regular objective audits of
 * the NOW files to ensure they are not full of outdated crap").
 *
 * NOW.md is the one file every session reads first. On 2026-10-28 ai-harness's
 * ran to 44,878 characters, one paragraph alone past 9,000, and still told its
 * reader that PR 170 was open and a decision was waiting after both had
 * happened. The schema's validator checks shape; this checks that the file
 * stays short, current and true. Every rule is a count, a date or a lookup,
 * never a model's opinion, so two runs on the same input always agree:
 *
 *   as_of_stale           as_of older than as_of_max_age_days
 *   north_star_check      the check line missing or duplicated; older than
 *                         north_star_check_max_age_days is a warning, because only a session may re-date it
 *   too_long              over max_chars or max_lines, or one line over max_line_chars
 *   recent_too_old        a "What changed recently" bullet older than recent_max_age_days
 *                         (the schema's rolling 30 days: roll it into docs/history/LOG.md)
 *   recent_too_many       more than recent_max_bullets bullets there
 *   where_too_many        more than where_max_bullets bullets in "Where it is right now"
 *   next_step             no "Next" line, or more than one, in "What is next and what is waiting on Krish"
 *   unfolded_notes        closeout notes in now-notes/ older than unfolded_note_max_age_days
 *   unreconciled          a product commit landed after the last NOW.md update and
 *                         is older than unreconciled_max_age_days
 *   stale_pr_claim        the file says a pull request is open or waiting to merge,
 *                         and GitHub says it is merged or closed
 *   old_dated_claims      a line in "Where it is right now" or "What is next" that
 *                         speaks of something open, pending or waiting and whose
 *                         newest date is older than dated_claim_max_age_days (a warning)
 *
 * Limits live in config/now-audit.json. Two modes:
 *
 *   node scripts/steward/audit-now.mjs <repo-dir> [--out file.md]
 *       one checkout, from disk and git; the docs steward runs this on its own
 *       repository before it writes, and fixes every finding it reports.
 *   node scripts/steward/audit-now.mjs --fleet docs/steward/fleet.json [--previous p.json] [--out-json f.json] [--out f.md]
 *       every repository in the steward's fleet through the GitHub API with
 *       FLEET_TOKEN, adding the pull request lookups, and carrying each
 *       failure's start date from the previous run so the digest can say how
 *       long a NOW.md has been failing.
 *
 * Dependency-free, so it runs from the steward's sparse checkout.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const DEFAULT_LIMITS = {
  as_of_max_age_days: 7, north_star_check_max_age_days: 7,
  max_chars: 16000, max_lines: 200, max_line_chars: 1500,
  recent_max_age_days: 30, recent_max_bullets: 12, where_max_bullets: 8,
  unfolded_note_max_age_days: 1, unreconciled_max_age_days: 2,
  dated_claim_max_age_days: 14, escalate_after_days: 3,
}
export function loadLimits(root = join(HERE, '../..')) {
  const p = join(root, 'config/now-audit.json')
  return existsSync(p) ? { ...DEFAULT_LIMITS, ...JSON.parse(readFileSync(p, 'utf8')).limits } : { ...DEFAULT_LIMITS }
}

// The same subjects the steward validator treats as automation.
export const AUTOMATION = /^(docs\((steward|harness|canon|closeout)\)|chore\((heartbeat|brain|audit)\)):/
const WAITING = 'What is next and what is waiting on Krish'
const DATE = /\b(20\d{2}-\d{2}-\d{2})\b/g
const days = (from, to) => Math.floor((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000)

/** 1-based line numbers of a section's body. */
function lineNumbers(lines, heading) {
  const at = lines.findIndex((l) => l.startsWith(`## ${heading}`))
  if (at < 0) return []
  const end = lines.findIndex((l, i) => i > at && l.startsWith('## '))
  return Array.from({ length: (end < 0 ? lines.length : end) - at - 1 }, (_, k) => at + 2 + k)
}

function section(lines, heading) {
  const at = lines.findIndex((l) => l.startsWith(`## ${heading}`))
  if (at < 0) return null
  const end = lines.findIndex((l, i) => i > at && l.startsWith('## '))
  return lines.slice(at + 1, end < 0 ? undefined : end)
}

// Phrases that say a pull request in this repository is still open or waiting.
const PR_OPEN = [
  /\bPR (\d+), open\b/gi, /\bPR (\d+) \(open\)/gi, /\bPR (\d+) is (?:still )?open\b/gi,
  /\bmerge PR (\d+)\b/gi, /\b(?:until|once|when|after) PR (\d+) merges\b/gi,
  /\bPR (\d+) (?:awaits|is waiting|waiting) (?:on )?(?:Krish|merge|review)\b/gi, /\bawaiting PR (\d+)\b/gi,
]
/** Pull request numbers the text claims are still open, each with the line it is on. Pure. */
export function openPrClaims(text) {
  const out = new Map(), s = String(text)
  for (const re of PR_OPEN) for (const m of s.matchAll(re)) {
    if (!out.has(Number(m[1]))) out.set(Number(m[1]), s.slice(0, m.index).split('\n').length)
  }
  return out
}

const CLAIM_WORDS = /\b(open|pending|awaiting|waiting|until|not yet|blocked|tonight|tomorrow|next run|in flight|in progress)\b/i

/**
 * The findings for one NOW.md. Pure.
 *   text:        NOW.md
 *   today:       YYYY-MM-DD
 *   notes:       closeout note file names in now-notes/
 *   unreconciled: date of the oldest product commit after the last NOW.md update, or null
 *   prStates:    { number: 'open' | 'merged' | 'closed' } for claimed pull requests
 */
export function auditNow({ text, today, notes = [], unreconciled = null, prStates = {}, limits = DEFAULT_LIMITS }) {
  const L = { ...DEFAULT_LIMITS, ...limits }
  const findings = []
  const add = (rule, detail, severity = 'fail') => findings.push({ rule, severity, detail })
  if (text == null) { add('missing', 'NOW.md does not exist.'); return findings }
  const lines = String(text).split(/\r?\n/)
  const asOf = String(text).match(/^as_of:\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1]
  if (!asOf) add('as_of_stale', 'as_of is missing.')
  else if (days(asOf, today) > L.as_of_max_age_days) add('as_of_stale', `as_of is ${asOf}, ${days(asOf, today)} days old (limit ${L.as_of_max_age_days}).`)

  const waiting = section(lines, WAITING) || []
  const check = waiting.map((l) => l.trim().match(/^- North Star check \((\d{4}-\d{2}-\d{2})\):/)).filter(Boolean)
  if (check.length !== 1) add('north_star_check', check.length ? `${check.length} North Star check lines; keep exactly one.` : 'No North Star check line under "What is next and what is waiting on Krish".')
  // Only a session that re-read the North Star may re-date the line, never the
  // steward, so an old one in a quiet repository is a warning: failing it would
  // escalate to Krish something no automation is allowed to fix.
  else if (days(check[0][1], today) > L.north_star_check_max_age_days) add('north_star_check', `The North Star check is dated ${check[0][1]}, ${days(check[0][1], today)} days ago (limit ${L.north_star_check_max_age_days}); the next session re-dates it.`, 'warn')

  const chars = String(text).length
  const longest = lines.reduce((m, l, i) => (l.length > m.len ? { len: l.length, at: i + 1 } : m), { len: 0, at: 0 })
  const sizes = []
  if (chars > L.max_chars) sizes.push(`${chars} characters (limit ${L.max_chars})`)
  if (lines.length > L.max_lines) sizes.push(`${lines.length} lines (limit ${L.max_lines})`)
  if (longest.len > L.max_line_chars) sizes.push(`line ${longest.at} is ${longest.len} characters (limit ${L.max_line_chars})`)
  if (sizes.length) add('too_long', `${sizes.join('; ')}. Roll history into docs/history/LOG.md and keep what is current.`)

  const recent = (section(lines, 'What changed recently') || []).filter((l) => l.startsWith('- '))
  const old = recent.map((l) => l.match(/^- (\d{4}-\d{2}-\d{2})/)?.[1]).filter((d) => d && days(d, today) > L.recent_max_age_days)
  if (old.length) add('recent_too_old', `${old.length} "What changed recently" bullet(s) older than ${L.recent_max_age_days} days (oldest ${old.sort()[0]}); roll them into docs/history/LOG.md.`)
  if (recent.length > L.recent_max_bullets) add('recent_too_many', `${recent.length} "What changed recently" bullets (limit ${L.recent_max_bullets}).`)

  const where = section(lines, 'Where it is right now') || []
  const whereBullets = where.filter((l) => l.startsWith('- ')).length
  if (whereBullets > L.where_max_bullets) add('where_too_many', `${whereBullets} bullets in "Where it is right now" (limit ${L.where_max_bullets}); it says where things are, not how they got there.`)

  const nexts = waiting.filter((l) => /^- Next\b/.test(l)).length
  if (nexts !== 1) add('next_step', nexts ? `${nexts} "Next" lines under "${WAITING}"; keep the single next action.` : `No "- Next" line under "${WAITING}".`)

  const stale = notes.map((n) => n.match(/^(\d{4}-\d{2}-\d{2})-/)?.[1]).filter((d) => d && days(d, today) > L.unfolded_note_max_age_days)
  if (stale.length) add('unfolded_notes', `${stale.length} closeout note(s) in now-notes/ not folded into NOW.md (oldest ${stale.sort()[0]}); run the fold.`)

  if (unreconciled && days(unreconciled, today) > L.unreconciled_max_age_days) add('unreconciled', `A product commit from ${unreconciled} landed after the last NOW.md update and NOW.md still does not reflect it.`)

  // Findings name lines, never quote them: the fleet report is committed to a
  // public repository and some NOW.md files live in private ones.
  for (const [n, line] of openPrClaims(text)) {
    if (prStates[n] === 'merged' || prStates[n] === 'closed') add('stale_pr_claim', `Line ${line} says PR ${n} is open or waiting to merge, but it is ${prStates[n]}.`)
  }

  const scope = new Set([...lineNumbers(lines, 'Where it is right now'), ...lineNumbers(lines, WAITING)])
  const dated = [...scope].filter((i) => CLAIM_WORDS.test(lines[i - 1])).map((i) => ({ i, newest: [...lines[i - 1].matchAll(DATE)].map((m) => m[1]).sort().at(-1) })).filter((x) => x.newest && days(x.newest, today) > L.dated_claim_max_age_days)
  if (dated.length) add('old_dated_claims', `${dated.length} line(s) speak of something open or pending with no date newer than ${L.dated_claim_max_age_days} days (lines ${dated.slice(0, 5).map((x) => x.i).join(', ')}).`, 'warn')
  return findings
}

/** One repository's verdict with its failure start carried forward. Pure. */
export function verdict(repo, findings, today, previous) {
  const failing = findings.some((f) => f.severity === 'fail')
  const prior = previous?.repos?.find((r) => r.repo === repo)
  return { repo, status: failing ? 'fail' : 'pass', failing_since: failing ? (prior?.status === 'fail' && prior.failing_since ? prior.failing_since : today) : null, findings }
}

/** The digest line: NOW.md files failing for escalate_after_days or more. Pure. */
export function auditBlocker(report, today, limits = DEFAULT_LIMITS) {
  const L = { ...DEFAULT_LIMITS, ...limits }
  const long = (report?.repos || []).filter((r) => r.status === 'fail' && r.failing_since && days(r.failing_since, today) >= L.escalate_after_days)
  if (!long.length) return null
  return {
    kind: 'docs', only_you: 'permission',
    title: `${long.length} NOW.md file${long.length === 1 ? '' : 's'} the steward has not fixed in ${L.escalate_after_days} days`,
    detail: `${long.map((r) => `${r.repo} (since ${r.failing_since}: ${[...new Set(r.findings.filter((f) => f.severity === 'fail').map((f) => f.rule))].join(', ')})`).join('; ')}. The nightly docs steward fixes these; when it has not for days, it is usually not running there (a missing CLAUDE_CODE_OAUTH_TOKEN secret, or its workflow failing). Full findings: state/now-audit/latest.md.`,
  }
}

export function renderReport(report) {
  const out = [`# NOW.md audit ${report.date}`, '', 'Fixed rules, config/now-audit.json; written by scripts/steward/audit-now.mjs. The docs steward fixes its repository\'s findings on its next run.', '', '| Repository | Verdict | Failing since | Rules |', '|---|---|---|---|']
  for (const r of report.repos) out.push(`| ${r.repo} | ${r.status} | ${r.failing_since || ''} | ${[...new Set(r.findings.map((f) => f.rule))].join(', ') || 'none'} |`)
  for (const r of report.repos.filter((x) => x.findings.length)) {
    out.push('', `## ${r.repo}`, '')
    for (const f of r.findings) out.push(`- ${f.severity === 'warn' ? 'warning' : 'fail'} \`${f.rule}\`: ${f.detail}`)
  }
  return out.join('\n') + '\n'
}

// ------------------------------------------------------------------ readers

function localInputs(dir) {
  const git = (...a) => { try { return execFileSync('git', a, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() } catch { return '' } }
  const nowPath = join(dir, 'NOW.md')
  const text = existsSync(nowPath) ? readFileSync(nowPath, 'utf8') : null
  const notesDir = join(dir, 'now-notes')
  const notes = existsSync(notesDir) ? readdirSync(notesDir).filter((f) => f.endsWith('.md')) : []
  const lastNow = git('log', '-1', '--format=%H', '--', 'NOW.md')
  const after = lastNow ? git('log', '--no-merges', '--reverse', '--format=%cs %s', `${lastNow}..HEAD`).split('\n').filter(Boolean) : []
  const product = after.map((l) => ({ date: l.slice(0, 10), subject: l.slice(11) })).filter((c) => !AUTOMATION.test(c.subject))
  return { text, notes, unreconciled: product[0]?.date || null }
}

async function fleetInputs(token, owner, repo, branch) {
  const api = async (path, raw = false) => {
    const res = await fetch(`https://api.github.com${path}`, { headers: { authorization: `Bearer ${token}`, accept: raw ? 'application/vnd.github.raw' : 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'user-agent': 'krish-harness-now-audit' } })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`${path} -> ${res.status}`)
    return raw ? res.text() : res.json()
  }
  const text = await api(`/repos/${owner}/${repo}/contents/NOW.md?ref=${branch}`, true)
  const listing = await api(`/repos/${owner}/${repo}/contents/now-notes?ref=${branch}`)
  const notes = Array.isArray(listing) ? listing.map((f) => f.name).filter((n) => n.endsWith('.md')) : []
  const lastNow = (await api(`/repos/${owner}/${repo}/commits?sha=${branch}&path=NOW.md&per_page=1`))?.[0]
  let unreconciled = null
  if (lastNow) {
    const since = lastNow.commit.committer.date
    const commits = (await api(`/repos/${owner}/${repo}/commits?sha=${branch}&since=${encodeURIComponent(since)}&per_page=100`)) || []
    const product = commits.filter((c) => c.sha !== lastNow.sha && (c.parents || []).length < 2 && !AUTOMATION.test(String(c.commit.message).split('\n')[0]))
    unreconciled = product.map((c) => c.commit.committer.date.slice(0, 10)).sort()[0] || null
  }
  const prStates = {}
  for (const n of openPrClaims(text || '').keys()) {
    const pr = await api(`/repos/${owner}/${repo}/pulls/${n}`)
    if (pr) prStates[n] = pr.merged_at ? 'merged' : pr.state
  }
  return { text, notes, unreconciled, prStates }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const args = process.argv.slice(2), flag = (f) => { const i = args.indexOf(f); return i < 0 ? null : args[i + 1] }
  const today = flag('--today') || new Date().toISOString().slice(0, 10)
  const limits = loadLimits()
  const write = (path, text) => { if (!path) return; mkdirSync(dirname(resolve(path)), { recursive: true }); writeFileSync(path, text) }
  if (flag('--fleet')) {
    const token = process.env.FLEET_TOKEN
    if (!token) { console.error('::error::FLEET_TOKEN is not set; the fleet audit reads every repository through the API.'); process.exit(1) }
    const fleet = JSON.parse(readFileSync(flag('--fleet'), 'utf8'))
    const previous = flag('--previous') && existsSync(flag('--previous')) ? JSON.parse(readFileSync(flag('--previous'), 'utf8')) : null
    const repos = []
    for (const r of fleet.repos) {
      try { repos.push(verdict(r.name, auditNow({ ...(await fleetInputs(token, 'krishanraja', r.name, r.default_branch || fleet.defaults?.default_branch || 'main')), today, limits }), today, previous)) }
      catch (e) { repos.push({ repo: r.name, status: 'unreadable', failing_since: null, findings: [{ rule: 'unreadable', severity: 'warn', detail: String(e.message).slice(0, 120) }] }) }
    }
    const report = { schema_version: 1, date: today, limits, repos }
    write(flag('--out-json'), JSON.stringify(report, null, 2) + '\n')
    write(flag('--out'), renderReport(report))
    console.log(renderReport(report))
  } else {
    const dir = resolve(args.find((a) => !a.startsWith('--') && a !== flag('--out') && a !== flag('--today')) || '.')
    const findings = auditNow({ ...localInputs(dir), today, limits })
    const report = { schema_version: 1, date: today, limits, repos: [verdict(dir.split('/').pop(), findings, today, null)] }
    write(flag('--out'), renderReport(report))
    console.log(renderReport(report))
    process.exit(findings.some((f) => f.severity === 'fail') ? 1 : 0)
  }
}
