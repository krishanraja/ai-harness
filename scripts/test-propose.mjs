#!/usr/bin/env node
/**
 * The weekly brief stays short enough to act on, and the scoreboard counts what
 * it says it counts. Fixture trees only.
 */

import { copyFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildCandidates, renderBrief, eligibility, classifyScope, loadPolicy, cluster, words } from './propose.mjs'
import { repeatedCorrectionRate, changeOutcomes, isoWeek } from './scoreboard.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
let passed = 0
let failed = 0
const test = (name, condition) => {
  if (condition) passed += 1
  else failed += 1
  console.log(`${condition ? 'ok  ' : 'FAIL'}  ${name}`)
}

const policy = loadPolicy()
const root = mkdtempSync(join(tmpdir(), 'propose-test-'))
for (const d of ['contract', 'brain', 'skills/krish-voice', 'skills/krish-principles', 'state/observations']) mkdirSync(join(root, d), { recursive: true })
copyFileSync(join(HARNESS, 'contract/learning-policy.yaml'), join(root, 'contract/learning-policy.yaml'))
writeFileSync(join(root, 'contract/context-budget.yaml'), 'files:\n  - skills/krish-principles/SKILL.md\n')
writeFileSync(join(root, 'skills/krish-principles/SKILL.md'), '---\nname: krish-principles\ndescription: "x"\n---\n\nEvery output ends in a move that the reader can take immediately without asking anything.\n')
writeFileSync(join(root, 'skills/krish-voice/SKILL.md'), '---\nname: krish-voice\ndescription: "y"\n---\n\nEvery output ends in a move that the reader can take immediately without asking anything.\n')
writeFileSync(join(root, 'brain/rules.yaml'), 'schema_version: 1\ncontract_rules: []\nskill_sections: []\n')
writeFileSync(join(root, 'brain/usage.jsonl'), '')

const row = (o) => ({ id: Math.random().toString(16).slice(2, 18), seen_at: '2026-10-13', dated: '2026-10-13', author: null, url: null, ...o })
const rows = [
  // A product ruling, once: stays local.
  row({ source: 'commit', repo: 'content-engine', class: 'ruling', quote: 'the Wednesday board items are chalked automatically for every published piece of the week.' }),
  // An agent-behaviour ruling: counts for the canon.
  row({ source: 'commit', repo: 'control-center', class: 'ruling', quote: 'once he has given the goal, agents do every reversible step without asking him again.' }),
  // A short task approval: never the canon.
  row({ source: 'commit', repo: 'control-center', class: 'ruling', quote: 'Love it, build it and merge everything' }),
  row({ source: 'commit', repo: 'content-engine', class: 'ruling', dated: '2026-10-11', quote: 'Love it, build it and merge everything' }),
  // The same agent ruling quoted again in a second commit: one candidate, not two.
  row({ source: 'commit', repo: 'control-center', class: 'ruling', quote: 'once he has given the goal, agents do every reversible step without asking him again.' }),
  // Already ruled in an ai-harness commit: carried.
  row({ source: 'commit', repo: 'ai-harness', class: 'ruling', dated: '2026-10-01', seen_at: '2026-10-01', quote: 'the mindmake repository stays out of the canon rollout and must not be reopened nightly by the reconciler.' }),
  row({ source: 'commit', repo: 'control-center', class: 'ruling', quote: 'the mindmake repository stays out of the canon rollout and must not be reopened nightly by the reconciler at all.' }),
  // A high-severity single lesson from real work.
  row({ source: 'harness-inbox', repo: 'ai-harness', class: 'successful_pattern', severity: 'high', quote: '[codex] a one-item production canary exposed an N+1 lookup that synthetic tests could not reveal; include a bounded live canary before scaling.' }),
  // A single low-severity failure stays below the bar.
  row({ source: 'harness-inbox', repo: 'ai-harness', class: 'failure', severity: 'low', quote: '[codex] a lint step was slow on a cold cache and timed out once during a long session.' }),
]
writeFileSync(join(root, 'state/observations/2026-10.jsonl'), rows.map((r) => JSON.stringify(r)).join('\n') + '\n')
writeFileSync(join(root, 'state/observations/standing.json'), JSON.stringify({
  'freshness:video-engine': { klass: 'freshness', subject: 'video-engine', first_seen: '2026-10-10', open: true },
  'freshness:old': { klass: 'freshness', subject: 'old', first_seen: '2026-08-01', open: true },
  'heartbeat:x': { klass: 'heartbeat', subject: 'x', first_seen: '2026-10-01', open: true, reopened: '2026-10-12' },
}))

const result = buildCandidates({ root, rows, policy, today: '2026-10-14', cutoff: '2026-10-07' })
const scoped=buildCandidates({root,policy,today:'2026-10-14',cutoff:'2026-10-07',rows:[
 row({id:'episode-one',schema_version:2,repo:'content-engine',class:'failure',severity:'high',quote:'An experimental change underperformed under one bounded test condition.',episode:{conditions:['Content workflow.']}}),
 row({id:'episode-two',schema_version:2,repo:'AEO-Engine',class:'failure',severity:'high',quote:'An experimental change underperformed under one bounded test condition.',episode:{conditions:['Research workflow.']}}),
 row({id:'episode-unknown',schema_version:2,repo:null,class:'failure',severity:'high',quote:'An experimental change underperformed under one bounded test condition.'})
]})
test('lexically similar scoped episodes remain separate repository candidates with conditions',scoped.repositoryCandidates.length===2&&scoped.repositoryCandidates.every(c=>c.evidence.length===1&&c.evidence[0].episode.conditions.length===1)&&!scoped.chosen.some(c=>c.evidence.some(e=>e.id.startsWith('episode-'))))
test('an unattributed episode cannot become a global proposal',scoped.below['unknown-scope']===1)
const ids = result.chosen.map((c) => c.type)
const agent = result.chosen.filter((c) => c.type === 'ruling-cluster' && /reversible step/.test(c.evidence[0].quote))
test('a cross-cutting agent ruling is a candidate, once', agent.length === 1)
test('a one-product ruling stays local and is only counted', result.local['content-engine'] >= 1 && !result.chosen.some((c) => /Wednesday board/.test(c.evidence[0].quote)))
test('a short task approval never reaches the canon', !result.chosen.some((c) => /merge everything/.test(c.evidence[0].quote)))
test('a ruling already made in an ai-harness commit is carried, not re-proposed', result.carried >= 1 && !result.chosen.some((c) => /mindmake repository/.test(c.evidence[0].quote)))
test('a high-severity single lesson qualifies under the override', result.chosen.some((c) => c.type === 'pattern'))
test('a single low-severity failure stays below the bar', result.below.friction >= 1)
test('a standing finding that opened this week appears', result.chosen.some((c) => c.type === 'standing-condition' && /video-engine/.test(c.title)))
test('a standing finding open for 74 days is not raised again this week', !result.chosen.some((c) => /: old$/.test(c.title)))
test('a reopened finding reads as an ineffective change, first in line', result.chosen[0].type === 'ineffective-change')
test('one consolidation slot is kept when a duplicate exists', ids.filter((t) => t === 'consolidation').length === 1)
test('candidate ids are unique', new Set(result.chosen.map((c) => c.id)).size === result.chosen.length)
test('the brief shows at most brief_top candidates', result.chosen.length <= Number(policy.brief_top))
const brief = renderBrief(result, { today: '2026-10-14', cutoff: '2026-10-07', all: false })
test('every quote is rendered as a blockquote, so it can never be re-read as a ruling line', brief.split('\n').filter((l) => /Ruling \(Krish/.test(l)).every((l) => l.trim().startsWith('>')))
test('a week with nothing earned keeps the line the workflow looks for',
  renderBrief({ chosen: [], restCounts: {}, local: {}, below: {}, windowRows: [] }, { today: 'x', cutoff: 'y', all: false }).includes('## Nothing was earned this week'))

const c3 = { rows: [{ class: 'failure' }, { class: 'failure' }, { class: 'failure' }] }
test('three ordinary observations are eligible', eligibility(c3, policy).eligible)
test('two ordinary observations are not', !eligibility({ rows: [{ class: 'failure' }, { class: 'failure' }] }, policy).eligible)
const localCluster = cluster([{ class: 'ruling', repo: 'content-engine', dated: '2026-10-13', quote: 'the cover image for every Monday piece uses the brand palette and a single bold headline.' }], 0.35)[0]
test('classifyScope keeps a product rule local', classifyScope(localCluster, policy, { skills: [], rules: [], carried: [] }) === 'local')

// ------------------------------------------------------------- scoreboard
const corrections = [
  { class: 'correction', dated: '2026-10-01', seen_at: '2026-10-01', quote: 'never report a green check as an outcome without reading the actual body of the response' },
  { class: 'correction', dated: '2026-10-09', seen_at: '2026-10-09', quote: 'never report a green check as an outcome without reading the actual response body' },
  { class: 'correction', dated: '2026-10-09', seen_at: '2026-10-09', quote: 'always put the exclusion clause first in a long skill description so truncation keeps it' },
]
const rc = repeatedCorrectionRate(corrections, { today: '2026-10-14' })
test('the same correction given on two days counts as repeated', rc.repeated === 1 && rc.clusters === 2 && rc.rate === 0.5)
const outcomes = changeOutcomes([
  { kind: 'change', pr: 1, event: 'opened' }, { kind: 'change', pr: 1, event: 'merged', hours_to_decision: 10 },
  { kind: 'change', pr: 2, event: 'opened' }, { kind: 'change', pr: 2, event: 'expired', hours_to_decision: 336 },
  { kind: 'change', pr: 3, event: 'opened' },
  { kind: 'proposals', pr: 99, event: 'opened' },
])
test('change acceptance counts merged over decided, ignoring proposal documents', outcomes.acceptance === 0.5 && outcomes.open === 1 && outcomes.opened === 3)
test('median hours to decision', outcomes.median_hours_to_decision === 173)
test('ISO weeks roll over on Monday', isoWeek('2026-10-18') === '2026-W42' && isoWeek('2026-10-19') === '2026-W43')
test('words() ignores stop words and short tokens', !words('the and of it').size)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) process.exit(1)
console.log('PROPOSE OK')
