#!/usr/bin/env node
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSourcePack, draftDocumentation, parseDraft, validateDraft } from './central-draft.mjs'

const NOW = Date.parse('2026-10-18T12:00:00Z')
const root = mkdtempSync('/tmp/harness-central-docs-test-')
chmodSync(root, 0o700)
const repo = join(root, 'target')
mkdirSync(repo)
const git = (...args) => execFileSync('git', ['-c', 'core.hooksPath=/dev/null', ...args], { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, GIT_AUTHOR_DATE: '2026-10-17T12:00:00Z', GIT_COMMITTER_DATE: '2026-10-17T12:00:00Z' } }).trim()
const write = (path, value) => { mkdirSync(dirname(join(repo, path)), { recursive: true }); writeFileSync(join(repo, path), value) }
const sourcePaths = ['README.md', 'AGENTS.md', 'contract/krish-operating-contract.md', 'contract/skill-routing-contract.md', 'contract/active-skill-quality-standard.md', 'state/skill-registry.yaml', 'state/fleet.yaml', 'contract/paths.yaml', 'NOW.md', 'docs/history/LOG.md', 'docs/detail.md']
const log = '# History\n\n## 2026-10-17\n\n- Existing accepted history.\n'
const response = (draft, stop_reason = 'end_turn') => ({ stop_reason, content: [{ type: 'text', text: JSON.stringify(draft) }] })
const changed = (files) => ({ schema_version: 1, disposition: 'changed', files, required_updates: [] })
const noChange = { schema_version: 1, disposition: 'no-change', files: [], required_updates: [] }
const throws = (fn, code) => assert.throws(fn, (error) => error.code === code)
let assertions = 0
function check(fn) { fn(); assertions++ }
try {
  git('init', '--initial-branch=main')
  git('config', 'user.name', 'Fixture')
  git('config', 'user.email', 'hello@krishraja.com')
  for (const path of sourcePaths.filter((p) => p !== 'NOW.md')) write(path, path === 'docs/history/LOG.md' ? log : '# Fixture evidence\n\nExisting accepted detail.\n')
  write('scripts/render.mjs', "process.stdout.write('fixture gate output stays private\\n')\n")
  write('scripts/validate-surfaces.mjs', 'process.exit(0)\n')
  git('add', '.')
  git('commit', '-m', 'Fixture initial evidence')
  const base = git('rev-parse', 'HEAD')
  const nowText = `---\nrepo: krishanraja/ai-harness\nproduct: Fixture\nas_of: 2026-10-18\nhead: ${base}\nlifecycle: building\nproduction_url: none\nstate_doc: state/skill-registry.yaml\nhistory_log: docs/history/LOG.md\ntruth_files: [state/skill-registry.yaml, state/fleet.yaml, contract/paths.yaml]\nauthority_order: [AGENTS.md]\nsteward: https://github.com/krishanraja/ai-harness/blob/main/docs/steward/RUNBOOK.md\n---\n# Fixture\n\n## What it is\n\nA test fixture.\n\n## Who it is for and why it matters for Mindmake\n\nFixture evidence only.\n\n## Where it is right now (as of 2026-10-18)\n\nBuilding.\n\n## What changed recently\n\n- 2026-10-18 Existing accepted detail.\n\n## What is next and what is waiting on Krish\n\nNothing in this fixture.\n\n## Read next\n\nREADME.md\n\n## Do not trust\n\nNo production claims.\n`
  write('NOW.md', nowText)
  git('add', '.')
  git('commit', '-m', 'docs(steward): fixture handoff')
  const head = git('rev-parse', 'HEAD')
  const config = { repoDir: repo, repository: 'krishanraja/ai-harness', expectedHead: head, sourcePaths, writePaths: ['NOW.md', 'docs/history/LOG.md', 'docs/detail.md'], classification: { repository: 'krishanraja/ai-harness', visibility: 'public', head, verifiedAt: new Date(NOW).toISOString() }, now: NOW }
  const pack = buildSourcePack(config)
  check(() => assert.equal(pack.head, head))
  check(() => assert.match(pack.input_sha256, /^[a-f0-9]{64}$/))
  check(() => throws(() => buildSourcePack({ ...config, repository: 'krishanraja/mindmake' }), 'docs_target_not_enrolled'))
  check(() => throws(() => buildSourcePack({ ...config, classification: { ...config.classification, verifiedAt: '2026-01-01T00:00:00Z' } }), 'docs_visibility_unverified'))
  check(() => throws(() => buildSourcePack({ ...config, expectedHead: head.slice(0, 7) }), 'docs_exact_head_required'))
  check(() => throws(() => buildSourcePack({ ...config, sourcePaths: sourcePaths.filter((path) => path !== 'AGENTS.md') }), 'docs_required_source_missing'))
  check(() => throws(() => buildSourcePack({ ...config, writePaths: ['AGENTS.md'] }), 'docs_write_scope_invalid'))
  check(() => throws(() => buildSourcePack({ ...config, writePaths: ['state/skill-registry.yaml'] }), 'docs_write_scope_invalid'))
  check(() => throws(() => buildSourcePack({ ...config, sourcePaths: [...sourcePaths, 'skills/fixture.md'], writePaths: ['skills/fixture.md'] }), 'docs_write_scope_invalid'))
  check(() => throws(() => buildSourcePack({ ...config, sourcePaths: [...sourcePaths, 'contract/fixture.md'], writePaths: ['contract/fixture.md'] }), 'docs_write_scope_invalid'))
  check(() => throws(() => buildSourcePack({ ...config, writePaths: ['../outside.md'] }), 'docs_path_contract_invalid'))
  const privateConfig = { ...config, classification: { ...config.classification, visibility: 'private' } }
  check(() => throws(() => buildSourcePack(privateConfig), 'docs_private_execution_required'))
  const executionContext = { repository: 'krishanraja/control-center', visibility: 'private', verifiedAt: new Date(NOW).toISOString() }
  check(() => throws(() => buildSourcePack({ ...privateConfig, executionContext }), 'docs_private_approval_required'))
  const privateExecutionApproval = { approvalRef: 'fixture:private:1', repository: config.repository, head, executionRepository: executionContext.repository, destination: 'anthropic-api', purpose: 'docs', sourcePaths, expiresAt: '2026-10-18T12:30:00Z' }
  check(() => assert.equal(buildSourcePack({ ...privateConfig, executionContext, privateExecutionApproval }).visibility, 'private'))
  check(() => throws(() => buildSourcePack({ ...privateConfig, executionContext, privateExecutionApproval: { ...privateExecutionApproval, sourcePaths: ['NOW.md'] } }), 'docs_private_approval_required'))
  check(() => assert.deepEqual(parseDraft(response(noChange), pack), noChange))
  check(() => throws(() => parseDraft(response(noChange, 'max_tokens'), pack), 'docs_response_incomplete'))
  check(() => throws(() => parseDraft({ stop_reason: 'end_turn', content: [{ type: 'text', text: '```json\n{}\n```' }] }, pack), 'docs_response_not_json'))
  check(() => throws(() => parseDraft(response({ ...noChange, prose: 'untrusted prose' }), pack), 'docs_response_schema'))
  check(() => throws(() => parseDraft(response({ ...noChange, required_updates: ['docs/product-state.json'] }), pack), 'docs_coupled_update_required'))
  check(() => throws(() => parseDraft(response(changed([{ path: 'AGENTS.md', content: '# Hijacked\n' }])), pack), 'docs_response_file_invalid'))
  check(() => throws(() => parseDraft(response(changed([{ path: 'docs/detail.md', content: '<!-- krish-repo-admin:start -->x<!-- krish-repo-admin:end -->' }])), pack), 'docs_protected_region_changed'))
  check(() => throws(() => parseDraft(response(changed([{ path: 'docs/detail.md', content: '<!-- krish-canon:start broken -->' }])), pack), 'docs_protected_region_malformed'))
  check(() => throws(() => parseDraft(response(changed([{ path: 'docs/history/LOG.md', content: '# History\n\n## 2026-10-18\n\nReplaced history.\n' }])), pack), 'docs_history_rewrite'))
  const nextLog = log.replace('## 2026-10-17', '## 2026-10-18\n\n- New verified outcome.\n\n## 2026-10-17')
  check(() => assert.equal(parseDraft(response(changed([{ path: 'docs/history/LOG.md', content: nextLog }])), pack).files[0].content, nextLog))
  const revised = nowText.replace(`head: ${base}`, `head: ${head}`).replace('A test fixture.', 'A bounded test fixture.')
  const bundle = validateDraft({ repoDir: repo, pack, draft: changed([{ path: 'NOW.md', content: revised }, { path: 'docs/history/LOG.md', content: nextLog }]), now: NOW })
  check(() => assert.equal(bundle.validated, true))
  check(() => assert.equal(bundle.files.length, 2))
  check(() => assert.equal(git('rev-parse', 'HEAD'), head))
  check(() => assert.equal(readFileSync(join(repo, 'NOW.md'), 'utf8'), nowText))
  check(() => assert.equal(validateDraft({ repoDir: repo, pack, draft: noChange, now: NOW }).disposition, 'no-change'))
  const archivePack = buildSourcePack({ ...config, sourcePaths: [...sourcePaths, 'docs/history/2026-10-18-fixture.md'], writePaths: [...config.writePaths, 'docs/history/2026-10-18-fixture.md'] })
  check(() => assert.equal(archivePack.files.at(-1).content, null))
  check(() => assert.equal(validateDraft({ repoDir: repo, pack: archivePack, draft: changed([{ path: 'docs/history/2026-10-18-fixture.md', content: '# Historical fixture\n\nPreserved verified historical detail.\n' }]), now: NOW }).validated, true))
  check(() => throws(() => validateDraft({ repoDir: repo, pack: { ...pack, input_sha256: '0'.repeat(64) }, draft: noChange, now: NOW }), 'docs_source_pack_changed'))
  check(() => throws(() => validateDraft({ repoDir: repo, pack, draft: changed([{ path: 'NOW.md', content: revised.replace('lifecycle: building', 'lifecycle: PRIVATE_SENTINEL') }]), now: NOW }), 'docs_deterministic_validation_failed'))
  check(() => assert.throws(() => validateDraft({ repoDir: repo, pack, draft: changed([{ path: 'NOW.md', content: revised.replace('lifecycle: building', 'lifecycle: PRIVATE_SENTINEL') }]), now: NOW }), (error) => !error.message.includes('PRIVATE_SENTINEL')))
  let requests = 0
  const result = await draftDocumentation({ repoDir: repo, pack, requestId: 'fixture:docs:1', model: 'fixture-provider-route', now: NOW, requestMessages: async (request) => { requests++; assert.equal(request.purpose, 'docs'); assert.equal(request.tools, undefined); assert.equal(request.max_tokens, 12000); assert.equal(JSON.parse(request.messages[0].content).head, head); assert.equal(JSON.parse(request.messages[0].content).authority, undefined); return response(changed([{ path: 'NOW.md', content: revised }])) } })
  check(() => assert.equal(requests, 1))
  check(() => assert.equal(result.validated, true))
  const configPath = join(root, 'config.json')
  writeFileSync(configPath, JSON.stringify(config), { mode: 0o600 })
  const cli = execFileSync(process.execPath, [fileURLToPath(new URL('./central-draft.mjs', import.meta.url)), '--config', configPath, '--prepare-only'], { encoding: 'utf8' })
  check(() => assert.equal(JSON.parse(cli).status, 'prepared'))
  check(() => assert.equal(cli.includes('Existing accepted detail'), false))
  write('unrelated-untracked.txt', 'dirty checkout\n')
  check(() => throws(() => buildSourcePack(config), 'docs_source_checkout_not_pinned_clean'))
  rmSync(join(repo, 'unrelated-untracked.txt'))
  write('docs/detail.md', 'A'.repeat(80000))
  git('add', 'docs/detail.md')
  git('commit', '-m', 'Fixture bounded oversized request')
  const largeHead = git('rev-parse', 'HEAD')
  const largePack = buildSourcePack({ ...config, expectedHead: largeHead, classification: { ...config.classification, head: largeHead } })
  await assert.rejects(() => draftDocumentation({ repoDir: repo, pack: largePack, requestId: 'fixture:docs:large', now: NOW, requestMessages: async () => { requests++; return response(noChange) } }), (error) => error.code === 'docs_api_request_limit')
  assertions++
  check(() => assert.equal(requests, 1))
  symlinkSync('/tmp/outside-file', join(repo, 'docs/link.md'))
  git('add', 'docs/link.md')
  git('commit', '-m', 'Fixture symlink source')
  const linkHead = git('rev-parse', 'HEAD')
  check(() => throws(() => buildSourcePack({ ...config, expectedHead: linkHead, sourcePaths: [...sourcePaths, 'docs/link.md'], classification: { ...config.classification, head: linkHead } }), 'docs_non_regular_source'))
  const outsideDir = join(root, 'outside-sentinel')
  mkdirSync(outsideDir)
  writeFileSync(join(outsideDir, 'sentinel.txt'), 'unchanged\n')
  symlinkSync(outsideDir, join(repo, 'docs/history/linked'))
  git('add', 'docs/history/linked')
  git('commit', '-m', 'Fixture archive ancestor symlink')
  const escapedHead = git('rev-parse', 'HEAD'), archivePath = 'docs/history/linked/new-archive.md'
  check(() => throws(() => buildSourcePack({ ...config, expectedHead: escapedHead, sourcePaths: [...sourcePaths, archivePath], writePaths: [...config.writePaths, archivePath], classification: { ...config.classification, head: escapedHead } }), 'docs_non_regular_source'))
  check(() => assert.equal(readFileSync(join(outsideDir, 'sentinel.txt'), 'utf8'), 'unchanged\n'))
  check(() => assert.equal(existsSync(join(outsideDir, 'new-archive.md')), false))
  check(() => assert.equal(existsSync(join(root, 'outside.md')), false))
  console.log(`central-draft: ${assertions} assertions passed; fixture-only, no API calls or target writes`)
} finally { rmSync(root, { recursive: true, force: true }) }
