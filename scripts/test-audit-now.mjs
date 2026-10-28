#!/usr/bin/env node
/**
 * The NOW.md audit flags what it promises to, and nothing else
 * (Ruling, Krish, 2026-10-28). Dependency-free, no credential, no network.
 */

import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { auditNow, openPrClaims, verdict, auditBlocker, renderReport, loadLimits, AUTOMATION } from './steward/audit-now.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const TODAY = '2026-10-28'
const limits = loadLimits(HARNESS)
const now = ({ asOf = TODAY, check = `- North Star check (${TODAY}): holds.`, where = '- Live and verified.', recent = `- ${TODAY} Shipped the thing because the old one failed.`, waiting = '- Next: ship it.' } = {}) =>
  `---\nrepo: krishanraja/x\nas_of: ${asOf}\nhead: abc1234\n---\n# X: where it is right now\n\n## What it is\nA thing.\n\n## Where it is right now (as of ${asOf})\n${where}\n\n## What changed recently\n\n${recent}\n\n## What is next and what is waiting on Krish\n${waiting}\n${check}\n\n## Read next\n\n## Do not trust\nNothing at the moment.\n`
const rules = (f) => f.filter((x) => x.severity === 'fail').map((x) => x.rule)

assert.deepEqual(auditNow({ text: now(), today: TODAY, limits }), [], 'a short, current NOW.md passes clean')
assert.deepEqual(rules(auditNow({ text: null, today: TODAY, limits })), ['missing'])
assert.deepEqual(rules(auditNow({ text: now({ asOf: '2026-10-01' }), today: TODAY, limits })), ['as_of_stale'])
assert.deepEqual(rules(auditNow({ text: now({ check: '- North Star check (2026-10-01): holds.' }), today: TODAY, limits })), ['north_star_check'])
assert.deepEqual(rules(auditNow({ text: now({ check: '' }), today: TODAY, limits })), ['north_star_check'])
assert.deepEqual(rules(auditNow({ text: now({ where: `- ${'x'.repeat(limits.max_line_chars + 1)}` }), today: TODAY, limits })), ['too_long'], 'one wall-of-text line fails even in a short file')
assert.deepEqual(rules(auditNow({ text: now({ where: Array.from({ length: 60 }, (_, i) => `Line ${i} ${'y'.repeat(300)}`).join('\n') }), today: TODAY, limits })), ['too_long'])
assert.deepEqual(rules(auditNow({ text: now({ recent: '- 2026-09-01 An old change that belongs in the log.' }), today: TODAY, limits })), ['recent_too_old'])
assert.deepEqual(rules(auditNow({ text: now({ recent: Array.from({ length: 13 }, () => `- ${TODAY} A change.`).join('\n') }), today: TODAY, limits })), ['recent_too_many'])
assert.deepEqual(rules(auditNow({ text: now({ where: Array.from({ length: 9 }, (_, i) => `- Status ${i}.`).join('\n') }), today: TODAY, limits })), ['where_too_many'])
assert.deepEqual(rules(auditNow({ text: now({ waiting: '- Next: one.\n- Next (2026-10-27): two.' }), today: TODAY, limits })), ['next_step'])
assert.deepEqual(rules(auditNow({ text: now({ waiting: '- Decide the price.' }), today: TODAY, limits })), ['next_step'])
assert.deepEqual(rules(auditNow({ text: now(), today: TODAY, notes: ['2026-10-25-old.md', '2026-10-28-today.md'], limits })), ['unfolded_notes'], 'only notes past their day are flagged')
assert.deepEqual(rules(auditNow({ text: now(), today: TODAY, unreconciled: '2026-10-20', limits })), ['unreconciled'])
assert.deepEqual(rules(auditNow({ text: now(), today: TODAY, unreconciled: '2026-10-27', limits })), [], 'a commit from yesterday is the steward\'s normal lag')

// The pull request claims: phrased as open, and GitHub says otherwise.
const claims = openPrClaims('- **The sync** (2026-10-27, PR 170, open).\n- Next: merge PR 171 so it stops.\n- Mentions PR 99 in passing.\n')
assert.deepEqual([...claims.keys()], [170, 171])
assert.equal(claims.get(171), 2, 'a claim carries its line number, never its text')
assert.deepEqual(rules(auditNow({ text: now({ where: '- The sync (2026-10-27, PR 170, open).' }), today: TODAY, prStates: { 170: 'merged' }, limits })), ['stale_pr_claim'])
assert.deepEqual(rules(auditNow({ text: now({ where: '- The sync (2026-10-27, PR 170, open).' }), today: TODAY, prStates: { 170: 'open' }, limits })), [], 'a claim that is still true passes')
// An old dated claim is a warning, never a failure on its own.
const warned = auditNow({ text: now({ where: '- Still waiting on the vendor since 2026-09-01.' }), today: TODAY, limits })
assert.deepEqual(warned.map((f) => [f.rule, f.severity]), [['old_dated_claims', 'warn']])

// Verdicts carry the start of a failure; the digest hears only about long ones.
const failing = auditNow({ text: now({ asOf: '2026-10-01' }), today: TODAY, limits })
assert.equal(verdict('x', failing, TODAY, null).failing_since, TODAY)
assert.equal(verdict('x', failing, TODAY, { repos: [{ repo: 'x', status: 'fail', failing_since: '2026-10-20' }] }).failing_since, '2026-10-20')
assert.equal(verdict('x', [], TODAY, { repos: [{ repo: 'x', status: 'fail', failing_since: '2026-10-20' }] }).failing_since, null, 'a pass clears it')
const report = { date: TODAY, repos: [verdict('a', failing, TODAY, { repos: [{ repo: 'a', status: 'fail', failing_since: '2026-10-20' }] }), verdict('b', failing, TODAY, null), verdict('c', [], TODAY, null)] }
const blocker = auditBlocker(report, TODAY, limits)
assert.match(blocker.title, /^1 NOW\.md file the steward has not fixed/); assert.match(blocker.detail, /a \(since 2026-10-20: as_of_stale\)/); assert.doesNotMatch(blocker.detail, /\bb \(/)
assert.equal(auditBlocker({ repos: [report.repos[2]] }, TODAY, limits), null)
assert.match(renderReport(report), /\| a \| fail \| 2026-10-20 \| as_of_stale \|/)
assert.ok(AUTOMATION.test('chore(audit): NOW.md audit 2026-10-28') && AUTOMATION.test('docs(closeout): fold closeout notes into NOW.md'))

// Local mode against real git: a product commit after the last NOW.md update is unreconciled.
const dir = mkdtempSync(join(tmpdir(), 'now-audit-'))
const g = (date, ...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_DATE: `${date}T10:00:00Z`, GIT_COMMITTER_DATE: `${date}T10:00:00Z` } })
try {
  g(TODAY, 'init', '-q', '-b', 'main'); g(TODAY, 'config', 'user.email', 't@example.invalid'); g(TODAY, 'config', 'user.name', 'T')
  writeFileSync(join(dir, 'NOW.md'), now()); g('2026-10-20', 'add', '-A'); g('2026-10-20', 'commit', '-qm', 'Close out')
  writeFileSync(join(dir, 'a.ts'), '1\n'); g('2026-10-21', 'add', '-A'); g('2026-10-21', 'commit', '-qm', 'Product change')
  writeFileSync(join(dir, 'b.md'), 'x\n'); g('2026-10-22', 'add', '-A'); g('2026-10-22', 'commit', '-qm', 'docs(steward): 2026-10-22 nothing')
  mkdirSync(join(dir, 'now-notes')); writeFileSync(join(dir, 'now-notes/2026-10-21-x.md'), 'Status: x\n')
  const out = execFileSync(process.execPath, [join(HARNESS, 'scripts/steward/audit-now.mjs'), dir, '--today', TODAY], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).toString()
  assert.fail(`expected a failing exit, got:\n${out}`)
} catch (e) {
  if (e.code === 'ERR_ASSERTION') throw e
  assert.equal(e.status, 1, 'a failing audit exits 1')
  assert.match(String(e.stdout), /unreconciled`: A product commit from 2026-10-21/)
  assert.match(String(e.stdout), /unfolded_notes/)
} finally { rmSync(dir, { recursive: true, force: true }) }

console.log('NOW AUDIT OK: every rule fires on its case and only then, pull request claims, failure dates, the digest line and local mode')
