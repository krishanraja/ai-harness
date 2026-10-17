#!/usr/bin/env node
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { digest } from './lib/learning-episode.mjs'
import { seal } from './repository-brain.mjs'
import { privateTitleReplay, titleReplayTask, verifyTitleReplay, titleReplayToolAnswer, TITLE_REPLAY_TOOL } from './repository-title-replay.mjs'

// These invented examples test mechanics; actual native examples are fetched
// only by the private in-memory evaluation on the runner.
const secretMarker = 'SYNTHETIC_PRIVATE_CANARY_DO_NOT_PUBLISH'
const native = {
  lessons: [
    { lesson: 'Use a mysterious promise.', from: secretMarker },
    { lesson: 'Keep the instrument and the actual finding.' },
    { lesson: "Name the subject. This supersedes the old 'mysterious promise' lesson." },
  ],
  verdicts: [
    { title: 'A mystery', verdict: 'rejected', surface: 'article', piece: 'synthetic-piece', why: 'Too vague. ' + secretMarker },
    { title: 'A new signal', verdict: 'rejected', surface: 'article', piece: 'synthetic-piece', why: 'No instrument.' },
    { title: 'Orion recovered the signal', verdict: 'picked', surface: 'article', piece: 'synthetic-piece', why: 'Concrete and curious.' },
    { title: 'The Orion instrument recovered the hidden signal', verdict: 'picked', surface: 'article', piece: 'synthetic-piece', why: 'Names both subject and finding.' },
  ],
}
const raw = JSON.stringify(native)
const spec = { path: 'config/title-verdicts.json', revision: 'a'.repeat(40), sha256: digest(raw), comparisons: [0, 1, 2, 3], baseline: 3, obsolete: 0, replacement: 2 }
const delivered = { repository: 'content-engine', kind: 'iteration', source_base: 'b'.repeat(40), brain_revision: 'c'.repeat(64), delivered_sha: 'd'.repeat(64) }
const { task, expected } = titleReplayTask(raw, delivered, spec)
const answer = {
  repository: 'content-engine', kind: 'native-title-replay', requested_delta: 'length',
  retained_decision_ids: ['native-subject', 'native-claim', 'native-feedback'],
  superseded_lesson_ids: [expected.obsolete_lesson_id], superseding_lesson_id: expected.replacement_lesson_id,
  selected_example_id: expected.shorter_picked_ids[0], global_rule_created: false, execute_product_actions: false, cross_surface_approval: false, owner_approval_required: true,
  comparisons: task.examples.map(x => ({ example_id: x.id, source_verdict: x.verdict, tradeoffs: ['clarity', 'curiosity', 'brevity'], rationale: 'The shorter phrasing must retain a concrete subject and the factual finding. ' + secretMarker })),
  remaining_tension: 'Shortening can remove the specificity that made the existing picked title useful. ' + secretMarker,
}
const receipt = verifyTitleReplay(answer, expected)
assert.equal(receipt.status, 'passed')
assert.equal(receipt.comparison_count, 4)
assert.ok(!JSON.stringify(receipt).includes(secretMarker), 'Public receipt contains no native or model prose')
assert.ok(!JSON.stringify(receipt).includes(native.verdicts[0].title), 'Public receipt contains no title text')
assert.throws(() => titleReplayTask(raw + ' ', delivered, spec), /native_source_moved/)
assert.throws(() => verifyTitleReplay({ ...answer, retained_decision_ids: ['native-feedback'] }, expected), /intent_or_authority_lost/)
assert.throws(() => verifyTitleReplay({ ...answer, global_rule_created: true }, expected), /intent_or_authority_lost/)
assert.throws(() => verifyTitleReplay({ ...answer, execute_product_actions: true }, expected), /intent_or_authority_lost/)
assert.throws(() => verifyTitleReplay({ ...answer, cross_surface_approval: true }, expected), /intent_or_authority_lost/)
assert.throws(() => verifyTitleReplay({ ...answer, superseded_lesson_ids: [] }, expected), /supersession_lost/)
assert.throws(() => verifyTitleReplay({ ...answer, superseded_lesson_ids: [expected.obsolete_lesson_id, expected.replacement_lesson_id] }, expected), /supersession_lost/)
assert.throws(() => verifyTitleReplay({ ...answer, selected_example_id: task.examples[0].id }, expected), /shortest_rejection_won/)
assert.throws(() => verifyTitleReplay({ ...answer, comparisons: answer.comparisons.slice(1) }, expected), /comparison_missing/)
assert.throws(() => verifyTitleReplay({ ...answer, comparisons: answer.comparisons.map(x => ({ ...x, rationale: '' })) }, expected), /qualitative_comparison_missing/)
assert.throws(() => verifyTitleReplay({ ...answer, comparisons: answer.comparisons.map(x => ({ ...x, tradeoffs: ['brevity'] })) }, expected), /balance_missing/)
assert.throws(() => verifyTitleReplay({ ...answer, comparisons: [answer.comparisons[0], answer.comparisons[0], ...answer.comparisons.slice(2)] }, expected), /native_verdict_changed/)
assert.throws(() => verifyTitleReplay({ ...answer, comparisons: answer.comparisons.map(x => ({ ...x, rationale: 'word '.repeat(81) })) }, expected), /qualitative_comparison_missing/)
assert.throws(() => verifyTitleReplay({ ...answer, remaining_tension: 'word '.repeat(61) }, expected), /balance_missing/)

const toolBlock = { type: 'tool_use', id: 'test-evaluation', name: TITLE_REPLAY_TOOL.name, input: answer }
const toolResponse = { model: 'claude-test-1', stop_reason: 'tool_use', content: [toolBlock] }
assert.equal(titleReplayToolAnswer(toolResponse), answer)
assert.equal(titleReplayToolAnswer({ ...toolResponse, content: [{ type: 'text', text: secretMarker }, toolBlock] }), answer, 'Private preamble, if present, is ignored and never printed')
assert.throws(() => titleReplayToolAnswer({ ...toolResponse, stop_reason: 'max_tokens' }), { message: 'title_replay_model_incomplete' }, 'A partial tool result never counts as a completed evaluation')
assert.throws(() => titleReplayToolAnswer({ ...toolResponse, stop_reason: 'pause_turn' }), { message: 'title_replay_model_incomplete' })
assert.throws(() => titleReplayToolAnswer({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(answer) }] }), { message: 'title_replay_model_tool_response_missing' }, 'Free text cannot substitute for the structured result')
assert.throws(() => titleReplayToolAnswer({ ...toolResponse, content: [toolBlock, toolBlock] }), { message: 'title_replay_model_tool_response_invalid' })
assert.throws(() => titleReplayToolAnswer({ ...toolResponse, content: [toolBlock, { ...toolBlock, name: 'unexpected_product_action' }] }), { message: 'title_replay_model_tool_response_invalid' })
assert.throws(() => titleReplayToolAnswer({ ...toolResponse, content: [{ ...toolBlock, name: 'unexpected_product_action' }] }), { message: 'title_replay_model_tool_response_invalid' })
assert.throws(() => titleReplayToolAnswer({ ...toolResponse, content: [{ ...toolBlock, input: null }] }), { message: 'title_replay_model_tool_response_invalid' })
assert.throws(() => titleReplayToolAnswer({ ...toolResponse, content: [{ ...toolBlock, input: [] }] }), { message: 'title_replay_model_tool_response_invalid' })
assert.throws(() => titleReplayToolAnswer({ ...toolResponse, content: secretMarker }), { message: 'title_replay_model_response_invalid' })

const out = mkdtempSync(join(tmpdir(), 'repository-title-replay-'))
try {
  mkdirSync(join(out, 'docs'))
  const context = Object.fromEntries(['CLAUDE.md', 'AGENTS.md', 'docs/HARNESS_CONTEXT.md'].map(path => [path, 'Offline fixture instructions.\n']))
  const pinnedDelivery = { ...delivered, delivered_sha: seal(context) }
  writeFileSync(join(out, 'expected.json'), JSON.stringify(pinnedDelivery))
  for (const [path, text] of Object.entries(context)) writeFileSync(join(out, path), text)
  const calls = []
  const fakeFetch = async (url, options) => {
    calls.push({ url, options })
    return { ok: false, status: 400, text: async () => secretMarker }
  }
  // Retrieval errors and provider bodies never become public error text.
  await assert.rejects(privateTitleReplay({ gh: { getFile: async () => { throw new Error(secretMarker) } }, key: 'test', out, fetchImpl: fakeFetch }), { message: 'title_replay_native_read_failed' })
  await assert.rejects(privateTitleReplay({ gh: { getFile: async () => ({ text: secretMarker }) }, key: 'test', out, fetchImpl: fakeFetch }), { message: 'title_replay_native_source_moved' })
  assert.equal(calls.length, 0, 'Unverified native bytes must never reach the model')
  await assert.rejects(privateTitleReplay({ gh: { getFile: async () => ({ text: raw }) }, key: 'test', out, fetchImpl: fakeFetch, spec }), { message: 'title_replay_model_http_failed' })
  assert.equal(calls.length, 1)
  assert.ok(calls[0].options.body.includes(secretMarker), 'Private source reaches only the in-memory model request')
  const request = JSON.parse(calls[0].options.body)
  assert.equal(request.max_tokens, 3000)
  assert.deepEqual(request.tool_choice, { type: 'tool', name: 'submit_title_replay', disable_parallel_tool_use: true })
  assert.equal(request.tools.length, 1)
  assert.deepEqual(request.tools[0], TITLE_REPLAY_TOOL)
  assert.ok(!JSON.stringify(request.tools).includes(expected.obsolete_lesson_id), 'Tool schema must not contain the hidden correct supersession')
  assert.ok(!JSON.stringify(request.tools).includes(expected.shorter_picked_ids[0]), 'Tool schema must not contain the hidden correct example selection')
  const response = await privateTitleReplay({ gh: { getFile: async () => ({ text: raw }) }, key: 'test', out, spec, fetchImpl: async () => ({ ok: true, json: async () => toolResponse }) })
  assert.equal(response.model_calls, 1)
  assert.ok(!JSON.stringify(response).includes(secretMarker), 'Provider response prose never enters the receipt')
  await assert.rejects(privateTitleReplay({ gh: { getFile: async () => ({ text: raw }) }, key: 'test', out, spec, fetchImpl: async () => ({ ok: true, json: async () => { throw new Error(secretMarker) } }) }), { message: 'title_replay_model_response_invalid' })
  await assert.rejects(privateTitleReplay({ gh: { getFile: async () => ({ text: raw }) }, key: 'test', out, spec, fetchImpl: async () => ({ ok: true, json: async () => ({ ...toolResponse, stop_reason: 'max_tokens' }) }) }), { message: 'title_replay_model_incomplete' }, 'Safe incomplete diagnosis must survive the transport parser')
  await assert.rejects(privateTitleReplay({ gh: { getFile: async () => ({ text: raw }) }, key: 'test', out, spec, fetchImpl: async () => ({ ok: true, json: async () => ({ ...toolResponse, content: [{ ...toolBlock, input: secretMarker }] }) }) }), { message: 'title_replay_model_tool_response_invalid' })
  writeFileSync(join(out, 'AGENTS.md'), 'Changed delivered bytes.\n')
  await assert.rejects(privateTitleReplay({ gh: { getFile: async () => ({ text: raw }) }, key: 'test', out, fetchImpl: fakeFetch, spec }), { message: 'title_replay_delivered_context_moved' })
  assert.equal(calls.length, 1, 'Drift must fail before another model call')
  assert.equal(readFileSync(join(out, 'expected.json'), 'utf8'), JSON.stringify(pinnedDelivery), 'No source or candidate text is persisted')
} finally { rmSync(out, { recursive: true, force: true }) }
console.log('REPOSITORY CANARY OK: native contrasts, accumulated intent, explicit supersession, qualitative comparison and opaque receipts')
