#!/usr/bin/env node
// Keeps skills/krish-voice/references/kill-list.json honest: valid shape,
// every pattern compiles, every register it names exists in the fingerprint,
// no raw em dash in the file, and every word or phrase the doctrine bans is
// in the list. Standard library only, no network.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REF = join(HERE, '..', '..', 'skills', 'krish-voice', 'references')
const raw = readFileSync(join(REF, 'kill-list.json'), 'utf8')
const list = JSON.parse(raw)
const fingerprint = JSON.parse(readFileSync(join(HERE, 'fingerprint.json'), 'utf8'))
const doctrine = readFileSync(join(REF, 'voice-doctrine.md'), 'utf8')

assert.equal(list.format, 'krish-voice.kill-list/1')
assert.ok(!raw.includes('—'), 'kill-list.json must write the em dash as an escape')

// Every channel names a register the fingerprint holds.
for (const [channel, spec] of Object.entries(list.channels)) {
  assert.ok(fingerprint.registers[spec.register], `${channel}: no fingerprint register ${spec.register}`)
}

// Every channel says who speaks on it, and the publication's own canon is named by repository, path and hash.
for (const [channel, spec] of Object.entries(list.channels)) assert.ok(['krish', 'jonny', 'publication'].includes(spec.voice), `${channel}: no voice`)
const ext = list.voices.publication.extends
assert.match(ext.sha256, /^[0-9a-f]{64}$/)
assert.ok(ext.repo && ext.path, 'the publication canon names where it lives')
for (const ch of ['article', 'script', 'caption', 'carousel', 'substack']) assert.equal(list.channels[ch].voice, 'publication')

// Every pattern compiles with the flags the file declares.
const compile = (p, flags = 'iu') => new RegExp(p, flags)
for (const p of list.hard.engagement_bait.patterns) compile(p, list.hard.engagement_bait.flags)
compile(list.hard.self_name.pattern, list.hard.self_name.flags)
for (const sec of ['summary_endings', 'soft_closers']) for (const p of list.warn[sec].patterns) compile(p, list.warn[sec].flags)
for (const p of list.scored.linkedin.no_setup_opener.patterns) compile(p, list.scored.linkedin.no_setup_opener.flags)

// Engagement bait catches bait and leaves ordinary sentences alone.
const bait = (t) => list.hard.engagement_bait.patterns.some((p) => compile(p, list.hard.engagement_bait.flags).test(t))
assert.ok(bait('P.S. Comment "DIAGNOSTIC" and I will send it over.'))
assert.ok(bait('Tag someone who needs this.'))
assert.ok(!bait('I commented on the draft yesterday.'))
assert.ok(!bait('Happy to comment on the AI plan if useful.'))

// Every word and phrase the doctrine bans is in the list (hard or, where the
// doctrine bans it only as a metaphor, warn). A new doctrine word with no
// entry fails here, so the two cannot drift apart.
const section = doctrine.split('### Words and phrases to avoid')[1].split('\n## ')[0]
const entries = section.split(/\.\s+/).map((s) => s.replace(/\n/g, ' ').trim()).filter(Boolean)
const known = new Set([
  ...list.hard.words.list,
  ...list.hard.phrases.list,
  ...list.warn.context_words.list,
].map((s) => s.toLowerCase()))
const missing = []
for (const entry of entries) {
  const term = entry.toLowerCase().replace(/\s+(as|unless|except)\b.*$/, '').replace(/\.$/, '').trim()
  if (!term || term.startsWith('additionally')) continue // a paragraph-opener rule, in the doctrine only
  if (!known.has(term)) missing.push(term)
}
assert.deepEqual(missing, [], `doctrine words missing from kill-list.json: ${missing.join(', ')}`)

// US spellings map to a different British form.
for (const [us, gb] of Object.entries(list.hard.us_spellings.map)) assert.notEqual(us, gb)
console.log(`ok  kill-list: ${known.size} words and phrases, ${Object.keys(list.hard.us_spellings.map).length} spellings`)
