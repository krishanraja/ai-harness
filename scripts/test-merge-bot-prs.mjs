#!/usr/bin/env node
/**
 * The bot pull request merger merges only what its guards allow
 * (Ruling, Krish, 2026-10-28), against a fake GitHub that records every call.
 *
 * Dependency-free, no credential, no network.
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'
import { blockFor, splice } from './render.mjs'
import { BotPrs, kindOf, checksGreen, canonPlan, machinePlan, stewardPlan, orphanPlan, waitingBlocker, SELF_CHECK, targets } from './merge-bot-prs.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const fleet = parseYaml(readFileSync(join(HARNESS, 'state/fleet.yaml'), 'utf8'))
const OWNER = fleet.owner
const NOW = Date.parse('2026-10-28T12:00:00Z')

// ------------------------------------------------------------------ pure rules
const pr = (ref, extra = {}) => ({ number: 1, head: { ref, sha: 'h1', repo: { full_name: `${OWNER}/x` } }, base: { repo: { full_name: `${OWNER}/x` } }, user: { login: OWNER }, created_at: '2026-10-27T00:00:00Z', ...extra })
assert.equal(kindOf(pr('harness/canon-sync'), 'x', OWNER), 'canon-sync')
assert.equal(kindOf(pr('machine-sync/lorimer/v2026.10.27.2-20261028T010000Z'), 'ai-harness', OWNER), 'machine-evidence')
assert.equal(kindOf(pr('machine-sync/lorimer/v1-2'), 'heartside', OWNER), 'person', 'machine evidence belongs to ai-harness only')
assert.equal(kindOf(pr('steward/2026-10-23'), 'x', OWNER), 'steward-fallback')
assert.equal(kindOf(pr('harness/change-2026-10-18-x'), 'x', OWNER), 'harness', 'change requests keep their own lifecycle')
assert.equal(kindOf(pr('claude/some-session'), 'x', OWNER), 'person')
assert.equal(kindOf({ ...pr('harness/canon-sync'), user: { login: 'someone-else' } }, 'x', OWNER), 'person', 'only the fleet owner opens bot pull requests')
assert.equal(kindOf({ ...pr('harness/canon-sync'), head: { ref: 'harness/canon-sync', repo: { full_name: 'fork/x' } } }, 'x', OWNER), 'person', 'a fork is never a bot pull request')

const run = (name, conclusion, status = 'completed') => ({ name, status, conclusion })
assert.equal(checksGreen({ runs: [run('closeout', 'success'), run('typecheck', 'skipped')], statuses: { vercel: 'success' } }, ['closeout']).green, true)
assert.deepEqual(checksGreen({ runs: [run('typecheck', 'failure')] }).failing, ['typecheck'])
assert.equal(checksGreen({ runs: [run('closeout', null, 'in_progress')] }).green, false)
assert.equal(checksGreen({ runs: [run('closeout', 'success')] }, ['operating-context']).green, false, 'a required check that never ran is not green')
assert.equal(checksGreen({ runs: [run('closeout', 'success'), run(SELF_CHECK, null, 'in_progress')] }, ['closeout']).green, true, 'the merger never waits for its own job')
assert.deepEqual(checksGreen({ runs: [], statuses: { 'harness/judge': 'error' } }).failing, ['harness/judge'])

const T = 'AGENTS.md'
assert.equal(canonPlan({ baseText: 'w', headText: 'w', files: [T], target: T, wanted: 'w' }).action, 'close', 'base already current: replaced')
assert.equal(canonPlan({ baseText: 'a', headText: 'w', files: [T, 'src/x.ts'], target: T, wanted: 'w' }).action, 'hold', 'another file on the branch is never merged or rebuilt')
assert.equal(canonPlan({ baseText: 'a', headText: 'old', files: [T], target: T, wanted: 'w' }).action, 'rebuild')
assert.equal(canonPlan({ baseText: 'a', headText: 'w', files: [T], target: T, wanted: 'w', mergeable: 'dirty' }).action, 'rebuild')
assert.equal(canonPlan({ baseText: 'a', headText: 'w', files: [T], target: T, wanted: 'w', mergeable: 'behind' }).action, 'rebuild')
assert.equal(canonPlan({ baseText: 'a', headText: 'w', files: [T], target: T, wanted: 'w', mergeable: 'clean' }).action, 'merge')

const M = ['state/deployments/lorimer.json', 'state/canaries/x.json', 'state/machine-runs/r.json', 'brain/usage.jsonl']
assert.equal(machinePlan({ files: M, mergeable: 'clean' }).action, 'merge')
assert.equal(machinePlan({ files: [...M, 'scripts/x.mjs'], mergeable: 'clean' }).action, 'hold', 'evidence that touches code is a person\'s to merge')
assert.equal(machinePlan({ files: ['state/skill-registry.yaml'], mergeable: 'clean' }).action, 'hold')
assert.equal(machinePlan({ files: M, mergeable: 'dirty', newer: true }).action, 'close')
assert.equal(machinePlan({ files: M, mergeable: 'dirty', newer: false }).action, 'hold')
assert.equal(machinePlan({ files: M, mergeable: 'behind' }).action, 'update-branch')

assert.equal(stewardPlan({ ref: 'steward/2026-10-23', commits: [{ sha: 'abcdef12', subject: 'docs(steward): 2026-10-24 re-stamp', date: '2026-10-24' }] }).action, 'close')
assert.equal(stewardPlan({ ref: 'steward/2026-10-23', commits: [{ sha: 'abcdef12', subject: 'docs(steward): 2026-10-23 same day', date: '2026-10-23' }] }).action, 'none')
assert.equal(stewardPlan({ ref: 'steward/2026-10-23', commits: [{ sha: 'abcdef12', subject: 'feat: product', date: '2026-10-25' }] }).action, 'none')

assert.equal(waitingBlocker([]), null)
const blocker = waitingBlocker([{ repo: 'heartside', number: 65, title: 'Fix things', age_days: 3, mergeable: 'dirty', failing: [] }])
assert.equal(blocker.title, '1 pull request waits on you'); assert.match(blocker.detail, /heartside#65 Fix things \(3 days, conflicts\)/)

// ------------------------------------------------------------- against a fake
const heartside = fleet.repos.find((r) => r.name === 'heartside')
const harness = fleet.repos.find((r) => r.name === 'ai-harness')
assert.ok(heartside && harness)
assert.ok(targets(fleet).some((r) => r.name === 'ai-harness') && !targets(fleet).some((r) => r.name === 'mindmake'), 'the merger covers what the sync covers, and never mindmake')
const BASE_TEXT = '# AGENTS.md\n\nThe repository\'s own words.\n'
const WANTED = splice(BASE_TEXT, blockFor(BASE_TEXT, heartside))

function fakeGh({ pulls = {}, files = {}, checks = {}, prFiles = {}, commits = {}, branches = {}, allPulls = {} }) {
  const calls = []
  const key = (repo, n) => `${repo}#${n}`
  return {
    owner: OWNER, calls,
    async openPulls(repo) { return (pulls[repo] || []).filter((p) => p.state !== 'closed') },
    async defaultBranch() { return { branch: 'main' } },
    async headSha() { return 'base1' },
    async getPull(repo, n) { return (pulls[repo] || []).find((p) => p.number === n) },
    async getFile(repo, path, ref) { const t = files[`${repo}:${ref}:${path}`]; return t == null ? null : { text: t, sha: 'blob' } },
    async pullFiles(repo, n) { return prFiles[key(repo, n)] || [] },
    async checksFor(repo, sha) { return checks[`${repo}:${sha}`] || { runs: [], statuses: {} } },
    async recentCommits(repo) { return commits[repo] || [] },
    async headMessage(repo, branch) { return `docs(steward): fallback for ${branch}\n\nGuard 1 failed: validator said X.` },
    async branchesWithPrefix(repo, prefix) { return (branches[repo] || []).filter((b) => b.startsWith(prefix)) },
    async listPulls(repo, { head }) { return (allPulls[repo] || []).filter((p) => p.head?.ref === head) },
    async openPull(repo, opts) { calls.push(['open', repo, opts]); return { number: 999, html_url: `https://github.com/${OWNER}/${repo}/pull/999` } },
    async rebuildBranch(...a) { calls.push(['rebuild', ...a]); return { sha: 'rebuilt' } },
    async updateBranch(...a) { calls.push(['update-branch', ...a]) },
    async mergePull(repo, n, opts) { calls.push(['merge', repo, n, opts]); files[`${repo}:merged-${n}:${Object.keys(files).find((k) => k.startsWith(`${repo}:${opts.sha}:`))?.split(':')[2]}`] = undefined; return { merged: true, sha: `merged-${n}` } },
    async comment(...a) { calls.push(['comment', ...a]) },
    async closePull(repo, n) { calls.push(['close', repo, n]); const p = pulls[repo].find((x) => x.number === n); p.state = 'closed' },
  }
}
const open = (repo, number, ref, extra = {}) => ({ number, title: `t${number}`, html_url: `https://github.com/${OWNER}/${repo}/pull/${number}`, state: 'open', mergeable_state: 'clean', head: { ref, sha: `head${number}`, repo: { full_name: `${OWNER}/${repo}` } }, base: { repo: { full_name: `${OWNER}/${repo}` } }, user: { login: OWNER }, created_at: '2026-10-26T00:00:00Z', ...extra })
const GREEN_CANON = { runs: [run('operating-context', 'success'), run('closeout', 'success')] }

// A green canon sync merges at the head it checked, and is read back from main.
{
  const files = { [`heartside:base1:${T}`]: BASE_TEXT, [`heartside:head58:${T}`]: WANTED, [`heartside:merged-58:${T}`]: WANTED }
  const gh = fakeGh({ pulls: { heartside: [open('heartside', 58, 'harness/canon-sync'), open('heartside', 65, 'claude/acceptance-fixes')] }, files, prFiles: { 'heartside#58': [T] }, checks: { 'heartside:head58': GREEN_CANON, 'heartside:head65': { runs: [run('closeout', 'failure')] } } })
  gh.mergePull = async (repo, n, opts) => { gh.calls.push(['merge', repo, n, opts]); return { merged: true, sha: `merged-${n}` } }
  const r = new BotPrs(gh, { fleet, now: NOW })
  await r.repo(heartside)
  const merges = gh.calls.filter((c) => c[0] === 'merge')
  assert.equal(merges.length, 1, 'only the bot pull request merges'); assert.equal(merges[0][2], 58); assert.equal(merges[0][3].sha, 'head58', 'the merge names the head that was checked')
  assert.match(merges[0][3].title, /^docs\(canon\): sync the canon block to \S+ \(#58\)$/)
  assert.equal(r.results.find((x) => x.number === 58).action, 'merged')
  assert.deepEqual(r.waiting.map((w) => [w.number, w.failing]), [[65, ['closeout']]], 'the person\'s pull request is listed, never merged')
}

// A read-back that disagrees with what was checked is an error, not a success.
{
  const files = { [`heartside:base1:${T}`]: BASE_TEXT, [`heartside:head58:${T}`]: WANTED, [`heartside:merged-58:${T}`]: BASE_TEXT }
  const gh = fakeGh({ pulls: { heartside: [open('heartside', 58, 'harness/canon-sync')] }, files, prFiles: { 'heartside#58': [T] }, checks: { 'heartside:head58': GREEN_CANON } })
  gh.mergePull = async () => ({ merged: true, sha: 'merged-58' })
  const r = new BotPrs(gh, { fleet, now: NOW }); await r.repo(heartside)
  assert.equal(r.results[0].action, 'error'); assert.equal(r.results[0].reason, 'readback-mismatch')
}

// Red checks hold it and list it; pending checks wait; a stale head is rebuilt on base.
{
  const files = { [`heartside:base1:${T}`]: BASE_TEXT, [`heartside:head58:${T}`]: WANTED }
  const red = fakeGh({ pulls: { heartside: [open('heartside', 58, 'harness/canon-sync')] }, files, prFiles: { 'heartside#58': [T] }, checks: { 'heartside:head58': { runs: [run('operating-context', 'success'), run('typecheck', 'failure')] } } })
  const r1 = new BotPrs(red, { fleet, now: NOW }); await r1.repo(heartside)
  assert.equal(red.calls.filter((c) => c[0] === 'merge').length, 0); assert.match(r1.results[0].reason, /typecheck/); assert.equal(r1.waiting[0].held, 'checks-failing')
  const pending = fakeGh({ pulls: { heartside: [open('heartside', 58, 'harness/canon-sync')] }, files, prFiles: { 'heartside#58': [T] }, checks: { 'heartside:head58': { runs: [run('operating-context', null, 'queued')] } } })
  const r2 = new BotPrs(pending, { fleet, now: NOW }); await r2.repo(heartside)
  assert.equal(r2.results[0].action, 'await-checks'); assert.equal(r2.awaiting.length, 1)
  const stale = fakeGh({ pulls: { heartside: [open('heartside', 58, 'harness/canon-sync')] }, files: { [`heartside:base1:${T}`]: BASE_TEXT, [`heartside:head58:${T}`]: 'an older render' }, prFiles: { 'heartside#58': [T] } })
  const r3 = new BotPrs(stale, { fleet, now: NOW }); await r3.repo(heartside)
  const rebuild = stale.calls.find((c) => c[0] === 'rebuild')
  assert.deepEqual(rebuild.slice(1, 5), ['heartside', 'harness/canon-sync', 'base1', { [T]: WANTED }], 'one commit on the current base carrying exactly the wanted file')
  assert.equal(stale.calls.filter((c) => c[0] === 'merge').length, 0, 'a rebuilt head waits for its own checks')
}

// A branch someone added files to is held, never merged or rebuilt; a base that is already current closes it.
{
  const files = { [`heartside:base1:${T}`]: BASE_TEXT, [`heartside:head58:${T}`]: WANTED }
  const gh = fakeGh({ pulls: { heartside: [open('heartside', 58, 'harness/canon-sync')] }, files, prFiles: { 'heartside#58': [T, 'src/app.ts'] }, checks: { 'heartside:head58': GREEN_CANON } })
  const r = new BotPrs(gh, { fleet, now: NOW }); await r.repo(heartside)
  assert.equal(gh.calls.length, 0); assert.equal(r.waiting[0].held, 'branch-has-other-files')
  const done = fakeGh({ pulls: { heartside: [open('heartside', 58, 'harness/canon-sync')] }, files: { [`heartside:base1:${T}`]: WANTED, [`heartside:head58:${T}`]: WANTED }, prFiles: { 'heartside#58': [T] } })
  await new BotPrs(done, { fleet, now: NOW }).repo(heartside)
  assert.deepEqual(done.calls.map((c) => c[0]), ['comment', 'close'], 'a replaced sync says why, then closes')
  assert.match(done.calls[0][3], /Ruling, Krish, 2026-10-28/)
}

// Machine evidence: green and records-only merges; anything else is held; a conflicting older one closes when a newer one is open.
{
  const MR = 'machine-sync/lorimer/v2026.10.27.2-1'
  const files = { 'ai-harness:head7:state/deployments/lorimer.json': '{"ok":true}\n', 'ai-harness:merged-7:state/deployments/lorimer.json': '{"ok":true}\n' }
  const gh = fakeGh({ pulls: { 'ai-harness': [open('ai-harness', 7, MR)] }, files, prFiles: { 'ai-harness#7': ['state/deployments/lorimer.json'] }, checks: { 'ai-harness:head7': { runs: [run('closeout', 'success'), run('surfaces', 'success'), run(SELF_CHECK, null, 'in_progress')] } } })
  gh.mergePull = async (repo, n, opts) => { gh.calls.push(['merge', repo, n, opts]); return { merged: true, sha: `merged-${n}` } }
  const r = new BotPrs(gh, { fleet, now: NOW }); await r.repo(harness)
  assert.equal(r.results[0].action, 'merged'); assert.equal(gh.calls.find((c) => c[0] === 'merge')[3].sha, 'head7')
  const code = fakeGh({ pulls: { 'ai-harness': [open('ai-harness', 8, MR)] }, prFiles: { 'ai-harness#8': ['state/deployments/lorimer.json', 'scripts/sync.mjs'] } })
  const r2 = new BotPrs(code, { fleet, now: NOW }); await r2.repo(harness)
  assert.equal(code.calls.length, 0); assert.equal(r2.results[0].reason, 'not-only-machine-records')
  const older = open('ai-harness', 9, 'machine-sync/lorimer/v1-1', { mergeable_state: 'dirty', created_at: '2026-10-20T00:00:00Z' })
  const newer = open('ai-harness', 10, 'machine-sync/lorimer/v1-2', { mergeable_state: 'dirty', created_at: '2026-10-21T00:00:00Z' })
  const both = fakeGh({ pulls: { 'ai-harness': [older, newer] }, prFiles: { 'ai-harness#9': ['state/deployments/lorimer.json'], 'ai-harness#10': ['state/deployments/lorimer.json'] } })
  const r3 = new BotPrs(both, { fleet, now: NOW }); await r3.repo(harness)
  assert.deepEqual(both.calls.filter((c) => c[0] === 'close').map((c) => c[2]), [9], 'the older conflicting evidence closes; the newer one waits for a person')
  assert.equal(r3.results.find((x) => x.number === 10).reason, 'conflict')
}

// A docs steward fallback closes once a later steward run landed; a person's pull request never does.
{
  const gh = fakeGh({ pulls: { heartside: [open('heartside', 3, 'steward/2026-10-23'), open('heartside', 4, 'steward/2026-10-28')] }, commits: { heartside: [{ sha: 'abc1234def', subject: 'docs(steward): 2026-10-27 re-stamp head', date: '2026-10-27' }] } })
  const r = new BotPrs(gh, { fleet, now: NOW }); await r.repo(heartside)
  assert.deepEqual(gh.calls.filter((c) => c[0] === 'close').map((c) => c[2]), [3])
  assert.equal(r.waiting.map((w) => w.number).includes(4), true, 'a fallback with no later run waits on Krish')
}

// Orphan steward fallback branches: the newest gets a pull request, older ones are only reported.
assert.deepEqual(orphanPlan({ orphans: ['steward/2026-10-19', 'steward/2026-10-29', 'steward/2026-10-27-b'], commits: [] }), { open: 'steward/2026-10-29', superseded: ['steward/2026-10-19', 'steward/2026-10-27-b'] })
assert.deepEqual(orphanPlan({ orphans: ['steward/2026-10-27'], commits: [{ sha: 'abcdef12', subject: 'docs(steward): 2026-10-28 re-stamp', date: '2026-10-28' }] }), { open: null, superseded: ['steward/2026-10-27'] }, 'a later steward commit replaces even the newest')
assert.deepEqual(orphanPlan({ orphans: [], commits: [] }), { open: null, superseded: [] })
// The 2026-10-29 regression: an older orphan is never opened while a newer fallback branch, with a pull request, exists.
assert.deepEqual(orphanPlan({ orphans: ['steward/2026-10-25', 'steward/2026-10-27'], branches: ['steward/2026-10-25', 'steward/2026-10-27', 'steward/2026-10-29', 'steward/2026-10-30'], commits: [] }), { open: null, superseded: ['steward/2026-10-25', 'steward/2026-10-27'] })
{
  const gh = fakeGh({ pulls: { 'content-engine': [] }, branches: { 'content-engine': ['steward/2026-10-19', 'steward/2026-10-29', 'steward/2026-10-27-b', 'claude/x'] }, allPulls: { 'content-engine': [{ number: 5, head: { ref: 'steward/2026-10-19' } }] } })
  const r = new BotPrs(gh, { fleet, now: NOW }); await r.repo(fleet.repos.find((x) => x.name === 'content-engine'))
  const opened = gh.calls.filter((c) => c[0] === 'open')
  assert.equal(opened.length, 1, 'one pull request, for the newest orphan only')
  assert.equal(opened[0][2].head, 'steward/2026-10-29'); assert.match(opened[0][2].title, /^docs\(steward\): 2026-10-29 needs review$/)
  assert.match(opened[0][2].body, /> Guard 1 failed: validator said X\./, 'the steward\'s own reason travels into the pull request')
  assert.deepEqual(r.results.filter((x) => x.action === 'orphan-superseded').map((x) => x.reason), ['steward/2026-10-27-b'], 'a branch that already had a pull request is not an orphan')
  assert.equal(gh.calls.filter((c) => c[0] !== 'open').length, 0, 'nothing is deleted or closed')
}

// The wait loop merges what turns green, and stops at its deadline.
{
  const files = { [`heartside:base1:${T}`]: BASE_TEXT, [`heartside:head58:${T}`]: WANTED, [`heartside:merged-58:${T}`]: WANTED }
  const checks = { 'heartside:head58': { runs: [run('operating-context', null, 'in_progress')] } }
  const gh = fakeGh({ pulls: { heartside: [open('heartside', 58, 'harness/canon-sync')] }, files, prFiles: { 'heartside#58': [T] }, checks })
  gh.mergePull = async (repo, n, opts) => { gh.calls.push(['merge', repo, n, opts]); return { merged: true, sha: `merged-${n}` } }
  const r = new BotPrs(gh, { fleet, now: NOW }); await r.repo(heartside)
  assert.equal(r.awaiting.length, 1)
  await r.drain(60, { every: 0, sleep: async () => { checks['heartside:head58'] = GREEN_CANON } })
  assert.equal(r.results.filter((x) => x.number === 58).map((x) => x.action).join(), 'merged', 'one row per pull request, the latest outcome')
  const stuck = new BotPrs(fakeGh({ pulls: { heartside: [open('heartside', 58, 'harness/canon-sync')] }, files, prFiles: { 'heartside#58': [T] }, checks: { 'heartside:head58': { runs: [run('operating-context', null, 'queued')] } } }), { fleet, now: NOW })
  await stuck.repo(heartside)
  await stuck.drain(0)
  assert.equal(stuck.awaiting.length, 1, 'no time, no waiting')
}

console.log('BOT PR MERGER OK: kinds, checks, canon, machine evidence and steward plans, orphan fallbacks, merge at the checked head with read-back, holds, closes and the wait loop')
