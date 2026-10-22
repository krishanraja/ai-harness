#!/usr/bin/env node
import assert from 'node:assert/strict'
import { reconcileRepository, checksPassed } from './reconcile-repository-admin.mjs'
import { rollbackFile, region } from './repository-admin.mjs'
import { Gh } from './lib/github.mjs'
const profile = { schema_version: 1, repository: 'content-engine', enabled: true, families: ['repository-administration'], source_revision: 'a'.repeat(40), context_path: 'docs/HARNESS_CONTEXT.md', entrypoints: { agents: 'AGENTS.md', claude: 'CLAUDE.md' }, bootstrap_limit_chars: 10000, sources: [{ path: 'README.md', role: 'orientation', label: 'Purpose' }], workflows: [] }
const source = { 'AGENTS.md': '# Human guidance\n', 'CLAUDE.md': null, 'README.md': 'System purpose.\n', 'docs/HARNESS_CONTEXT.md': null }
let calls = 0, mutations = 0, written = {}
const gh = {
  owner: 'krishanraja',
  defaultBranch: async () => { calls++; return { branch: 'main' } },
  headSha: async () => 'a'.repeat(40),
  getFile: async (repo, path, ref) => ({ text: ref === 'c'.repeat(40) ? written[path] ?? source[path] : source[path] }),
  findPull: async () => null,
  branchExists: async () => false,
  createBranch: async () => { mutations++ },
  commitFiles: async (repo, branch, base, files) => { mutations++; written = files; return { sha: 'c'.repeat(40) } },
  openPull: async () => { mutations++; return { number: 12 } },
}
assert.equal((await reconcileRepository({ profile: { ...profile, repository: 'mindmake' }, gh, history: [] })).status, 'excluded')
assert.equal(calls, 0)
assert.equal((await reconcileRepository({ profile, gh, history: [] })).status, 'planned')
assert.equal(mutations, 0)
const writtenResult = await reconcileRepository({ profile, gh, history: [], write: true })
assert.equal(writtenResult.status, 'pull-request')
assert.deepEqual(Object.keys(written).sort(), [".claude/hooks/harness-closeout.mjs", ".claude/settings.json", ".github/workflows/harness-repository-context.yml", "AGENTS.md", "CLAUDE.md", "docs/HARNESS_CONTEXT.md"])
assert.equal(mutations, 3)
const candidate=structuredClone(written)
const merging={...gh,
 findPull:async()=>({number:12,head:{sha:'c'.repeat(40)}}),
 checksFor:async()=>({runs:[{name:'operating-context',status:'completed',conclusion:'success'}],statuses:{}}),
 getFile:async(repo,path,ref)=>({text:['c'.repeat(40),'merged'].includes(ref)?candidate[path]??source[path]:source[path]}),
 req:async(method,path)=>path.endsWith('/files?per_page=100')?Object.keys(candidate).map(filename=>({filename})):method==='PUT'?{merged:true,sha:'merged'}:{head:{sha:'c'.repeat(40)},base:{ref:'main',sha:'older-main-before-unrelated-report'}}
}
const merged=await reconcileRepository({profile,gh:merging,history:[],write:true,merge:true})
assert.equal(merged.status,'verified','A stale PR base label must not block a freshly regenerated, unchanged view against current main')
assert.equal(merged.rollback.base,'a'.repeat(40))
let uncheckedMerges = 0
const unrelatedOnly = await reconcileRepository({profile,gh:{...merging,checksFor:async()=>({runs:[{name:'lint',status:'completed',conclusion:'success'}],statuses:{}}),req:async(method,path,...args)=>{if(method==='PUT')uncheckedMerges++;return merging.req(method,path,...args)}},history:[],write:true,merge:true})
assert.equal(unrelatedOnly.status,'awaiting-checks','Unrelated successful CI cannot replace the managed integrity check')
assert.equal(uncheckedMerges,0,'Missing integrity proof must stop before the merge API')
await assert.rejects(()=>reconcileRepository({profile,gh:{...merging,getFile:async(repo,path,ref)=>({text:ref==='c'.repeat(40)&&path==='AGENTS.md'?'A human changed this branch.':(['c'.repeat(40),'merged'].includes(ref)?candidate[path]??source[path]:source[path])})},history:[],write:true,merge:true}),/source_moved/)
assert.equal(checksPassed({ runs: [], statuses: {} }), false)
const integrityCheck = { name: 'operating-context', status: 'completed', conclusion: 'success' }
assert.equal(checksPassed({ runs: [integrityCheck], statuses: {} }), true)
assert.equal(checksPassed({ runs: [{ name: 'lint', status: 'completed', conclusion: 'success' }], statuses: {} }), false)
assert.equal(checksPassed({ runs: [{...integrityCheck,status:'in_progress',conclusion:null}], statuses: {} }), false)
assert.equal(checksPassed({ runs: [{...integrityCheck,conclusion:'skipped'}], statuses: {} }), false)
assert.equal(checksPassed({ runs: [integrityCheck,{name:'other',status:'completed',conclusion:'failure'}], statuses: {} }), false)
assert.equal(checksPassed({ runs: [integrityCheck], statuses: { 'harness/judge': 'failure' } }), false)
const original = 'Human text\n' + region('Old instructions', '0'.repeat(12)) + '\n'
const delivered = 'Human text\n' + region('New instructions', '1'.repeat(12)) + '\n'
const current = delivered.replace('Human text', 'New human text')
assert.equal(rollbackFile(original, delivered, current), original.replace('Human text', 'New human text'))
assert.throws(() => rollbackFile(null, delivered, current), /human_changes/)
assert.throws(() => rollbackFile(original, delivered, current.replace('New instructions', 'A human correction')), /drift/)
const requests = []
const atomic = new Gh('fixture-token')
atomic.headSha = async () => 'parent'
atomic.req = async (method, path, body) => {
  requests.push({ method, path, body })
  if (path.endsWith('/commits/parent')) return { tree: { sha: 'base-tree' } }
  return { sha: 'next' }
}
await atomic.commitFiles('repo', 'branch', 'parent', { 'AGENTS.md': 'one', 'CLAUDE.md': 'two' }, 'change')
assert.equal(requests.filter((r) => r.path.endsWith('/git/commits')).length, 1)
assert.equal(requests.find((r) => r.path.endsWith('/git/trees')).body.tree.length, 2)
assert.equal(requests.at(-1).body.force, false)
console.log('REPOSITORY RECONCILE OK: exclusion before reads, planning, atomic writes, measured checks and safe rollback')
