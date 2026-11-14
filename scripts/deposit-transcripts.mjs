#!/usr/bin/env node
/**
 * Deposit this machine's Claude Code transcripts, whole, into Krish's private
 * vault krishanraja/claude-archive, before the weekly miner reads them.
 *
 * Contract: the claude-archive lane, fleet integration pass 2026-11-14 (I-16,
 * audit lane5-7). Claude Code clears transcripts after 30 days; the vault keeps
 * them. The vault's own workflow (claude-archive scripts/vault.mjs) catalogues
 * each deposit on main and fails on anything out of shape.
 *
 *   - Path: claude-code-transcripts/<machine>/<YYYY-MM-DD>/transcripts-NNN.zip,
 *     machine = lowercase COMPUTERNAME, [a-z0-9-] only, at most 40 characters;
 *     the date is the run's local date; an existing path is never overwritten.
 *   - What: *.jsonl and memory/*.md under the miner's transcript roots, new or
 *     changed (size or last-write time) since the last deposit, each whole.
 *   - Zip: deflate, entries relative to the user folder with forward slashes,
 *     split before 45 MB. A week with nothing new deposits an empty zip.
 *   - Cursor: %LOCALAPPDATA%\krish-harness\vault-deposit\cursor.json, never in
 *     a repository, advanced only after the push lands.
 *   - Repository: a clone at %USERPROFILE%\dev\claude-archive through the
 *     machine's own git login; pull --ff-only, commit, push to main, rebase and
 *     retry up to 3 times. Never force, amend or delete a deposit.
 *
 * Nothing transcript-derived is ever written to ai-harness, which is public:
 * this script prints counts and paths inside the vault only.
 *
 *   node scripts/deposit-transcripts.mjs [--dry-run]
 *   node scripts/deposit-transcripts.mjs --self-test
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, utimesSync } from 'node:fs'
import { homedir, hostname, tmpdir } from 'node:os'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { crc32, deflateRawSync, inflateRawSync } from 'node:zlib'
import { claudeTranscripts } from './mine-sessions.mjs'

export const SPLIT_BYTES = 45 * 1024 * 1024
export const VAULT_MAX_BYTES = 50 * 1024 * 1024
const ARCHIVE_REMOTE = 'https://github.com/krishanraja/claude-archive.git'

/** LORIMER -> lorimer: lowercase, [a-z0-9-] only, at most 40 characters. Pure. */
export function machineName(raw) {
  const name = String(raw || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40)
  if (!name) throw new Error('machine name is empty after cleaning')
  return name
}

/** The run's local date as YYYY-MM-DD. */
export const localDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function walk(dir, keep, out = []) {
  let names
  try { names = readdirSync(dir, { withFileTypes: true }) } catch { return out }
  for (const e of names) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, keep, out)
    else if (e.isFile() && keep(p)) out.push(p)
  }
  return out
}

/** Every file the vault takes: the miner's *.jsonl roots plus memory/*.md beside them. */
export function vaultFiles({ home = homedir(), env = process.env } = {}) {
  const out = new Set(claudeTranscripts({ home, env }))
  const roots = new Set([join(home, '.claude', 'projects')])
  if (existsSync(home)) for (const name of readdirSync(home)) if (/^\.claude[-_.]/.test(name)) roots.add(join(home, name, 'projects'))
  if (env.CLAUDE_CONFIG_DIR) roots.add(join(env.CLAUDE_CONFIG_DIR, 'projects'))
  for (const root of roots) for (const f of walk(root, (p) => p.endsWith('.md') && dirname(p).split(sep).pop() === 'memory')) out.add(f)
  return [...out].sort()
}

/** The entry name inside the zip: relative to the user folder, forward slashes, never absolute. Pure. */
export function entryName(file, home) {
  const rel = relative(home, file)
  if (!rel || rel.startsWith('..') || resolve(rel) === rel) throw new Error('a transcript outside the user folder cannot be named safely')
  return rel.split(sep).join('/')
}

/** Files new or changed (size or last-write time) since the cursor. */
export function changedSince(files, cursor) {
  const out = []
  for (const f of files) {
    let st
    try { st = statSync(f) } catch { continue }
    const prior = cursor[f]
    if (!prior || prior.size !== st.size || prior.mtimeMs !== st.mtimeMs) out.push({ file: f, size: st.size, mtimeMs: st.mtimeMs })
  }
  return out
}

// ------------------------------------------------------------------ zip writer
// A plain deflate zip (no zip64: every archive stays under 45 MB).
const dosTime = (d) => ((d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2)) & 0xffff
const dosDate = (d) => (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xffff

/** One compressed entry, ready to place in an archive. */
export function zipEntry(name, data, mtime = new Date()) {
  return { name: Buffer.from(name, 'utf8'), data: deflateRawSync(data), crc: crc32(data) >>> 0, size: data.length, time: dosTime(mtime), date: dosDate(mtime) }
}

/** Bytes an entry adds to an archive (local header, data, central record). */
export const entryCost = (e) => 30 + e.name.length + e.data.length + 46 + e.name.length

/** The archive bytes for a list of entries (none is a valid empty zip). Pure. */
export function zipBytes(entries) {
  const parts = []
  const central = []
  let offset = 0
  for (const e of entries) {
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(8, 8)
    local.writeUInt16LE(e.time, 10); local.writeUInt16LE(e.date, 12); local.writeUInt32LE(e.crc, 14)
    local.writeUInt32LE(e.data.length, 18); local.writeUInt32LE(e.size, 22); local.writeUInt16LE(e.name.length, 26); local.writeUInt16LE(0, 28)
    parts.push(local, e.name, e.data)
    const c = Buffer.alloc(46)
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8); c.writeUInt16LE(8, 10)
    c.writeUInt16LE(e.time, 12); c.writeUInt16LE(e.date, 14); c.writeUInt32LE(e.crc, 16); c.writeUInt32LE(e.data.length, 20)
    c.writeUInt32LE(e.size, 24); c.writeUInt16LE(e.name.length, 28); c.writeUInt32LE(offset, 42)
    central.push(c, e.name)
    offset += 30 + e.name.length + e.data.length
  }
  const cd = Buffer.concat(central)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16)
  return Buffer.concat([...parts, cd, end])
}

/** Read a zip written above back into { name: Buffer }. Used by the self-test. Pure. */
export function readZip(buf) {
  const endAt = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
  const count = buf.readUInt16LE(endAt + 10)
  let at = buf.readUInt32LE(endAt + 16)
  const out = {}
  for (let i = 0; i < count; i++) {
    const nameLen = buf.readUInt16LE(at + 28), extra = buf.readUInt16LE(at + 30), comment = buf.readUInt16LE(at + 32)
    const size = buf.readUInt32LE(at + 20), local = buf.readUInt32LE(at + 42)
    const name = buf.subarray(at + 46, at + 46 + nameLen).toString('utf8')
    const dataAt = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28)
    out[name] = inflateRawSync(buf.subarray(dataAt, dataAt + size))
    at += 46 + nameLen + extra + comment
  }
  return out
}

/** Split entries into archives under the limit; an entry over the vault's limit on its own is refused. Pure. */
export function packArchives(entries, limit = SPLIT_BYTES) {
  const archives = [[]]
  const refused = []
  let used = 22
  for (const e of entries) {
    const cost = entryCost(e)
    if (cost + 22 > VAULT_MAX_BYTES) { refused.push(e); continue }
    if (used + cost > limit && archives[archives.length - 1].length) { archives.push([]); used = 22 }
    archives[archives.length - 1].push(e)
    used += cost
  }
  return { archives, refused }
}

/** The first free index for a machine and date in the clone: transcripts-000, then -001 and on. */
export function nextIndex(dir) {
  let i = 0
  while (existsSync(join(dir, `transcripts-${String(i).padStart(3, '0')}.zip`))) i++
  return i
}

// ------------------------------------------------------------------ the run
function git(cwd, args) { return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) }

export function deposit({ home = homedir(), env = process.env, now = new Date(), dryRun = false, archiveDir, remote = ARCHIVE_REMOTE, stateDir, machine } = {}) {
  machine = machineName(machine || env.COMPUTERNAME || hostname())
  stateDir = stateDir || join(env.LOCALAPPDATA || join(home, '.local', 'state'), 'krish-harness', 'vault-deposit')
  archiveDir = archiveDir || join(env.USERPROFILE || home, 'dev', 'claude-archive')
  const cursorPath = join(stateDir, 'cursor.json')
  const cursor = existsSync(cursorPath) ? JSON.parse(readFileSync(cursorPath, 'utf8')) : {}
  const changed = changedSince(vaultFiles({ home, env }), cursor)
  const entries = changed.map((c) => ({ ...c, entry: zipEntry(entryName(c.file, home), readFileSync(c.file), new Date(c.mtimeMs)) }))
  const { archives, refused } = packArchives(entries.map((x) => x.entry))
  const date = localDate(now)
  const rel = `claude-code-transcripts/${machine}/${date}`
  const result = { machine, date, files: entries.length - refused.length, refused: refused.length, archives: archives.length, paths: [], pushed: false }
  if (dryRun) return result

  if (!existsSync(join(archiveDir, '.git'))) {
    mkdirSync(dirname(archiveDir), { recursive: true })
    execFileSync('git', ['clone', '--quiet', remote, archiveDir], { stdio: ['ignore', 'pipe', 'pipe'] })
  }
  git(archiveDir, ['pull', '--quiet', '--ff-only'])
  const dir = join(archiveDir, ...rel.split('/'))
  mkdirSync(dir, { recursive: true })
  let index = nextIndex(dir)
  for (const archive of archives) {
    const name = `transcripts-${String(index++).padStart(3, '0')}.zip`
    const path = join(dir, name)
    if (existsSync(path)) throw new Error('refusing to overwrite a deposit')
    writeFileSync(path, zipBytes(archive), { flag: 'wx' })
    result.paths.push(`${rel}/${name}`)
  }
  git(archiveDir, ['add', '--', ...result.paths])
  git(archiveDir, ['commit', '--quiet', '-m', `deposit: ${rel} (${result.files} files)`])
  for (let attempt = 0; ; attempt++) {
    try { git(archiveDir, ['push', '--quiet', 'origin', 'HEAD:main']); break }
    catch (error) {
      if (attempt >= 3) throw new Error('the deposit push was refused four times; the cursor did not move')
      git(archiveDir, ['pull', '--quiet', '--rebase', 'origin', 'main'])
    }
  }
  result.pushed = true
  // Only now, with the deposit on main: files refused for size stay out of the cursor and are retried.
  const refusedNames = new Set(refused.map((e) => e.name.toString('utf8')))
  for (const x of entries) if (!refusedNames.has(x.entry.name.toString('utf8'))) cursor[x.file] = { size: x.size, mtimeMs: x.mtimeMs }
  mkdirSync(stateDir, { recursive: true })
  writeFileSync(cursorPath, JSON.stringify(cursor))
  return result
}

function selfTest() {
  let failed = 0
  const ok = (name, cond) => { if (!cond) failed++; console.log(`${cond ? 'ok  ' : 'FAIL'}  ${name}`) }
  const root = mkdtempSync(join(tmpdir(), 'vault-deposit-'))
  try {
    const home = join(root, 'home'), state = join(root, 'state'), bare = join(root, 'archive.git'), clone = join(root, 'clone')
    const project = join(home, '.claude', 'projects', 'p1')
    mkdirSync(join(project, 'memory'), { recursive: true })
    writeFileSync(join(project, 's1.jsonl'), '{"a":1}\n')
    writeFileSync(join(project, 'memory', 'notes.md'), '# m\n')
    writeFileSync(join(project, 'settings.json'), '{}')
    mkdirSync(join(home, '.claude'), { recursive: true }); writeFileSync(join(home, '.claude', '.credentials.json'), '{"secret":1}')
    execFileSync('git', ['init', '--quiet', '--bare', '-b', 'main', bare])
    const seed = join(root, 'seed'); execFileSync('git', ['init', '--quiet', '-b', 'main', seed])
    for (const [k, v] of [['user.name', 't'], ['user.email', 't@t']]) execFileSync('git', ['-C', seed, 'config', k, v])
    writeFileSync(join(seed, 'README.md'), 'vault\n'); git(seed, ['add', '.']); git(seed, ['commit', '--quiet', '-m', 'init']); git(seed, ['push', '--quiet', bare, 'main'])
    const env = { LOCALAPPDATA: state, USERPROFILE: home }
    const opts = { home, env, archiveDir: clone, remote: bare, stateDir: state, machine: 'LORIMER', now: new Date(2026, 10, 15, 12) }
    process.env.GIT_AUTHOR_NAME = process.env.GIT_COMMITTER_NAME = 't'; process.env.GIT_AUTHOR_EMAIL = process.env.GIT_COMMITTER_EMAIL = 't@t'

    ok('machine name: LORIMER is lorimer; odd characters dropped; 40 at most', machineName('LORIMER') === 'lorimer' && machineName('My_PC 2') === 'mypc2' && machineName('x'.repeat(60)).length === 40)
    const first = deposit(opts)
    const path1 = join(clone, 'claude-code-transcripts', 'lorimer', '2026-11-15', 'transcripts-000.zip')
    ok('the first deposit lands at claude-code-transcripts/lorimer/<date>/transcripts-000.zip', first.pushed && existsSync(path1) && first.paths[0] === 'claude-code-transcripts/lorimer/2026-11-15/transcripts-000.zip')
    const z1 = readZip(readFileSync(path1))
    ok('it holds the jsonl and memory/*.md, whole, by relative forward-slash names', Object.keys(z1).sort().join() === '.claude/projects/p1/memory/notes.md,.claude/projects/p1/s1.jsonl' && z1['.claude/projects/p1/s1.jsonl'].toString() === '{"a":1}\n')
    ok('no settings, credentials or absolute path go in', !Object.keys(z1).some((n) => /settings|credentials/.test(n) || n.startsWith('/') || n.includes(root)))
    ok('the push reached main on the vault', git(bare, ['log', '--oneline', 'main']).includes('deposit: claude-code-transcripts/lorimer/2026-11-15 (2 files)'))
    ok('the cursor lives outside every repository and names both files', Object.keys(JSON.parse(readFileSync(join(state, 'cursor.json'), 'utf8'))).length === 2)
    const second = deposit(opts)
    const path2 = join(clone, 'claude-code-transcripts', 'lorimer', '2026-11-15', 'transcripts-001.zip')
    ok('a week with nothing new deposits an empty zip, never overwriting the first', second.files === 0 && existsSync(path2) && Object.keys(readZip(readFileSync(path2))).length === 0 && readFileSync(path1).length > 22)
    writeFileSync(join(project, 's1.jsonl'), '{"a":1}\n{"b":2}\n'); utimesSync(join(project, 's1.jsonl'), new Date(), new Date(Date.now() + 5000))
    const third = deposit({ ...opts, now: new Date(2026, 10, 22, 12) })
    ok('a changed file goes in whole the next week', third.files === 1 && Object.keys(readZip(readFileSync(join(clone, 'claude-code-transcripts', 'lorimer', '2026-11-22', 'transcripts-000.zip')))).join() === '.claude/projects/p1/s1.jsonl')
    const big = Array.from({ length: 3 }, (_, i) => ({ name: Buffer.from(`f${i}`), data: Buffer.alloc(20), crc: 0, size: 20, time: 0, date: 0 }))
    ok('archives split before the limit', packArchives(big, 22 + entryCost(big[0]) * 2).archives.map((a) => a.length).join() === '2,1')
    const dry = deposit({ ...opts, dryRun: true })
    ok('a dry run writes nothing and pushes nothing', dry.pushed === false && dry.paths.length === 0)
  } finally { rmSync(root, { recursive: true, force: true }) }
  return failed
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  if (process.argv.includes('--self-test')) {
    const failed = selfTest()
    console.log(failed ? `\n${failed} failed` : '\nVAULT DEPOSIT SELF-TEST OK')
    process.exit(failed ? 1 : 0)
  }
  try {
    const r = deposit({ dryRun: process.argv.includes('--dry-run') })
    console.log(`Vault deposit: ${r.files} file(s) in ${r.archives} archive(s) for ${r.machine} on ${r.date}${r.refused ? `, ${r.refused} over the vault's size limit left for a person` : ''}; ${r.pushed ? `pushed (${r.paths.join(', ')})` : 'not pushed (dry run)'}.`)
  } catch (error) {
    console.error(`::error::Vault deposit failed: ${error.message}. The cursor did not move; the miner still runs.`)
    process.exit(1)
  }
}
