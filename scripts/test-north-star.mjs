#!/usr/bin/env node
/**
 * The North Star number: corrections Krish had to give twice in a week. A
 * taste-ledger repeat counts once, a harness correction cluster seen on two
 * days counts once, other weeks count nothing, and only the state line of
 * NOW.md changes. No network, no ledger: every row is synthetic.
 */

import { measure, writeState, mondayOf, TASTE_PREFIX, SOURCE } from './north-star.mjs'

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

const empty = measure([], { today })
test('an empty ledger reads 0 for the last whole week, never the week still running', empty.week === '2026-11-02' && empty.current === 0)

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

let threw = false
try { writeState('# no state line', r, { asOf: today }) } catch { threw = true }
test('a NOW.md without the state line is an error, never a silent skip', threw)

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
