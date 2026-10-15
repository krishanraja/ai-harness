#!/usr/bin/env node
/**
 * Automatic registration must produce exactly what a hand registration did:
 * the PC's approval gate finds the release, the coherence validator passes,
 * CURRENT.md renders, the aggregate is the one the installer computes, and a
 * verified install moves its surface onto the release. Everything runs on a
 * copy of the live registry, so a drift in its layout fails here first.
 */

import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { changedSkills, getBlock, reconcileDeployments, registerRelease, scalar, skillsAggregate } from './register-release.mjs'
import { parseYaml } from './lib/yaml.mjs'
import { validateReleaseCoherence } from './validate-release-coherence.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
let passed = 0
let failed = 0
const test = (name, condition) => {
  if (condition) passed += 1
  else failed += 1
  console.log(`${condition ? 'ok  ' : 'FAIL'}  ${name}`)
}

const live = readFileSync(join(HARNESS, 'state/skill-registry.yaml'), 'utf8')
const oldLatest = scalar(getBlock(live, 'latest_approved_release'), 'release_id')
const oldPrevious = scalar(getBlock(live, 'previous_published_release'), 'release_id')
const before = parseYaml(live)
const skills = Object.keys(before.surface_deployments).length ? ['apify', 'krish-build'] : []
const manifest = {
  release_id: 'v2099.01.01.1',
  source_commit: scalar(getBlock(live, 'latest_approved_release'), 'source_commit'),
  validation: 'passed',
  working_tree: 'clean',
  skills: skills.map((name, i) => ({ name, source_skill_sha256: i ? 'B'.repeat(64) : 'A'.repeat(64) })),
}
const previous = { skills: [{ name: 'apify', source_skill_sha256: 'A'.repeat(64) }, { name: 'krish-build', source_skill_sha256: 'C'.repeat(64) }] }
test('changed skills are the ones whose source bytes moved', JSON.stringify(changedSkills(manifest, previous)) === '["krish-build"]')

const out = registerRelease(live, { manifest, manifestSha: 'D'.repeat(64), publishedAt: '2099-01-01T00:00:00Z', aggregate: 'E'.repeat(64), changed: ['krish-build'], today: '2099-01-01' })
const after = parseYaml(out)
test('the new release is latest, approved by Krish under the standing ruling', after.latest_approved_release.release_id === 'v2099.01.01.1' && after.latest_approved_release.approved_by === 'Krish Raja' && /2026-10-15/.test(after.latest_approved_release.approval_basis))
test('the old latest becomes the rollback baseline, the old rollback becomes superseded', after.previous_published_release.release_id === oldLatest && after.superseded_approved_release.release_id === oldPrevious && after.previous_published_release.status === 'immediate-immutable-rollback-baseline')
test('the release coherence validator passes on the result', validateReleaseCoherence(after).length === 0)
test('every surface behind says what it waits for', Object.values(after.surface_deployments).every((d) => /awaiting|stale/.test(d.status)) && after.surface_deployments['claude-cloud'].status.startsWith('stale-manual-cloud-upload-required'))
test('nothing outside the release blocks and statuses changed', (() => {
  const strip = (t) => t.split('\n').filter((l) => !/^\s+status:/.test(l)).join('\n')
  for (const key of ['release_policy', 'production_active', 'canonical', 'deployed_release']) if (getBlock(strip(live), key) !== getBlock(strip(out), key)) return false
  return true
})())
test('the PC approval gate would find the release and its approver', (() => {
  const block = getBlock(out, 'latest_approved_release')
  return scalar(block, 'release_id') === 'v2099.01.01.1' && scalar(block, 'approved_by') === 'Krish Raja'
})())
let threw = false
try { registerRelease(out, { manifest, manifestSha: 'D'.repeat(64), publishedAt: 'x', aggregate: 'E', changed: [], today: 'x' }) } catch { threw = true }
test('the same release is never registered twice', threw)
threw = false
try { registerRelease(live, { manifest: { ...manifest, validation: 'failed' }, manifestSha: 'D', publishedAt: 'x', aggregate: 'E', changed: [], today: 'x' }) } catch { threw = true }
test('a manifest without a passed, clean build is refused', threw)

const root = mkdtempSync(join(tmpdir(), 'register-'))
mkdirSync(join(root, 'state/deployments'), { recursive: true })
writeFileSync(join(root, 'state/deployments/v2099.01.01.1-claude-code-user.json'), JSON.stringify({ release_id: 'v2099.01.01.1', result: 'installed-and-hash-verified', deployed_at_utc: '2099-01-02T08:31:00Z', skills: [{}, {}] }))
writeFileSync(join(root, 'state/deployments/v2099.01.01.1-codex-current.json'), JSON.stringify({ release_id: 'v2099.01.01.1', result: 'halted-unknown-drift' }))
writeFileSync(join(root, 'state/heartbeats.json'), JSON.stringify({ 'harness-sync-lorimer': { last_run: '2099-01-02T08:40:00Z', status: 'ok', release: 'v2099.01.01.1' }, 'harness-sync-surface': { last_run: '2099-01-02T08:40:00Z', status: 'blocked', release: 'v2099.01.01.1' } }))
const rec = reconcileDeployments(out, { root, aggregateFor: () => ({ aggregate: 'F'.repeat(64), files: 7 }) })
const hbOnly = parseYaml(rec.text).surface_deployments['cursor-primary']
test('without a committed record, an ok heartbeat for the release counts, and says it is weaker evidence', hbOnly.release_id === 'v2099.01.01.1' && hbOnly.status === 'current-reported-by-machine-heartbeat-install-record-not-committed')
test('a blocked heartbeat moves nothing', parseYaml(rec.text).surface_deployments['codex-surface-07a67cda9f99'].status.startsWith('awaiting'))
const reconciled = parseYaml(rec.text)
const ccu = reconciled.surface_deployments['claude-code-user']
test('a verified install moves its surface onto the release; a refused one stays awaiting', rec.updated.includes('claude-code-user') && !rec.updated.includes('codex-current') && ccu.release_id === 'v2099.01.01.1' && ccu.status === 'current-installed-hash-verified-automatic-install' && ccu.previous_release === oldLatest && reconciled.surface_deployments['codex-current'].status.startsWith('awaiting'))
test('the reconciled registry is still coherent', validateReleaseCoherence(reconciled).length === 0)

const { aggregate, files } = skillsAggregate(manifest.source_commit)
test('the aggregate recomputed from git objects equals the recorded one for that commit', aggregate === scalar(getBlock(live, 'latest_approved_release'), 'skills_tree_aggregate_sha256') && files > 0)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) process.exit(1)
console.log('REGISTER RELEASE OK')
