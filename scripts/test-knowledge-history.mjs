#!/usr/bin/env node
import assert from 'node:assert/strict'
import {validateLogicalAppend} from './validate-knowledge-history.mjs'
const row={id:'source.one',version:1,statement:'Original wording\u2014and its punctuation.',conditions:['One setting.']}
const before=JSON.stringify(row)+'\n',encoded=before.replace(/\u2014/g,'\\u2014')
assert.deepEqual(validateLogicalAppend(before,encoded),{retained:1,appended:0})
assert.deepEqual(validateLogicalAppend(before,encoded+JSON.stringify({id:'source.two'})+'\n'),{retained:1,appended:1})
assert.throws(()=>validateLogicalAppend(before,''),/removed/)
assert.throws(()=>validateLogicalAppend(before,JSON.stringify({...row,statement:'A changed meaning, however small.'})+'\n'),/rewritten/)
assert.throws(()=>validateLogicalAppend(before,JSON.stringify({...row,conditions:['Another setting.']})+'\n'),/rewritten/)
assert.throws(()=>validateLogicalAppend(before,'{broken'),/JSON|Expected/)
console.log('KNOWLEDGE HISTORY OK: lossless escapes accepted; historical field changes and removal rejected')
