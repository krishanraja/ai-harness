#!/usr/bin/env node
import assert from 'node:assert/strict'
import {validateHistoryAppend} from './validate-knowledge-history.mjs'
import {isInertKnowledgeLine,sourceEvidenceSeals,observationKnowledge,policyAt} from './repository-brain.mjs'
const row={id:'source.one',version:1,statement:'Original wording\u2014and its punctuation.',conditions:['One setting.']}
const before=JSON.stringify(row)+'\n',encoded=before.replace(/\u2014/g,'\\u2014')
assert.throws(()=>validateHistoryAppend(before,encoded),/rewritten/)
assert.deepEqual(validateHistoryAppend(before,before+JSON.stringify({id:'source.two'})+'\n'),{retained:1,appended:1})
assert.throws(()=>validateHistoryAppend(before,''),/removed/)
assert.throws(()=>validateHistoryAppend(before,JSON.stringify({...row,statement:'A changed meaning, however small.'})+'\n'),/rewritten/)
assert.throws(()=>validateHistoryAppend(before,JSON.stringify({...row,conditions:['Another setting.']})+'\n'),/rewritten/)
assert.throws(()=>validateHistoryAppend(before,'{broken'),/JSON|Expected/)
const policy=policyAt(),observation={id:'source:one',repo:'content-engine',class:'correction',source:'github',quote:row.statement}
const record=observationKnowledge(observation,policy),line=JSON.stringify(record),sources=sourceEvidenceSeals([observation],policy)
assert.equal(isInertKnowledgeLine('brain/knowledge.jsonl',line,sources),true)
assert.equal(isInertKnowledgeLine('brain/knowledge.jsonl',line),false,'A self-declared source status grants no exemption')
assert.equal(isInertKnowledgeLine('brain/knowledge.jsonl',JSON.stringify({...row,status:'candidate'}),sources),false,'A forged candidate must match independently reconstructed evidence')
assert.equal(isInertKnowledgeLine('brain/knowledge.jsonl',JSON.stringify({...record,statement:'A self-declared candidate can never change the verified source.'}),sources),false)
for(const status of ['accepted','rejected','superseded','unknown'])assert.equal(isInertKnowledgeLine('brain/knowledge.jsonl',JSON.stringify({...record,status}),sources),false)
assert.equal(isInertKnowledgeLine('contract/rules.md',line,sources),false)
assert.equal(isInertKnowledgeLine('brain/knowledge.jsonl','{broken',sources),false)
assert.throws(()=>validateHistoryAppend(line+'\n',JSON.stringify({...row,status:'candidate',statement:'Changed inert evidence is still an illegal historical rewrite.'})+'\n'),/rewritten/)
console.log('KNOWLEDGE HISTORY OK: exact append-only bytes; independently reconstructed source evidence cannot self-declare authority or rewrite history')
