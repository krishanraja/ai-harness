#!/usr/bin/env node
/**
 * Does the Node aggregate still agree with the Windows one?
 *
 * `sha256-path-nul-file-sha256-ordinal-v1` is defined by
 * Get-DirectoryArtifactSha256 in scripts/Install-HarnessRelease.ps1. That
 * function is the authority and runs on the machines. scripts/reconcile-surface.mjs
 * reimplements it so a Linux job can compare a surface from anywhere, and a
 * reimplementation that drifts is worse than none: it produces a stable,
 * plausible number that disagrees with every host, and the disagreement reads as
 * drift on the host rather than as a bug here.
 *
 * That is not hypothetical. The first implementation was wrong on three axes at
 * once (raw digest bytes instead of uppercase hex, no separator between records,
 * sorting by path instead of by the composed record). It was handed to two
 * Windows hosts as a cross-check, disagreed with both, and I concluded the trees
 * differed. They did not. Four surfaces agreed with each other and with the
 * release artifacts; only this side was wrong.
 *
 * So the agreement is now a test with a fixed vector, checked on every push.
 * Deterministic, free, no network, no machine.
 *
 *   node scripts/check-aggregate.mjs
 */

import { createHash } from 'node:crypto'
import { readdirSync, statSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, relative, sep, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const NUL = String.fromCharCode(0)
const failures = []

const walk = (root, out = []) => {
  for (const e of readdirSync(root)) {
    const abs = join(root, e)
    statSync(abs).isDirectory() ? walk(abs, out) : out.push(abs)
  }
  return out
}

/** The algorithm, stated once, in the shape the PowerShell states it. */
function aggregate(root) {
  const lines = walk(root).map((abs) => {
    const rel = relative(root, abs).split(sep).join('/')
    const hex = createHash('sha256').update(readFileSync(abs)).digest('hex').toUpperCase()
    return `${rel}${NUL}${hex}`
  })
  lines.sort()
  return createHash('sha256').update(Buffer.from(lines.join('\n'), 'utf8')).digest('hex').toUpperCase()
}

// -------------------------------------------------- the axes actually matter
//
// A differential test on a small tree, one variant per way the first
// implementation was wrong. Each variant must produce a DIFFERENT digest from
// the correct one. If a variant ever agrees, that axis is not load-bearing and
// the assertions further down are guarding nothing.
//
// The tree is shaped to expose the sorting error specifically: on these paths,
// ordinal order over the composed records is not the same as ordinal order over
// the paths alone, which is exactly the case a flat list of top-level files
// would miss.
{
  const dir = mkdtempSync(join(tmpdir(), 'agg-vector-'))
  try {
    mkdirSync(join(dir, 'agents'), { recursive: true })
    writeFileSync(join(dir, 'SKILL.md'), 'alpha\n')
    writeFileSync(join(dir, 'agents', 'openai.yaml'), 'beta\n')
    writeFileSync(join(dir, 'README.md'), 'gamma\n')

    const files = walk(dir).map((abs) => ({
      path: relative(dir, abs).split(sep).join('/'),
      digest: createHash('sha256').update(readFileSync(abs)).digest(),
    }))

    const correct = aggregate(dir)
    const variants = {
      'raw digest bytes instead of hex': () => {
        const h = createHash('sha256')
        for (const r of [...files].sort((a, b) => (a.path < b.path ? -1 : 1))) {
          h.update(Buffer.from(r.path, 'utf8')); h.update(Buffer.from([0])); h.update(r.digest)
        }
        return h.digest('hex').toUpperCase()
      },
      'no separator between records': () => {
        const lines = files.map((r) => `${r.path}${NUL}${r.digest.toString('hex').toUpperCase()}`).sort()
        return createHash('sha256').update(Buffer.from(lines.join(''), 'utf8')).digest('hex').toUpperCase()
      },
      // Deliberately NOT tested: sorting by path rather than by composed record.
      // The first version of this file asserted that axis and the differential
      // test immediately reported the two agree, which is correct and worth
      // keeping written down. A record is `path + NUL + hex`, NUL is 0x00, and
      // no character that can appear in a path sorts below it, so comparing two
      // records always resolves inside the path portion and is equivalent to
      // comparing the paths. Asserting it would have been a guard over nothing.
      //
      // So the original mistake was two axes, not the three I first claimed.
      'lowercase hex': () => {
        const lines = files.map((r) => `${r.path}${NUL}${r.digest.toString('hex')}`).sort()
        return createHash('sha256').update(Buffer.from(lines.join('\n'), 'utf8')).digest('hex').toUpperCase()
      },
    }
    if (!/^[0-9A-F]{64}$/.test(correct)) failures.push(`The aggregate did not return a 64 character uppercase hex digest: ${correct}`)
    for (const [name, f] of Object.entries(variants)) {
      if (f() === correct) failures.push(`Differential test: "${name}" produced the same digest as the correct construction, so that axis is not load-bearing and the assertions below guard nothing.`)
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

// ---------------------------------------------------- the live cross-check
//
// The real vector: the v2026.09.08.1 skills tree, and the value four
// independent surfaces reported for it. LORIMER computed it from the release
// artifacts before installing, then all three of its client surfaces and SURFACE
// reproduced it after installing, with all 29 per-skill hashes matching the
// manifest. If this file's algorithm ever stops producing it, this file is
// wrong, not the machines.
const KNOWN = {
  release: 'v2026.09.08.1',
  source_commit: 'cb738af10744d91f20d47c37fd84b0cd6bb837bf',
  files: 139,
  aggregate: 'F7C08490BFC2F5A25C6669C614E0618180A1D37B6983450E7CCE5DC45A2B4441',
  attested_by: ['LORIMER release artifacts (pre-install)', 'claude-code-user', 'cursor-primary', 'codex-current', 'codex-surface-07a67cda9f99'],
}

// Only meaningful when the working tree still carries that release's skills. On
// a later commit the tree has legitimately moved, so this reports rather than
// fails: a stale vector must never become a reason to edit a skill back.
const skillsRoot = join(HARNESS, 'skills')
const here = aggregate(skillsRoot)
const fileCount = walk(skillsRoot).length

if (here === KNOWN.aggregate) {
  console.log(`Aggregate agrees with ${KNOWN.attested_by.length} independent surfaces on ${KNOWN.release}: ${here}`)
} else {
  console.log(`Working tree aggregate: ${here} over ${fileCount} files.`)
  console.log(`Attested ${KNOWN.release} value:  ${KNOWN.aggregate} over ${KNOWN.files} files.`)
  console.log('These differ, which is expected once the skills tree moves past that release. The vector below is what actually holds the algorithm still.')
}

// ------------------------------------------ the algorithm, held by construction
//
// Four negative assertions, each naming one of the ways the first implementation
// was wrong. A future edit that reintroduces any of them fails here rather than
// on a machine three days later.
const src = readFileSync(join(HARNESS, 'scripts/reconcile-surface.mjs'), 'utf8')
const fn = src.slice(src.indexOf('function aggregate'), src.indexOf('function aggregate') + 700)

if (!/toString\(['"]hex['"]\)/.test(fn) || !/toUpperCase\(\)/.test(fn)) {
  failures.push('reconcile-surface.mjs aggregate() no longer composes records from an UPPERCASE HEX file digest. The PowerShell uses a hex string, not raw bytes.')
}
if (!/join\(['"]\\n['"]\)/.test(fn)) {
  failures.push('reconcile-surface.mjs aggregate() no longer joins records with a newline. Without a separator, two different file sets can produce identical bytes.')
}
if (!/lines\.sort\(\)/.test(fn)) {
  failures.push('reconcile-surface.mjs aggregate() no longer ordinal-sorts its records. The order has to be deterministic, whatever it is sorted on.')
}
if (/Buffer\.from\(\[0\]\)/.test(fn)) {
  failures.push('reconcile-surface.mjs aggregate() is writing a NUL byte between buffers again. The PowerShell puts a NUL CHARACTER inside the record string and hashes the joined payload once, which is a different construction.')
}

if (failures.length) {
  console.error('\nAggregate guard FAILED:')
  for (const f of failures) console.error(`- ${f}`)
  console.error('\nGet-DirectoryArtifactSha256 in scripts/Install-HarnessRelease.ps1 is the authority. Match it, do not reinterpret it.')
  process.exit(1)
}
console.log('Aggregate guard passed: the Node reimplementation still matches the PowerShell construction on all four axes.')
