#!/usr/bin/env node
import assert from 'node:assert/strict'
import {mkdtempSync,writeFileSync,readFileSync,existsSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {mine,verifyReceipts,cloudCursor,acknowledgePending,dispatch,clipDeferredCursors} from './mine-sessions.mjs'
import {intake} from './intake-observations.mjs'
import {observationKnowledge,policyAt,seal,validateKnowledge,serializeKnowledge} from './repository-brain.mjs'
import {validateReview} from './repository-reviews.mjs'
import {envelopeSha,observationId} from './import-harness-events.mjs'
const dir=mkdtempSync(join(tmpdir(),'repository-learning-'))
try {
 const result=mine([{role:'user',text:'Keep the real subject and the central argument.',session:'one',repository:'content-engine',source_event_id:'initial'}, {role:'user',text:'No, make the title shorter, keep the earlier decisions.',session:'one',repository:'content-engine',source_event_id:'delta'}],{surface:'codex',extract:()=>[{excerpt:0,kind:'explicit_correction',summary:'A length revision must preserve accepted subject and argument decisions.',knowledge_type:'procedure',context:{goal:'Communicate the finding.',retained:['Subject and argument.'],requested_change:'Reduce length.',uncertainties:['No subsequent result observed.']},severity:'medium',confidence:'high'}]})
 assert.equal(result.envelopes.length,1)
 const e=result.envelopes[0], r=intake({events:[e]},{ledgerDir:dir}).fresh[0]
 const knowledge=observationKnowledge(r,policyAt())
 assert.equal(knowledge.status,'candidate');assert.equal(knowledge.scope.repository,'content-engine');assert.equal(knowledge.acceptance_ref,undefined)
 const run=()=>JSON.stringify([{name:'2026-10.jsonl'}])
 const ledgerRun=(command,args)=>args[1].includes('2026-10.jsonl')?JSON.stringify({content:Buffer.from(JSON.stringify(r)+'\n').toString('base64')}):run()
 assert.equal(verifyReceipts([e],{run:ledgerRun}),true)
 const notStored=(command,args)=>args[1].includes('2026-10.jsonl')?JSON.stringify({content:''}):run()
 assert.equal(verifyReceipts([e],{run:notStored}),false,'An accepted dispatch without durable storage cannot move a cursor')
 const cursorPath=join(dir,'cursor.json'),pendingPath=join(dir,'pending.json'),pending={envelopes:[e],next_cursor:{source:2}}
 writeFileSync(cursorPath,JSON.stringify({source:1}));writeFileSync(pendingPath,JSON.stringify(pending))
 assert.equal(acknowledgePending(pending,{cursorPath,pendingPath,verify:()=>false}),false)
 assert.deepEqual(JSON.parse(readFileSync(cursorPath,'utf8')),{source:1});assert.ok(existsSync(pendingPath))
 assert.equal(acknowledgePending(pending,{cursorPath,pendingPath,verify:()=>true}),true)
 assert.deepEqual(JSON.parse(readFileSync(cursorPath,'utf8')),{source:2});assert.equal(existsSync(pendingPath),false)
 const historical={statement:'A historical source retained its punctuation\u2014and its meaning.'}
 const encoded=serializeKnowledge(historical);assert.deepEqual(JSON.parse(encoded),historical);assert.equal(encoded.includes('\u2014'),false)
 const batches=[],large={...e,episode:{goal:'\u5b57'.repeat(500),requested_change:'\u5b57'.repeat(500),attempt:'\u5b57'.repeat(500),outcome:'\u5b57'.repeat(500),retained:['\u5b57'.repeat(450),'\u5b57'.repeat(450)],conditions:['\u5b57'.repeat(450)],uncertainties:['\u5b57'.repeat(450)]}}
 assert.equal(dispatch(Array.from({length:30},()=>large),{run:(cmd,args,options)=>{assert.ok(Buffer.byteLength(options.input,'utf8')<=60000);batches.push(JSON.parse(options.input).client_payload.events)}}).sent,30)
 assert.ok(batches.length>2,'Structured multilingual episodes must split by UTF-8 bytes as well as event count')
 assert.throws(()=>verifyReceipts([{...e,summary:'A different paraphrase cannot silently replace stored evidence.'}],{run:ledgerRun}),/payload_conflict/)
 const first=cloudCursor([{session:'s',at:'same',source_event_id:'one'}],{})
 const second=cloudCursor([{session:'s',at:'same',source_event_id:'one'},{session:'s',at:'same',source_event_id:'two'}],first.next)
 assert.deepEqual(second.turns.map(t=>t.fresh),[false,true],'Equal timestamps cannot drop a later paginated event')
 const cappedTurns=['one','two','three'].map(source_event_id=>({session:'capped',at:'same-time',source_event_id}))
 const whole=cloudCursor(cappedTurns,{})
 const clipped=clipDeferredCursors(cappedTurns,{},whole.next,[{session:'capped',at:'same-time',turn_index:2}])
 assert.deepEqual(cloudCursor(cappedTurns,clipped).turns.map(t=>t.fresh),[false,false,true],'A capped cloud batch advances to its processed prefix rather than replaying it forever')
 const candidate={id:'candidate.one',repository:'content-engine',evidence:[r]}
 const proposal={candidate_id:candidate.id,repository:candidate.repository,type:'procedure',statement:'Preserve the accumulated decisions when changing one dimension.',why:'Repeated corrections show earlier decisions being lost.',alternative_explanations:'Retrieval or owning stage defects may explain the failure.',if_wrong:'An obsolete decision could block a useful revision.',validation:'Check a fresh revision against the retained decisions.',rollback:'Supersede the accepted record with an owner-reviewed correction.'}
 const review=validateReview(proposal,[candidate],policyAt());assert.equal(review.evidence_ids[0],r.id)
 assert.throws(()=>validateReview({...proposal,repository:'AEO-Engine'},[candidate],policyAt()),/scope_not_earned/)
 assert.throws(()=>validateReview({...proposal,accepted:true},[candidate],policyAt()),/unknown_field/)
 const scopedCandidate={...candidate,allowed_workflows:['content']}
 assert.equal(validateReview({...proposal,workflow:'content'},[scopedCandidate],policyAt()).workflow,'content')
 assert.throws(()=>validateReview({...proposal,workflow:'unrelated'},[scopedCandidate],policyAt()),/workflow_outside/)
 assert.throws(()=>validateReview({...proposal,type:'working_decision'},[scopedCandidate],policyAt()),/native_task_briefs/)
 const accepted={...knowledge,status:'accepted',acceptance_ref:'plan:brain-repository-administration-v1'}
 assert.throws(()=>validateKnowledge(accepted,policyAt()),/content_mismatch/)
 console.log('REPOSITORY LEARNING OK: episode to scoped candidate, no implicit acceptance, durable receipts, timestamp ties and review isolation')
} finally {rmSync(dir,{recursive:true,force:true})}
