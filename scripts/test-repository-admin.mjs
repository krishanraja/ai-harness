#!/usr/bin/env node
import assert from 'node:assert/strict'
import { policyAt, seal } from './repository-brain.mjs'
import { planAdministration, renderAdministration, inspectRegion, bootstrapMeasure, spliceRegion, region, registerHook, closeoutHook, targetCheck, TARGET_CHECK, TARGET_HOOK, TARGET_SETTINGS, HOOK_COMMAND } from './repository-admin.mjs'
import { createHash } from 'node:crypto'
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
const scopedPolicy = structuredClone(policy)
scopedPolicy.acceptances['test:scoped'] = { actor: 'Krish', repositories: ['content-engine'], records: {} }
const accepted = (id, extra = {}) => {
  const record = { id, version: 1, type: 'procedure', status: 'accepted', scope: { kind: 'repository', repository: 'content-engine' }, statement: 'Preserve the accepted title while completing the repository work.', conditions: [], uncertainties: [], evidence_ids: ['check:workflow-scope'], acceptance_ref: 'test:scoped', supersedes: [], refines: [], contradicts: [], ...extra }
  scopedPolicy.acceptances['test:scoped'].records[id] = seal(record)
  return record
}
const general = accepted('title.default')
const narrowed = accepted('title.workflow', { scope: { kind: 'workflow', repository: 'content-engine', workflow: 'content' }, statement: 'Shorten the title after the owner explicitly changes the objective.', conditions: ['Only for the approved audience'], supersedes: [general.id] })
const scoped = renderAdministration(profile, [general, narrowed], scopedPolicy)
assert.ok(scoped.context.includes(`- Except when superseded by applicable workflow knowledge in \`content\`: ${general.statement}`), 'A default remains a fallback outside the replacement conditions, rather than competing with its effective replacement')
assert.ok(scoped.context.includes(`- In workflow \`content\` only: ${narrowed.statement} Applies when: Only for the approved audience.`), 'A workflow change retains its scope and conditions')
assert.ok(!scoped.context.includes(`\n- ${general.statement}`), 'The flat union must not reintroduce an active default into the superseding workflow')
const unchanged = renderAdministration(profile, [general], scopedPolicy)
assert.ok(unchanged.context.includes(`\n- ${general.statement}`), 'A default that remains effective in every workflow stays compact')
const twoWorkflows = { ...profile, workflows: [...profile.workflows, { id: 'board', label: 'Board continuity', read: ['README.md'], checks: [] }] }
const boardOnly = accepted('title.board', { scope: { kind: 'workflow', repository: 'content-engine', workflow: 'board' }, statement: 'Retain the full approved title in the board handoff record.', contradicts: [narrowed.id] })
const separate = renderAdministration(twoWorkflows, [general, narrowed, boardOnly], scopedPolicy)
assert.ok(separate.context.includes(`- Except when superseded by applicable workflow knowledge in \`content\`: ${general.statement}`), 'A content replacement must not disable the default in the board workflow')
assert.ok(separate.context.includes(`- In workflow \`board\` only: ${boardOnly.statement}`), 'Different workflow decisions remain explicitly separate rather than forming a false conflict')
const conflict = accepted('title.conflict', { scope: narrowed.scope, statement: 'A conflicting title instruction requires an explicit owner resolution.', contradicts: [narrowed.id] })
assert.throws(() => renderAdministration(profile, [general, narrowed, conflict], scopedPolicy), /unresolved_accepted_knowledge_conflict/, 'Conflicting effective workflow knowledge must block delivery')
// The closeout hook ships byte for byte, the check pins its hash, and settings are merged, never taken over.
assert.equal(first.changes[TARGET_HOOK], closeoutHook())
assert.ok(first.changes[TARGET_CHECK].includes(createHash('sha256').update(closeoutHook()).digest('hex')), 'The check workflow pins the delivered hook')
assert.ok(!first.changes[TARGET_CHECK].includes('{{CLOSEOUT'), 'No unrendered placeholder reaches a repository')
assert.deepEqual(JSON.parse(first.changes[TARGET_SETTINGS]).hooks.Stop[0].hooks[0], { type: 'command', command: HOOK_COMMAND })
const existing = JSON.stringify({ permissions: { allow: ['Bash(npm test)'] }, hooks: { Stop: [{ hooks: [{ type: 'command', command: 'echo done' }] }] } }, null, 2) + '\n'
const merged = JSON.parse(registerHook(existing).text)
assert.deepEqual(merged.permissions, { allow: ['Bash(npm test)'] }, 'Repository settings survive')
assert.equal(merged.hooks.Stop.length, 2, 'An existing Stop hook keeps running beside the closeout')
assert.equal(registerHook(registerHook(existing).text).text, registerHook(existing).text, 'Registration is idempotent')
assert.equal(registerHook('{"hooks":{}}').skipped, 'claude_settings_format_unmanaged', 'A file the publisher cannot reproduce is left alone and reported')
assert.equal(registerHook('not json').skipped, 'claude_settings_not_json')
const handFormatted = planAdministration(profile, { ...files, [TARGET_SETTINGS]: '{"hooks":{}}' }, [], { policy })
assert.equal(handFormatted.changes[TARGET_SETTINGS], undefined)
assert.deepEqual(handFormatted.skipped, [`${TARGET_SETTINGS}: claude_settings_format_unmanaged`], 'The rest of the delivery still goes ahead')
// A check workflow the publisher delivered before is upgraded; a hand-edited one stops the target.
const priorCheck = 'name: an earlier delivered check\n'
const upgradePolicy = { ...structuredClone(policy), prior_owned: { [TARGET_CHECK]: [createHash('sha256').update(priorCheck).digest('hex')] } }
assert.equal(planAdministration(profile, { ...files, [TARGET_CHECK]: priorCheck }, [], { policy: upgradePolicy }).changes[TARGET_CHECK], targetCheck())
assert.throws(() => planAdministration(profile, { ...files, [TARGET_CHECK]: 'name: edited by hand\n' }, [], { policy: upgradePolicy }), /repository_context_check_drift/)
assert.throws(() => planAdministration(profile, { ...files, [TARGET_HOOK]: '// edited by hand\n' }, [], { policy }), /closeout_hook_drift/)
assert.ok(policy.prior_owned[TARGET_CHECK].includes('85cc95b38c9680e5ff11de5101610957ad5975be5ec3af2234b6a82a90b3474d'), 'The check every admitted repository carries today upgrades in place')
console.log('REPOSITORY ADMIN OK: closeout hook, pinned check, merged settings, upgrades and drift; exact preservation, deterministic reruns, drift, scopes, budgets, routes and migration seals')
