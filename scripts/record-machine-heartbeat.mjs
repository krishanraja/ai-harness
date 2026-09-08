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
const allowedClocks = new Set(['harness-sync-surface', 'harness-sync-lorimer'])

if (!allowedClocks.has(clock)) {
  console.error(`heartbeat: clock must be one of ${[...allowedClocks].join(', ')}.`)
  process.exit(2)
}
if (!new Set(['ok', 'blocked']).has(status)) {
  console.error('heartbeat: status must be ok or blocked.')
  process.exit(2)
}
if (!/^v\d{4}\.\d{2}\.\d{2}\.\d+$/.test(release || '')) {
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

state[clock] = {
  last_run: new Date().toISOString(),
  status,
  release,
  source: 'repository_dispatch',
}

const ordered = Object.fromEntries(Object.entries(state).sort(([a], [b]) => a.localeCompare(b)))
mkdirSync(dirname(output), { recursive: true })
const pending = `${output}.pending`
writeFileSync(pending, JSON.stringify(ordered, null, 2) + '\n')
renameSync(pending, output)
console.log(`Recorded ${clock} at ${ordered[clock].last_run}.`)
