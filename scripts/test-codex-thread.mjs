#!/usr/bin/env node
/**
 * codex_thread.mjs never fails silently, finds a runnable codex on Windows, and queues a send for Codex Desktop when
 * Desktop holds the thread (Ruling, Krish, 2026-11-17: Claude keeps two-way access to every Codex thread it opens while
 * Krish uses it in Desktop). No network and no real Codex: a fake codex, written here, plays the app-server and
 * `codex queue`, and the real script runs against it as a child process.
 */

import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, win32 } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs, resolveCodex, isActiveWriterError, queuedTurnResult, QUEUE_INLINE_MAX } from './codex_thread.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const SCRIPT = join(HARNESS, 'scripts/codex_thread.mjs')
let passed = 0, failed = 0
const test = (name, condition) => { if (condition) passed++; else failed++; console.log(`${condition ? 'ok  ' : 'FAIL'}  ${name}`) }

// ---- pure parts ---------------------------------------------------------------------------------------------------

const o = parseArgs(['send', '--wait', '--timeout', '30', 'T', 'hi', '--prompt-file', 'f'])
test('--wait and --timeout parse, the rest stays positional', o.wait === true && o.timeout === '30' && o.promptFile === 'f' && o.positional.join(' ') === 'send T hi')

const npmDir = 'C:\\Users\\k\\AppData\\Roaming\\npm'
const npmExe = win32.join(npmDir, 'node_modules', '@openai', 'codex', 'node_modules', '@openai', 'codex-win32-x64', 'vendor', 'x86_64-pc-windows-msvc', 'bin', 'codex.exe')
const desktopExe = win32.join('C:\\Users\\k', '.codex', 'packages', 'app-server-daemon', 'current', 'bin', 'codex.exe')
const on = (...files) => (f) => files.includes(f)
const win = (exists, PATH = `C:\\Windows;${npmDir}`) => resolveCodex({ env: { PATH }, platform: 'win32', arch: 'x64', homedir: 'C:\\Users\\k', exists })
test('Windows: the native codex.exe behind npm codex.cmd, never the .cmd shim', win(on(win32.join(npmDir, 'codex.cmd'), npmExe)).command === npmExe)
test('Windows: Codex Desktop\'s own codex.exe when npm has none', win(on(win32.join(npmDir, 'codex.cmd'), desktopExe)).command === desktopExe)
test('Windows: a codex.exe on PATH', win(on('C:\\tools\\codex.exe'), 'C:\\tools').command === 'C:\\tools\\codex.exe')
let threw = ''
try { win(() => false) } catch (e) { threw = e.message }
test('Windows: no runnable codex is a one-line reason, not a hang', /no runnable codex\.exe found/.test(threw) && !threw.includes('\n'))
test('elsewhere: codex on PATH', resolveCodex({ env: { PATH: '/usr/bin:/opt/bin' }, platform: 'linux', exists: on('/opt/bin/codex') }).command === '/opt/bin/codex')
test('CODEX_THREAD_BIN runs a .mjs fake on this node', resolveCodex({ env: { CODEX_THREAD_BIN: 'x.mjs' }, exists: () => true }).prefix[0] === 'x.mjs')

test('the active-writer refusal is recognised', isActiveWriterError(new Error('codex_thread: thread 01a already has an active writer')))
test('another error is not', !isActiveWriterError(new Error('thread not found')))

const ev = (payload) => ({ type: 'event_msg', payload })
const user = (turn, text) => ev({ type: 'item_completed', turn_id: turn, item: { type: 'UserMessage', content: [{ type: 'text', text }] } })
const done = (turn, msg) => ev({ type: 'task_complete', turn_id: turn, last_agent_message: msg })
test('a queued turn is not done before it completes', queuedTurnResult([user('a', 'mine')], 'mine') === null)
test('the queued turn is found by its text and returns Codex\'s last message', queuedTurnResult([user('a', 'mine'), done('a', 'ok')], 'mine')?.message === 'ok')
test('another message queued earlier is never taken for ours',
  queuedTurnResult([ev({ type: 'task_started', turn_id: 'x', turn_attribution: { turn_trigger: 'queue' } }), user('x', 'theirs'), done('x', 'not mine')], 'mine') === null)
test('an aborted turn is reported, not waited on forever',
  queuedTurnResult([user('a', 'mine'), ev({ type: 'turn_aborted', turn_id: 'a', reason: 'interrupted' })], 'mine')?.status === 'interrupted')

// ---- the script against a fake codex ------------------------------------------------------------------------------

const dir = mkdtempSync(join(tmpdir(), 'codex-thread-test-'))
const home = join(dir, 'home')
mkdirSync(join(home, 'sessions'), { recursive: true })
const fake = join(dir, 'fake-codex.mjs')
writeFileSync(fake, `
import fs from 'node:fs'; import path from 'node:path'; import readline from 'node:readline'
const home = process.env.CODEX_HOME, mode = process.env.FAKE_MODE || ''
const [cmd, ...args] = process.argv.slice(2)
const session = (id) => path.join(home, 'sessions', 'rollout-' + id + '.jsonl')
const line = (o) => JSON.stringify(o) + '\\n'
if (cmd === 'queue') {
  const id = args[args.indexOf('--thread') + 1], text = args[args.indexOf('--message') + 1]
  fs.writeFileSync(path.join(home, 'queued.txt'), text)
  setTimeout(() => fs.appendFileSync(session(id),
    line({ type: 'event_msg', payload: { type: 'task_started', turn_id: 'q1', turn_attribution: { turn_trigger: 'queue' } } }) +
    line({ type: 'event_msg', payload: { type: 'item_completed', turn_id: 'q1', item: { type: 'UserMessage', content: [{ type: 'text', text }] } } }) +
    line({ type: 'event_msg', payload: { type: 'task_complete', turn_id: 'q1', last_agent_message: 'desktop ran it' } })), 300)
  // A real queue returns at once; Desktop runs the turn later. Keep the writer alive briefly, detached from us.
  setTimeout(() => process.exit(0), 400)
} else if (cmd === 'app-server') {
  if (mode === 'die') process.exit(3)
  const send = (o) => process.stdout.write(JSON.stringify(o) + '\\n')
  readline.createInterface({ input: process.stdin }).on('line', (l) => {
    const m = JSON.parse(l)
    if (m.method === 'initialize') send({ id: m.id, result: {} })
    if (m.method === 'thread/start') { fs.writeFileSync(session('T1'), line({ type: 'session_meta', payload: { id: 'T1', cwd: process.cwd() } })); send({ id: m.id, result: { thread: { id: 'T1' } } }) }
    if (m.method === 'thread/name/set') send({ id: m.id, result: {} })
    if (m.method === 'thread/resume') send(mode === 'held' ? { id: m.id, error: { code: -32600, message: 'codex_thread: thread T1 already has an active writer' } } : { id: m.id, result: {} })
    if (m.method === 'turn/start') {
      if (mode === 'die-mid-turn') process.exit(4)
      send({ id: m.id, result: {} })
      send({ method: 'item/completed', params: { threadId: m.params.threadId, item: { type: 'agentMessage', text: 'direct reply' } } })
      send({ method: 'turn/completed', params: { threadId: m.params.threadId, turn: { status: 'completed' } } })
    }
  })
} else process.exit(9)
`)
const run = (args, mode = '', bin = fake) => spawnSync(process.execPath, [SCRIPT, ...args, '--home', home, '--cwd', dir], {
  env: { ...process.env, CODEX_THREAD_BIN: bin, FAKE_MODE: mode }, encoding: 'utf8', timeout: 30000,
})

let r = run(['open', 'first message'])
test('open prints the thread id and Codex\'s reply', r.status === 0 && /thread T1/.test(r.stdout) && /direct reply/.test(r.stdout))

r = run(['open', 'x'], 'die')
test('an app-server that dies at once exits non-zero with a reason, never silently', r.status === 1 && /codex_thread: codex app-server exited \(3\)/.test(r.stderr))
r = run(['send', 'T1', 'x'], 'die-mid-turn')
test('an app-server that dies mid-turn exits non-zero with a reason', r.status === 1 && /exited \(4\)/.test(r.stderr))
r = run(['open', 'x'], '', join(dir, 'missing-codex.exe'))
test('a missing codex binary exits non-zero with a reason', r.status === 1 && /does not exist/.test(r.stderr))
r = run(['open', 'x'], '', dir)
test('a codex that cannot be spawned exits non-zero with a reason (the Windows ENOENT case)', r.status === 1 && /could not run .* app-server/.test(r.stderr))

r = run(['send', 'T1', 'a free thread'])
test('send to a free thread runs the turn directly, as before', r.status === 0 && /released/.test(r.stdout) && /direct reply/.test(r.stdout))

const tricky = 'Desktop holds it: "quotes" & ampersands | pipes %PATH% ^carets \\\\ back\\slashes\nsecond line'
r = run(['send', 'T1', tricky], 'held')
test('send to a thread Desktop holds is queued, not refused', r.status === 0 && /queued for the Codex Desktop writer/.test(r.stdout))
test('the queued message arrives byte for byte', readFileSync(join(home, 'queued.txt'), 'utf8') === tricky)

r = run(['send', '--wait', '--timeout', '20', 'T1', 'wait for me'], 'held')
test('send --wait returns the queued turn\'s last message', r.status === 0 && /ran in Codex Desktop/.test(r.stdout) && /desktop ran it/.test(r.stdout))

r = run(['send', '--json', 'T1', 'x'.repeat(QUEUE_INLINE_MAX + 10)], 'held')
const out = JSON.parse(r.stdout || '{}')
test('a message too long for one command line is queued as a file the turn reads', r.status === 0 && out.status === 'queued' && out.file
  && readFileSync(out.file, 'utf8').length === QUEUE_INLINE_MAX + 10 && readFileSync(join(home, 'queued.txt'), 'utf8').includes(out.file))

rmSync(dir, { recursive: true, force: true })

// The steward runs this on every push.
const steward = readFileSync(join(HARNESS, '.github/workflows/harness-steward.yml'), 'utf8')
test('the steward workflow runs this test', /node scripts\/test-codex-thread\.mjs/.test(steward))

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
