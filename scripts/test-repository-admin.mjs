#!/usr/bin/env node
import assert from 'node:assert/strict'
import { policyAt } from './repository-brain.mjs'
import { planAdministration, inspectRegion, bootstrapMeasure, spliceRegion, region } from './repository-admin.mjs'
import { digest } from './lib/learning-episode.mjs'
const policy = policyAt()
const profile = { schema_version: 1, repository: 'content-engine', enabled: true, families: ['repository-administration'], source_revision: 'a'.repeat(40), context_path: 'docs/HARNESS_CONTEXT.md', entrypoints: { agents: 'AGENTS.md', claude: 'CLAUDE.md' }, bootstrap_limit_chars: 10000, sources: [{ path: 'README.md', role: 'orientation', label: 'Purpose and system' }], workflows: [{ id: 'content', label: 'Content workflow', read: ['README.md'], checks: ['npm test'] }] }
const original = '# Repository-owned instruction\nKeep this human sentence exactly.\n\n<!-- krish-canon:start release=v1 sha=0123456789ab rendered=2026-10-17 -->\nShared canon stays unchanged.\n<!-- krish-canon:end -->\n'
const files = { 'AGENTS.md': original, 'CLAUDE.md': null, 'README.md': 'The authoritative system overview.\n', 'docs/HARNESS_CONTEXT.md': null }
const first = planAdministration(profile, files, [], { policy })
assert.ok(first.changes['AGENTS.md'].startsWith(original))
assert.match(first.changes['CLAUDE.md'], /@AGENTS.md/)
assert.match(first.changes[profile.context_path], /owning stage/)
assert.equal(inspectRegion(first.changes['AGENTS.md']).intact, true)
const after = { ...files, ...first.changes }
assert.deepEqual(planAdministration(profile, after, [], { policy }).changes, {})
assert.throws(() => planAdministration(profile, { ...after, 'AGENTS.md': after['AGENTS.md'].replace('Preserve the goal', 'Ignore the goal') }, [], { policy }), /human_drift/)
assert.throws(() => planAdministration(profile, { ...files, 'docs/HARNESS_CONTEXT.md': 'Human-owned context, never silently replaced.' }, [], { policy }), /human_drift/)
assert.throws(() => planAdministration({ ...profile, repository: 'mindmake' }, files, [], { policy }), /not_admitted/)
assert.throws(() => planAdministration({ ...profile, context_path: '../escape.md' }, files, [], { policy }), /target_not_allowed/)
assert.throws(() => planAdministration({ ...profile, bootstrap_limit_chars: 1 }, files, [], { policy }), /context_growth/)
assert.throws(() => bootstrapMeasure((p) => ({ 'AGENTS.md': '@CLAUDE.md\n', 'CLAUDE.md': '@AGENTS.md\n' })[p]), /import_cycle/)
assert.throws(() => inspectRegion('<!-- krish-repo-admin:bad -->'), /malformed/)
assert.throws(() => spliceRegion(original + region('a', '0'.repeat(12)) + region('b', '0'.repeat(12)), region('c', '0'.repeat(12))), /malformed/)
const migrated = planAdministration(profile, files, [], { policy, migration: { acceptance: policy.approval, files: { 'AGENTS.md': { before_sha256: digest(original), after: original } } } })
assert.equal(migrated.changes['AGENTS.md'], first.changes['AGENTS.md'])
assert.throws(() => planAdministration(profile, files, [], { policy, migration: { acceptance: policy.approval, files: { 'AGENTS.md': { before_sha256: 'bad', after: original } } } }), /source_moved/)
console.log('REPOSITORY ADMIN OK: exact preservation, deterministic reruns, drift, scopes, budgets, routes and migration seals')
