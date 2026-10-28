#!/usr/bin/env node
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { evaluate, northStarCheck, hook, ci, isProduct, defaultBase, parseNote, foldNotes, foldRepository } from './check.mjs'

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
assert.equal(isProduct('src/a.ts'), true); assert.equal(isProduct('docs/HANDOFF.md'), true, 'a rewritten plan is work'); assert.equal(isProduct('docs/history/2026-10-22-OLD.md'), false); assert.equal(isProduct('NOW.md'), false)

const base = { nowExists: true, since: '2026-10-20', today: TODAY }
// Product work without NOW.md fails; with a full closeout it passes.
assert.equal(evaluate({ ...base, commits: [c('Add a thing', ['src/a.ts'])], nowText: good }).ok, false)
assert.equal(evaluate({ ...base, commits: [c('Add a thing', ['src/a.ts']), c('Close out', ['NOW.md'])], nowText: good }).ok, true)
// A stale as_of or a stale or missing North Star line fails.
assert.match(evaluate({ ...base, commits: [c('a', ['src/a.ts', 'NOW.md'])], nowText: now('2026-10-01', `- North Star check (${TODAY}): holds.`) }).problems.join(), /as_of is 2026-10-01/)
assert.match(evaluate({ ...base, commits: [c('a', ['src/a.ts', 'NOW.md'])], nowText: now(TODAY, '- North Star check (2026-10-01): holds.') }).problems.join(), /before this work began/)
assert.match(evaluate({ ...base, commits: [c('a', ['src/a.ts', 'NOW.md'])], nowText: now(TODAY, null) }).problems.join(), /no North Star check line/)
// History-only work, automation, dependency bots and a stated reason pass.
assert.equal(evaluate({ ...base, commits: [c('Docs', ['README.md'])], nowText: good }).ok, false, 'a documentation change still closes out')
assert.equal(evaluate({ ...base, commits: [c('Archive', ['docs/history/2026-10-22-OLD.md'])], nowText: good }).ok, true)
assert.equal(evaluate({ ...base, commits: [c('Typo', ['README.md'], 'Closeout: not needed, a typo fix only')], nowText: good }).ok, true)
assert.equal(evaluate({ ...base, commits: [c('docs(harness): maintain repository administration', ['.github/workflows/harness-repository-context.yml', '.claude/hooks/harness-closeout.mjs', 'docs/HARNESS_CONTEXT.md'])], nowText: good }).ok, true)
assert.equal(evaluate({ ...base, commits: [c('docs(canon): sync the canon block', ['AGENTS.md'])], nowText: good }).ok, true)
assert.equal(evaluate({ ...base, commits: [c('docs(steward): quietly ship a feature', ['src/a.ts'])], nowText: good }).ok, false, 'an automation subject outside its scope is a session commit')
assert.match(evaluate({ ...base, commits: [c('Loosen the check', ['.github/workflows/harness-repository-context.yml', 'NOW.md'])], nowText: good }).problems.join(), /belong to the harness/)
assert.match(evaluate({ ...base, commits: [c('Edit the hook', ['.claude/hooks/harness-closeout.mjs'], 'Closeout: not needed, just a tweak here')], nowText: good }).problems.join(), /belong to the harness/, 'a stated reason never excuses it')
const hookEntry = '{"hooks":{"Stop":[{"hooks":[{"type":"command","command":"node .claude/hooks/harness-closeout.mjs"}]}]},"permissions":{"allow":["Bash(npm test)"]}}'
assert.equal(evaluate({ ...base, settingsText: hookEntry, commits: [c('Allow tests', ['.claude/settings.json'], 'Closeout: not needed, a local permission only')], nowText: good }).ok, true, 'the repository owns its other settings')
assert.match(evaluate({ ...base, settingsText: '{"permissions":{}}', commits: [c('Drop hooks', ['.claude/settings.json'], 'Closeout: not needed, settings tidy up')], nowText: good }).problems.join(), /no longer registers the harness closeout hook/)
assert.equal(evaluate({ ...base, author: 'dependabot[bot]', commits: [c('Bump', ['package.json'])], nowText: good }).ok, true)
assert.equal(evaluate({ ...base, author: 'some-app[bot]', commits: [c('Write a store', ['src/a.ts'])], nowText: good }).ok, false, 'any other bot is held to the rule')
assert.equal(evaluate({ ...base, commits: [c('Bump', ['package.json'], 'Closeout: not needed, lockfile refresh only')], nowText: good }).ok, true)
assert.equal(evaluate({ ...base, commits: [c('Bump', ['package.json'], 'Closeout: not needed, x')], nowText: good }).ok, false, 'a reason has to say something')
assert.equal(evaluate({ ...base, commits: [c('a', ['src/a.ts'], 'Closeout: not needed, a refactor only'), c('Close out', ['NOW.md'])], nowText: now(TODAY, null) }).ok, false, 'a stated reason never excuses a malformed NOW.md')
// The North Star changes only with Krish's ruling, even with a skip line.
assert.match(evaluate({ ...base, commits: [c('Retarget', ['docs/NORTH_STAR.md'], 'Closeout: not needed, wording only change')], nowText: good }).problems.join(), /Only Krish changes a North Star/)
assert.equal(evaluate({ ...base, commits: [c('Retarget', ['docs/NORTH_STAR.md', 'NOW.md'], 'Ruling (Krish, 2026-10-22): the new ambition.')], nowText: good }).ok, true, 'his ruling changes it, and NOW.md says so')
// A repository without NOW.md is told to create one.
assert.match(evaluate({ ...base, nowExists: false, commits: [c('a', ['src/a.ts'])] }).problems.join(), /does not exist/)

// Closeout notes (Ruling, Krish, 2026-10-28): the note is the closeout, and the
// fold writes it into NOW.md on main, so two pull requests never edit NOW.md.
const NOTE_PATH = `now-notes/${TODAY}-ship-it.md`
const noteText = (check = `North Star check (${TODAY}): holds.`) => `Status: The thing ships to every repository now.\nNext: Read back the first run on main.\n${check}\n`
const withNote = (text) => evaluate({ ...base, commits: [c('Ship it', ['src/a.ts', NOTE_PATH])], nowText: good, notes: { [NOTE_PATH]: text } })
assert.equal(withNote(noteText()).ok, true, 'a well-formed note closes out without touching NOW.md')
assert.match(withNote('Status: short\n').problems.join(), /needs "Next:/)
assert.match(withNote(noteText('North Star check (2026-10-01): holds.')).problems.join(), /before this work began/)
assert.match(withNote(noteText() + 'A stray line\n').problems.join(), /cannot place/)
assert.match(withNote(noteText().replace('ships', 'ships — everywhere')).problems.join(), /em dash/)
assert.equal(evaluate({ ...base, commits: [c('Ship it', ['src/a.ts', NOTE_PATH])], nowText: good, notes: { [NOTE_PATH]: null } }).ok, false, 'a note the range deleted is no closeout')
assert.match(evaluate({ ...base, commits: [c('Ship it', ['src/a.ts', 'now-notes/Bad Name.md'])], nowText: good, notes: {} }).problems.join(), /neither NOW.md nor a closeout note/)
// The work began with its first own commit: merging main moves the base, never the floor.
assert.equal(evaluate({ ...base, since: '2026-10-23', commits: [{ ...c('Ship it', ['src/a.ts', NOTE_PATH]), date: TODAY }], nowText: good, notes: { [NOTE_PATH]: noteText() } }).ok, true)
assert.equal(evaluate({ ...base, since: '2026-10-23', commits: [{ ...c('Close out', ['src/a.ts', 'NOW.md']), date: TODAY }], nowText: good }).ok, true, 'a NOW.md dated the day the work began still passes after main moves on')
assert.equal(evaluate({ ...base, since: '2026-10-23', commits: [{ ...c('Close out', ['src/a.ts', 'NOW.md']), date: '2026-10-25' }], nowText: good }).ok, false, 'work that began later needs a later check')
// The fold's own commit is automation, inside its scope only.
assert.equal(evaluate({ ...base, commits: [c('docs(closeout): fold closeout notes into NOW.md', ['NOW.md', NOTE_PATH])], nowText: good, notes: { [NOTE_PATH]: null } }).ok, true)
assert.equal(evaluate({ ...base, commits: [c('docs(closeout): sneak a feature in', ['src/a.ts'])], nowText: good }).ok, false)

// The harness's own proposal pull requests (change requests, learning reviews)
// say they need no closeout; before 2026-10-28 they failed this check by
// construction, were never marked ready, and expired unseen.
for (const script of ['scripts/open-changes.mjs', 'scripts/repository-reviews.mjs']) {
  const line = readFileSync(new URL(`../../${script}`, import.meta.url), 'utf8').match(/Closeout: not needed, [^`\\]+/)?.[0]
  assert.ok(line, `${script} writes a closeout line`)
  assert.equal(evaluate({ ...base, commits: [c('Keep the one-queue rule in the contract', ['skills/krish-principles/SKILL.md', 'brain/rules.yaml'], line)], nowText: good }).ok, true, `${script}'s commit passes closeout`)
}

// The fold.
const full = (asOf) => `---\nrepo: krishanraja/x\nas_of: ${asOf}\nhead: abc1234\n---\n# X: where it is right now\n\n## What it is\nA thing.\n\n## Where it is right now (as of ${asOf})\n<!-- north-star-state {} --> **North Star number: U4.**\n\n- **Old status** (2026-10-01).\n\n## What changed recently\n\n- 2026-10-01 Old change.\n\n## What is next and what is waiting on Krish\n- Next (2026-10-01): an older folded next step.\n- Ship the next thing.\n- Next: a hand-written older step.\n  - with a detail under it.\n- North Star check (2026-10-01): holds.\n\n## Read next\n`
const n1 = parseNote('now-notes/2026-10-21-first.md', 'Status: First status line here, long enough.\nNext: First next step.\nNorth Star check (2026-10-21): holds.\n')
const n2 = parseNote('now-notes/2026-10-22-second.md', 'Status: Second status line here,\nlong enough.\nChanged: **Second change** because the first was wrong.\nNext: Second next step.\n\nNorth Star check (2026-10-22): recalibration proposed. The number moved.\n')
assert.equal(n2.status, 'Second status line here, long enough.', 'a label runs on to the next line')
const folded = foldNotes(full('2026-10-01'), [n2, n1])
assert.deepEqual(folded.folded, [n1.path, n2.path], 'oldest first, so the newest lands on top')
assert.deepEqual(folded.problems, [])
const out = folded.text
assert.match(out, /^as_of: 2026-10-22$/m); assert.match(out, /## Where it is right now \(as of 2026-10-22\)/)
assert.ok(out.indexOf('- Second status') < out.indexOf('- First status') && out.indexOf('- First status') < out.indexOf('- **Old status**'), 'statuses newest first, above the old bullets')
assert.ok(out.indexOf('- 2026-10-22 **Second change**') < out.indexOf('- 2026-10-01 Old change.'))
assert.equal((out.match(/North Star check/g) || []).length, 1, 'exactly one North Star check line')
assert.match(out, /^- North Star check \(2026-10-22\): recalibration proposed\. The number moved\.$/m)
assert.equal((out.match(/^- Next\b/gm) || []).length, 1, 'one next step: the note\'s replaces every older one, folded or hand-written')
assert.doesNotMatch(out, /with a detail under it/, 'a replaced next step takes its indented lines with it')
assert.match(out, /^- Next \(2026-10-22\): Second next step\.$/m)
assert.match(out, /- Ship the next thing\./, 'hand-written lines stay for the steward')
assert.equal(northStarCheck(out).date, '2026-10-22')
assert.equal(foldNotes(full('2026-10-30'), [n1]).text.match(/^as_of: (.*)$/m)[1], '2026-10-30', 'as_of never moves back')
assert.equal(foldNotes(full('2026-10-01'), [parseNote('now-notes/2026-10-22-bad.md', 'Status: x\n')]).folded.length, 0, 'a malformed note is left for a person')
assert.ok(foldNotes('# no sections\n', [n1]).problems.length, 'a NOW.md without the sections is reported, not guessed at')
assert.match(foldNotes(full('2026-10-01').replace(/\n/g, '\r\n'), [n1]).text, /\r\n- Next \(2026-10-21\)/, 'line endings are kept')

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
  assert.equal(blocked.decision, 'block'); assert.match(blocked.reason, /neither NOW.md nor a closeout note/)
  assert.equal(hook({ cwd: dir, stop_hook_active: true }, TODAY), null, 'never traps a session')
  put('NOW.md', good); g('commit', '-qam', 'Close out the session')
  assert.equal(hook({ cwd: dir }, TODAY), null)
  const head = g('rev-parse', 'HEAD'), root = g('rev-list', '--max-parents=0', 'HEAD')
  assert.equal(ci({ cwd: dir, base: root, head, today: TODAY }).ok, true)
  assert.equal(ci({ cwd: dir, base: root, head: 'HEAD~1', today: TODAY }).ok, false)
  assert.equal(ci({ cwd: dir, base: 'nope', head, today: TODAY }).ok, false, 'an unreadable range is a failure, never a pass')
  assert.equal(hook({ cwd: join(tmpdir()) }, TODAY), null, 'outside a repository the hook stays out of the way')

  // A stale origin/main (a container cloned days ago, then checked out the
  // latest main) must not pull published NOW.md updates into the session.
  g('update-ref', 'refs/remotes/origin/main', root)
  g('checkout', '-q', '-b', 'session/work')
  assert.equal(defaultBase(dir, { fetch: false }), head, 'local main beats a stale origin/main once HEAD has left it')
  put('src/a.ts', '3\n'); g('commit', '-qam', 'Session change')
  const stale = hook({ cwd: dir }, TODAY)
  assert.equal(stale?.decision, 'block', 'published closeouts never excuse this session')
  put('NOW.md', good.replace('Live.', 'Live, and changed.')); g('commit', '-qam', 'Close out')
  assert.equal(hook({ cwd: dir }, TODAY), null)

  // A session that closes out with a note passes the hook, and the fold on main
  // writes NOW.md and removes the note.
  put('src/a.ts', '4\n'); put(`now-notes/${TODAY}-ship.md`, `Status: The fourth change is live on the branch.\nNext: Merge it.\nNorth Star check (${TODAY}): holds.\n`)
  g('add', '-A'); g('commit', '-qm', 'Fourth change')
  assert.equal(hook({ cwd: dir }, TODAY), null, 'a note is a closeout')
  const onDisk = foldRepository(dir)
  assert.deepEqual(onDisk.folded, [`now-notes/${TODAY}-ship.md`])
  assert.equal(existsSync(join(dir, `now-notes/${TODAY}-ship.md`)), false, 'the folded note is removed')
  assert.match(readFileSync(join(dir, 'NOW.md'), 'utf8'), /^- Next \(2026-10-22\): Merge it\.$/m)
  assert.deepEqual(foldRepository(dir), { folded: [], problems: [] }, 'a second fold has nothing to do')
  g('checkout', '-q', '--', '.'); g('clean', '-qfd')

  // With a reachable remote, the hook refreshes the stale tracking ref first.
  const remote = join(dir, '.remote.git')
  g('clone', '-q', '--bare', dir, remote); g('remote', 'add', 'origin', remote)
  g('push', '-q', remote, `${head}:refs/heads/main`); g('update-ref', 'refs/remotes/origin/main', root)
  g('checkout', '-q', 'main')
  assert.equal(defaultBase(dir), head, 'a fetch moves a stale origin/main before the range is read')
} finally { rmSync(dir, { recursive: true, force: true }) }
console.log('CLOSEOUT OK: parser, rule, exemptions, North Star guard, closeout notes and their fold, hook loop guard and CI range')
