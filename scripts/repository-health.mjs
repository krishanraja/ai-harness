#!/usr/bin/env node
/** Counts only observed coverage; unavailable history access is never called healthy. */
import {writeFileSync,existsSync,readFileSync} from 'node:fs'
import {join,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {ROOT,policyAt,knowledgeHistory,profiles,effectiveKnowledge} from './repository-brain.mjs'
import {loadLedger} from './propose.mjs'
export function repositoryHealth(root=ROOT) {
  const policy=policyAt(root), rows=loadLedger(root), history=knowledgeHistory(root)
  const deployments=existsSync(join(root,'state/repository-administration/latest.json'))?JSON.parse(readFileSync(join(root,'state/repository-administration/latest.json'),'utf8')).results:[]
  return {schema_version:1,generated_at:new Date().toISOString(),sources:{github:{status:'available',basis:'existing observation ledger'},ai_history:{status:'coverage-unverified',basis:'Only delivered episodes are measurable; source accounts, history pagination and unavailable sessions are not inferred.'},hosted_exporter:{status:process.env.HARNESS_EVENT_EXPORT_URL?'configured-unverified':'optional-unconfigured'}},unknown_repository_observations:rows.filter(r=>!r.repo).length,repositories:profiles(root).map(p=>{
    const evidence=rows.filter(r=>r.repo===p.repository),episodes=evidence.filter(r=>r.schema_version===2),view=effectiveKnowledge(history,{repository:p.repository,families:p.families},policy)
    const deployed=deployments.find(r=>r.repository===p.repository)
    return {repository:p.repository,delivered_episodes:new Set(episodes.map(r=>r.episode_id)).size,last_delivered:episodes.map(r=>r.seen_at).sort().at(-1)||null,accepted:view.accepted.length,candidates:view.candidates.length,unknown_coverage:true,delivery:deployed?.status||'not-verified',brain_revision:deployed?.brain_revision||null,source_base:deployed?.base||null,bootstrap_before:deployed?.before??null,bootstrap_after:deployed?.after??null,effectiveness:{opportunities:null,repeated_failures:null,status:'awaiting-observed-work'}}
  })}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const report=repositoryHealth();const i=process.argv.indexOf('--out');if(i!==-1)writeFileSync(process.argv[i+1],JSON.stringify(report,null,2)+'\n');else console.log(JSON.stringify(report,null,2))}
