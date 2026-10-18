#!/usr/bin/env node
/** Deterministic docs prepare/publish. No model call, auto-merge or raw logging. */
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync, appendFileSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Gh } from '../lib/github.mjs'
import { buildSourcePack, validateDraft } from './central-draft.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export const TARGETS = ['ai-harness', 'control-center', 'mindmake-ctrl', 'fractionl-circle', 'fractionl-pulse', 'full-time', 'content-engine', 'contentarchives', 'AEO-Engine', 'makeyourmindup'].map((name) => 'krishanraja/' + name)
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const plain = (value) => value && typeof value === 'object' && !Array.isArray(value)
function fail(code) { const error = new Error(code); error.code = code; throw error }
function safeGit(cwd, args, env = process.env) {
  try { return execFileSync('git', ['-c', 'core.hooksPath=/dev/null', '-c', 'credential.helper=', ...args], { cwd, env, encoding: 'utf8', timeout: 120000, maxBuffer: 2 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }).trim() }
  catch { fail('docs_central_git_failed') }
}
function json(path) { try { return JSON.parse(readFileSync(path, 'utf8')) } catch { fail('docs_central_state_invalid') } }
function localWrite(path, value) { writeFileSync(path, JSON.stringify(value) + '\n', { flag: 'wx', mode: 0o600 }) }
export function validateRollout(rollout) {
  if (!plain(rollout) || rollout.schema_version !== 1 || typeof rollout.enabled !== 'boolean' || !Array.isArray(rollout.target_allowlist) || JSON.stringify([...rollout.target_allowlist].sort()) !== JSON.stringify([...TARGETS].sort()) || !Array.isArray(rollout.entries)) fail('docs_central_rollout_invalid')
  if (rollout.enabled && !/^[A-Za-z0-9:._-]{3,120}$/.test(rollout.approval_ref || '')) fail('docs_central_approval_required')
  const seen = new Set()
  for (const entry of rollout.entries) {
    if (!plain(entry) || !TARGETS.includes(entry.repository) || seen.has(entry.repository) || typeof entry.enabled !== 'boolean' || !['public', 'private'].includes(entry.visibility) || !Array.isArray(entry.source_paths) || !Array.isArray(entry.write_paths) || !/^[A-Za-z0-9:._-]{3,120}$/.test(entry.approval_ref || '')) fail('docs_central_entry_invalid')
    seen.add(entry.repository)
  }
  return rollout
}
function selected(rollout, repository) {
  validateRollout(rollout)
  if (!rollout.enabled) return null
  const entry = rollout.entries.find((entry) => entry.repository === repository && entry.enabled)
  if (!entry) fail('docs_central_target_not_enabled')
  return entry
}
async function metadata(gh, repository) {
  const value = await gh.req('GET', `/repos/${repository}`)
  if (value?.full_name !== repository || !Number.isSafeInteger(value.id) || typeof value.private !== 'boolean' || value.archived || value.disabled || !/^[A-Za-z0-9._/-]+$/.test(value.default_branch || '')) fail('docs_central_target_identity_invalid')
  const visibility = value.private ? 'private' : 'public'
  if (value.visibility && value.visibility !== visibility) fail('docs_central_visibility_conflict')
  return { repository, id: value.id, branch: value.default_branch, visibility }
}
async function context(gh, entry, executionRepository, head, now) {
  const target = await metadata(gh, entry.repository)
  if (target.visibility !== entry.visibility) fail('docs_central_visibility_changed')
  let executionContext
  if (target.visibility === 'private') {
    if (!entry.private_approval) fail('docs_central_private_approval_required')
    const executor = await metadata(gh, executionRepository)
    if (executor.visibility !== 'private') fail('docs_central_private_execution_required')
    executionContext = { repository: executor.repository, visibility: executor.visibility, verifiedAt: new Date(now).toISOString() }
  }
  return { target, executionContext, classification: { repository: target.repository, head, visibility: target.visibility, verifiedAt: new Date(now).toISOString() } }
}

export function cloneTarget({ repository, head, destination, token, scratch, runGit = safeGit }) {
  if (!token) fail('docs_central_fleet_access_missing')
  const env = { PATH: process.env.PATH || '/usr/bin:/bin', HOME: scratch, TMPDIR: scratch, GIT_TERMINAL_PROMPT: '0', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'http.https://github.com/.extraheader', GIT_CONFIG_VALUE_0: 'AUTHORIZATION: basic ' + Buffer.from('x-access-token:' + token).toString('base64') }
  // Env-only authorization is never put in the remote URL or local git config.
  runGit(scratch, ['clone', '--no-checkout', '--no-hardlinks', '--', `https://github.com/${repository}.git`, destination], env)
  delete env.GIT_CONFIG_VALUE_0
  delete env.GIT_CONFIG_KEY_0
  delete env.GIT_CONFIG_COUNT
  runGit(destination, ['checkout', '--detach', head], env)
}

export async function prepareCentral({ rollout, repository, workDir, gh, clone = cloneTarget, token, executionRepository = 'krishanraja/ai-harness', requestId, now = Date.now() }) {
  const entry = selected(rollout, repository)
  if (!entry) return { status: 'disabled', source_files: 0 }
  if (!isAbsolute(workDir) || existsSync(workDir) || !/^[A-Za-z0-9_.:-]{3,160}$/.test(requestId || '')) fail('docs_central_workdir_invalid')
  const { target, executionContext } = await context(gh, entry, executionRepository, null, now)
  const head = await gh.headSha(repository.split('/')[1], target.branch)
  if (!/^[a-f0-9]{40}$/.test(head || '')) fail('docs_central_head_invalid')
  // A private source is checked against its exact approval before even cloning.
  if (target.visibility === 'private' && (entry.private_approval.head !== head || entry.private_approval.repository !== repository || entry.private_approval.executionRepository !== executionRepository || entry.private_approval.destination !== 'anthropic-api' || entry.private_approval.purpose !== 'docs' || !/^[A-Za-z0-9:._-]{3,120}$/.test(entry.private_approval.approvalRef || '') || JSON.stringify([...(entry.private_approval.sourcePaths || [])].sort()) !== JSON.stringify([...entry.source_paths].sort()) || !Number.isFinite(Date.parse(entry.private_approval.expiresAt)) || Date.parse(entry.private_approval.expiresAt) <= now)) fail('docs_central_private_approval_required')
  const parent = realpathSync(dirname(workDir))
  if (parent === ROOT || parent.startsWith(ROOT + '/')) fail('docs_central_workdir_must_leave_checkout')
  mkdirSync(workDir, { mode: 0o700 })
  chmodSync(workDir, 0o700)
  const repoDir = join(workDir, 'target')
  await clone({ repository, head, destination: repoDir, token, scratch: workDir })
  const config = { repoDir, repository, expectedHead: head, classification: { repository, head, visibility: target.visibility, verifiedAt: new Date(now).toISOString() }, sourcePaths: entry.source_paths, writePaths: entry.write_paths, ...(executionContext ? { executionContext, privateExecutionApproval: entry.private_approval } : {}), requestId }
  const pack = buildSourcePack({ ...config, now })
  localWrite(join(workDir, 'config.json'), config)
  localWrite(join(workDir, 'pack.json'), pack)
  localWrite(join(workDir, 'prepared.json'), { schema_version: 1, rollout_sha256: hash(rollout), target, input_sha256: pack.input_sha256, requestId })
  // Reuse the actual CLI preflight, including the current shared request cap.
  try { execFileSync(process.execPath, [join(ROOT, 'scripts/steward/central-draft.mjs'), '--config', join(workDir, 'config.json'), '--prepare-only'], { env: { PATH: process.env.PATH, HOME: workDir }, stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 }) }
  catch { fail('docs_central_source_preflight_failed') }
  return { status: 'prepared', source_files: pack.files.length, input_sha256: pack.input_sha256 }
}

async function verifyBranch(gh, repository, head, bundle, branch, marker) {
  const name = repository.split('/')[1], actual = await gh.headSha(name, branch)
  const commit = await gh.req('GET', `/repos/${repository}/git/commits/${actual}`)
  if (commit.parents?.length !== 1 || commit.parents[0].sha !== head || !commit.message?.includes(marker)) fail('docs_central_branch_conflict')
  const compared = await gh.req('GET', `/repos/${repository}/compare/${head}...${actual}`)
  if (!Array.isArray(compared.files) || JSON.stringify(compared.files.map((file) => file.filename).sort()) !== JSON.stringify(bundle.files.map((file) => file.path).sort()) || compared.files.some((file) => !['added', 'modified'].includes(file.status))) fail('docs_central_branch_changed_scope')
  for (const file of bundle.files) if ((await gh.getFile(name, file.path, actual))?.text !== file.content) fail('docs_central_branch_readback_failed')
  return actual
}

export async function publishCentral({ rollout, workDir, gh, dryRun = true, executionRepository = 'krishanraja/ai-harness', now = Date.now() }) {
  validateRollout(rollout)
  if (!rollout.enabled) return { status: 'disabled', changed_files: 0 }
  const config = json(join(workDir, 'config.json')), pack = json(join(workDir, 'pack.json')), prepared = json(join(workDir, 'prepared.json')), bundle = json(join(workDir, 'bundle.json'))
  const entry = selected(rollout, config.repository)
  if (prepared.schema_version !== 1 || prepared.rollout_sha256 !== hash(rollout) || prepared.input_sha256 !== pack.input_sha256 || config.repoDir !== join(workDir, 'target') || JSON.stringify(config.sourcePaths) !== JSON.stringify(entry.source_paths) || JSON.stringify(config.writePaths) !== JSON.stringify(entry.write_paths)) fail('docs_central_preparation_changed')
  const { target } = await context(gh, entry, executionRepository, pack.head, now)
  if (target.id !== prepared.target.id || target.branch !== prepared.target.branch || target.visibility !== prepared.target.visibility || await gh.headSha(target.repository.split('/')[1], target.branch) !== pack.head) fail('docs_central_remote_head_moved')
  const rebuilt = buildSourcePack({ ...config, now })
  if (JSON.stringify(rebuilt) !== JSON.stringify(pack)) fail('docs_central_source_changed')
  const checked = validateDraft({ repoDir: config.repoDir, pack, draft: { schema_version: 1, disposition: bundle.disposition, files: bundle.files, required_updates: [] }, now })
  if (JSON.stringify(checked) !== JSON.stringify(bundle)) fail('docs_central_bundle_changed')
  if (!checked.files.length) return { status: 'no-change', changed_files: 0 }
  if (dryRun) return { status: 'validated-dry-run', changed_files: checked.files.length }
  const name = target.repository.split('/')[1], date = new Date(now).toISOString().slice(0, 10), branch = `steward/${date}`
  const marker = `Input: ${checked.input_sha256}\nDraft: ${checked.draft_sha256}`
  if (await gh.headSha(name, target.branch) !== pack.head) fail('docs_central_remote_head_moved')
  if (!await gh.branchExists(name, branch)) await gh.createBranch(name, branch, pack.head)
  const branchHead = await gh.headSha(name, branch)
  if (branchHead === pack.head) {
    if (await gh.headSha(name, target.branch) !== pack.head) fail('docs_central_remote_head_moved')
    await gh.commitFiles(name, branch, pack.head, Object.fromEntries(checked.files.map((file) => [file.path, file.content])), `docs(steward): ${date} reconcile approved documentation\n\n${marker}\nApproved rollout: ${rollout.approval_ref}`)
  }
  const actual = await verifyBranch(gh, target.repository, pack.head, checked, branch, marker)
  let pr = await gh.findPull(name, branch, target.branch)
  if (!pr) pr = await gh.openPull(name, { title: `docs(steward): ${date} reconcile approved documentation`, head: branch, base: target.branch, draft: true, body: `Reconciles ${checked.files.length} approved Markdown files after deterministic source and repository validation.\n\n${marker}\n\nThis pull request requires review. No merge or deployment is performed.` })
  // Read back even a newly opened PR; provider success is not the postcondition.
  pr = await gh.findPull(name, branch, target.branch)
  if (!pr || pr.head?.sha !== actual || pr.head?.repo?.full_name !== target.repository || pr.base?.ref !== target.branch || pr.state !== 'open' || !Number.isSafeInteger(pr.number)) fail('docs_central_pull_readback_failed')
  return { status: 'proposed', changed_files: checked.files.length, pull_number: pr.number }
}

async function main() {
  const args = process.argv.slice(2), flag = (name) => args[args.indexOf(name) + 1]
  if (!['prepare', 'publish'].includes(args[0])) fail('docs_central_stage_invalid')
  const rollout = validateRollout(json(join(ROOT, 'config/docs-steward-rollout.json')))
  if (!rollout.enabled) { console.log(JSON.stringify({ status: 'disabled' })); if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, 'status=disabled\n'); return }
  const gh = new Gh(process.env.FLEET_TOKEN)
  const options = { rollout, workDir: flag('--work-dir'), gh, executionRepository: process.env.GITHUB_REPOSITORY || 'krishanraja/ai-harness' }
  const result = args[0] === 'prepare' ? await prepareCentral({ ...options, repository: flag('--repository'), token: process.env.FLEET_TOKEN, requestId: `${process.env.GITHUB_RUN_ID || 'manual'}:${process.env.GITHUB_RUN_ATTEMPT || '1'}:docs:${flag('--repository')?.split('/')[1]}` }) : await publishCentral({ ...options, dryRun: !args.includes('--write') })
  console.log(JSON.stringify(result))
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `status=${result.status}\n`)
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(JSON.stringify({ status: 'blocked', reason: /^docs_[a-z_]+$/.test(error?.code || '') ? error.code : 'docs_central_failed' })); process.exitCode = 1 })
}
