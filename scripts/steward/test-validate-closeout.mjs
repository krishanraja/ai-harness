#!/usr/bin/env node
// Session closeout in the steward's validator: a session's own NOW.md update
// keeps the file current, automation never makes it stale, the North Star
// check line has one form, and the steward never edits the North Star.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const VALIDATE = resolve(dirname(fileURLToPath(import.meta.url)), 'validate.mjs')
const dir = mkdtempSync(join(tmpdir(), 'steward-closeout-'))
// Commit dates are pinned so the fixed as_of below never goes stale with the calendar.
const g = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_DATE: '2026-10-22T10:00:00Z', GIT_COMMITTER_DATE: '2026-10-22T10:00:00Z' } }).trim()
const put = (p, t) => { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), t) }
const run = (...a) => spawnSync(process.execPath, [VALIDATE, dir, ...a], { encoding: 'utf8' })
const now = (head, asOf, line = '- North Star check (2026-10-22): holds.') => `---
repo: krishanraja/x
product: X
as_of: ${asOf}
head: ${head}
lifecycle: building
production_url: none
state_doc: docs/STATE.md
history_log: docs/history/LOG.md
truth_files: []
authority_order: [docs/STATE.md]
steward: https://github.com/krishanraja/ai-harness/blob/main/docs/steward/RUNBOOK.md
---
# X: where it is right now

## What it is
X sells a thing.

## Who it is for and why it matters for Mindmake
A buyer.

## Where it is right now (as of ${asOf})
Building.

## What changed recently
- ${asOf}: started.

## What is next and what is waiting on Krish
- Ship it.
${line}

## Read next
- docs/STATE.md settles the state.

## Do not trust
Nothing at the moment.
`
try {
  g('init', '-q', '-b', 'main'); g('config', 'user.email', 't@example.invalid'); g('config', 'user.name', 'T')
  put('docs/STATE.md', 'State.\n'); put('docs/history/LOG.md', '# History log\n\n## 2026-10-20\n\n- reconciled at start.\n'); put('src/a.ts', '1\n')
  g('add', '-A'); g('commit', '-qm', 'Start')
  const head = g('rev-parse', '--short', 'HEAD')
  put('NOW.md', now(head, '2026-10-22')); g('add', '-A'); g('commit', '-qm', 'docs(steward): reconcile')
  assert.equal(run('--strict').status, 0, run('--strict').stderr)

  g('commit', '-q', '--allow-empty', '-m', 'chore(heartbeat): record a machine')
  assert.equal(run('--strict').status, 0, 'automation never makes NOW.md stale')

  put('src/a.ts', '2\n'); g('commit', '-qam', 'Change the product')
  assert.match(run('--strict').stderr, /NOW.md is stale: [0-9a-f]+ Change the product/)

  put('NOW.md', now(head, '2026-10-22', '- North Star check (2026-10-22): recalibration proposed. Wholesale now leads revenue.')); g('commit', '-qam', 'Close out the session')
  assert.equal(run('--strict').status, 0, 'a session that updated NOW.md with its work leaves it current')

  put('NOW.md', now(head, '2026-10-22', '- North Star check (2026-10-22): fine')); g('commit', '-qam', 'Bad line')
  assert.match(run().stderr, /is not "- North Star check/)
  put('NOW.md', now(head, '2026-10-22', '- North Star check (2026-10-22): holds.\n- North Star check (2026-10-21): holds.')); g('commit', '-qam', 'Two lines')
  assert.match(run().stderr, /more than one "North Star check" line/)
  put('NOW.md', now(head, '2026-10-22')); g('commit', '-qam', 'Fix')

  const before = g('rev-parse', 'HEAD')
  put('docs/NORTH_STAR.md', 'A new ambition.\n'); g('add', '-A'); g('commit', '-qm', 'docs(steward): retarget')
  assert.match(run('--since', before).stderr, /docs\/NORTH_STAR.md is Krish's alone/)
} finally { rmSync(dir, { recursive: true, force: true }) }
console.log('STEWARD CLOSEOUT OK: session freshness, automation ignored, one North Star check line, North Star never steward-written')
