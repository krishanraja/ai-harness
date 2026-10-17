#!/usr/bin/env node
import assert from 'node:assert/strict'
import {validateHistoryAppend} from './validate-knowledge-history.mjs'
import {isInertKnowledgeLine} from './repository-brain.mjs'
const row={id:'source.one',version:1,statement:'Original wording\u2014and its punctuation.',conditions:['One setting.']}
const before=JSON.stringify(row)+'\n',encoded=before.replace(/\u2014/g,'\\u2014')
assert.throws(()=>validateHistoryAppend(before,encoded),/rewritten/)
assert.deepEqual(validateHistoryAppend(before,before+JSON.stringify({id:'source.two'})+'\n'),{retained:1,appended:1})
assert.throws(()=>validateHistoryAppend(before,''),/removed/)
assert.throws(()=>validateHistoryAppend(before,JSON.stringify({...row,statement:'A changed meaning, however small.'})+'\n'),/rewritten/)
assert.throws(()=>validateHistoryAppend(before,JSON.stringify({...row,conditions:['Another setting.']})+'\n'),/rewritten/)
assert.throws(()=>validateHistoryAppend(before,'{broken'),/JSON|Expected/)
const line=JSON.stringify({...row,status:'candidate'})
assert.equal(isInertKnowledgeLine('brain/knowledge.jsonl',line),true)
assert.equal(isInertKnowledgeLine('brain/knowledge.jsonl',JSON.stringify({...row,status:'observed'})),true)
for(const status of ['accepted','rejected','superseded','unknown'])assert.equal(isInertKnowledgeLine('brain/knowledge.jsonl',JSON.stringify({...row,status})),false)
assert.equal(isInertKnowledgeLine('contract/rules.md',line),false)
assert.equal(isInertKnowledgeLine('brain/knowledge.jsonl','{broken'),false)
assert.throws(()=>validateHistoryAppend(line+'\n',JSON.stringify({...row,status:'candidate',statement:'Changed inert evidence is still an illegal historical rewrite.'})+'\n'),/rewritten/)
console.log('KNOWLEDGE HISTORY OK: exact append-only bytes; source observations stay inert and accepted instructions retain authored-text checks')
