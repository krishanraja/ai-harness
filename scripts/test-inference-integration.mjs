#!/usr/bin/env node
/** Offline integration proof. Synthetic injected providers never verify model quality. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { runApiContext } from './repository-api-context.mjs'
import { draftRepositoryReviews, writeRepositoryDrafts } from './repository-api-drafts.mjs'
import { anthropic, runBench, TRUNCATED } from './judge.mjs'
import { boundedInference } from './lib/inference-mode.mjs'
import { seal } from './repository-brain.mjs'

const scratch = mkdtempSync('/tmp/harness-inference-integration-')
chmodSync(scratch, 0o700)
const paths = ['CLAUDE.md', 'AGENTS.md', 'docs/HARNESS_CONTEXT.md', 'task.json']
const digest = (value) => createHash('sha256').update(value).digest('hex')
const textResponse = (value, stop_reason = 'end_turn') => ({ stop_reason, content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value) }] })
const readCalls = (selected = paths) => ({ stop_reason: 'tool_use', content: selected.map((path, i) => ({ type: 'tool_use', name: 'Read', id: `read-${i}`, input: { file_path: '.canary/' + path } })) })
const write = (out, path, value) => { mkdirSync(dirname(join(out, path)), { recursive: true }); writeFileSync(join(out, path), value) }
let caseId = 0
function fixture(repository = 'content-engine', kind = 'orientation') {
  const out = join(scratch, `case-${++caseId}`)
  mkdirSync(out)
  const docs = { 'CLAUDE.md': '@AGENTS.md\n', 'AGENTS.md': '# Synthetic repository\nRead docs/HARNESS_CONTEXT.md.\n', 'docs/HARNESS_CONTEXT.md': '# Synthetic context\nOwner: fixture-workflow. Measured café bytes.\n' }
  const task = { repository, kind, task: { latest_request: 'Make one aspect shorter.', retained_intent: 'Preserve accepted goals.' } }
  for (const [path, content] of Object.entries(docs)) write(out, path, content)
  write(out, 'task.json', JSON.stringify(task) + '\n')
  const expected = { repository, kind, source_base: 'a'.repeat(40), brain_revision: 'b'.repeat(64), delivered_sha: seal(Object.fromEntries(['AGENTS.md', 'CLAUDE.md', 'docs/HARNESS_CONTEXT.md'].map((p) => [p, docs[p]]))), workflow: 'fixture-workflow', read: ['docs/source.md', 'scripts/verify.mjs'] }
  write(out, 'expected.json', JSON.stringify(expected))
  const answer = kind === 'orientation' ? { repository, kind, workflow: expected.workflow, sources: expected.read, execute_product_actions: false }
    : repository === 'content-engine' ? { repository, kind, retained_decision_ids: ['subject-719', 'finding-286', 'tone-541'], superseded_decision_ids: [], requested_delta: 'length' }
      : { repository, kind, conditions: ['Synthetic pilot cohort Z, one trial'], global_prohibition: false, revised_offline_test_allowed: true, cause_known: false }
  return { out, answer, expected }
}
function provider(f, observed = []) {
  return async (request) => {
    observed.push(structuredClone(request))
    return observed.length === 1 ? readCalls() : textResponse(f.answer)
  }
}
const policy = { targets: ['content-engine', 'AEO-Engine'], families: [], acceptances: {} }
const accepted = { id: 'accepted.retained-intent', type: 'requirement', status: 'accepted', statement: 'Preserve accepted goals when one aspect changes.' }
const candidates = [
  { id: 'candidate.content', repository: 'content-engine', evidence: [{ id: 'episode:content:1', quote: 'Synthetic correction.' }], allowed_workflows: ['content-flow'], accepted_context: [accepted] },
  { id: 'candidate.growth', repository: 'AEO-Engine', evidence: [{ id: 'episode:growth:1', quote: 'Synthetic experiment.' }], allowed_workflows: ['growth-flow'], accepted_context: [] },
]
function proposal(candidate = candidates[0]) {
  return { candidate_id: candidate.id, repository: candidate.repository, workflow: candidate.allowed_workflows[0], type: 'procedure', statement: 'Preserve accepted goals during a narrow revision.', conditions: ['A narrow revision request.'], uncertainties: ['This is fixture evidence only.'], why: 'A local revision must retain the accepted context.', alternative_explanations: 'The task brief may have been unavailable to the worker.', if_wrong: 'An obsolete constraint could survive a genuine reversal.', validation: 'Replay a narrow delta against the accepted fixture brief.', rollback: 'Reject this proposal and retain the existing accepted record.', supersedes: [], refines: [accepted.id], contradicts: [] }
}
let passed = 0, failed = 0, fetches = 0
const actualFetch = globalThis.fetch
globalThis.fetch = async () => { fetches++; throw new Error('offline_test_network_forbidden') }
async function test(name, run) {
  try { await run(); passed++; console.log(`ok inference integration: ${name}`) }
  catch (error) { failed++; console.error(`FAIL inference integration: ${name}\n${error.stack}`) }
}
try {
  await test('four matrix fixtures deliver actual reads and distinct request identities', async () => {
    const ids = []
    for (const repository of ['content-engine', 'AEO-Engine']) for (const kind of ['orientation', 'iteration']) {
      const f = fixture(repository, kind), observed = []
      const receipt = await runApiContext({ out: f.out, requestId: 'fixture:matrix:run', request: provider(f, observed) })
      assert.equal(receipt.status, 'passed')
      assert.equal(receipt.evidence_kind, 'fresh-API-fixture')
      assert.match(receipt.limits, /native installed-client discovery.*unmeasured/)
      assert.equal(observed.length, 2)
      ids.push(...observed.map((r) => r.requestId))
      assert.equal(observed[0].purpose, 'context')
      assert.deepEqual(observed[0].tools[0].input_schema.properties.file_path.enum, paths.map((p) => '.canary/' + p))
      const delivered = observed[1].messages.at(-1).content
      const trace = JSON.parse(readFileSync(join(f.out, 'api-execution.json'), 'utf8'))
      for (const [i, path] of paths.entries()) {
        const expected = readFileSync(join(f.out, path), 'utf8')
        assert.equal(delivered[i].content, expected)
        const proof = trace.find((r) => r.type === 'fixture_read' && r.file_path === '.canary/' + path)
        assert.equal(proof.sha256, digest(expected))
        assert.equal(proof.bytes, Buffer.byteLength(expected))
      }
      assert.equal(delivered.some((r) => r.content.includes(f.expected.delivered_sha)), false)
    }
    assert.equal(new Set(ids).size, 8)
  })
  await test('symlink source escape fails before any provider call', async () => {
    const f = fixture(), outside = join(scratch, 'outside.md')
    writeFileSync(outside, 'Synthetic outside data.\n')
    rmSync(join(f.out, 'AGENTS.md'))
    symlinkSync(outside, join(f.out, 'AGENTS.md'))
    let calls = 0
    await assert.rejects(() => runApiContext({ out: f.out, request: async () => { calls++; return readCalls() } }), /api_context_read_escaped/)
    assert.equal(calls, 0)
    assert.equal(existsSync(join(f.out, 'receipt.json')), false)
  })
  await test('hidden expectations and unknown tool paths never reach a result turn', async () => {
    for (const path of ['.canary/expected.json', '.canary/../expected.json', '/tmp/outside.md']) {
      const f = fixture(); let calls = 0
      await assert.rejects(() => runApiContext({ out: f.out, request: async () => { calls++; return { stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'hidden', name: 'Read', input: { file_path: path } }] } } }), /api_context_read_refused/)
      assert.equal(calls, 1)
      assert.equal(existsSync(join(f.out, 'api-execution.json')), false)
    }
  })
  await test('missing observed reads cannot be replaced by a correct-looking answer', async () => {
    const f = fixture()
    await assert.rejects(() => runApiContext({ out: f.out, request: async () => textResponse(f.answer) }), /canary_api_read_result_missing/)
    assert.equal(existsSync(join(f.out, 'receipt.json')), false)
  })
  await test('partial JSON, truncation and unsupported tools fail closed', async () => {
    for (const final of [textResponse('{"repository":'), textResponse('```json\n{}\n```'), textResponse({}, 'max_tokens'), { stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'shell', name: 'Bash', input: { command: 'true' } }] }]) {
      const f = fixture(); let calls = 0
      await assert.rejects(() => runApiContext({ out: f.out, request: async () => (++calls === 1 ? readCalls() : final) }), /api_context_answer_invalid|api_context_incomplete|api_context_read_refused/)
      assert.equal(existsSync(join(f.out, 'receipt.json')), false)
    }
  })
  await test('tool batches and turn budgets are bounded', async () => {
    const f = fixture(); let calls = 0
    await assert.rejects(() => runApiContext({ out: f.out, request: async () => { calls++; return readCalls(['CLAUDE.md']) } }), /api_context_turn_budget/)
    assert.equal(calls, 6)
    const g = fixture()
    await assert.rejects(() => runApiContext({ out: g.out, request: async () => readCalls([...paths, 'CLAUDE.md']) }), /api_context_tools_invalid/)
  })
  await test('context provider failure propagates without network fallback', async () => {
    const f = fixture(), before = fetches
    await assert.rejects(() => runApiContext({ out: f.out, request: async () => { throw new Error('synthetic_budget_paused') } }), /synthetic_budget_paused/)
    assert.equal(fetches, before)
    assert.equal(existsSync(join(f.out, 'receipt.json')), false)
  })
  await test('repository proposal call carries exact accepted context and workflow scope', async () => {
    let observed
    const expected = proposal()
    const result = await draftRepositoryReviews({ candidates, policy, requestId: 'fixture:proposal:1', request: async (request) => { observed = request; return textResponse({ proposals: [expected] }) } })
    assert.deepEqual(result, [expected])
    assert.deepEqual(JSON.parse(observed.messages[0].content), candidates)
    assert.deepEqual(JSON.parse(observed.messages[0].content)[0].accepted_context, [accepted])
    assert.equal(observed.purpose, 'proposals')
    assert.equal(observed.tools, undefined)
    assert.equal(observed.requestId, 'fixture:proposal:1')
    const out = join(scratch, 'valid-proposals')
    writeRepositoryDrafts(result, { out })
    const files = readdirSync(out)
    assert.equal(files.length, 1)
    assert.deepEqual(JSON.parse(readFileSync(join(out, files[0]), 'utf8')), expected)
    assert.equal(statSync(join(out, files[0])).mode & 0o777, 0o600)
    assert.throws(() => writeRepositoryDrafts(result, { out }), /repository_api_output_not_empty/)
  })
  await test('repository responses require complete JSON and exact schema', async () => {
    for (const response of [textResponse('prefix {"proposals":[]}'), textResponse('```json\n{"proposals":[]}\n```'), textResponse('{"proposals":['), textResponse({ proposals: [], prose: 'extra' }), textResponse({ proposals: [] }, 'max_tokens'), { stop_reason: 'end_turn', content: [{ type: 'tool_use', name: 'Write', input: {} }] }]) {
      await assert.rejects(() => draftRepositoryReviews({ candidates, policy, requestId: 'fixture:invalid:1', request: async () => response }), /repository_api_json_invalid|repository_api_output_invalid|repository_api_response_incomplete/)
    }
  })
  await test('duplicates, foreign scope and partial invalid batches produce no outputs', async () => {
    const valid = proposal(), foreign = { ...proposal(candidates[1]), repository: 'content-engine' }
    for (const proposals of [[valid, valid], [{ ...valid, workflow: 'foreign-workflow' }], [{ ...valid, candidate_id: 'unknown-candidate' }], [{ ...valid, approval: 'invented' }], [valid, foreign]]) {
      const out = join(scratch, `invalid-proposals-${++caseId}`)
      await assert.rejects(async () => {
        const result = await draftRepositoryReviews({ candidates, policy, requestId: 'fixture:invalidbatch:1', request: async () => textResponse({ proposals }) })
        writeRepositoryDrafts(result, { out })
      })
      assert.equal(existsSync(out), false)
    }
  })
  await test('empty repository work avoids provider and provider errors never fall back', async () => {
    let calls = 0
    assert.deepEqual(await draftRepositoryReviews({ candidates: [], policy, request: async () => { calls++; throw new Error('unexpected') } }), [])
    assert.equal(calls, 0)
    const before = fetches
    await assert.rejects(() => draftRepositoryReviews({ candidates, policy, requestId: 'fixture:budget:1', request: async () => { throw new Error('synthetic_budget_paused') } }), /synthetic_budget_paused/)
    assert.equal(fetches, before)
  })
  const judgeEnv = { HARNESS_INFERENCE_MODE: 'bounded-api', HARNESS_REQUEST_ID: 'fixture:judge:run', GITHUB_RUN_ATTEMPT: '3', JUDGE_MODEL: 'fixture-route', ANTHROPIC_API_KEY: 'fixture-unused' }
  await test('judge uses bounded review requests with separate bench and retry identities', async () => {
    const seen = []
    for (const [bench, attempt] of [['technical', 1], ['technical', 2], ['personal', 1]]) {
      assert.equal(await anthropic({ system: 'Fixture system.', user: 'Fixture diff.', bench, attempt }, { env: judgeEnv, request: async (request) => { seen.push(request); return textResponse('fixture review') }, fetchImpl: async () => { throw new Error('legacy_fetch_forbidden') } }), 'fixture review')
    }
    assert.equal(new Set(seen.map((r) => r.requestId)).size, 3)
    assert.ok(seen.every((r) => r.purpose === 'review' && r.model === 'fixture-route' && r.max_tokens === 16000))
  })
  await test('judge preserves truncation marker and never falls back after bounded failure', async () => {
    const input = { system: 'Fixture system.', user: 'Fixture diff.', bench: 'technical', attempt: 1 }
    assert.equal(await anthropic(input, { env: judgeEnv, request: async () => textResponse('{"findings":[', 'max_tokens') }), TRUNCATED + '{"findings":[')
    let legacyCalls = 0
    await assert.rejects(() => anthropic(input, { env: judgeEnv, request: async () => { throw new Error('synthetic_budget_paused') }, fetchImpl: async () => { legacyCalls++; throw new Error('legacy_fetch_forbidden') } }), /synthetic_budget_paused/)
    assert.equal(legacyCalls, 0)
    for (const reason of ['tool_use', 'refusal', 'unknown']) await assert.rejects(() => anthropic(input, { env: judgeEnv, request: async () => textResponse('Incomplete synthetic review.', reason) }), /judge_response_incomplete/)
  })
  await test('judge retry chain cannot reuse a paid request identity', async () => {
    const seen = [], file = 'contract/krish-operating-contract.md'
    const findings = (verdict) => ({ findings: [{ criterion_id: 'provenance', verdict, clause: file, because: 'Synthetic fixture rationale.' }] })
    const result = await runBench('technical', { diff: 'Synthetic fixture diff.', diffFiles: [file], clauseIds: new Set(), ask: (input) => anthropic(input, { env: judgeEnv, request: async (request) => { seen.push(request.requestId); return textResponse(seen.length === 1 ? { findings: [{ ...findings('improves').findings[0], clause: '' }] } : findings(seen.length === 2 ? 'improves' : 'dissent')) } }) })
    assert.equal(new Set(seen).size, seen.length)
    assert.ok(result.findings.some((finding) => finding.verdict === 'dissent') || result.unanimous === true)
  })
  await test('unknown cutover mode fails before either provider route', async () => {
    assert.equal(boundedInference({}), false)
    assert.equal(boundedInference({ HARNESS_INFERENCE_MODE: 'legacy' }), false)
    assert.equal(boundedInference({ HARNESS_INFERENCE_MODE: 'bounded-api' }), true)
    assert.throws(() => boundedInference({ HARNESS_INFERENCE_MODE: 'typo' }), /inference_mode_invalid/)
    let calls = 0
    await assert.rejects(() => anthropic({ system: '', user: '', bench: 'technical', attempt: 1 }, { env: { HARNESS_INFERENCE_MODE: 'typo' }, request: async () => { calls++ }, fetchImpl: async () => { calls++ } }), /inference_mode_invalid/)
    assert.equal(calls, 0)
  })
  assert.equal(fetches, 0)
} finally {
  globalThis.fetch = actualFetch
  rmSync(scratch, { recursive: true, force: true })
}
console.log(`inference integration: ${passed} groups passed, ${failed} failed; synthetic providers, zero network or spend`)
if (failed) process.exitCode = 1
