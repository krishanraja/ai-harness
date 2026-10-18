#!/usr/bin/env node
import {readFileSync,readdirSync} from 'node:fs'
import {join} from 'node:path'
import {ROOT,policyAt,knowledgeHistory,profiles} from './repository-brain.mjs'
import {validateProfile,renderAdministration} from './repository-admin.mjs'
const policy=policyAt(), history=knowledgeHistory()
if(policy.targets.length!==10 || policy.targets.includes('mindmake') || !policy.excluded.includes('mindmake')) throw new Error('admission_policy_drift')
for(const p of profiles()){validateProfile(p,policy);renderAdministration(p,history,policy)}
for(const name of readdirSync(join(ROOT,'state/repository-administration/migrations'))){const m=JSON.parse(readFileSync(join(ROOT,'state/repository-administration/migrations',name),'utf8'));if(m.acceptance!==policy.approval || !policy.targets.includes(name.replace(/\.json$/,'')))throw new Error('unapproved_migration')}
console.log(`Repository brain valid: ${history.length} typed records; ${profiles().length} admitted profiles; accepted content bound to approval.`)
