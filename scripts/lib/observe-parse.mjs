/**
 * The observer's parsing, separated from its network calls so it can be tested.
 *
 * Everything here is pure: text in, rows or keys out. scripts/observe.mjs owns
 * the fleet reads and the writes; this file owns what counts as one piece of
 * evidence, which is where the ledger went wrong:
 *
 *   - Two rulings written on consecutive lines were joined into one quote, so
 *     106 ledger rows carried a second ruling inside the first.
 *   - The same ruling repeated in every commit of a session was recorded once
 *     per commit, so a single decision read as a pattern.
 *   - An audit finding was keyed by the date, so a standing condition was
 *     re-recorded every night: 589 rows for about 50 findings.
 *   - The reconcile report was parsed with a pattern it never writes, so no
 *     inbound canon edit ever reached the ledger.
 */

import { createHash } from 'node:crypto'

const sha = (s) => createHash('sha256').update(s, 'utf8').digest('hex')

/** The ledger row id. The separator is a NUL, written as an escape so the file stays text. */
export const observationId = (o) => sha([o.source, o.repo, o.evidence, o.class, o.quote].join('\u0000')).slice(0, 16)

// [ \t]* rather than \s*: under the m flag \s matches a newline, so ^\s* consumes
// the blank line above a ruling and the match starts one line early.
export const RULING = /^[ \t]*(?:-[ \t]*)?(?:\*\*)?Ruling[ \t]*\((?:Krish,?[ \t]*)?(\d{4}-\d{2}-\d{2})\)(?:\*\*)?[ \t]*:[ \t]*(.+)$/gim
export const RULING_ALT = /^[ \t]*(?:-[ \t]*)?(?:\*\*)?Krish,[ \t]*(\d{4}-\d{2}-\d{2})(?:\*\*)?[ \t]*:[ \t]*(.+)$/gim

// A line that starts a new ruling ends the one before it. No g flag: test() on a
// global regex is stateful.
const RULING_START = /^[ \t]*(?:-[ \t]*)?(?:\*\*)?(?:Ruling[ \t]*\(|Krish,[ \t]*\d{4}-\d{2}-\d{2})/i
const TRAILER = /^(Co-Authored-By|Claude-Session|Signed-off-by|Reviewed-by|Harness-Steward)\s*:/i

/**
 * Commit bodies are hard-wrapped, so a ruling of any substance runs across
 * several lines. Continue until a blank line, a bullet, a heading, a trailer,
 * or the start of the next ruling.
 */
export function unwrap(message, matchIndex, firstLine) {
  const lines = message.slice(matchIndex).split('\n')
  const out = [firstLine.trim()]
  for (const line of lines.slice(1)) {
    const t = line.trim()
    if (!t) break
    if (/^[-*]\s/.test(t)) break
    if (/^#{1,6}\s/.test(t)) break
    if (TRAILER.test(t)) break
    if (RULING_START.test(t)) break
    out.push(t)
  }
  return out.join(' ').replace(/\s+/g, ' ')
}

/** Every ruling in a commit message, each unwrapped on its own. */
export function extractRulings(message) {
  const found = []
  const at = new Set()
  for (const re of [RULING, RULING_ALT]) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(message))) {
      if (at.has(m.index)) continue
      at.add(m.index)
      found.push({ dated: m[1], quote: unwrap(message, m.index, m[2]).slice(0, 600), index: m.index })
    }
  }
  return found.sort((a, b) => a.index - b.index)
}

const normalise = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/** The same decision, however many commits quote it. */
export const rulingKey = (quote, dated) => sha(`${dated || ''}\u0000${normalise(quote)}`).slice(0, 16)

/** Old rows joined consecutive rulings; split them so both halves count as seen. */
export function splitLegacyQuote(quote) {
  return String(quote)
    .split(/\s(?=(?:\*\*)?Ruling[ \t]*\((?:Krish,?[ \t]*)?\d{4}-\d{2}-\d{2}\))/i)
    .map((part) => {
      const m = part.match(/^(?:\*\*)?Ruling[ \t]*\((?:Krish,?[ \t]*)?(\d{4}-\d{2}-\d{2})\)(?:\*\*)?[ \t]*:[ \t]*(.+)$/i)
      return m ? { dated: m[1], quote: m[2].trim() } : { dated: null, quote: part.trim() }
    })
    .filter((p) => p.quote)
}

/** Ruling keys already in the ledger, including both halves of legacy joined quotes. */
export function seenRulingKeys(rows) {
  const keys = new Set()
  for (const r of rows) {
    if (r.class !== 'ruling') continue
    if (r.ruling_key) keys.add(r.ruling_key)
    const parts = splitLegacyQuote(r.quote)
    parts.forEach((p, i) => keys.add(rulingKey(p.quote, i === 0 ? r.dated : (p.dated || r.dated))))
  }
  return keys
}

/**
 * The audit report: `## class` headings, then `**subject.** detail` lines.
 * The "Measured, no finding" section is a list of passes, never findings.
 */
export function parseAuditReport(text) {
  const findings = []
  let klass = null
  for (const line of String(text).split('\n')) {
    const h = line.match(/^##\s+(.+?)\s*$/)
    if (h) { klass = /measured, no finding/i.test(h[1]) ? null : h[1].trim(); continue }
    if (!klass) continue
    const m = line.match(/^\*\*(.+?)\.\*\*\s+(.+)$/)
    if (m) findings.push({ klass, subject: m[1].trim(), detail: m[2].replace(/\s+/g, ' ').trim() })
  }
  return findings
}

/** A standing finding's identity: its class and subject, with any leading count dropped. */
export const normaliseSubject = (subject) => String(subject).trim().replace(/^\d+\s+/, '# ')
export const standingKey = (klass, subject) => `${klass}:${normaliseSubject(subject)}`
const legacyKey = (subject) => `*:${normaliseSubject(subject)}`

/**
 * The reconcile report: inbound canon edits under "Proposals against the canon",
 * and failures under "Errors". An inbound edit is keyed by its stamp, so the same
 * edit is one observation however many nights it stays unresolved.
 */
export function parseReconcileReport(text) {
  const edits = []
  const errors = []
  let section = null
  let current = null
  for (const line of String(text).split('\n')) {
    const h2 = line.match(/^##\s+(.+?)\s*$/)
    if (h2) { section = h2[1]; current = null; continue }
    const h3 = line.match(/^###\s+(.+?)\s+\(`(inbound-edit|both-moved)`\)\s*$/)
    if (h3) { current = { name: h3[1], state: h3[2], stamp: null, detail: '' }; edits.push(current); continue }
    if (current) {
      const s = line.match(/^-\s+Stamp in the repository:\s+`(.+)`\s*$/)
      if (s) { current.stamp = s[1]; continue }
      if (!current.detail && line.trim() && !line.startsWith('-') && !line.startsWith('```')) current.detail = line.trim()
    }
    if (section === 'Errors') {
      const e = line.match(/^-\s+([^:]+):\s+(.+)$/)
      if (e) errors.push({ name: e[1].trim(), detail: e[2].trim() })
    }
  }
  return { edits, errors }
}

/**
 * Seed the standing set from legacy ledger rows, which carry the subject in the
 * quote but not the class. Only used when standing.json does not exist yet.
 */
export function bootstrapStanding(rows) {
  const standing = {}
  for (const r of rows) {
    if (r.class !== 'audit') continue
    const subject = String(r.quote).split(':')[0]
    const key = legacyKey(subject)
    const e = standing[key] || (standing[key] = { klass: '*', subject: normaliseSubject(subject), first_seen: r.seen_at, last_seen: r.seen_at, open: true, legacy: true })
    if (r.seen_at < e.first_seen) e.first_seen = r.seen_at
    if (r.seen_at > e.last_seen) e.last_seen = r.seen_at
  }
  return standing
}

/**
 * Fold today's findings into the standing set. Returns the findings that opened
 * (new, or back after closing) and the keys that closed. A finding that was
 * already open produces nothing, which is the point.
 */
export function updateStanding(prev, findings, today) {
  const standing = JSON.parse(JSON.stringify(prev || {}))
  const opened = []
  const present = new Set()
  for (const f of findings) {
    const key = standingKey(f.klass, f.subject)
    present.add(key)
    const legacy = standing[legacyKey(f.subject)]
    if (!standing[key] && legacy) {
      // A legacy row for the same subject: carry its first sighting, record nothing.
      standing[key] = { klass: f.klass, subject: normaliseSubject(f.subject), first_seen: legacy.first_seen, open: true }
      legacy.migrated = true
      continue
    }
    const e = standing[key]
    if (e && e.open) continue
    const reopened = Boolean(e)
    standing[key] = { klass: f.klass, subject: normaliseSubject(f.subject), first_seen: e ? e.first_seen : today, open: true, ...(reopened ? { reopened: today } : {}) }
    opened.push({ ...f, key, reopened })
  }
  const closed = []
  for (const [key, e] of Object.entries(standing)) {
    if (e.legacy) {
      // Migrated, or no longer reported: either way the legacy seed has done its job.
      delete standing[key]
      continue
    }
    if (e.open && !present.has(key)) {
      e.open = false
      e.closed_at = today
      closed.push(key)
    }
  }
  return { standing, opened, closed }
}

/**
 * Lifecycle rows for steward pull requests: weekly proposal documents and,
 * once they exist, change requests. Idempotent against ids already recorded.
 */
export function proposalRows(pulls, knownIds) {
  const rows = []
  for (const pr of pulls) {
    const head = pr.head?.ref || ''
    const kind = head.startsWith('harness/proposals-') ? 'proposals' : head.startsWith('harness/change-') ? 'change' : null
    if (!kind) continue
    const tag = head.replace(/^harness\/(proposals|change)-/, '')
    const expired = (pr.labels || []).some((l) => (l.name || l) === 'superseded')
    const state = pr.merged_at ? 'merged' : pr.closed_at ? (expired ? 'expired' : 'closed') : 'opened'
    const rowId = `${kind}-${tag}.${state}`
    if (knownIds.has(rowId)) continue
    const at = pr.merged_at || pr.closed_at || pr.created_at
    const hours = pr.created_at && (pr.merged_at || pr.closed_at)
      ? Math.round((Date.parse(pr.merged_at || pr.closed_at) - Date.parse(pr.created_at)) / 36e5)
      : null
    rows.push({
      id: rowId, at, event: state, kind, pr: pr.number, branch: head,
      ...(kind === 'proposals' ? { proposal: `docs/proposals/${tag}.md` } : {}),
      ...(hours !== null ? { hours_to_decision: hours } : {}),
      note: 'Recorded by scripts/observe.mjs.',
    })
  }
  return rows
}
