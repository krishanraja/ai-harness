#!/usr/bin/env node
/**
 * What must never be in this public repository: a key, a JWT, or a database
 * address outside the config files listed below.
 *
 * On 14 Nov 2026 the fleet integration audit (I-01) found the main database's
 * project address in four public files here (brain/stores.yaml, a proposal, a
 * VPS declaration and a VPS audit dump). None of them was a key, but the
 * address is half of what an attacker needs, and the canon says "add the gate
 * that stops the next one". This is that gate, after krish-raja's
 * scripts/public-script-guard.ts, run over every tracked text file by CI.
 *
 *   node scripts/check-public-leaks.mjs            scan the tracked tree
 *   node scripts/check-public-leaks.mjs --self-test prove each pattern can fail
 *
 * A config file that must keep an address goes in ALLOWED_CONFIG with why, and
 * reads the environment variable instead wherever its runtime can. Today none
 * does. Git history keeps the old copies; this stops new ones.
 */

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(import.meta.url), '../..')

export const FORBIDDEN = [
  { label: 'a Supabase project address', pattern: /\b[a-z]{20}\.supabase\.(co|in)\b/ },
  { label: 'a Supabase database host', pattern: /\bdb\.[a-z]{20}\.supabase\b|\bpooler\.supabase\.com\b/ },
  { label: 'a Supabase project ref', pattern: /\b(?:project(?:_ref|-ref|Ref)?|ref)\s*[:=]\s*["'`]?[a-z]{20}\b|\bproject\s+["'`][a-z]{20}["'`]/ },
  { label: 'a database URL with a password', pattern: /\bpostgres(?:ql)?:\/\/[^\s:/@]+:[^\s@]+@/ },
  { label: 'a Supabase key (sb_)', pattern: /\bsb_(?:secret|publishable)_[A-Za-z0-9_-]{10,}/ },
  { label: 'a JWT', pattern: /\beyJhbGciOi[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { label: 'a GitHub token', pattern: /\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}/ },
  { label: 'an Anthropic key', pattern: /\bsk-ant-[A-Za-z0-9_-]{20,}/ },
]

/** Files that may keep an address, each with why. Keep it empty unless a runtime truly cannot read a variable. */
export const ALLOWED_CONFIG = new Map([
  // ['path/to/config', 'why the runtime cannot read SUPABASE_URL instead'],
])

/** This file names the patterns, so it is the one place they may appear. */
const SELF = 'scripts/check-public-leaks.mjs'

/** The labels of every forbidden thing found in one text, empty when clean. Pure. */
export const findLeaks = (text) => FORBIDDEN.filter((f) => f.pattern.test(text)).map((f) => f.label)

function tracked() {
  return execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 }).split('\0').filter(Boolean)
}

function selfTest() {
  const ref = 'abcdefghijklmnopqrst'
  const cases = [
    [`https://${ref}.supabase.co/rest/v1/tasks`, 'a Supabase project address'],
    [`host db.${ref}.supabase.co`, 'a Supabase database host'],
    [`project: ${ref}`, 'a Supabase project ref'],
    [`against project \`${ref}\` on 2026-09-09`, 'a Supabase project ref'],
    ['postgresql://postgres:hunter2@localhost:5432/db', 'a database URL with a password'],
    ['sb_secret_' + 'A'.repeat(24), 'a Supabase key (sb_)'],
    ['eyJhbGciOi' + 'J'.repeat(20) + '.' + 'x'.repeat(20) + '.' + 'y'.repeat(20), 'a JWT'],
    ['ghp_' + 'a'.repeat(36), 'a GitHub token'],
    ['sk-ant-' + 'a'.repeat(30), 'an Anthropic key'],
  ]
  let failed = 0
  for (const [text, label] of cases) {
    const ok = findLeaks(text).includes(label)
    if (!ok) failed++
    console.log(`${ok ? 'ok  ' : 'FAIL'}  catches ${label}`)
  }
  for (const clean of ['the main database project (SUPABASE_URL)', 'project: ai-harness', 'ref=main', 'https://supabase.com/docs']) {
    const ok = findLeaks(clean).length === 0
    if (!ok) failed++
    console.log(`${ok ? 'ok  ' : 'FAIL'}  leaves alone: ${clean}`)
  }
  return failed
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  if (process.argv.includes('--self-test')) {
    const failed = selfTest()
    console.log(failed ? `\n${failed} failed` : '\nPUBLIC LEAK GUARD SELF-TEST OK')
    process.exit(failed ? 1 : 0)
  }
  const hits = []
  for (const path of tracked()) {
    if (path === SELF || ALLOWED_CONFIG.has(path)) continue
    let text
    try { text = readFileSync(resolve(ROOT, path)) } catch { continue }
    if (text.includes(0)) continue // binary
    const lines = text.toString('utf8').split('\n')
    lines.forEach((line, i) => { for (const label of findLeaks(line)) hits.push(`${path}:${i + 1}: ${label}`) })
  }
  // Never print the match itself: the log of a public repository is public too.
  for (const h of hits) console.error(`::error::${h}. Move it to an environment variable or a symbolic name; list a config file in ALLOWED_CONFIG only if its runtime cannot read one.`)
  console.log(hits.length ? `\n${hits.length} leak(s) in tracked files.` : 'PUBLIC LEAK GUARD OK: no key, JWT or database address in tracked files.')
  process.exit(hits.length ? 1 : 0)
}
