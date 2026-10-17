#!/usr/bin/env node
/**
 * Accept redacted observation envelopes sent straight to this repository.
 *
 * The private session miners (scripts/mine-sessions.mjs on Krish's PC, and the
 * weekly cloud session miner) send their lessons with a GitHub
 * `repository_dispatch` of type `harness-observations`, using a GitHub login
 * that already exists where they run. No Control Center change and no new key
 * stand between a lesson and the ledger.
 *
 * Only a writer to this repository can send a dispatch, and every envelope is
 * still checked here as strictly as the importer checks Control Center's:
 * the same enums, the same private-shape filter, a redaction check, a size cap,
 * and dedupe by event id across every ledger file, so a lesson that arrives by
 * both routes is recorded once.
 *
 * The repository is public and Actions logs are public, so this prints counts
 * only, never a summary.
 *
 *   node scripts/intake-observations.mjs [--file <event.json>] [--dry-run]
 *
 * Reads the dispatch event from GITHUB_EVENT_PATH unless --file is given.
 */

import { appendFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { envelopeSha, readSeenIds, readSeenPayloads, toObservation } from './import-harness-events.mjs'
import { leaks } from './lib/redact.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
export const MAX_EVENTS = 100
const EVENT_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/

/** Validate and dedupe one dispatch payload. Pure apart from reading the ledger. */
export function intake(payload, { ledgerDir = join(HARNESS, 'state/observations'), now = new Date() } = {}) {
  const events = payload?.events
  if (!Array.isArray(events)) throw new Error('client_payload.events must be an array')
  if (events.length > MAX_EVENTS) throw new Error(`client_payload.events holds ${events.length} events; the cap is ${MAX_EVENTS}`)
  const seenAt = now.toISOString().slice(0, 10)
  const seen = readSeenIds(ledgerDir)
  const payloads = readSeenPayloads(ledgerDir)
  const fresh = []
  const rejected = {}
  let duplicates = 0
  for (const event of events) {
    try {
      if (!event || typeof event !== 'object' || Array.isArray(event)) throw new Error('invalid_event')
      if (typeof event.event_id !== 'string' || !EVENT_ID.test(event.event_id)) throw new Error('invalid_event_id')
      if (typeof event.summary !== 'string' || event.summary.length < 12 || event.summary.length > 800) throw new Error('invalid_summary')
      if (typeof event.evidence_ref !== 'string' || event.evidence_ref.length > 300) throw new Error('invalid_evidence_ref')
      if (leaks(event.summary)) throw new Error('redaction_failed')
      const row = toObservation({ ...event, payload_sha256: envelopeSha(event) }, seenAt, { requireInbox: false })
      if (seen.has(row.id)) {
        if (row.schema_version === 2 && payloads.get(row.id) !== row.payload_sha256) throw new Error('event_conflict')
        duplicates++; continue
      }
      seen.add(row.id)
      payloads.set(row.id, row.payload_sha256)
      fresh.push(row)
    } catch (error) {
      rejected[error.message] = (rejected[error.message] || 0) + 1
    }
  }
  return { fresh, rejected, duplicates, ledger: join(ledgerDir, `${seenAt.slice(0, 7)}.jsonl`) }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const args = process.argv.slice(2)
  const i = args.indexOf('--file')
  const path = i === -1 ? process.env.GITHUB_EVENT_PATH : args[i + 1]
  if (!path) { console.error('::error::No event: set GITHUB_EVENT_PATH or pass --file.'); process.exit(1) }
  let result
  try {
    const event = JSON.parse(readFileSync(path, 'utf8'))
    result = intake(event.client_payload ?? event)
  } catch (error) {
    console.error(`::error::The dispatch payload was refused: ${error.message}`)
    process.exit(1)
  }
  const { fresh, rejected, duplicates, ledger } = result
  if (fresh.length && !args.includes('--dry-run')) {
    mkdirSync(resolve(ledger, '..'), { recursive: true })
    appendFileSync(ledger, fresh.map((row) => JSON.stringify(row)).join('\n') + '\n')
  }
  const reasons = Object.entries(rejected).map(([k, v]) => `${k} x${v}`).join(', ')
  console.log(`Observation intake: ${fresh.length} new, ${duplicates} already recorded, ${Object.values(rejected).reduce((a, b) => a + b, 0)} refused${reasons ? ` (${reasons})` : ''}.`)
  if (Object.keys(rejected).length) console.log('::warning::Some envelopes were refused; the counts above say why. Nothing refused was written.')
}
