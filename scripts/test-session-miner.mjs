#!/usr/bin/env node
/**
 * The session miner reads both transcript formats, picks the moments that
 * teach, and never lets a planted secret, email, name or path reach the
 * extractor or an envelope, even when the extractor echoes its input back.
 * Its envelopes pass the importer's own gate.
 */

import { parseClaudeCode, parseCodex, parseEvents, parseCloudEvents, parseLessons, planKey, readPlan, selectExcerpts, scoreTurn, mine, validateObservation, toEnvelope, post, claudeCommand, dispatch, DISPATCH_EVENT, claudeTranscripts, apiExtractor, mineAsync, extractionPolicySeal, assertExtractionPolicy, readExtractionContext } from './mine-sessions.mjs'
import { toObservation } from './import-harness-events.mjs'
import { intake } from './intake-observations.mjs'
import { mkdirSync, mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import './test-miner-checkpoints.mjs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadPolicy } from './propose.mjs'

let passed = 0
let failed = 0
const test = (name, condition) => {
  if (condition) passed += 1
  else failed += 1
  console.log(`${condition ? 'ok  ' : 'FAIL'}  ${name}`)
}

const planted = { secret: ['sk', 'ant', 'api03', 'z'.repeat(30)].join('-'), email: ['dana', 'example.org'].join('@'), name: 'Dana Whitlock', path: ['C:', 'Users', 'dana', 'secret-plan.md'].join('\\') }

const cc = [
  { type: 'user', isMeta: true, message: { role: 'user', content: 'meta caveat' } },
  { type: 'assistant', sessionId: 's1', cwd: '/w', timestamp: '2026-10-13T10:00:00Z', message: { role: 'assistant', content: [{ type: 'text', text: `Published it and emailed ${planted.email} from ${planted.path}.` }] } },
  { type: 'user', sessionId: 's1', cwd: '/w', timestamp: '2026-10-13T10:01:00Z', message: { role: 'user', content: [{ type: 'tool_result', content: 'tool output' }] } },
  { type: 'user', sessionId: 's1', cwd: '/w', timestamp: '2026-10-13T10:02:00Z', message: { role: 'user', content: `No, that is wrong. Never publish without asking me first, and never put ${planted.name} or my key ${planted.secret} anywhere.` } },
  { type: 'user', sessionId: 's1', message: { role: 'user', content: 'thanks' } },
].map((o) => JSON.stringify(o))
const turns = parseClaudeCode(cc)
test('Claude Code: text turns only, no meta, no tool results', turns.length === 3 && turns.every((t) => !/tool output|meta caveat/.test(t.text)))

const codex = [
  { type: 'session_meta', payload: { id: 'c1', cwd: '/repo' } },
  { timestamp: '2026-10-13T11:00:00Z', type: 'response_item', payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text: '<environment_context>skip me</environment_context>' }] } },
  { timestamp: '2026-10-13T11:01:00Z', type: 'response_item', payload: { type: 'message', role: 'assistant', content: [{ type: 'output_text', text: 'I ran the full batch.' }] } },
  { type: 'message', role: 'user', content: [{ type: 'input_text', text: 'Stop, I keep telling you: run ten rows before any full batch, every time.' }] },
].map((o) => JSON.stringify(o))
const ct = parseCodex(codex)
test('Codex: both line formats, injected context skipped, cwd carried', ct.length === 2 && ct[0].cwd === '/repo' && ct[1].role === 'user')
test('cloud export: normalised turns pass through', parseEvents([{ role: 'user', text: 'x' }, { role: 'tool', text: 'y' }]).length === 1)

const ev = (role, uuid, at, content, extra = {}) => ({ created_at: at, [role]: { uuid, internal_anthropic_catchall: { message: { role, content }, ...extra } } })
const page = (data) => `<other-session nonce="n" untrusted="true">\nheader\n    ${JSON.stringify({ ccr: { data, has_more: false } })}\n</other-session nonce="n">`
const savedPath = '/root/.claude/projects/p/s/tool-results/mcp-list_events-1.txt'
const cloud = [
  { type: 'assistant', message: { content: [{ type: 'tool_use', id: 't1', name: 'mcp__claude-code-remote__list_events', input: { session_id: 'sA' } }, { type: 'tool_use', id: 't2', name: 'mcp__claude-code-remote__list_events', input: { session_id: 'sB' } }, { type: 'tool_use', id: 't3', name: 'mcp__claude-code-remote__list_sessions', input: {} }] } },
  { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't1', content: [{ type: 'text', text: page([
    ev('user', 'u1', '2026-10-14T10:00:00Z', 'No, never publish without asking me first.'),
    ev('user', 'u2', '2026-10-14T10:01:00Z', 'Weekly run prompt', { isSynthetic: true }),
    ev('user', 'u3', '2026-10-14T10:02:00Z', [{ type: 'tool_result', content: 'tool output' }]),
    ev('assistant', 'a1', '2026-10-14T09:59:00Z', [{ type: 'thinking', thinking: 'hidden' }, { type: 'text', text: 'Published it.' }]),
    ev('assistant', 'a2', '2026-10-14T10:03:00Z', [{ type: 'text', text: 'subagent words' }], { parent_tool_use_id: 'x' }),
  ]) }] }] } },
  { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't1', content: page([ev('user', 'u1', '2026-10-14T10:00:00Z', 'No, never publish without asking me first.')]) }] } },
  { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't2', content: `Output too large. Output has been saved to ${savedPath}. Read it in chunks.` }] } },
  { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't3', content: page([ev('user', 'z1', '2026-10-14T10:00:00Z', 'not an events page')]) }] } },
].map((o) => JSON.stringify(o))
const asked = []
const cloudTurns = parseCloudEvents(cloud, { readSaved: (p) => { asked.push(p); return p === savedPath ? page([ev('user', 'b1', '2026-10-14T11:00:00Z', 'Stop doing that by hand.')]) : null } })
test('cloud events: Krish and assistant text only, no synthetic, subagent, thinking or tool turns', cloudTurns.length === 3 && !cloudTurns.some((t) => /prompt|tool output|subagent|hidden|not an events/.test(t.text)))
test('cloud events: each event once, in order, tagged with the session it was fetched for', cloudTurns.map((t) => `${t.session}:${t.text.slice(0, 4)}`).join(',') === 'sA:Publ,sA:No, ,sB:Stop')
test('cloud events: a result saved to tool-results is read back from that path', asked.length === 1 && asked[0] === savedPath)
const good = '{"excerpt": 0, "kind": "preference", "summary": "a", "severity": "low", "confidence": "low"}'
test('lessons: a clean reply parses whole', parseLessons(`Here you go:\n[${good}, ${good}]`).length === 2)
let partialThrew = false
try { parseLessons(`[${good}, {"excerpt": 1, "confidence":medium_pla}]`) } catch { partialThrew = true }
test('lessons: a partial array is retried whole so malformed excerpts remain replayable', partialThrew)
let threw = false
try { parseLessons('[{"excerpt": 0, "confidence":medium}]') } catch { threw = true }
let refusalThrew = false
try { parseLessons('no lessons') } catch { refusalThrew = true }
test('lessons: malformed replies and refusals retry; only an explicit empty array declines', threw && refusalThrew && parseLessons('[]').length === 0)
const planDir = mkdtempSync(join(tmpdir(), 'miner-plan-'))
const planFile = join(planDir, 'plan.json')
const cur = { sA: '2026-10-14T10:00:00Z' }
test('plan: a send with no dry run refuses', Boolean(readPlan(planFile, cur).error))
writeFileSync(planFile, JSON.stringify({ key: planKey(cur), envelopes: [{ event_id: 'e1' }] }))
test('plan: the send gets exactly what the dry run proposed', readPlan(planFile, { ...cur }).envelopes?.[0]?.event_id === 'e1')
test('plan: a session that moved since the dry run refuses the plan', Boolean(readPlan(planFile, { ...cur, sB: '2026-10-15T00:00:00Z' }).error))

test('a correction scores, a thank-you does not', scoreTurn('No, that is wrong, never do that again.').score >= 3 && scoreTurn('thanks').score === 0)
const ex = selectExcerpts(turns, { max: 40, chars: 1200 })
test('one excerpt is picked, and it is redacted before any model sees it', ex.length === 1 && Object.values(planted).every((v) => !ex[0].excerpt.includes(v)))

const policy = loadPolicy()
let prompt = ''
const leaky = (p) => { prompt = p; return [{ excerpt: 0, kind: 'explicit_correction', summary: `Ask before publishing; echo ${planted.secret} ${planted.email} ${planted.name} ${planted.path}`, related_skill_or_rule: 'krish-build', severity: 'high', confidence: 'high' }] }
const r = mine(turns, { surface: 'claude-code', extract: leaky, policy, known: new Set(['krish-build']) })
const blob = prompt + JSON.stringify(r.envelopes)
test('with a leaky extractor, nothing planted reaches the prompt or an envelope', r.envelopes.length === 1 && Object.values(planted).every((v) => !blob.includes(v)))
test('the envelope carries a session-miner id and an opaque locator', /^session-miner:claude-code:[0-9a-f]{24}$/.test(r.envelopes[0].event_id) && /^session:[0-9a-f]{16}$/.test(r.envelopes[0].evidence_ref))
const imported = toObservation({ ...r.envelopes[0], inbox_id: 1, payload_sha256: 'a'.repeat(64) }, '2026-10-14')
test('the envelope passes the importer and is labelled by producer', imported.producer === 'session-miner' && imported.class === 'correction')

const excerpt = 'KRISH: Never publish without asking me first, and never put anything anywhere without checking.'
test('a summary that quotes the excerpt verbatim is rejected', !validateObservation({ kind: 'preference', summary: 'Never publish without asking me first, and never put anything anywhere.', severity: 'low', confidence: 'low' }, excerpt).ok)
test('an invented related id becomes null', validateObservation({ kind: 'preference', summary: 'Prefers a short confirmation before anything goes out.', related_skill_or_rule: 'made-up-skill', severity: 'low', confidence: 'low' }, excerpt, { known: new Set(['krish-build']) }).value.related_skill_or_rule === null)
test('an unknown kind is rejected', !validateObservation({ kind: 'gossip', summary: 'x'.repeat(40), severity: 'low', confidence: 'low' }, excerpt).ok)
test('the same lesson twice has one event id', toEnvelope({ kind: 'preference', summary: 's', severity: 'low', confidence: 'low' }, { surface: 'codex', session: 'a', index: 1 }).event_id === toEnvelope({ kind: 'preference', summary: 's', severity: 'low', confidence: 'low' }, { surface: 'codex', session: 'a', index: 1 }).event_id)

const broken = mine(turns, { surface: 'claude-code', extract: () => { throw new Error('spawn claude ENOENT') }, policy, known: new Set() })
test('an extractor that cannot run is reported, not counted as an empty week', broken.extractorError === 'spawn claude ENOENT' && broken.envelopes.length === 0)
test('Windows starts an npm claude shim through a shell, never an .exe', claudeCommand({ cli: 'claude', platform: 'win32' }).shell === true && claudeCommand({ cli: 'C:\\tools\\claude.exe', platform: 'win32' }).shell === false && claudeCommand({ cli: 'claude', platform: 'linux' }).shell === false)

let calls = 0
const fake = async () => { calls++; return new Response('{}', { status: calls === 2 ? 409 : calls === 3 ? 500 : 200 }) }
const p = await post([{}, {}, {}], { url: 'https://example.invalid/api/harness/events', token: 't', fetchImpl: fake })
test('posting counts sent, skips a conflict, and reports a failure', p.sent === 1 && p.failures.length === 1)

// Both accounts and the Desktop app's local sessions, never its caches.
const home = mkdtempSync(join(tmpdir(), 'miner-home-'))
const appdata = join(home, 'AppData', 'Roaming')
const place = (...p) => { mkdirSync(join(...p.slice(0, -1)), { recursive: true }); writeFileSync(join(...p), '{}\n') }
place(home, '.claude', 'projects', 'repo-a', 'one.jsonl')
place(home, '.claude-work', 'projects', 'repo-b', 'two.jsonl')
place(home, 'alt-config', 'projects', 'repo-c', 'three.jsonl')
place(appdata, 'Claude', 'local-agent-mode-sessions', 'abc', 'four.jsonl')
place(appdata, 'Claude', 'Cache', 'not-a-session.jsonl')
place(home, '.claude', 'projects', 'repo-a', 'notes.txt')
const found = claudeTranscripts({ home, env: { APPDATA: appdata, CLAUDE_CONFIG_DIR: join(home, 'alt-config') } }).map((f) => f.slice(home.length))
test('transcripts are found for every Claude account folder and Desktop local sessions, never caches or other files', found.length === 4 && ['one', 'two', 'three', 'four'].every((n) => found.some((f) => f.endsWith(`${n}.jsonl`))) && !found.some((f) => /Cache|notes/.test(f)))

const sentBodies = []
const fakeGh = (cmd, args, opts) => { if (cmd !== 'gh' || args[3] !== 'repos/krishanraja/ai-harness/dispatches') throw new Error('wrong call'); sentBodies.push(JSON.parse(opts.input)); return '' }
const many = Array.from({ length: 45 }, (_, i) => toEnvelope({ kind: 'preference', summary: `Prefers the decision first in every reply, case ${i}.`, severity: 'low', confidence: 'medium' }, { surface: 'codex', session: 's', index: i, at: '2026-10-15T00:00:00Z' }))
const d = dispatch(many, { run: fakeGh })
test('dispatch sends every envelope in chunks of 20 through gh, nothing else', d.sent === 45 && d.failures.length === 0 && sentBodies.length === 3 && sentBodies.every((b) => b.event_type === DISPATCH_EVENT && b.client_payload.events.length <= 20))
const failing = dispatch(many.slice(0, 5), { run: () => { const e = new Error('x'); e.stderr = 'HTTP 404: Not Found'; throw e } })
test('a refused dispatch is a failure, so the cursor stays put', failing.sent === 0 && failing.failures[0] === 'HTTP 404: Not Found')
const ledger = mkdtempSync(join(tmpdir(), 'intake-'))
const got = intake(sentBodies[0].client_payload, { ledgerDir: ledger, now: new Date('2026-10-15T00:00:00Z') })
test('what the miner dispatches, the intake accepts and labels as the miner', got.fresh.length === 20 && Object.keys(got.rejected).length === 0 && got.fresh.every((row) => row.producer === 'session-miner' && row.quote.startsWith('[codex] ')))

// API fixtures inject the gateway and verified execution facts in process; production has no bypass flag.
const apiPolicy = {
  schema_version: 1, enabled: true, approval_ref: `commit:${'a'.repeat(40)}`, approval_sha256: null,
  execution_repository: 'krishanraja/control-center', execution_repository_id: 123,
  reviewed_harness_revision: 'b'.repeat(40), audience_sha256: 'c'.repeat(64), actions_policy_sha256: 'd'.repeat(64),
  retention_sha256: 'e'.repeat(64), provider_data_sha256: 'f'.repeat(64), source_accounts: ['1'.repeat(64)],
  max_input_bytes: 60000, max_episodes: 20, max_output_tokens: 4000,
}
apiPolicy.approval_sha256 = extractionPolicySeal(apiPolicy)
const apiContext = { private: true, repository: apiPolicy.execution_repository, repository_id: 123, ref: 'refs/heads/main', harness_revision: apiPolicy.reviewed_harness_revision, audience_sha256: apiPolicy.audience_sha256, actions_policy_sha256: apiPolicy.actions_policy_sha256, retention_sha256: apiPolicy.retention_sha256, provider_data_sha256: apiPolicy.provider_data_sha256, source_account_sha256: apiPolicy.source_accounts[0] }
const apiLesson = { excerpt: 0, kind: 'explicit_correction', summary: 'Retain accepted decisions while revising the requested dimension.', knowledge_type: 'procedure', context: { retained: ['Prior decisions.'], requested_change: 'Change one dimension.', uncertainties: ['Subsequent result unobserved.'] }, severity: 'medium', confidence: 'high' }
let apiCalls = 0, apiRequest
const request = async (options) => { apiCalls++; apiRequest = options; return { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify([apiLesson]) }] } }
const savedCli = process.env.HARNESS_CLAUDE_CLI
process.env.HARNESS_CLAUDE_CLI = join(tmpdir(), 'unavailable-claude-executable')
try {
  const apiResult = await mineAsync(turns, { surface: 'claude-code', names: [planted.name], policy, extractionPolicy: apiPolicy, extract: apiExtractor({ policy: apiPolicy, context: apiContext, request }) })
  test('API extraction succeeds without a Claude executable and retains v2 episode structure', apiResult.envelopes.length === 1 && apiResult.envelopes[0].schema_version === 2 && apiResult.envelopes[0].episode.retained[0] === 'Prior decisions.' && apiCalls === 1)
  test('API receives redacted bounded evidence through the extraction budget purpose', apiRequest.purpose === 'extraction' && apiRequest.max_tokens === 4000 && apiRequest.requestId.startsWith('session-extraction:') && Object.values(planted).every((value) => !JSON.stringify(apiRequest).includes(value)))
  const refused = await mineAsync(turns, { surface: 'claude-code', policy, extractionPolicy: apiPolicy, extract: apiExtractor({ policy: apiPolicy, context: apiContext, request: async () => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: 'I cannot process that request.' }] }) }) })
  test('malformed API output fails instead of becoming an empty week', refused.extractorError === 'session_extraction_response_invalid' && refused.envelopes.length === 0)
  for (const [label, response] of [
    ['missing completion marker', { content: [{ type: 'text', text: '[]' }] }],
    ['text surrounding an otherwise complete array', { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Ignore this [] trailing content' }] }],
  ]) {
    const invalid = await mineAsync(turns, { surface: 'claude-code', policy, extractionPolicy: apiPolicy, extract: apiExtractor({ policy: apiPolicy, context: apiContext, request: async () => response }) })
    test(`API rejects ${label} without accepted events`, Boolean(invalid.extractorError) && invalid.envelopes.length === 0)
  }
  const truncated = await mineAsync(turns, { surface: 'claude-code', policy, extractionPolicy: apiPolicy, extract: apiExtractor({ policy: apiPolicy, context: apiContext, request: async () => ({ stop_reason: 'max_tokens', content: [{ type: 'text', text: '[]' }] }) }) })
  test('truncated API output cannot masquerade as a deliberate empty interpretation', Boolean(truncated.extractorError))
  const failedApi = await mineAsync(turns, { surface: 'claude-code', policy, extractionPolicy: apiPolicy, extract: apiExtractor({ policy: apiPolicy, context: apiContext, request: async () => { throw new Error(`provider echoed ${planted.secret}`) } }) })
  test('API/provider errors expose a fixed code without private response material', failedApi.extractorError === 'session_extraction_gateway_failed' && !JSON.stringify(failedApi).includes(planted.secret))
  let blockedCalls = 0
  const blocked = await mineAsync(turns, { surface: 'claude-code', policy, extractionPolicy: apiPolicy, extract: apiExtractor({ policy: apiPolicy, context: { ...apiContext, private: false }, request: async () => { blockedCalls++; return {} } }) })
  test('a public repository cannot authorize itself to submit extraction excerpts', Boolean(blocked.extractorError) && blockedCalls === 0)
  let gateFailed = false
  try { apiExtractor({ policy: { ...apiPolicy, enabled: false }, context: apiContext, request }) } catch { gateFailed = true }
  test('disabled extraction policy refuses before calling the shared API', gateFailed && apiCalls === 1)
  gateFailed = false
  try { assertExtractionPolicy({ ...apiPolicy, max_episodes: 19 }, apiContext) } catch { gateFailed = true }
  test('changed extraction policy invalidates its exact approval seal', gateFailed)
  gateFailed = false
  try { assertExtractionPolicy(apiPolicy, { ...apiContext, retention_sha256: null }) } catch { gateFailed = true }
  test('missing live privacy/retention preflight fails closed', gateFailed)
  gateFailed = false
  try { assertExtractionPolicy(apiPolicy, { ...apiContext, source_account_sha256: '9'.repeat(64) }) } catch { gateFailed = true }
  test('an unreviewed account cannot enter the approved extraction route', gateFailed)
  let reads = 0
  const runtimeContext = readExtractionContext(apiPolicy, { sourceAccount: apiContext.source_account_sha256, env: { GITHUB_ACTIONS: 'true', GITHUB_REPOSITORY: apiPolicy.execution_repository, GITHUB_REF: 'refs/heads/main', GITHUB_EVENT_NAME: 'workflow_dispatch' }, run: (command, args) => {
    reads++
    if (command === 'git') return apiPolicy.reviewed_harness_revision + '\n'
    if (args.at(-1).includes('/collaborators?')) return JSON.stringify([[{ id: 1, role_name: 'admin', permissions: { admin: true } }]])
    if (args.at(-1).endsWith('/permissions/workflow')) return JSON.stringify({ default_workflow_permissions: 'read' })
    if (args.at(-1).endsWith('/actions/permissions')) return JSON.stringify({ enabled: true, allowed_actions: 'selected' })
    return JSON.stringify({ id: 123, full_name: apiPolicy.execution_repository, private: true })
  } })
  test('production preflight reads private repository, actual audience/actions and pinned checkout but does not invent retention evidence', reads === 5 && runtimeContext.private && runtimeContext.retention_sha256 === null && runtimeContext.provider_data_sha256 === null)
  const { requestMessages, inferencePolicySeal } = await import('./harness-api.mjs')
  let ledgerRevision = 0, budgetEvents = [], paidAttempts = 0
  const memoryLedger = { read: async () => ({ revision: ledgerRevision, events: structuredClone(budgetEvents), policy_sha256: inferencePolicySeal(budgetPolicy) }), compareAndSwap: async (revision, events, policySeal) => { if (revision !== ledgerRevision || policySeal !== inferencePolicySeal(budgetPolicy)) return false; budgetEvents = structuredClone(events); ledgerRevision++; return true } }
  const budgetPolicy = {
    schema_version: 1, enabled: true, approval_ref: 'fixture-only', timezone: 'Europe/London', monthly_limit_usd: 50, review_reserve_usd: 10,
    purposes: ['extraction'], default_model: 'fixture-model', limits: { max_request_bytes: 80000, max_output_tokens: 8000, max_attempts: 1, timeout_ms: 1000, cas_attempts: 4 },
    models: { 'fixture-model': { approved: true, approval_ref: 'fixture-only', context_window_tokens: 10000, max_output_tokens: 8000, valid_from: '2026-10-01T00:00:00.000Z', valid_until: '2026-11-01T00:00:00.000Z', usd_per_million_tokens: { input: 1, output: 2, cache_read: 1, cache_write_5m: 2, cache_write_1h: 3 } } },
  }
  const gatewayResult = await mineAsync(turns, { surface: 'claude-code', names: [planted.name], policy, extractionPolicy: apiPolicy, extract: apiExtractor({ policy: apiPolicy, context: apiContext, request: (options) => requestMessages({ ...options, apiKey: 'synthetic-fixture-only', policy: budgetPolicy, ledger: memoryLedger, now: () => new Date('2026-10-18T12:00:00.000Z'), fetchImpl: async (_url, options) => { paidAttempts++; const body = JSON.parse(options.body); if (body.tools || body.tool_choice) throw new Error('unexpected tools'); return new Response(JSON.stringify({ type: 'message', id: 'synthetic-fixture-response', stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify([apiLesson]) }], usage: { input_tokens: 100, output_tokens: 100 } }), { status: 200 }) } }) }) })
  test('API extraction crosses the real shared reservation and settlement boundary using an offline provider fixture', gatewayResult.envelopes.length === 1 && paidAttempts === 1 && budgetEvents.length === 2 && budgetEvents[0].event === 'reserved' && budgetEvents[0].purpose === 'extraction' && budgetEvents[1].event === 'settled')
  test('extraction budget events contain neither session excerpts nor model output', !JSON.stringify(budgetEvents).includes(apiLesson.summary) && Object.values(planted).every((value) => !JSON.stringify(budgetEvents).includes(value)))
  const apiState = mkdtempSync(join(tmpdir(), 'miner-api-cli-'))
  try {
    const eventsPath = join(apiState, 'events.json'), cursorPath = join(apiState, 'cursor-events-json.json')
    writeFileSync(eventsPath, JSON.stringify([{ role: 'user', session: 'synthetic', text: 'No, preserve the earlier decisions when changing one dimension.' }]))
    const before = '{"unchanged":7}\n'; writeFileSync(cursorPath, before)
    const cli = spawnSync(process.execPath, ['scripts/mine-sessions.mjs', '--source', 'events-json', '--path', eventsPath, '--state', apiState, '--dry-run', '--extractor', 'api'], { cwd: new URL('..', import.meta.url), env: { ...process.env, HARNESS_CLAUDE_CLI: join(apiState, 'missing-claude') }, encoding: 'utf8' })
    test('actual API CLI fails closed without approvals and keeps the existing cursor byte-identical', cli.status === 1 && /privacy\/approval preflight/.test(cli.stderr) && readFileSync(cursorPath, 'utf8') === before && !existsSync(join(apiState, 'plan-events-json.json')))
  } finally { rmSync(apiState, { recursive: true, force: true }) }
} finally {
  if (savedCli === undefined) delete process.env.HARNESS_CLAUDE_CLI
  else process.env.HARNESS_CLAUDE_CLI = savedCli
}

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) process.exit(1)
console.log('SESSION MINER OK')
