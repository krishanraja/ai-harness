#!/usr/bin/env node
/**
 * A machine heartbeat says why it is not ok, in one word from a fixed list,
 * and since when. The ledger is public, so free text never lands: anything
 * off the list is stored as `unrecognised`. The PowerShell sync and this
 * recorder must agree on the words, and every word must reach Krish in plain
 * language through the digest. No network.
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { REASONS } from './heartbeat-reasons.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
let passed = 0
let failed = 0
const test = (name, condition) => {
  if (condition) passed += 1
  else failed += 1
  console.log(`${condition ? 'ok  ' : 'FAIL'}  ${name}`)
}

const out = join(mkdtempSync(join(tmpdir(), 'heartbeat-')), 'heartbeats.json')
const beat = (status, reason, release = 'v2026.10.15.2') => {
  const args = [join(HARNESS, 'scripts/record-machine-heartbeat.mjs'), '--clock', 'harness-sync-lorimer', '--status', status, '--release', release, '--out', out]
  if (reason !== undefined) args.push('--reason', reason)
  execFileSync(process.execPath, args, { encoding: 'utf8' })
  return JSON.parse(readFileSync(out, 'utf8'))['harness-sync-lorimer']
}

const ok = beat('ok', '')
test('an ok beat carries no reason and no failing_since', ok.status === 'ok' && !('reason' in ok) && !('failing_since' in ok))

const first = beat('blocked', 'checkout-untracked')
test('a blocked beat stores its reason and starts failing_since and failing_runs', first.reason === 'checkout-untracked' && first.failing_since === first.last_run && first.failing_runs === 1)

const second = beat('blocked', 'install-failed')
test('a second blocked beat keeps failing_since, counts two runs, and appends the new word instead of writing over the first', second.failing_since === first.failing_since && second.failing_runs === 2 && second.reason === 'install-failed'
  && second.reasons.length === 2 && second.reasons[0].reason === 'checkout-untracked' && second.reasons[0].since === first.last_run && second.reasons[1].reason === 'install-failed' && second.reasons[1].since === second.last_run)

const same = beat('blocked', 'install-failed')
test('the same word again adds nothing and keeps the date it was first sent', same.failing_runs === 3 && same.reasons.length === 2 && same.reasons[1].since === second.last_run)

const leak = beat('blocked', 'C:\\Users\\someone\\client-folder')
test('free text is never stored: it becomes unrecognised', leak.reason === 'unrecognised' && leak.reasons.at(-1).reason === 'unrecognised' && !JSON.stringify(leak).includes('someone'))

const silentReason = beat('blocked', '')
test('an empty reason stores none and keeps the words already carried', !('reason' in silentReason) && silentReason.reasons.length === 3)

const healed = beat('ok', 'checkout-untracked')
test('the next ok beat clears the open span', !('reason' in healed) && !('failing_since' in healed) && !('failing_runs' in healed) && !('reasons' in healed))
test('and appends it to outages with its close and every word it carried', healed.outages?.length === 1 && healed.outages[0].since === first.failing_since && healed.outages[0].until === healed.last_run && healed.outages[0].runs === 5
  && healed.outages[0].reasons.map((r) => r.reason).join(',') === 'checkout-untracked,install-failed,unrecognised')
beat('blocked', 'release-assets')
const second_outage = beat('ok', '')
test('a second outage is appended, not written over the first', second_outage.outages?.length === 2 && second_outage.outages[0].since === first.failing_since && second_outage.outages[1].reasons[0].reason === 'release-assets')

// Today's shape: a blocked entry written before failing_since and reasons existed.
writeFileSync(out, JSON.stringify({ 'harness-sync-lorimer': { last_run: '2026-10-16T07:45:36.839Z', status: 'blocked', release: 'v2026.10.15.2', source: 'repository_dispatch' } }))
const carried = beat('blocked', 'checkout-untracked')
test('a blocked entry from before failing_runs counts as the first run', carried.failing_since === '2026-10-16T07:45:36.839Z' && carried.failing_runs === 2 && carried.reasons.length === 1)

// A damaged entry cannot inflate what reaches Krish.
writeFileSync(out, JSON.stringify({ 'harness-sync-lorimer': { last_run: 'yesterday', status: 'blocked', failing_since: '<b>', failing_runs: '999; x', reasons: [{ reason: 'C:\\Users\\x', since: 'now' }], outages: [{ since: 'x' }] } }))
const reset = beat('blocked', 'other')
test('values read back are checked: a damaged entry starts the span afresh', reset.failing_runs === 1 && reset.failing_since === reset.last_run && reset.reasons.length === 1 && reset.reasons[0].reason === 'other' && !('outages' in reset) && !JSON.stringify(reset).includes('999'))

// The sync's words must all be in the one shared list, which the recorder
// and the digest both import.
const reasons = new Set(Object.keys(REASONS))
const sync = readFileSync(join(HARNESS, 'scripts/Invoke-HarnessSync.ps1'), 'utf8')
const fn = sync.slice(sync.indexOf('function Get-FailureReason'), sync.indexOf('function Send-Heartbeat'))
const sent = new Set([...fn.matchAll(/return '([a-z-]+)'/g)].map((m) => m[1]))
for (const line of sync.split('\n').filter((l) => /-Reason |\$reason = /.test(l))) for (const m of line.matchAll(/'([a-z]+(?:-[a-z]+)+)'/g)) sent.add(m[1])
test('the sync sends at least the words it promises', ['checkout-edited', 'checkout-untracked', 'checkout-git-output', 'unclassified-skill-directory', 'parity-drift', 'install-halted', 'canary-failed', 'other'].every((r) => sent.has(r)))
const unknown = [...sent].filter((r) => !reasons.has(r))
test(`every word the sync sends is one the recorder keeps${unknown.length ? ` (missing: ${unknown.join(', ')})` : ''}`, unknown.length === 0)
const unworded = [...reasons].filter((r) => typeof REASONS[r] !== 'string' || REASONS[r].length < 20)
test(`every word reaches Krish in plain language${unworded.length ? ` (missing: ${unworded.join(', ')})` : ''}`, unworded.length === 0)
test('the shared list cannot be changed at run time', Object.isFrozen(REASONS))

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) process.exit(1)
console.log('MACHINE HEARTBEAT OK')
