#!/usr/bin/env node
/**
 * What must never be in this public repository: a key, a JWT, or a database
 * address.
 *
 * Asked for by the canon itself: its Secrets rule says a secret found in the
 * tree is already exposed, and to "add the gate that stops the next one"
 * (AGENTS.md, Krish canon, Secrets). On 14 Nov 2026 the fleet integration audit
 * (I-01) found the main database's project address in tracked files here; every
 * copy was replaced with a symbolic name in the same change that added this
 * gate, and git history keeps the old copies (the security sweep owns history).
 * The patterns follow krish-raja's scripts/public-script-guard.ts.
 *
 *   node scripts/check-public-leaks.mjs            scan the tracked tree
 *   node scripts/check-public-leaks.mjs --self-test prove each pattern can fail
 *
 * There is no allowlist. A file that truly must keep an address is an
 * exception to the canon, so it needs Krish's ruling, recorded on the commit
 * that changes this script to except it; a runtime reads SUPABASE_URL instead.
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
    let text
    try { text = readFileSync(resolve(ROOT, path)) } catch { continue }
    if (text.includes(0)) continue // binary
    const lines = text.toString('utf8').split('\n')
    lines.forEach((line, i) => { for (const label of findLeaks(line)) hits.push(`${path}:${i + 1}: ${label}`) })
  }
  // Never print the match itself: the log of a public repository is public too.
  for (const h of hits) console.error(`::error::${h}. Move it to an environment variable or a symbolic name.`)
  console.log(hits.length ? `\n${hits.length} leak(s) in tracked files.` : 'PUBLIC LEAK GUARD OK: no tracked file, this one included, matches a pattern above (a 20-letter Supabase ref, a database URL with a password, an sb_ key, a JWT, a GitHub token or an Anthropic key). It proves those patterns absent, nothing more.')
  process.exit(hits.length ? 1 : 0)
}
