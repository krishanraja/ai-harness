#!/usr/bin/env node
import assert from 'node:assert/strict'
import { validateScrollBuildEvidence } from './validate-scroll-build-evidence.mjs'

// Held-out synthetic geometry: no producer implementation is consulted.
const capture = { path: 'captures/sequence.webm', sha256: 'b'.repeat(64) }
const states = ['The observation', 'The comparison', 'The decision']
const contract = {
  candidateDigest: 'a'.repeat(64), acceptedDecision: 'accepted/scroll-sequence.json', acceptedDecisionDigest: 'c'.repeat(64),
  cases: ['desktop', 'mobile'].map((device) => ({ id: `sequence-${device}`, route: '/', viewport: device, states, pinTop: 64, tolerance: 2 })),
}
const report = {
  candidateDigest: contract.candidateDigest,
  cases: contract.cases.map((c) => ({
    id: c.id, route: c.route, viewport: c.viewport, input: 'page-scroll', capture,
    forward: states.map((visibleText, i) => ({ visibleText, scrollY: 1000 + i * 400, stageTop: 64, evidence: capture })),
    reverse: [...states].reverse().map((visibleText, i) => ({ visibleText, scrollY: 1800 - i * 400, stageTop: 64, evidence: capture })),
    exitAfter: { scrollY: 2400, stageTop: -100, evidence: capture },
    exitBefore: { scrollY: 600, stageTop: 400, evidence: capture },
  })),
}
assert.deepEqual(validateScrollBuildEvidence(contract, report), [])
const cases = [
  ['missing device', (c, r) => r.cases.pop(), 'exactly one observed'],
  ['missing section declaration', (c) => { c.cases = [] }, 'declared cases'],
  ['stale candidate', (c, r) => { r.candidateDigest = 'd'.repeat(64) }, 'candidate digest'],
  ['missing decision binding', (c) => { delete c.acceptedDecisionDigest }, 'accepted decision'],
  ['attribute-only pass', (c, r) => { r.cases[0] = { id: c.cases[0].id, pass: true } }, 'page-scroll input'],
  ['direct state setting', (c, r) => { r.cases[0].input = 'setState' }, 'page-scroll input'],
  ['static screenshot substituted', (c, r) => { r.cases[0].forward.forEach((s) => { s.scrollY = 1000 }) }, 'document scroll must advance'],
  ['entrance reveal substituted', (c, r) => { r.cases[0].forward.forEach((s, i) => { s.stageTop -= i * 400 }) }, 'stage escaped pin'],
  ['scrolls but never changes state', (c, r) => { r.cases[0].forward.forEach((s) => { s.visibleText = states[0] }) }, 'visible state mismatch'],
  ['skipped middle state', (c, r) => { r.cases[0].forward.splice(1, 1) }, 'every ordered state'],
  ['reverse missing', (c, r) => { delete r.cases[0].reverse }, 'every ordered state'],
  ['reverse does not scroll backwards', (c, r) => { r.cases[0].reverse[1].scrollY = 1900 }, 'document scroll must advance'],
  ['terminal trap', (c, r) => { r.cases[0].exitAfter.stageTop = 64 }, 'must release the pin'],
  ['start trap', (c, r) => { r.cases[0].exitBefore.stageTop = 64 }, 'must release the pin'],
  ['exit without input', (c, r) => { r.cases[0].exitAfter.scrollY = 1800 }, 'continue document scroll'],
  ['missing capture', (c, r) => { delete r.cases[0].capture }, 'capture path'],
  ['missing intermediate capture', (c, r) => { delete r.cases[0].forward[1].evidence }, 'sample evidence'],
  ['wrong viewport', (c, r) => { r.cases[1].viewport = 'desktop' }, 'viewport mismatch'],
  ['duplicate observed case', (c, r) => { r.cases.push(r.cases[0]) }, 'exactly one observed'],
  ['extra unbound case', (c, r) => { r.cases.push({ ...r.cases[0], id: 'unbound' }) }, 'undeclared observed'],
  ['widen tolerance to hide defect', (c) => { c.cases[0].tolerance = 2000 }, 'tolerance from 0 to 4'],
  ['nonfinite geometry', (c, r) => { r.cases[0].forward[0].scrollY = NaN }, 'numeric geometry'],
  ['malformed sample', (c, r) => { r.cases[0].forward[1] = null }, 'sample must be an object'],
]
for (const [name, mutate, expected] of cases) {
  const c = structuredClone(contract), r = structuredClone(report)
  mutate(c, r)
  const failures = validateScrollBuildEvidence(c, r)
  assert(failures.some((f) => f.includes(expected)), `${name} must reject: ${failures.join(' | ')}`)
}
console.log(`SCROLL BUILD EVIDENCE TESTS PASSED: ${cases.length + 1} cases`)
