#!/usr/bin/env node
/**
 * Regression suite for the rule citation ledger.
 *
 * The point of brain/usage.jsonl is to answer "has anything ever reached for
 * this rule". A ledger that miscounts is worse than none, because a number is
 * read as evidence in a way an absence never is. The two failures that would do
 * real damage are both covered here: a re-run inflating a count, and a void or
 * unknown citation being admitted.
 *
 * The fixture is a temporary tree, never the live repository. A test that writes
 * into brain/ to prove a point dirties the working tree, and Invoke-HarnessSync
 * refuses to run on a dirty tree.
 *
 *   node scripts/test-brain-usage.mjs
 */

import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { appendUsage, readLedger, fold, deadZones, usageId, ruleIds, ruleIdsForSkill, liveRules, LEDGER } from './brain-usage.mjs'

let failures = 0
const t = (name, fn) => {
  try { fn(); console.log(`ok    ${name}`) }
  catch (e) { failures++; console.error(`FAIL  ${name}\n      ${e.message}`) }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg) }

// ------------------------------------------------------------------ fixture
// Three live rules, one superseded, two chapters of one skill. The superseded
// entry is the one that matters: a closed rule must never be counted as a dead
// zone, or every retirement would open a finding for retiring something.
const RULES = `schema_version: 1

contract_rules:
  - id: authority.never-publish-without
    file: contract/krish-operating-contract.md
    text_sha: "aaaaaaaaaaaa"
    first_seen: "2026-09-07"
    source:
      kind: founding
      ref: "abc123abc123"
    status: live
  - id: verification.use-deterministic-checks
    file: contract/krish-operating-contract.md
    text_sha: "bbbbbbbbbbbb"
    first_seen: "2026-09-07"
    source:
      kind: founding
      ref: "abc123abc123"
    status: live
  - id: secrets.never-write-a-credential
    file: contract/krish-operating-contract.md
    text_sha: "cccccccccccc"
    first_seen: "2026-09-07"
    source:
      kind: founding
      ref: "abc123abc123"
    status: live
  - id: routing.the-old-way
    file: contract/skill-routing-contract.md
    text_sha: "dddddddddddd"
    first_seen: "2026-08-01"
    source:
      kind: founding
      ref: "def456def456"
    status: superseded
    valid_until: "2026-09-01"

skill_sections:
  - id: apify.route-the-request
    file: skills/apify/SKILL.md
    heading: "Route the request"
    text_sha: "eeeeeeeeeeee"
    first_seen: "2026-09-07"
    source:
      kind: founding
      ref: "abc123abc123"
    status: live
  - id: apify.define-the-job-contract
    file: skills/apify/SKILL.md
    heading: "Define the job contract"
    text_sha: "ffffffffffff"
    first_seen: "2026-09-07"
    source:
      kind: founding
      ref: "abc123abc123"
    status: live
`

const cleanup = []
const fixture = () => {
  const root = mkdtempSync(join(tmpdir(), 'brain-usage-'))
  mkdirSync(join(root, 'brain'), { recursive: true })
  writeFileSync(join(root, 'brain/rules.yaml'), RULES)
  cleanup.push(root)
  return root
}
const lines = (root) => (existsSync(join(root, LEDGER)) ? readFileSync(join(root, LEDGER), 'utf8').trim().split('\n').filter(Boolean) : [])

// -------------------------------------------------------------------- cases
t('the fixture parses into 5 live rules and 1 closed one', () => {
  const root = fixture()
  assert(liveRules(root).length === 5, `expected 5 live, got ${liveRules(root).length}`)
  assert(ruleIds(root).size === 6, `expected 6 ids in total, got ${ruleIds(root).size}`)
})

t('a citation is written and read back', () => {
  const root = fixture()
  const wrote = appendUsage([{ rule_id: 'authority.never-publish-without', producer: 'judge', ref: 'pr-26', at: '2026-09-10' }], { root })
  assert(wrote.length === 1, `expected 1 row written, got ${wrote.length}`)
  assert(readLedger(root).length === 1, 'the row must read back')
  assert(readLedger(root)[0].rule_id === 'authority.never-publish-without', 'the rule id must survive the round trip')
  assert(readLedger(root)[0].evidence_class === 'independent-review', 'a judge citation must be labelled independent review evidence')
  assert(readLedger(root)[0].first_seen === '2026-09-10', 'a citation must preserve when the event was first seen')
  assert(readLedger(root)[0].valid_for_ref === 'pr-26', 'a citation must scope validity to its immutable evidence ref')
})

t('a canary citation is explicitly synthetic and preserves its asker', () => {
  const root = fixture()
  const wrote = appendUsage([{ rule_id: 'apify.route-the-request', producer: 'canary', ref: 'release-a', at: '2026-09-12', verdict: 'fired', asked_by: 'Named release owner.' }], { root })
  assert(wrote.length === 1, `expected 1 row written, got ${wrote.length}`)
  assert(wrote[0].evidence_class === 'synthetic-evaluation', 'a canary citation must not look like real-world usage')
  assert(wrote[0].scope === 'skill-retrieval-only', 'a canary citation must not claim outcome or efficacy evidence')
  assert(wrote[0].asked_by === 'Named release owner.', 'a canary citation must preserve its named asker')
})

t('a canary citation without a named asker is refused', () => {
  const root = fixture()
  const wrote = appendUsage([{ rule_id: 'apify.route-the-request', producer: 'canary', ref: 'release-unasked', at: '2026-09-12', verdict: 'fired' }], { root })
  assert(wrote.length === 0, `an unasked canary row must be refused, wrote ${wrote.length}`)
  assert(readLedger(root).length === 0, 'an unasked canary row must not reach the ledger')
})

t('the same evidence twice adds nothing', () => {
  const root = fixture()
  const row = { rule_id: 'authority.never-publish-without', producer: 'judge', ref: 'pr-26', at: '2026-09-10' }
  appendUsage([row], { root })
  const second = appendUsage([row], { root })
  assert(second.length === 0, `a re-run must write nothing, wrote ${second.length}`)
  assert(lines(root).length === 1, `the ledger must still hold 1 row, holds ${lines(root).length}`)
})

t('the same rule cited by two different refs is two citations', () => {
  const root = fixture()
  appendUsage([
    { rule_id: 'authority.never-publish-without', producer: 'judge', ref: 'pr-26', at: '2026-09-10' },
    { rule_id: 'authority.never-publish-without', producer: 'judge', ref: 'pr-27', at: '2026-09-11' },
  ], { root })
  const counts = fold(readLedger(root))
  assert(counts.get('authority.never-publish-without').count === 2, 'two distinct refs must count twice')
  assert(counts.get('authority.never-publish-without').last === '2026-09-11', 'last must be the later date')
})

t('an unknown producer, a missing ref and an unknown rule are all refused', () => {
  const root = fixture()
  const valid = ruleIds(root)
  const wrote = appendUsage([
    { rule_id: 'authority.never-publish-without', producer: 'vibes', ref: 'pr-26' },
    { rule_id: 'authority.never-publish-without', producer: 'judge', ref: '' },
    { rule_id: 'a-rule-that-does-not-exist', producer: 'judge', ref: 'pr-26' },
  ], { root, validIds: valid })
  assert(wrote.length === 0, `expected nothing admitted, admitted ${wrote.length}: ${wrote.map((r) => r.rule_id).join(', ')}`)
  assert(lines(root).length === 0, 'a refused citation must leave no row behind')
})

t('a corrupt line is skipped without throwing and without repair', () => {
  const root = fixture()
  appendUsage([{ rule_id: 'authority.never-publish-without', producer: 'judge', ref: 'pr-26', at: '2026-09-10' }], { root })
  writeFileSync(join(root, LEDGER), readFileSync(join(root, LEDGER), 'utf8') + '{ this is not json\n')
  const rows = readLedger(root)
  assert(rows.length === 1, `expected the one good row, got ${rows.length}`)
  assert(readFileSync(join(root, LEDGER), 'utf8').includes('this is not json'), 'the bad line must still be on disk; nothing here edits in place')
})

t('an empty ledger reports every live rule as never cited, and no closed one', () => {
  const root = fixture()
  const { never } = deadZones({ root })
  assert(never.length === 5, `expected 5 never-cited live rules, got ${never.length}`)
  assert(!never.includes('routing.the-old-way'), 'a superseded rule is closed, not a dead zone')
})

t('a cited rule leaves the dead list, and an old citation is stale rather than dead', () => {
  const root = fixture()
  appendUsage([
    { rule_id: 'authority.never-publish-without', producer: 'judge', ref: 'pr-26', at: '2026-09-10' },
    { rule_id: 'verification.use-deterministic-checks', producer: 'canary', ref: 'v1-surface', at: '2026-01-05', asked_by: 'Named release owner.' },
  ], { root })
  const { never, stale } = deadZones({ root, since: '2026-06-01' })
  assert(never.length === 3, `expected 3 still never cited, got ${never.length}: ${never.join(', ')}`)
  assert(stale.length === 1 && stale[0].id === 'verification.use-deterministic-checks', `expected the January citation to read stale, got ${JSON.stringify(stale)}`)
})

t('a skill maps to its chapters by file, not by id prefix', () => {
  const root = fixture()
  const ids = ruleIdsForSkill('apify', root)
  assert(ids.length === 2, `expected 2 chapters for apify, got ${ids.length}`)
  assert(ruleIdsForSkill('apify-something-else', root).length === 0, 'a skill with no file must map to nothing')
})

t('the id depends on the ref, the producer and the rule', () => {
  const base = { rule_id: 'r', producer: 'judge', ref: 'pr-1' }
  assert(usageId(base) === usageId({ ...base }), 'the same evidence must hash the same')
  assert(usageId(base) !== usageId({ ...base, ref: 'pr-2' }), 'a different ref must be a different citation')
  assert(usageId(base) !== usageId({ ...base, producer: 'canary' }), 'a different producer must be a different citation')
  assert(usageId(base) !== usageId({ ...base, rule_id: 'r2' }), 'a different rule must be a different citation')
})

// -------------------------------------------------------------------- report
for (const d of cleanup) { try { rmSync(d, { recursive: true, force: true }) } catch {} }
if (failures) { console.error(`\n${failures} failing case(s).`); process.exit(1) }
console.log('\nBRAIN USAGE OK')
