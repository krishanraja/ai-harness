#!/usr/bin/env node
/** Isolated engineering proof: real intake and brain stages, mocked GitHub, local Git readback.
 * All observations and owner merges below are fixtures in a disposable tree.
 * They never become production evidence, approval, knowledge or deployment receipts.
 */
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { intake } from './intake-observations.mjs'
import { consolidateKnowledge, effectiveKnowledge, knowledgeHistory, policyAt, ROOT, seal, validateKnowledge } from './repository-brain.mjs'
import { openReviews, promoteOwnerReviews, repositoryCandidates, REVIEWS } from './repository-reviews.mjs'
import { inspectRegion, planAdministration, renderAdministration, OWNED } from './repository-admin.mjs'
import { reconcileRepository } from './reconcile-repository-admin.mjs'
import { loadLedger } from './propose.mjs'

const root = mkdtempSync(join(tmpdir(), 'repository-learning-loop-'))
const put = (path, text) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, text) }
const jsonl = (rows) => rows.map((row) => JSON.stringify(row)).join('\n') + '\n'
const original = '# Repository-owned guidance\nKeep the native workflow and this human sentence.\n'
const source = { 'AGENTS.md': original, 'README.md': 'The native owner documents the actual task and its downstream result.\n' }
const profile = (repository) => ({
  schema_version: 1, repository, enabled: true, families: ['repository-administration'],
  source_revision: 'a'.repeat(40), context_path: 'docs/HARNESS_CONTEXT.md',
  entrypoints: { agents: 'AGENTS.md', claude: 'CLAUDE.md' }, bootstrap_limit_chars: 20000,
  sources: [{ path: 'README.md', role: 'orientation', label: 'Native system and recovery' }],
  workflows: [{ id: 'titles', label: 'Title iteration', read: ['README.md'], checks: [] }],
})

// This backend exercises actual Git commits, branch refs and squash merges without a network.
// Independent verification below reads those objects directly, outside the GitHub adapter.
function targetBackend(name, { corruptReadback = false } = {}) {
  const dir = join(root, name)
  mkdirSync(dir)
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
  const commit = (message) => git('-c', 'user.name=Learning loop fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', message)
  git('init', '-b', 'main')
  for (const [path, text] of Object.entries(source)) put(join(dir, path), text)
  git('add', '.')
  commit('Native fixture source')
  const initial = git('rev-parse', 'main')
  let pull = null, merged = null, mutations = 0, readbacks = 0
  const objectText = (ref, path) => {
    const result = spawnSync('git', ['show', `${ref}:${path}`], { cwd: dir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
    return result.status === 0 ? result.stdout : null
  }
  const gh = {
    owner: 'krishanraja',
    defaultBranch: async () => ({ branch: 'main' }),
    headSha: async (repo, branch) => git('rev-parse', branch),
    getFile: async (repo, path, ref) => {
      const text = objectText(ref, path)
      if (ref === merged) {
        readbacks++
        if (corruptReadback && path === 'docs/HARNESS_CONTEXT.md') return { text: text + 'Unexpected delivered bytes.\n' }
      }
      return text === null ? null : { text }
    },
    findPull: async (repo, head) => pull?.head.ref === head ? pull : null,
    branchExists: async (repo, branch) => spawnSync('git', ['show-ref', '--verify', '--quiet', `refs/heads/${branch}`], { cwd: dir }).status === 0,
    createBranch: async (repo, branch, base) => { mutations++; git('branch', branch, base) },
    commitFiles: async (repo, branch, base, files) => {
      assert.equal(git('rev-parse', branch), base)
      mutations++
      git('checkout', branch)
      for (const [path, text] of Object.entries(files)) put(join(dir, path), text)
      git('add', '.')
      commit('Generated fixture administration')
      return { sha: git('rev-parse', 'HEAD') }
    },
    openPull: async (repo, proposal) => {
      mutations++
      pull = { number: 12, head: { ref: proposal.head, sha: git('rev-parse', proposal.head) }, base: { ref: proposal.base } }
      return pull
    },
    checksFor: async () => ({ runs: [{ name: 'operating-context', status: 'completed', conclusion: 'success' }], statuses: {} }),
    req: async (method, path, body) => {
      if (method === 'GET' && path.endsWith('/files?per_page=100')) return git('diff', '--name-only', 'main', pull.head.sha).split('\n').filter(Boolean).map((filename) => ({ filename }))
      if (method === 'GET' && path.endsWith('/pulls/12')) return pull
      if (method === 'PUT' && path.endsWith('/pulls/12/merge')) {
        assert.equal(body.sha, pull.head.sha, 'The merge must name the exact checked candidate')
        assert.equal(body.merge_method, 'squash')
        mutations++
        git('checkout', 'main')
        git('merge', '--squash', pull.head.ref)
        commit('Deliver fixture administration')
        merged = git('rev-parse', 'HEAD')
        return { merged: true, sha: merged }
      }
      throw new Error(`Unexpected fixture GitHub request: ${method} ${path}`)
    },
  }
  return { gh, git, objectText, initial, get mutations() { return mutations }, get readbacks() { return readbacks } }
}

try {
  const contract = {
    schema_version: 1, owner: 'krishanraja', approval: 'isolated-learning-loop-fixture',
    targets: ['content-engine', 'AEO-Engine'], pilots: ['content-engine', 'AEO-Engine'], excluded: ['mindmake'],
    families: ['repository-administration'], managed_words: 400, context_words: 1200, max_files: 6, acceptances: {},
  }
  put(join(root, 'contract/repository-administration.json'), JSON.stringify(contract))
  copyFileSync(join(ROOT, 'contract/learning-policy.yaml'), join(root, 'contract/learning-policy.yaml'))
  for (const file of ['knowledge', 'acceptances', 'reviews']) put(join(root, 'brain', file + '.jsonl'), '')
  for (const repository of contract.targets) put(join(root, 'brain/repositories', repository + '.json'), JSON.stringify(profile(repository)))

  const target = targetBackend('successful-delivery')
  const occurred = new Date().toISOString()
  const envelope = (repository, suffix) => ({
    schema_version: 2, event_id: `learning-loop-fixture:${suffix}`, occurred_at: occurred, surface: 'codex',
    kind: 'explicit_correction', summary: 'A length revision lost the subject and argument already accepted for this task.',
    evidence_ref: `session:fixture-${suffix}`, outcome: 'corrected', severity: 'medium', confidence: 'high',
    repository, episode_id: `episode:${suffix.repeat(16)}`, knowledge_type: 'procedure', source_revision: target.initial,
    episode: {
      goal: 'Make the finding legible.', retained: ['Retain the accepted subject and argument.'],
      requested_change: 'Shorten only the title.', attempt: 'The shorter draft omitted the accepted argument.',
      outcome: 'The owner corrected that loss.', conditions: ['During a title length revision.'],
      uncertainties: ['A retrieval problem could explain the failure.'], evidence_refs: [`session:fixture-${suffix}`],
    },
  })
  const event = envelope('content-engine', 'a')
  const ledgerDir = join(root, 'state/observations')
  const received = intake({ events: [event, { ...event, event_id: 'learning-loop-fixture:alternate-transport' }, envelope('AEO-Engine', 'b')] }, { ledgerDir })
  assert.equal(received.fresh.length, 2)
  assert.equal(received.duplicates, 1, 'Transport aliases cannot manufacture repeated evidence')
  assert.deepEqual(received.rejected, {})
  put(received.ledger, jsonl(received.fresh))
  assert.deepEqual(loadLedger(root), received.fresh, 'Consolidation reads the durable ledger, not an in-memory substitute')
  assert.equal(intake({ events: [event] }, { ledgerDir }).duplicates, 1)
  const observed = consolidateKnowledge({ root, write: true })
  assert.equal(observed.fresh.length, 2)
  assert.equal(consolidateKnowledge({ root, write: true }).fresh.length, 0)
  const beforeKnowledge = readFileSync(join(root, 'brain/knowledge.jsonl'), 'utf8')
  const beforePolicy = policyAt(root)
  const beforeHistory = knowledgeHistory(root)
  assert.ok(beforeHistory.every((row) => row.status === 'candidate'))
  const beforeContent = renderAdministration(profile('content-engine'), beforeHistory, beforePolicy)
  const beforeGrowth = renderAdministration(profile('AEO-Engine'), beforeHistory, beforePolicy)

  const candidates = repositoryCandidates(root)
  assert.equal(candidates.length, 2, 'Similar corrections remain in separate repository review queues')
  const contentCandidate = candidates.find((candidate) => candidate.repository === 'content-engine')
  assert.deepEqual(contentCandidate.evidence.map((row) => row.id), [received.fresh[0].id])
  const statement = 'For a title length revision, retain the accepted subject and argument unless the owner replaces those decisions.'
  const proposal = {
    candidate_id: contentCandidate.id, repository: 'content-engine', workflow: 'titles', type: 'procedure', statement,
    conditions: ['Only while shortening an already accepted title.'],
    uncertainties: ['A missing native task brief may need a separate repair.'],
    why: 'A scoped correction showed accepted decisions being lost.',
    alternative_explanations: 'The right knowledge may have been unavailable at the owning stage.',
    if_wrong: 'An obsolete decision could survive a deliberate change of direction.',
    validation: 'Replay a narrow revision against its accumulated accepted brief.',
    rollback: 'A subsequent owner-reviewed correction can supersede this exact procedure.',
  }
  let reviewText = '', reviewBranch = null, mergedBy = 'fixture-bot'
  const reviewBase = 'b'.repeat(40), reviewMerge = 'd'.repeat(40)
  const reviews = {
    owner: contract.owner,
    openPulls: async () => [],
    branchExists: async () => false,
    defaultBranch: async () => ({ branch: 'main' }),
    headSha: async () => reviewBase,
    createBranch: async (repo, branch, base) => { assert.equal(repo, 'ai-harness'); assert.equal(base, reviewBase); reviewBranch = branch },
    commitFiles: async (repo, branch, base, files) => {
      assert.deepEqual(Object.keys(files), [REVIEWS], 'A review request cannot modify canon or its own acceptance policy')
      assert.equal(branch, reviewBranch)
      reviewText = files[REVIEWS]
      return { sha: 'c'.repeat(40) }
    },
    openPull: async (repo, pull) => { assert.equal(pull.draft, true); return { number: 7 } },
    getFile: async (repo, path, ref) => { assert.equal(path, REVIEWS); return { text: ref === reviewMerge ? reviewText : '' } },
    listPulls: async () => [{ number: 7, merged_at: occurred, head: { ref: reviewBranch } }],
    req: async (method, path) => {
      assert.equal(method, 'GET')
      if (path.endsWith('/files?per_page=100')) return [{ filename: REVIEWS }]
      if (path.includes('/git/commits/')) return { parents: [{ sha: reviewBase }] }
      return { merged_by: { login: mergedBy }, merge_commit_sha: reviewMerge }
    },
  }
  const mixed = await openReviews({ gh: reviews, proposals: [{ ...proposal, why: 'https://example.invalid/link' }, proposal], root })
  assert.deepEqual(mixed.map((x) => x.status), ['refused', 'proposed'], 'One proposal that breaks the gate is refused and the valid one is still drafted')
  assert.equal(mixed[0].reason, 'invalid_review_text')
  assert.equal(knowledgeHistory(root).length, 2, 'Drafting a review never accepts its proposed meaning')
  assert.deepEqual(await promoteOwnerReviews({ gh: reviews, root, write: true }), [], 'A bot merge never accepts meaning')
  mergedBy = contract.owner // A mocked owner identity, in this disposable test policy only.
  put(join(root, REVIEWS), reviewText)
  const promoted = await promoteOwnerReviews({ gh: reviews, root, write: true })
  assert.equal(promoted.length, 1)
  assert.deepEqual(await promoteOwnerReviews({ gh: reviews, root, write: true }), [])
  assert.ok(readFileSync(join(root, 'brain/knowledge.jsonl'), 'utf8').startsWith(beforeKnowledge), 'Acceptance appends without changing original evidence bytes')
  const policy = policyAt(root), history = knowledgeHistory(root)
  const accepted = history.find((row) => row.status === 'accepted')
  const proof = JSON.parse(readFileSync(join(root, 'brain/acceptances.jsonl'), 'utf8'))
  assert.equal(proof.knowledge_hash, seal(accepted), 'The simulated owner merge accepts exact content')
  assert.throws(() => validateKnowledge({ ...accepted, statement: 'An automated rewrite cannot reuse an earlier owner approval.' }, policy), /acceptance_content_mismatch/)
  assert.equal(accepted.scope.workflow, 'titles')
  assert.deepEqual(accepted.conditions, proposal.conditions)
  assert.deepEqual(accepted.uncertainties, proposal.uncertainties)
  assert.equal(effectiveKnowledge(history, { repository: 'content-engine' }, policy).accepted.length, 0, 'Workflow meaning is not a repository-wide command')
  assert.equal(effectiveKnowledge(history, { repository: 'content-engine', workflow: 'titles' }, policy).accepted.length, 1)

  const rendered = renderAdministration(profile('content-engine'), history, policy)
  assert.notEqual(rendered.revision, beforeContent.revision)
  assert.ok(rendered.context.includes(statement))
  assert.deepEqual(renderAdministration(profile('AEO-Engine'), history, policy), beforeGrowth, 'Acceptance leaves the other repository guide byte-identical')
  const args = { profile: profile('content-engine'), gh: target.gh, history, policy, write: true, merge: true }
  const delivered = await reconcileRepository(args)
  assert.equal(delivered.status, 'verified')
  assert.equal(delivered.rollback.base, target.initial)
  assert.equal(target.readbacks, delivered.files.length)
  assert.equal(target.git('rev-parse', 'main'), delivered.merge)
  const deliveredFiles = Object.fromEntries(['AGENTS.md', 'CLAUDE.md', ...OWNED, 'docs/HARNESS_CONTEXT.md', 'README.md'].map((path) => [path, target.objectText(delivered.merge, path)]))
  assert.equal(deliveredFiles['docs/HARNESS_CONTEXT.md'], rendered.context, 'Independent Git object readback matches the accepted scoped brain view')
  assert.ok(deliveredFiles['AGENTS.md'].startsWith(original), 'Native human instructions survive delivery')
  assert.equal(deliveredFiles['CLAUDE.md'], '@AGENTS.md\n')
  assert.equal(inspectRegion(deliveredFiles['AGENTS.md']).intact, true)
  assert.deepEqual(planAdministration(profile('content-engine'), deliveredFiles, history, { policy }).changes, {})
  assert.equal((await reconcileRepository(args)).status, 'current', 'The complete replay converges without a new write')

  const stale = targetBackend('stale-source')
  let headReads = 0
  const staleGh = { ...stale.gh, headSha: async (...callArgs) => ++headReads === 2 ? 'e'.repeat(40) : stale.gh.headSha(...callArgs) }
  await assert.rejects(() => reconcileRepository({ ...args, gh: staleGh }), /source_base_moved/)
  assert.equal(stale.mutations, 0, 'A moving source refuses publication before any write')
  const corrupt = targetBackend('bad-readback', { corruptReadback: true })
  await assert.rejects(() => reconcileRepository({ ...args, gh: corrupt.gh }), /administration_target_readback_failed/)
  assert.notEqual(corrupt.git('rev-parse', 'main'), corrupt.initial, 'Even a successful merge is not verified when the subsequent readback differs')

  console.log('REPOSITORY LEARNING LOOP OK: isolated v2 intake, durable ledger, scoped consolidation, exact owner review, checked Git delivery, independent readback, convergence and refusal paths')
} finally {
  rmSync(root, { recursive: true, force: true })
}
