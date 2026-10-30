#!/usr/bin/env node
/**
 * Rule-level provenance for the canon.
 *
 * The audit can say a skill is four days past review or one release behind.
 * It could not say where any individual rule came from. Both contracts carry
 * zero `Ruling (Krish` lines, so for almost every rule in the canon the
 * question "who decided this, and when" had no answer at all.
 *
 * This gives every rule an entry in brain/rules.yaml: a stable id, the sha256
 * of its text, when it first appeared, and what it supersedes. The prose stays
 * clean because the record is a sidecar, and a silent edit becomes arithmetic
 * rather than judgement, which is the same discipline the canon block already
 * uses one level up.
 *
 * Ids are slugs derived from the rule's own opening words, never ordinals.
 * An ordinal id renumbers every rule below an insertion, which would make the
 * ledger lie the first time a rule was added in the middle of a section.
 *
 *   node scripts/brain-rules.mjs --extract          print what the contracts contain
 *   node scripts/brain-rules.mjs --backfill --out brain/rules.yaml
 *   node scripts/brain-rules.mjs --check            compare the contracts to the ledger
 *   node scripts/brain-rules.mjs --revise --kind proposal --ref docs/proposals/<file>.md
 *                                                   record a reviewed change in place
 *
 * --backfill is lossy for a changed entry (it rewrites the source as founding);
 * use --revise for any change made after the ledger exists.
 *
 * Dependency-free, and --check never writes.
 */

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const args = process.argv.slice(2)
const has = (f) => args.includes(f)
const flag = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1] }

export const CONTRACTS = [
  'contract/krish-operating-contract.md',
  'contract/skill-routing-contract.md',
]

const read = (rel, root = HARNESS) => readFileSync(join(root, rel), 'utf8')
export const textSha = (s) => createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 12)

/**
 * A rule is a top-level bullet or numbered item inside a `## ` section.
 *
 * Deliberately not every line: prose paragraphs explain, tables route, and
 * headings name. The imperative lines are the ones that can be obeyed, and
 * therefore the ones worth being able to trace. Indented continuations belong
 * to the rule above them and are folded into it.
 */
export function ruleLines(text) {
  const out = []
  let section = null
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const h = line.match(/^## +(.+?)\s*$/)
    if (h) { section = slug(h[1]); continue }
    if (!section) continue
    const m = line.match(/^(?:- |(\d+)\. )(.+)$/)
    if (!m) continue
    const head = m[2].trim()
    let body = head
    // Fold indented continuation lines into the rule they belong to.
    let j = i + 1
    while (j < lines.length && /^\s{2,}\S/.test(lines[j])) { body += ' ' + lines[j].trim(); j++ }
    // The pickaxe searches one line at a time, so a folded rule must be looked
    // up by its opening line. Searching for the folded text finds nothing and
    // silently backfills every wrapped rule as untraceable.
    out.push({ section, line: i + 1, text: body, needle: head })
    i = j - 1
  }
  return out
}

/**
 * The canon block every repository renders into its AGENTS.md or CLAUDE.md.
 *
 * It was outside this ledger until pull request 189, so its taste clause was
 * rewritten in place with no hash, no source and nothing saying which wording
 * was current, and nothing failed. It is written as bold-labelled clauses
 * (`**Authority.**`, `**Taste:**`), several to a paragraph, not as bullets, so
 * each clause is a rule here: from its label to the next label or blank line.
 */
export const CANON_BLOCK = 'contract/templates/canon-block.md'

export function canonClauses(text) {
  const out = []
  const lines = text.split('\n')
  const LABEL = /\*\*([^*]+?)[.:]\*\*/gu
  let para = []
  const flush = () => {
    if (!para.length) return
    const joined = para.map((p) => p.text.trim()).join(' ')
    const starts = []
    for (const m of joined.matchAll(LABEL)) {
      // A label opens a clause only at the start of the paragraph or of a sentence.
      if (m.index === 0 || /[.;:)]\s$/u.test(joined.slice(0, m.index))) starts.push({ at: m.index, label: m[1], marker: m[0] })
    }
    if (!starts.length || starts[0].at !== 0) starts.unshift({ at: 0, label: null, marker: null })
    starts.forEach((s, k) => {
      const body = joined.slice(s.at, k + 1 < starts.length ? starts[k + 1].at : undefined).trim()
      if (!body || /^\{\{[a-z_]+\}\}$/u.test(body)) return
      const line = s.marker ? (para.find((p) => p.text.includes(s.marker)) || para[0]).line : para[0].line
      out.push({ section: 'canon', line, text: body, label: s.label, needle: s.marker || para[0].text.trim().slice(0, 60) })
    })
    para = []
  }
  for (let i = 0; i < lines.length; i++) {
    if (/^#/.test(lines[i])) { flush(); continue }
    if (!lines[i].trim()) { flush(); continue }
    para.push({ line: i + 1, text: lines[i] })
  }
  flush()
  return out
}

export function slug(s) {
  return s.toLowerCase()
    .replace(/`[^`]*`/g, (m) => m.slice(1, -1))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * A slug from the rule's own opening words, extended until it is unique inside
 * its section. Adding a rule never renames an existing one, which is the whole
 * point: an id that moves cannot carry provenance across the change that moved it.
 */
export function idFor(section, text, taken) {
  const words = slug(text).split('-').filter(Boolean)
  for (let n = 4; n <= Math.max(4, words.length); n++) {
    const id = `${section}.${words.slice(0, n).join('-')}`
    if (!taken.has(id)) return id
  }
  let n = 2
  const base = `${section}.${words.join('-')}`
  while (taken.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}

/**
 * Every rule in both contracts, plus every `## ` section of every skill.
 *
 * `root` is a parameter so the test suite can run the whole extractor against a
 * fixture tree. A checker that can only be pointed at the live repository can
 * only be tested by mutating the live repository, and a test that edits the
 * canon to prove a point is a worse risk than the bug it is hunting.
 */
export function extract(root = HARNESS) {
  const contractRules = []
  const taken = new Set()
  for (const file of CONTRACTS) {
    if (!existsSync(join(root, file))) continue
    for (const r of ruleLines(read(file, root))) {
      const id = idFor(r.section, r.text, taken)
      taken.add(id)
      contractRules.push({ id, file, line: r.line, text: r.text, needle: r.needle, text_sha: textSha(r.text) })
    }
  }
  if (existsSync(join(root, CANON_BLOCK))) {
    for (const r of canonClauses(read(CANON_BLOCK, root))) {
      const id = idFor(r.section, r.label || r.text, taken)
      taken.add(id)
      contractRules.push({ id, file: CANON_BLOCK, line: r.line, text: r.text, needle: r.needle, text_sha: textSha(r.text) })
    }
  }

  const skillSections = []
  const sTaken = new Set()
  const skillsDir = join(root, 'skills')
  for (const name of (existsSync(skillsDir) ? readdirSync(skillsDir).sort() : [])) {
    const rel = `skills/${name}/SKILL.md`
    if (!existsSync(join(root, rel))) continue
    const text = read(rel, root)
    const lines = text.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const h = lines[i].match(/^## +(.+?)\s*$/)
      if (!h) continue
      // The section body is everything up to the next `## `, so a hash over it
      // answers "did this chapter change" without hashing the whole skill.
      let j = i + 1
      const body = []
      while (j < lines.length && !/^## /.test(lines[j])) { body.push(lines[j]); j++ }
      const id = idFor(slug(name), h[1], sTaken)
      sTaken.add(id)
      skillSections.push({
        id, file: rel, line: i + 1, heading: h[1], needle: `## ${h[1]}`,
        text_sha: textSha(body.join('\n').trim()),
      })
    }
  }
  return { contractRules, skillSections }
}

// ------------------------------------------------------------------ backfill
/**
 * The commit that introduced this exact text.
 *
 * `source.kind: founding` says "we know when, not why". That is the honest
 * record for a rule nobody ever wrote a ruling for, and it is better than
 * inventing a justification after the fact. Founding rules are exactly the
 * ones the judge panel should look at first.
 */
function firstCommit(file, needle) {
  try {
    // No --max-count here. Git applies it before --reverse, so the pair means
    // "the newest matching commit", not the oldest, and on a file whose newest
    // commit did not touch this string it silently returns nothing at all.
    // That is exactly what made the first backfill record 90 rules untraceable.
    const out = execFileSync('git', [
      '-C', HARNESS, 'log', '--reverse', '--format=%H %ad', '--date=short',
      `-S${needle}`, '--', file,
    ], { encoding: 'utf8', maxBuffer: 1 << 24 }).trim()
    if (!out) return null
    const [sha, date] = out.split('\n')[0].split(' ')
    return { sha: sha.slice(0, 12), date }
  } catch { return null }
}

const q = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
const TODAY = new Date().toISOString().slice(0, 10)

function toYaml({ contractRules, skillSections }, prior, noGit = false) {
  const priorById = new Map()
  for (const e of [...(prior?.contract_rules || []), ...(prior?.skill_sections || [])]) priorById.set(e.id, e)

  const L = []
  L.push('# Provenance for every rule in the canon.')
  L.push('#')
  L.push('# Written by scripts/brain-rules.mjs, checked by scripts/validate-surfaces.mjs.')
  L.push('# One entry per top-level rule in the two contracts, and one per chapter of')
  L.push('# every skill. text_sha is the sha256 of the rule text (first 12 hex), so an')
  L.push('# edit without a new source is arithmetic to detect rather than a judgement.')
  L.push('#')
  L.push('# source.kind:')
  L.push('#   founding  the rule predates this ledger. We know when, not why.')
  L.push('#   ruling    a Ruling (Krish, DATE) line in the commit that introduced it.')
  L.push('#   proposal  a docs/proposals entry a human accepted.')
  L.push('#   import    carried in from a source outside this repository.')
  L.push('#')
  L.push('# Ids are slugs of the rule\'s own opening words, never ordinals: inserting a')
  L.push('# rule must not rename the ones below it, or provenance cannot survive the edit.')
  L.push('')
  L.push(`schema_version: 1`)
  L.push('')

  const emit = (key, rows, label) => {
    L.push(`# ${label}`)
    L.push(`${key}:`)
    for (const r of rows) {
      const was = priorById.get(r.id)
      const changed = was && was.text_sha !== r.text_sha
      const src = (was && !changed) ? was.source : null
      const found = (src || noGit) ? null : firstCommit(r.file, r.needle)
      L.push(`  - id: ${r.id}`)
      L.push(`    file: ${r.file}`)
      if (r.heading) L.push(`    heading: ${q(r.heading)}`)
      // Quoted, always. A 12 hex sha can be all digits, and the YAML reader
      // turns a bare all-digit scalar into a Number, so an unquoted hash would
      // compare unequal to its own identical string and fail forever.
      L.push(`    text_sha: ${q(r.text_sha)}`)
      L.push(`    first_seen: ${q((src && was.first_seen) || found?.date || 'unknown')}`)
      L.push(`    source:`)
      L.push(`      kind: ${src?.kind || 'founding'}`)
      L.push(`      ref: ${q(src?.ref || found?.sha || 'unknown')}`)
      if (was?.history?.length) {
        L.push('    history:')
        for (const h of was.history) {
          L.push(`      - text_sha: ${q(h.text_sha)}`)
          L.push(`        valid_until: ${q(h.valid_until)}`)
          L.push(`        source:`)
          L.push(`          kind: ${h.source?.kind || 'unknown'}`)
          L.push(`          ref: ${q(h.source?.ref || 'unknown')}`)
        }
      }
      L.push(`    status: ${(src && was.status) || 'live'}`)
      if (was?.supersedes?.length) L.push(`    supersedes: [${was.supersedes.join(', ')}]`)
      // A superseded rule is closed, never deleted, the same way Graphiti closes
      // a fact's validity window instead of dropping the row. Without a closing
      // date, "what did the canon say on a given day" cannot be answered from
      // this file at all, and deterministic replay is the first thing an audit
      // asks for. Carry an existing date forward; stamp one the first time an
      // entry is regenerated as superseded.
      if ((was && was.status === 'superseded') || was?.valid_until) {
        L.push(`    valid_until: ${q(was?.valid_until || TODAY)}`)
      }
      if (was?.contested_by) L.push(`    contested_by: ${was.contested_by}`)
    }
    L.push('')
  }

  emit('contract_rules', contractRules, `${contractRules.length} rules across the two contracts and the canon block.`)
  emit('skill_sections', skillSections, `${skillSections.length} chapters across the installed skills.`)
  return L.join('\n')
}

// --------------------------------------------------------------------- check
/**
 * The gate. Every rule needs an entry, every entry needs a rule, and an entry
 * whose text changed needs a source that is not the one it had before the edit.
 */
export function check(ledgerText, root = HARNESS) {
  const ledger = parseYaml(ledgerText)
  const live = extract(root)
  const problems = []
  const storesPath = join(root, 'brain/stores.yaml')
  const storeIds = new Set(
    existsSync(storesPath)
      ? (parseYaml(readFileSync(storesPath, 'utf8')).stores || []).map((x) => String(x.id))
      : [])

  for (const [key, rows] of [['contract_rules', live.contractRules], ['skill_sections', live.skillSections]]) {
    const recorded = new Map((ledger[key] || []).map((e) => [e.id, e]))
    const seen = new Set()
    for (const r of rows) {
      seen.add(r.id)
      const e = recorded.get(r.id)
      if (!e) { problems.push(`${r.file}:${r.line} has no entry in brain/rules.yaml (id ${r.id}). Add one with its source.`); continue }
      if (String(e.text_sha) !== String(r.text_sha)) {
        problems.push(`${r.id} changed but brain/rules.yaml still records text_sha ${e.text_sha}; the live text hashes to ${r.text_sha}. Update the entry and give it a new source.`)
      }
      if (!e.source || !e.source.kind) problems.push(`${r.id} has no source.kind`)
      const validSourceKinds = new Set(['founding', 'ruling', 'proposal', 'import'])
      if (e.source?.kind && !validSourceKinds.has(String(e.source.kind))) {
        problems.push(`${r.id} has unsupported source.kind ${e.source.kind}`)
      }
      if (e.source?.kind === 'ruling' && String(e.source?.ref || '').includes('/')) {
        problems.push(`${r.id} labels repository artifact ${e.source.ref} as a ruling; use approval or proposal, or cite the ruling commit`)
      }
      if (e.source?.kind === 'proposal' && !existsSync(join(root, String(e.source?.ref || '').split('#')[0]))) {
        problems.push(`${r.id} cites ${e.source.kind} ${e.source.ref}, but that repository artifact does not exist`)
      }
      for (const h of e.history || []) {
        if (!h.text_sha || !h.valid_until || !h.source?.kind || !h.source?.ref) {
          problems.push(`${r.id} has an incomplete history entry; text_sha, valid_until, source.kind, and source.ref are required`)
        }
        if (String(h.text_sha) === String(e.text_sha)) {
          problems.push(`${r.id} repeats its current text_sha in history instead of preserving a superseded revision`)
        }
      }
      // A contested rule points at the store row that contradicts it. A pointer
      // that resolves to nothing is worse than no pointer: it reads as evidence
      // and is not. The panel caught exactly that, in the field added to answer
      // its previous finding.
      if (e.contested_by && !storeIds.has(String(e.contested_by))) {
        problems.push(`${r.id} is contested_by "${e.contested_by}", which is not a store id in brain/stores.yaml`)
      }
      if (e.status === 'contested' && !e.contested_by) problems.push(`${r.id} is contested with nothing named as contesting it`)
      if (e.source?.kind === 'founding' && String(e.first_seen) === 'unknown' && String(e.source?.ref) === 'unknown') {
        problems.push(`${r.id} is founding with no commit; it cannot be traced at all`)
      }
    }
    // A closed rule needs its closing date, or the ledger can say a rule is no
    // longer live without ever saying when it stopped being so.
    for (const e of recorded.values()) {
      if (e.status === 'superseded' && !e.valid_until) {
        problems.push(`${e.id} is superseded with no valid_until. Give it the date it stopped being live; a closed rule with no closing date cannot be replayed.`)
      }
    }
    for (const id of recorded.keys()) {
      if (seen.has(id)) continue
      const e = recorded.get(id)
      // `contested` is live doctrine with a recorded contradiction against it,
      // not a removed rule, so an orphan check must not treat it as either.
      if (e.status === 'live' || e.status === 'contested') problems.push(`brain/rules.yaml carries ${id} as live, but no such rule exists in the canon. Retire it or restore the rule.`)
    }
  }
  return { problems, counts: { contract_rules: live.contractRules.length, skill_sections: live.skillSections.length } }
}

// ------------------------------------------------------------------- revise
/**
 * Record a reviewed change to the canon in brain/rules.yaml, in place.
 *
 * --backfill bootstraps an absent file and validates an existing one without
 * rewriting it. A changed index must use this reviser, which edits only the
 * entries whose text moved, and leaves every other byte alone:
 *
 *   changed   the old text_sha and source move to `history` with valid_until,
 *             and the entry takes the new hash and the given source;
 *   added     a new entry, inserted after the rule that precedes it;
 *   removed   a live entry whose rule no longer exists becomes `superseded`
 *             with valid_until. It is closed, never deleted;
 *   merged    `supersedes: [old]` on the surviving entry, from --supersedes.
 *
 * Idempotent: a second run over the same tree changes nothing.
 */
const SOURCE_KINDS = new Set(['founding', 'ruling', 'proposal', 'import'])

function emitEntry(e) {
  const L = []
  L.push(`  - id: ${e.id}`)
  L.push(`    file: ${e.file}`)
  if (e.heading) L.push(`    heading: ${q(e.heading)}`)
  L.push(`    text_sha: ${q(e.text_sha)}`)
  L.push(`    first_seen: ${q(e.first_seen || 'unknown')}`)
  L.push('    source:')
  L.push(`      kind: ${e.source?.kind || 'founding'}`)
  L.push(`      ref: ${q(e.source?.ref || 'unknown')}`)
  if (e.history?.length) {
    L.push('    history:')
    for (const h of e.history) {
      L.push(`      - text_sha: ${q(h.text_sha)}`)
      L.push(`        valid_until: ${q(h.valid_until)}`)
      L.push('        source:')
      L.push(`          kind: ${h.source?.kind || 'unknown'}`)
      L.push(`          ref: ${q(h.source?.ref || 'unknown')}`)
    }
  }
  L.push(`    status: ${e.status || 'live'}`)
  if (e.supersedes?.length) L.push(`    supersedes: [${e.supersedes.join(', ')}]`)
  if (e.valid_until) L.push(`    valid_until: ${q(e.valid_until)}`)
  if (e.contested_by) L.push(`    contested_by: ${e.contested_by}`)
  return L
}

/** Entry blocks by id: section key, first line, and the line after the last. */
function locate(lines) {
  const out = new Map()
  const sections = {}
  let key = null
  let open = null
  const close = (i) => { if (open) { open.end = i; out.set(open.id, open); open = null } }
  for (let i = 0; i < lines.length; i++) {
    const k = lines[i].match(/^(contract_rules|skill_sections):\s*$/)
    if (k) { close(i); key = k[1]; sections[key] = i; continue }
    const m = lines[i].match(/^  - id: (.+?)\s*$/)
    if (m) { close(i); open = { id: m[1], key, start: i }; continue }
    if (open && !lines[i].startsWith('    ')) close(i)
  }
  close(lines.length)
  return { blocks: out, sections }
}

export function revise(ledgerText, root = HARNESS, { kind, ref, today = TODAY, supersedes = {} } = {}) {
  if (!SOURCE_KINDS.has(String(kind))) throw new Error(`revise: unsupported source kind ${kind}`)
  if (!ref) throw new Error('revise: a source ref is required')
  const ledger = parseYaml(ledgerText)
  const byId = new Map()
  for (const key of ['contract_rules', 'skill_sections']) for (const e of ledger[key] || []) byId.set(e.id, { ...e, key })
  const live = extract(root)
  const liveRows = [
    ...live.contractRules.map((r) => ({ ...r, key: 'contract_rules' })),
    ...live.skillSections.map((r) => ({ ...r, key: 'skill_sections' })),
  ]
  const liveIds = new Set(liveRows.map((r) => r.id))
  const mergedInto = {}
  for (const [oldId, newId] of Object.entries(supersedes)) (mergedInto[newId] = mergedInto[newId] || []).push(oldId)

  const replace = new Map()   // id -> new entry object
  const inserts = []          // { after: id | null, key, entry }
  const changed = []
  const added = []
  const superseded = []

  let prevByKey = { contract_rules: null, skill_sections: null }
  for (const r of liveRows) {
    const was = byId.get(r.id)
    const extra = mergedInto[r.id] || []
    if (!was) {
      inserts.push({ after: prevByKey[r.key], key: r.key, entry: {
        id: r.id, file: r.file, heading: r.heading, text_sha: r.text_sha, first_seen: today,
        source: { kind, ref }, status: 'live', supersedes: extra.length ? extra : undefined,
      } })
      added.push(r.id)
    } else {
      const moved = String(was.text_sha) !== String(r.text_sha)
      const revived = was.status === 'superseded'
      const needsMerge = extra.some((id) => !(was.supersedes || []).includes(id))
      if (moved || revived || needsMerge) {
        const next = { ...was }
        if (moved) {
          next.history = [...(was.history || []), { text_sha: was.text_sha, valid_until: today, source: was.source }]
          next.text_sha = r.text_sha
          next.source = { kind, ref }
          changed.push(r.id)
        }
        if (revived) { next.status = 'live'; delete next.valid_until }
        if (needsMerge) next.supersedes = [...new Set([...(was.supersedes || []), ...extra])]
        replace.set(r.id, next)
      }
    }
    prevByKey[r.key] = r.id
  }
  for (const [id, e] of byId) {
    if (liveIds.has(id)) continue
    if (e.status === 'live' || e.status === 'contested') {
      replace.set(id, { ...e, status: 'superseded', valid_until: e.valid_until || today })
      superseded.push(id)
    }
  }

  if (!replace.size && !inserts.length) return { text: ledgerText, changed, added, superseded }

  const lines = ledgerText.split('\n')
  const { blocks, sections } = locate(lines)
  // Build the output by walking the original lines once.
  const insertAfter = new Map()
  const insertTop = { contract_rules: [], skill_sections: [] }
  for (const ins of inserts) {
    if (ins.after && blocks.has(ins.after)) (insertAfter.get(ins.after) || insertAfter.set(ins.after, []).get(ins.after)).push(ins.entry)
    else if (ins.after) {
      // The preceding rule is itself new: chain behind it.
      const chain = inserts.find((x) => x.entry.id === ins.after)
      ;(chain.followers = chain.followers || []).push(ins.entry)
    } else insertTop[ins.key].push(ins.entry)
  }
  const expand = (entry) => {
    const ins = inserts.find((x) => x.entry === entry)
    return [entry, ...((ins?.followers || []).flatMap(expand))]
  }
  const startOf = new Map([...blocks.values()].map((b) => [b.start, b]))
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const b = startOf.get(i)
    if (b) {
      const next = replace.get(b.id)
      if (next) out.push(...emitEntry(next))
      else out.push(...lines.slice(b.start, b.end))
      for (const e of insertAfter.get(b.id) || []) for (const x of expand(e)) out.push(...emitEntry(x))
      i = b.end - 1
      continue
    }
    out.push(lines[i])
    for (const key of ['contract_rules', 'skill_sections']) {
      if (sections[key] === i) for (const e of insertTop[key]) for (const x of expand(e)) out.push(...emitEntry(x))
    }
  }
  let text = out.join('\n')
  text = text.replace(/^# \d+ rules across the two contracts(?: and the canon block)?\.$/m, `# ${live.contractRules.length} rules across the two contracts and the canon block.`)
  text = text.replace(/^# \d+ chapters across the installed skills\.$/m, `# ${live.skillSections.length} chapters across the installed skills.`)
  return { text, changed, added, superseded }
}

// ---------------------------------------------------------------------- main
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  if (has('--extract')) {
    const live = extract()
    for (const r of live.contractRules) console.log(`${r.id}\t${r.text_sha}\t${r.file}:${r.line}`)
    for (const r of live.skillSections) console.log(`${r.id}\t${r.text_sha}\t${r.file}:${r.line}`)
    console.error(`\n${live.contractRules.length} contract rules, ${live.skillSections.length} skill sections.`)
  } else if (has('--backfill')) {
    const out = flag('--out') || 'brain/rules.yaml'
    const abs = join(HARNESS, out)
    if (existsSync(abs)) {
      const { problems } = check(readFileSync(abs, 'utf8'))
      if (problems.length) throw new Error(`backfill_requires_reviewed_revision: use --revise --kind <kind> --ref <ref>; ${problems[0]}`)
      console.log(`${out} valid and unchanged`)
    } else {
      const yaml = toYaml(extract(), null)
      mkdirSync(dirname(abs), { recursive: true })
      writeFileSync(abs, yaml.endsWith('\n') ? yaml : yaml + '\n')
      console.log(`wrote ${out}`)
    }
  } else if (has('--check')) {
    const abs = join(HARNESS, 'brain/rules.yaml')
    if (!existsSync(abs)) { console.error('FAIL  brain/rules.yaml does not exist'); process.exit(1) }
    const { problems, counts } = check(readFileSync(abs, 'utf8'))
    for (const p of problems) console.error(`FAIL  ${p}`)
    if (problems.length) { console.error(`\n${problems.length} provenance failure(s).`); process.exit(1) }
    console.log(`ok    ${counts.contract_rules} contract rules and ${counts.skill_sections} skill chapters all carry provenance`)
  } else if (has('--revise')) {
    const abs = join(HARNESS, 'brain/rules.yaml')
    const supersedes = Object.fromEntries((flag('--supersedes') || '').split(',').filter(Boolean).map((p) => p.split('=')))
    const r = revise(readFileSync(abs, 'utf8'), HARNESS, { kind: flag('--kind'), ref: flag('--ref'), supersedes })
    if (!has('--dry-run')) writeFileSync(abs, r.text)
    console.log(`revised brain/rules.yaml${has('--dry-run') ? ' (dry run)' : ''}: ${r.changed.length} changed, ${r.added.length} added, ${r.superseded.length} superseded`)
    for (const id of [...r.changed, ...r.added, ...r.superseded]) console.log(`  ${id}`)
  } else {
    console.error('usage: brain-rules.mjs [--extract | --backfill [--out <path>] | --check | --revise --kind <kind> --ref <ref> [--supersedes old=new,...] [--dry-run]]')
    process.exit(2)
  }
}
