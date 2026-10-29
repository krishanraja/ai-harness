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

const sync = read('adapters/cloud/account-sync.md')
const instructions = read('adapters/cloud/account-instructions.md')

test('the routine reads its delete list live from get_skill index, and stops if it cannot', () => {
  assert.match(sync, /`get_skill` with name `index`/)
  assert.match(sync, /only ones you may ever delete/)
  assert.match(sync, /either call fails or returns `ok: false`, stop with `control-center-unavailable`/)
})

test('the routine deletes exact names only and leaves every other skill', () => {
  assert.match(sync, /exactly equals a name from step 1/)
  assert.match(sync, /Leave every other skill alone/)
})

test('the routine never signs in for Krish and never copies page text into a report', () => {
  assert.match(sync, /Never type a password, a code or an email, and never sign in or out for Krish/)
  assert.match(sync, /Never include names of people, email addresses, or text copied from the page/)
})

test('the routine pastes exactly the served instructions and reads them back', () => {
  assert.match(sync, /name `account` and file `instructions`/)
  assert.match(sync, /read the field back/)
})

test('the routine carries both rulings that authorise it', () => {
  assert.match(sync, /Ruling \(Krish, 2026-10-29\): a Claude routine in each account keeps it in sync/)
  assert.match(sync, /Ruling \(Krish, 2026-10-29\): the routine may delete/)
})

test('the account instructions load skills through get_skill, not installed copies', () => {
  assert.match(instructions, /served live by the Control Center connector, not installed here/)
  assert.match(instructions, /get_skill/)
})

test('every run starts from a fresh tab at the skills page, never the page a tab happens to show', () => {
  assert.match(sync, /Assume no tab is open/)
  assert.match(sync, /Open a new tab at `https:\/\/claude\.ai\/customize\/skills`/)
  assert.match(sync, /never work from whatever page a tab happens to show/)
})

test('the routine acts only on an account Control Center confirms is Krish\'s, before changing anything', () => {
  assert.match(sync, /Prove the browser is signed in to one of Krish's accounts/)
  assert.match(sync, /Call Control Center `check_krish_account` with that email/)
  assert.match(sync, /stop with `not-krish-account`/)
  assert.match(sync, /stop with `account-unproven`/)
  assert.ok(sync.indexOf('## 3. Prove') < sync.indexOf('## 4. Remove'), 'the account is proved before any deletion')
  assert.ok(sync.indexOf('## 3. Prove') < sync.indexOf('## 5. Make'), 'the account is proved before the instructions change')
})

test('the report names the synced account by reference, never by email or task label', () => {
  assert.match(sync, /the `account_ref` from step 3/)
  assert.ok(!/account label from your own task prompt/.test(sync))
})

test('the routine handles a missing browser, a lazy list and a delete confirmation', () => {
  assert.match(sync, /stop with `no-browser`/)
  assert.match(sync, /scroll to the end of the list/)
  assert.match(sync, /check that it names that same skill/)
  assert.match(sync, /safe to repeat/)
})

test('no loader packages remain to go stale', () => {
  assert.ok(!existsSync(join(HARNESS, 'adapters/cloud/loaders')))
})

if (failed) { console.error(`${failed} failed`); process.exit(1) }
console.log('account sync cases passed')
