#!/usr/bin/env node
/**
 * Every fleet copy of the codex_thread tool matches the canonical one here.
 *
 * Claude starts Codex only through the repository's codex_thread tool,
 * scripts/codex_thread.mjs, canonical in ai-harness (Ruling, Krish,
 * 2026-11-15; docs/proposals/2026-11-15-visible-codex-sessions.md). A change
 * is made here first, then copied unchanged to the same path in every
 * repository that starts Codex. This reads each fleet repository's default
 * branch and says, for each one:
 *
 *   - a copy that differs from this repository's bytes (`differs`);
 *   - a repository that dispatches Codex but carries no copy (`missing`);
 *   - a dispatch path that still names the Codex plugin's long-running server
 *     (`plugin_server`), which keeps the thread out of Krish's Codex Desktop.
 *
 * GET requests only, on the fleet token the digest already uses (FLEET_TOKEN).
 * Nothing here writes, comments or opens a pull request.
 *
 *   node scripts/codex-thread-copies.mjs [--repo <name>]   prints the report; exits 1 on any finding
 */

import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Gh } from './lib/github.mjs'
import { parseYaml } from './lib/yaml.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
export const TOOL_PATH = 'scripts/codex_thread.mjs'

/**
 * Where each repository that starts Codex dispatches it from. Each must carry
 * the tool, and none of these files may name the plugin's long-running server.
 */
export const DISPATCH_PATHS = {
  'content-engine': ['scripts/velib/cards.py'],
  'growth-heartside': [],
  'growth-makeyourmindup': [],
  'growth-mindmake': ['scripts/dispatch-card.mjs'],
  'growth-legibility': ['docs/ENGINE-ARCHITECTURE.md'],
}

/** An invocation of the plugin's background server, as a dispatch would write it. */
export const PLUGIN_SERVER = [/codex-companion\.mjs\s+task\b/, /app-server-broker/]

export const canonical = (root = HARNESS) => readFileSync(join(root, TOOL_PATH), 'utf8')

/** Whether a text names the plugin's long-running server. Pure. */
export const namesPluginServer = (text) => PLUGIN_SERVER.some((re) => re.test(String(text ?? '')))

/**
 * The findings for one repository, from what was read. Pure.
 * copy: the tool's text, or null when the repository has none.
 * dispatch: { path: text | null } for the repository's dispatch paths.
 */
export function findingsFor(repo, { copy, dispatch = {} }, canon) {
  const out = []
  const dispatches = Object.hasOwn(DISPATCH_PATHS, repo)
  if (copy == null) {
    if (dispatches) out.push({ repo, kind: 'missing', path: TOOL_PATH })
  } else if (copy !== canon) {
    out.push({ repo, kind: 'differs', path: TOOL_PATH })
  }
  for (const [path, text] of Object.entries(dispatch)) {
    if (text != null && namesPluginServer(text)) out.push({ repo, kind: 'plugin_server', path })
  }
  return out
}

const WORDS = {
  differs: 'differs from the canonical copy in ai-harness; copy it unchanged',
  missing: 'is missing, though this repository starts Codex',
  plugin_server: "names the Codex plugin's long-running server; dispatch through codex_thread open and send instead",
}

/** The report lines. Pure. */
export function report({ checked, findings, unreadable = [] }) {
  const lines = [`codex_thread copies: ${checked.length} repositor${checked.length === 1 ? 'y' : 'ies'} read, ${findings.length} finding${findings.length === 1 ? '' : 's'}.`]
  for (const f of findings) lines.push(`FAIL  ${f.repo}: ${f.path} ${WORDS[f.kind]}.`)
  for (const u of unreadable) lines.push(`FAIL  ${u.repo}: could not be read (${u.reason}).`)
  return lines
}

/** Reads every fleet repository (or one) and returns what it found. */
export async function readFleet(gh, fleet, canon, { only = null } = {}) {
  const names = new Set((fleet.repos || []).map((r) => r.name))
  for (const name of Object.keys(DISPATCH_PATHS)) names.add(name)
  const checked = [], findings = [], unreadable = []
  for (const repo of names) {
    if (repo === 'ai-harness') continue
    if (only && repo.toLowerCase() !== String(only).toLowerCase()) continue
    try {
      const { branch } = await gh.defaultBranch(repo)
      const copy = (await gh.getFile(repo, TOOL_PATH, branch))?.text ?? null
      const dispatch = {}
      for (const path of DISPATCH_PATHS[repo] || []) dispatch[path] = (await gh.getFile(repo, path, branch))?.text ?? null
      checked.push(repo)
      findings.push(...findingsFor(repo, { copy, dispatch }, canon))
    } catch (e) { unreadable.push({ repo, reason: e.status ? `github-${e.status}` : 'error' }) }
  }
  return { checked, findings, unreadable }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const args = process.argv.slice(2), at = args.indexOf('--repo')
  const token = process.env.FLEET_TOKEN || process.env.GITHUB_TOKEN
  if (!token) { console.error('FLEET_TOKEN (or GITHUB_TOKEN) is not set; the copies cannot be read.'); process.exit(1) }
  const fleet = parseYaml(readFileSync(join(HARNESS, 'state/fleet.yaml'), 'utf8'))
  const gh = new Gh(token, { owner: fleet.owner, dryRun: true })
  const result = await readFleet(gh, fleet, canonical(), { only: at < 0 ? null : args[at + 1] })
  console.log(report(result).join('\n'))
  process.exit(result.findings.length || result.unreadable.length ? 1 : 0)
}
