#!/usr/bin/env node
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { selectExcerpts, mine, toEnvelope, parseCodex, parseCloudEvents } from './mine-sessions.mjs'
import { repositoryIdentity } from './lib/learning-episode.mjs'
import { toObservation, envelopeSha } from './import-harness-events.mjs'
import { intake } from './intake-observations.mjs'

const turns = [
  { role: 'user', session: 'piece-a', repository: 'content-engine', text: 'The headline must retain the actual finding and name the product.' },
  { role: 'assistant', session: 'piece-a', text: 'A draft headline with the agreed finding.' },
  { role: 'user', session: 'piece-a', repository: 'content-engine', text: 'No, make this shorter, but keep the earlier decisions.' },
]
const episode = selectExcerpts(turns, { chars: 4000 })[0]
assert.match(episode.excerpt, /retain the actual finding/)
assert.equal(episode.repository, 'content-engine')
const isolated = selectExcerpts([
  { role: 'assistant', session: 'a', text: 'UNRELATED EXPERIMENT DETAILS' },
  { role: 'user', session: 'b', text: 'No, this is still wrong, stop repeating it.' },
])[0]
assert.doesNotMatch(isolated.excerpt, /UNRELATED/)
assert.equal(selectExcerpts([{ role: 'user', session: 's', text: 'The experiment returned eighteen qualified enquiries from two hundred visits.' }]).length, 1)
assert.equal(selectExcerpts([{ role: 'user', session: 's', fresh: false, text: 'No, never repeat this mistake again.' }]).length, 0)

const parsed = parseCodex([
  JSON.stringify({ type: 'session_meta', payload: { id: 's', cwd: '/synthetic/content-engine' } }),
  JSON.stringify({ type: 'response_item', payload: { type: 'message', role: 'user', content: 'No, keep the approved argument through every revision.' } }),
])
const result = mine(parsed, { surface: 'codex', extract: () => [{ excerpt: 0, kind: 'explicit_correction', summary: 'Preserve accepted intent when a revision changes one part of the work.', knowledge_type: 'procedure', severity: 'medium', confidence: 'high', context: { goal: 'Maintain the agreed argument.', retained: ['Keep previously accepted requirements.'], requested_change: 'Shorten the wording.', conditions: [], uncertainties: [] } }] })
const event = result.envelopes[0]
assert.equal(event.schema_version, 2)
assert.equal(event.repository, 'content-engine')
assert.equal(event.knowledge_type, 'procedure')
assert.deepEqual(event.episode.retained, ['Keep previously accepted requirements.'])
const row = toObservation({ ...event, payload_sha256: envelopeSha(event) }, '2026-10-17', { requireInbox: false })
assert.equal(row.repo, 'content-engine')
assert.equal(row.episode_id, event.episode_id)
assert.equal(row.knowledge_type, 'procedure')
const revised = toEnvelope({ kind: 'explicit_correction', summary: 'A different safe paraphrase of this same original correction.', severity: 'medium', confidence: 'high' }, { surface: 'codex', session: 's', index: 1 })
assert.equal(event.event_id, revised.event_id, 'identity must not depend on a model paraphrase')

const dir = mkdtempSync(join(tmpdir(), 'learning-episodes-'))
const imported = intake({ events: [event, { ...event, event_id: 'direct-observation:alternate-route' }] }, { ledgerDir: dir })
assert.equal(imported.fresh.length, 1, 'one episode/kind is one evidence item across transports')
assert.equal(imported.duplicates, 1)
writeFileSync(join(dir, '2026-10.jsonl'), JSON.stringify(imported.fresh[0]) + '\n')
const conflict = intake({ events: [{ ...event, summary: 'A changed interpretation must never silently overwrite the original evidence.' }] }, { ledgerDir: dir })
assert.equal(conflict.fresh.length, 0)
assert.equal(conflict.rejected.event_conflict, 1)
for (const over of [
  { repository: '../other' },
  { repository: 'unregistered-private-company' },
  { episode: { ...event.episode, goal: 'Use /home/person/private-notes before every edit.' } },
  { episode: { ...event.episode, accepted: true } },
]) {
  assert.throws(() => toObservation({ ...event, ...over, payload_sha256: envelopeSha({ ...event, ...over }) }, '2026-10-17', { requireInbox: false }))
}
const legacy = toObservation({ ...event, schema_version: 1, repository: undefined, episode: undefined, episode_id: undefined, knowledge_type: undefined, payload_sha256: 'a'.repeat(64) }, '2026-10-17', { requireInbox: false })
assert.equal(legacy.repo, null, 'discarded legacy repository scope stays unknown')
assert.equal(repositoryIdentity('another-owner/content-engine'), null)
assert.equal(repositoryIdentity('https://github.com/krishanraja/content-engine'), 'content-engine')
const line = (content) => JSON.stringify({ message: { content } })
const cloud = parseCloudEvents([
 line([{ type: 'tool_use', id: 'sessions', name: 'list_sessions', input: { mine: true } }]),
 line([{ type: 'tool_result', tool_use_id: 'sessions', content: JSON.stringify({ ccr: { data: [{ id: 'cloud-one', repository: { full_name: 'krishanraja/content-engine' }, title: 'Untrusted title ignored' }] } }) }]),
 line([{ type: 'tool_use', id: 'events', name: 'list_events', input: { session_id: 'cloud-one' } }]),
 line([{ type: 'tool_result', tool_use_id: 'events', content: JSON.stringify({ ccr: { data: [{ created_at: '2026-10-17', user: { uuid: 'one', internal_anthropic_catchall: { message: { content: 'No, retain previously accepted decisions.' } } } }] } }) }]),
])
assert.equal(cloud[0].repository, 'content-engine', 'provider-returned session metadata earns scope')
console.log('LEARNING EPISODES OK: context, isolation, outcomes, stable identity, scoped intake, privacy and conflicts')
