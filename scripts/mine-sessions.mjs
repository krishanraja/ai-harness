#!/usr/bin/env node
/**
 * The private session miner: what Krish's own sessions teach, distilled.
 *
 * Krish ruled on 2026-10-14 that his Claude Code and Codex session logs may be
 * mined privately so the brain learns how he works, not only what he writes
 * down. This is that miner. On his PC the nightly harness sync runs it once a
 * week (scripts/Invoke-SessionMiner.ps1); it can also run in a cloud scheduled
 * task over exported cloud sessions. It:
 *
 *   1. reads only lines it has not read before (a cursor kept outside the repo);
 *   2. picks a few excerpts deterministically: Krish correcting, preferring,
 *      repeating himself, or naming a skill that should have fired;
 *   3. redacts each excerpt (scripts/lib/redact.mjs) BEFORE any model sees it;
 *   4. asks a model with no tools to name the smallest lesson in each, or none;
 *   5. re-checks every lesson: redacted again, enums valid, short, no verbatim
 *      span of the excerpt, a related id only if it really exists;
 *   6. submits the envelopes idempotently: by default as a GitHub
 *      repository_dispatch through the gh login already on the machine, which
 *      scripts/intake-observations.mjs records; or to the hosted inbox.
 *
 * Raw text never leaves the machine except as a redacted excerpt sent to the
 * extractor, and nothing raw is ever written into the repository.
 *
 *   node scripts/mine-sessions.mjs --source claude-code|codex|events-json
 *        [--path <dir|file>] [--state <dir>] [--names <file>] [--dry-run]
 *        [--exclude-cwd <dir>] [--submit none|dispatch|post] [--self-test]
 *
 * The route comes from contract/learning-policy.yaml miner.submit (or --submit).
 * `post` needs HARNESS_EVENT_INGEST_URL and HARNESS_EVENT_INGEST_TOKEN. A cursor
 * moves only after every lesson was accepted.
 */

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { redact } from './lib/redact.mjs'
import { loadPolicy } from './propose.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const num = (v, d) => (v === undefined || v === null || v === '' ? d : Number(v))
const sha = (s) => createHash('sha256').update(String(s), 'utf8').digest('hex')
export const KINDS = new Set(['explicit_correction', 'failure', 'missed_trigger', 'false_trigger', 'repeated_manual_step', 'successful_pattern', 'contradiction', 'preference', 'friction'])
const SEVERITIES = new Set(['low', 'medium', 'high'])
const CONFIDENCES = new Set(['low', 'medium', 'high'])
const PRIVATE_SHAPE = /\b[A-Z]:\\(?:Users|Documents and Settings)\\|\/(?:Users|home)\/[^\s/]+\/|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i

// ------------------------------------------------------------------ parsing
const textOf = (content) => {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content.filter((c) => c && (c.type === 'text' || c.type === 'input_text' || c.type === 'output_text') && typeof c.text === 'string').map((c) => c.text).join('\n')
}

/** Claude Code transcript lines: user and assistant text turns only, never tool results. */
export function parseClaudeCode(lines) {
  const turns = []
  for (const line of lines) {
    let o
    try { o = JSON.parse(line) } catch { continue }
    if (!o || (o.type !== 'user' && o.type !== 'assistant') || o.isMeta) continue
    const role = o.message?.role || o.type
    const text = textOf(o.message?.content).trim()
    if (!text || text.startsWith('<')) continue
    turns.push({ role, text, at: o.timestamp || null, session: o.sessionId || null, cwd: o.cwd || null })
  }
  return turns
}

/** Codex rollout lines, both the response_item format and the older flat one. */
export function parseCodex(lines) {
  const turns = []
  let cwd = null
  let session = null
  for (const line of lines) {
    let o
    try { o = JSON.parse(line) } catch { continue }
    if (o?.type === 'session_meta') { cwd = o.payload?.cwd || cwd; session = o.payload?.id || session; continue }
    const p = o?.type === 'response_item' ? o.payload : o
    if (!p || p.type !== 'message' || (p.role !== 'user' && p.role !== 'assistant')) continue
    const text = textOf(p.content).trim()
    if (!text || text.startsWith('<')) continue
    turns.push({ role: p.role, text, at: o.timestamp || null, session, cwd })
  }
  return turns
}

/** Exported cloud sessions, already normalised by the cloud task to [{role, text, at, session}]. */
export function parseEvents(json) {
  const arr = Array.isArray(json) ? json : json?.turns || []
  return arr.filter((t) => t && (t.role === 'user' || t.role === 'assistant') && typeof t.text === 'string').map((t) => ({ role: t.role, text: t.text.trim(), at: t.at || null, session: t.session || null, cwd: null }))
}

// ---------------------------------------------------------------- selection
const MARKERS = [
  [/\b(no|nope|wrong|stop|don'?t|do not|not what i|that'?s not|i said|i told you|why did you|instead)\b/i, 3, 'correction'],
  [/\b(always|never|from now on|going forward|every time|each time|make sure)\b/i, 2, 'rule'],
  [/\b(i prefer|i want|i'?d rather|i like it when|please always)\b/i, 2, 'preference'],
  [/\b(again|i keep|still|manually|by hand|repeat(ed|ing)?)\b/i, 1, 'friction'],
  [/\b(skill|should have used|wrong skill|load the|use the)\b/i, 1, 'routing'],
]

export function scoreTurn(text) {
  let score = 0
  const hits = []
  for (const [re, w, tag] of MARKERS) if (re.test(text)) { score += w; hits.push(tag) }
  if (text.length < 12) score = 0
  return { score, hits }
}

/** The best excerpts: the assistant's last words, then Krish's reply that scored. */
export function selectExcerpts(turns, { max = 40, chars = 1200, names = [] } = {}) {
  const picks = []
  for (let i = 0; i < turns.length; i++) {
    const t = turns[i]
    if (t.role !== 'user') continue
    const { score, hits } = scoreTurn(t.text)
    if (score < 3) continue
    const prev = [...turns.slice(0, i)].reverse().find((x) => x.role === 'assistant')
    const before = prev ? prev.text.slice(-400) : ''
    const raw = `${before ? `ASSISTANT: ${before}\n` : ''}KRISH: ${t.text.slice(0, 800)}`
    const excerpt = redact(raw, { names }).slice(0, chars)
    picks.push({ index: i, score, hits, excerpt, at: t.at, session: t.session })
  }
  return picks.sort((a, b) => b.score - a.score).slice(0, max)
}

// ---------------------------------------------------------------- extraction
export function buildPrompt(excerpts) {
  return [
    'You read short, redacted excerpts from AI work sessions with Krish. For each, decide whether it teaches the AI something durable about how Krish works or wants work done.',
    'Return ONLY a JSON array. Each element: {"excerpt": <index>, "kind": one of explicit_correction|failure|missed_trigger|false_trigger|repeated_manual_step|successful_pattern|contradiction|preference|friction, "summary": the lesson in at most 280 characters, in your own words, with no names, paths, quotes or product details, "related_skill_or_rule": a harness skill name or null, "severity": low|medium|high, "confidence": low|medium|high}.',
    'Skip routine back-and-forth, one-off task details and anything you are unsure of. An empty array is a good answer.',
    '',
    ...excerpts.map((e, i) => `--- excerpt ${i}\n${e.excerpt}`),
  ].join('\n')
}

/**
 * How to start claude. Windows cannot start an npm shim (claude.cmd) without a
 * shell, so anything that is not an .exe goes through one there; the arguments
 * are fixed words, never input. HARNESS_CLAUDE_CLI names the executable when
 * it is not on PATH.
 */
export function claudeCommand({ cli = process.env.HARNESS_CLAUDE_CLI || 'claude', platform = process.platform } = {}) {
  return { file: cli, shell: platform === 'win32' && !/\.exe$/i.test(cli) }
}

/** Runs `claude -p` with no tools, from a working directory the miner never mines. */
export function claudeExtractor({ cwd }) {
  const { file, shell } = claudeCommand()
  return (prompt) => {
    mkdirSync(cwd, { recursive: true })
    const out = execFileSync(file, ['-p', '--output-format', 'text', '--disallowedTools', 'Bash,Read,Write,Edit,Glob,Grep,WebFetch,WebSearch,Task'], { cwd, input: prompt, encoding: 'utf8', maxBuffer: 1 << 24, timeout: 600000, shell })
    const start = out.indexOf('[')
    const end = out.lastIndexOf(']')
    return start === -1 || end === -1 ? [] : JSON.parse(out.slice(start, end + 1))
  }
}

/** Every 40-character window of the excerpt; a summary may not contain one. */
const verbatim = (summary, excerpt) => {
  const s = summary.toLowerCase()
  const e = excerpt.toLowerCase().replace(/\s+/g, ' ')
  for (let i = 0; i + 40 <= e.length; i += 5) if (s.includes(e.slice(i, i + 40))) return true
  return false
}

export function knownIds(root = HARNESS) {
  const ids = new Set(existsSync(join(root, 'skills')) ? readdirSync(join(root, 'skills')) : [])
  const rules = join(root, 'brain/rules.yaml')
  if (existsSync(rules)) for (const m of readFileSync(rules, 'utf8').matchAll(/^  - id: (.+)$/gm)) ids.add(m[1])
  return ids
}

export function validateObservation(o, excerpt, { names = [], known = new Set() } = {}) {
  if (!o || typeof o !== 'object') return { ok: false, why: 'not an object' }
  if (!KINDS.has(o.kind)) return { ok: false, why: `unknown kind ${o.kind}` }
  if (!SEVERITIES.has(o.severity) || !CONFIDENCES.has(o.confidence)) return { ok: false, why: 'bad severity or confidence' }
  const summary = redact(String(o.summary || ''), { names }).replace(/\s+/g, ' ').trim()
  if (summary.length < 20) return { ok: false, why: 'summary too short to be a lesson' }
  if (summary.length > 280) return { ok: false, why: 'summary over 280 characters' }
  if (PRIVATE_SHAPE.test(summary)) return { ok: false, why: 'private shape' }
  if (verbatim(summary, excerpt)) return { ok: false, why: 'quotes the excerpt verbatim' }
  const related = o.related_skill_or_rule && known.has(String(o.related_skill_or_rule)) ? String(o.related_skill_or_rule) : null
  return { ok: true, value: { kind: o.kind, summary, related_skill_or_rule: related, severity: o.severity, confidence: o.confidence } }
}

export function toEnvelope(v, { surface, session, index, at }) {
  const locator = sha(`${session || 'unknown'}#${index}`).slice(0, 16)
  return {
    event_id: `session-miner:${surface}:${sha(`${locator}\u0000${v.kind}\u0000${v.summary}`).slice(0, 24)}`,
    schema_version: 1,
    occurred_at: at || new Date().toISOString(),
    surface,
    kind: v.kind,
    summary: v.summary,
    evidence_ref: `session:${locator}`,
    related_skill_or_rule: v.related_skill_or_rule,
    outcome: v.kind === 'explicit_correction' ? 'corrected' : v.kind === 'successful_pattern' ? 'succeeded' : v.kind === 'failure' ? 'failed' : 'unknown',
    severity: v.severity,
    confidence: v.confidence,
  }
}

/** One mining pass over turns. The extractor is injected, so the whole pass is testable. */
export function mine(turns, { surface, extract, names = [], known = knownIds(), policy = loadPolicy() }) {
  const excerpts = selectExcerpts(turns, { max: num(policy.miner?.excerpts_per_week, 40), chars: num(policy.miner?.excerpt_chars, 1200), names })
  if (!excerpts.length) return { excerpts, prompt: null, envelopes: [], rejected: [] }
  const prompt = buildPrompt(excerpts)
  let raw = []
  try { raw = extract(prompt) } catch (e) { return { excerpts, prompt, envelopes: [], rejected: [], extractorError: String(e.message).split('\n')[0].slice(0, 160) } }
  const envelopes = []
  const rejected = []
  for (const o of Array.isArray(raw) ? raw : []) {
    const ex = excerpts[Number(o?.excerpt)]
    if (!ex) { rejected.push('no such excerpt'); continue }
    const r = validateObservation(o, ex.excerpt, { names, known })
    if (!r.ok) { rejected.push(r.why); continue }
    envelopes.push(toEnvelope(r.value, { surface, session: ex.session, index: ex.index, at: ex.at }))
  }
  return { excerpts, prompt, envelopes: envelopes.slice(0, num(policy.miner?.posts_per_run, 50)), rejected }
}

export async function post(envelopes, { url, token, fetchImpl = fetch }) {
  let sent = 0
  const failures = []
  for (const e of envelopes) {
    const res = await fetchImpl(url, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(e) })
    if (res.status >= 200 && res.status < 300) sent++
    else if (res.status === 409) continue
    else failures.push(`${res.status}`)
  }
  return { sent, failures }
}

export const DISPATCH_REPO = 'krishanraja/ai-harness'
export const DISPATCH_EVENT = 'harness-observations'
const DISPATCH_CHUNK = 20

/**
 * Send envelopes as repository_dispatch events through the gh CLI, 20 per
 * event, to scripts/intake-observations.mjs. gh resolves without a shell on
 * every platform and reuses the machine's existing GitHub login, so this route
 * needs no key of its own (Ruling, Krish, 2026-10-15: redacted lessons may be
 * stored in the public ledger).
 */
export function dispatch(envelopes, { repo = DISPATCH_REPO, run = execFileSync } = {}) {
  let sent = 0
  const failures = []
  for (let i = 0; i < envelopes.length; i += DISPATCH_CHUNK) {
    const events = envelopes.slice(i, i + DISPATCH_CHUNK)
    const body = JSON.stringify({ event_type: DISPATCH_EVENT, client_payload: { producer: 'session-miner', events } })
    try {
      run('gh', ['api', '--method', 'POST', `repos/${repo}/dispatches`, '--input', '-'], { input: body, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 60000 })
      sent += events.length
    } catch (e) {
      failures.push(String(e.stderr || e.message).split('\n')[0].slice(0, 160))
    }
  }
  return { sent, failures }
}

// ---------------------------------------------------------------- reading
function files(dir, test) {
  if (!existsSync(dir)) return []
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) out.push(...files(p, test))
    else if (test(name)) out.push(p)
  }
  return out
}

export function defaultStateDir() {
  const base = process.env.LOCALAPPDATA || join(homedir(), '.local', 'state')
  return join(base, 'krish-harness', 'session-miner')
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const args = process.argv.slice(2)
  const flag = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1] }
  const policy = loadPolicy()
  if (policy.miner?.enabled === false && !args.includes('--self-test')) { console.log('session miner: disabled in contract/learning-policy.yaml; nothing read.'); process.exit(0) }
  const names = flag('--names') && existsSync(flag('--names')) ? readFileSync(flag('--names'), 'utf8').split('\n').map((l) => l.trim()).filter(Boolean) : []

  if (args.includes('--self-test')) {
    // A planted secret, email, name and path, and a stub extractor that leaks
    // the excerpt straight back: nothing planted may survive into an envelope.
    const planted = { secret: ['sk', 'ant', 'x'.repeat(28)].join('-'), email: ['someone', 'example.org'].join('@'), name: 'Dana Whitlock', path: ['C:', 'Users', 'someone', 'notes.txt'].join('\\') }
    const turns = [
      { role: 'assistant', text: `Done. I used ${planted.path} and emailed ${planted.email}.`, session: 's1' },
      { role: 'user', text: `No, that is wrong, never use my key ${planted.secret} and do not copy ${planted.name} on anything again.`, session: 's1' },
    ]
    let seen = ''
    const r = mine(turns, { surface: 'claude-code', names: ['Dana Whitlock'], extract: (prompt) => { seen = prompt; return [{ excerpt: 0, kind: 'explicit_correction', summary: `Never put a credential or a third party into shared work; Krish said ${planted.secret} ${planted.email} ${planted.name}.`, severity: 'high', confidence: 'high' }] } })
    const blob = seen + JSON.stringify(r.envelopes)
    const leaked = Object.entries(planted).filter(([, v]) => blob.includes(v)).map(([k]) => k)
    console.log(leaked.length ? `SELF-TEST FAILED: leaked ${leaked.join(', ')}` : `SELF-TEST OK: ${r.envelopes.length} envelope(s), nothing planted survived.`)
    process.exit(leaked.length ? 1 : 0)
  }

  // Where lessons go is a decision, not a default: contract/learning-policy.yaml
  // miner.submit. Until one is chosen a real run reads nothing (exit 3, which
  // the PC wrapper reports as degraded); a dry run still shows what it would learn.
  const route = flag('--submit') || policy.miner?.submit || 'none'
  if (route === 'none' && !args.includes('--dry-run')) { console.log('session miner: no submission route is chosen (contract/learning-policy.yaml miner.submit is none); nothing read.'); process.exit(3) }
  const source = flag('--source')
  const surface = { 'claude-code': process.env.CLAUDE_CODE_REMOTE === 'true' ? 'claude-code-web' : 'claude-code', codex: 'codex', 'events-json': 'claude-code-web' }[source]
  if (!surface) { console.error('usage: mine-sessions.mjs --source claude-code|codex|events-json [--path <dir|file>] [--dry-run]'); process.exit(2) }
  const stateDir = resolve(flag('--state') || defaultStateDir())
  mkdirSync(stateDir, { recursive: true })
  const cursorPath = join(stateDir, `cursor-${source}.json`)
  const cursor = existsSync(cursorPath) ? JSON.parse(readFileSync(cursorPath, 'utf8')) : {}
  const excludeCwd = resolve(flag('--exclude-cwd') || join(tmpdir(), 'krish-session-miner'))
  let turns = []
  const nextCursor = { ...cursor }
  if (source === 'events-json') {
    turns = parseEvents(JSON.parse(readFileSync(resolve(flag('--path')), 'utf8')))
  } else {
    const root = resolve(flag('--path') || (source === 'codex' ? join(homedir(), '.codex', 'sessions') : join(homedir(), '.claude', 'projects')))
    for (const f of files(root, (n) => n.endsWith('.jsonl'))) {
      const lines = readFileSync(f, 'utf8').split('\n').filter(Boolean)
      const from = cursor[f] || 0
      if (lines.length <= from) continue
      const parsed = (source === 'codex' ? parseCodex : parseClaudeCode)(lines.slice(from))
      turns.push(...parsed.filter((t) => !t.cwd || resolve(t.cwd) !== excludeCwd))
      nextCursor[f] = lines.length
    }
  }
  const r = mine(turns, { surface, names, extract: claudeExtractor({ cwd: excludeCwd }) })
  console.log(`session miner (${source}): ${turns.length} new turns, ${r.excerpts.length} excerpt(s), ${r.envelopes.length} lesson(s), ${r.rejected.length} rejected.`)
  // An extractor that could not run used to save the cursor with zero lessons,
  // which skipped those sessions for good and reported a healthy run.
  if (r.extractorError) { console.error(`::error::claude could not read the excerpts (${r.extractorError}); nothing was sent and the cursor did not move.`); process.exit(1) }
  if (args.includes('--dry-run')) { for (const e of r.envelopes) console.log(`  ${e.kind}: ${e.summary}`); process.exit(0) }
  const url = process.env.HARNESS_EVENT_INGEST_URL
  const token = process.env.HARNESS_EVENT_INGEST_TOKEN
  if (route !== 'post' && route !== 'dispatch') { console.error(`::error::unknown submission route ${route}; nothing was sent and the cursor did not move.`); process.exit(2) }
  if (route === 'post' && r.envelopes.length && (!url || !token)) { console.error('::error::HARNESS_EVENT_INGEST_URL and HARNESS_EVENT_INGEST_TOKEN are needed to submit; nothing was sent and the cursor did not move.'); process.exit(1) }
  const p = !r.envelopes.length ? { sent: 0, failures: [] } : route === 'post' ? await post(r.envelopes, { url, token }) : dispatch(r.envelopes)
  if (p.failures.length) { console.error(`::error::${p.failures.length} submission(s) failed (${p.failures.join(', ')}); the cursor did not move.`); process.exit(1) }
  writeFileSync(cursorPath, JSON.stringify(nextCursor, null, 2) + '\n')
  console.log(`submitted ${p.sent} by ${route}; cursor saved outside the repository.`)
}
