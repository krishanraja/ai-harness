#!/usr/bin/env node
/**
 * Skill review dates, kept true without a hand edit.
 *
 * Two jobs, both deterministic (fleet integration audit harness-5, 2026-11-14):
 *
 *   1. Count the overdue reviews and write the count into NOW.md, on the
 *      "Skill review dates" line under "Where it is right now", behind a
 *      skill-review-state comment a reader can parse. Before this the line was
 *      typed by hand and went stale between sessions.
 *
 *   2. Move a skill's `reviewed` date in state/skill-registry.yaml when a commit
 *      on main changes that skill's files AND carries a `Ruling (Krish,
 *      YYYY-MM-DD)` line: the date becomes the ruling's date. A ruling on a
 *      change to the skill is Krish looking at it, which is what a review is.
 *      A change without his ruling (a typo fix, a rendered taste file, a bot
 *      edit) moves nothing, because the audit's own rule is "never move the
 *      date without reviewing it" (scripts/audit-harness.mjs, Gate 8), and a
 *      date moved by any merge would hide exactly what this count exists to
 *      show. A date never moves backwards and never past today.
 *
 *   node scripts/skill-reviews.mjs                  print the count
 *   node scripts/skill-reviews.mjs --bump           also move dates from git history
 *   node scripts/skill-reviews.mjs --write          also write NOW.md (and the registry with --bump)
 *   node scripts/skill-reviews.mjs --self-test      prove each rule can fail
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const REGISTRY = 'state/skill-registry.yaml'

// The same row shape scripts/audit-harness.mjs reads.
const ROW = /\{name:\s*([a-z0-9-]+),\s*role:\s*([a-z0-9-]+),\s*owner:\s*([^,]+),\s*reviewed:\s*(\d{4}-\d{2}-\d{2}),\s*freshness_sla_days:\s*(\d+)\}/g
const RULING = /Ruling \(Krish, (\d{4}-\d{2}-\d{2})\)/g
const MARK = '<!-- skill-review-state '
const LABEL = '**Skill review dates.**'

/** The registry's production rows. Pure. */
export function parseRows(text) {
  return [...text.matchAll(ROW)].map((m) => ({ name: m[1], reviewed: m[4], sla: Number(m[5]) }))
}

const addDays = (iso, n) => new Date(new Date(`${iso}T00:00:00Z`).getTime() + n * 86400000).toISOString().slice(0, 10)
const daysBetween = (a, b) => Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86400000)

/** Rows past their freshness SLA, longest overdue first. Pure. */
export function overdue(rows, today) {
  return rows
    .map((r) => ({ ...r, due: addDays(r.reviewed, r.sla) }))
    .filter((r) => r.due < today)
    .map((r) => ({ ...r, days: daysBetween(r.due, today) }))
    .sort((a, b) => b.days - a.days || a.name.localeCompare(b.name))
}

/**
 * The new review date each skill has earned from commits, as { name: date }.
 * A commit counts for a skill only when it changes a file under skills/<name>/
 * and its message carries a Ruling (Krish, date) line; the latest such date,
 * if later than the row's and not after today, wins. Pure.
 */
export function bumps(rows, commits, today) {
  const out = {}
  for (const c of commits) {
    const dates = [...c.body.matchAll(RULING)].map((m) => m[1]).filter((d) => d <= today)
    if (!dates.length) continue
    const date = dates.sort().at(-1)
    const touched = new Set(c.files.map((f) => /^skills\/([^/]+)\//.exec(f)?.[1]).filter(Boolean))
    for (const r of rows) {
      if (!touched.has(r.name)) continue
      const best = out[r.name] ?? r.reviewed
      if (date > best) out[r.name] = date
    }
  }
  return out
}

/** The registry text with each bumped row's reviewed date replaced, nothing else. Pure. */
export function applyBumps(text, moved) {
  return text.replace(ROW, (row, name, _role, _owner, reviewed) =>
    moved[name] ? row.replace(`reviewed: ${reviewed}`, `reviewed: ${moved[name]}`) : row)
}

/** The NOW.md line. Pure. */
export function line(rows, today) {
  const late = overdue(rows, today)
  const state = { as_of: today, overdue: late.length, total: rows.length, oldest: late.slice(0, 4).map((r) => ({ name: r.name, days: r.days })) }
  const lead = late.length
    ? `, led by ${late.slice(0, 4).map((r) => `\`${r.name}\` (${r.days} days)`).join(', ')}`
    : ''
  return `- ${MARK}${JSON.stringify(state)} --> ${LABEL} Written by \`scripts/skill-reviews.mjs\` from \`${REGISTRY}\` on ${today}: ${late.length} of ${rows.length} skills are past their freshness SLA${lead}. A date moves only when a change to the skill carries Krish's ruling.`
}

/** NOW.md with its skill review line replaced (by the comment, else by the label). Pure. */
export function writeNow(now, newLine) {
  const lines = now.split('\n')
  let i = lines.findIndex((l) => l.includes(MARK))
  if (i < 0) i = lines.findIndex((l) => l.startsWith(`- ${LABEL}`))
  if (i < 0) throw new Error('NOW.md has no "Skill review dates" line to write; add one under "Where it is right now".')
  lines[i] = newLine
  return lines.join('\n')
}

/** Commits on main that touched skills/ since a date, from git. */
function commitsSince(since) {
  const raw = execFileSync('git', ['log', `--since=${since}T00:00:00Z`, '--format=%x1e%H%x1f%B%x1f', '--name-only', '--', 'skills/'], { cwd: HARNESS, encoding: 'utf8', maxBuffer: 1 << 26 })
  return raw.split('\x1e').filter(Boolean).map((chunk) => {
    const [sha, body, files = ''] = chunk.split('\x1f')
    return { sha, body, files: files.split('\n').map((f) => f.trim()).filter(Boolean) }
  })
}

function selfTest() {
  const reg = [
    'production:',
    '  - {name: alpha, role: r, owner: Krish Raja, reviewed: 2026-08-01, freshness_sla_days: 30}',
    '  - {name: beta, role: r, owner: Krish Raja, reviewed: 2026-11-01, freshness_sla_days: 30}',
    '  - {name: gamma, role: r, owner: Krish Raja, reviewed: 2026-09-01, freshness_sla_days: 30}',
  ].join('\n')
  const today = '2026-11-14'
  const rows = parseRows(reg)
  const cases = []
  const ok = (name, cond) => cases.push([name, !!cond])
  ok('reads three rows', rows.length === 3)
  const late = overdue(rows, today)
  ok('counts the two overdue rows, longest first', late.length === 2 && late[0].name === 'alpha' && late[0].days === 75)
  ok('a row inside its SLA is not overdue', !late.some((r) => r.name === 'beta'))
  const commits = [
    { body: 'Fix a typo', files: ['skills/alpha/SKILL.md'] },
    { body: 'Tighten gamma\n\nRuling (Krish, 2026-11-10): keep it short', files: ['skills/gamma/references/x.md'] },
    { body: 'Ruling (Krish, 2026-11-12): unrelated', files: ['contract/x.md'] },
    { body: 'Ruling (Krish, 2026-12-01): future', files: ['skills/alpha/SKILL.md'] },
    { body: 'Ruling (Krish, 2026-07-01): older than the row', files: ['skills/beta/SKILL.md'] },
  ]
  const moved = bumps(rows, commits, today)
  ok('a change without a ruling moves nothing', !('alpha' in moved))
  ok('a ruling on a change to the skill moves its date to the ruling', moved.gamma === '2026-11-10')
  ok('a ruling on another file moves no skill', Object.keys(moved).length === 1)
  ok('a date never moves backwards', !('beta' in moved))
  const after = applyBumps(reg, moved)
  ok('only the bumped row changes', after.includes('name: gamma, role: r, owner: Krish Raja, reviewed: 2026-11-10') && after.includes('reviewed: 2026-08-01') && after.includes('reviewed: 2026-11-01'))
  ok('after the bump one row is overdue', overdue(parseRows(after), today).length === 1)
  const now = ['## Where it is right now', '', '- **Skill review dates.** typed by hand', '- other']
  const written = writeNow(now.join('\n'), line(rows, today))
  ok('writes the line in place of the hand-typed one', written.split('\n')[2].startsWith(`- ${MARK}`) && written.includes('2 of 3 skills') && written.split('\n')[3] === '- other')
  ok('rewrites its own line on the next run', writeNow(written, line(parseRows(after), today)).includes('1 of 3 skills'))
  let threw = false
  try { writeNow('no such line', 'x') } catch { threw = true }
  ok('refuses a NOW.md with nowhere to write', threw)
  let failed = 0
  for (const [name, pass] of cases) { if (!pass) failed++; console.log(`${pass ? 'ok  ' : 'FAIL'}  ${name}`) }
  return failed
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const args = process.argv.slice(2)
  if (args.includes('--self-test')) {
    const failed = selfTest()
    console.log(failed ? `\n${failed} failed` : '\nSKILL REVIEWS SELF-TEST OK')
    process.exit(failed ? 1 : 0)
  }
  const today = new Date().toISOString().slice(0, 10)
  let registry = readFileSync(join(HARNESS, REGISTRY), 'utf8')
  let rows = parseRows(registry)
  if (!rows.length) { console.error(`No production rows read from ${REGISTRY}.`); process.exit(1) }
  if (args.includes('--bump')) {
    const since = rows.map((r) => r.reviewed).sort()[0]
    const moved = bumps(rows, commitsSince(since), today)
    for (const [name, date] of Object.entries(moved)) console.log(`review date moved: ${name} -> ${date} (a ruling on a change to it)`)
    if (Object.keys(moved).length) {
      registry = applyBumps(registry, moved)
      rows = parseRows(registry)
      if (args.includes('--write')) writeFileSync(join(HARNESS, REGISTRY), registry)
    }
  }
  const out = line(rows, today)
  console.log(out)
  if (args.includes('--write')) {
    const nowPath = join(HARNESS, 'NOW.md')
    writeFileSync(nowPath, writeNow(readFileSync(nowPath, 'utf8'), out))
  }
}
