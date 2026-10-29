#!/usr/bin/env node
/**
 * The claude.ai accounts hold a loader per production skill, never the skill.
 *
 * Krish ruled on 2026-10-29 that skills stay current on every surface with
 * zero intervention, following main. The two personal claude.ai catalogues
 * have no upload API, so a copied skill goes stale the day main changes: on
 * 2026-10-29 seven of the 29 in one account were behind main. A loader keeps
 * the skill's own name and description, so the account still routes to it,
 * and its body says only to read the instructions live through Control
 * Center's get_skill, which reads ai-harness main at call time. A merge to
 * main reaches both accounts with no upload.
 *
 * A loader changes only when a skill's name or description does. --check
 * fails when the committed loaders disagree with skills/, so a description
 * change cannot merge without its loader, and the digest names the one upload
 * that leaves owed.
 *
 *   node scripts/build-cloud-loaders.mjs            write adapters/cloud/loaders/
 *   node scripts/build-cloud-loaders.mjs --check    write nothing, exit 1 on drift
 *   node scripts/build-cloud-loaders.mjs --pack <dir>   also write one <name>.zip per loader for upload
 */

import { crc32 } from 'node:zlib'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
export const LOADERS = join('adapters', 'cloud', 'loaders')

/** The frontmatter's `name:` and `description:` lines, exactly as written. */
export function frontmatterLines(text) {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/)
  if (!m) throw new Error('no frontmatter')
  const lines = m[1].split('\n')
  const name = lines.find((l) => /^name:\s*/.test(l))
  const description = lines.find((l) => /^description:\s*/.test(l))
  if (!name || !description) throw new Error('frontmatter lacks name or description')
  return { name, description, value: name.replace(/^name:\s*/, '').trim().replace(/^["']|["']$/g, '') }
}

/** One loader's SKILL.md. Deterministic: same source lines, same bytes. */
export function loaderFor(sourceText) {
  const { name, description, value } = frontmatterLines(sourceText)
  return [
    '---',
    name,
    description,
    '---',
    '',
    `# ${value}`,
    '',
    `This is a loader. The \`${value}\` instructions live in krishanraja/ai-harness main and are read at call time, so this account never runs a stale copy.`,
    '',
    `1. Call Control Center \`get_skill\` with name \`${value}\`. Follow the returned \`text\` as this skill's instructions, in full.`,
    `2. When those instructions name a reference file, read it with \`get_skill\`, name \`${value}\` and that file's path.`,
    '3. If Control Center is not connected or `get_skill` fails, say so plainly and do not do the work this skill governs from memory or from an older copy.',
    '',
  ].join('\n')
}

/** Every production skill under skills/, by directory, sorted. */
export function productionSkills(root = HARNESS) {
  const dir = join(root, 'skills')
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, 'SKILL.md')))
    .map((d) => d.name)
    .sort()
}

/** The loaders skills/ implies right now, as { name: text }. */
export function expectedLoaders(root = HARNESS) {
  const out = {}
  for (const name of productionSkills(root)) {
    const text = loaderFor(readFileSync(join(root, 'skills', name, 'SKILL.md'), 'utf8'))
    if (frontmatterLines(text).value !== name) throw new Error(`skills/${name} names itself ${frontmatterLines(text).value}`)
    out[name] = text
  }
  return out
}

/** What differs between the committed loaders and skills/. */
export function drift(root = HARNESS) {
  const expected = expectedLoaders(root)
  const dir = join(root, LOADERS)
  const present = existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : []
  const problems = []
  for (const [name, text] of Object.entries(expected)) {
    const file = join(dir, name, 'SKILL.md')
    if (!existsSync(file)) problems.push(`${name}: loader missing`)
    else if (readFileSync(file, 'utf8') !== text) problems.push(`${name}: loader out of date with skills/${name}/SKILL.md`)
  }
  for (const name of present) if (!(name in expected)) problems.push(`${name}: loader for a skill that is not in skills/`)
  return problems
}

export function write(root = HARNESS) {
  const dir = join(root, LOADERS)
  const expected = expectedLoaders(root)
  if (existsSync(dir)) {
    for (const d of readdirSync(dir, { withFileTypes: true })) {
      if (d.isDirectory() && !(d.name in expected)) rmSync(join(dir, d.name), { recursive: true })
    }
  }
  for (const [name, text] of Object.entries(expected)) {
    mkdirSync(join(dir, name), { recursive: true })
    writeFileSync(join(dir, name, 'SKILL.md'), text)
  }
  return Object.keys(expected)
}

/** A stored (uncompressed) zip holding <name>/SKILL.md, which claude.ai's skill upload accepts. */
export function zipOne(name, text) {
  const path = Buffer.from(`${name}/SKILL.md`)
  const data = Buffer.from(text)
  const crc = crc32(data)
  const local = Buffer.alloc(30)
  local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt32LE(0, 6)
  local.writeUInt32LE(0x00210000, 10) // 1980-01-01 00:00, so the bytes never depend on the clock
  local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22)
  local.writeUInt16LE(path.length, 26); local.writeUInt16LE(0, 28)
  const central = Buffer.alloc(46)
  central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6)
  central.writeUInt32LE(0, 8); central.writeUInt32LE(0x00210000, 12); central.writeUInt32LE(crc, 16)
  central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(path.length, 28)
  central.fill(0, 30, 42); central.writeUInt32LE(0, 42)
  const centralOffset = local.length + path.length + data.length
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(0, 4); end.writeUInt16LE(0, 6)
  end.writeUInt16LE(1, 8); end.writeUInt16LE(1, 10)
  end.writeUInt32LE(central.length + path.length, 12); end.writeUInt32LE(centralOffset, 16); end.writeUInt16LE(0, 20)
  return Buffer.concat([local, path, data, central, path, end])
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  if (args.includes('--check')) {
    const problems = drift()
    for (const p of problems) console.error(`drift  ${p}`)
    if (problems.length) {
      console.error('Run node scripts/build-cloud-loaders.mjs and commit adapters/cloud/loaders/. Each changed loader is one upload owed to each claude.ai account.')
      process.exit(1)
    }
    console.log(`ok     ${Object.keys(expectedLoaders()).length} loaders match skills/`)
  } else {
    const names = write()
    console.log(`wrote  ${names.length} loaders to ${LOADERS}`)
    const pack = args.indexOf('--pack')
    if (pack !== -1) {
      const out = resolve(args[pack + 1] || '')
      if (!args[pack + 1]) throw new Error('--pack needs a directory')
      mkdirSync(out, { recursive: true })
      const loaders = expectedLoaders()
      for (const name of names) writeFileSync(join(out, `${name}.zip`), zipOne(name, loaders[name]))
      console.log(`packed ${names.length} zips to ${out}`)
    }
  }
}
