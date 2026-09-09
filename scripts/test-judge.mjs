#!/usr/bin/env node
/**
 * Regression suite for the judge panel.
 *
 * Everything here is deterministic. The model call is injected, so these cases
 * test the part of the panel that can actually be wrong in a silent way: what
 * it accepts, what it refuses, whether the dissent rule bites, and whether a
 * blocking regression really blocks.
 *
 * This does not test the model's judgement, and nothing here should be read as
 * if it did. A stub that returns a perfect review proves the plumbing carries a
 * review, not that a real bench would produce one.
 *
 *   node scripts/test-judge.mjs
 */

import {
  loadBench, parseFindings, runBench, render, systemPrompt,
  hasDissent, blockingRegressions, clauseUniverse, BENCHES,
} from './judge.mjs'

let failures = 0
const t = (name, fn) => {
  const done = (e) => { if (e) { failures++; console.error(`FAIL  ${name}\n      ${e.message}`) } else console.log(`ok    ${name}`) }
  try { const r = fn(); return r instanceof Promise ? r.then(() => done(), done) : done() }
  catch (e) { done(e) }
}
const assert = (c, m) => { if (!c) throw new Error(m) }

const clauseIds = clauseUniverse()
const A_RULE = [...clauseIds].find((i) => i.startsWith('authority.')) || [...clauseIds][0]
const DIFF_FILES = ['contract/krish-operating-contract.md']
const reply = (findings) => JSON.stringify({ findings })

const tests = []
const T = (n, f) => tests.push([n, f])

// ------------------------------------------------------------ what it accepts
T('a grounded finding is kept', () => {
  const bench = loadBench('technical')
  const { findings, problems } = parseFindings(
    reply([{ criterion_id: 'provenance', verdict: 'regresses', clause: A_RULE, because: 'No source given.' }]),
    bench, clauseIds, DIFF_FILES)
  assert(findings.length === 1, `expected 1 finding, got ${findings.length}: ${problems.join(' | ')}`)
  assert(findings[0].blocking === true, 'provenance is marked blocking on the technical bench')
})

T('a finding citing a file in the diff is grounded', () => {
  const bench = loadBench('personal')
  const { findings } = parseFindings(
    reply([{ criterion_id: 'silent-success', verdict: 'dissent', clause: DIFF_FILES[0], because: 'Nothing ships.' }]),
    bench, clauseIds, DIFF_FILES)
  assert(findings.length === 1, 'a file path from the diff is a valid clause')
})

// ------------------------------------------------------------ what it refuses
T('a finding with no clause is discarded', () => {
  const bench = loadBench('technical')
  const { findings, problems } = parseFindings(
    reply([{ criterion_id: 'provenance', verdict: 'regresses', clause: '', because: 'Vibes.' }]),
    bench, clauseIds, DIFF_FILES)
  assert(findings.length === 0, 'an ungrounded finding must not count')
  assert(problems.some((p) => /neither a rule id nor a file/.test(p)), `expected a grounding complaint, got ${problems.join(' | ')}`)
})

T('a finding naming a criterion that does not exist is discarded', () => {
  const bench = loadBench('technical')
  const { findings, problems } = parseFindings(
    reply([{ criterion_id: 'vibes-check', verdict: 'regresses', clause: A_RULE, because: 'x' }]),
    bench, clauseIds, DIFF_FILES)
  assert(findings.length === 0, 'an invented criterion must not count')
  assert(problems.some((p) => /not a criterion/.test(p)), 'it must say why')
})

T('a score instead of a verdict is discarded', () => {
  const bench = loadBench('technical')
  const { findings, problems } = parseFindings(
    reply([{ criterion_id: 'provenance', verdict: '0.85', clause: A_RULE, because: 'x' }]),
    bench, clauseIds, DIFF_FILES)
  assert(findings.length === 0, 'this panel compares, it never scores')
  assert(problems.some((p) => /verdict/.test(p)), 'it must say why')
})

T('unparseable output is refused, not guessed at', () => {
  const bench = loadBench('technical')
  const { findings, problems } = parseFindings('I think the change looks good overall!', bench, clauseIds, DIFF_FILES)
  assert(findings.length === 0, 'prose is not a review')
  assert(problems.length === 1, `expected exactly one problem, got ${problems.join(' | ')}`)
})

T('an em dash in a reason is stripped before it can be posted', () => {
  const bench = loadBench('technical')
  const { findings } = parseFindings(
    reply([{ criterion_id: 'provenance', verdict: 'regresses', clause: A_RULE, because: 'No source — none at all.' }]),
    bench, clauseIds, DIFF_FILES)
  assert(findings.length === 1, 'the finding is still valid')
  assert(!findings[0].because.includes('—'), `the em dash survived: ${findings[0].because}`)
})

// -------------------------------------------------------------- the protocol
T('a unanimous review is rejected and re-run once', async () => {
  let attempts = 0
  const ask = async ({ attempt }) => {
    attempts = attempt
    return attempt === 1
      ? reply([{ criterion_id: 'provenance', verdict: 'improves', clause: A_RULE, because: 'All good.' }])
      : reply([
        { criterion_id: 'provenance', verdict: 'improves', clause: A_RULE, because: 'All good.' },
        { criterion_id: 'context-pollution', verdict: 'dissent', clause: A_RULE, because: 'It restates an existing rule.' },
      ])
  }
  const r = await runBench('technical', { diff: 'x', diffFiles: DIFF_FILES, clauseIds, ask })
  assert(attempts === 2, 'a review with no regression and no dissent must be re-run')
  assert(hasDissent(r.findings), 'the second attempt supplied the dissent')
  assert(!r.unanimous, 'it recovered, so it is not recorded as unanimous')
})

T('a bench that is unanimous twice is recorded, not accepted quietly', async () => {
  // mission-fit, not provenance: provenance is a technical bench criterion, and
  // a finding naming a criterion the bench does not have is discarded, which
  // leaves an empty review rather than a unanimous one. Those are different.
  const ask = async () => reply([{ criterion_id: 'mission-fit', verdict: 'improves', clause: A_RULE, because: 'All good.' }])
  const r = await runBench('personal', { diff: 'x', diffFiles: DIFF_FILES, clauseIds, ask })
  assert(r.unanimous === true, 'twice unanimous must be flagged')
  assert(render([r], { base: 'a', head: 'b' }).includes('bench-unanimous'), 'and it must appear in the report')
})

T('a bench that already dissents is not re-run', async () => {
  let calls = 0
  const ask = async () => {
    calls++
    return reply([{ criterion_id: 'ghost-facts', verdict: 'regresses', clause: A_RULE, because: 'Edited in place.' }])
  }
  await runBench('technical', { diff: 'x', diffFiles: DIFF_FILES, clauseIds, ask })
  assert(calls === 1, `a review that already dissents must not be asked twice, got ${calls} calls`)
})

// --------------------------------------------------------------- the blocking
T('a regression on a blocking criterion blocks', () => {
  const bench = loadBench('personal')
  const { findings } = parseFindings(
    reply([{ criterion_id: 'approval-walls', verdict: 'regresses', clause: A_RULE, because: 'Grants send authority.' }]),
    bench, clauseIds, DIFF_FILES)
  assert(blockingRegressions(findings).length === 1, 'approval-walls is blocking and must block')
})

T('a regression on an advisory criterion does not block', () => {
  const bench = loadBench('personal')
  const { findings } = parseFindings(
    reply([{ criterion_id: 'stall-risk', verdict: 'regresses', clause: A_RULE, because: 'Adds a manual step.' }]),
    bench, clauseIds, DIFF_FILES)
  assert(findings.length === 1, 'the finding is kept')
  assert(blockingRegressions(findings).length === 0, 'stall-risk is advisory: flag it, do not block it')
})

// ----------------------------------------------------------------- the benches
T('both benches load, and every criterion carries a quote and a test', () => {
  for (const name of BENCHES) {
    const b = loadBench(name)
    assert(b.criteria.length >= 8, `${name} bench has only ${b.criteria.length} criteria`)
    for (const c of b.criteria) {
      assert(c.quote && String(c.quote).trim().length > 30, `${name}.${c.id} has no real quote from its source`)
      assert(c.test && String(c.test).trim().length > 30, `${name}.${c.id} has no test`)
    }
    assert(b.criteria.some((c) => c.blocking), `${name} bench blocks on nothing, so it can never stop anything`)
  }
})

T('the prompt forbids scoring and demands a clause', () => {
  const s = systemPrompt(loadBench('technical'), clauseIds)
  assert(/never score/i.test(s), 'the prompt must forbid scoring')
  assert(/must cite a clause/i.test(s), 'the prompt must demand a clause')
  assert(/must dissent/i.test(s), 'the prompt must demand dissent')
  assert(/historical/i.test(s), 'the technical prompt must disclose that its source is retired')
})

T('the report never carries an em dash', () => {
  const r = [{
    bench: 'technical', unanimous: false, problems: ['discarded something — badly formed'],
    findings: [{ bench: 'technical', criterion_id: 'provenance', verdict: 'regresses', clause: A_RULE, because: 'a — b', blocking: true }],
  }]
  assert(!render(r, { base: 'a', head: 'b' }).includes('—'), 'the rendered report leaked an em dash')
})

// -------------------------------------------------------------------- report
const run = async () => {
  for (const [n, f] of tests) await t(n, f)
  if (failures) { console.error(`\n${failures} failing case(s).`); process.exit(1) }
  console.log('\nJUDGE OK')
}
await run()
