#!/usr/bin/env node
/**
 * Regression suite for the rule provenance checker.
 *
 * A checker that cannot fail is worse than no checker, because it reads as
 * health. Every case here mutates a fixture canon in a way the checker is
 * supposed to catch, and asserts that it does. If you change scripts/brain-rules.mjs,
 * break it on purpose first and confirm this suite goes red.
 *
 * The fixture is a temporary tree, never the live repository. A test that edits
 * the real canon to prove a point is a worse risk than the bug it hunts.
 *
 *   node scripts/test-brain-rules.mjs
 */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { check, extract, idFor, textSha, slug } from './brain-rules.mjs'

let failures = 0
const t = (name, fn) => {
  try { fn(); console.log(`ok    ${name}`) }
  catch (e) { failures++; console.error(`FAIL  ${name}\n      ${e.message}`) }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg) }
const matches = (problems, re, msg) =>
  assert(problems.some((p) => re.test(p)), `${msg}\n      got: ${problems.join(' | ') || '(no problems reported)'}`)

// ------------------------------------------------------------------ fixture
const CONTRACT = `# Krish operating contract

Prose that is not a rule and must never get an entry.

## Authority

- Research, inspect and diagnose autonomously.
- Never publish without explicit approval.

## Verification

- Use deterministic checks first.
`

const SKILL = `---
name: fixture
---

# Fixture skill

## Purpose

Body of the purpose chapter.

## Limits

Body of the limits chapter.
`

function tree(contract = CONTRACT, skill = SKILL) {
  const root = mkdtempSync(join(tmpdir(), 'brain-rules-'))
  mkdirSync(join(root, 'contract'), { recursive: true })
  mkdirSync(join(root, 'skills/fixture'), { recursive: true })
  writeFileSync(join(root, 'contract/krish-operating-contract.md'), contract)
  writeFileSync(join(root, 'skills/fixture/SKILL.md'), skill)
  return root
}

/** A ledger that matches the tree exactly, so each test mutates one thing. */
function ledgerFor(root, { quote = true, mutate = (rows) => rows } = {}) {
  const live = extract(root)
  const q = (s) => (quote ? `"${s}"` : s)
  const rows = mutate([
    ...live.contractRules.map((r) => ({ ...r, key: 'contract_rules' })),
    ...live.skillSections.map((r) => ({ ...r, key: 'skill_sections' })),
  ])
  const L = ['schema_version: 1', '']
  for (const key of ['contract_rules', 'skill_sections']) {
    L.push(`${key}:`)
    const set = rows.filter((r) => r.key === key)
    if (!set.length) L.push('  []')
    for (const r of set) {
      L.push(`  - id: ${r.id}`)
      L.push(`    file: ${r.file}`)
      L.push(`    text_sha: ${q(r.text_sha)}`)
      L.push(`    first_seen: "2026-09-07"`)
      L.push(`    source:`)
      L.push(`      kind: ${r.kind || 'founding'}`)
      L.push(`      ref: "abc123abc123"`)
      L.push(`    status: ${r.status || 'live'}`)
    }
    L.push('')
  }
  return L.join('\n')
}

const cleanup = []
const fixture = (...a) => { const r = tree(...a); cleanup.push(r); return r }

// -------------------------------------------------------------------- cases
t('a canon that matches its ledger reports nothing', () => {
  const root = fixture()
  const { problems, counts } = check(ledgerFor(root), root)
  assert(problems.length === 0, `expected no problems, got: ${problems.join(' | ')}`)
  assert(counts.contract_rules === 3, `expected 3 contract rules, got ${counts.contract_rules}`)
  assert(counts.skill_sections === 2, `expected 2 skill chapters, got ${counts.skill_sections}`)
})

t('a rule added with no ledger entry fails', () => {
  const root = fixture()
  const ledger = ledgerFor(root)
  const withNew = CONTRACT.replace('- Use deterministic checks first.',
    '- Use deterministic checks first.\n- Recheck the failed condition after correction.')
  writeFileSync(join(root, 'contract/krish-operating-contract.md'), withNew)
  const { problems } = check(ledger, root)
  matches(problems, /has no entry in brain\/rules\.yaml/, 'an unrecorded rule must fail')
})

t('a rule edited in place without a new source fails', () => {
  const root = fixture()
  const ledger = ledgerFor(root)
  const edited = CONTRACT.replace('- Never publish without explicit approval.',
    '- Never publish without approval, except when in a hurry.')
  writeFileSync(join(root, 'contract/krish-operating-contract.md'), edited)
  const { problems } = check(ledger, root)
  matches(problems, /has no entry|changed but brain\/rules\.yaml/, 'a silent edit must fail')
})

t('a skill chapter whose body changed fails', () => {
  const root = fixture()
  const ledger = ledgerFor(root)
  writeFileSync(join(root, 'skills/fixture/SKILL.md'),
    SKILL.replace('Body of the limits chapter.', 'Body of the limits chapter, quietly rewritten.'))
  const { problems } = check(ledger, root)
  matches(problems, /fixture\.limits changed/, 'an edited chapter body must fail')
})

t('a live ledger entry whose rule no longer exists fails', () => {
  const root = fixture()
  const ledger = ledgerFor(root)
  writeFileSync(join(root, 'contract/krish-operating-contract.md'),
    CONTRACT.replace('- Never publish without explicit approval.\n', ''))
  const { problems } = check(ledger, root)
  matches(problems, /carries .* as live, but no such rule exists/, 'a deleted rule must not stay live in the ledger')
})

t('a retired ledger entry whose rule is gone is allowed', () => {
  const root = fixture()
  const ledger = ledgerFor(root, {
    mutate: (rows) => rows.map((r) => (/never-publish/.test(r.id) ? { ...r, status: 'retired' } : r)),
  })
  writeFileSync(join(root, 'contract/krish-operating-contract.md'),
    CONTRACT.replace('- Never publish without explicit approval.\n', ''))
  const { problems } = check(ledger, root)
  assert(problems.length === 0, `retirement is the supported way to remove a rule, got: ${problems.join(' | ')}`)
})

t('an entry with no source fails', () => {
  const root = fixture()
  const ledger = ledgerFor(root).replace(/      kind: founding\n/, '')
  const { problems } = check(ledger, root)
  matches(problems, /has no source\.kind/, 'an entry without provenance must fail')
})

t('an incomplete superseded-text history entry fails', () => {
  const root = fixture()
  const ledger = ledgerFor(root).replace(
    '    status: live',
    '    history:\n      - text_sha: "oldhash"\n    status: live')
  const { problems } = check(ledger, root)
  matches(problems, /incomplete history entry/, 'history must preserve its closing date and source')
})

t('a history entry cannot repeat the current text hash', () => {
  const root = fixture()
  const current = extract(root).contractRules[0].text_sha
  const ledger = ledgerFor(root).replace(
    '    status: live',
    `    history:\n      - text_sha: "${current}"\n        valid_until: "2026-09-12"\n        source: {kind: founding, ref: "abc123abc123"}\n    status: live`)
  const { problems } = check(ledger, root)
  matches(problems, /repeats its current text_sha/, 'history must identify an earlier byte revision')
})

/**
 * The regression that made the first run of this checker report five false
 * failures. A 12 hex sha can be all digits; the YAML reader turns a bare
 * all-digit scalar into a Number, and a Number never equals its own identical
 * string. Unquoted, such an entry fails forever and no edit can fix it.
 */
t('an all-digit hash does not produce a false failure', () => {
  let body = null
  for (let i = 0; i < 200000; i++) {
    const candidate = `- Rule number ${i} for the all digit hash case.`
    if (/^\d{12}$/.test(textSha(candidate.slice(2)))) { body = candidate; break }
  }
  assert(body, 'could not construct a rule whose hash is all digits')
  const root = fixture(`# C\n\n## Authority\n\n${body}\n`)
  const quoted = check(ledgerFor(root, { quote: true }), root)
  const bare = check(ledgerFor(root, { quote: false }), root)
  assert(quoted.problems.length === 0, `quoted form must pass: ${quoted.problems.join(' | ')}`)
  assert(bare.problems.length === 0,
    `an unquoted all-digit hash must still compare equal, got: ${bare.problems.join(' | ')}`)
})

/**
 * The central design claim. Ids are slugs, not ordinals, precisely so that
 * inserting a rule cannot rename the rules below it. If this ever regresses,
 * every provenance record below an insertion silently points at the wrong rule.
 */
t('inserting a rule does not rename any existing id', () => {
  const root = fixture()
  const before = new Map(extract(root).contractRules.map((r) => [r.id, r.text_sha]))
  writeFileSync(join(root, 'contract/krish-operating-contract.md'),
    CONTRACT.replace('## Authority\n\n- Research',
      '## Authority\n\n- A brand new first rule inserted above every other one.\n- Research'))
  const after = new Map(extract(root).contractRules.map((r) => [r.id, r.text_sha]))
  for (const [id, sha] of before) {
    assert(after.has(id), `inserting a rule renamed ${id}`)
    // An ordinal id survives the insertion by name while pointing at a
    // different rule, which is the exact failure this design exists to prevent.
    assert(after.get(id) === sha, `id ${id} now points at different text after an insertion above it`)
  }
  assert(after.size === before.size + 1, `expected one new id, got ${after.size - before.size}`)
})

t('ids stay unique when two rules open with the same words', () => {
  const taken = new Set()
  const a = idFor('authority', 'Never publish without explicit approval or review.', taken); taken.add(a)
  const b = idFor('authority', 'Never publish without explicit approval or consent.', taken); taken.add(b)
  assert(a !== b, `two rules with the same opening words collided on ${a}`)
})

t('prose, headings and table rows are not treated as rules', () => {
  const root = fixture(`# C

Prose paragraph that gives an instruction and must not be recorded.

## Authority

| Request | Route |
|---|---|
| a | b |

- The only rule here.
`)
  const rules = extract(root).contractRules
  assert(rules.length === 1, `expected exactly 1 rule, got ${rules.length}: ${rules.map((r) => r.id).join(', ')}`)
})

t('a superseded entry with no valid_until fails', () => {
  const root = fixture()
  // Close a rule the way a person would, by hand, and forget the date.
  const ledger = ledgerFor(root).replace(/status: live/, 'status: superseded')
  const { problems } = check(ledger, root)
  matches(problems, /superseded with no valid_until/, 'a closed rule with no closing date must fail')
})

t('a superseded entry that carries valid_until passes', () => {
  const root = fixture()
  const ledger = ledgerFor(root).replace(/status: live/, 'status: superseded\n    valid_until: "2026-09-01"')
  const { problems } = check(ledger, root)
  assert(!problems.some((p) => /valid_until/.test(p)), `a dated closure must not fail: ${problems.join(' | ')}`)
})

t('an approval source must resolve to a repository artifact', () => {
  const root = fixture()
  const ledger = ledgerFor(root, {
    mutate: (rows) => rows.map((r, i) => i === 0
      ? { ...r, kind: 'approval' }
      : r),
  }).replace('ref: "abc123abc123"', 'ref: "state/approvals/missing.md"')
  const { problems } = check(ledger, root)
  matches(problems, /cites approval .* does not exist/, 'an approval path cannot be an invented pointer')
})

t('a repository artifact cannot be mislabeled as a ruling commit', () => {
  const root = fixture()
  const ledger = ledgerFor(root, {
    mutate: (rows) => rows.map((r, i) => i === 0
      ? { ...r, kind: 'ruling' }
      : r),
  }).replace('ref: "abc123abc123"', 'ref: "state/approvals/example.md"')
  const { problems } = check(ledger, root)
  matches(problems, /labels repository artifact .* as a ruling/, 'ruling provenance must cite the ruling commit')
})

// -------------------------------------------------------------------- report
for (const d of cleanup) { try { rmSync(d, { recursive: true, force: true }) } catch {} }
if (failures) { console.error(`\n${failures} failing case(s).`); process.exit(1) }
console.log('\nBRAIN RULES OK')
