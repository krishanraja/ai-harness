#!/usr/bin/env node
/** Immutable JSON records: transport escapes may change; historical values may not. */
import {readFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {isDeepStrictEqual} from 'node:util'
import {resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
export function validateLogicalAppend(before,after){
 const rows=s=>String(s).split('\n').filter(Boolean).map(JSON.parse),old=rows(before),next=rows(after)
 if(next.length<old.length)throw new Error('knowledge_history_removed')
 for(let i=0;i<old.length;i++)if(!isDeepStrictEqual(old[i],next[i]))throw new Error('knowledge_history_rewritten:'+i)
 return {retained:old.length,appended:next.length-old.length}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const base=process.argv[process.argv.indexOf('--base')+1]
 if(!/^[a-f0-9]{40}$/.test(base||''))throw new Error('expected_exact_history_base')
 const path='brain/knowledge.jsonl',before=execFileSync('git',['show',base+':'+path],{encoding:'utf8'})
 console.log(JSON.stringify(validateLogicalAppend(before,readFileSync(path,'utf8'))))
}
