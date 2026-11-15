#!/usr/bin/env node
/**
 * The codex_thread copies check finds what it promises to find (Ruling, Krish,
 * 2026-11-15; docs/proposals/2026-11-15-visible-codex-sessions.md). No network:
 * GitHub is a stub that answers only the reads the check makes.
 */

import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TOOL_PATH, DISPATCH_PATHS, canonical, namesPluginServer, findingsFor, readFleet, report } from './codex-thread-copies.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
let passed = 0, failed = 0
const test = (name, condition) => { if (condition) passed++; else failed++; console.log(`${condition ? 'ok  ' : 'FAIL'}  ${name}`) }

const canon = canonical()
test('the canonical tool is in ai-harness at scripts/codex_thread.mjs', canon.startsWith('#!/usr/bin/env node'))
test('its header names ai-harness as the canonical copy', /Canonical copy: krishanraja\/ai-harness scripts\/codex_thread\.mjs/.test(canon.split('\n').slice(0, 20).join('\n')))
test('it no longer says content-engine holds the source', !canon.includes('content-engine holds the source'))
test('the canonical tool itself names no plugin server', !namesPluginServer(canon))
test('the tool has no em dash', !canon.includes('—'))

test('a plugin background task is caught', namesPluginServer('node <plugin>/scripts/codex-companion.mjs task --background --fresh'))
test('the broker is caught', namesPluginServer('starts app-server-broker on login'))
test('codex_thread open is not', !namesPluginServer('node scripts/codex_thread.mjs open "card"'))

test('an identical copy has no finding', findingsFor('growth-mindmake', { copy: canon, dispatch: {} }, canon).length === 0)
test('one changed byte is a finding', findingsFor('growth-heartside', { copy: canon + ' ', dispatch: {} }, canon)[0]?.kind === 'differs')
test('a CRLF copy is a finding', findingsFor('growth-heartside', { copy: canon.replace(/\n/g, '\r\n'), dispatch: {} }, canon)[0]?.kind === 'differs')
test('a dispatching repository with no copy is missing', findingsFor('growth-legibility', { copy: null, dispatch: {} }, canon)[0]?.kind === 'missing')
test('a repository that starts no Codex need not carry it', findingsFor('sendlinks', { copy: null, dispatch: {} }, canon).length === 0)
test('a repository that starts no Codex but carries a stale copy is caught', findingsFor('sendlinks', { copy: 'old', dispatch: {} }, canon)[0]?.kind === 'differs')
test('a dispatch path naming the plugin server is caught',
  findingsFor('growth-mindmake', { copy: canon, dispatch: { 'scripts/dispatch-card.mjs': 'node x/scripts/codex-companion.mjs task --background' } }, canon)[0]?.kind === 'plugin_server')
test('every repository that already carries the tool is a dispatcher', ['content-engine', 'growth-heartside', 'growth-makeyourmindup', 'growth-mindmake', 'growth-legibility'].every((r) => Object.hasOwn(DISPATCH_PATHS, r)))

// readFleet with a stub GitHub: GET only, by repository and path.
const files = {
  'content-engine': { [TOOL_PATH]: canon, 'scripts/velib/cards.py': 'CODEX_THREAD = scripts/codex_thread.mjs' },
  'growth-heartside': { [TOOL_PATH]: canon },
  'growth-makeyourmindup': { [TOOL_PATH]: canon.replace('Canonical copy', 'Old copy') },
  'growth-mindmake': { [TOOL_PATH]: canon, 'scripts/dispatch-card.mjs': 'node p/scripts/codex-companion.mjs task --background' },
  'growth-legibility': { 'docs/ENGINE-ARCHITECTURE.md': 'codex_thread open' },
  sendlinks: {},
}
const gh = {
  async defaultBranch(repo) { if (repo === 'broken') { const e = new Error('no'); e.status = 403; throw e } return { branch: 'main', fullName: `krishanraja/${repo}` } },
  async getFile(repo, path, ref) { if (ref !== 'main') throw new Error('wrong ref'); const t = files[repo]?.[path]; return t == null ? null : { sha: 'x', text: t } },
  async req() { throw new Error('the check must not write') },
}
const fleet = { owner: 'krishanraja', repos: [{ name: 'ai-harness' }, { name: 'sendlinks' }, { name: 'broken' }] }
const r = await readFleet(gh, fleet, canon)
const kinds = r.findings.map((f) => `${f.repo}:${f.kind}`).sort()
test('the fleet read finds exactly the planted faults',
  JSON.stringify(kinds) === JSON.stringify(['growth-legibility:missing', 'growth-makeyourmindup:differs', 'growth-mindmake:plugin_server']))
test('ai-harness is never compared with itself', !r.checked.includes('ai-harness'))
test('an unreadable repository is reported, never passed', r.unreadable.some((u) => u.repo === 'broken' && u.reason === 'github-403'))
const one = await readFleet(gh, fleet, canon, { only: 'growth-heartside' })
test('--repo reads one repository', one.checked.length === 1 && one.findings.length === 0)
const lines = report(r)
test('the report says each finding in a line', lines.filter((l) => l.startsWith('FAIL')).length === 4)

// The steward runs this on every push.
const steward = readFileSync(join(HARNESS, '.github/workflows/harness-steward.yml'), 'utf8')
test('the steward workflow runs this test', /node scripts\/test-codex-thread-copies\.mjs/.test(steward))

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
