#!/usr/bin/env node
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {mkdtempSync,writeFileSync,readFileSync,mkdirSync,rmSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {aggregateMeasurements,validateMeasurement,measurementSeal,measurementHash,measurementMarker,verifyMeasurement,inspectMeasurementEvidence} from './lib/repository-measurements.mjs'
import {measurementEnvelope} from './repository-health.mjs'
import {policyAt,observationKnowledge} from './repository-brain.mjs'
import {intake} from './intake-observations.mjs'
import {envelopeSha} from './import-harness-events.mjs'
const policy=policyAt(),hash=s=>createHash('sha256').update(s).digest('hex'),h=hash('fixture'),source='a'.repeat(40)
const contextFiles={'AGENTS.md':'<!-- krish-repo-admin:start brain=111111111111 sha=000000000000 -->\nFixture context.\n','CLAUDE.md':'@AGENTS.md\n','docs/HARNESS_CONTEXT.md':'<!-- krish-repo-context:start brain=111111111111 sha=000000000000 -->\nFixture reference.\n'}
const base=(kind='opportunity',details={result:'avoidable-correction',failure_class:'lost-intent',failure_layer:'interpretation'})=>({schema_version:1,id:'fixture.'+kind,observed_at:'2026-10-17T10:00:00.000Z',repository:'content-engine',kind,evidence_class:'production',source:{provider:'claude-code-web',account_sha256:h,run_sha256:hash('run')},source_revision:source,brain_revision:'1'.repeat(12),view_sha256:measurementSeal(contextFiles),workflow:'content',condition_sha256:h,opportunity_id:h,knowledge_ids:['administration.preserve-intent'],details,receipt:null})
const event=m=>measurementEnvelope(m,m.repository,{at:'2026-10-17T10:00:00Z',policy})
const row=m=>({id:m.id,repo:m.repository,dated:'2026-10-17',measurement:m})
const proven=rows=>Object.fromEntries(rows.map(r=>[measurementSeal(r.measurement),{status:'observed'}]))
assert.equal(aggregateMeasurements([]).effectiveness.opportunities,null)
assert.throws(()=>validateMeasurement({...base(),verified:true},{repository:'content-engine',targets:policy.targets}),/invalid_measurement/)
assert.throws(()=>validateMeasurement(base(),{repository:'AEO-Engine',targets:policy.targets}),/repository_mismatch/)
assert.notEqual(measurementHash(base()),measurementHash({...base(),repository:'AEO-Engine'}),'proof identity binds the target repository')
assert.throws(()=>validateMeasurement(base('opportunity',{result:'avoidable-correction',failure_class:'trial',failure_layer:'experiment'}),{repository:'content-engine',targets:policy.targets}),/invalid_opportunity/)
const dir=mkdtempSync(join(tmpdir(),'repository-measurements-'))
try {
 const m=base(),e=event(m),first=intake({events:[e]},{ledgerDir:dir}).fresh
 assert.equal(first.length,1);assert.equal(first[0].class,'measurement');assert.deepEqual(first[0].measurement,m)
 if(process.platform!=='win32'){
  const bin=join(dir,'bin'),input=join(dir,'measurement.json'),submitted=join(dir,'dispatch.json')
  mkdirSync(bin);writeFileSync(input,JSON.stringify(m))
  writeFileSync(join(bin,'gh'),'#!/usr/bin/env node\nconst fs=require("node:fs");fs.writeFileSync(process.env.HARNESS_TEST_DISPATCH_PATH,fs.readFileSync(0,"utf8"));\n',{mode:0o755})
  const cli=spawnSync(process.execPath,['scripts/repository-health.mjs','--record',input,'--repo','content-engine','--submit'],{cwd:process.cwd(),env:{...process.env,PATH:bin+':'+process.env.PATH,HARNESS_TEST_DISPATCH_PATH:submitted},encoding:'utf8'})
  assert.equal(cli.status,0,cli.stderr)
  const receipt=JSON.parse(cli.stdout),payload=JSON.parse(readFileSync(submitted,'utf8')).client_payload,received=intake(payload,{ledgerDir:join(dir,'submitted-ledger')}).fresh[0]
  assert.equal(receipt.observation_id,received.id,'Submission receipt names the durable intake identity')
  assert.equal(receipt.payload_sha256,received.payload_sha256,'Submission receipt uses the independently computed intake envelope hash')
  assert.equal(receipt.measurement_sha256,measurementSeal(m),'Measurement content hash remains separately labelled')
 }
 assert.equal(observationKnowledge(first[0],policy),null,'measurement claims cannot become learned requirements')
 writeFileSync(join(dir,'2026-10.jsonl'),JSON.stringify(first[0])+'\n')
 assert.equal(intake({events:[e]},{ledgerDir:dir}).duplicates,1)
 assert.deepEqual(measurementEnvelope(m,m.repository),measurementEnvelope(m,m.repository),'repeated producer calls preserve event bytes')
 assert.equal(intake({events:[{...e,measurement:{...m,details:{...m.details,failure_class:'other'}}}]},{ledgerDir:dir}).rejected.event_conflict,1)
 assert.notEqual(envelopeSha(e),envelopeSha({...e,measurement:{...m,id:'changed'}}))
 assert.equal(aggregateMeasurements(first).effectiveness.opportunities,null,'transport success does not verify the claim')
 const other={...m,id:'fixture.second',opportunity_id:hash('second')},condition={...m,id:'fixture.conditions',condition_sha256:hash('changed-condition'),opportunity_id:hash('third')}
 const synthetic={...m,id:'fixture.synthetic',evidence_class:'synthetic-evaluation',opportunity_id:hash('fourth')},experiment={...m,id:'fixture.experiment',opportunity_id:hash('experiment'),details:{result:'experiment',failure_class:'underperformed',failure_layer:'experiment'}}
 const rows=[m,other,condition,synthetic,experiment].map(row),a=aggregateMeasurements(rows,{proofs:proven(rows)})
 assert.equal(a.effectiveness.opportunities,3);assert.equal(a.effectiveness.repeated_failures,1);assert.equal(a.groups.length,2)
 assert.equal(a.groups.reduce((n,g)=>n+g.excluded_experiments,0),1)
 assert.equal(aggregateMeasurements([row(experiment)],{proofs:proven([row(experiment)])}).effectiveness.opportunities,null)
 assert.equal(aggregateMeasurements([row(synthetic)],{proofs:proven([row(synthetic)])}).reported,0)
 assert.equal(aggregateMeasurements([row(m),row(m)],{proofs:proven([row(m)])}).effectiveness.opportunities,1)
 const loading=base('loading',{resource_paths:['AGENTS.md']}),artifact={schema_version:1,measurement_sha256:measurementHash(loading),evidence:{kind:'assertion',loaded:true}}
 assert.equal(inspectMeasurementEvidence(loading,artifact).status,'unverified')
 artifact.evidence={kind:'tool-execution',events:[{type:'tool_use',id:'read-one',name:'Read',input:{file_path:'/isolated/AGENTS.md'}},{type:'tool_result',tool_use_id:'read-one',content:'Wrong stale view bytes.'}]}
 assert.equal(inspectMeasurementEvidence(loading,artifact,{contextFiles}).status,'unverified','path-only calls cannot certify loading the claimed view')
 artifact.evidence.events[1].content=contextFiles['AGENTS.md']
 assert.equal(inspectMeasurementEvidence(loading,artifact,{contextFiles}).status,'observed')
 assert.equal(inspectMeasurementEvidence({...loading,view_sha256:hash('stale')},artifact,{contextFiles}).status,'unverified')
 artifact.evidence.events[1].is_error=true;assert.equal(inspectMeasurementEvidence(loading,artifact,{contextFiles}).status,'unverified')
 const app=base('application',{check_ids:['retained-intent']}),application={schema_version:1,measurement_sha256:measurementHash(app),evidence:{kind:'deterministic-checks',results:[{id:'retained-intent',passed:true,expected_sha256:h,actual_sha256:h}]}}
 assert.equal(inspectMeasurementEvidence(app,application).status,'observed')
 application.evidence.results[0].actual_sha256=hash('not-matching');assert.equal(inspectMeasurementEvidence(app,application).status,'unverified')
 const native=base('outcome',{metric:'quality-check',value_sha256:measurementSeal({passed:4}),unit:'checks'}),nativeArtifact={schema_version:1,measurement_sha256:measurementHash(native),evidence:{kind:'native-outcome',metric:'quality-check',value:{passed:4},unit:'checks',source_revision:source}}
 assert.equal(inspectMeasurementEvidence(native,nativeArtifact).status,'observed')
 assert.equal(JSON.stringify(aggregateMeasurements([row(native)],{proofs:proven([row(native)])})).includes('"passed":4'),false,'native values never enter public aggregation')
 const raw=JSON.stringify({schema_version:1,measurement_sha256:measurementHash(m),evidence:{kind:'deterministic-checks',results:[{opportunity_id:h,condition_sha256:h,result:'avoidable-correction',failure_class:'lost-intent',failure_layer:'interpretation',expected_sha256:h,actual_sha256:hash('actual-failure')}]}})
 const receipt={repository:'ai-harness',commit:'b'.repeat(40),path:'state/repository-administration/measurement-fixture.json',sha256:hash(raw),run_id:7,job_id:8,execution_revision:source},withReceipt={...m,receipt}
 assert.notEqual(event(m).event_id,event(withReceipt).event_id,'proof enrichment appends a new event instead of conflicting with the original claim')
 let logs='',owner=false
 const gh={owner:'krishanraja',getFile:async(repo,path)=>({text:contextFiles[path]??raw}),defaultBranch:async()=>({branch:'main'}),jobLogs:async()=>logs,req:async(method,path)=>path.includes('/actions/runs/')?{conclusion:'success',head_sha:source,head_branch:'main',event:'push'}:path.includes('/actions/jobs/')?{conclusion:'success',run_id:7}:path.includes('/compare/')?{status:'ahead'}:path.includes('/pulls/')&&path.endsWith('/files?per_page=100')?[{filename:receipt.path}]:{merged_at:'2026-10-17',merge_commit_sha:receipt.commit,merged_by:{login:owner?'krishanraja':'untrusted'}}}
 assert.equal((await verifyMeasurement(withReceipt,{gh,repository:'content-engine',policy})).reason,'exact-source-job-attestation-missing','an unrelated successful ancestor run is not evidence')
 logs='echo '+measurementMarker(m,receipt.sha256);assert.equal((await verifyMeasurement(withReceipt,{gh,repository:'content-engine',policy})).status,'unverified','a quoted marker is not an emitted receipt')
 logs='2026-10-17T10:00:00.0000000Z '+measurementMarker(m,receipt.sha256)
 assert.equal((await verifyMeasurement(withReceipt,{gh,repository:'content-engine',policy})).status,'observed')
 assert.equal((await verifyMeasurement({...withReceipt,view_sha256:hash('wrong-view')},{gh,repository:'content-engine',policy})).reason,'source-brain-view-not-verified')
 assert.equal((await verifyMeasurement({...withReceipt,receipt:{...receipt,sha256:hash('tamper')}},{gh,repository:'content-engine',policy})).reason,'source-file-hash-mismatch')
 const sourceRun={...base(),id:'fixture.source',repository:null,kind:'source-run',brain_revision:null,view_sha256:null,workflow:null,condition_sha256:null,opportunity_id:null,knowledge_ids:[],details:{status:'failed',account_enumeration:'unverified',pagination:'partial',sessions_read:1,pages_read:1,cursor_sha256:null,acknowledged_payload_sha256:null}}
 validateMeasurement(sourceRun,{repository:null,targets:policy.targets})
 assert.equal(aggregateMeasurements([{...row(sourceRun),dated:'2026-01-01'}],{proofs:{[measurementSeal(sourceRun)]:{status:'source-receipt'}}}).sources[0].status,'stale')
 assert.equal(aggregateMeasurements([row(sourceRun)],{proofs:{[measurementSeal(sourceRun)]:{status:'source-receipt'}}}).sources[0].status,'failed')
 await assert.rejects(()=>verifyMeasurement(withReceipt,{gh,repository:'AEO-Engine',policy}),/repository_mismatch/)
 const wrong={...withReceipt,details:{...withReceipt.details,failure_class:'another'}};assert.equal((await verifyMeasurement(wrong,{gh,repository:'content-engine',policy})).status,'unverified')
 const ownerReceipt={...withReceipt,receipt:{...receipt,run_id:null,job_id:null,owner_pr:12}}
 assert.equal((await verifyMeasurement(ownerReceipt,{gh,repository:'content-engine',policy})).status,'unverified');owner=true
 assert.equal((await verifyMeasurement(ownerReceipt,{gh,repository:'content-engine',policy})).status,'observed','owner-reviewed deterministic evidence also remains independently bound')
 console.log('REPOSITORY MEASUREMENTS OK: validated intake, source/job/target binding, reported vs observed, condition-compatible repeats, experiment isolation, private outcome references and unknown effectiveness')
}finally{rmSync(dir,{recursive:true,force:true})}
