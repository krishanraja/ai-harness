#!/usr/bin/env node
import assert from 'node:assert/strict'
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {mine,verifyReceipts,cloudCursor} from './mine-sessions.mjs'
import {intake} from './intake-observations.mjs'
import {observationKnowledge,policyAt,seal,validateKnowledge} from './repository-brain.mjs'
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
 assert.throws(()=>verifyReceipts([{...e,summary:'A different paraphrase cannot silently replace stored evidence.'}],{run:ledgerRun}),/payload_conflict/)
 const first=cloudCursor([{session:'s',at:'same',source_event_id:'one'}],{})
 const second=cloudCursor([{session:'s',at:'same',source_event_id:'one'},{session:'s',at:'same',source_event_id:'two'}],first.next)
 assert.deepEqual(second.turns.map(t=>t.fresh),[false,true],'Equal timestamps cannot drop a later paginated event')
 const candidate={id:'candidate.one',repository:'content-engine',evidence:[r]}
 const proposal={candidate_id:candidate.id,repository:candidate.repository,type:'procedure',statement:'Preserve the accumulated decisions when changing one dimension.',why:'Repeated corrections show earlier decisions being lost.',alternative_explanations:'Retrieval or owning stage defects may explain the failure.',if_wrong:'An obsolete decision could block a useful revision.',validation:'Check a fresh revision against the retained decisions.',rollback:'Supersede the accepted record with an owner-reviewed correction.'}
 const review=validateReview(proposal,[candidate],policyAt());assert.equal(review.evidence_ids[0],r.id)
 assert.throws(()=>validateReview({...proposal,repository:'AEO-Engine'},[candidate],policyAt()),/scope_not_earned/)
 assert.throws(()=>validateReview({...proposal,accepted:true},[candidate],policyAt()),/unknown_field/)
 const accepted={...knowledge,status:'accepted',acceptance_ref:'plan:brain-repository-administration-v1'}
 assert.throws(()=>validateKnowledge(accepted,policyAt()),/content_mismatch/)
 console.log('REPOSITORY LEARNING OK: episode to scoped candidate, no implicit acceptance, durable receipts, timestamp ties and review isolation')
} finally {rmSync(dir,{recursive:true,force:true})}
