#!/usr/bin/env node
/**
 * Which rules are load bearing, and which have never once been cited.
 *
 * brain/stores.yaml records why this file exists, in the row for
 * standards_registry. That store had rule_text, source, supersedes, hit_count,
 * last_hit_at and last_efficacy_check, designed in April. It was then abandoned
 * with 122 rows nominally live, 6 of 169 ever hit and 0 efficacy checks: the
 * memory doctrine's "dead zones, never retrieved" failure in a store built to
 * prevent exactly it.
 *
 * brain/rules.yaml then shipped 314 entries carrying every one of those fields
 * EXCEPT the two the diagnosis named. So the register a reader consults to ask
 * "is this rule load bearing" answered for none of them, and the audit could
 * say a skill was past its review date but never that a rule had been cited by
 * nothing, ever.
 *
 * Two producers of rule ids already exist and already throw their output away:
 *
 *   judge     every finding must cite a clause id from brain/rules.yaml, and
 *             an ungrounded one is discarded. A kept finding is a rule the
 *             panel actually reached for.
 *   canary    a positive synthetic canary that fired on a live client is evidence the
 *             skill was reachable, and every chapter of that skill is a rule
 *             the client could have applied.
 *
 * Counts are DERIVED, never written back into brain/rules.yaml. That is not
 * fastidiousness: brain/README.md says nothing in that directory is edited in
 * place by a script, and a mutable hit_count column would be the same shape as
 * the store this file exists to avoid repeating. The ledger is append only, one
 * row per observed citation, and the count is whatever you get when you read it.
 *
 *   node scripts/brain-usage.mjs --report            counts per rule id
 *   node scripts/brain-usage.mjs --report --dead     only the rules never cited
 *   node scripts/brain-usage.mjs --report --json
 *
 * A row is never written by this command. Only judge.mjs and canaries.mjs write,
 * and only when they have real evidence in hand.
 */

import { createHash } from 'node:crypto'
import { existsSync, readFileSync, appendFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'

export const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
export const LEDGER = 'brain/usage.jsonl'

const PRODUCERS = new Set(['judge', 'canary'])

/**
 * A stable id, so a re-run over the same evidence adds nothing.
 *
 * The same shape observe.mjs uses and for the same reason: a night the job ran
 * twice must not read as a rule that was cited twice. The ref is part of the id
 * because a rule cited by two different pull requests IS two citations, while
 * the same pull request re-judged is one.
 */
export function usageId({ rule_id, producer, ref }) {
  return createHash('sha256').update([producer, ref, rule_id].join(' ')).digest('hex').slice(0, 16)
}

/** Every row currently in the ledger. A missing file is an empty ledger, not an error. */
export function readLedger(root = HARNESS) {
  const abs = join(root, LEDGER)
  if (!existsSync(abs)) return []
  const out = []
  for (const line of readFileSync(abs, 'utf8').split('\n')) {
    const s = line.trim()
    if (!s) continue
    // A corrupt line is skipped and never silently repaired. Repairing it here
    // would edit the ledger in place, which is the one thing this file cannot do.
    try { out.push(JSON.parse(s)) } catch { continue }
  }
  return out
}

/**
 * Append citations, skipping any whose id is already recorded.
 *
 * Returns the rows actually written, so a caller can say "3 new citations"
 * rather than claiming credit for rows that were already there.
 */
export function appendUsage(rows, { root = HARNESS, validIds = null } = {}) {
  const clean = []
  const seen = new Set(readLedger(root).map((r) => r.id))
  for (const r of rows) {
    const rule_id = String(r.rule_id || '').trim()
    const producer = String(r.producer || '').trim()
    const ref = String(r.ref || '').trim()
    if (!rule_id || !ref) continue
    if (!PRODUCERS.has(producer)) continue
    if (producer === 'canary' && !String(r.asked_by || '').trim()) continue
    // A citation of a rule that does not exist is not evidence about anything,
    // and would make the dead-zone count answer for a canon that is not this one.
    if (validIds && !validIds.has(rule_id)) continue
    const id = usageId({ rule_id, producer, ref })
    if (seen.has(id)) continue
    seen.add(id)
    clean.push({
      id,
      at: r.at || new Date().toISOString().slice(0, 10),
      first_seen: r.at || new Date().toISOString().slice(0, 10),
      rule_id,
      producer,
      ref,
      evidence_class: producer === 'canary' ? 'synthetic-evaluation' : 'independent-review',
      scope: producer === 'canary' ? 'skill-retrieval-only' : 'review-citation',
      valid_for_ref: ref,
      ...(r.asked_by ? { asked_by: String(r.asked_by) } : {}),
      ...(r.verdict ? { verdict: String(r.verdict) } : {}),
    })
  }
  if (!clean.length) return []
  const abs = join(root, LEDGER)
  mkdirSync(dirname(abs), { recursive: true })
  appendFileSync(abs, clean.map((r) => JSON.stringify(r)).join('\n') + '\n')
  return clean
}

/** Every rule id in the canon, both sections, whatever its status. */
export function ruleIds(root = HARNESS) {
  const abs = join(root, 'brain/rules.yaml')
  if (!existsSync(abs)) return new Set()
  const ledger = parseYaml(readFileSync(abs, 'utf8'))
  return new Set([...(ledger.contract_rules || []), ...(ledger.skill_sections || [])].map((e) => String(e.id)))
}

/** The rules a dead zone can be claimed about: live doctrine, not retired text. */
export function liveRules(root = HARNESS) {
  const abs = join(root, 'brain/rules.yaml')
  if (!existsSync(abs)) return []
  const ledger = parseYaml(readFileSync(abs, 'utf8'))
  return [...(ledger.contract_rules || []), ...(ledger.skill_sections || [])]
    .filter((e) => e.status === 'live' || e.status === 'contested')
}

/**
 * Every rule id belonging to one skill's chapters.
 *
 * Matched on the entry's `file`, not on an id prefix. The ids are slugs and two
 * skills can share an opening word, so a prefix match is a guess where the file
 * path is a fact.
 */
export function ruleIdsForSkill(skill, root = HARNESS) {
  const abs = join(root, 'brain/rules.yaml')
  if (!existsSync(abs)) return []
  const ledger = parseYaml(readFileSync(abs, 'utf8'))
  const file = `skills/${skill}/SKILL.md`
  return (ledger.skill_sections || []).filter((e) => String(e.file) === file).map((e) => String(e.id))
}

/** Citations per rule id: how many, when last, and by which producers. */
export function fold(rows) {
  const by = new Map()
  for (const r of rows) {
    const k = String(r.rule_id)
    const e = by.get(k) || { rule_id: k, count: 0, last: null, producers: new Set() }
    e.count++
    e.producers.add(r.producer)
    if (!e.last || String(r.at) > e.last) e.last = String(r.at)
    by.set(k, e)
  }
  return by
}

/**
 * The dead zones: live rules with no citation, or none recent enough to count.
 *
 * `since` is a date string. A rule cited only before it is stale rather than
 * dead, and the two are reported apart, because "never once" and "not lately"
 * call for different work.
 */
export function deadZones({ root = HARNESS, since = null } = {}) {
  const counts = fold(readLedger(root))
  const never = []
  const stale = []
  for (const e of liveRules(root)) {
    const id = String(e.id)
    const hit = counts.get(id)
    if (!hit) { never.push(id); continue }
    if (since && hit.last < since) stale.push({ id, last: hit.last, count: hit.count })
  }
  return { never, stale, counts }
}

// ---------------------------------------------------------------------- main
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const args = process.argv.slice(2)
  const flag = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1] }
  if (!args.includes('--report')) {
    console.error('usage: brain-usage.mjs --report [--dead] [--json] [--since YYYY-MM-DD]')
    process.exit(2)
  }
  const since = flag('--since')
  const { never, stale, counts } = deadZones({ since })
  const live = liveRules().length
  const cited = live - never.length

  if (args.includes('--json')) {
    process.stdout.write(JSON.stringify({
      live,
      cited,
      never,
      stale,
      counts: [...counts.values()].map((e) => ({ ...e, producers: [...e.producers].sort() })),
    }, null, 2) + '\n')
    process.exit(0)
  }

  console.log(`${cited} of ${live} live rules have ever been cited by an independent judge or retrieved in a passing synthetic canary.`)
  if (since) console.log(`${stale.length} were cited, but not since ${since}.`)
  if (args.includes('--dead')) {
    for (const id of never) console.log(`never   ${id}`)
    for (const s of stale) console.log(`stale   ${s.id} (last ${s.last}, ${s.count} total)`)
  } else {
    const top = [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 20)
    if (!top.length) console.log('The ledger is empty. No producer has recorded a citation yet.')
    for (const e of top) console.log(`${String(e.count).padStart(4)}  ${e.rule_id}  (last ${e.last}, ${[...e.producers].sort().join(', ')})`)
  }
}
