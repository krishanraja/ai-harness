#!/usr/bin/env node
/**
 * The observer's parsing, tested without a network or a token.
 *
 * Each case below is a defect the ledger actually carried: joined rulings,
 * the same ruling counted once per commit, a standing audit finding recorded
 * every night, and a reconcile report nobody parsed.
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  observationId, extractRulings, rulingKey, seenRulingKeys, parseAuditReport, standingKey,
  parseReconcileReport, bootstrapStanding, updateStanding, proposalRows,
} from './lib/observe-parse.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
let passed = 0
let failed = 0
const test = (name, condition) => {
  if (condition) passed += 1
  else failed += 1
  console.log(`${condition ? 'ok  ' : 'FAIL'}  ${name}`)
}

// ------------------------------------------------------------------ ids
// The separator used to be a literal NUL byte in the source, which made git
// treat the observer as binary. Writing it as an escape must not move any id.
const ledgerDir = join(HARNESS, 'state/observations')
const live = []
for (const f of readdirSync(ledgerDir).filter((f) => f.endsWith('.jsonl')).sort()) {
  for (const line of readFileSync(join(ledgerDir, f), 'utf8').split('\n')) {
    if (!line.trim()) continue
    const row = JSON.parse(line)
    if (['commit', 'audit', 'now', 'canary'].includes(row.source)) live.push(row)
  }
}
const sample = [live.find((r) => r.source === 'commit'), live.find((r) => r.source === 'audit'), live.find((r) => r.source === 'canary')].filter(Boolean)
test('three live ledger rows still hash to their stored ids', sample.length === 3 && sample.every((r) => observationId(r) === r.id))
test('the observer source no longer carries a NUL byte', !readFileSync(join(HARNESS, 'scripts/observe.mjs')).includes(0))

// --------------------------------------------------------------- rulings
const twoRulings = [
  'feat: carry the rulings',
  '',
  'Ruling (Krish, 2026-10-06): Hunter is active.',
  'Ruling (Krish, 2026-10-06): the mindmake repository stays out of the',
  'canon rollout and must not be reopened nightly.',
  '',
  'Co-Authored-By: Someone <noreply@example.invalid>',
].join('\n')
const split = extractRulings(twoRulings)
test('two consecutive Ruling lines give two quotes', split.length === 2)
test('neither quote contains a second ruling', split.every((r) => !/Ruling \(/.test(r.quote)))
test('a wrapped continuation joins its ruling', split[1]?.quote === 'the mindmake repository stays out of the canon rollout and must not be reopened nightly.')

const mixed = 'Ruling (Krish, 2026-10-05): publish the ikigai.\nKrish, 2026-10-05: keep mindmake excluded.\n'
test('a Ruling line followed by a "Krish, DATE:" line splits', extractRulings(mixed).length === 2 && !extractRulings(mixed)[0].quote.includes('Krish,'))

const trailer = 'Ruling (Krish, 2026-10-14): merge-ready change requests.\nCo-Authored-By: A <a@example.invalid>\n'
test('a trailer stops the unwrap', extractRulings(trailer)[0]?.quote === 'merge-ready change requests.')

const a = extractRulings('x\n\nRuling (Krish, 2026-10-06): Hunter is active.\n')[0]
const b = extractRulings('y\n\n- Ruling (Krish, 2026-10-06): Hunter is  active\n')[0]
test('the same ruling in two commits has one key', rulingKey(a.quote, a.dated) === rulingKey(b.quote, b.dated))

const legacy = { class: 'ruling', dated: '2026-10-06', quote: 'Hunter is active. Ruling (Krish, 2026-10-06): the mindmake repository stays out of the canon rollout.' }
const keys = seenRulingKeys([legacy])
test('a legacy joined quote yields keys for both halves',
  keys.has(rulingKey('Hunter is active.', '2026-10-06')) && keys.has(rulingKey('the mindmake repository stays out of the canon rollout.', '2026-10-06')))

// ----------------------------------------------------------------- audit
const scratch = mkdtempSync(join(tmpdir(), 'harness-observe-test-'))
const auditOut = join(scratch, 'audit.md')
execFileSync(process.execPath, [join(HARNESS, 'scripts/audit-harness.mjs'), '--out', auditOut], { cwd: HARNESS, stdio: 'ignore' })
const findings = parseAuditReport(readFileSync(auditOut, 'utf8'))
test('the real audit report yields findings', findings.length > 0)
test('every finding carries its class', findings.every((f) => f.klass && !/measured/i.test(f.klass)))
test('no standing key carries a date', findings.every((f) => !/\d{4}-\d{2}-\d{2}/.test(standingKey(f.klass, f.subject))))
test('a finding whose subject is a count keeps one key as the count moves', standingKey('dead-zone', '102 live rules') === standingKey('dead-zone', '110 live rules'))
test('the same subject under two classes keeps two keys', standingKey('freshness', 'krish-build') !== standingKey('description-budget', 'krish-build'))

// --------------------------------------------------------------- standing
const day1 = updateStanding({}, [{ klass: 'freshness', subject: 'video-engine', detail: 'due 16 days ago' }], '2026-10-14')
const day2 = updateStanding(day1.standing, [{ klass: 'freshness', subject: 'video-engine', detail: 'due 17 days ago' }], '2026-10-15')
const day3 = updateStanding(day2.standing, [], '2026-10-16')
const day4 = updateStanding(day3.standing, [{ klass: 'freshness', subject: 'video-engine', detail: 'due again' }], '2026-11-20')
test('a new finding opens once', day1.opened.length === 1)
test('a standing finding records nothing the next night', day2.opened.length === 0)
test('a finding that stops being reported closes with its date', day3.closed.length === 1 && day3.standing['freshness:video-engine'].closed_at === '2026-10-16')
test('a closed finding that returns reopens and keeps its first sighting', day4.opened.length === 1 && day4.opened[0].reopened && day4.standing['freshness:video-engine'].first_seen === '2026-10-14')

const seeded = bootstrapStanding([
  { class: 'audit', quote: 'harness-maintainer: Reviewed 2026-08-20', seen_at: '2026-09-20' },
  { class: 'audit', quote: 'harness-maintainer: Reviewed 2026-08-20', seen_at: '2026-10-13' },
  { class: 'audit', quote: 'old-thing: gone', seen_at: '2026-09-21' },
])
const migrated = updateStanding(seeded, [{ klass: 'freshness', subject: 'harness-maintainer', detail: 'due' }], '2026-10-14')
test('a legacy finding still reported migrates without a new row', migrated.opened.length === 0 && migrated.standing['freshness:harness-maintainer']?.first_seen === '2026-09-20')
test('legacy seeds are gone after the first run', !Object.keys(migrated.standing).some((k) => k.startsWith('*:')))

// -------------------------------------------------------------- reconcile
const reconcileReport = [
  '# Canon reconciliation 2026-10-14',
  '',
  '## Proposals against the canon',
  '',
  'These repositories were edited inside the markers.',
  '',
  '### control-center (`inbound-edit`)',
  '',
  'The block in control-center/AGENTS.md was edited in place.',
  '',
  '- Stamp in the repository: `release=v2026.10.06.3 sha=abc rendered=def`',
  '- Canon now: `release=v2026.10.06.3 sha=abc`',
  '',
  '## Errors',
  '',
  '- content-engine: GET /repos -> 502 bad gateway',
  '',
].join('\n')
const parsed = parseReconcileReport(reconcileReport)
test('the reconcile report yields one inbound edit with its stamp', parsed.edits.length === 1 && parsed.edits[0].stamp === 'release=v2026.10.06.3 sha=abc rendered=def')
test('the reconcile report yields one error', parsed.errors.length === 1 && parsed.errors[0].name === 'content-engine')
const reconcileSource = readFileSync(join(HARNESS, 'scripts/reconcile.mjs'), 'utf8')
test('reconcile.mjs still writes the format this parser reads',
  reconcileSource.includes('p(`### ${f.name} (\\`${f.state}\\`)`)') && reconcileSource.includes("p(`- Stamp in the repository: \\`${f.stamp}\\``)"))

// ---------------------------------------------------------- proposal rows
const pulls = [
  { number: 99, head: { ref: 'harness/proposals-2026-09-28' }, created_at: '2026-09-28T00:00:00Z', merged_at: null, closed_at: null },
  { number: 130, head: { ref: 'harness/change-2026-10-19-compress-voice' }, created_at: '2026-10-19T00:00:00Z', merged_at: '2026-10-20T06:00:00Z', closed_at: '2026-10-20T06:00:00Z' },
  { number: 131, head: { ref: 'harness/change-2026-10-19-other' }, created_at: '2026-10-19T00:00:00Z', merged_at: null, closed_at: '2026-11-02T00:00:00Z', labels: [{ name: 'superseded' }] },
  { number: 7, head: { ref: 'feature/x' }, created_at: '2026-10-19T00:00:00Z' },
]
const rows = proposalRows(pulls, new Set())
test('proposal rows cover proposals and change requests only', rows.length === 3)
test('a merged change records hours to decision', rows.find((r) => r.pr === 130)?.hours_to_decision === 30)
test('an unmerged change closed as superseded reads as expired', rows.find((r) => r.pr === 131)?.event === 'expired')
test('proposal rows are idempotent', proposalRows(pulls, new Set(rows.map((r) => r.id))).length === 0)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) process.exit(1)
console.log('OBSERVE OK')
