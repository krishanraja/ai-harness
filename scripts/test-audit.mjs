#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const harness = resolve(fileURLToPath(import.meta.url), '../..')
const output = execFileSync(process.execPath, ['scripts/audit-harness.mjs'], {
  cwd: harness,
  encoding: 'utf8',
})

const failures = []

if (output.includes('**video-engine on codex-surface-07a67cda9f99.**')) {
  failures.push('A superseded unreachable result still opens a live video-engine finding after a later positive canary.')
}

if (!output.includes('then a positive canary on the same surface proved it reachable')) {
  failures.push('The audit did not preserve the superseded reachability failure as measured historical evidence.')
}

if (output.includes('**session-feed.**')) {
  failures.push('The retired local session-feed still appears as an expected heartbeat.')
}

if (failures.length) {
  console.error(`AUDIT TEST FAILED:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}

console.log('AUDIT TEST PASSED: later reachability supersedes an older failure, and retired clocks stay retired.')
