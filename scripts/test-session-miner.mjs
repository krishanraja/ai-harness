#!/usr/bin/env node
/**
 * The session miner reads both transcript formats, picks the moments that
 * teach, and never lets a planted secret, email, name or path reach the
 * extractor or an envelope, even when the extractor echoes its input back.
 * Its envelopes pass the importer's own gate.
 */

import { parseClaudeCode, parseCodex, parseEvents, selectExcerpts, scoreTurn, mine, validateObservation, toEnvelope, post, claudeCommand } from './mine-sessions.mjs'
import { toObservation } from './import-harness-events.mjs'
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

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) process.exit(1)
console.log('SESSION MINER OK')
