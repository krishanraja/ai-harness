#!/usr/bin/env node
/** Counts only observed coverage; unavailable history access is never called healthy. */
import {writeFileSync,existsSync,readFileSync,mkdirSync} from 'node:fs'
import {join,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {ROOT,policyAt,knowledgeHistory,profiles,effectiveKnowledge} from './repository-brain.mjs'
import {loadLedger} from './propose.mjs'
import {Gh} from './lib/github.mjs'
import {dispatch} from './mine-sessions.mjs'
import {aggregateMeasurements,readMeasurementProofs,readMinerCheckpoints,verifyMeasurementRows,validateMeasurement,measurementHash,measurementSeal,measurementMarker} from './lib/repository-measurements.mjs'
import {createHash} from 'node:crypto'
import {envelopeSha,observationId} from './import-harness-events.mjs'
export function repositoryHealth(root=ROOT) {
  const policy=policyAt(root), rows=loadLedger(root), history=knowledgeHistory(root)
  const deployments=existsSync(join(root,'state/repository-administration/latest.json'))?JSON.parse(readFileSync(join(root,'state/repository-administration/latest.json'),'utf8')).results:[]
  const verification=readMeasurementProofs(root),proofs=verification.proofs||{},measurements=aggregateMeasurements(rows,{proofs}),checkpoints=readMinerCheckpoints(root)
  return {schema_version:2,generated_at:new Date().toISOString(),measurement_verification_at:verification.verified_at||null,sources:{github:{status:'available',basis:'existing observation ledger'},ai_history:{status:'coverage-unverified',basis:'Only delivered episodes and explicit source receipts are measurable; unknown accounts and unavailable sessions are not inferred.',accounts:measurements.sources,acknowledged_checkpoint_records:checkpoints.length,acknowledged_streams:new Set(checkpoints.flatMap(c=>(c.cursors||[]).map(s=>s.session_sha256))).size,last_processed_event_at:checkpoints.flatMap(c=>(c.cursors||[]).map(s=>s.at)).sort().at(-1)||null,last_acknowledged_checkpoint_at:null,checkpoint_limits:'Checkpoint cursors prove durable receipt of processed events, not run time, account enumeration, pagination or complete source coverage.'},hosted_exporter:{status:process.env.HARNESS_EVENT_EXPORT_URL?'configured-unverified':'optional-unconfigured'}},unknown_repository_observations:rows.filter(r=>!r.repo).length,repositories:profiles(root).map(p=>{
    const evidence=rows.filter(r=>r.repo===p.repository),episodes=evidence.filter(r=>r.schema_version===2),view=effectiveKnowledge(history,{repository:p.repository,families:p.families},policy)
    const deployed=deployments.find(r=>r.repository===p.repository)
    const measured=aggregateMeasurements(rows,{repository:p.repository,proofs}),synthetic=aggregateMeasurements(rows,{repository:p.repository,proofs,evidenceClass:'synthetic-evaluation'})
    return {repository:p.repository,delivered_episodes:new Set(episodes.filter(r=>!r.measurement).map(r=>r.episode_id)).size,last_delivered:episodes.map(r=>r.seen_at).sort().at(-1)||null,accepted:view.accepted.length,candidates:view.candidates.length,unknown_coverage:true,delivery:deployed?.status||'not-verified',brain_revision:deployed?.brain_revision||null,source_base:deployed?.base||null,bootstrap_before:deployed?.before??null,bootstrap_after:deployed?.after??null,observed_use:{loaded:measured.loaded,application_checks:measured.application_checks,reported:measured.reported,verified:measured.verified,unverified:measured.unverified},measurement_groups:measured.groups,synthetic_evaluation:{reported:synthetic.reported,verified:synthetic.verified,groups:synthetic.groups},effectiveness:measured.effectiveness}
  })}
}
export function measurementEnvelope(measurement,repository,{at=measurement.observed_at,policy=policyAt()}={}) {
 validateMeasurement(measurement,{repository,targets:policy.targets})
 const id=measurementSeal(measurement)
 return {schema_version:2,event_id:`repository-measurement:${id.slice(0,32)}`,episode_id:`episode:${id.slice(0,32)}`,occurred_at:at,surface:'github-actions',kind:'successful_pattern',summary:'A bounded repository measurement was reported with independently checkable source provenance.',evidence_ref:`artifact:${id.slice(0,32)}`,related_skill_or_rule:null,outcome:'unknown',severity:'low',confidence:'low',repository,source_revision:measurement.source_revision,knowledge_type:'fact',episode:{},measurement}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 const args=process.argv.slice(2),flag=f=>args[args.indexOf(f)+1]
 if(args.includes('--attest')) {
  const m=JSON.parse(readFileSync(flag('--attest'),'utf8')),policy=policyAt();validateMeasurement(m,{repository:m.repository,targets:policy.targets})
  const raw=readFileSync(flag('--evidence'),'utf8'),sha=createHash('sha256').update(raw).digest('hex'),evidence=JSON.parse(raw)
  if(!m.receipt||sha!==m.receipt.sha256||evidence.measurement_sha256!==measurementHash(m))throw new Error('measurement-attestation-payload-mismatch')
  if(process.env.GITHUB_SHA!==m.receipt.execution_revision||process.env.GITHUB_RUN_ID!==String(m.receipt.run_id)||process.env.GITHUB_REPOSITORY!==`${policy.owner}/${m.receipt.repository}`)throw new Error('measurement-attestation-requires-source-job')
  console.log(measurementMarker(m,sha))
 }else if(args.includes('--record')) {
  const measurement=JSON.parse(readFileSync(flag('--record'),'utf8')),repository=args.includes('--repo')?flag('--repo'):null,envelope=measurementEnvelope(measurement,repository)
  if(args.includes('--submit')){const result=dispatch([envelope]);if(result.failures.length)throw new Error('measurement-dispatch-failed');console.log(JSON.stringify({submitted:result.sent,measurement_id:measurement.id,observation_id:observationId(envelope),payload_sha256:envelopeSha(envelope),measurement_sha256:measurementSeal(measurement),acknowledgement:'Read the durable observation ledger; dispatch alone is not persistence.'}))}
  else console.log(JSON.stringify({event_type:'harness-observations',client_payload:{events:[envelope]}},null,2))
 }else {
  if(args.includes('--verify')){const gh=new Gh(process.env.FLEET_TOKEN||process.env.GH_TOKEN),proof=await verifyMeasurementRows(loadLedger(ROOT),{gh,policy:policyAt()});mkdirSync(join(ROOT,'state/repository-administration'),{recursive:true});writeFileSync(join(ROOT,'state/repository-administration/measurement-verification.json'),JSON.stringify(proof,null,2)+'\n')}
  const report=repositoryHealth();if(args.includes('--out'))writeFileSync(flag('--out'),JSON.stringify(report,null,2)+'\n');else console.log(JSON.stringify(report,null,2))
 }
}
