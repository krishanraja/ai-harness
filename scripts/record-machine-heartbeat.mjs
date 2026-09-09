#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const args = process.argv.slice(2)
const flag = (name) => {
  const index = args.indexOf(name)
  return index === -1 ? null : args[index + 1]
}

const clock = flag('--clock')
const status = flag('--status')
const release = flag('--release')
const output = resolve(flag('--out') || resolve(HARNESS, 'state/heartbeats.json'))
const allowedClocks = new Set(['harness-sync-surface', 'harness-sync-lorimer', 'openclaw-vps'])

// Clocks that ship a harness release, and so must name the release they are
// reporting for. The OpenClaw VPS is not a harness install: it reports that a
// host is alive and what its n8n spend counter reads. Requiring a release
// identifier of it would reject every heartbeat it will ever send, which is how
// openclaw-vps was declared in EXPECTED_CLOCKS on 2026-09-09 and then bounced
// by this script on its first real run.
const releaseClocks = new Set(['harness-sync-surface', 'harness-sync-lorimer'])

// A number that is absent and a number that is zero mean opposite things: no
// counter versus an idle counter. Anything unparseable stays absent.
const num = (value) => {
  if (value === null || value === '' || value === 'null') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

if (!allowedClocks.has(clock)) {
  console.error(`heartbeat: clock must be one of ${[...allowedClocks].join(', ')}.`)
  process.exit(2)
}
// degraded is a first-class outcome, not a failure. It is how a host says it is
// running but cannot read something it expects to read, which is more useful
// than a green light that means nothing.
if (!new Set(['ok', 'blocked', 'degraded']).has(status)) {
  console.error('heartbeat: status must be ok, blocked or degraded.')
  process.exit(2)
}
if (releaseClocks.has(clock) && !/^v\d{4}\.\d{2}\.\d{2}\.\d+$/.test(release || '')) {
  console.error('heartbeat: release must be a vYYYY.MM.DD.N identifier.')
  process.exit(2)
}

let state = {}
if (existsSync(output)) {
  state = JSON.parse(readFileSync(output, 'utf8'))
  if (!state || Array.isArray(state) || typeof state !== 'object') {
    console.error('heartbeat: the existing state file is not an object.')
    process.exit(2)
  }
}

const entry = {
  last_run: new Date().toISOString(),
  status,
}
if (releaseClocks.has(clock)) entry.release = release

// Recorded so the spend trend is visible in the brain without anyone reaching
// into the host. A count that falls without a commit explaining it, or a job
// total that drops, is the signal worth having.
const cycleStart = flag('--n8n-cycle-start')
const executions = num(flag('--n8n-executions'))
const gatewayJobs = num(flag('--gateway-jobs'))
if (cycleStart && cycleStart !== 'null') entry.n8n_cycle_start = cycleStart
if (executions !== null) entry.n8n_executions_this_cycle = executions
if (gatewayJobs !== null) entry.gateway_jobs_defined = gatewayJobs

entry.source = 'repository_dispatch'
state[clock] = entry

const ordered = Object.fromEntries(Object.entries(state).sort(([a], [b]) => a.localeCompare(b)))
mkdirSync(dirname(output), { recursive: true })
const pending = `${output}.pending`
writeFileSync(pending, JSON.stringify(ordered, null, 2) + '\n')
renameSync(pending, output)
console.log(`Recorded ${clock} at ${ordered[clock].last_run}.`)
