#!/usr/bin/env node
/**
 * The claude.ai account routine and the text it pastes stay within their
 * authority (Ruling, Krish, 2026-10-29: a Claude routine in each account
 * keeps it in sync, and may delete only uploaded copies of the harness's
 * production skills). Dependency-free, no credential, no network.
 */

import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const read = (p) => readFileSync(join(HARNESS, p), 'utf8')
let failed = 0
function test(name, fn) {
  try { fn(); console.log(`ok     ${name}`) } catch (e) { failed++; console.error(`FAIL   ${name}\n       ${e.message}`) }
}

const sync = read('adapters/cloud/account-setup.md')
const routing = read('adapters/cloud/account-routing.md')
const instructions = read('adapters/cloud/account-instructions.md')

test('the routine reads its delete list live from get_skill index, and stops if it cannot', () => {
  assert.match(sync, /`get_skill` with name `index`/)
  assert.match(sync, /only ones that may be deleted/)
  assert.match(sync, /either call fails or returns `ok: false`, stop with `control-center-unavailable`/)
})

test('the routine deletes exact names only and leaves every other skill', () => {
  assert.match(sync, /exactly equals a name from step 1/)
  assert.match(sync, /Every other skill stays/)
})

test('the routine never signs in for Krish and never copies page text into a report', () => {
  assert.match(sync, /Never type a password, a code or an email, and never sign in or out for Krish/)
  assert.match(sync, /Never include names of people, email addresses, or text copied from the page/)
})

test('the setup pastes exactly the served pointer and reads it back', () => {
  assert.match(sync, /name `account` and file `instructions`/)
  assert.match(sync, /save, reload, and read it back/)
})

test('nothing changes until Krish says yes to the exact list in the chat', () => {
  assert.match(sync, /Show Krish exactly what will change, and wait for his yes/)
  assert.match(sync, /Change nothing until he says yes/)
  assert.ok(sync.indexOf('## 4. Show Krish') < sync.indexOf('## 5. Make the approved change'), 'approval comes before any change')
  assert.match(sync, /There is no recurring job/)
})

test('the setup carries both rulings that authorise it', () => {
  assert.match(sync, /Ruling \(Krish, 2026-10-29\): skills stay current on every surface with zero intervention/)
  assert.match(sync, /Ruling \(Krish, 2026-10-29\): uploaded skills whose names are exactly the harness's production skills may be deleted/)
})

test('the instructions field is a fixed pointer that loads the routing live', () => {
  assert.match(instructions, /served live by the Control Center connector, not installed here/)
  assert.match(instructions, /this text never needs to change/)
  assert.match(instructions, /name "account" and file "routing"/)
  for (const core of ['krish-principles', 'strategy-brief', 'verification-loop', 'take-the-brief']) assert.ok(instructions.includes(core), core)
})

test('the pointer loads the routing on every conversation, short tasks included', () => {
  // 2026-10-29 e2e: "substantive" let one-line edits, a code fix, a correction and a decision recall skip routing.
  assert.match(instructions, /At the start of every conversation, short tasks included/)
  assert.match(instructions, /skip it only when the whole message is a greeting or thanks/)
  assert.doesNotMatch(instructions, /substantive/)
})

test('the served routing names every production skill, so the pointer never has to', () => {
  const registry = read('state/skill-registry.yaml')
  const block = registry.match(/^production_active:\n((?:  - .+\n)+)/m)
  assert.ok(block, 'production_active readable')
  for (const name of block[1].trim().split('\n').map((l) => l.trim().slice(2).trim())) {
    assert.ok(new RegExp(`(?<![a-z-])${name}(?![a-z-])`).test(routing), `routing names ${name}`)
  }
})

test('every run starts from a fresh tab at the skills page, never the page a tab happens to show', () => {
  assert.match(sync, /no tab is open and no page is loaded/)
  assert.match(sync, /Open a new tab at `https:\/\/claude\.ai\/customize\/skills`/)
  assert.match(sync, /never work from whatever page a tab happens to show/)
})

test('the setup acts only on an account proved to be Krish\'s, before changing anything', () => {
  assert.match(sync, /Prove the browser is signed in to one of Krish's accounts/)
  assert.match(sync, /If Control Center offers `check_krish_account`, call it with that email/)
  assert.match(sync, /ask Krish to confirm, in this chat, that the account shown is his/)
  assert.match(sync, /stop with `not-krish-account`/)
  assert.match(sync, /stop with `account-unproven`/)
  assert.ok(sync.indexOf('## 3. Prove') < sync.indexOf('## 5. Make'), 'the account is proved before any change')
})

test('the report never carries the email', () => {
  assert.match(sync, /Never copy the email into a report or anywhere else/)
})

test('the routine handles a missing browser, a lazy list and a delete confirmation', () => {
  assert.match(sync, /stop with `no-browser`/)
  assert.match(sync, /Scroll to the end of the list/)
  assert.match(sync, /check that the list lost exactly that one name/)
  assert.match(sync, /safe to run again/)
})

test('no loader packages remain to go stale', () => {
  assert.ok(!existsSync(join(HARNESS, 'adapters/cloud/loaders')))
})

if (failed) { console.error(`${failed} failed`); process.exit(1) }
console.log('account sync cases passed')
