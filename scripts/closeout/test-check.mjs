#!/usr/bin/env node
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { evaluate, northStarCheck, hook, ci, isProduct } from './check.mjs'

const TODAY = '2026-10-22'
const now = (asOf, line) => `---\nrepo: krishanraja/x\nas_of: ${asOf}\nhead: abc1234\n---\n# X: where it is right now\n\n## Where it is right now (as of ${asOf})\nLive.\n\n## What is next and what is waiting on Krish\n- Ship the next thing.\n${line ? line + '\n' : ''}\n## Read next\n`
const good = now(TODAY, `- North Star check (${TODAY}): holds.`)
const c = (subject, files, body = '') => ({ subject, body, files })

// The line parser.
assert.deepEqual(northStarCheck(good), { date: TODAY, verdict: 'holds', proposal: null })
assert.deepEqual(northStarCheck(now(TODAY, `- North Star check (${TODAY}): recalibration proposed. Revenue moved to wholesale.`)), { date: TODAY, verdict: 'recalibration_proposed', proposal: 'Revenue moved to wholesale.' })
assert.equal(northStarCheck(now(TODAY, null)), null)
assert.equal(northStarCheck(now(TODAY, `- North Star check (${TODAY}): recalibration proposed.`)), null, 'a proposal must say why')
assert.equal(northStarCheck(now(TODAY, `- North Star check (${TODAY}): holds.\n- North Star check (2026-10-01): holds.`)).verdict, 'duplicate')
assert.equal(isProduct('src/a.ts'), true); assert.equal(isProduct('docs/a.md'), false)

const base = { nowExists: true, since: '2026-10-20', today: TODAY }
// Product work without NOW.md fails; with a full closeout it passes.
assert.equal(evaluate({ ...base, commits: [c('Add a thing', ['src/a.ts'])], nowText: good }).ok, false)
assert.equal(evaluate({ ...base, commits: [c('Add a thing', ['src/a.ts']), c('Close out', ['NOW.md'])], nowText: good }).ok, true)
// A stale as_of or a stale or missing North Star line fails.
assert.match(evaluate({ ...base, commits: [c('a', ['src/a.ts', 'NOW.md'])], nowText: now('2026-10-01', `- North Star check (${TODAY}): holds.`) }).problems.join(), /as_of is 2026-10-01/)
assert.match(evaluate({ ...base, commits: [c('a', ['src/a.ts', 'NOW.md'])], nowText: now(TODAY, '- North Star check (2026-10-01): holds.') }).problems.join(), /before this work began/)
assert.match(evaluate({ ...base, commits: [c('a', ['src/a.ts', 'NOW.md'])], nowText: now(TODAY, null) }).problems.join(), /no North Star check line/)
// Documentation-only work, automation, bots and a stated reason pass.
assert.equal(evaluate({ ...base, commits: [c('Docs', ['README.md'])], nowText: good }).ok, true)
assert.equal(evaluate({ ...base, commits: [c('docs(harness): maintain repository administration', ['.github/workflows/x.yml'])], nowText: good }).ok, true)
assert.equal(evaluate({ ...base, commits: [c('docs(canon): sync the canon block', ['AGENTS.md'])], nowText: good }).ok, true)
assert.equal(evaluate({ ...base, author: 'dependabot[bot]', commits: [c('Bump', ['package.json'])], nowText: good }).ok, true)
assert.equal(evaluate({ ...base, author: 'some-app[bot]', commits: [c('Write a store', ['src/a.ts'])], nowText: good }).ok, false, 'any other bot is held to the rule')
assert.equal(evaluate({ ...base, commits: [c('Bump', ['package.json'], 'Closeout: not needed, lockfile refresh only')], nowText: good }).ok, true)
assert.equal(evaluate({ ...base, commits: [c('Bump', ['package.json'], 'Closeout: not needed, x')], nowText: good }).ok, false, 'a reason has to say something')
assert.equal(evaluate({ ...base, commits: [c('a', ['src/a.ts'], 'Closeout: not needed, a refactor only'), c('Close out', ['NOW.md'])], nowText: now(TODAY, null) }).ok, false, 'a stated reason never excuses a malformed NOW.md')
// The North Star changes only with Krish's ruling, even with a skip line.
assert.match(evaluate({ ...base, commits: [c('Retarget', ['docs/NORTH_STAR.md'], 'Closeout: not needed, wording only change')], nowText: good }).problems.join(), /Only Krish changes a North Star/)
assert.equal(evaluate({ ...base, commits: [c('Retarget', ['docs/NORTH_STAR.md'], 'Ruling (Krish, 2026-10-22): the new ambition.')], nowText: good }).ok, true)
// A repository without NOW.md is told to create one.
assert.match(evaluate({ ...base, nowExists: false, commits: [c('a', ['src/a.ts'])] }).problems.join(), /does not exist/)

// Against real git: the hook blocks once, then always lets the stop through.
const dir = mkdtempSync(join(tmpdir(), 'closeout-'))
const g = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_DATE: '2026-10-20T10:00:00Z', GIT_COMMITTER_DATE: '2026-10-20T10:00:00Z' } }).trim()
const put = (p, t) => { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), t) }
try {
  g('init', '-q', '-b', 'main'); g('config', 'user.email', 't@example.invalid'); g('config', 'user.name', 'T')
  put('NOW.md', now('2026-10-20', '- North Star check (2026-10-20): holds.')); put('src/a.ts', '1\n'); g('add', '-A'); g('commit', '-qm', 'Start')
  g('update-ref', 'refs/remotes/origin/main', 'HEAD')
  assert.equal(hook({ cwd: dir }, TODAY), null, 'nothing committed since main: nothing to close out')
  put('src/a.ts', '2\n'); g('commit', '-qam', 'Change the product')
  const blocked = hook({ cwd: dir }, TODAY)
  assert.equal(blocked.decision, 'block'); assert.match(blocked.reason, /NOW.md did not/)
  assert.equal(hook({ cwd: dir, stop_hook_active: true }, TODAY), null, 'never traps a session')
  put('NOW.md', good); g('commit', '-qam', 'Close out the session')
  assert.equal(hook({ cwd: dir }, TODAY), null)
  const head = g('rev-parse', 'HEAD'), root = g('rev-list', '--max-parents=0', 'HEAD')
  assert.equal(ci({ cwd: dir, base: root, head, today: TODAY }).ok, true)
  assert.equal(ci({ cwd: dir, base: root, head: 'HEAD~1', today: TODAY }).ok, false)
  assert.equal(ci({ cwd: dir, base: 'nope', head, today: TODAY }).ok, false, 'an unreadable range is a failure, never a pass')
  assert.equal(hook({ cwd: join(tmpdir()) }, TODAY), null, 'outside a repository the hook stays out of the way')
} finally { rmSync(dir, { recursive: true, force: true }) }
console.log('CLOSEOUT OK: parser, rule, exemptions, North Star guard, hook loop guard and CI range')
