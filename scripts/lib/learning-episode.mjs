/** Scoped, redacted evidence. No field in an episode grants acceptance or authority. */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './yaml.mjs'
import { leaks } from './redact.mjs'

const fleet = parseYaml(readFileSync(fileURLToPath(new URL('../../state/fleet.yaml', import.meta.url)), 'utf8'))
export const KNOWLEDGE_TYPES = new Set(['fact', 'requirement', 'preference', 'procedure', 'hypothesis', 'experiment', 'working_decision'])
export const CONTEXT_KEYS = new Set(['goal', 'retained', 'requested_change', 'attempt', 'outcome', 'conditions', 'uncertainties', 'evidence_refs'])
const ARRAYS = new Set(['retained', 'conditions', 'uncertainties', 'evidence_refs'])
export const digest = (s) => createHash('sha256').update(String(s), 'utf8').digest('hex')

export function repositoryIdentity(value) {
  if (!value) return null
  let raw=String(value).replace(/[\\/]$/, '')
  if (/^https?:\/\//.test(raw)) {
    let url;try{url=new URL(raw)}catch{return null}
    if(url.hostname!=='github.com')return null
    raw=url.pathname.slice(1)
  }
  if(!/^(?:\/|[A-Za-z]:[\\/]|\.{1,2}[\\/]|~[\\/])/.test(raw)&&raw.includes('/')&&raw.split('/')[0].toLowerCase()!==fleet.owner.toLowerCase())return null
  const last = raw.split(/[\\/]/).at(-1).replace(/\.git$/, '').toLowerCase()
  const repo = fleet.repos.find((r) => [r.name, r.checkout, ...(r.aliases||[])].filter(Boolean).some((n) => n.toLowerCase() === last))
  return repo?.name || null
}

export function validateEpisode(event) {
  if (event.schema_version !== 2) return
  const keys = new Set(['event_id', 'schema_version', 'occurred_at', 'surface', 'kind', 'summary', 'evidence_ref', 'related_skill_or_rule', 'outcome', 'severity', 'confidence', 'repository', 'episode_id', 'knowledge_type', 'episode', 'source_revision', 'inbox_id', 'received_at', 'payload_sha256'])
  if (Object.keys(event).some((k) => !keys.has(k))) throw new Error('unknown_episode_field')
  if (event.repository !== null && (typeof event.repository !== 'string' || !fleet.repos.some((r) => r.name === event.repository))) throw new Error('invalid_repository')
  if (!/^episode:[a-f0-9]{16,64}$/.test(event.episode_id || '')) throw new Error('invalid_episode_id')
  if (!KNOWLEDGE_TYPES.has(event.knowledge_type)) throw new Error('invalid_knowledge_type')
  if (event.source_revision != null && !/^[a-f0-9]{40}$/.test(event.source_revision)) throw new Error('invalid_source_revision')
  const context = event.episode
  if (!context || typeof context !== 'object' || Array.isArray(context)) throw new Error('invalid_episode')
  if (Object.keys(context).some((k) => !CONTEXT_KEYS.has(k))) throw new Error('unknown_episode_context_field')
  if (JSON.stringify(context).length > 4000) throw new Error('episode_over_budget')
  for (const [key, value] of Object.entries(context)) {
    if (ARRAYS.has(key) ? !Array.isArray(value) || value.length > 8 : typeof value !== 'string') throw new Error('invalid_episode_context')
    for (const text of Array.isArray(value) ? value : [value]) {
      if (typeof text !== 'string' || text.length > 500 || /[\u0000-\u001f\u007f]/u.test(text)) throw new Error('invalid_episode_text')
      if (key === 'evidence_refs') {
        if (!/^(?:commit|check|artifact|session|observation):[A-Za-z0-9._:#-]{1,100}$/.test(text)) throw new Error('invalid_episode_reference')
      } else if (leaks(text) || /https?:\/\/|<!--/i.test(text)) throw new Error('private_episode_context')
    }
  }
}

export function eventIdentity(event) {
  return event.schema_version === 2 ? `episode\0${event.episode_id}\0${event.kind}` : `harness-inbox\0${event.event_id}`
}
