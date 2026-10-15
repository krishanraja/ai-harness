#!/usr/bin/env node
/**
 * The session miner reads both transcript formats, picks the moments that
 * teach, and never lets a planted secret, email, name or path reach the
 * extractor or an envelope, even when the extractor echoes its input back.
 * Its envelopes pass the importer's own gate.
 */

import { parseClaudeCode, parseCodex, parseEvents, parseCloudEvents, parseLessons, selectExcerpts, scoreTurn, mine, validateObservation, toEnvelope, post, claudeCommand, dispatch, DISPATCH_EVENT, claudeTranscripts } from './mine-sessions.mjs'
import { toObservation } from './import-harness-events.mjs'
import { intake } from './intake-observations.mjs'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
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
test('lessons: one malformed element costs only itself', parseLessons(`[${good}, {"excerpt": 1, "confidence":medium_pla}]`).length === 1)
let threw = false
try { parseLessons('[{"excerpt": 0, "confidence":medium}]') } catch { threw = true }
test('lessons: a reply with nothing readable throws, so the extractor asks again', threw && parseLessons('no lessons').length === 0)

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

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) process.exit(1)
console.log('SESSION MINER OK')
