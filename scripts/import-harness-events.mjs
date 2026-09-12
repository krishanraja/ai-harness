#!/usr/bin/env node
/**
 * Import redacted cross-surface events from Control Center into the governed
 * observation ledger. This runs in GitHub Actions, never on a user's machine.
 * It reads one cursor, appends unseen events and never changes canon.
 *
 * HARNESS_EVENT_EXPORT_URL and HARNESS_EVENT_EXPORT_TOKEN are required.
 */

import { createHash } from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const DEFAULT_LEDGER_DIR = join(HARNESS, 'state/observations')
const DEFAULT_CURSOR = join(DEFAULT_LEDGER_DIR, 'inbox-cursor.json')
const MAX_PAGES = 20
const SURFACES = new Set(['codex', 'claude-code', 'cursor', 'claude-cloud', 'perplexity', 'github-actions', 'n8n', 'other'])
const KINDS = new Set(['explicit_correction', 'failure', 'missed_trigger', 'false_trigger', 'repeated_manual_step', 'successful_pattern', 'contradiction'])
const OUTCOMES = new Set(['corrected', 'failed', 'succeeded', 'unknown'])
const SEVERITIES = new Set(['low', 'medium', 'high', 'blocking'])
const CONFIDENCES = new Set(['low', 'medium', 'high'])
const PRIVATE_SHAPE = /\b[A-Z]:\\(?:Users|Documents and Settings)\\|\/(?:Users|home)\/[^\s/]+\/|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i

export function observationId(eventId) {
  return createHash('sha256').update(`harness-inbox\0${eventId}`, 'utf8').digest('hex').slice(0, 16)
}

export function toObservation(event, seenAt) {
  if (!event || typeof event !== 'object') throw new Error('invalid_event')
  const required = ['inbox_id', 'event_id', 'occurred_at', 'surface', 'kind', 'summary', 'evidence_ref', 'outcome', 'severity', 'confidence', 'payload_sha256']
  for (const key of required) if (event[key] === undefined || event[key] === null || event[key] === '') throw new Error(`event_missing_${key}`)
  if (!Number.isSafeInteger(event.inbox_id) || event.inbox_id < 1) throw new Error('invalid_inbox_id')
  if (!SURFACES.has(event.surface)) throw new Error('invalid_surface')
  if (!KINDS.has(event.kind)) throw new Error('invalid_kind')
  if (!OUTCOMES.has(event.outcome)) throw new Error('invalid_outcome')
  if (!SEVERITIES.has(event.severity)) throw new Error('invalid_severity')
  if (!CONFIDENCES.has(event.confidence)) throw new Error('invalid_confidence')
  if (!/^[a-f0-9]{64}$/.test(event.payload_sha256)) throw new Error('invalid_payload_sha256')
  if (PRIVATE_SHAPE.test(`${event.summary}\n${event.evidence_ref}\n${event.related_skill_or_rule || ''}`)) throw new Error('private_shape_rejected')
  const dated = String(event.occurred_at).slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dated)) throw new Error('invalid_occurred_at')
  const related = event.related_skill_or_rule ? ` Related: ${event.related_skill_or_rule}.` : ''
  return {
    id: observationId(event.event_id),
    seen_at: seenAt,
    source: 'harness-inbox',
    repo: 'ai-harness',
    evidence: `inbox:${event.event_id}`,
    class: event.kind === 'explicit_correction' ? 'correction' : event.kind,
    dated,
    quote: `[${event.surface}] ${event.summary}${related}`.slice(0, 1000),
    author: null,
    url: null,
    evidence_ref: event.evidence_ref,
    outcome: event.outcome,
    severity: event.severity,
    confidence: event.confidence,
    payload_sha256: event.payload_sha256,
  }
}

function readSeenIds(ledgerDir) {
  const seen = new Set()
  if (!existsSync(ledgerDir)) return seen
  for (const file of readdirSync(ledgerDir)) {
    if (!file.endsWith('.jsonl')) continue
    for (const line of readFileSync(join(ledgerDir, file), 'utf8').split('\n')) {
      if (!line.trim()) continue
      try { seen.add(JSON.parse(line).id) } catch { /* malformed historical rows are handled by the harness audit */ }
    }
  }
  return seen
}

export async function importHarnessEvents({
  baseUrl,
  token,
  ledgerDir = DEFAULT_LEDGER_DIR,
  cursorPath = DEFAULT_CURSOR,
  fetchImpl = fetch,
  now = new Date(),
  dryRun = false,
}) {
  if (!baseUrl || !/^https:\/\//.test(baseUrl)) throw new Error('HARNESS_EVENT_EXPORT_URL must be an https URL')
  if (!token) throw new Error('HARNESS_EVENT_EXPORT_TOKEN is required')
  const seenAt = now.toISOString().slice(0, 10)
  const month = seenAt.slice(0, 7)
  const ledger = join(ledgerDir, `${month}.jsonl`)
  const seen = readSeenIds(ledgerDir)
  const saved = existsSync(cursorPath) ? JSON.parse(readFileSync(cursorPath, 'utf8')) : { cursor: 0 }
  let cursor = Number(saved.cursor || 0)
  if (!Number.isSafeInteger(cursor) || cursor < 0) throw new Error('invalid saved inbox cursor')
  const fresh = []
  let pages = 0
  let hasMore = false

  while (pages < MAX_PAGES) {
    pages += 1
    const url = new URL(baseUrl)
    url.searchParams.set('cursor', String(cursor))
    url.searchParams.set('limit', '100')
    const response = await fetchImpl(url, {
      headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    })
    const contentType = response.headers.get('content-type') || ''
    if (!response.ok || !contentType.includes('application/json')) {
      throw new Error(`event export failed: status=${response.status} content_type=${contentType || 'missing'}`)
    }
    const page = await response.json()
    if (!page || page.ok !== true || !Array.isArray(page.events) || !Number.isSafeInteger(page.next_cursor)) {
      throw new Error('event export returned an invalid response contract')
    }
    if (page.next_cursor < cursor) throw new Error('event export cursor moved backwards')
    if (page.has_more && page.next_cursor === cursor) throw new Error('event export did not advance its cursor')
    for (const event of page.events) {
      const row = toObservation(event, seenAt)
      if (!seen.has(row.id)) {
        seen.add(row.id)
        fresh.push(row)
      }
    }
    cursor = page.next_cursor
    hasMore = page.has_more === true
    if (!hasMore) break
  }
  if (hasMore) throw new Error(`event export exceeded the ${MAX_PAGES} page safety cap`)

  if (!dryRun) {
    mkdirSync(ledgerDir, { recursive: true })
    if (fresh.length) appendFileSync(ledger, fresh.map((row) => JSON.stringify(row)).join('\n') + '\n')
    writeFileSync(cursorPath, JSON.stringify({ cursor, updated_at: now.toISOString() }, null, 2) + '\n')
  }
  return { imported: fresh.length, cursor, pages, ledger, fresh }
}

const invoked = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invoked) {
  try {
    const result = await importHarnessEvents({
      baseUrl: process.env.HARNESS_EVENT_EXPORT_URL,
      token: process.env.HARNESS_EVENT_EXPORT_TOKEN,
      dryRun: process.argv.includes('--dry-run'),
    })
    console.log(`Harness inbox: ${result.imported} new observation(s), cursor ${result.cursor}, ${result.pages} page(s).`)
  } catch (error) {
    console.error(`::error::${error.message}`)
    process.exit(1)
  }
}
