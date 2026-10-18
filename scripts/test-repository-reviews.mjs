#!/usr/bin/env node
import assert from 'node:assert/strict'
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {promoteOwnerReviews,validateReview,REVIEWS} from './repository-reviews.mjs'
import {policyAt,knowledgeHistory} from './repository-brain.mjs'
const root=mkdtempSync(join(tmpdir(),'owner-review-'))
try {
 mkdirSync(join(root,'contract'));mkdirSync(join(root,'brain'))
 writeFileSync(join(root,'contract/repository-administration.json'),readFileSync('contract/repository-administration.json'))
 for(const p of ['knowledge','acceptances','reviews'])writeFileSync(join(root,'brain',p+'.jsonl'),'')
 const candidate={id:'candidate.example',repository:'content-engine',evidence:[{id:'evidence:one'}]}
 const r=validateReview({candidate_id:candidate.id,repository:candidate.repository,type:'procedure',statement:'Retain accepted decisions when revising a single dimension.',conditions:['During a scoped iteration.'],uncertainties:['The code may still need a separate repair.'],why:'A direct correction showed prior decisions being lost.',alternative_explanations:'A retrieval failure could explain the same symptom.',if_wrong:'Obsolete decisions might survive a deliberate change.',validation:'Replay the revision against the accepted brief.',rollback:'An owner-reviewed supersession restores the earlier view.'},[candidate],policyAt())
 let actor='other',extra=false
 const gh={owner:'krishanraja',listPulls:async()=>[{number:7,merged_at:'2026-10-17',head:{ref:'harness/repository-learning-test'}}],getFile:async(repo,path,ref)=>({text:ref==='before'?'':JSON.stringify(r)+'\n'}),req:async(method,path)=>path.endsWith('/files?per_page=100')?(extra?[{filename:REVIEWS},{filename:'contract/repository-administration.json'}]:[{filename:REVIEWS}]):path.includes('/git/commits/')?{parents:[{sha:'before'}]}:{merged_by:{login:actor},merge_commit_sha:'a'.repeat(40)}}
 assert.deepEqual(await promoteOwnerReviews({gh,root,write:true}),[],'A model or bot merge cannot accept meaning')
 actor='krishanraja';extra=true
 await assert.rejects(()=>promoteOwnerReviews({gh,root,write:true}),/changed_other_files/)
 assert.equal(readFileSync(join(root,'brain/acceptances.jsonl'),'utf8'),'')
 extra=false
 const result=await promoteOwnerReviews({gh,root,write:true});assert.equal(result.length,1)
 const history=knowledgeHistory(root);assert.equal(history[0].status,'accepted');assert.deepEqual(history[0].conditions,r.conditions)
 assert.deepEqual(await promoteOwnerReviews({gh,root,write:true}),[],'A repeated promotion is idempotent')
 writeFileSync(join(root,'brain/knowledge.jsonl'),JSON.stringify({...history[0],statement:'An automated rewrite cannot reuse this owner merge proof.'})+'\n')
 assert.throws(()=>knowledgeHistory(root),/content_mismatch/)
 console.log('REPOSITORY REVIEWS OK: verified owner, one-file append, exact acceptance, retained nuance, replay and tamper refusal')
}finally{rmSync(root,{recursive:true,force:true})}
