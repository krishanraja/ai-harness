#!/usr/bin/env node
/**
 * The claude.ai loaders keep each skill's routing and carry none of its body
 * (Ruling, Krish, 2026-10-29: skills stay current on every surface with zero
 * intervention, following main). Dependency-free, no credential, no network.
 */

import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { drift, expectedLoaders, loaderFor, productionSkills, write, zipOne } from './build-cloud-loaders.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
let failed = 0
function test(name, fn) {
  try { fn(); console.log(`ok     ${name}`) } catch (e) { failed++; console.error(`FAIL   ${name}\n       ${e.message}`) }
}

const SOURCE = '---\nname: demo\ndescription: "Use for demos. Never for real work."\n---\n\n# Demo\n\nSecret body that must not ship.\n'

test('a loader keeps the name and description lines byte for byte', () => {
  const text = loaderFor(SOURCE)
  assert.ok(text.startsWith('---\nname: demo\ndescription: "Use for demos. Never for real work."\n---\n'))
})

test('a loader carries none of the skill body and names get_skill', () => {
  const text = loaderFor(SOURCE)
  assert.ok(!text.includes('Secret body'))
  assert.match(text, /Control Center `get_skill` with name `demo`/)
  assert.match(text, /do not do the work this skill governs from memory/)
})

test('a loader is deterministic', () => assert.equal(loaderFor(SOURCE), loaderFor(SOURCE.replace(/\n/g, '\r\n').replace(/\r\n\r\n# Demo[\s\S]*$/, '\n\n# Other\n'))))

test('every production skill has a loader, and the committed loaders match skills/', () => {
  assert.deepEqual(Object.keys(expectedLoaders()), productionSkills())
  assert.deepEqual(drift(), [])
})

test('tool-router is a production skill with a loader', () => {
  assert.ok(productionSkills().includes('tool-router'))
  assert.ok(readFileSync(join(HARNESS, 'adapters/cloud/loaders/tool-router/SKILL.md'), 'utf8').includes('get_skill'))
})

test('drift names a changed description, a missing loader and a stray one', () => {
  const root = mkdtempSync(join(tmpdir(), 'loaders-'))
  try {
    for (const n of ['alpha', 'beta']) {
      mkdirSync(join(root, 'skills', n), { recursive: true })
      writeFileSync(join(root, 'skills', n, 'SKILL.md'), SOURCE.replace('name: demo', `name: ${n}`))
    }
    write(root)
    assert.deepEqual(drift(root), [])
    writeFileSync(join(root, 'skills', 'alpha', 'SKILL.md'), SOURCE.replace('name: demo', 'name: alpha').replace('demos', 'tests'))
    rmSync(join(root, 'adapters/cloud/loaders/beta'), { recursive: true })
    mkdirSync(join(root, 'adapters/cloud/loaders/gone'))
    assert.deepEqual(drift(root).sort(), ['alpha: loader out of date with skills/alpha/SKILL.md', 'beta: loader missing', 'gone: loader for a skill that is not in skills/'])
    write(root)
    assert.deepEqual(drift(root), [])
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('a body-only change to a skill needs no loader change', () => {
  assert.equal(loaderFor(SOURCE), loaderFor(SOURCE.replace('Secret body', 'A rewritten body')))
})

test('the upload zip holds exactly <name>/SKILL.md with the loader bytes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'loader-zip-'))
  try {
    const zip = join(dir, 'demo.zip')
    writeFileSync(zip, zipOne('demo', loaderFor(SOURCE)))
    const listed = execFileSync('python3', ['-I', '-c', 'import sys,zipfile;z=zipfile.ZipFile(sys.argv[1]);assert z.testzip() is None;print(z.namelist()[0]);sys.stdout.write(z.read(z.namelist()[0]).decode())', zip], { encoding: 'utf8' })
    assert.equal(listed, `demo/SKILL.md\n${loaderFor(SOURCE)}`)
  } catch (e) {
    if (e.code === 'ENOENT') { console.log('skip   python3 unavailable; zip read-back not measured'); return }
    throw e
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

if (failed) { console.error(`${failed} failed`); process.exit(1) }
console.log('all cloud loader cases passed')
