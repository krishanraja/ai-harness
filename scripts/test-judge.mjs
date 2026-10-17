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
  hasDissent, blockingRegressions, clauseUniverse, BENCHES, salvage, TRUNCATED, recordedRulings,
  rulingsFromLog, failureReport, groundedFiles, citedScripts, citedProposals,
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

T('empty added ledgers are changed files and cited approval sources reach the review', () => {
  const diff='diff --git a/brain/acceptances.jsonl b/brain/acceptances.jsonl\nnew file mode 100644\nindex 0000000..e69de29\n'
  assert(groundedFiles(diff).includes('brain/acceptances.jsonl'),'An empty added ledger was invisible to the judge')
  const cited=citedProposals('+++ b/contract/policy.json\n+ "source": "docs/proposals/2026-10-17-brain-repository-administration.md"\n unchanged docs/proposals/old.md')
  assert(cited.length===1&&cited[0].endsWith('brain-repository-administration.md'),'Changed approval provenance was not selected')
})

// ------------------------------------------------------------ what it accepts
T('a proposal the diff cites as provenance is a citable file; one it merely mentions in prose elsewhere is not', () => {
  const diff = [
    '+++ b/brain/rules.yaml',
    '+      ref: "docs/proposals/2026-10-15-pc-guardian-and-chat-lessons.md"',
    ' unchanged context naming docs/proposals/2026-01-01-old.md',
    '+++ b/contract/skill-routing-contract.md',
  ].join('\n')
  const files = groundedFiles(diff)
  assert(files.includes('brain/rules.yaml') && files.includes('contract/skill-routing-contract.md'), 'changed files missing')
  assert(files.includes('docs/proposals/2026-10-15-pc-guardian-and-chat-lessons.md'), 'the cited proposal is not citable')
  assert(!files.includes('docs/proposals/2026-01-01-old.md'), 'an unchanged context line widened the citable set')
  const bench = loadBench('technical')
  const { findings, problems } = parseFindings(
    reply([{ criterion_id: 'provenance', verdict: 'regresses', clause: 'docs/proposals/2026-10-15-pc-guardian-and-chat-lessons.md', because: 'The proposal names no asker.' }]),
    bench, clauseIds, files)
  assert(findings.length === 1 && problems.length === 0, 'a finding about the cited proposal was discarded')
})

T('a script the canon cites on an added line is shown to the panel; one in unchanged context is not', () => {
  const diff = [
    '+++ b/contract/learning-policy.yaml',
    '+  # only to a clock still reporting (scripts/steward-housekeeping.mjs).',
    '+  # The task is registered -Daily in scripts/Invoke-HarnessSync.ps1 and scripts/Invoke-HarnessSync.ps1 again',
    '+  # Tested in scripts/test-digest.mjs and scripts/test-machine-heartbeat.mjs.',
    '+  # Historical evidence helper: scripts/lib/legacy-evidence-format.mjs.',
    ' # unchanged context naming scripts/observe.mjs',
  ].join('\n')
  const cited = citedScripts(diff)
  assert(cited.length === 5 && cited.includes('scripts/lib/legacy-evidence-format.mjs') && cited.includes('scripts/steward-housekeeping.mjs') && cited.includes('scripts/Invoke-HarnessSync.ps1') && cited.includes('scripts/test-machine-heartbeat.mjs'), `cited: ${cited.join(', ')}`)
  assert(!cited.includes('scripts/observe.mjs'), 'an unchanged context line widened what the panel is shown')
  assert(groundedFiles(diff + '\n+++ b/scripts/steward-housekeeping.mjs\n').includes('scripts/steward-housekeeping.mjs'), 'a shown script is not citable')
})

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

T('only a complete recorded Krish ruling matches the override contract', () => {
  const valid = 'Subject\n\nRuling (Krish, 2026-09-15): Ship the bounded correction.\n'
  assert(recordedRulings(valid).length === 1, 'a complete ruling line must be found')
  assert(recordedRulings('Ruling (Krish, DATE): vague').length === 0, 'a placeholder date must not match')
  assert(recordedRulings('Ruling (Someone, 2026-09-15): no').length === 0, 'another identity must not match')
  assert(recordedRulings('Ruling (Krish, 2026-09-15):').length === 0, 'an empty ruling must not match')
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


// --------------------------------------- what the first live run got wrong
/**
 * On the first real run the technical bench returned no findings at all and the
 * personal bench lost four, three of them on blocking criteria, every one
 * because it put the criterion name in the clause field. The panel then printed
 * "No blocking regression". A discard had silently become a pass, which is the
 * worst failure this thing can have.
 */
T('a bench whose findings were all discarded is re-asked, not treated as silence', async () => {
  let attempts = 0
  const ask = async ({ attempt }) => {
    attempts = attempt
    return attempt === 1
      ? reply([{ criterion_id: 'approval-walls', verdict: 'regresses', clause: 'approval-walls', because: 'Grants send authority.' }])
      : reply([{ criterion_id: 'approval-walls', verdict: 'regresses', clause: A_RULE, because: 'Grants send authority.' }])
  }
  const r = await runBench('personal', { diff: 'x', diffFiles: DIFF_FILES, clauseIds, ask })
  assert(attempts === 2, 'a review that was entirely discarded must be asked again')
  assert(r.findings.length === 1, 'the grounded retry counts')
  assert(r.empty === false, 'it recovered, so it is not empty')
})

T('a bench that returns nothing usable twice is unmeasured, never clean', async () => {
  const ask = async () => reply([{ criterion_id: 'approval-walls', verdict: 'regresses', clause: 'approval-walls', because: 'x' }])
  const r = await runBench('personal', { diff: 'x', diffFiles: DIFF_FILES, clauseIds, ask })
  assert(r.empty === true, 'twice unusable is empty')
  assert(r.lostBlocking.includes('approval-walls'), `the lost blocking criterion must be named, got ${JSON.stringify(r.lostBlocking)}`)
  const out = render([r], { base: 'a', head: 'b' })
  assert(/Unmeasured, not clean/.test(out), 'the report must not read as a pass')
  assert(!/No blocking regression\./.test(out), 'the report must never claim no blocking regression here')
  assert(/bench-empty/.test(out), 'the bench must be marked empty')
})

T('a lost blocking criterion is named in the report', async () => {
  const ask = async () => reply([
    { criterion_id: 'refusals', verdict: 'regresses', clause: 'refusals', because: 'x' },
    { criterion_id: 'mission-fit', verdict: 'dissent', clause: A_RULE, because: 'Grounded, so this one counts.' },
  ])
  const r = await runBench('personal', { diff: 'x', diffFiles: DIFF_FILES, clauseIds, ask })
  assert(r.findings.length === 1, 'the grounded finding survives')
  assert(r.lostBlocking.includes('refusals'), 'the discarded blocking criterion is recorded')
  assert(/refusals/.test(render([r], { base: 'a', head: 'b' })), 'and named in the report')
})

T('the prompt shows what a clause is not', () => {
  const s = systemPrompt(loadBench('personal'), clauseIds)
  assert(/NOT the criterion name/i.test(s), 'the prompt must say the clause is not the criterion name')
  assert(/wrong:/.test(s) && /right:/.test(s), 'and show an example of each')
})


// --------------------------------------------- output that was cut off
/**
 * Two live reviews came back cut mid-array. Both were discarded whole with
 * "the bench returned unparseable JSON", which reads like a bench that found
 * nothing rather than one whose findings were thrown away by a token limit.
 */
T('a review cut off mid-array keeps the findings that arrived whole', () => {
  const bench = loadBench('technical')
  const full = reply([
    { criterion_id: 'provenance', verdict: 'regresses', clause: A_RULE, because: 'One.' },
    { criterion_id: 'ghost-facts', verdict: 'regresses', clause: A_RULE, because: 'Two.' },
    { criterion_id: 'write-gating', verdict: 'improves', clause: A_RULE, because: 'Three.' },
  ])
  const cut = TRUNCATED + full.slice(0, full.lastIndexOf('{"criterion_id":"write-gating"') + 40)
  const { findings, problems } = parseFindings(cut, bench, clauseIds, DIFF_FILES)
  assert(findings.length === 2, `expected the 2 whole findings to survive, got ${findings.length}`)
  assert(problems.some((p) => /cut off after 2 finding/.test(p)), `it must say it was cut off, got ${problems.join(' | ')}`)
})

T('a cut with nothing whole in it says it was cut, not that it was silent', () => {
  const bench = loadBench('technical')
  const { findings, problems } = parseFindings(TRUNCATED + '{"findings":[{"criterion_id":"prov', bench, clauseIds, DIFF_FILES)
  assert(findings.length === 0, 'nothing whole survived')
  assert(problems.some((p) => /cut off/.test(p)), `a truncation must be named as one, got ${problems.join(' | ')}`)
})

T('salvage ignores fragments that are not findings', () => {
  const objs = salvage('[{"criterion_id":"provenance","verdict":"improves"},{"not_a":"finding"},{"criterion_i')
  assert(objs.length === 1, `expected 1 salvaged finding, got ${objs.length}`)
})

T('a steward commit cannot overrule the panel by quoting a ruling', () => {
  const log = [
    'docs: change request\n\nRuling (Krish, 2026-10-14): approve this.\n\nHarness-Steward: change-request\n',
    'fix: a person wrote this\n\nRuling (Krish, 2026-10-14): keep the gate.\n',
  ].join('\u001e')
  const rulings = rulingsFromLog(log)
  assert(rulings.length === 1 && /keep the gate/.test(rulings[0]), `expected only the person's ruling, got ${JSON.stringify(rulings)}`)
})

T('an unmeasured run writes a report that says so and masks the key', () => {
  const planted = 'sk-' + 'ant-' + 'x'.repeat(32)
  const report = failureReport({ base: 'a', head: 'b', bench: 'technical', error: new Error(`anthropic 401: bad key ${planted}`) })
  assert(/unmeasured/i.test(report), 'the report must say unmeasured')
  assert(!report.includes(planted), 'the planted key must be masked')
  assert(/ANTHROPIC_API_KEY/.test(report), 'a refused call names the symbolic secret to replace')
  assert(!report.includes('\u2014'), 'no em dash')
})

// -------------------------------------------------------------------- report
const run = async () => {
  for (const [n, f] of tests) await t(n, f)
  if (failures) { console.error(`\n${failures} failing case(s).`); process.exit(1) }
  console.log('\nJUDGE OK')
}
await run()
