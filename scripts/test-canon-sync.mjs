#!/usr/bin/env node
/**
 * Proves the canon sync skips a repository marked `canon_sync: false`.
 *
 * Krish closed the canon pull request on the mindmake repository and ruled on
 * 2026-10-06 that it stays out of the rollout. Before this flag existed the
 * reconciler would still classify mindmake as `canon-moved` whenever a release
 * moved the stamp, and reopen a stamp-only pull request there every night.
 *
 * The proof runs the real reconciler, not a copy of its logic, with fetch
 * replaced by a function that throws. Any request at all becomes an error row
 * and a non-zero exit. A positive control runs the same stub against a synced
 * repository and must hit the network, so the stub cannot pass by accident.
 *
 * Dependency-free, no credential, no network.
 */

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'
import { isCanonSynced, canonSyncRepos, canonExcludedRepos, canonSyncProblems } from './lib/fleet.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const fleet = parseYaml(readFileSync(join(HARNESS, 'state/fleet.yaml'), 'utf8'))
const names = (rows) => rows.map((r) => r.name)

// ------------------------------------------------ the live fleet configuration
const mindmake = fleet.repos.find((r) => r.name === 'mindmake')
assert(mindmake, 'mindmake must stay in state/fleet.yaml for parity with the docs steward fleet')
assert.equal(mindmake.canon_sync, false, 'mindmake must carry canon_sync: false')
assert(String(mindmake.canon_sync_reason || '').includes('Ruling (Krish, 2026-10-06)'), 'the exclusion must cite the ruling')
assert(!names(canonSyncRepos(fleet)).includes('mindmake'), 'mindmake must not be a sync target')
assert.deepEqual(names(canonExcludedRepos(fleet)), ['mindmake'], 'mindmake is the only excluded repository')
assert(names(canonSyncRepos(fleet)).includes('ai-harness'), 'the canon repository is never exempt from its own treatment')
assert.deepEqual(canonSyncProblems(fleet), [], 'the live flags are well formed')

// ------------------------------------------------------ the flag fails closed
assert.equal(isCanonSynced({ name: 'a' }), true, 'no flag means synced')
assert.equal(isCanonSynced({ name: 'a', canon_sync: true }), true)
assert.equal(isCanonSynced({ name: 'a', canon_sync: 'no' }), true, 'only the boolean false excludes')
assert.equal(isCanonSynced({ name: 'a', canon_sync: false }), false)
assert.equal(canonSyncProblems({ repos: [{ name: 'a', canon_sync: 'no' }] }).length, 1, 'a non-boolean flag is a validator failure')
assert.equal(canonSyncProblems({ repos: [{ name: 'a', canon_sync: false }] }).length, 1, 'an exclusion with no reason is a validator failure')
assert.deepEqual(canonSyncProblems({ repos: [{ name: 'a', canon_sync: false, canon_sync_reason: 'Ruling' }] }), [])

// --------------------------------------------- the real reconciler, no network
const NO_NETWORK = 'data:text/javascript,globalThis.fetch=async()=>{throw new Error("network blocked by test-canon-sync")}'
const run = (...args) => spawnSync(process.execPath, ['--import', NO_NETWORK, join(HARNESS, 'scripts/reconcile.mjs'), ...args], {
  cwd: HARNESS,
  encoding: 'utf8',
  env: { ...process.env, FLEET_TOKEN: 'test-placeholder-not-a-credential', GITHUB_TOKEN: '' },
})

const plan = run('--list-targets')
assert.equal(plan.status, 0, plan.stderr)
assert.match(plan.stdout, /^excluded mindmake$/m, 'the plan lists mindmake as excluded')
assert.doesNotMatch(plan.stdout, /^sync +mindmake$/m, 'the plan never lists mindmake as a sync target')

// A full (non dry) run scoped to mindmake: the path that opens pull requests.
const skipped = run('--repo', 'mindmake')
assert.equal(skipped.status, 0, `reconciling mindmake must make no request at all:\n${skipped.stdout}\n${skipped.stderr}`)
assert.match(skipped.stdout, /\| mindmake \| `excluded` \|/, 'the report names mindmake as excluded')
assert.doesNotMatch(skipped.stdout, /network blocked/, 'no request was attempted for mindmake')
assert.match(skipped.stdout, /Summary: excluded=1\b/, 'exactly one row, and it is the exclusion')

// Positive control: a synced repository does reach for the network, so the
// stub above is live and the skip is real rather than a quiet no-op.
const control = run('--repo', 'control-center', '--dry-run')
assert.notEqual(control.status, 0, 'a synced repository must attempt a request under the stub')
assert.match(control.stdout, /network blocked by test-canon-sync/, 'the stub intercepted the synced repository')

console.log('CANON SYNC TESTS PASSED: mindmake stays in the fleet, is excluded from the rollout, and the real reconciler makes no request for it; a synced repository still does')
