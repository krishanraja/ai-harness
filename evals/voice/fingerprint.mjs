#!/usr/bin/env node
/**
 * Krish's voice fingerprint: measured numbers, not opinion.
 *
 * It reads a corpus of Krish's own words (kept privately in Drive, never in
 * this repository), measures each piece, and writes the typical range of
 * every measure for each register. It can then score any draft against a
 * register: the lower the distance, the more the draft reads like him.
 *
 *   node evals/voice/fingerprint.mjs build <corpus.json> [--out evals/voice/fingerprint.json]
 *   node evals/voice/fingerprint.mjs score <draft.txt> --register linkedin_post|long_form|live_conversation
 *
 * corpus.json is an array of { register, words, text, ... }. Only the numbers
 * below leave the corpus; no text is written to fingerprint.json.
 *
 * The score is a distance, not a verdict on quality. A draft can sound like
 * him and still be wrong. It answers one question: does this read like him?
 * Standard library only.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const DEFAULT_OUT = join(HERE, 'fingerprint.json')
const MIN_WORDS = 60

const count = (text, re) => (text.match(re) || []).length
const words = (text) => text.toLowerCase().match(/[a-z0-9][a-z0-9'’]*/g) || []
const sentences = (text) =>
  text.replace(/\n+/g, '\n').split(/(?<=[.!?])\s+|\n/).map((s) => s.trim()).filter((s) => /[a-z]/i.test(s))

// Phrases that mark generic, model-written prose. A high rate pulls a draft
// away from him whatever its other numbers say.
const AI_TELLS = /\b(delve|tapestry|landscape of|in today's|ever-evolving|crucial|pivotal|leverag(e|es|ing)|robust|seamless(ly)?|furthermore|moreover|in conclusion|navigat(e|ing) the|it'?s not just|unlock(s|ing)? the|game[- ]changer|at the end of the day|elevate|empower(s|ing)?|foster(s|ing)?|underscore(s|d)?|testament to|holistic)\b/gi

export function measure(text) {
  const w = words(text)
  const n = Math.max(w.length, 1)
  const s = sentences(text)
  const lens = s.map((x) => words(x).length).filter((x) => x > 0)
  const mean = lens.reduce((a, b) => a + b, 0) / Math.max(lens.length, 1)
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(lens.length, 1))
  const per1k = (c) => (1000 * c) / n
  const lower = text.toLowerCase()
  return {
    sentence_words_mean: mean,
    sentence_words_spread: mean ? sd / mean : 0,
    short_sentence_share: lens.length ? lens.filter((x) => x <= 6).length / lens.length : 0,
    contractions_per_1k: per1k(count(lower, /\b[a-z]+['’](s|re|ve|ll|d|t|m)\b/g)),
    i_per_1k: per1k(w.filter((x) => x === 'i' || x === "i'm" || x === "i've" || x === "i'd" || x === "i'll").length),
    we_per_1k: per1k(w.filter((x) => x === 'we' || x === "we're" || x === "we've" || x === 'our').length),
    you_per_1k: per1k(w.filter((x) => x === 'you' || x === "you're" || x === 'your' || x === "you've").length),
    question_share: s.length ? s.filter((x) => x.endsWith('?')).length / s.length : 0,
    exclamation_share: s.length ? s.filter((x) => x.endsWith('!')).length / s.length : 0,
    hedges_per_1k: per1k(count(lower, /\b(i guess|i think|sort of|kind of|probably|i mean|maybe)\b/g)),
    intensifiers_per_1k: per1k(count(lower, /\b(really|very|absolutely|definitely|totally|super)\b/g)),
    warmth_per_1k: per1k(count(lower, /\b(love|loved|lovely|wonderful|fantastic|phenomenal|awesome|amazing|brilliant|grateful|thank|thanks|cheers)\b/g)),
    conjunction_open_share: s.length ? s.filter((x) => /^(and|but|so|or)\b/i.test(x)).length / s.length : 0,
    numbers_per_1k: per1k(count(text, /\b\d[\d,.]*%?|\$\d/g)),
    parentheses_per_1k: per1k(count(text, /\(/g)),
    spaced_hyphen_per_1k: per1k(count(text, / - /g)),
    ai_tells_per_1k: per1k(count(text, AI_TELLS)),
    formal_connectives_per_1k: per1k(count(lower, /\b(furthermore|moreover|however|therefore|consequently|additionally|ultimately|importantly|notably|thus)\b/g)),
  }
}

const quantile = (xs, q) => {
  const a = [...xs].sort((x, y) => x - y)
  const i = (a.length - 1) * q
  const lo = Math.floor(i)
  return a[lo] + (a[Math.ceil(i)] - a[lo]) * (i - lo)
}

export function build(corpus) {
  const byRegister = {}
  for (const item of corpus) {
    if (!item.text || words(item.text).length < MIN_WORDS) continue
    ;(byRegister[item.register] ||= []).push(measure(item.text))
  }
  const registers = {}
  for (const [register, rows] of Object.entries(byRegister)) {
    const features = {}
    for (const key of Object.keys(rows[0])) {
      const xs = rows.map((r) => r[key])
      features[key] = { deciles: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((q) => +quantile(xs, q).toFixed(4)) }
    }
    registers[register] = { pieces: rows.length, features }
  }
  return { format: 'krish-voice.fingerprint/2', min_words: MIN_WORDS, markers: MARKERS, registers }
}

// The habits that mark his writing, from voice-doctrine.md: short
// declaratives, uneven rhythm, casual contractions, talking to the reader,
// a spaced hyphen or a bracketed aside where others reach for formal
// connectives, and none of the generic model phrasing. +1 means more is
// more like him, -1 means less is.
export const MARKERS = {
  short_sentence_share: 1,
  sentence_words_spread: 1,
  contractions_per_1k: 1,
  you_per_1k: 1,
  spaced_hyphen_per_1k: 1,
  parentheses_per_1k: 1,
  formal_connectives_per_1k: -1,
  ai_tells_per_1k: -1,
}

// Where a value sits in his own range, from 0 (below all his pieces) to 1.
const position = (value, deciles) => {
  let below = 0
  for (const d of deciles) if (value > d) below++
  else if (value === d) below += 0.5
  return below / deciles.length
}

// Distance from him, 0 to 1: for each marker, how far the draft falls short
// of his typical piece in the direction that marks him. A draft that matches
// or exceeds his median on a marker scores 0 for it. Lower is closer to him.
export function score(text, fingerprint, register) {
  const reg = fingerprint.registers[register]
  if (!reg) throw new Error(`no fingerprint for register ${register}`)
  const m = measure(text)
  const parts = {}
  let total = 0
  for (const [key, direction] of Object.entries(MARKERS)) {
    const p = position(m[key], reg.features[key].deciles)
    const shortfall = direction > 0 ? Math.max(0, 0.5 - p) * 2 : Math.max(0, p - 0.5) * 2
    parts[key] = +shortfall.toFixed(2)
    total += shortfall
  }
  return { register, distance: +(total / Object.keys(MARKERS).length).toFixed(3), parts, measured: m }
}

function main(argv) {
  const [cmd, path, ...rest] = argv
  const opt = (name, fallback) => {
    const i = rest.indexOf(name)
    return i >= 0 ? rest[i + 1] : fallback
  }
  if (cmd === 'build' && path) {
    const out = opt('--out', DEFAULT_OUT)
    const fp = build(JSON.parse(readFileSync(path, 'utf8')))
    writeFileSync(out, JSON.stringify(fp, null, 2) + '\n')
    for (const [r, v] of Object.entries(fp.registers)) console.log(`${r}: ${v.pieces} pieces`)
    return
  }
  if (cmd === 'score' && path) {
    const fp = JSON.parse(readFileSync(opt('--fingerprint', DEFAULT_OUT), 'utf8'))
    console.log(JSON.stringify(score(readFileSync(path, 'utf8'), fp, opt('--register', 'long_form')), null, 2))
    return
  }
  console.error('usage: fingerprint.mjs build <corpus.json> [--out file] | score <draft.txt> --register <name> [--fingerprint file]')
  process.exit(2)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main(process.argv.slice(2))
