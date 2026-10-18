/** Opaque cloud progress, acknowledged in GitHub without transcript text or provider identifiers. */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { observationId, envelopeSha } from '../import-harness-events.mjs'

export const CLOUD_CHECKPOINT_PATH = 'state/session-miner/checkpoints.jsonl'
const sha = (value) => createHash('sha256').update(String(value), 'utf8').digest('hex')
const canonical = (value) => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])])) : value
const digest = (value) => sha(JSON.stringify(canonical(value)))
export const cloudSessionHash = (session) => sha(`claude-code-web\0${session}`)
export const cloudEventHash = (event) => sha(`event\0${event}`)
const sameKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).sort().join(',') === [...keys].sort().join(',')
// Cloud provider events carry microseconds (six fractional digits).
const timestamp = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/.test(value) && Number.isFinite(Date.parse(value))

export function validateCloudCheckpoint(checkpoint) {
  if (!sameKeys(checkpoint, ['schema_version', 'adapter', 'checkpoint_id', 'cursors', 'receipts']) || checkpoint.schema_version !== 1 || checkpoint.adapter !== 'cloud-events') throw new Error('invalid_cloud_checkpoint')
  if (!Array.isArray(checkpoint.cursors) || !checkpoint.cursors.length || checkpoint.cursors.length > 200 || !Array.isArray(checkpoint.receipts) || checkpoint.receipts.length > 50) throw new Error('invalid_cloud_checkpoint_size')
  const sessions = new Set(), receipts = new Set()
  for (const cursor of checkpoint.cursors) {
    if (!sameKeys(cursor, ['session_sha256', 'at', 'event_sha256']) || !/^[a-f0-9]{64}$/.test(cursor.session_sha256) || !timestamp(cursor.at) || !Array.isArray(cursor.event_sha256) || !cursor.event_sha256.length || cursor.event_sha256.length > 500 || cursor.event_sha256.some((id) => !/^[a-f0-9]{64}$/.test(id)) || new Set(cursor.event_sha256).size !== cursor.event_sha256.length || sessions.has(cursor.session_sha256)) throw new Error('invalid_cloud_checkpoint_cursor')
    sessions.add(cursor.session_sha256)
  }
  for (const receipt of checkpoint.receipts) {
    if (!sameKeys(receipt, ['id', 'payload_sha256']) || !/^[a-f0-9]{16}$/.test(receipt.id) || !/^[a-f0-9]{64}$/.test(receipt.payload_sha256) || receipts.has(receipt.id)) throw new Error('invalid_cloud_checkpoint_receipt')
    receipts.add(receipt.id)
  }
  const { checkpoint_id, ...body } = checkpoint
  if (checkpoint_id !== `checkpoint:${digest(body)}`) throw new Error('cloud_checkpoint_content_mismatch')
  if (Buffer.byteLength(JSON.stringify(checkpoint), 'utf8') > 55000) throw new Error('cloud_checkpoint_over_budget')
  return checkpoint
}

function opaqueCursor(session, value) {
  const at = typeof value === 'string' ? value : value?.at
  // Legacy time-only cursors cannot prove the timestamp's individual events were processed.
  if (!timestamp(at) || !Array.isArray(value?.ids) || !value.ids.length) throw new Error('cloud_checkpoint_requires_event_identity')
  return { session_sha256: cloudSessionHash(session), at, event_sha256: [...new Set(value.ids.map((id) => value.opaque_ids ? id : cloudEventHash(id)))].sort() }
}

export function makeCloudCheckpoints(next, envelopes, { previous = {} } = {}) {
  const receipts = envelopes.map((event) => ({ id: observationId(event), payload_sha256: envelopeSha(event) })).sort((a, b) => a.id.localeCompare(b.id))
  const receiptMap = new Map()
  for (const receipt of receipts) {
    if (receiptMap.has(receipt.id) && receiptMap.get(receipt.id).payload_sha256 !== receipt.payload_sha256) throw new Error('cloud_checkpoint_receipt_conflict')
    receiptMap.set(receipt.id, receipt)
  }
  const uniqueReceipts = [...receiptMap.values()]
  const cursors = Object.entries(next).filter(([session, value]) => value && JSON.stringify(value) !== JSON.stringify(previous[session])).map(([session, value]) => opaqueCursor(session, value)).sort((a, b) => a.session_sha256.localeCompare(b.session_sha256))
  const checkpoints = [], seal = (entries) => {
    const body = { schema_version: 1, adapter: 'cloud-events', cursors: entries, receipts: uniqueReceipts }
    return { ...body, checkpoint_id: `checkpoint:${digest(body)}` }
  }
  let batch = []
  for (const cursor of cursors) {
    const candidate = seal([...batch, cursor])
    if (batch.length && (batch.length >= 200 || Buffer.byteLength(JSON.stringify(candidate), 'utf8') > 55000)) { checkpoints.push(validateCloudCheckpoint(seal(batch))); batch = [] }
    batch.push(cursor)
  }
  if (batch.length) checkpoints.push(validateCloudCheckpoint(seal(batch)))
  return checkpoints
}

/** Validate every line before using it; concurrent or older batches only add monotonic progress. */
export function cloudCheckpointState(text) {
  const checkpoints = new Map(), cursors = {}
  for (const line of text.split('\n').filter(Boolean)) {
    const checkpoint = validateCloudCheckpoint(JSON.parse(line))
    checkpoints.set(checkpoint.checkpoint_id, checkpoint)
    for (const cursor of checkpoint.cursors) {
      const old = cursors[cursor.session_sha256]
      if (!old || Date.parse(cursor.at) > Date.parse(old.at)) cursors[cursor.session_sha256] = { at: cursor.at, ids: [...cursor.event_sha256], opaque_ids: true }
      else if (Date.parse(cursor.at) === Date.parse(old.at)) old.ids = [...new Set([...old.ids, ...cursor.event_sha256])].sort()
    }
  }
  return { checkpoints, cursors }
}

export function loadCloudCheckpointState(path) {
  return cloudCheckpointState(existsSync(path) ? readFileSync(path, 'utf8') : '')
}

/** No source identifier is reconstructed: match only sessions already obtained from the provider. */
export function resumeCloudCursor(turns, local, durable) {
  const merged = structuredClone(local)
  for (const { session } of turns) {
    const remote = durable[cloudSessionHash(session)], old = merged[session]
    const oldAt = typeof old === 'string' ? old : old?.at
    if (!remote) continue
    if (!oldAt || Date.parse(remote.at) > Date.parse(oldAt)) merged[session] = structuredClone(remote)
    else if (Date.parse(remote.at) === Date.parse(oldAt)) merged[session] = { at: remote.at, ids: [...new Set([...remote.ids, ...(old?.ids || []).map((id) => old.opaque_ids ? id : cloudEventHash(id))])].sort(), opaque_ids: true }
  }
  return merged
}
