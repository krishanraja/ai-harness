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
  assert.match(sync, /If either call fails or returns `ok: false`, stop here/)
})

test('the routine deletes exact names only and leaves every other skill', () => {
  assert.match(sync, /exactly equals a name from step 1/)
  assert.match(sync, /Leave every other skill alone/)
})

test('the routine never signs in for Krish and never copies page text into a report', () => {
  assert.match(sync, /Never type a password or sign in for Krish/)
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

test('no loader packages remain to go stale', () => {
  assert.ok(!existsSync(join(HARNESS, 'adapters/cloud/loaders')))
})

if (failed) { console.error(`${failed} failed`); process.exit(1) }
console.log('account sync cases passed')
