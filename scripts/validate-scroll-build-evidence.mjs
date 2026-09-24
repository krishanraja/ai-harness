#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

// Expected sequences come from the accepted contract, never from report coverage.
// This checks a trace, not the integrity of its collector. The project must bind
// actual captures to the candidate and run this check in its fail-closed gate.
export function validateScrollBuildEvidence(contract, report) {
  const failures = []
  const fail = (message) => failures.push(message)
  const text = (v) => typeof v === 'string' && v.trim().length > 0
  const hash = (v) => typeof v === 'string' && /^[a-f0-9]{64}$/i.test(v)
  const evidence = (v) => v && text(v.path) && hash(v.sha256)
  const finite = (v) => typeof v === 'number' && Number.isFinite(v)
  if (!contract || !report) return ['contract and report are required']
  if (!hash(contract.candidateDigest) || report.candidateDigest !== contract.candidateDigest) fail('candidate digest mismatch or missing')
  if (!text(contract.acceptedDecision) || !hash(contract.acceptedDecisionDigest)) fail('accepted decision identity is required')
  if (!Array.isArray(contract.cases) || !contract.cases.length) return [...failures, 'declared cases are required']
  if (!Array.isArray(report.cases)) return [...failures, 'observed cases are required']
  const ids = new Set()
  for (const expected of contract.cases) {
    const id = expected?.id
    if (!text(id) || ids.has(id)) { fail('declared case ids must be unique'); continue }
    ids.add(id)
    const label = `${id}: `
    const states = expected.states
    if (!Array.isArray(states) || states.length < 2 || states.some((s) => !text(s)) || new Set(states).size !== states.length) {
      fail(label + 'at least two unique ordered visible states are required'); continue
    }
    if (!finite(expected.pinTop) || !finite(expected.tolerance) || expected.tolerance < 0 || expected.tolerance > 4) {
      fail(label + 'pinTop and tolerance from 0 to 4 CSS px are required'); continue
    }
    const matches = report.cases.filter((c) => c?.id === id)
    if (matches.length !== 1) { fail(label + 'exactly one observed case is required'); continue }
    const observed = matches[0]
    if (!text(expected.route) || observed.route !== expected.route || !text(expected.viewport) || observed.viewport !== expected.viewport) fail(label + 'route or viewport mismatch')
    if (observed.input !== 'page-scroll') fail(label + 'page-scroll input is required, not direct state mutation')
    if (!evidence(observed.capture)) fail(label + 'capture path and digest are required')
    const checkSequence = (name, ordered, direction) => {
      const samples = observed[name]
      if (!Array.isArray(samples) || samples.length !== ordered.length) { fail(label + name + ' must observe every ordered state'); return }
      samples.forEach((sample, index) => {
        if (!sample || typeof sample !== 'object') { fail(label + name + ' sample must be an object at ' + index); return }
        if (sample.visibleText !== ordered[index]) fail(label + name + ' visible state mismatch at ' + index)
        if (!finite(sample.scrollY) || !finite(sample.stageTop)) fail(label + name + ' numeric geometry is required')
        else if (Math.abs(sample.stageTop - expected.pinTop) > expected.tolerance) fail(label + name + ' stage escaped pin at ' + index)
        if (!evidence(sample.evidence)) fail(label + name + ' sample evidence is required at ' + index)
        if (index && !(direction * (sample.scrollY - samples[index - 1]?.scrollY) > 0)) fail(label + name + ' document scroll must advance between states')
      })
    }
    checkSequence('forward', states, 1)
    checkSequence('reverse', [...states].reverse(), -1)
    const forwardLast = observed.forward?.at(-1)
    const reverseLast = observed.reverse?.at(-1)
    for (const [name, anchor, direction] of [['exitAfter', forwardLast, 1], ['exitBefore', reverseLast, -1]]) {
      const exit = observed[name]
      if (!exit || !anchor || !finite(exit.scrollY) || !finite(exit.stageTop) || !evidence(exit.evidence)) { fail(label + name + ' observed exit is required'); continue }
      if (!(direction * (exit.scrollY - anchor.scrollY) > 0)) fail(label + name + ' must continue document scroll')
      if (!(direction * (expected.pinTop - exit.stageTop) > expected.tolerance)) fail(label + name + ' must release the pin')
    }
  }
  for (const observed of report.cases) if (!ids.has(observed?.id)) fail('undeclared observed case ' + observed?.id)
  return failures
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    if (!process.argv[2] || !process.argv[3]) throw new Error('Usage: node scripts/validate-scroll-build-evidence.mjs <accepted-contract.json> <observed-report.json>')
    const contract = JSON.parse(await readFile(process.argv[2], 'utf8'))
    const report = JSON.parse(await readFile(process.argv[3], 'utf8'))
    const failures = validateScrollBuildEvidence(contract, report)
    console.log(JSON.stringify({ pass: failures.length === 0, failures }, null, 2))
    if (failures.length) process.exitCode = 1
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
