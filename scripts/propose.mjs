#!/usr/bin/env node
/**
 * The proposer: what the evidence has earned, once a week.
 *
 * This script does the deterministic half only. It reads the observation
 * ledger, decides which clusters have crossed a threshold, and writes a brief.
 * It never writes a proposal, because deciding which layer of the harness
 * should change is judgement, and judgement belongs in the model with a
 * deterministic gate on either side of it.
 *
 * The thresholds, and why each one:
 *
 *   three or more occurrences        the ordinary bar, matching the recurrence
 *                                    thresholds already implemented in Control
 *                                    Center's api/feedback.ts and the Vera
 *                                    clusterer. Two similar things happening is
 *                                    a coincidence.
 *   two, one a direct correction     a direct correction is the stated reason
 *                                    the quality standard's Gate 10 allows
 *                                    alongside repeated signals.
 *   one ruling or explicit correction
 *                                    Krish saying a thing once is not a weak
 *                                    signal that needs corroborating. Waiting
 *                                    for him to repeat himself is how the old
 *                                    corrections queue jammed.
 *
 * Everything below the bar stays a visible observation in the ledger and opens
 * nothing. A week with nothing earned writes one line saying so. That is what
 * makes an open proposal mean something.
 *
 *   node scripts/propose.mjs [--out <path>] [--weeks <n>] [--all]
 */

import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const args = process.argv.slice(2)
const flag = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1] }
const weeks = Number(flag('--weeks') || 1)
const all = args.includes('--all')

const LEDGER_DIR = join(HARNESS, 'state/observations')
const today = new Date().toISOString().slice(0, 10)
const cutoff = new Date(Date.now() - weeks * 7 * 86400000).toISOString().slice(0, 10)

const rows = []
for (const f of existsSync(LEDGER_DIR) ? readdirSync(LEDGER_DIR).sort() : []) {
  if (!f.endsWith('.jsonl')) continue
  for (const line of readFileSync(join(LEDGER_DIR, f), 'utf8').split('\n')) {
    if (!line.trim()) continue
    try {
      const r = JSON.parse(line)
      if (all || (r.seen_at || r.dated || '') >= cutoff) rows.push(r)
    } catch { /* a malformed line is not a reason to stop */ }
  }
}

// -------------------------------------------------------------- clustering
//
// Deterministic and deliberately crude: content-word overlap inside a class.
// It is not trying to be the judge. It only has to group things closely enough
// that the model reads related evidence together, and loosely enough that it
// never merges two unrelated complaints into one confident proposal.
const STOP = new Set('the a an and or of to in for on with is are was were be been it its this that as at by from not no than then so if when what which who how any all every some one two do does did can could should would may might must will shall his her their our your my me he she they we you i'.split(' '))
const words = (s) => new Set(String(s).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w)))
const jaccard = (a, b) => { let i = 0; for (const w of a) if (b.has(w)) i++; return i / (a.size + b.size - i || 1) }

const clusters = []
for (const r of rows) {
  const w = words(r.quote)
  if (w.size < 3) continue
  const hit = clusters.find((c) => c.class === r.class && jaccard(c.words, w) > 0.35)
  if (hit) {
    hit.rows.push(r)
    for (const x of w) hit.words.add(x)
  } else {
    clusters.push({ class: r.class, words: new Set(w), rows: [r] })
  }
}

// ------------------------------------------------------------- the thresholds
const DIRECT = new Set(['ruling', 'revert', 'correction'])
function eligibility(c) {
  const n = c.rows.length
  const direct = c.rows.filter((r) => DIRECT.has(r.class)).length
  if (n >= 3) return { eligible: true, reason: `${n} occurrences` }
  if (n === 2 && direct >= 1) return { eligible: true, reason: 'two occurrences, one of them a direct correction' }
  if (n === 1 && c.rows[0].class === 'ruling') return { eligible: true, reason: 'a direct ruling, which does not need repeating' }
  if (n === 1 && c.rows[0].class === 'correction') return { eligible: true, reason: 'an explicit user correction, which does not need repeating' }
  return { eligible: false, reason: n === 1 ? 'a single observation, not yet a pattern' : `${n} occurrences, below the bar of three` }
}

for (const c of clusters) Object.assign(c, eligibility(c))
const earned = clusters.filter((c) => c.eligible).sort((a, b) => b.rows.length - a.rows.length)
const watching = clusters.filter((c) => !c.eligible)

// -------------------------------------------------------------------- brief
const out = []
const p = (s = '') => out.push(s)
p(`# Weekly proposal brief, ${today}`)
p()
p(`Window: ${all ? 'the whole ledger' : `${cutoff} to ${today}`}. ${rows.length} observations, ${clusters.length} clusters, ${earned.length} over the bar.`)
p()

if (!earned.length) {
  p('## Nothing was earned this week')
  p()
  p('No cluster crossed a threshold. Open nothing. This is a normal and healthy result, and it is the reason an open proposal means something when there is one.')
  p()
  if (watching.length) {
    p('Still watching, below the bar:')
    p()
    for (const c of watching.slice(0, 15)) p(`- \`${c.class}\` ${c.reason}: ${c.rows[0].quote.slice(0, 140)}`)
    p()
  }
} else {
  p('## What the evidence has earned')
  p()
  p('Each block below crossed a threshold. Write one proposal per block, and name the layer that should change, using the cheapest sufficient layer:')
  p()
  p('1. **A rule in the canon block.** Cross-cutting doctrine. Cheapest, and where most evidence should land.')
  p('2. **A chapter or reference in an existing skill.** Preferred over a new skill: a new need starts with discovery, not with a new file.')
  p('3. **A routing fix.** When the evidence is a mis-trigger rather than missing knowledge.')
  p('4. **A new skill.** Only after the missing-skill test passes on all seven questions, and only with under 20 percent overlap with the retained set.')
  p('5. **A merge.** Two skills that keep firing together, or that overlap past the gate.')
  p('6. **Retirement or quarantine.** A skill past its SLA with no firings, reported with exposure. Non-firing means nothing without opportunities.')
  p()
  p('A block whose right answer is "nothing changes" is a valid outcome. Say so and say why; do not manufacture a change to justify the block.')
  p()
  for (const [i, c] of earned.entries()) {
    const allBackfill = c.rows.every((r) => r.backfill)
    p(`### Block ${i + 1}: \`${c.class}\`, ${c.reason}${allBackfill ? ' (backfill)' : ''}`)
    p()
    if (allBackfill) {
      p('Every observation in this block came from the observer\'s first run, which read history rather than watching it happen. Assume it was already acted on at the time and check before proposing anything: the useful question here is whether the ruling is now written down somewhere durable, not whether the change was made.')
      p()
    }
    for (const r of c.rows) {
      p(`- **${r.repo}** ${r.dated || r.seen_at} \`${r.evidence}\`${r.url ? ` ([source](${r.url}))` : ''}${r.backfill ? ' _(backfill)_' : ''}`)
      p(`  > ${r.quote}`)
    }
    p()
  }
  if (watching.length) {
    p('## Below the bar, recorded not proposed')
    p()
    for (const c of watching.slice(0, 20)) p(`- \`${c.class}\` ${c.reason}: ${c.rows[0].quote.slice(0, 140)}`)
    p()
  }
}

p('## The shape every proposal takes')
p()
p('Follow `ctrl-capture`, stage 9. Each proposal carries, in this order:')
p()
p('- **EVIDENCE**: the observations above, quoted with their commit or file, never paraphrased into something stronger than what was said.')
p('- **ALTERNATIVE EXPLANATIONS**: at least one reading of the same evidence that does not support the change.')
p('- **IF WRONG**: what breaks, and who notices first.')
p('- **VALIDATION**: the deterministic check or eval case that would show this worked, added before release.')
p('- **PRIOR KNOWN-GOOD + ROLLBACK**: the exact state to return to.')
p()
p('Never edit a skill directly. Never move a `reviewed` date without a review. A named human accepts or rejects each proposal; no model silently edits the rule by which it is judged.')
p()

const text = out.join('\n') + '\n'
const outPath = flag('--out')
if (outPath) { mkdirSync(dirname(outPath), { recursive: true }); writeFileSync(outPath, text) }
process.stdout.write(text)
console.log(`\nSummary: ${rows.length} observations, ${earned.length} earned, ${watching.length} watching.`)
