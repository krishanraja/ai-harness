#!/usr/bin/env node
/**
 * Measure the North Star number and write it where every reader looks: the
 * north-star-state line under "Where it is right now" in NOW.md
 * (contract/north-star-metric.md §2, which Control Center reads).
 *
 * The number (docs/NORTH_STAR.md): corrections Krish had to give twice in a
 * week, across the fleet. It is read for the last whole ISO week, Monday to
 * Sunday UTC, never a week still running, and it adds two counts:
 *
 *   - the taste ledger's repeats. krishanraja/inspirationhouse counts, per
 *     venture, each correction slug from its fixed vocabulary that Krish gave
 *     in two or more pieces of evidence about machine work in one week, and
 *     sends each as one explicit_correction envelope (event id
 *     taste-ledger:<week>:<venture>:<slug>). Each such row is already one
 *     repeat; most of his corrections land there, not in this ledger.
 *   - this ledger's own repeats: the direct corrections and new rulings of the
 *     week, clustered by meaning the way scripts/scoreboard.mjs does, where a
 *     cluster seen on two or more days is one repeat.
 *
 * It sets only the measured fields (week_of, current, current_as_of,
 * current_source) and the sentence after the comment. The ladder, week_target
 * and urgency are Krish's and Control Center's (contract §1): until he sets a
 * ladder the urgency stays U4, "ladder pending baseline".
 *
 *   node scripts/north-star.mjs            print the reading
 *   node scripts/north-star.mjs --write    and write it into NOW.md
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadLedger, normaliseRulings, cluster } from './propose.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
export const TASTE_PREFIX = 'inbox:taste-ledger:'
export const SOURCE = 'state/observations: taste ledger repeats + harness correction clusters'

const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10)

/** The Monday (UTC) of the ISO week that holds the day. */
export function mondayOf(iso) {
  const d = new Date(`${iso}T00:00:00Z`)
  return addDays(iso, -((d.getUTCDay() + 6) % 7))
}

/** The reading for the last whole week before the week that holds `today`. Pure. */
export function measure(rows, { today, jaccard = 0.5 }) {
  const week = addDays(mondayOf(today), -7)
  const end = addDays(week, 7)
  const day = (r) => r.dated || r.seen_at || ''
  const inWeek = (r) => day(r) >= week && day(r) < end
  const taste = rows.filter((r) => r.class === 'correction' && String(r.evidence || '').startsWith(TASTE_PREFIX) && inWeek(r))
  const own = rows.filter((r) => !String(r.evidence || '').startsWith(TASTE_PREFIX))
  const direct = [...normaliseRulings(own.filter(inWeek), own.filter((r) => day(r) < week)), ...own.filter((r) => r.class === 'correction' && inWeek(r))]
  const repeatedClusters = cluster(direct, jaccard, () => 'direct').filter((c) => new Set(c.rows.map(day)).size >= 2).length
  return { week, current: taste.length + repeatedClusters, taste: taste.length, harness: repeatedClusters }
}

const STATE = /<!-- north-star-state (\{.*?\}) -->[^\n]*/

/** Rewrite only the state line; everything else in NOW.md stays byte for byte. Pure. */
export function writeState(now, reading, { asOf }) {
  const m = STATE.exec(now)
  if (!m) throw new Error('NOW.md has no north-star-state line')
  const prior = JSON.parse(m[1])
  // The same reading is not re-dated every night: NOW.md changes only when the number does.
  if (prior.week_of === reading.week && prior.current === reading.current && prior.current_source === SOURCE) return now
  const state = {
    ...prior,
    week_of: reading.week,
    current: reading.current,
    current_as_of: asOf,
    current_source: SOURCE,
    ...(prior.week_target == null ? { urgency: 4, urgency_reason: 'ladder pending baseline' } : {}),
  }
  const u = state.urgency
  const sentence = `**North Star number: U${u}${prior.week_target == null ? ', ladder pending Krish' : ''}.** Corrections Krish had to give twice in a week, across the fleet: ${reading.current} in the week of ${reading.week} (${reading.taste} from the taste ledger, ${reading.harness} from the harness's own corrections), measured ${asOf}.`
  return now.replace(STATE, `<!-- north-star-state ${JSON.stringify(state)} --> ${sentence}`)
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const today = new Date().toISOString().slice(0, 10)
  const reading = measure(loadLedger(HARNESS), { today })
  console.log(`North Star: ${reading.current} corrections given twice in the week of ${reading.week} (${reading.taste} taste ledger, ${reading.harness} harness).`)
  if (process.argv.includes('--write')) {
    const path = join(HARNESS, 'NOW.md')
    const before = readFileSync(path, 'utf8')
    const after = writeState(before, reading, { asOf: today })
    if (after !== before) writeFileSync(path, after)
    console.log(after === before ? 'NOW.md already carries this reading.' : 'NOW.md state line written.')
  }
}
