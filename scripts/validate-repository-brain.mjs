#!/usr/bin/env node
import {readFileSync,readdirSync} from 'node:fs'
import {join} from 'node:path'
import {ROOT,policyAt,knowledgeHistory,profiles} from './repository-brain.mjs'
import {validateProfile,renderAdministration,OWNED,TARGET_HOOK,TARGET_CHECK,closeoutHook,targetCheck,registerHook} from './repository-admin.mjs'
import {createHash} from 'node:crypto'
const policy=policyAt(), history=knowledgeHistory()
const approved=new Set(Object.values(policy.acceptances).filter(a=>a.actor==='Krish'&&String(Object.keys(policy.acceptances).find(k=>policy.acceptances[k]===a)).startsWith('plan:')).flatMap(a=>a.repositories))
if(policy.targets.length!==13 || policy.targets.some(t=>!approved.has(t)) || policy.targets.includes('mindmake') || !policy.excluded.includes('mindmake')) throw new Error('admission_policy_drift')
for(const t of policy.targets) if(!profiles().some(p=>p.repository===t)) throw new Error(`admitted_target_without_profile:${t}`)
// The publisher's write scope is only what a dated owner approval granted: the
// 2026-10-17 plan's four files and its check workflow, widened only by a grant.
const grants=Object.values(policy.acceptances).map(a=>a.grants).filter(Boolean)
const maxGranted=Math.max(4,...grants.map(g=>g.max_files||0)), ownedGranted=new Set(['.github/workflows/harness-repository-context.yml',...grants.flatMap(g=>g.owned_files||[])])
if(policy.max_files>maxGranted) throw new Error('publisher_scope_not_granted:max_files')
for(const f of OWNED) if(!ownedGranted.has(f)) throw new Error(`publisher_scope_not_granted:${f}`)
for(const f of Object.keys(policy.prior_owned||{})) if(!ownedGranted.has(f)) throw new Error(`publisher_scope_not_granted:${f}`)
// The exact bytes the publisher delivers for the files it owns outright are
// bound to the grant: changing the hook or the check needs a new hash here,
// in a reviewed commit Krish merges.
const approvedBytes=Object.assign({},...grants.map(g=>g.approved_sha256||{}))
const entry=grants.map(g=>g.settings_entry).find(e=>e&&typeof e==='object')
if(!entry||JSON.stringify(JSON.parse(registerHook(null).text).hooks)!==JSON.stringify(entry))throw new Error('publisher_bytes_not_granted:.claude/settings.json entry')
for(const [f,text] of [[TARGET_HOOK,closeoutHook()],[TARGET_CHECK,targetCheck()]]){const h=createHash('sha256').update(text,'utf8').digest('hex');if(!(approvedBytes[f]||[]).includes(h))throw new Error(`publisher_bytes_not_granted:${f}:${h}`)}
for(const p of profiles()){validateProfile(p,policy);renderAdministration(p,history,policy)}
for(const name of readdirSync(join(ROOT,'state/repository-administration/migrations'))){const m=JSON.parse(readFileSync(join(ROOT,'state/repository-administration/migrations',name),'utf8'));if(m.acceptance!==policy.approval || !policy.targets.includes(name.replace(/\.json$/,'')))throw new Error('unapproved_migration')}
console.log(`Repository brain valid: ${history.length} typed records; ${profiles().length} admitted profiles; accepted content bound to approval.`)
