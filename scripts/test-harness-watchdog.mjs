#!/usr/bin/env node
/** Offline fixtures only. No provider, model, GitHub token or local client needed. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { collectWatchdogSnapshot, evaluateWatchdog, validateJobManifest, watchdogSummary } from './harness-watchdog.mjs'
import { measurementSeal } from './lib/repository-measurements.mjs'

const full = JSON.parse(readFileSync(fileURLToPath(new URL('../config/harness-jobs.json', import.meta.url)), 'utf8'))
const now = '2026-10-18T12:00:00.000Z', at = '2026-10-18T11:00:00.000Z', old = '2026-10-01T01:00:00.000Z'
const sha = 'a'.repeat(40), first = '1'.repeat(64), second = '2'.repeat(64)
const manifest = () => {
  const value = structuredClone(full)
  value.jobs = value.jobs.filter((job) => ['central-checks', 'claude-cloud-account-1', 'claude-cloud-account-2', 'optional-local-sync'].includes(job.id))
  value.jobs.find((job) => job.id === 'claude-cloud-account-1').account_sha256 = first
  value.jobs.find((job) => job.id === 'claude-cloud-account-2').account_sha256 = second
  return value
}
const source = (account, details = {}) => ({
  schema_version: 1, id: `source.${account[0]}`, observed_at: at, repository: null, kind: 'source-run', evidence_class: 'production',
  source: { provider: 'claude-code-web', account_sha256: account, run_sha256: '3'.repeat(64) }, source_revision: sha,
  brain_revision: null, view_sha256: null, workflow: null, condition_sha256: null, opportunity_id: null, knowledge_ids: [],
  details: { status: 'complete', account_enumeration: 'complete', pagination: 'complete', sessions_read: 0, pages_read: 1, cursor_sha256: null, acknowledged_payload_sha256: null, ...details },
  receipt: { repository: 'ai-harness', commit: sha, path: 'state/source-receipt.json', sha256: '4'.repeat(64), run_id: 1, job_id: 2, execution_revision: sha },
})
const snapshot = () => {
  const measurements = [source(first), source(second)]
  return {
    revision: sha, targets: ['ai-harness', 'content-engine', 'AEO-Engine'], budget: { status: 'disabled' },
    workflows: { 'harness-steward.yml:schedule': { status: 'available', state: 'active', history_complete: true, runs: [{ id: 11, event: 'schedule', status: 'completed', conclusion: 'success', created_at: at, run_started_at: at, head_sha: sha, jobs_complete: true, jobs: [{ name: 'surfaces', status: 'completed', conclusion: 'success' }] }] } },
    evidence: {
      observations: { status: 'available', complete: true, rows: measurements.map((measurement) => ({ measurement })) },
      verification: { status: 'available', value: { verified_at: at, proofs: Object.fromEntries(measurements.map((m) => [measurementSeal(m), { status: 'source-receipt', receipt_sha256: m.receipt.sha256, source_commit: m.receipt.commit }])) } },
      heartbeats: { status: 'available', value: { 'harness-sync-lorimer': { last_run: at, status: 'blocked', reason: 'checkout-untracked' } } },
    },
  }
}
const report = (data = snapshot(), config = manifest()) => evaluateWatchdog(config, data, { now, execution: { revision: sha, run_id: 5, run_attempt: 1, event: 'workflow_dispatch' } })
const row = (value, id) => value.jobs.find((job) => job.id === id)
const run = (data) => data.workflows['harness-steward.yml:schedule'].runs[0]

validateJobManifest(full)
assert.equal(full.jobs.filter((job) => job.kind === 'source' && job.required).length, 2)
assert.ok(full.jobs.filter((job) => job.kind === 'source').every((job) => job.account_sha256 === null), 'No production account identity is invented')
assert.equal(full.watchdog.activation, 'enabled')
assert.throws(() => validateJobManifest({ ...full, jobs: full.jobs.filter((job) => job.id !== 'claude-cloud-account-2') }), /required-account-removed/)
const duplicate = manifest(); duplicate.jobs.find((job) => job.id === 'claude-cloud-account-2').account_sha256 = first
assert.throws(() => validateJobManifest(duplicate), /invalid-source-manifest/)

const healthy = report()
assert.equal(healthy.status, 'healthy')
assert.equal(healthy.central.status, 'healthy')
assert.equal(healthy.required_sources.healthy_accounts, 2)
assert.equal(row(healthy, 'claude-cloud-account-1').status, 'healthy-no-work', 'A verified account scan may legitimately find no new work')
assert.equal(healthy.optional_local.status, 'degraded')
assert.equal(healthy.optional_local.affects_central, false, 'A blocked PC does not block central execution')
assert.equal(healthy.run_id, 5)
assert.equal(healthy.execution_revision, sha)
assert.match(healthy.manifest_sha256, /^[a-f0-9]{64}$/)

let config
let data = snapshot(); data.workflows['harness-steward.yml:schedule'].runs = []
assert.equal(row(report(data), 'central-checks').status, 'never-started')
data = snapshot(); run(data).event = 'workflow_dispatch'
assert.equal(row(report(data), 'central-checks').status, 'never-started', 'A manual success cannot substitute for a scheduled run')
data = snapshot(); run(data).created_at = old; run(data).run_started_at = old
assert.equal(row(report(data), 'central-checks').status, 'stale')
data = snapshot(); run(data).jobs[0].conclusion = 'failure'
assert.equal(row(report(data), 'central-checks').status, 'failed')
data = snapshot(); run(data).status = 'in_progress'; run(data).jobs[0].status = 'in_progress'
assert.equal(row(report(data), 'central-checks').status, 'running')
data = snapshot(); run(data).run_started_at = '2026-10-18T08:00:00.000Z'; run(data).jobs[0].status = 'in_progress'
assert.equal(row(report(data), 'central-checks').status, 'overlong')
data = snapshot(); data.workflows['harness-steward.yml:schedule'].status = 'inaccessible'
assert.equal(row(report(data), 'central-checks').status, 'inaccessible')
data = snapshot(); run(data).jobs = []; data.workflows['harness-steward.yml:schedule'].history_complete = false
assert.equal(row(report(data), 'central-checks').status, 'partial', 'Bounded history cannot certify that a job never ran')
data = snapshot(); run(data).jobs[0].conclusion = 'skipped'; run(data).conclusion = 'failure'
assert.equal(row(report(data), 'central-checks').status, 'failed', 'An upstream failure cannot become healthy skipped work')
config = manifest(); config.jobs.push({ ...config.jobs[0], id: 'another-free-check' }); config.jobs[0].enabled = false
assert.equal(row(report(snapshot(), config), 'central-checks').status, 'prepared')
assert.notEqual(report(snapshot(), config).central.status, 'healthy', 'Preparing a required replacement is not proof it is active')

config = manifest(); config.jobs.find((job) => job.id === 'claude-cloud-account-2').account_sha256 = null
assert.equal(row(report(snapshot(), config), 'claude-cloud-account-2').status, 'inaccessible')
assert.equal(report(snapshot(), config).required_sources.healthy_accounts, 1, 'One healthy account never covers another')
data = snapshot(); data.evidence.observations.rows.pop()
assert.equal(row(report(data), 'claude-cloud-account-2').status, 'never-started')
data.evidence.observations.complete = false
assert.equal(row(report(data), 'claude-cloud-account-2').status, 'partial')
data = snapshot(); data.evidence.observations.status = 'inaccessible'
assert.equal(row(report(data), 'claude-cloud-account-1').status, 'inaccessible')
data = snapshot(); data.evidence.verification.value.proofs = {}
assert.equal(row(report(data), 'claude-cloud-account-1').status, 'unverified', 'An assertion or checkpoint is not an independent source receipt')
data = snapshot(); data.evidence.observations.rows[0].measurement.receipt = null
data.evidence.verification.value.proofs[measurementSeal(data.evidence.observations.rows[0].measurement)] = { status: 'source-receipt' }
assert.equal(row(report(data), 'claude-cloud-account-1').status, 'unverified', 'An orphan proof cannot manufacture a source receipt')
data = snapshot(); data.evidence.verification.value.verified_at = old
assert.equal(row(report(data), 'claude-cloud-account-1').status, 'unverified')
for (const [changes, expected] of [[{ status: 'partial' }, 'partial'], [{ pagination: 'partial' }, 'partial'], [{ account_enumeration: 'unverified' }, 'partial'], [{ status: 'failed' }, 'failed'], [{ status: 'unavailable' }, 'inaccessible']]) {
  data = snapshot()
  const measurement = source(second, changes)
  data.evidence.observations.rows[1].measurement = measurement
  data.evidence.verification.value.proofs[measurementSeal(measurement)] = { status: 'source-receipt', receipt_sha256: measurement.receipt.sha256, source_commit: measurement.receipt.commit }
  assert.equal(row(report(data), 'claude-cloud-account-2').status, expected)
  assert.equal(row(report(data), 'claude-cloud-account-1').status, 'healthy-no-work')
}
data = snapshot(); data.evidence.observations.rows[1].measurement.observed_at = old
assert.equal(row(report(data), 'claude-cloud-account-2').status, 'stale')

config = manifest(); config.jobs.push({ ...config.jobs[0], id: 'paid-fixture', budget_class: 'docs' })
data = snapshot(); data.budget = { status: 'available', routine_available_microusd: 0, available_microusd: 10000000 }
assert.equal(row(report(data, config), 'paid-fixture').status, 'budget-paused')
config.jobs.at(-1).budget_class = 'review'
assert.equal(row(report(data, config), 'paid-fixture').status, 'healthy', 'The reserve remains usable by required review')
run(data).jobs[0].conclusion = 'failure'
assert.equal(row(report(data, config), 'paid-fixture').status, 'failed', 'Budget state cannot invent the cause of a failed run')
assert.equal(report({ ...snapshot(), budget: { status: 'unknown', provider_error: 'PRIVATE_SENTINEL' } }).budget.status, 'unknown')

config = manifest(); config.jobs.push(structuredClone(full.jobs.find((job) => job.id === 'central-repository-administration')))
data = snapshot()
data.workflows['repository-administration.yml:schedule'] = structuredClone(data.workflows['harness-steward.yml:schedule'])
data.workflows['repository-administration.yml:schedule'].runs[0].jobs[0].name = 'administer'
data.evidence.administration = { status: 'available', value: { generated_at: at, results: data.targets.map((repository) => ({ repository, status: 'current' })) } }
assert.equal(row(report(data, config), 'central-repository-administration').status, 'healthy-no-work')
data.evidence.administration.value.results.pop()
assert.equal(row(report(data, config), 'central-repository-administration').status, 'partial', 'One current target cannot hide omitted repositories')
data.evidence.administration.value.generated_at = '2026-10-18T09:00:00.000Z'
assert.equal(row(report(data, config), 'central-repository-administration').status, 'missing', 'A recent prior output cannot stand in for the latest worker run')

// The production collector is tested through its real injectable GET boundary.
const calls = [], b64 = (value) => ({ encoding: 'base64', content: Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64') })
const fetchImpl = async (url, options) => {
  calls.push(url)
  assert.equal(options.method, 'GET')
  assert.equal(options.redirect, 'error')
  assert.equal(options.headers.authorization, 'Bearer fixture-token')
  const path = new URL(url).pathname
  let body
  if (path.endsWith('/git/ref/heads/main')) body = { object: { sha } }
  else if (path.endsWith('/actions/workflows/harness-steward.yml')) body = { state: 'active' }
  else if (path.endsWith('/runs')) body = { total_count: 1, workflow_runs: snapshot().workflows['harness-steward.yml:schedule'].runs.map(({ jobs, ...value }) => value) }
  else if (path.endsWith('/jobs')) body = { total_count: 1, jobs: run(snapshot()).jobs }
  else if (path.endsWith('/contents/state/observations')) body = [{ type: 'file', name: '2026-10.jsonl' }]
  else if (path.endsWith('/contents/state/observations/2026-10.jsonl')) body = b64(snapshot().evidence.observations.rows.map((value) => JSON.stringify(value)).join('\n') + '\n')
  else if (path.endsWith('/contents/state/repository-administration/measurement-verification.json')) body = b64(snapshot().evidence.verification.value)
  else if (path.endsWith('/contents/contract/repository-administration.json')) body = b64({ targets: snapshot().targets })
  else if (path.endsWith('/contents/config/inference-policy.json')) body = b64({ enabled: false })
  else body = b64({})
  return { ok: true, status: 200, text: async () => JSON.stringify(body) }
}
const observed = await collectWatchdogSnapshot(manifest(), { token: 'fixture-token', fetchImpl, now })
assert.equal(report(observed).status, 'healthy')
assert.ok(calls.some((url) => url.includes('event=schedule')))
assert.ok(calls.some((url) => url.includes(`ref=${sha}`)), 'Source receipts are read at an independently fetched immutable main revision')
const policy = JSON.parse(readFileSync(fileURLToPath(new URL('../config/inference-policy.json', import.meta.url)), 'utf8'))
Object.assign(policy, { enabled: true, approval_ref: 'fixture-only-approved-policy', monthly_limit_usd: 50, review_reserve_usd: 10 })
const budgetFetch = (mismatch = false) => async (url, options) => {
  const path = new URL(url).pathname
  let value
  if (path.endsWith('/contents/config/inference-policy.json')) value = b64(policy)
  else if (path.endsWith('/git/ref/heads/harness/inference-budget')) value = { object: { sha: 'b'.repeat(40) } }
  else if (path.endsWith('/contents/state/inference-policy.json')) {
    assert.equal(new URL(url).searchParams.get('ref'), 'b'.repeat(40))
    value = b64(mismatch ? { ...policy, monthly_limit_usd: 100 } : policy)
  } else if (path.endsWith('/contents/state/inference-budget.jsonl')) value = b64('')
  else return fetchImpl(url, options)
  assert.equal(options.method, 'GET')
  return { ok: true, status: 200, text: async () => JSON.stringify(value) }
}
const budgetObserved = await collectWatchdogSnapshot(manifest(), { token: 'fixture-token', fetchImpl: budgetFetch(), now })
assert.equal(budgetObserved.budget.status, 'available')
assert.equal(budgetObserved.budget.limit_microusd, 50000000)
const budgetMismatch = await collectWatchdogSnapshot(manifest(), { token: 'fixture-token', fetchImpl: budgetFetch(true), now })
assert.equal(budgetMismatch.budget.status, 'unknown', 'A changed active policy cannot be evaluated against a stale larger or smaller local cap')
assert.equal(report(budgetMismatch).budget.reason, 'active-policy-mismatch')
const denied = await collectWatchdogSnapshot(manifest(), { token: 'fixture-token', fetchImpl: async () => ({ ok: false, status: 403, text: async () => 'PRIVATE_SENTINEL' }), now })
assert.equal(report(denied).central.status, 'unknown')
assert.equal(row(report(denied), 'claude-cloud-account-1').status, 'inaccessible')
const offline = await collectWatchdogSnapshot(manifest(), { token: '', fetchImpl: async () => { throw new Error('Must not call network without auth') }, now })
assert.equal(offline.api_error, 'auth-unavailable')
assert.equal(row(report(offline), 'central-checks').status, 'inaccessible')
const exposed = JSON.stringify([report(denied), watchdogSummary(report(denied)), report({ ...snapshot(), budget: { status: 'unknown', secret: 'PRIVATE_SENTINEL' } })])
assert.ok(!exposed.includes('PRIVATE_SENTINEL') && !exposed.includes('fixture-token'), 'Reports never serialize error bodies, credentials or arbitrary evidence')

const workflow = readFileSync(fileURLToPath(new URL('../.github/workflows/harness-watchdog.yml', import.meta.url)), 'utf8')
assert.match(workflow, /workflow_dispatch:/)
assert.match(workflow, /^run-name: Harness watchdog \(\$\{\{ inputs\.trigger \|\| github\.event_name \}\}\)$/m, 'Each run names the knock that started it, so Control Center can tell its own clock from a manual run')
assert.match(workflow, /options: \[manual, control-center-clock\]/, 'The trigger is a closed choice, never free text in a run name')
assert.match(workflow, /^  schedule:\n    - cron: "17 \* \* \* \*"$/m, 'The approved hourly cron runs at :17, the same minute in UTC and Europe/London')
assert.doesNotMatch(workflow, /^  (?:push|pull_request|workflow_run|repository_dispatch):/m, 'Only the schedule and an explicit dispatch can run the observer')
assert.ok(full.watchdog.artifact_attempt_suffix)
assert.ok(workflow.includes('harness-watchdog-status-${{ github.run_attempt }}'), 'A rerun gets its own immutable artifact without overwriting another attempt')
assert.doesNotMatch(workflow, /needs:|ANTHROPIC_API_KEY|CLAUDE_CODE_OAUTH_TOKEN|FLEET_TOKEN|secrets: inherit|claude-code-action|npm install/)
assert.match(workflow, /actions: read/)
assert.match(workflow, /persist-credentials: false/)
assert.match(workflow, /retention-days: 1/)
console.log('HARNESS WATCHDOG OK: missing and stale workers, source accounts, verified zero work, partial/inaccessible evidence, optional PC isolation, budget pauses and sanitized GET-only reporting')
