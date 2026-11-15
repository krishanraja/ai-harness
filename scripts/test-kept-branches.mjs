#!/usr/bin/env node
/**
 * The branches the weekly sweep keeps reach the weekly digest (Ruling, Krish,
 * 2026-11-15), by the sweep's own rules, read-only. No network: GitHub is a
 * stub that refuses anything but GET.
 */

import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { KEEP_NAMES, keepReason, pullIndex, needsYou, keptIn, keptAcrossFleet, keptSection, keptBlocker, SWEEP_WORKFLOW } from './kept-branches.mjs'
import { buildDigest } from './digest.mjs'
import { loadPolicy } from './propose.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
let passed = 0, failed = 0
const test = (name, condition) => { if (condition) passed++; else failed++; console.log(`${condition ? 'ok  ' : 'FAIL'}  ${name}`) }

// The rules are the sweep's: its KEEP_NAMES must match, or one of the two drifted.
const py = readFileSync(join(HARNESS, '.github/scripts/branch_sweep.py'), 'utf8')
const pyKeep = new Set([...py.match(/KEEP_NAMES = \{([^}]*)\}/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]))
test('KEEP_NAMES match branch_sweep.py', pyKeep.size === KEEP_NAMES.size && [...pyKeep].every((n) => KEEP_NAMES.has(n)))

const FULL = 'krishanraja/demo'
const mine = (ref, sha = 's') => ({ ref, sha, repo: { full_name: FULL } })
const pulls = [
  { number: 1, state: 'open', head: mine('feature-a'), base: { ref: 'main' } },
  { number: 2, state: 'open', head: { ref: 'fork', sha: 'x', repo: { full_name: 'someone/demo' } }, base: { ref: 'stack-base' } },
  { number: 3, state: 'closed', merged_at: '2026-11-01T00:00:00Z', head: mine('squashed', 'abc') },
  { number: 4, state: 'closed', merged_at: null, head: mine('abandoned', 'def') },
]
const idx = pullIndex(pulls, FULL)
test('an open pull request keeps its head and its base', idx.openRefs.has('feature-a') && idx.openRefs.has('stack-base'))
test("a fork's head is not this repository's branch", !idx.openRefs.has('fork'))
test('a merged head is recorded at its commit', idx.mergedHeads.get('squashed')?.has('abc'))
test('a closed unmerged pull request is remembered', idx.closedHead.get('abandoned') === 4)

const ctx = (compare) => ({ defaultBranch: 'main', openRefs: idx.openRefs, mergedHeads: idx.mergedHeads, compare })
test('the default branch is never listed', keepReason({ name: 'main', sha: 'm' }, ctx()) === null)
test('a KEEP_NAMES branch is never listed', keepReason({ name: 'gh-pages', sha: 'g' }, ctx()) === null)
test('a protected branch is kept as protected', keepReason({ name: 'release', sha: 'r', protected: true }, ctx()) === 'protected')
test('a branch with an open pull request is kept', keepReason({ name: 'feature-a', sha: 's' }, ctx()) === 'open pull request')
test('a branch at its merged head is the sweep\'s to delete', keepReason({ name: 'squashed', sha: 'abc' }, ctx()) === null)
test('a branch contained in main is the sweep\'s to delete', keepReason({ name: 'old', sha: 'o' }, ctx({ ahead_by: 0 })) === null)
test('a branch ahead of main is kept', keepReason({ name: 'abandoned', sha: 'def' }, ctx({ ahead_by: 3 })) === 'has work not on main')
test('an unreadable comparison keeps the branch', keepReason({ name: 'odd', sha: 'q' }, ctx({ error: 502 })) === 'compare failed: HTTP 502')

test('stale unmerged work with no pull request needs Krish', needsYou({ reason: 'has work not on main', age_days: 5, pr: null }))
test('a day-old branch does not yet', !needsYou({ reason: 'has work not on main', age_days: 1, pr: null }))
test('a branch with an open pull request does not', !needsYou({ reason: 'open pull request', age_days: 30, pr: 9 }))
test('a protected branch does not', !needsYou({ reason: 'protected', age_days: 30, pr: null }))

// A stubbed GitHub that only answers GET.
const NOW = Date.parse('2026-11-16T12:00:00Z')
const day = (n) => new Date(NOW - n * 86400000).toISOString()
const branches = [
  { name: 'main', commit: { sha: 'm' } }, { name: 'gh-pages', commit: { sha: 'g' } },
  { name: 'feature-a', commit: { sha: 's' } }, { name: 'squashed', commit: { sha: 'abc' } },
  { name: 'abandoned', commit: { sha: 'def' } }, { name: 'fresh', commit: { sha: 'fr' } }, { name: 'old', commit: { sha: 'o' } },
]
const dates = { s: day(3), def: day(20), fr: day(0), o: day(40) }
const ahead = { def: 2, fr: 1, o: 0 }
const calls = []
const gh = {
  owner: 'krishanraja',
  async getFile(repo, path) { return repo === 'demo' && path === SWEEP_WORKFLOW ? { text: 'x' } : null },
  async req(method, path) {
    calls.push(`${method} ${path}`)
    if (method !== 'GET') throw new Error('kept branches never write')
    if (path.startsWith('/repos/krishanraja/broken')) { const e = new Error('nope'); e.status = 403; throw e }
    if (/\/repos\/krishanraja\/(demo|nosweep)$/.test(path)) return { default_branch: 'main', full_name: path.endsWith('demo') ? FULL : 'krishanraja/nosweep' }
    if (path.includes('/branches')) return path.includes('page=1') ? branches : []
    if (path.includes('/pulls')) return path.includes('page=1') ? pulls : []
    const cmp = path.match(/\/compare\/main\.\.\.(\w+)$/); if (cmp) return { ahead_by: ahead[cmp[1]] }
    const c = path.match(/\/commits\/(\w+)$/); if (c) return { commit: { committer: { date: dates[c[1]] } } }
    throw new Error(`unexpected ${path}`)
  },
}
const demo = await keptIn(gh, 'demo', { now: NOW })
test('only GET requests are made', calls.every((c) => c.startsWith('GET ')))
test('kept branches are the sweep\'s kept set, oldest first', JSON.stringify(demo.rows.map((r) => r.name)) === JSON.stringify(['abandoned', 'feature-a', 'fresh']))
const ab = demo.rows[0]
test('a kept branch carries its reason, last commit, age and pull requests', ab.reason === 'has work not on main' && ab.last_commit === day(20).slice(0, 10) && ab.age_days === 20 && ab.pr === null && ab.closed_pr === 4)
test('an open pull request is named on its branch', demo.rows[1].pr === 1)
test('a repository without the sweep is not reported', (await keptIn(gh, 'nosweep', { now: NOW })) === null)

const fleet = { repos: [{ name: 'demo' }, { name: 'nosweep' }, { name: 'broken' }] }
const report = await keptAcrossFleet(gh, fleet, { now: NOW })
test('one unreadable repository never hides the rest', report.repos.length === 1 && report.unreadable[0].repo === 'broken' && report.unreadable[0].reason === 'github-403')

const md = keptSection(report).join('\n')
test('the section is headed for the weekly report', md.startsWith('## Branches kept by the sweep'))
test('the section flags the stale branch with no pull request', /`abandoned`.*Needs a pull request or your yes to remove/.test(md) && !/`fresh`.*Needs/.test(md) && !/`feature-a`.*Needs/.test(md))
test('the section names unreadable repositories', md.includes('Could not read: broken (github-403)'))
test('the section never carries an em dash', !md.includes('\u2014'))

const blocker = keptBlocker(report)
test('a stale branch is something only Krish can act on', blocker && blocker.only_you === 'permission' && blocker.title === '1 branch needs a pull request or your yes to remove' && blocker.detail.startsWith('demo/abandoned (20 days)'))
test('no stale branch, no blocker', keptBlocker({ ...report, repos: [{ ...demo, rows: demo.rows.filter((r) => !needsYou(r)) }] }) === null)

const policy = loadPolicy()
const digest = buildDigest({ blockers: [blocker], branches: report, today: '2026-11-16', policy })
test('the digest speaks for a stale branch and lists every kept branch', digest && digest.md.includes('## Branches kept by the sweep') && digest.md.includes('`feature-a`') && digest.decisions[0].kind === 'branches')
test('the section survives the decision budget', (() => {
  const many = ['a', 'b', 'c', 'd'].map((t) => ({ kind: 'review', title: t, detail: t }))
  const d = buildDigest({ blockers: [...many, blocker], branches: report, today: '2026-11-16', policy })
  return d.decisions.length === Number(policy.decision_budget) && d.md.includes('`abandoned`')
})())
test('a silent week stays silent with branches that need nobody', buildDigest({ branches: { ...report, repos: [] }, today: '2026-11-16', policy }) === null)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) process.exit(1)
