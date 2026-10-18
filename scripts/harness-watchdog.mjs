#!/usr/bin/env node
/** Read-only, deterministic supervision. No model, client CLI, notification or writer. */
import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { budgetStatus, inferencePolicySeal } from './harness-api.mjs'
import { measurementSeal, validateMeasurement } from './lib/repository-measurements.mjs'

const ROOT = resolve(fileURLToPath(import.meta.url), '../..')
const SHA = /^[a-f0-9]{40}$/, HEX = /^[a-f0-9]{64}$/
const ID = /^[a-z][a-z0-9-]{1,79}$/, FILE = /^[a-z][a-z0-9-]*\.ya?ml$/
const PATH = /^(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+$/
const CLASSES = new Set(['free', 'review', 'proposals', 'docs', 'extraction', 'replay', 'context'])
const GOOD = new Set(['healthy', 'healthy-no-work', 'running', 'not-applicable'])
const timestamp = (value) => typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value) && Number.isFinite(Date.parse(value)) ? value : null
const integer = (value) => Number.isSafeInteger(value) && value >= 0
const safePath = (value) => typeof value === 'string' && PATH.test(value) && !value.split('/').includes('..')
const age = (value, now) => timestamp(value) ? (Date.parse(now) - Date.parse(value)) / 1000 : null
const knownError = (error) => /^(?:http-(?:401|403|404|429|500|502|503|504)|transport-unavailable|invalid-response|response-over-budget|auth-unavailable|invalid-revision)$/.test(error?.code || '') ? error.code : 'invalid-response'
const failure = (code) => { const error = new Error(code); error.code = code; return error }

export function validateJobManifest(manifest) {
  if (manifest.schema_version !== 1 || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(manifest.repository || '') || manifest.default_branch !== 'main' || manifest.timezone !== 'Europe/London' || !Array.isArray(manifest.jobs)) throw failure('invalid-manifest')
  if (manifest.watchdog?.activation !== 'manual-only-pending-approval' || manifest.watchdog.proposed_cron !== '17 * * * *') throw failure('invalid-watchdog-activation')
  const ids = new Set(), accounts = new Set()
  for (const job of manifest.jobs) {
    if (!ID.test(job.id || '') || ids.has(job.id) || !['workflow', 'source', 'heartbeat'].includes(job.kind) || typeof job.required !== 'boolean' || typeof job.enabled !== 'boolean' || !CLASSES.has(job.budget_class) || !integer(job.grace_seconds) || !integer(job.max_run_seconds) || job.max_run_seconds < 1 || job.cadence_seconds !== null && (!integer(job.cadence_seconds) || job.cadence_seconds < 1)) throw failure('invalid-job-manifest')
    if (job.kind === 'workflow' && (!FILE.test(job.workflow_id || '') || !/^[a-z][a-z0-9_-]*$/.test(job.job_name || job.job_name_prefix || '') || !['schedule', 'pull_request', 'repository_dispatch', 'push', 'workflow_run', 'workflow_dispatch'].includes(job.event))) throw failure('invalid-workflow-manifest')
    if (job.kind === 'source') {
      if (job.provider !== 'claude-code-web' || job.account_sha256 !== null && (!HEX.test(job.account_sha256 || '') || accounts.has(job.account_sha256))) throw failure('invalid-source-manifest')
      if (job.account_sha256) accounts.add(job.account_sha256)
    }
    if (job.kind === 'heartbeat' && (!/^[a-z][a-z0-9-]+$/.test(job.heartbeat_key || '') || job.required)) throw failure('local-adapter-cannot-gate-central')
    ids.add(job.id)
  }
  for (const id of ['claude-cloud-account-1', 'claude-cloud-account-2']) if (!manifest.jobs.some((job) => job.id === id && job.kind === 'source' && job.required && job.enabled)) throw failure('required-account-removed')
  if (!manifest.jobs.some((job) => job.kind === 'workflow' && job.required && job.enabled && job.budget_class === 'free')) throw failure('required-central-check-removed')
  const e = manifest.evidence
  if (!e || ['health_path', 'observation_directory', 'measurement_verification_path', 'checkpoints_path', 'heartbeats_path'].some((key) => !safePath(e[key])) || ['max_ledger_files', 'max_response_bytes', 'max_run_pages', 'runs_per_page', 'max_job_runs', 'max_job_pages'].some((key) => !integer(e[key]) || e[key] < 1) || e.max_ledger_files > 24 || e.max_response_bytes > 4194304 || e.max_run_pages > 3 || e.runs_per_page > 100 || e.max_job_runs > 20 || e.max_job_pages > 3) throw failure('invalid-evidence-limits')
  return manifest
}

const keyFor = (job) => `${job.workflow_id}:${job.event}`
const matches = (job, value) => job.job_name ? value.name === job.job_name : typeof value.name === 'string' && (value.name === job.job_name_prefix || value.name.startsWith(job.job_name_prefix + ' ' ) || value.name.startsWith(job.job_name_prefix + ' ('))
const baseResult = (job) => ({ id: job.id, kind: job.kind, required: job.required, budget_class: job.budget_class })
const paused = (job, budget) => job.budget_class !== 'free' && (budget?.status === 'budget-paused' || budget?.status === 'available' && job.budget_class !== 'review' && budget.routine_available_microusd === 0)
const result = (job, status, reason, detail = {}) => ({ ...baseResult(job), status, reason, ...detail })

function workflowState(job, snapshot, now) {
  const stream = snapshot.workflows?.[keyFor(job)]
  if (!stream || stream.status !== 'available') return result(job, 'inaccessible', stream?.reason || 'workflow-evidence-unavailable')
  if (stream.state !== 'active') return result(job, 'inaccessible', 'workflow-not-active')
  const runs = [...stream.runs].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
  let skipped = false
  for (const run of runs) {
    if (run.event !== job.event) continue
    const runAt = timestamp(run.run_started_at || run.created_at)
    if (!runAt || age(runAt, now) < -300) return result(job, 'inaccessible', 'invalid-run-clock')
    if (run.jobs_error) return result(job, 'inaccessible', 'job-evidence-unavailable')
    const jobs = (run.jobs || []).filter((value) => matches(job, value))
    if (jobs.length && run.jobs_complete === false) return result(job, 'partial', 'job-list-incomplete')
    if (!jobs.length) {
      if (run.status !== 'completed') return result(job, age(runAt, now) > job.max_run_seconds ? 'overlong' : 'running', 'workflow-started-job-not-yet-observed', { last_run_at: runAt })
      if (run.jobs_complete === false) return result(job, 'partial', 'job-list-incomplete')
      continue
    }
    if (jobs.every((value) => value.conclusion === 'skipped')) {
      skipped = true
      if (run.conclusion === 'failure' || run.conclusion === 'timed_out') return result(job, 'failed', 'upstream-run-failed', { last_run_at: runAt })
      continue
    }
    const detail = { last_run_at: runAt, run_id: integer(run.id) ? run.id : null, execution_revision: SHA.test(run.head_sha || '') ? run.head_sha : null, schedule_evidence: job.event === 'schedule' ? 'scheduled-run-observed' : 'event-driven-run', output_verification: 'not-claimed' }
    if (jobs.some((value) => value.status !== 'completed')) return result(job, age(runAt, now) > job.max_run_seconds ? 'overlong' : 'running', 'named-job-running', detail)
    if (jobs.some((value) => !['success', 'skipped', 'neutral'].includes(value.conclusion))) return result(job, 'failed', 'named-job-failed', { ...detail, paid_work_availability: paused(job, snapshot.budget) ? 'budget-paused' : 'not-claimed' })
    if (job.expected_jobs && jobs.length !== job.expected_jobs) return result(job, 'partial', 'expected-job-matrix-incomplete', detail)
    if (!jobs.some((value) => value.conclusion === 'success')) return result(job, 'unverified', 'no-successful-named-job', detail)
    if (job.cadence_seconds !== null && age(runAt, now) > job.cadence_seconds + job.grace_seconds) return result(job, 'stale', 'scheduled-run-overdue', detail)
    if (job.completion_proof === 'containing-job-only-step-proof-unverified') return result(job, 'unverified', 'conditional-step-proof-required', detail)
    if (job.completion_proof === 'successful-named-job-and-observer-heartbeat') {
      const beat = snapshot.evidence?.heartbeats
      const last = timestamp(beat?.value?.observer?.last_run)
      if (beat?.status !== 'available') return result(job, 'inaccessible', 'observer-output-unavailable', detail)
      if (!last) return result(job, 'missing', 'observer-output-missing', detail)
      if (age(last, now) > job.cadence_seconds + job.grace_seconds || age(last, now) < -300) return result(job, 'stale', 'observer-output-overdue', detail)
      if (Date.parse(last) < Date.parse(runAt) - 600000) return result(job, 'missing', 'observer-output-not-bound-to-current-run', detail)
      detail.output_verification = 'observer-heartbeat-observed'
    }
    if (job.completion_proof === 'successful-named-job-and-current-administration-report') {
      const report = snapshot.evidence?.administration
      if (report?.status !== 'available') return result(job, 'inaccessible', 'administration-output-unavailable', detail)
      if (!timestamp(report.value?.generated_at) || !Array.isArray(report.value?.results) || !report.value.results.length) return result(job, 'missing', 'administration-output-missing', detail)
      if (age(report.value.generated_at, now) > job.cadence_seconds + job.grace_seconds || age(report.value.generated_at, now) < -300) return result(job, 'stale', 'administration-output-overdue', detail)
      if (Date.parse(report.value.generated_at) < Date.parse(runAt) - 600000) return result(job, 'missing', 'administration-output-not-bound-to-current-run', detail)
      const repositories = report.value.results.map((row) => row.repository)
      if (!snapshot.targets?.length || new Set(repositories).size !== repositories.length || snapshot.targets.some((target) => !repositories.includes(target)) || repositories.some((target) => !snapshot.targets.includes(target))) return result(job, 'partial', 'administration-repository-inventory-incomplete', detail)
      if (report.value.results.some((row) => !['current', 'verified', 'excluded'].includes(row.status))) return result(job, 'partial', 'repository-delivery-incomplete', detail)
      detail.output_verification = 'durable-administration-report-observed'
      if (report.value.results.every((row) => ['current', 'excluded'].includes(row.status))) return result(job, 'healthy-no-work', 'accepted-views-already-current', detail)
    }
    return result(job, paused(job, snapshot.budget) ? 'budget-paused' : 'healthy', paused(job, snapshot.budget) ? 'next-paid-work-blocked-by-budget' : 'named-job-completed', detail)
  }
  if (skipped && job.cadence_seconds === null) return result(job, 'not-applicable', 'conditional-jobs-skipped-no-measurement-claimed')
  return result(job, stream.history_complete === false ? 'partial' : 'never-started', stream.history_complete === false ? 'bounded-run-history-incomplete' : 'no-named-run-observed')
}

function sourceState(job, snapshot, now) {
  if (!job.account_sha256) return result(job, 'inaccessible', 'account-identity-unverified', { identity_bound: false })
  const ledger = snapshot.evidence?.observations, verification = snapshot.evidence?.verification
  if (ledger?.status !== 'available') return result(job, 'inaccessible', 'source-ledger-unavailable', { identity_bound: true })
  const measurements = ledger.rows.map((row) => row.measurement).filter((m) => m?.kind === 'source-run' && m.evidence_class === 'production' && m.source?.provider === job.provider && m.source.account_sha256 === job.account_sha256).sort((a, b) => String(b.observed_at).localeCompare(String(a.observed_at)))
  if (!measurements.length) return result(job, ledger.complete === false ? 'partial' : 'never-started', ledger.complete === false ? 'source-ledger-enumeration-incomplete' : 'no-account-source-run-receipt', { identity_bound: true })
  const m = measurements[0]
  try { validateMeasurement(m, { repository: m.repository, targets: snapshot.targets || [] }) } catch { return result(job, 'unverified', 'invalid-source-run-receipt') }
  const detail = { identity_bound: true, last_run_at: timestamp(m.observed_at), source_revision: m.source_revision, source_run_sha256: m.source.run_sha256, sessions_read: m.details.sessions_read, pages_read: m.details.pages_read, account_enumeration: m.details.account_enumeration, pagination: m.details.pagination, coverage_basis: 'one-account-source-run-receipt-not-all-history' }
  if (!detail.last_run_at || age(detail.last_run_at, now) < -300) return result(job, 'unverified', 'invalid-source-run-clock', detail)
  if (age(detail.last_run_at, now) > job.cadence_seconds + job.grace_seconds) return result(job, 'stale', 'account-source-run-overdue', detail)
  const proof = verification?.value?.proofs?.[measurementSeal(m)]
  if (verification?.status !== 'available') return result(job, 'inaccessible', 'source-verification-unavailable', detail)
  if (!m.receipt || !['source-receipt', 'owner-confirmed'].includes(proof?.status) || proof.receipt_sha256 !== m.receipt.sha256 || proof.source_commit !== m.receipt.commit) return result(job, 'unverified', 'independent-source-proof-required', detail)
  const proofAt = timestamp(verification.value.verified_at)
  if (!proofAt || age(proofAt, now) < -300 || age(proofAt, now) > job.cadence_seconds + job.grace_seconds) return result(job, 'unverified', 'source-verification-stale', detail)
  if (m.details.status === 'unavailable') return result(job, 'inaccessible', 'account-source-access-unavailable', detail)
  if (m.details.status === 'failed') return result(job, 'failed', 'account-source-run-failed', detail)
  if (m.details.status !== 'complete' || m.details.account_enumeration !== 'complete' || m.details.pagination !== 'complete') return result(job, 'partial', 'account-window-or-pagination-incomplete', detail)
  return result(job, m.details.sessions_read === 0 ? 'healthy-no-work' : 'healthy', m.details.sessions_read === 0 ? 'verified-account-scan-returned-zero-sessions' : 'verified-account-scan-observed', detail)
}

function heartbeatState(job, snapshot, now) {
  const beats = snapshot.evidence?.heartbeats
  if (beats?.status !== 'available') return result(job, 'inaccessible', 'optional-local-heartbeats-unavailable')
  const beat = beats.value?.[job.heartbeat_key]
  if (!beat) return result(job, 'never-started', 'optional-local-heartbeat-not-observed')
  const at = timestamp(beat.last_run)
  if (!at || age(at, now) < -300) return result(job, 'unverified', 'invalid-local-heartbeat-clock')
  if (age(at, now) > job.cadence_seconds + job.grace_seconds) return result(job, 'stale', 'optional-local-heartbeat-overdue', { last_run_at: at })
  return result(job, beat.status === 'ok' ? 'healthy' : 'failed', beat.status === 'ok' ? 'optional-local-heartbeat-observed' : 'optional-local-adapter-blocked', { last_run_at: at })
}

const groupStatus = (rows) => !rows.length ? 'not-observed' : rows.every((row) => GOOD.has(row.status)) ? 'healthy' : rows.some((row) => ['failed', 'stale', 'overlong', 'missing', 'never-started'].includes(row.status)) ? 'degraded' : rows.some((row) => row.status === 'budget-paused') ? 'budget-paused' : 'unknown'
export function evaluateWatchdog(manifest, snapshot, { now = new Date().toISOString(), execution = {} } = {}) {
  validateJobManifest(manifest)
  if (!timestamp(now)) throw failure('invalid-clock')
  const jobs = manifest.jobs.map((job) => !job.enabled ? result(job, 'prepared', 'not-enabled') : job.kind === 'workflow' ? workflowState(job, snapshot, now) : job.kind === 'source' ? sourceState(job, snapshot, now) : heartbeatState(job, snapshot, now))
  const central = jobs.filter((row) => row.kind === 'workflow' && row.required), sources = jobs.filter((row) => row.kind === 'source' && row.required), local = jobs.filter((row) => row.kind === 'heartbeat')
  const budget = { status: ['disabled', 'available', 'budget-paused'].includes(snapshot.budget?.status) ? snapshot.budget.status : 'unknown' }
  if (['active-policy-mismatch', 'accounting-unavailable', 'invalid-accounting'].includes(snapshot.budget?.reason)) budget.reason = snapshot.budget.reason
  for (const key of ['limit_microusd', 'liability_microusd', 'routine_liability_microusd', 'review_reserve_microusd', 'available_microusd', 'routine_available_microusd']) if (integer(snapshot.budget?.[key])) budget[key] = snapshot.budget[key]
  if (/^\d{4}-\d\d$/.test(snapshot.budget?.period || '')) budget.period = snapshot.budget.period
  return { schema_version: 1, repository: manifest.repository, generated_at: now, manifest_sha256: createHash('sha256').update(JSON.stringify(manifest)).digest('hex'), source_revision: SHA.test(snapshot.revision || '') ? snapshot.revision : null, execution_revision: SHA.test(execution.revision || '') ? execution.revision : null, run_id: integer(execution.run_id) && execution.run_id > 0 ? execution.run_id : null, run_attempt: integer(execution.run_attempt) && execution.run_attempt > 0 ? execution.run_attempt : null, event: ['workflow_dispatch', 'schedule'].includes(execution.event) ? execution.event : null, activation: manifest.watchdog.activation, notification_delivery: 'not-enabled', status: groupStatus([...central, ...sources]), central: { status: groupStatus(central) }, required_sources: { status: groupStatus(sources), expected_accounts: sources.length, healthy_accounts: sources.filter((row) => ['healthy', 'healthy-no-work'].includes(row.status)).length }, optional_local: { status: groupStatus(local), affects_central: false }, budget, jobs, limits: ['GitHub platform outages require the separately owned outside observer.', 'Successful workflow execution does not prove application, editorial judgment or improved outcomes.', 'Opaque checkpoints prove acknowledged progress, not account enumeration, run time or complete history.', 'Required source identity and per-account receipt gaps remain visible.'] }
}

/** GET-only GitHub access. Bodies and error strings are never copied into reports. */
export async function collectWatchdogSnapshot(manifest, { token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN, fetchImpl = fetch, now = new Date().toISOString() } = {}) {
  validateJobManifest(manifest)
  const limits = manifest.evidence, prefix = `/repos/${manifest.repository}`
  const request = async (route) => {
    if (!token) throw failure('auth-unavailable')
    let response
    try { response = await fetchImpl(`https://api.github.com${route}`, { method: 'GET', redirect: 'error', headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28' }, signal: AbortSignal.timeout(30000) }) } catch { throw failure('transport-unavailable') }
    if (!response.ok) throw failure([401, 403, 404, 429, 500, 502, 503, 504].includes(response.status) ? `http-${response.status}` : 'invalid-response')
    const body = await response.text()
    if (Buffer.byteLength(body) > limits.max_response_bytes) throw failure('response-over-budget')
    try { return JSON.parse(body) } catch { throw failure('invalid-response') }
  }
  const file = async (path, ref) => {
    const data = await request(`${prefix}/contents/${path}?ref=${encodeURIComponent(ref)}`)
    if (data.encoding !== 'base64' || typeof data.content !== 'string') throw failure('invalid-response')
    const text = Buffer.from(data.content, 'base64').toString('utf8')
    if (Buffer.byteLength(text) > limits.max_response_bytes) throw failure('response-over-budget')
    return text
  }
  const safeJSON = async (path, ref) => { try { return { status: 'available', value: JSON.parse(await file(path, ref)) } } catch (error) { return { status: 'inaccessible', reason: knownError(error) } } }
  const snapshot = { workflows: {}, evidence: {}, budget: { status: 'unknown' }, targets: [] }
  try { snapshot.revision = (await request(`${prefix}/git/ref/heads/${manifest.default_branch}`)).object?.sha; if (!SHA.test(snapshot.revision || '')) throw failure('invalid-revision') } catch (error) { snapshot.api_error = knownError(error); return snapshot }
  const groups = [...new Map(manifest.jobs.filter((job) => job.enabled && job.kind === 'workflow').map((job) => [keyFor(job), job])).values()]
  for (const job of groups) {
    const stream = { status: 'available', state: null, runs: [], history_complete: true }
    snapshot.workflows[keyFor(job)] = stream
    try {
      const workflow = await request(`${prefix}/actions/workflows/${job.workflow_id}`)
      stream.state = workflow.state
      for (let page = 1; page <= limits.max_run_pages; page++) {
        const data = await request(`${prefix}/actions/workflows/${job.workflow_id}/runs?event=${job.event}&per_page=${limits.runs_per_page}&page=${page}${job.event === 'pull_request' ? '' : '&branch=' + manifest.default_branch}`)
        if (!Array.isArray(data.workflow_runs) || !integer(data.total_count)) throw failure('invalid-response')
        stream.runs.push(...data.workflow_runs)
        if (stream.runs.length >= data.total_count) break
        if (page === limits.max_run_pages) stream.history_complete = false
      }
      const ordered = stream.runs.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      if (ordered.length > limits.max_job_runs) stream.history_complete = false
      stream.runs = ordered.slice(0, limits.max_job_runs)
      for (const run of stream.runs) {
        if (!integer(run.id) || run.id < 1) throw failure('invalid-response')
        run.jobs = []; run.jobs_complete = true
        try {
          for (let page = 1; page <= limits.max_job_pages; page++) {
            const data = await request(`${prefix}/actions/runs/${run.id}/jobs?filter=latest&per_page=100&page=${page}`)
            if (!Array.isArray(data.jobs) || !integer(data.total_count)) throw failure('invalid-response')
            run.jobs.push(...data.jobs)
            if (run.jobs.length >= data.total_count) break
            if (page === limits.max_job_pages) run.jobs_complete = false
          }
        } catch { run.jobs_error = true }
      }
    } catch (error) { stream.status = 'inaccessible'; stream.reason = knownError(error) }
  }
  const paths = { health: limits.health_path, verification: limits.measurement_verification_path, heartbeats: limits.heartbeats_path, administration: 'state/repository-administration/latest.json', policy: 'contract/repository-administration.json', inference: 'config/inference-policy.json' }
  await Promise.all(Object.entries(paths).map(async ([name, path]) => { snapshot.evidence[name] = await safeJSON(path, snapshot.revision) }))
  if (Array.isArray(snapshot.evidence.policy.value?.targets)) snapshot.targets = snapshot.evidence.policy.value.targets
  try {
    const files = await request(`${prefix}/contents/${limits.observation_directory}?ref=${snapshot.revision}`)
    if (!Array.isArray(files)) throw failure('invalid-response')
    const ledgers = files.filter((entry) => entry.type === 'file' && /^[0-9]{4}-[0-9]{2}\.jsonl$/.test(entry.name || '')).sort((a, b) => b.name.localeCompare(a.name))
    const rows = []
    for (const entry of ledgers.slice(0, limits.max_ledger_files)) {
      const text = await file(`${limits.observation_directory}/${entry.name}`, snapshot.revision)
      for (const line of text.split('\n').filter(Boolean)) rows.push(JSON.parse(line))
    }
    snapshot.evidence.observations = { status: 'available', complete: ledgers.length <= limits.max_ledger_files, rows }
  } catch (error) { snapshot.evidence.observations = { status: 'inaccessible', reason: knownError(error) } }
  const inference = snapshot.evidence.inference
  try {
    if (inference.status !== 'available') throw failure('invalid-response')
    const policy = inference.value
    if (policy.enabled !== true) snapshot.budget = budgetStatus({ policy, now })
    else {
      if (policy.ledger?.repository !== manifest.repository || !/^harness\/[a-z0-9-]+$/.test(policy.ledger?.ref || '') || policy.ledger.path !== 'state/inference-budget.jsonl') throw failure('invalid-response')
      const revision = (await request(`${prefix}/git/ref/heads/${policy.ledger.ref}`)).object?.sha
      if (!SHA.test(revision || '')) throw failure('invalid-revision')
      const activePolicy = JSON.parse(await file('state/inference-policy.json', revision))
      if (inferencePolicySeal(activePolicy) !== inferencePolicySeal(policy)) throw failure('budget-policy-mismatch')
      const events = (await file(policy.ledger.path, revision)).split('\n').filter(Boolean).map(JSON.parse)
      snapshot.budget = budgetStatus({ policy: activePolicy, events, now })
    }
  } catch (error) { snapshot.budget = { status: 'unknown', reason: error?.code === 'budget-policy-mismatch' ? 'active-policy-mismatch' : /^(?:http-|transport-|auth-)/.test(error?.code || '') ? 'accounting-unavailable' : 'invalid-accounting' } }
  return snapshot
}

export function watchdogSummary(report) {
  return [`# Harness watchdog`, '', `Observed: ${report.generated_at}. Central: ${report.central.status}. Required sources: ${report.required_sources.status} (${report.required_sources.healthy_accounts}/${report.required_sources.expected_accounts} healthy). Optional local adapters: ${report.optional_local.status}; they do not gate central work.`, '', '| Job | Required | Status | Reason |', '| --- | --- | --- | --- |', ...report.jobs.map((row) => `| ${row.id} | ${row.required ? 'yes' : 'no'} | ${row.status} | ${row.reason} |`), '', 'Manual observer only. Scheduled activation and notification delivery remain disabled. No source text, model output or provider error body is included.', ''].join('\n')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), flag = (name) => args[args.indexOf(name) + 1]
  try {
    const manifest = JSON.parse(readFileSync(resolve(ROOT, args.includes('--manifest') ? flag('--manifest') : 'config/harness-jobs.json'), 'utf8'))
    const report = evaluateWatchdog(manifest, await collectWatchdogSnapshot(manifest), { execution: { revision: process.env.GITHUB_SHA, run_id: Number(process.env.GITHUB_RUN_ID), run_attempt: Number(process.env.GITHUB_RUN_ATTEMPT), event: process.env.GITHUB_EVENT_NAME } })
    const out = resolve(args.includes('--out') ? flag('--out') : '.watchdog/status.json')
    mkdirSync(dirname(out), { recursive: true }); writeFileSync(out, JSON.stringify(report, null, 2) + '\n')
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, watchdogSummary(report))
    console.log(JSON.stringify({ status: report.status, central: report.central.status, sources: report.required_sources.status, optional_local: report.optional_local.status, jobs: report.jobs.length, notification_delivery: 'not-enabled' }))
    if (report.status !== 'healthy') process.exitCode = 1
  } catch {
    console.error('Harness watchdog could not validate its inputs. No source or error text was emitted.')
    process.exitCode = 1
  }
}
