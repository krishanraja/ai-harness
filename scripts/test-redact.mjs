#!/usr/bin/env node
/**
 * Redaction removes what it promises to, keeps ordinary prose, and stays in
 * step with the PowerShell secret patterns. Planted values are assembled at run
 * time so no secret-shaped literal is ever committed.
 */

import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { POWERSHELL_PATTERNS, redact } from './lib/redact.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
let passed = 0
let failed = 0
const test = (name, condition) => {
  if (condition) passed += 1
  else failed += 1
  console.log(`${condition ? 'ok  ' : 'FAIL'}  ${name}`)
}

for (const file of ['scripts/Test-Harness.ps1', 'scripts/Export-DecisionLedgerSnapshot.ps1']) {
  const text = readFileSync(join(HARNESS, file), 'utf8')
  const start = text.indexOf('$secretPatterns = [ordered]@{')
  const block = text.slice(start, text.slice(start).search(/\r?\n\s*\}\s*\r?\n/) + start)
  const ps = Object.fromEntries([...block.matchAll(/^\s*(\w+) = '\(\?i\)(.+)'\s*$/gm)].map((m) => [m[1], m[2]]))
  test(`${file} patterns are byte-identical to lib/redact.mjs`, Object.keys(ps).length === 5 && Object.entries(ps).every(([k, v]) => POWERSHELL_PATTERNS[k] === v))
}

const a = (n, c = 'a') => c.repeat(n)
const planted = {
  github: `gh${'p'}_${a(30, 'A')}`,
  vercel: `vc${'p'}_${a(24)}`,
  supabase: `sb${'p'}_${a(24)}`,
  generic: `s${'k'}_${a(24)}`,
  jwt: `ey${'J'}${a(24)}.${a(24)}.${a(24)}`,
  anthropic: ['sk', 'ant', 'api03', a(30)].join('-'),
  openai: ['sk', 'proj', a(30)].join('-'),
  aws: `AK${'IA'}${'ABCDEFGHIJKLMNOP'}`,
  slack: `xo${'xb'}-${a(20, '1')}`,
  bearer: `Bearer ${a(30, 'b')}`,
  urlcred: `https://user:${a(12, 'p')}@example.invalid/x`,
  keyvalue: `api_key=${a(16, 'k')}`,
  entropy: `${a(20, 'Q')}9${a(20, 'z')}`,
}
for (const [k, v] of Object.entries(planted)) test(`removes a planted ${k} secret`, !redact(`before ${v} after`).includes(v.replace(/^Bearer /, '')))
test('removes an email address', !redact(`mail ${['someone', 'example.org'].join('@')} now`).includes('example.org'))
test('removes a Windows home path', !redact(`at ${['C:', 'Users', 'someone', 'x.txt'].join('\\')} today`).includes('someone'))
test('removes a home directory path', !redact('see /home/someone/notes and ~/private/file').match(/someone|private/))
test('strips a URL query string', redact('open https://example.invalid/page?token=abc&x=1').endsWith('https://example.invalid/page'))
test('removes an @handle', !redact('ping @someone-else about it').includes('someone-else'))
test('removes a name on the local list', !redact('send it to dana today', { names: ['Dana'] }).toLowerCase().includes('dana'))
test('removes a capitalised name pair mid-sentence', !redact('I asked Priya Natarajan to look.').includes('Natarajan'))
test('keeps allowlisted product names', redact('Use Control Center and Claude Code for Krish Raja.') === 'Use Control Center and Claude Code for Krish Raja.')
const prose = 'Never report a green check as an outcome without reading the body.'
test('leaves ordinary prose alone', redact(prose) === prose)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) process.exit(1)
console.log('REDACT OK')
