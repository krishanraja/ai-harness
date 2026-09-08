#!/usr/bin/env node
/**
 * The reconciler: changes flow both ways, and nothing good is ever overwritten.
 *
 * Every night it reads each fleet repository's canon block and classifies what
 * it finds. The classification is arithmetic, not judgement, because the start
 * marker carries the sha256 of the body it introduces:
 *
 *   exact        body hashes to its stamp, and the stamp is the current canon
 *                -> nothing, a heartbeat line
 *   canon-moved  body hashes to its stamp, canon has moved on
 *                -> re-render, one pull request
 *   inbound-edit body does NOT hash to its stamp: someone edited it in place
 *                -> a proposal back to the canon, carrying the diff. Never an
 *                   overwrite. This is the half the installer cannot do, and
 *                   the reason "we do not overwrite good stuff" is a mechanism
 *                   rather than a promise.
 *   both-moved   body edited AND canon moved
 *                -> hard stop. One finding naming both versions, no write.
 *   missing      no block at all
 *                -> insert it, one pull request
 *
 * Content outside the markers is never read for comparison and never written.
 *
 * Runs in the cloud with one cross-repository credential and no checkout of the
 * repositories it reconciles. No machine, no browser, no local path.
 *
 *   node scripts/reconcile.mjs [--dry-run] [--repo <name>] [--out <path>]
 *
 * FLEET_TOKEN (fine-grained, contents and pull-requests write on the fleet) is
 * required to write. Without it the run reports what it would do and exits 0,
 * saying so in one named line rather than passing quietly.
 */

import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'
import { Gh } from './lib/github.mjs'
import { blockFor, inspect, splice, renderBlock } from './render.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const args = process.argv.slice(2)
const has = (f) => args.includes(f)
const flag = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1] }

const dryRun = has('--dry-run')
const only = flag('--repo')
const token = process.env.FLEET_TOKEN || process.env.GITHUB_TOKEN
const fleet = parseYaml(readFileSync(join(HARNESS, 'state/fleet.yaml'), 'utf8'))
const today = new Date().toISOString().slice(0, 10)
const BRANCH = 'harness/canon-sync'

if (!token) {
  console.error('::error::FLEET_TOKEN is not set. The reconciler reads and writes ten repositories from one job and cannot do either without it. Add a fine-grained PAT with contents and pull-requests write on the fleet as the repository secret FLEET_TOKEN.')
  process.exit(1)
}

const gh = new Gh(token, { owner: fleet.owner, dryRun })
const findings = []
const rows = []

/**
 * A readable diff, with no dependency.
 *
 * A naive index-by-index comparison reports every line after a single
 * insertion as changed, which turns a one-line proposal into fifty lines of
 * noise and makes the thing nobody reads. Longest common subsequence over
 * lines, then two lines of context: the block is under sixty lines, so the
 * quadratic table is nothing.
 */
function diffLines(a, b, context = 2) {
  const A = a.split('\n'), B = b.split('\n')
  const n = A.length, m = B.length
  const L = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1])
    }
  }
  const ops = []
  let i = 0, j = 0
  while (i < n && j < m) {
    if (A[i] === B[j]) { ops.push([' ', A[i]]); i++; j++ }
    else if (L[i + 1][j] >= L[i][j + 1]) { ops.push(['-', A[i]]); i++ }
    else { ops.push(['+', B[j]]); j++ }
  }
  while (i < n) ops.push(['-', A[i++]])
  while (j < m) ops.push(['+', B[j++]])

  // Keep only changed runs plus a little context, so the reader sees the edit.
  const keep = new Set()
  ops.forEach(([k], idx) => {
    if (k === ' ') return
    for (let d = -context; d <= context; d++) if (ops[idx + d]) keep.add(idx + d)
  })
  const out = []
  let gap = false
  ops.forEach(([k, line], idx) => {
    if (!keep.has(idx)) { if (!gap) { out.push('@@'); gap = true } return }
    gap = false
    out.push(`${k} ${line}`)
  })
  return out
}

for (const repo of fleet.repos) {
  if (only && repo.name !== only) continue
  const name = repo.name
  const target = repo.canon_target
  let state
  try {
    const { branch } = await gh.defaultBranch(name)
    const file = await gh.getFile(name, target, branch)
    const wanted = renderBlock(repo)
    const wantedSha = inspect(wanted).sha

    if (!file) {
      state = 'missing-file'
      rows.push({ name, state, note: `${target} does not exist` })
      findings.push({ name, state, detail: `${target} does not exist on ${branch}. The seeder creates it once; this reconciler does not invent a repository's own header.` })
      continue
    }

    const found = inspect(file.text)
    if (!found.present) {
      state = 'missing'
    } else if (!found.intact) {
      state = found.sha === wantedSha ? 'inbound-edit' : 'both-moved'
    } else {
      state = found.sha === wantedSha ? 'exact' : 'canon-moved'
    }

    if (state === 'exact') { rows.push({ name, state, note: `sha ${found.sha}` }); continue }

    if (state === 'inbound-edit' || state === 'both-moved') {
      // Never overwrite. Record what the repository says, so it becomes a
      // proposal against the canon rather than a change nobody decided.
      const renderedForStamp = renderBlock(repo, found.rendered)
      const stampedBody = inspect(renderedForStamp).body
      findings.push({
        name, state,
        detail: state === 'inbound-edit'
          ? `The block in ${name}/${target} was edited in place. Its body no longer hashes to its own stamp, and the canon has not moved since. Nothing was written.`
          : `The block in ${name}/${target} was edited in place AND the canon moved since it was stamped. Two changes, one file, no safe automatic answer. Nothing was written.`,
        stamp: `release=${found.release} sha=${found.sha} rendered=${found.rendered}`,
        canonNow: `release=${inspect(renderBlock(repo)).release} sha=${wantedSha}`,
        diff: diffLines(stampedBody, found.body).slice(0, 80),
      })
      rows.push({ name, state, note: `stamped ${found.sha}, canon ${wantedSha}` })
      continue
    }

    // canon-moved or missing: re-render and open one pull request.
    const after = splice(file.text, blockFor(file.text, repo))
    if (after === file.text) { rows.push({ name, state: 'exact', note: 'no byte change' }); continue }
    rows.push({ name, state, note: `${found.present ? `${found.sha} -> ${wantedSha}` : 'inserting'}` })

    if (dryRun) { findings.push({ name, state, detail: 'dry run, no pull request opened' }); continue }

    const base = (await gh.defaultBranch(name)).branch
    const baseSha = await gh.headSha(name, base)
    if (!(await gh.branchExists(name, BRANCH))) await gh.createBranch(name, BRANCH, baseSha)

    // Re-read on the sync branch so an open pull request updates rather than conflicts.
    const onBranch = await gh.getFile(name, target, BRANCH)
    const branchAfter = splice(onBranch ? onBranch.text : file.text, blockFor(onBranch ? onBranch.text : file.text, repo))
    if (onBranch && branchAfter === onBranch.text) { rows.push({ name, state, note: 'already on the sync branch' }); continue }

    await gh.putFile(name, target, branchAfter, {
      branch: BRANCH,
      sha: onBranch ? onBranch.sha : file.sha,
      message: `docs(canon): sync the canon block to ${inspect(renderBlock(repo)).release}\n\nRendered from krishanraja/ai-harness. Only the text between the\nkrish-canon markers changed; everything outside them is untouched.\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>`,
    })

    const existing = await gh.findPull(name, BRANCH, base)
    if (!existing) {
      const pr = await gh.openPull(name, {
        title: 'Sync the canon block',
        head: BRANCH, base,
        body: [
          `The shared canon moved. This updates only the text between the \`krish-canon\` markers in \`${target}\`.`,
          '',
          `- Was: \`${found.present ? found.sha : 'no block'}\``,
          `- Now: \`${wantedSha}\` at release \`${inspect(renderBlock(repo)).release}\``,
          '',
          'Everything outside the markers is byte-identical. The block carries the sha256 of its own body, so if you edit it here instead, the next run detects that and opens a proposal against the canon rather than overwriting your change.',
          '',
          `Rendered by \`scripts/reconcile.mjs\` in [krishanraja/ai-harness](https://github.com/krishanraja/ai-harness).`,
          '',
          '---',
          '_Generated by [Claude Code](https://claude.ai/code)_',
        ].join('\n'),
      })
      rows.push({ name, state, note: `pull request ${pr.html_url || '(dry run)'}` })
    }
  } catch (e) {
    findings.push({ name, state: 'error', detail: e.message })
    rows.push({ name, state: 'error', note: e.message.slice(0, 120) })
  }
}

// ------------------------------------------------------------------- report
const out = []
const p = (s = '') => out.push(s)
p(`# Canon reconciliation ${today}`)
p()
p('| Repository | State | Detail |')
p('|---|---|---|')
for (const r of rows) p(`| ${r.name} | \`${r.state}\` | ${r.note} |`)
p()
const blocked = findings.filter((f) => f.state === 'inbound-edit' || f.state === 'both-moved')
if (blocked.length) {
  p('## Proposals against the canon')
  p()
  p('These repositories were edited inside the markers. Nothing was overwritten. Each is a proposal: either the edit belongs in the canon for everyone, or it belongs outside the markers in that repository.')
  p()
  for (const f of blocked) {
    p(`### ${f.name} (\`${f.state}\`)`)
    p()
    p(f.detail)
    p()
    p(`- Stamp in the repository: \`${f.stamp}\``)
    p(`- Canon now: \`${f.canonNow}\``)
    p()
    if (f.diff.length) { p('```diff'); for (const l of f.diff) p(l); p('```'); p() }
  }
}
const errors = findings.filter((f) => f.state === 'error')
if (errors.length) {
  p('## Errors')
  p()
  for (const f of errors) p(`- ${f.name}: ${f.detail}`)
  p()
}
if (!blocked.length && !errors.length) { p('Nothing to propose and nothing failed.'); p() }

// ------------------------------------------------------------- proposals
//
// A finding in a run summary is a finding nobody reads. Each blocked repository
// gets one open issue on the canon repository, deduped by title so a nightly
// run does not file the same proposal thirty times. A week with nothing earned
// opens nothing, so an open proposal always means something real.
if (!dryRun) {
  for (const f of blocked) {
    const prefix = `Canon proposal: ${f.name}`
    const fingerprint = createHash('sha256').update(f.diff.join('\n'), 'utf8').digest('hex').slice(0, 12)
    const body = [
      f.detail,
      '',
      `- Repository: \`${fleet.owner}/${f.name}\``,
      `- Stamp found: \`${f.stamp}\``,
      `- Canon now: \`${f.canonNow}\``,
      `- Diff fingerprint: \`${fingerprint}\``,
      '',
      '```diff',
      ...f.diff,
      '```',
      '',
      '## The decision',
      '',
      'One of three, and the reconciler will not pick for you:',
      '',
      '1. **The edit belongs in the canon.** Make it in `contract/templates/canon-block.md`. The next run re-renders every surface and this closes itself.',
      '2. **The edit belongs to that repository alone.** Move it outside the markers in that file. The next run restores the block and leaves your text alone.',
      '3. **The edit was a mistake.** Delete it. The next run restores the block.',
      '',
      'Nothing was overwritten and nothing will be until this is resolved.',
      '',
      '---',
      '_Generated by [Claude Code](https://claude.ai/code)_',
    ].join('\n')
    try {
      const existing = await gh.findIssue('ai-harness', prefix)
      if (!existing) {
        const issue = await gh.openIssue('ai-harness', { title: `${prefix} (${f.state})`, body })
        console.log(`proposal opened: ${issue.html_url}`)
      } else if (!existing.body || !existing.body.includes(fingerprint)) {
        await gh.comment('ai-harness', existing.number, `The edit in \`${f.name}\` changed again.\n\n${body}`)
        console.log(`proposal updated: ${existing.html_url}`)
      } else {
        console.log(`proposal already open and unchanged: ${existing.html_url}`)
      }
    } catch (e) {
      console.log(`::warning::could not file the proposal for ${f.name}: ${e.message}`)
    }
  }
}

const text = out.join('\n') + '\n'
const outPath = flag('--out')
if (outPath) { mkdirSync(dirname(outPath), { recursive: true }); writeFileSync(outPath, text) }
process.stdout.write(text)

const counts = rows.reduce((a, r) => ({ ...a, [r.state]: (a[r.state] || 0) + 1 }), {})
console.log(`\nSummary: ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(' ')}`)
if (errors.length) process.exit(1)
