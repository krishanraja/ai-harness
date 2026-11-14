#!/usr/bin/env node
/**
 * Report, never repair, every pin in state/pins.yaml (fleet integration I-11,
 * 2026-11-14). Exact is nothing; a source that moved, or a consumer edited in
 * place, is a finding to the source's owner; a side this run cannot read is
 * "unreadable". It writes nothing anywhere but its report, and opens no pull
 * request (re-pin pull requests wait on I-33).
 *
 *   node scripts/reconcile-pins.mjs [--out pins.md]     FLEET_TOKEN or GITHUB_TOKEN
 *   node scripts/reconcile-pins.mjs --self-test
 *
 * Statuses, per consumer:
 *   exact          the consumer carries the source's bytes (or its bundle)
 *   source-moved   the consumer is a whole, older copy: the source changed since
 *   edited         the consumer's files no longer match its own bundle, or a
 *                  single-file copy matches neither side: edited in place
 *   not-landed     the consumer's repository is readable and the copy is absent
 *   unreadable     this run could not read that side; nothing is concluded
 *   checked-by     mode generated: both sides readable; the source's own drift
 *                  check compares them
 */

import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const sha256 = (b) => createHash('sha256').update(b).digest('hex')

/** bundle_sha256 = sha256("version <v>\n" + "<file> <sha256>\n" per file in name order). Pure. */
export function bundleSha(bundle) {
  const names = Object.keys(bundle.files || {}).sort()
  return sha256(`version ${bundle.version}\n` + names.map((n) => `${n} ${bundle.files[n]}\n`).join(''))
}

/** A reader over the GitHub contents API: Buffer, null when absent, or throws when unreadable. */
export function githubReader(token, fetchImpl = fetch) {
  return async (repo, path) => {
    const res = await fetchImpl(`https://api.github.com/repos/${repo}/contents/${path.split('/').map(encodeURIComponent).join('/')}`, {
      headers: { Accept: 'application/vnd.github.raw', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'harness-pins' },
    })
    if (res.status === 404) {
      // A 404 is absence only when the repository itself is readable.
      const repoRes = await fetchImpl(`https://api.github.com/repos/${repo}`, { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'harness-pins' } })
      if (repoRes.ok) return null
      throw new Error('unreadable')
    }
    if (!res.ok) throw new Error('unreadable')
    return Buffer.from(await res.arrayBuffer())
  }
}

async function readBundle(read, repo, dir) {
  const raw = await read(repo, `${dir.replace(/\/$/, '')}/bundle.json`)
  if (raw === null) return null
  const bundle = JSON.parse(raw.toString('utf8'))
  return bundle
}

/** One pin's report rows. read(repo, path) -> Buffer | null (absent) | throws (unreadable). */
export async function checkPin(pin, read) {
  const rows = []
  const isDir = String(pin.source.path).endsWith('/')
  let source
  try {
    if (isDir) {
      const b = await readBundle(read, pin.source.repo, pin.source.path)
      source = b && { bundle: b, sha: b.bundle_sha256, consistent: bundleSha(b) === b.bundle_sha256 }
    } else {
      const raw = await read(pin.source.repo, pin.source.path)
      source = raw && { sha: sha256(raw) }
    }
  } catch { source = undefined }
  if (source === undefined) return (pin.consumers || []).map((c) => ({ pin: pin.id, consumer: c.repo, status: 'unreadable', note: 'the source could not be read' }))
  if (source === null) return [{ pin: pin.id, consumer: '(source)', status: 'unreadable', note: `${pin.source.repo} ${pin.source.path} is absent` }]
  if (isDir && !source.consistent) rows.push({ pin: pin.id, consumer: '(source)', status: 'edited', note: `the source bundle.json does not hash to its bundle_sha256; finding for ${pin.source.repo}` })

  for (const c of pin.consumers || []) {
    const row = { pin: pin.id, consumer: c.repo }
    try {
      if (c.mode === 'generated') {
        const raw = await read(c.repo, c.path)
        Object.assign(row, raw === null ? { status: 'not-landed', note: 'the generated copy is absent' } : { status: 'checked-by', note: pin.check || "the source owner's drift check" })
      } else if (isDir) {
        const b = await readBundle(read, c.repo, c.path)
        if (b === null) Object.assign(row, { status: 'not-landed', note: 'no bundle.json at the consumer path yet' })
        else {
          const dir = c.path.replace(/\/$/, '')
          let edited = bundleSha(b) !== b.bundle_sha256
          for (const [name, want] of Object.entries(b.files || {})) {
            const raw = await read(c.repo, `${dir}/${name}`)
            if (raw === null || sha256(raw) !== want) edited = true
          }
          if (edited) Object.assign(row, { status: 'edited', note: `edited in place; finding for ${pin.source.repo}, never an overwrite` })
          else if (b.bundle_sha256 === source.sha) Object.assign(row, { status: 'exact' })
          else Object.assign(row, { status: 'source-moved', note: `holds version ${b.version}; the source is at ${source.bundle.version}` })
        }
      } else {
        const raw = await read(c.repo, c.path)
        if (raw === null) Object.assign(row, { status: 'not-landed', note: 'the copy is absent' })
        else if (sha256(raw) === source.sha) Object.assign(row, { status: 'exact' })
        else Object.assign(row, { status: 'edited', note: `differs from the source; finding for ${pin.source.repo}, never an overwrite` })
      }
    } catch { Object.assign(row, { status: 'unreadable', note: 'this side could not be read' }) }
    rows.push(row)
  }
  return rows
}

export function report(rows, today) {
  const findings = rows.filter((r) => ['source-moved', 'edited'].includes(r.status))
  const lines = [`# Pins ${today}`, '', `Report only: nothing was written. ${findings.length} finding(s), ${rows.filter((r) => r.status === 'unreadable').length} unreadable.`, '', '| Pin | Consumer | Status | Note |', '|---|---|---|---|']
  for (const r of rows) lines.push(`| ${r.pin} | ${r.consumer} | ${r.status} | ${r.note || ''} |`)
  return lines.join('\n') + '\n'
}

async function selfTest() {
  let failed = 0
  const ok = (name, cond) => { if (!cond) failed++; console.log(`${cond ? 'ok  ' : 'FAIL'}  ${name}`) }
  const files = { 'A.md': Buffer.from('a'), 'b.json': Buffer.from('{}') }
  const mk = (version, fs) => { const b = { version, files: Object.fromEntries(Object.entries(fs).map(([k, v]) => [k, sha256(v)])) }; b.bundle_sha256 = bundleSha(b); return b }
  const store = new Map()
  const put = (repo, dir, version, fs, edit) => { const b = mk(version, fs); store.set(`${repo}:${dir}bundle.json`, Buffer.from(JSON.stringify(b))); for (const [k, v] of Object.entries(fs)) store.set(`${repo}:${dir}${k}`, edit && k === 'A.md' ? Buffer.from('edited') : v) }
  put('cc', 'src/', '2.0.0', { ...files, 'A.md': Buffer.from('a2') })
  put('e1', 'docs/cc/', '2.0.0', { ...files, 'A.md': Buffer.from('a2') })
  put('e2', 'docs/cc/', '1.0.0', files)
  put('e3', 'docs/cc/', '2.0.0', { ...files, 'A.md': Buffer.from('a2') }, true)
  store.set('cc:prices.ts', Buffer.from('p')); store.set('g1:prices.ts', Buffer.from('q')); store.set('s1:one.txt', Buffer.from('x')); store.set('s2:one.txt', Buffer.from('x')); store.set('s3:one.txt', Buffer.from('y'))
  const unreadable = new Set(['e5'])
  const read = async (repo, path) => { if (unreadable.has(repo)) throw new Error('unreadable'); return store.get(`${repo}:${path}`) ?? null }
  ok('the bundle hash follows the stated formula', bundleSha({ version: '1.28.0', files: { b: 'y', a: 'x' } }) === sha256('version 1.28.0\na x\nb y\n'))
  const rows = await checkPin({ id: 'bundle', source: { repo: 'cc', path: 'src/' }, consumers: ['e1', 'e2', 'e3', 'e4', 'e5'].map((repo) => ({ repo, path: 'docs/cc/', mode: 'bytes' })) }, read)
  const by = Object.fromEntries(rows.map((r) => [r.consumer, r.status]))
  ok('a current copy is exact, and exact reports nothing', by.e1 === 'exact')
  ok('a whole older copy means the source moved', by.e2 === 'source-moved')
  ok('a copy edited in place is a finding to the owner, not an overwrite', by.e3 === 'edited' && rows.find((r) => r.consumer === 'e3').note.includes('never an overwrite'))
  ok('a copy that has not landed is said so', by.e4 === 'not-landed')
  ok('a side that cannot be read is unreadable', by.e5 === 'unreadable')
  const gen = await checkPin({ id: 'prices', source: { repo: 'cc', path: 'prices.ts' }, check: 'its CI', consumers: [{ repo: 'g1', path: 'prices.ts', mode: 'generated' }] }, read)
  ok('a generated copy is left to the source owner\'s drift check', gen[0].status === 'checked-by' && gen[0].note === 'its CI')
  const one = await checkPin({ id: 'file', source: { repo: 's1', path: 'one.txt' }, consumers: [{ repo: 's2', path: 'one.txt', mode: 'bytes' }, { repo: 's3', path: 'one.txt', mode: 'bytes' }] }, read)
  ok('a single file is exact or edited', one[0].status === 'exact' && one[1].status === 'edited')
  const dead = await checkPin({ id: 'x', source: { repo: 'e5', path: 'a/' }, consumers: [{ repo: 'e1', path: 'docs/cc/', mode: 'bytes' }] }, read)
  ok('an unreadable source concludes nothing about its consumers', dead.every((r) => r.status === 'unreadable'))
  const pins = parseYaml(readFileSync(join(HARNESS, 'state/pins.yaml'), 'utf8'))
  ok('state/pins.yaml parses into pins with a source and consumers', pins.pins.length >= 2 && pins.pins.every((p) => p.source?.repo && p.source?.path && Array.isArray(p.consumers)))
  ok('the report says nothing was written', report(rows, '2026-11-14').includes('Report only: nothing was written. 2 finding(s), 1 unreadable.'))
  return failed
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const args = process.argv.slice(2)
  if (args.includes('--self-test')) {
    const failed = await selfTest()
    console.log(failed ? `\n${failed} failed` : '\nPINS RECONCILER SELF-TEST OK')
    process.exit(failed ? 1 : 0)
  }
  const token = process.env.FLEET_TOKEN || process.env.GITHUB_TOKEN
  if (!token) { console.error('::error::No FLEET_TOKEN or GITHUB_TOKEN: every pin would read as unreadable, which is not a reading.'); process.exit(1) }
  const { pins = [] } = parseYaml(readFileSync(join(HARNESS, 'state/pins.yaml'), 'utf8'))
  const read = githubReader(token)
  const rows = []
  for (const pin of pins) rows.push(...await checkPin(pin, read))
  const md = report(rows, new Date().toISOString().slice(0, 10))
  const i = args.indexOf('--out')
  if (i !== -1) writeFileSync(args[i + 1], md)
  process.stdout.write(md)
}
