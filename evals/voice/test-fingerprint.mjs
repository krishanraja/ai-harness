#!/usr/bin/env node
// Synthetic check for fingerprint.mjs: no real corpus, no network.
// A casual, uneven piece must score closer to a casual corpus than a polished
// rewrite of the same content, and the built fingerprint must hold no text.
import assert from 'node:assert/strict'
import { build, score, measure } from './fingerprint.mjs'

const casual = (topic) => `Big week. We shipped the ${topic} pilot - and honestly it's rough around the edges (it's meant to be). You'll see why. ` +
  `Most teams wait for the perfect version and it never comes. Don't. Ship it, watch what breaks, fix it. That's the job. ` +
  `I'm not saying quality doesn't matter - it does. But you can't learn from a deck. You learn from people using the thing. ` +
  `So here's my ask: if you've got a ${topic} problem, tell me. I'll show you what we found. It won't be pretty. It'll be useful.`
const corpus = ['pricing', 'agents', 'data', 'search', 'media', 'retail'].map((t) => ({ register: 'linkedin_post', text: casual(t) }))
const fp = build(corpus)

assert.equal(fp.registers.linkedin_post.pieces, 6)
assert.ok(!JSON.stringify(fp).includes('pilot'), 'fingerprint must hold numbers only, never corpus text')

const polished = 'This week, our team successfully launched the logistics pilot. While it remains at an early stage of development, ' +
  'this is a deliberate decision. Furthermore, many organizations delay launches in pursuit of perfection, which ultimately limits learning. ' +
  'Consequently, it is crucial to launch, observe outcomes and iterate in a robust manner. Quality remains important; however, meaningful ' +
  'insight is generated through real usage rather than presentations. Organizations facing similar challenges are encouraged to connect, ' +
  'as we would be pleased to share our findings, which we believe will provide valuable and actionable insight.'
const him = score(casual('logistics'), fp, 'linkedin_post')
const generic = score(polished, fp, 'linkedin_post')
assert.ok(him.distance < generic.distance, `casual ${him.distance} should beat polished ${generic.distance}`)
assert.ok(measure(polished).ai_tells_per_1k > 0 && measure(polished).formal_connectives_per_1k > 0)
assert.throws(() => score('x', fp, 'long_form'), /no fingerprint/)
console.log(`ok  fingerprint: casual ${him.distance}, polished ${generic.distance}`)
