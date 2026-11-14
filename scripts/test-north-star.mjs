#!/usr/bin/env node
/**
 * The North Star number: corrections Krish had to give twice in a week. A
 * taste-ledger repeat counts once, a harness correction cluster seen on two
 * days counts once, other weeks count nothing, and only the state line of
 * NOW.md changes. No network, no ledger: every row is synthetic.
 */

import { measure, writeState, mondayOf, TASTE_PREFIX, SOURCE } from './north-star.mjs'
import { isTasteReading } from './propose.mjs'

let passed = 0
let failed = 0
const test = (name, condition) => {
  if (condition) passed += 1
  else failed += 1
  console.log(`${condition ? 'ok  ' : 'FAIL'}  ${name}`)
}

const today = '2026-11-13' // a Friday: the last whole week is 2 to 8 November
const taste = (week, slug) => ({ class: 'correction', source: 'harness-inbox', evidence: `${TASTE_PREFIX}${week}:publication:${slug}`, dated: week, seen_at: '2026-11-13', quote: `[github-actions] Krish gave the same correction (${slug}) in 3 pieces of evidence.` })
const correction = (dated, quote) => ({ class: 'correction', source: 'harness-inbox', evidence: `inbox:e-${dated}-${quote.length}`, dated, seen_at: dated, quote })

test('mondayOf finds the Monday of a Friday, a Sunday and a Monday',
  mondayOf('2026-11-13') === '2026-11-09' && mondayOf('2026-11-15') === '2026-11-09' && mondayOf('2026-11-09') === '2026-11-09')

const marker = (week, total) => ({ class: 'successful_pattern', source: 'harness-inbox', evidence: `${TASTE_PREFIX}${week}:reading`, evidence_ref: `inspirationhouse:taste_signals:${week}:reading:${total}`, dated: week, seen_at: '2026-11-13', quote: `[github-actions] The taste ledger read the week of ${week}: ${total} repeated corrections.` })

const empty = measure([], { today })
test('a ledger the taste ledger has not reached yet reads "not measured", never 0, for the last whole week',
  empty.week === '2026-11-02' && empty.current === null && empty.reason === 'taste ledger not yet read for this week')
const zero = measure([marker('2026-11-02', 0)], { today })
test('the weekly marker with a total of 0 makes a true 0', zero.current === 0 && zero.taste === 0 && zero.reason === null)
test('a marker for another week proves nothing about this one', measure([marker('2026-10-26', 0)], { today }).current === null)
const partial = measure([marker('2026-11-02', 3), taste('2026-11-02', 'graphics.clarity')], { today })
test('fewer repeat rows than the marker announced read "not measured", with the gap', partial.current === null && partial.reason === 'taste ledger partly received (1 of 3 repeats)')
test('repeat rows recorded before the marker existed still count (week of 2 Nov)', measure([taste('2026-11-02', 'graphics.clarity')], { today }).current === 1)

const rows = [
  taste('2026-11-02', 'production.polished_finish'),
  taste('2026-11-02', 'graphics.clarity'),
  taste('2026-10-26', 'tone.no_hype'),
  taste('2026-11-09', 'editing.pace'),
  correction('2026-11-03', 'stop opening the email with a greeting before the point'),
  correction('2026-11-06', 'stop opening the email with a greeting before the actual point'),
  correction('2026-11-04', 'the chart colours must follow the dataviz palette exactly'),
]
const r = measure(rows, { today })
test('each taste-ledger repeat of the week counts once; other weeks count nothing', r.taste === 2)
test('a harness correction given on two days counts once, a single one not at all', r.harness === 1)
test('the number adds both', r.current === 3 && r.week === '2026-11-02')

const now = [
  '---', 'as_of: 2026-11-13', '---', '# The harness', '', '## Where it is right now (as of 2026-11-13)', '',
  '<!-- north-star-state {"week_of": "2026-10-26", "week_target": null, "current": null, "current_as_of": null, "current_source": null, "urgency": 4, "urgency_reason": "not measured yet"} --> **North Star number: U4, far behind.** Corrections Krish had to give twice in a week, across the fleet: not measured yet.',
  '', '- a bullet that must not move', '',
].join('\n')
const out = writeState(now, r, { asOf: today })
const line = out.split('\n').find((l) => l.startsWith('<!-- north-star-state'))
const state = JSON.parse(/<!-- north-star-state (\{.*?\}) -->/.exec(line)[1])
test('the state line carries the reading, its week, date and source',
  state.current === 3 && state.week_of === '2026-11-02' && state.current_as_of === today && state.current_source === SOURCE)
test('with no ladder the urgency stays U4 and says the ladder is pending', state.urgency === 4 && state.urgency_reason === 'ladder pending baseline' && state.week_target === null)
test('the sentence states the number in plain words', line.includes('U4, ladder pending Krish') && line.includes(': 3 in the week of 2026-11-02'))
test('nothing else in NOW.md changes', out.split('\n').filter((l) => !l.startsWith('<!-- north-star-state')).join('\n') === now.split('\n').filter((l) => !l.startsWith('<!-- north-star-state')).join('\n'))
test('the same reading the next night leaves NOW.md untouched', writeState(out, r, { asOf: '2026-11-14' }) === out)

const laddered = now.replace('"week_target": null', '"week_target": 2').replace('"urgency": 4', '"urgency": 2')
const s2 = JSON.parse(/<!-- north-star-state (\{.*?\}) -->/.exec(writeState(laddered, r, { asOf: today }))[1])
test('once Krish sets a ladder, the target and urgency are left to it', s2.week_target === 2 && s2.urgency === 2)

const unmeasured = writeState(out, empty, { asOf: '2026-11-16' })
const s3 = JSON.parse(/<!-- north-star-state (\{.*?\}) -->/.exec(unmeasured)[1])
test('an unmeasured week writes current null, U4 and the reason, never 0',
  s3.current === null && s3.urgency === 4 && s3.urgency_reason === 'not measured: taste ledger not yet read for this week' && unmeasured.includes('**North Star number: not measured, U4.**'))
test('even with a ladder, an unmeasured number is U4', JSON.parse(/<!-- north-star-state (\{.*?\}) -->/.exec(writeState(laddered, empty, { asOf: today }))[1]).urgency === 4)
test('the same unmeasured reading the next night leaves NOW.md untouched', writeState(unmeasured, empty, { asOf: '2026-11-17' }) === unmeasured)
test('once the marker lands, the true reading replaces "not measured"', JSON.parse(/<!-- north-star-state (\{.*?\}) -->/.exec(writeState(unmeasured, zero, { asOf: '2026-11-16' }))[1]).current === 0)

test('the proposer recognises the marker as a receipt, not a lesson', isTasteReading(marker('2026-11-02', 0)) && !isTasteReading(taste('2026-11-02', 'graphics.clarity')))

let threw = false
try { writeState('# no state line', r, { asOf: today }) } catch { threw = true }
test('a NOW.md without the state line is an error, never a silent skip', threw)

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
