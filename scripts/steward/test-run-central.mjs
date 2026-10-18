#!/usr/bin/env node
/** Prepared route integration; local git sources and injected GitHub only. */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TARGETS, cloneTarget, prepareCentral, publishCentral, validateRollout } from './run-central.mjs'
import { validateDraft } from './central-draft.mjs'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const scratch = mkdtempSync('/tmp/harness-docs-run-test-')
chmodSync(scratch, 0o700)
const source = join(scratch, 'source')
mkdirSync(source)
const now = Date.now(), today = new Date(now).toISOString().slice(0, 10), repository = 'krishanraja/ai-harness'
const git = (cwd, ...args) => execFileSync('git', ['-c', 'core.hooksPath=/dev/null', ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
const write = (path, value) => { mkdirSync(dirname(join(source, path)), { recursive: true }); writeFileSync(join(source, path), value) }
const sourcePaths = ['README.md', 'AGENTS.md', 'contract/krish-operating-contract.md', 'contract/skill-routing-contract.md', 'contract/active-skill-quality-standard.md', 'state/skill-registry.yaml', 'state/fleet.yaml', 'contract/paths.yaml', 'NOW.md', 'docs/history/LOG.md']
let sequence = 0, passed = 0, failed = 0, fetches = 0
const actualFetch = globalThis.fetch
globalThis.fetch = async () => { fetches++; throw new Error('fixture_network_forbidden') }
async function test(name, run) { try { await run(); passed++; console.log(`ok central docs runner: ${name}`) } catch (error) { failed++; console.error(`FAIL central docs runner: ${name}\n${error.stack}`) } }
const metadata = { full_name: repository, id: 123, private: false, visibility: 'public', default_branch: 'main', archived: false }
let head, originalNow
function ghFixture() {
  const heads = new Map([['main', head]]), commits = new Map(), files = new Map(), effects = []
  let pr = null
  return {
    meta: structuredClone(metadata), effects, heads,
    async req(method, path) {
      assert.equal(method, 'GET')
      if (path === `/repos/${repository}`) return this.meta
      if (path === '/repos/krishanraja/control-center') return { ...this.meta, full_name: 'krishanraja/control-center', id: 456, private: true, visibility: 'private' }
      if (path.includes('/git/commits/')) return commits.get(path.split('/').at(-1))
      if (path.includes('/compare/')) return { files: [...files.values()].at(-1).map((file) => ({ filename: file.path, status: 'modified' })) }
      throw new Error('fixture_unknown_read')
    },
    async headSha(_name, branch) { return heads.get(branch) },
    async branchExists(_name, branch) { return heads.has(branch) },
    async createBranch(_name, branch, sha) { effects.push('branch'); heads.set(branch, sha) },
    async commitFiles(_name, branch, parent, changed, message) {
      assert.equal(heads.get(branch), parent)
      const next = createHash('sha1').update(JSON.stringify({ parent, changed, message })).digest('hex')
      effects.push('commit'); heads.set(branch, next)
      commits.set(next, { parents: [{ sha: parent }], message })
      files.set(next, Object.entries(changed).map(([path, content]) => ({ path, content })))
      return { sha: next }
    },
    async getFile(_name, path, ref) { return { text: files.get(ref)?.find((file) => file.path === path)?.content } },
    async findPull() { return pr },
    async openPull(_name, options) {
      effects.push('pull')
      assert.equal(options.draft, true)
      assert.match(options.title, /^docs\(steward\):/)
      assert.equal(options.body.includes('Bounded fixture'), false)
      pr = { number: 7, state: 'open', head: { sha: heads.get(options.head), repo: { full_name: repository } }, base: { ref: options.base } }
      return pr
    },
  }
}
const clone = ({ destination, head: revision }) => { git(scratch, 'clone', '--no-hardlinks', '--no-checkout', '--', source, destination); git(destination, 'checkout', '--detach', revision) }
const rollout = () => ({ schema_version: 1, enabled: true, approval_ref: 'fixture:docs:approved', target_allowlist: TARGETS, entries: [{ repository, enabled: true, approval_ref: 'fixture:target:approved', visibility: 'public', source_paths: sourcePaths, write_paths: ['NOW.md', 'docs/history/LOG.md'] }] })
async function prepared() {
  const config = rollout(), gh = ghFixture(), workDir = join(scratch, `work-${++sequence}`)
  const result = await prepareCentral({ rollout: config, repository, workDir, gh, clone, requestId: `fixture:docs:${sequence}`, now })
  assert.equal(result.status, 'prepared')
  return { rollout: config, gh, workDir, pack: JSON.parse(readFileSync(join(workDir, 'pack.json'), 'utf8')) }
}
function bundle(f, noChange = false) {
  const files = noChange ? [] : [{ path: 'NOW.md', content: originalNow.replace(/^head: .+$/m, 'head: ' + head).replace('Bounded fixture.', 'Bounded fixture with verified detail.') }]
  const result = validateDraft({ repoDir: join(f.workDir, 'target'), pack: f.pack, draft: { schema_version: 1, disposition: noChange ? 'no-change' : 'changed', files, required_updates: [] }, now })
  writeFileSync(join(f.workDir, 'bundle.json'), JSON.stringify(result), { mode: 0o600 })
  return result
}
try {
  git(source, 'init', '--initial-branch=main')
  git(source, 'config', 'user.name', 'Fixture')
  git(source, 'config', 'user.email', 'hello@krishraja.com')
  for (const path of sourcePaths.filter((path) => path !== 'NOW.md')) write(path, path === 'docs/history/LOG.md' ? `# History\n\n## ${today}\n\n- Existing accepted history.\n` : '# Fixture evidence\n')
  write('scripts/render.mjs', 'process.exit(0)\n')
  write('scripts/validate-surfaces.mjs', 'process.exit(0)\n')
  git(source, 'add', '.')
  git(source, 'commit', '-m', 'Fixture initial evidence')
  const base = git(source, 'rev-parse', 'HEAD')
  originalNow = `---\nrepo: ${repository}\nproduct: Fixture\nas_of: ${today}\nhead: ${base}\nlifecycle: building\nproduction_url: none\nstate_doc: state/skill-registry.yaml\nhistory_log: docs/history/LOG.md\ntruth_files: [state/skill-registry.yaml, state/fleet.yaml, contract/paths.yaml]\nauthority_order: [AGENTS.md]\nsteward: https://github.com/krishanraja/ai-harness/blob/main/docs/steward/RUNBOOK.md\n---\n# Fixture\n\n## What it is\n\nBounded fixture.\n\n## Who it is for and why it matters for Mindmake\n\nSynthetic evidence.\n\n## Where it is right now (as of ${today})\n\nBuilding.\n\n## What changed recently\n\n- ${today} Added a fixture.\n\n## What is next and what is waiting on Krish\n\nNothing.\n\n## Read next\n\nREADME.md\n\n## Do not trust\n\nNo production claims.\n`
  write('NOW.md', originalNow)
  git(source, 'add', '.')
  git(source, 'commit', '-m', 'docs(steward): fixture baseline')
  head = git(source, 'rev-parse', 'HEAD')
  await test('checked-in route is disabled and performs no reads or writes', async () => {
    const config = JSON.parse(readFileSync(join(ROOT, 'config/docs-steward-rollout.json'), 'utf8'))
    assert.equal(config.enabled, false); assert.equal(config.approval_ref, null); assert.deepEqual(config.entries, [])
    assert.deepEqual(await prepareCentral({ rollout: config }), { status: 'disabled', source_files: 0 })
    assert.deepEqual(await publishCentral({ rollout: config }), { status: 'disabled', changed_files: 0 })
  })
  await test('target allowlist and explicit approvals cannot widen implicitly', async () => {
    assert.throws(() => validateRollout({ ...rollout(), target_allowlist: [...TARGETS, 'krishanraja/mindmake'] }), /docs_central_rollout_invalid/)
    assert.throws(() => validateRollout({ ...rollout(), approval_ref: null }), /docs_central_approval_required/)
    const config = rollout(); config.entries.push(config.entries[0])
    assert.throws(() => validateRollout(config), /docs_central_entry_invalid/)
  })
  await test('clone authorization exists only in child env, never URL or checkout config', async () => {
    const observed = []
    cloneTarget({ repository, head, destination: '/fixture/target', scratch: '/fixture', token: 'fixture-transient-auth', runGit: (cwd, args, env) => observed.push({ cwd, args, env: { ...env } }) })
    assert.equal(observed.length, 2)
    assert.equal(observed[0].args.some((value) => value.includes('fixture-transient-auth')), false)
    assert.match(observed[0].env.GIT_CONFIG_VALUE_0, /^AUTHORIZATION: basic /)
    assert.equal(observed[1].env.GIT_CONFIG_VALUE_0, undefined)
    assert.equal(observed[1].env.GIT_CONFIG_COUNT, undefined)
    assert.equal(observed[0].env.FLEET_TOKEN, undefined)
  })
  await test('prepare pins identity/head and creates private handoff outside checkouts', async () => {
    const f = await prepared()
    assert.equal(f.pack.head, head)
    assert.equal(f.pack.visibility, 'public')
    assert.equal(statSync(f.workDir).mode & 0o777, 0o700)
    for (const path of ['config.json', 'pack.json', 'prepared.json']) assert.equal(statSync(join(f.workDir, path)).mode & 0o777, 0o600)
    assert.equal(readFileSync(join(f.workDir, 'target/.git/config'), 'utf8').includes('AUTHORIZATION'), false)
    assert.deepEqual(f.gh.effects, [])
  })
  await test('private sources are rejected before clone in the public harness context', async () => {
    const config = rollout(), gh = ghFixture(); let clones = 0
    config.entries[0] = { ...config.entries[0], repository: 'krishanraja/control-center', visibility: 'private', private_approval: { approvalRef: 'fixture:private:approved' } }
    await assert.rejects(() => prepareCentral({ rollout: config, repository: 'krishanraja/control-center', workDir: join(scratch, 'private-denied'), gh, clone: () => { clones++ }, requestId: 'fixture:private:1', now }), /docs_central_private_execution_required/)
    assert.equal(clones, 0)
  })
  await test('visibility change fails before local source collection', async () => {
    const config = rollout(), gh = ghFixture(); gh.meta.private = true; gh.meta.visibility = 'private'; let clones = 0
    await assert.rejects(() => prepareCentral({ rollout: config, repository, workDir: join(scratch, 'visibility-denied'), gh, clone: () => { clones++ }, requestId: 'fixture:visibility:1', now }), /docs_central_visibility_changed/)
    assert.equal(clones, 0)
  })
  await test('writer no-op and dry run have no GitHub mutations', async () => {
    const f = await prepared(); bundle(f)
    assert.equal((await publishCentral({ ...f, dryRun: true, now })).status, 'validated-dry-run')
    assert.deepEqual(f.gh.effects, [])
    const g = await prepared(); bundle(g, true)
    assert.equal((await publishCentral({ ...g, dryRun: false, now })).status, 'no-change')
    assert.deepEqual(g.gh.effects, [])
  })
  await test('writer opens and reads back one draft PR, then coalesces exact retry', async () => {
    const f = await prepared(); bundle(f)
    const first = await publishCentral({ ...f, dryRun: false, now })
    assert.deepEqual(first, { status: 'proposed', changed_files: 1, pull_number: 7 })
    assert.deepEqual(f.gh.effects, ['branch', 'commit', 'pull'])
    assert.deepEqual(await publishCentral({ ...f, dryRun: false, now }), first)
    assert.deepEqual(f.gh.effects, ['branch', 'commit', 'pull'])
    assert.equal(git(source, 'rev-parse', 'HEAD'), head)
    assert.equal(readFileSync(join(source, 'NOW.md'), 'utf8'), originalNow)
  })
  await test('moved default head stops before branch creation', async () => {
    const f = await prepared(); bundle(f); f.gh.heads.set('main', 'f'.repeat(40))
    await assert.rejects(() => publishCentral({ ...f, dryRun: false, now }), /docs_central_remote_head_moved/)
    assert.deepEqual(f.gh.effects, [])
  })
  await test('head movement during local gates also stops before branch creation', async () => {
    const f = await prepared(); bundle(f)
    const readHead = f.gh.headSha.bind(f.gh); let mainReads = 0
    f.gh.headSha = async (name, branch) => branch === 'main' && ++mainReads > 1 ? 'f'.repeat(40) : readHead(name, branch)
    await assert.rejects(() => publishCentral({ ...f, dryRun: false, now }), /docs_central_remote_head_moved/)
    assert.deepEqual(f.gh.effects, [])
  })
  await test('changed rollout, forged bundle and protected paths fail before mutation', async () => {
    const f = await prepared(); bundle(f); const changed = structuredClone(f.rollout); changed.approval_ref = 'fixture:other:approval'
    await assert.rejects(() => publishCentral({ ...f, rollout: changed, dryRun: false, now }), /docs_central_preparation_changed/)
    const current = JSON.parse(readFileSync(join(f.workDir, 'bundle.json'), 'utf8'))
    current.files[0].path = 'AGENTS.md'
    writeFileSync(join(f.workDir, 'bundle.json'), JSON.stringify(current))
    await assert.rejects(() => publishCentral({ ...f, dryRun: false, now }), /docs_response_file_invalid/)
    assert.deepEqual(f.gh.effects, [])
  })
  await test('existing unrecognized steward branch is never reset or overwritten', async () => {
    const f = await prepared(); bundle(f); f.gh.heads.set(`steward/${today}`, 'e'.repeat(40))
    await assert.rejects(() => publishCentral({ ...f, dryRun: false, now }))
    assert.deepEqual(f.gh.effects, [])
  })
  await test('workflow is trusted-main dispatch-only with no model fleet credential or uploads', async () => {
    const source = readFileSync(join(ROOT, '.github/workflows/docs-steward-central.yml'), 'utf8')
    // GitHub rejects runner context in jobs.<id>.env before allocating a runner.
    const jobEnv = source.match(/^    env:\n((?:^      .*(?:\n|$))*)/m)?.[1] || ''
    assert.doesNotMatch(jobEnv, /\$\{\{\s*runner\./)
    assert.match(source, /DOCS_WORK_DIR=\$RUNNER_TEMP\/harness-docs-central.*GITHUB_ENV/)
    assert.match(source, /workflow_dispatch:/)
    assert.doesNotMatch(source, /\bschedule:|\bworkflow_call:|\bpush:|upload-artifact|claude-code-action/)
    assert.match(source, /default: true/)
    assert.match(source, /github\.ref == 'refs\/heads\/main'/)
    const model = source.slice(source.indexOf('      - name: Draft through'), source.indexOf('      - name: Revalidate source'))
    assert.match(model, /HARNESS_BUDGET_TOKEN/)
    assert.doesNotMatch(model, /FLEET_TOKEN/)
    assert.match(source, /persist-credentials: false/)
  })
  assert.equal(fetches, 0)
} finally { globalThis.fetch = actualFetch; rmSync(scratch, { recursive: true, force: true }) }
console.log(`central docs runner: ${passed} groups passed, ${failed} failed; no network, provider calls or real target writes`)
if (failed) process.exitCode = 1
