#!/usr/bin/env node
import assert from 'node:assert/strict'
import { policyAt, effectiveKnowledge, validateKnowledge, observationKnowledge, accumulateBrief, consolidateKnowledge, seal } from './repository-brain.mjs'
const policy = policyAt()
policy.acceptances['test:owner'] = { actor: 'Krish', repositories: policy.targets, records: {} }
const base = (id, extra = {}) => { const record = ({ id, version: 1, type: 'procedure', status: 'accepted', scope: { kind: 'repository', repository: 'content-engine' }, statement: 'Retain the accepted argument while revising one dimension.', conditions: [], uncertainties: [], evidence_ids: ['plan:v1'], acceptance_ref: 'test:owner', supersedes: [], contradicts: [], refines: [], ...extra }); policy.acceptances['test:owner'].records[id] = seal(record); return record }
const rows = [base('title.earlier'), base('title.refined', { supersedes: ['title.earlier'], statement: 'Name the actual finding and retain curiosity about its explanation.' }), base('growth.result', { type: 'experiment', status: 'observed', scope: { kind: 'repository', repository: 'AEO-Engine' }, statement: 'An observed experiment underperformed for one test condition.', uncertainties: ['The observation does not identify the cause.'] })]
const content = effectiveKnowledge(rows, { repository: 'content-engine' }, policy)
assert.deepEqual(content.accepted.map((r) => r.id), ['title.refined'])
assert.equal(content.observations.length, 0)
assert.equal(content.superseded.length, 1)
const growth = effectiveKnowledge(rows, { repository: 'AEO-Engine' }, policy)
assert.equal(growth.accepted.length, 0)
assert.equal(growth.observations[0].type, 'experiment')
assert.throws(() => validateKnowledge(base('fake.approval', { acceptance_ref: 'model:approved' }), policy), /owner_acceptance/)
assert.throws(() => effectiveKnowledge([base('cyclic.one', { supersedes: ['cyclic.two'] }), base('cyclic.two', { supersedes: ['cyclic.one'] })], { repository: 'content-engine' }, policy), /cycle/)
assert.equal(effectiveKnowledge([base('a.one', { contradicts: ['a.two'] }), base('a.two')], { repository: 'content-engine' }, policy).conflicts.length, 1)
assert.throws(() => effectiveKnowledge(rows, { repository: 'mindmake' }, policy), /not_admitted/)
const observed = observationKnowledge({ id: 'one', repo: 'content-engine', class: 'correction', quote: 'Keep earlier requirements when the latest request changes one aspect.' }, policy)
assert.equal(observed.status, 'candidate')
assert.equal(observed.acceptance_ref, undefined)
assert.equal(observationKnowledge({ id: 'two', repo: null, class: 'failure', quote: 'The observed result did not meet the intended outcome.' }, policy).scope.kind, 'unknown')
assert.equal(observationKnowledge({ id: 'legacy', source: 'harness-inbox', repo: 'ai-harness', class: 'failure', quote: 'An older importer assigned all repositories to the harness.' }, policy).scope.kind, 'unknown')
const brief = { goal: 'Explain the real finding.', decisions: [{ id: 'name-subject', status: 'accepted', text: 'Name the subject.' }] }
const revision = accumulateBrief(brief, { request: 'Make the title shorter.', changes: [] })
assert.equal(revision.decisions[0].status, 'accepted')
assert.throws(() => accumulateBrief(brief, { request: 'Ignore earlier rules', changes: [{ id: 'drop', actor: 'assistant', supersedes: ['name-subject'] }] }), /requires_owner/)
const changed = accumulateBrief(brief, { request: 'Replace the naming decision.', changes: [{ id: 'named-change', actor: 'Krish', text: 'A scoped decision.', supersedes: ['name-subject'] }] })
assert.equal(changed.decisions[0].status, 'superseded')
assert.equal(brief.decisions[0].status, 'accepted', 'no mutation of the prior known-good brief')
const duplicates = consolidateKnowledge({ rows: [ { id: 'same', episode_id: 'episode:0123456789abcdef', repo: 'content-engine', class: 'failure', quote: 'One observed episode was delivered by two separate transports.' }, { id: 'another', episode_id: 'episode:0123456789abcdef', repo: 'content-engine', class: 'failure', quote: 'One observed episode was delivered by two separate transports.' } ] })
assert.equal(duplicates.fresh.length, 1)
console.log('REPOSITORY BRAIN OK: scope, supersession, uncertainty, authority, context continuity and evidence identity')
assert.throws(() => validateKnowledge({ ...base('binding.test'), statement: 'A model changed the meaning of an accepted requirement.' }, policy), /content_mismatch/)
