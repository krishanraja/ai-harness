#!/usr/bin/env node
import assert from 'node:assert/strict'
import {validateHistoryAppend} from './validate-knowledge-history.mjs'
import {isLegacyEvidenceLine} from './lib/legacy-evidence-format.mjs'
import {createHash} from 'node:crypto'
const row={id:'source.one',version:1,statement:'Original wording\u2014and its punctuation.',conditions:['One setting.']}
const before=JSON.stringify(row)+'\n',encoded=before.replace(/\u2014/g,'\\u2014')
assert.throws(()=>validateHistoryAppend(before,encoded),/rewritten/)
assert.deepEqual(validateHistoryAppend(before,before+JSON.stringify({id:'source.two'})+'\n'),{retained:1,appended:1})
assert.throws(()=>validateHistoryAppend(before,''),/removed/)
assert.throws(()=>validateHistoryAppend(before,JSON.stringify({...row,statement:'A changed meaning, however small.'})+'\n'),/rewritten/)
assert.throws(()=>validateHistoryAppend(before,JSON.stringify({...row,conditions:['Another setting.']})+'\n'),/rewritten/)
assert.throws(()=>validateHistoryAppend(before,'{broken'),/JSON|Expected/)
const historic={...row,status:'candidate'},line=JSON.stringify(historic),entry={id:historic.id,line_sha256:createHash('sha256').update(line).digest('hex')},allowance={schema_version:1,records:[entry,{id:'another',line_sha256:'x'}]}
assert.equal(isLegacyEvidenceLine('brain/knowledge.jsonl',line,allowance),true)
assert.equal(isLegacyEvidenceLine('brain/knowledge.jsonl',line+' ',allowance),false)
const accepted=JSON.stringify({...historic,status:'accepted'});assert.equal(isLegacyEvidenceLine('brain/knowledge.jsonl',accepted,{schema_version:1,records:[{id:historic.id,line_sha256:createHash('sha256').update(accepted).digest('hex')},entry]}),false)
assert.equal(isLegacyEvidenceLine('contract/rules.md',line,allowance),false)
console.log('KNOWLEDGE HISTORY OK: exact append-only bytes; two hash-bound historical exceptions cannot admit changed or accepted instructions')
