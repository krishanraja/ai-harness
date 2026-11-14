#!/usr/bin/env node
/** Verify free workflow paths, credential boundaries and diagnostic privacy without model/network calls. */
import assert from 'node:assert/strict'
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync,chmodSync} from 'node:fs'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {spawnSync} from 'node:child_process'
import {parseYaml} from './lib/yaml.mjs'

const source=readFileSync('.github/workflows/docs-steward.yml','utf8'),workflow=parseYaml(source)
const evaluate=(condition,{event,dryRun=false,message='change docs'})=>{
 if(!condition)return true
 const expression=condition.replace(/^\$\{\{\s*|\s*\}\}$/g,'')
 // A job that needs the steward job sees it succeed with one commit, as on a night with work.
 const needs={steward:{result:'success',outputs:{commits:'1'}}}
 return Function('github','inputs','startsWith','needs',`return (${expression})`)({event_name:event,event:{head_commit:{message}}},{dry_run:dryRun},(v,p)=>String(v||'').startsWith(p),needs)
}
const jobsFor=mode=>Object.entries(workflow.jobs).filter(([,job])=>evaluate(job.if,mode))
assert.equal(workflow.permissions.contents,'read')
assert.equal(workflow.permissions['id-token'],undefined,'No OIDC credential is needed when the legacy action receives its GitHub token explicitly')
for(const mode of [{event:'push'},{event:'push',dryRun:true},{event:'workflow_dispatch',dryRun:true},{event:'workflow_call',dryRun:true}]){
 const selected=jobsFor(mode)
 assert.equal(selected.length,1,'Each validation-only invocation has one deterministic job')
 for(const [,job] of selected){
  const serialized=JSON.stringify(job)
  assert.equal((job.permissions||workflow.permissions).contents,'read')
  assert.doesNotMatch(serialized,/CLAUDE_CODE_OAUTH_TOKEN|anthropics\/claude-code-action|mkdir -p.*\.local\/bin|git push|gh pr|id-token/,'Read-only modes cannot reach authentication, installation, inference or publishing')
  for(const step of job.steps.filter(s=>s.uses?.startsWith('actions/checkout@')))assert.equal(step.with?.['persist-credentials'],false)
 }
}
assert.equal(jobsFor({event:'push',message:'docs(steward): no further work'}).length,0,'Steward-generated pushes preserve the loop guard')
// The paid path (fleet integration audit AUTO-6, 2026-11-14): Claude writes in a
// read-only job with a narrow tool list, and a job with no model publishes.
for(const mode of [{event:'schedule'},{event:'workflow_dispatch'},{event:'workflow_call'}]){
 const selected=Object.fromEntries(jobsFor(mode))
 assert.deepEqual(Object.keys(selected).sort(),['publish','steward'])
 const {steward,publish}=selected
 assert.equal(steward.permissions.contents,'read','The job Claude runs in holds no write token')
 assert.ok(steward.steps.find(s=>s.env?.HAS_TOKEN),'Only the real model route requires OAuth')
 const model=steward.steps.find(s=>s.uses?.startsWith('anthropics/claude-code-action@'))
 assert.ok(model.with.github_token,'Explicit token, no OIDC')
 const tools=/--allowedTools "([^"]*)"/.exec(model.with.claude_args)[1].split(',')
 for(const banned of ['Bash(git:*)','Bash(node:*)','Bash(npm:*)','Bash(pnpm:*)','Bash(python3:*)','Bash(cat:*)','Bash(gh:*)'])assert.ok(!tools.includes(banned),`Claude has no ${banned}`)
 assert.ok(!tools.some(t=>/git (push|config|remote)/.test(t)),'Claude cannot push or reconfigure git')
 assert.match(model.with.claude_args,/--disallowedTools "[^"]*Read\(\/\/proc\/\*\*\)[^"]*Read\(\.git\/\*\*\)/,'Claude cannot read the process table or .git')
 assert.doesNotMatch(steward.steps.map(s=>s.run||'').join('\n'),/git push|gh pr/,'No step of the write job publishes')
 assert.ok(steward.steps.find(s=>s.run?.includes('--strict --since')),'The write job runs the Step 6 validator')
 assert.equal(publish.permissions.contents,'write')
 const published=JSON.stringify(publish)
 assert.doesNotMatch(published,/CLAUDE_CODE_OAUTH_TOKEN|anthropics\/claude-code-action|bash -c "\$CHECK"|npm ci|pnpm install/,'The publisher runs no model and no repository code')
 assert.ok(publish.steps.find(s=>s.run?.includes('--strict --since')),'The publisher re-validates before it pushes')
 for(const job of [steward,publish])for(const step of job.steps.filter(s=>s.uses?.startsWith('actions/checkout@')))assert.equal(step.with?.['persist-credentials'],false,'No checkout persists a credential')
}
const validation=workflow.jobs.validate
const validationStep=validation.steps.find(s=>s.run?.includes('validate.mjs'))
assert.equal(evaluate(validationStep['continue-on-error']||'false',{event:'push'}),false,'A broken push is still a failing check')
assert.equal(evaluate(validationStep['continue-on-error']||'false',{event:'workflow_dispatch',dryRun:true}),true,'Dry runs retain informational strict freshness reporting')
const diagnosticSteps=Object.values(workflow.jobs).flatMap(j=>j.steps).filter(s=>s.run&&/scripts\/steward\/(?:digest|validate)\.mjs/.test(s.run))
assert.ok(diagnosticSteps.length>=4)
const root=mkdtempSync(join(tmpdir(),'docs-steward-workflow-'))
try{
 mkdirSync(join(root,'.steward'));mkdirSync(join(root,'bin'))
 const marker='DO_NOT_PUBLISH_SOURCE_DIAGNOSTIC'
 writeFileSync(join(root,'bin/node'),`#!/bin/sh\nprintf '%s\\n' '${marker}'\nprintf '%s\\n' '${marker}' >&2\nprintf '%s\\n' "$*" >> "$ARG_LOG"\nexit "\${STUB_STATUS:-0}"\n`)
 writeFileSync(join(root,'bin/git'),'#!/bin/sh\nexit 0\n')
 for(const executable of ['node','git'])chmodSync(join(root,'bin',executable),0o755)
 let sequence=0
 for(const step of diagnosticSteps){
  assert.doesNotMatch(step.run,/cat\s+[^\n]*(?:digest\.md|diagnostics|validation-[^\s]+\.log)[^\n]*GITHUB_STEP_SUMMARY/,'Raw source content must not enter the public summary')
  for(const event of ['push','workflow_dispatch'])for(const status of [0,7]){
   const summary=join(root,`summary-${sequence}.txt`),args=join(root,`args-${sequence++}.txt`)
   writeFileSync(summary,'')
   const run=step.run.replaceAll('${{ steps.digest.outputs.name }}','fixture-repository').replaceAll('${{ steps.before.outputs.sha }}','a'.repeat(40))
   assert.doesNotMatch(run,/\$\{\{/,'The exercised validation commands must not leave an unevaluated workflow expression')
   const stepEnv={BEFORE:'a'.repeat(40),REPO_NAME:'fixture-repository',UPSTREAM:'ok'}
   const output=join(root,`output-${sequence}.txt`);writeFileSync(output,'')
   const result=spawnSync('bash',['-c',run],{cwd:root,encoding:'utf8',env:{...process.env,...stepEnv,PATH:join(root,'bin')+':'+process.env.PATH,GITHUB_REPOSITORY:'fixture/fixture-repository',GITHUB_OUTPUT:output,GITHUB_STEP_SUMMARY:summary,EVENT_NAME:event,STUB_STATUS:String(status),ARG_LOG:args}})
   if(step.id==='guards'||step.id==='verdict'){
    // A verdict step never fails the job: a failed guard sends the run to the fallback instead.
    assert.equal(result.status,0,`${step.name} records a verdict rather than failing`)
    assert.match(readFileSync(output,'utf8'),status===0?/verdict=ok/:/verdict=fallback/,`${step.name} sends a failed guard to the fallback`)
   }else assert.equal(result.status,status===0?0:1,`${step.name} must preserve success/failure without printing its diagnostics`)
   assert.doesNotMatch(result.stdout+result.stderr+readFileSync(summary,'utf8'),new RegExp(marker),'Neither stdout, stderr nor summary may disclose source diagnostic content')
   if(step===validationStep){const actualArgs=readFileSync(args,'utf8');assert.equal(actualArgs.includes('--strict'),event!=='push','Pushes validate schema while explicit dry runs also inspect freshness')}
  }
 }
 console.log('DOCS STEWARD WORKFLOW OK: push/dry-run independent of OAuth and model runtime, read-only credentials, preserved legacy writer and strict gates, private diagnostics confined to workspace')
}finally{rmSync(root,{recursive:true,force:true})}
