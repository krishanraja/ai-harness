import {createHash} from 'node:crypto'
/** Only exact immutable historical source records qualify; accepted instructions never do. */
export function isLegacyEvidenceLine(file,line,allowance){
 if(file!=='brain/knowledge.jsonl'||allowance?.schema_version!==1||!Array.isArray(allowance.records)||allowance.records.length!==2)return false
 let row;try{row=JSON.parse(line)}catch{return false}
 if(!['observed','candidate'].includes(row.status))return false
 const hash=createHash('sha256').update(line,'utf8').digest('hex')
 return allowance.records.some(r=>r.id===row.id&&r.line_sha256===hash)
}
