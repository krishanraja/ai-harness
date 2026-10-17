/** Bounded measurement claims and independently fetched GitHub evidence. No claim grants authority. */
import {createHash} from 'node:crypto'
import {existsSync,readFileSync,readdirSync} from 'node:fs'
import {join} from 'node:path'

export const FAILURE_LAYERS=new Set(['missing-evidence','interpretation','scope','retrieval','stale-instructions','ignored-guidance','code-defect','experiment','unknown'])
const KINDS=new Set(['source-run','loading','application','opportunity','outcome'])
const PROVIDERS=new Set(['github','claude-code','claude-code-web','codex','cursor','chatgpt','other'])
const HEX=/^[a-f0-9]{64}$/, COMMIT=/^[a-f0-9]{40}$/, SHORT=/^[a-f0-9]{12}$/
const LABEL=/^[a-z][a-z0-9._:-]{0,79}$/
const PATH=/^(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+$/
const isObject=v=>v&&typeof v==='object'&&!Array.isArray(v)
const only=(o,keys)=>isObject(o)&&Object.keys(o).every(k=>keys.includes(k))
const canonical=v=>Array.isArray(v)?v.map(canonical):isObject(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v
export const measurementSeal=v=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex')
export const measurementHash=m=>measurementSeal(Object.fromEntries(Object.entries(m).filter(([k])=>k!=='receipt')))
const count=n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000
const hashOrNull=v=>v===null||HEX.test(v||'')
const slugOrNull=v=>v===null||LABEL.test(v||'')
const safePath=p=>typeof p==='string'&&p.length<=180&&PATH.test(p)&&!p.split('/').includes('..')

export function validateMeasurement(m,{repository=null,targets=[]}={}) {
 if(!only(m,['schema_version','id','observed_at','repository','kind','evidence_class','source','source_revision','brain_revision','view_sha256','workflow','condition_sha256','opportunity_id','knowledge_ids','details','receipt'])||m.schema_version!==1||!LABEL.test(m.id||'')||!KINDS.has(m.kind))throw new Error('invalid_measurement_identity')
 if(typeof m.observed_at!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(m.observed_at)||!Number.isFinite(Date.parse(m.observed_at)))throw new Error('invalid_measurement_observed_at')
 if(m.repository!==repository||m.repository!==null&&!targets.includes(m.repository))throw new Error('measurement_repository_mismatch')
 if(!['production','synthetic-evaluation'].includes(m.evidence_class))throw new Error('invalid_measurement_evidence_class')
 if(!only(m.source,['provider','account_sha256','run_sha256'])||!PROVIDERS.has(m.source.provider)||!HEX.test(m.source.account_sha256||'')||!HEX.test(m.source.run_sha256||''))throw new Error('invalid_measurement_source')
 if(!COMMIT.test(m.source_revision||''))throw new Error('invalid_measurement_source_revision')
 if(m.kind!=='source-run'&&(!repository||!targets.includes(repository)))throw new Error('measurement_repository_required')
 if(m.kind!=='source-run'&&(!SHORT.test(m.brain_revision||'')||!HEX.test(m.view_sha256||'')||!LABEL.test(m.workflow||'')||!HEX.test(m.condition_sha256||'')))throw new Error('measurement_context_required')
 if(m.kind==='source-run'&&![m.brain_revision,m.view_sha256,m.workflow,m.condition_sha256,m.opportunity_id].every(v=>v===null))throw new Error('source_measurement_has_task_context')
 if(m.kind!=='source-run'&&m.opportunity_id!==null&&!HEX.test(m.opportunity_id||''))throw new Error('invalid_measurement_opportunity')
 if(!Array.isArray(m.knowledge_ids)||m.knowledge_ids.length>12||m.knowledge_ids.some(k=>!LABEL.test(k)))throw new Error('invalid_measurement_knowledge_ids')
 const d=m.details
 if(m.kind==='source-run') {
  if(!only(d,['status','account_enumeration','pagination','sessions_read','pages_read','cursor_sha256','acknowledged_payload_sha256'])||!['complete','partial','failed','unavailable'].includes(d.status)||!['complete','partial','unverified'].includes(d.account_enumeration)||!['complete','partial','unverified'].includes(d.pagination)||!count(d.sessions_read)||!count(d.pages_read)||!hashOrNull(d.cursor_sha256)||!hashOrNull(d.acknowledged_payload_sha256))throw new Error('invalid_source_measurement')
 }else if(m.kind==='loading') {
  if(!only(d,['resource_paths'])||!Array.isArray(d.resource_paths)||!d.resource_paths.length||d.resource_paths.length>12||d.resource_paths.some(p=>!safePath(p)))throw new Error('invalid_loading_measurement')
 }else if(m.kind==='application') {
  if(!only(d,['check_ids'])||!Array.isArray(d.check_ids)||!d.check_ids.length||d.check_ids.length>12||d.check_ids.some(k=>!LABEL.test(k)))throw new Error('invalid_application_measurement')
 }else if(m.kind==='opportunity') {
  if(!m.opportunity_id||!only(d,['result','failure_class','failure_layer'])||!['satisfied','avoidable-correction','experiment','unknown'].includes(d.result)||!slugOrNull(d.failure_class)||!FAILURE_LAYERS.has(d.failure_layer)||d.result==='avoidable-correction'&&(!d.failure_class||d.failure_layer==='experiment')||d.result==='experiment'&&d.failure_layer!=='experiment')throw new Error('invalid_opportunity_measurement')
 }else if(!only(d,['metric','value_sha256','unit'])||!LABEL.test(d.metric||'')||!HEX.test(d.value_sha256||'')||!LABEL.test(d.unit||''))throw new Error('invalid_outcome_measurement')
 if(m.receipt!==null) {
  const r=m.receipt
  if(!only(r,['repository','commit','path','sha256','run_id','job_id','execution_revision','owner_pr'])||!targets.includes(r.repository)||!COMMIT.test(r.commit||'')||!safePath(r.path)||!r.path.endsWith('.json')||!HEX.test(r.sha256||''))throw new Error('invalid_measurement_receipt')
  if(r.owner_pr!=null ? !Number.isSafeInteger(r.owner_pr)||r.owner_pr<1 : !Number.isSafeInteger(r.run_id)||r.run_id<1||!Number.isSafeInteger(r.job_id)||r.job_id<1||!COMMIT.test(r.execution_revision||''))throw new Error('measurement_receipt_provenance_required')
 }
 if(JSON.stringify(m).length>6000)throw new Error('measurement_over_budget')
 return m
}

/** Raw tool execution and deterministic check results are evidence; a prose claim is not. */
export function inspectMeasurementEvidence(m,artifact,{ownerConfirmed=false,contextFiles=null}={}) {
 if(!only(artifact,['schema_version','measurement_sha256','evidence'])||artifact.schema_version!==1||artifact.measurement_sha256!==measurementHash(m))return {status:'unverified',reason:'evidence-payload-mismatch'}
 const e=artifact.evidence
 if(!isObject(e))return {status:'unverified',reason:'evidence-missing'}
 if(ownerConfirmed&&e.kind==='owner-verdict')return {status:'owner-confirmed',basis:'exact owner-reviewed source record'}
 if(m.kind==='loading'&&e.kind==='tool-execution'&&Array.isArray(e.events)&&e.events.length<=2000) {
  if(!contextFiles||measurementSeal(contextFiles)!==m.view_sha256)return {status:'unverified',reason:'loaded-view-bytes-not-bound'}
  const calls=new Map(),reads=new Set()
  const walk=v=>{if(!isObject(v)&&!Array.isArray(v))return;if(v.type==='tool_use'&&v.name==='Read'&&typeof v.input?.file_path==='string')calls.set(v.id,v.input.file_path.replaceAll('\\','/'));if(v.type==='tool_result'&&!v.is_error&&calls.has(v.tool_use_id)){const path=calls.get(v.tool_use_id),target=Object.keys(contextFiles).find(p=>path===p||path.endsWith('/'+p));const content=typeof v.content==='string'?v.content:Array.isArray(v.content)?v.content.filter(c=>c.type==='text').map(c=>c.text).join('\n'):null;if(target&&content===contextFiles[target])reads.add(path)}for(const x of Object.values(v))if(typeof x==='object')walk(x)}
  walk(e.events)
  if(m.details.resource_paths.every(p=>[...reads].some(s=>s===p||s.endsWith('/'+p))))return {status:'observed',basis:'successful Read calls with exact source-view result bytes',paths:m.details.resource_paths}
 }else if(m.kind==='application'&&e.kind==='deterministic-checks'&&Array.isArray(e.results)) {
  const passed=m.details.check_ids.every(id=>e.results.some(r=>r.id===id&&r.passed===true&&HEX.test(r.expected_sha256||'')&&r.expected_sha256===r.actual_sha256))
  if(passed)return {status:'observed',basis:'matching expected and actual hashes in successful source checks',checks:m.details.check_ids}
 }else if(m.kind==='outcome'&&e.kind==='native-outcome'&&e.metric===m.details.metric&&measurementSeal(e.value)===m.details.value_sha256&&e.unit===m.details.unit&&e.source_revision===m.source_revision) {
  return {status:'observed',basis:'version-bound native result; no causal claim'}
 }else if(m.kind==='source-run'&&e.kind==='source-receipt'&&measurementSeal(e.coverage)===measurementSeal(m.details)) {
  return {status:'source-receipt',basis:'source run receipt; completeness limited to declared account/window'}
 }else if(m.kind==='opportunity'&&e.kind==='deterministic-checks'&&Array.isArray(e.results)&&['satisfied','avoidable-correction'].includes(m.details.result)) {
  const result=e.results.find(r=>r.opportunity_id===m.opportunity_id&&r.condition_sha256===m.condition_sha256&&r.result===m.details.result&&r.failure_class===m.details.failure_class&&r.failure_layer===m.details.failure_layer&&HEX.test(r.expected_sha256||'')&&HEX.test(r.actual_sha256||'')&&(r.result==='satisfied'?r.expected_sha256===r.actual_sha256:r.expected_sha256!==r.actual_sha256))
  if(result)return {status:'observed',basis:'condition-bound deterministic opportunity check'}
 }
 return {status:'unverified',reason:'assertion-is-not-observed-evidence'}
}

export const measurementMarker=(m,sha256)=>`HARNESS_REPOSITORY_MEASUREMENT ${m.repository||'unknown'} ${measurementHash(m)} ${sha256}`
async function sourceJobLogs(gh,repository,jobId){
 if(typeof gh.jobLogs==='function')return gh.jobLogs(repository,jobId)
 const res=await fetch(`https://api.github.com/repos/${gh.owner}/${repository}/actions/jobs/${jobId}/logs`,{headers:{authorization:`Bearer ${gh.token}`,accept:'application/vnd.github+json','x-github-api-version':'2022-11-28'},redirect:'follow'})
 if(!res.ok)throw new Error('measurement-job-logs-unavailable')
 const logs=await res.text();if(logs.length>10000000)throw new Error('measurement-job-logs-over-budget');return logs
}

/** Fetch every proof independently. Dispatch authors cannot set a trusted/verified flag. */
export async function verifyMeasurement(m,{gh,repository,policy}) {
 validateMeasurement(m,{repository,targets:policy.targets})
 if(!m.receipt)return {status:'reported-only',reason:'no-independent-source-receipt'}
 const r=m.receipt
 try {
  const file=await gh.getFile(r.repository,r.path,r.commit)
  if(!file||createHash('sha256').update(file.text).digest('hex')!==r.sha256)return {status:'unverified',reason:'source-file-hash-mismatch'}
  if(file.text.length>1000000)return {status:'unverified',reason:'source-evidence-over-budget'}
  const artifact=JSON.parse(file.text)
  let contextFiles=null
  if(m.kind!=='source-run') {
   contextFiles={}
   for(const path of ['AGENTS.md','CLAUDE.md','docs/HARNESS_CONTEXT.md'])contextFiles[path]=(await gh.getFile(m.repository,path,m.source_revision))?.text??null
   if(Object.values(contextFiles).some(v=>v===null)||measurementSeal(contextFiles)!==m.view_sha256||!contextFiles['AGENTS.md'].includes(`brain=${m.brain_revision} `)||!contextFiles['docs/HARNESS_CONTEXT.md'].includes(`brain=${m.brain_revision} `))return {status:'unverified',reason:'source-brain-view-not-verified'}
  }
  let ownerConfirmed=false
  if(r.owner_pr!=null) {
   const pr=await gh.req('GET',`/repos/${gh.owner}/${r.repository}/pulls/${r.owner_pr}`)
   if(!pr.merged_at||pr.merged_by?.login!==policy.owner||pr.merge_commit_sha!==r.commit)return {status:'unverified',reason:'owner-merge-not-verified'}
   const files=await gh.req('GET',`/repos/${gh.owner}/${r.repository}/pulls/${r.owner_pr}/files?per_page=100`)
   if(!files.some(f=>f.filename===r.path))return {status:'unverified',reason:'owner-merge-does-not-contain-evidence'}
   ownerConfirmed=true
  }else {
   const run=await gh.req('GET',`/repos/${gh.owner}/${r.repository}/actions/runs/${r.run_id}`),job=await gh.req('GET',`/repos/${gh.owner}/${r.repository}/actions/jobs/${r.job_id}`),{branch}=await gh.defaultBranch(r.repository)
   if(run.conclusion!=='success'||run.head_sha!==r.execution_revision||run.head_branch!==branch||job.run_id!==r.run_id||job.conclusion!=='success'||run.event==='pull_request'||run.event==='pull_request_target')return {status:'unverified',reason:'successful-trusted-source-run-not-verified'}
   if(r.commit!==run.head_sha){const compare=await gh.req('GET',`/repos/${gh.owner}/${r.repository}/compare/${run.head_sha}...${r.commit}`);if(!['ahead','identical'].includes(compare.status))return {status:'unverified',reason:'evidence-not-descended-from-source-run'}}
   const marker=measurementMarker(m,r.sha256),logs=await sourceJobLogs(gh,r.repository,r.job_id)
   // GitHub log timestamps are permitted; quoted shell commands and partial markers do not count.
   if(!String(logs).split('\n').some(line=>line.replace(/^\d{4}-\d{2}-\d{2}T\S+\s+/,'').trim()===marker))return {status:'unverified',reason:'exact-source-job-attestation-missing'}
  }
  return {...inspectMeasurementEvidence(m,artifact,{ownerConfirmed,contextFiles}),receipt_sha256:r.sha256,source_commit:r.commit,...(r.run_id?{run_id:r.run_id,job_id:r.job_id}:{owner_pr:r.owner_pr})}
 }catch(error){return {status:'unverified',reason:error.status?`github-${error.status}`:'source-evidence-unavailable'}}
}

export async function verifyMeasurementRows(rows,{gh,policy}) {
 const proofs={}
 for(const row of rows.filter(r=>r.measurement)) {
  try{proofs[measurementSeal(row.measurement)]=await verifyMeasurement(row.measurement,{gh,repository:row.repo,policy})}catch{proofs[measurementSeal(row.measurement)]={status:'unverified',reason:'invalid-measurement'}}
 }
 return {schema_version:1,verified_at:new Date().toISOString(),proofs}
}

export function aggregateMeasurements(rows,{repository,proofs={},evidenceClass='production'}={}) {
 const records=[...new Map(rows.filter(r=>r.measurement&&(repository===undefined||r.repo===repository)&&r.measurement.evidence_class===evidenceClass).map(r=>[`${r.repo||'unknown'}:${r.measurement.id}`,r])).values()]
 const verified=records.filter(r=>['observed','owner-confirmed','source-receipt'].includes(proofs[measurementSeal(r.measurement)]?.status))
 const usable=verified.filter(r=>r.measurement.kind!=='source-run'),versions=new Map(),sources=new Map()
 for(const row of records){const m=row.measurement,k=`${m.source.provider}:${m.source.account_sha256}`,prior=sources.get(k),date=row.occurred_at||row.dated||row.seen_at;if(!prior||String(date)>=String(prior.last_received)){const receipt=proofs[measurementSeal(m)]?.status||'reported-only',sourceRun=m.kind==='source-run'?{at:date,receipt,coverage:m.details}:prior?.last_source_run||null;const age=(Date.now()-Date.parse(sourceRun?.at||date))/86400000;sources.set(k,{provider:m.source.provider,account_sha256:m.source.account_sha256,last_received:date,run_sha256:m.source.run_sha256,receipt,status:age>14?'stale':sourceRun&&['source-receipt','owner-confirmed'].includes(sourceRun.receipt)?sourceRun.coverage.status:'coverage-unverified',...(sourceRun?{last_source_run:sourceRun,coverage:sourceRun.coverage}: {})})}}
 for(const row of usable){const m=row.measurement,key=`${m.source.provider}:${m.source.account_sha256}:${m.source_revision}:${m.brain_revision}:${m.view_sha256}:${m.workflow}:${m.condition_sha256}`;if(!versions.has(key))versions.set(key,{source:m.source,source_revision:m.source_revision,brain_revision:m.brain_revision,view_sha256:m.view_sha256,workflow:m.workflow,condition_sha256:m.condition_sha256,knowledge_ids:[],loaded:0,application_checks:0,opportunities:new Map(),outcomes:[]});const v=versions.get(key);v.knowledge_ids=[...new Set([...v.knowledge_ids,...m.knowledge_ids])];if(m.kind==='loading')v.loaded++;if(m.kind==='application')v.application_checks+=m.details.check_ids.length;if(m.kind==='opportunity')v.opportunities.set(m.opportunity_id,m);if(m.kind==='outcome')v.outcomes.push({metric:m.details.metric,value_sha256:m.details.value_sha256,unit:m.details.unit,measurement_id:m.id,basis:'Native value stays at its authorized source.'})}
 const groups=[...versions.values()].map(v=>{const all=[...v.opportunities.values()],opportunities=all.filter(m=>['satisfied','avoidable-correction'].includes(m.details.result)&&m.details.failure_layer!=='experiment'),failures=opportunities.filter(m=>m.details.result==='avoidable-correction'),byClass=new Map(),layers={};for(const m of failures){byClass.set(m.details.failure_class,(byClass.get(m.details.failure_class)||0)+1);layers[m.details.failure_layer]=(layers[m.details.failure_layer]||0)+1}return {...v,opportunities:opportunities.length||null,excluded_experiments:all.filter(m=>m.details.result==='experiment'||m.details.failure_layer==='experiment').length,unknown_opportunities:all.filter(m=>m.details.result==='unknown').length,avoidable_corrections:opportunities.length?failures.length:null,repeated_failures:opportunities.length?[...byClass.values()].reduce((n,c)=>n+Math.max(0,c-1),0):null,failure_layers:layers,outcomes:v.outcomes}})
 const opportunities=groups.reduce((n,g)=>n+(g.opportunities||0),0)
 return {reported:records.length,verified:verified.length,unverified:records.length-verified.length,sources:[...sources.values()],loaded:groups.reduce((n,g)=>n+g.loaded,0),application_checks:groups.reduce((n,g)=>n+g.application_checks,0),groups,effectiveness:{opportunities:opportunities||null,repeated_failures:opportunities?groups.reduce((n,g)=>n+(g.repeated_failures||0),0):null,avoidable_corrections:opportunities?groups.reduce((n,g)=>n+(g.avoidable_corrections||0),0):null,status:opportunities?'observed-comparable-opportunities':'awaiting-observed-work',basis:'Only verified production records; repeats grouped by exact source, brain, view, workflow and condition.'}}
}

export function readMeasurementProofs(root){const p=join(root,'state/repository-administration/measurement-verification.json');return existsSync(p)?JSON.parse(readFileSync(p,'utf8')):{proofs:{}}}
export function readMinerCheckpoints(root){const dir=join(root,'state/session-miner');if(!existsSync(dir))return [];return readdirSync(dir).filter(f=>f.endsWith('.jsonl')).flatMap(f=>readFileSync(join(dir,f),'utf8').split('\n').filter(Boolean).map(JSON.parse))}
