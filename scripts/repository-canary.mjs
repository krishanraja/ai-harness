#!/usr/bin/env node
/** Fresh-model fixture evidence. Never claims production use or subjective title quality. */
import {mkdirSync,writeFileSync,readFileSync,existsSync} from 'node:fs'
import {join,resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {Gh} from './lib/github.mjs'
import {redact} from './lib/redact.mjs'
import {profiles,policyAt,knowledgeHistory,ROOT,seal} from './repository-brain.mjs'
import {planAdministration,TARGET_CHECK} from './repository-admin.mjs'
export async function prepareCanary({repository,kind,gh,root=ROOT,out='.canary'}) {
 const policy=policyAt(root),profile=profiles(root).find(p=>p.repository===repository)
 if(!policy.pilots.includes(repository)||!['orientation','iteration'].includes(kind))throw new Error('canary_outside_pilots')
 const {branch}=await gh.defaultBranch(repository),base=await gh.headSha(repository,branch),files={}
 for(const p of [...new Set(['AGENTS.md','CLAUDE.md',TARGET_CHECK,profile.context_path,...profile.sources.map(s=>s.path)])]) files[p]=(await gh.getFile(repository,p,base))?.text??null
 const mp=join(root,'state/repository-administration/migrations',repository+'.json')
 const migration=files['AGENTS.md']?.includes('<!-- krish-repo-admin:')?null:existsSync(mp)?JSON.parse(readFileSync(mp,'utf8')):null
 const plan=planAdministration(profile,files,knowledgeHistory(root),{policy,migration})
 // Fixture delivery uses exact proposed entry bytes. Private source bodies stay out of artifacts.
 for(const p of ['AGENTS.md','CLAUDE.md',profile.context_path]){mkdirSync(dirname(join(out,p)),{recursive:true});writeFileSync(join(out,p),plan.changes[p]??files[p])}
 const task=kind==='orientation'?{request:'Locate the owning workflow and verification route for the primary work this repository performs. Identify the sources you would inspect before altering behaviour; do not execute application commands.'}:repository==='content-engine'?{goal:'Explain why a synthetic instrument recovered a hidden signal.',accepted_decisions:[{id:'subject-719',text:'Name the instrument.'},{id:'finding-286',text:'Retain the actual recovered finding.'},{id:'tone-541',text:'Stay curious without preaching.'}],latest_request:'Make the title shorter.',request:'Describe the revision delta and which decisions remain. Do not invent final title quality.'}:{observation:{condition:'Synthetic pilot cohort Z, one trial',outcome:'The test underperformed.',uncertainty:'The cause is unknown.'},request:'Can we run a revised offline test on a different cohort? Does this observation prohibit the tactic across repositories?'}
 writeFileSync(join(out,'task.json'),JSON.stringify({repository,kind,task},null,2)+'\n')
 writeFileSync(join(out,'expected.json'),JSON.stringify({repository,kind,source_base:base,brain_revision:plan.revision,delivered_sha:seal(Object.fromEntries(['AGENTS.md','CLAUDE.md',profile.context_path].map(p=>[p,plan.changes[p]??files[p]]))),workflow:profile.workflows[0].id,read:profile.workflows[0].read},null,2)+'\n')
}
export function verifyCanary({out='.canary',execution}){
 const expected=JSON.parse(readFileSync(join(out,'expected.json'),'utf8'))
 const reads=new Set(),walk=(v)=>{if(!v||typeof v!=='object')return;if(v.type==='tool_use'&&v.name==='Read'&&typeof v.input?.file_path==='string')reads.add(v.input.file_path.replaceAll('\\','/'));for(const x of Object.values(v))if(typeof x==='object')walk(x)}
 if(!execution||!existsSync(execution))throw new Error('canary_execution_evidence_missing')
 const raw=readFileSync(execution,'utf8');let parsed;try{parsed=JSON.parse(raw)}catch{parsed=raw.split('\n').filter(Boolean).map(s=>JSON.parse(s))}walk(parsed)
 const results=[],findResults=v=>{if(!v||typeof v!=='object')return;if(v.type==='result')results.push(v);for(const x of Object.values(v))if(typeof x==='object')findResults(x)};findResults(parsed)
 const final=results.at(-1),output=final?.result||''
 if(final?.is_error)throw new Error('canary_model_error:'+redact(output).replace(/\s+/g,' ').slice(0,400))
 const answer=JSON.parse(output.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g,''))
 const diagnostic=redact(JSON.stringify(Object.fromEntries(['repository','kind','retained_decision_ids','superseded_decision_ids','requested_delta','conditions','global_prohibition','revised_offline_test_allowed','cause_known'].filter(k=>k in answer).map(k=>[k,answer[k]])))).slice(0,1200)
 if(answer.repository!==expected.repository||answer.kind!==expected.kind)throw new Error('wrong_canary_scope')
 for(const p of ['CLAUDE.md','AGENTS.md','docs/HARNESS_CONTEXT.md'])if(![...reads].some(s=>s.endsWith('/.canary/'+p)||s==='.canary/'+p))throw new Error('canary_entry_or_context_not_observed:'+p)
 if([...reads].some(s=>s.endsWith('/expected.json')))throw new Error('canary_read_hidden_expectations')
 if(expected.kind==='orientation'){
  if(answer.workflow!==expected.workflow||!Array.isArray(answer.sources)||!expected.read.every(p=>answer.sources.includes(p)))throw new Error('canary_system_route_lost')
  if(answer.execute_product_actions!==false)throw new Error('canary_authority_expanded')
 }else if(expected.repository==='content-engine'){
  if(!['subject-719','finding-286','tone-541'].every(id=>answer.retained_decision_ids?.includes(id))||answer.superseded_decision_ids?.length||answer.requested_delta!=='length')throw new Error('canary_iteration_erased_intent:'+diagnostic)
 }else if(answer.global_prohibition!==false||answer.revised_offline_test_allowed!==true||answer.cause_known!==false||!answer.conditions?.includes('Synthetic pilot cohort Z, one trial'))throw new Error('canary_experiment_overlearned:'+diagnostic)
 const receipt={...expected,status:'passed',observed_read_paths:[...reads].filter(s=>s.includes('.canary/')).map(s=>s.slice(s.indexOf('.canary/'))),evidence_kind:'fresh-Claude-fixture',limits:'Fixture routing and behaviour only; production loading, Codex parity, subjective taste and long-term effectiveness unmeasured.'}
 writeFileSync(join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');return receipt
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const args=process.argv.slice(2),flag=f=>args[args.indexOf(f)+1];if(args.includes('--prepare'))await prepareCanary({repository:flag('--repo'),kind:flag('--kind'),gh:new Gh(process.env.FLEET_TOKEN)});else if(args.includes('--verify'))console.log(JSON.stringify(verifyCanary({execution:flag('--execution')})))}
