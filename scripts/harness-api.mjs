/** Paid inference boundary. Disabled until policy, prices and authority are approved.
 * Ledger events contain hashes and bounded amounts only. No prompts, API keys,
 * response text, provider error bodies or source identifiers are persisted.
 */
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'

const POLICY=fileURLToPath(new URL('../config/inference-policy.json',import.meta.url))
const PURPOSES=new Set(['review','proposals','docs','extraction','replay','context'])
const HEX=/^[a-f0-9]{64}$/
const SHA=/^[a-f0-9]{40}$/
const MICRO=1000000
const fail=code=>{const error=new Error(`harness_api_${code}`);error.code=`harness_api_${code}`;throw error}
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v
const hash=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(canonical(v))).digest('hex')
export const inferencePolicySeal=policy=>hash(policy)
const integer=(v,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(v)&&v>=min&&v<=max
const money=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&Number.isSafeInteger(v*MICRO)?v*MICRO:fail('invalid_money_policy')
const only=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>keys.includes(k))
const timestamp=v=>typeof v==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(v)&&Number.isFinite(Date.parse(v))
export const loadInferencePolicy=()=>JSON.parse(readFileSync(POLICY,'utf8'))
export function londonPeriod(now=new Date()) {
 const date=new Date(now);if(!Number.isFinite(date.getTime()))fail('invalid_clock')
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit'}).formatToParts(date)
 return `${parts.find(p=>p.type==='year').value}-${parts.find(p=>p.type==='month').value}`
}
function policyLimits(policy) {
 if(policy.schema_version!==1||policy.timezone!=='Europe/London'||!Array.isArray(policy.purposes)||policy.purposes.some(p=>!PURPOSES.has(p)))fail('invalid_policy')
 const limits=policy.limits
 if(!limits||!integer(limits.max_request_bytes,1,1000000)||!integer(limits.max_output_tokens,1,100000)||!integer(limits.max_attempts,1,3)||!integer(limits.timeout_ms,1,300000)||!integer(limits.cas_attempts,1,30))fail('invalid_limits')
 return limits
}
function activated(policy) {
 policyLimits(policy)
 if(policy.enabled!==true)fail('disabled')
 if(typeof policy.approval_ref!=='string'||!/^[a-zA-Z0-9:._-]{3,120}$/.test(policy.approval_ref))fail('approval_required')
 const limit=money(policy.monthly_limit_usd),reserve=money(policy.review_reserve_usd)
 if(!limit||reserve>limit)fail('invalid_budget_policy')
 return {limit,reserve}
}
const RATE_KEYS=['input','output','cache_read','cache_write_5m','cache_write_1h']
function pricing(policy,model,now) {
 const p=policy.models?.[model]
 if(!p||p.approved!==true||typeof p.approval_ref!=='string'||!p.approval_ref||!integer(p.context_window_tokens,1,2000000)||!integer(p.max_output_tokens,1,100000)||!only(p.usd_per_million_tokens,RATE_KEYS)||RATE_KEYS.some(k=>p.usd_per_million_tokens[k]===undefined))fail('approved_prices_required')
 if(!timestamp(p.valid_from)||!timestamp(p.valid_until)||Date.parse(now)<Date.parse(p.valid_from)||Date.parse(now)>=Date.parse(p.valid_until))fail('prices_expired_or_unavailable')
 const rates=Object.fromEntries(RATE_KEYS.map(k=>[k,money(p.usd_per_million_tokens[k])]))
 if(!rates.input||!rates.output)fail('invalid_prices')
 return {...p,rates}
}
function liability(input,output,rates) {
 const numerator=BigInt(input)*BigInt(Math.max(rates.input,rates.cache_read,rates.cache_write_5m,rates.cache_write_1h))+BigInt(output)*BigInt(rates.output)
 const amount=Number((numerator+BigInt(MICRO-1))/BigInt(MICRO))
 if(!integer(amount,1))fail('liability_overflow')
 return amount
}
/** Strict event history. A settlement never makes an unknown attempt free. */
export function validateBudgetEvents(events) {
 if(!Array.isArray(events))fail('invalid_ledger')
 const attempts=new Map()
 for(const e of events) {
  if(!e||e.schema_version!==1||!HEX.test(e.attempt_id||'')||!timestamp(e.at))fail('invalid_ledger')
  if(e.event==='reserved') {
   if(!only(e,['schema_version','event','attempt_id','at','period','request_sha256','input_sha256','purpose','model_sha256','policy_sha256','price_sha256','amount_microusd','attempt'])||attempts.has(e.attempt_id)||!HEX.test(e.request_sha256||'')||!HEX.test(e.input_sha256||'')||!HEX.test(e.model_sha256||'')||!HEX.test(e.policy_sha256||'')||!HEX.test(e.price_sha256||'')||!PURPOSES.has(e.purpose)||e.period!==londonPeriod(e.at)||!integer(e.amount_microusd,1)||!integer(e.attempt,1,3))fail('invalid_ledger')
   attempts.set(e.attempt_id,{reservation:e,state:'reserved',amount:e.amount_microusd})
  } else {
   const a=attempts.get(e.attempt_id)
   if(!a||a.state!=='reserved')fail('invalid_ledger')
   if(e.event==='settled') {
    if(!only(e,['schema_version','event','attempt_id','at','amount_microusd','usage','response_sha256'])||!integer(e.amount_microusd)||!HEX.test(e.response_sha256||'')||!only(e.usage,['input','output','cache_read','cache_write_5m','cache_write_1h'])||RATE_KEYS.some(k=>!integer(e.usage[k])))fail('invalid_ledger')
    a.state='settled';a.amount=e.amount_microusd
   }else if(e.event==='uncertain') {
    if(!only(e,['schema_version','event','attempt_id','at','reason'])||!['transport','provider-refusal','malformed-response','usage-unavailable','usage-over-bound'].includes(e.reason))fail('invalid_ledger')
    a.state='uncertain'
   }else fail('invalid_ledger')
  }
 }
 return attempts
}
export function budgetStatus({policy=loadInferencePolicy(),events=[],now=new Date()}={}) {
 const period=londonPeriod(now)
 if(policy.enabled!==true)return {status:'disabled',period}
 const {limit,reserve}=activated(policy),attempts=validateBudgetEvents(events)
 let total=0,routine=0
 for(const a of attempts.values())if(a.reservation.period===period||a.state!=='settled'){
  total+=a.amount;if(a.reservation.purpose!=='review')routine+=a.amount
 }
 if(!integer(total)||!integer(routine))fail('liability_overflow')
 return {status:total>=limit?'budget-paused':'available',period,limit_microusd:limit,liability_microusd:total,routine_liability_microusd:routine,review_reserve_microusd:reserve,available_microusd:Math.max(0,limit-total),routine_available_microusd:Math.max(0,Math.min(limit-total,limit-reserve-routine))}
}

/** One trusted GitHub ref. Create that ref separately under approved setup authority.
 * A new commit has exactly the previously read parent. A racing sibling cannot
 * fast-forward the ref, even when both writers saw the same starting balance.
 */
export function makeGithubLedger({repository='krishanraja/ai-harness',ref='harness/inference-budget',path='state/inference-budget.jsonl',token=process.env.HARNESS_BUDGET_TOKEN||process.env.GITHUB_TOKEN,fetchImpl=fetch}={}) {
 if(!token)fail('ledger_auth_required')
 if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)||!/^harness\/[a-z0-9-]+$/.test(ref)||path!=='state/inference-budget.jsonl')fail('invalid_ledger_target')
 const req=async(method,route,body,missing=false)=>{
  let res;try{res=await fetchImpl(`https://api.github.com/repos/${repository}/${route}`,{method,headers:{authorization:`Bearer ${token}`,accept:'application/vnd.github+json','x-github-api-version':'2022-11-28',...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)})}catch{fail('ledger_unavailable')}
  if(missing&&res.status===404)return null
  if(!res.ok){if([409,422].includes(res.status))return {conflict:true};fail('ledger_unavailable')}
  try{return await res.json()}catch{fail('invalid_ledger_readback')}
 }
 const head=async()=>{const r=await req('GET',`git/ref/heads/${ref}`,undefined,true);if(!r)fail('ledger_uninitialized');if(!SHA.test(r.object?.sha||''))fail('invalid_ledger_readback');return r.object.sha}
 const activePolicy=async revision=>{
  const file=await req('GET',`contents/state/inference-policy.json?ref=${revision}`,undefined,true)
  if(!file||file.encoding!=='base64'||typeof file.content!=='string')fail('active_policy_unavailable')
  let policy;try{policy=JSON.parse(Buffer.from(file.content,'base64').toString('utf8'))}catch{fail('active_policy_unavailable')}
  // This file is initialized/rotated only by a separately approved setup. A
  // worker cannot substitute its own higher cap or append a policy approval.
  activated(policy)
  return inferencePolicySeal(policy)
 }
 return {
  async read(){
   const revision=await head(),policy_sha256=await activePolicy(revision),file=await req('GET',`contents/${path}?ref=${revision}`,undefined,true)
   if(!file)fail('ledger_uninitialized')
   let events=[]
   if(file.encoding!=='base64'||typeof file.content!=='string')fail('invalid_ledger_readback')
   try{events=Buffer.from(file.content,'base64').toString('utf8').split('\n').filter(Boolean).map(JSON.parse)}catch{fail('invalid_ledger_readback')}
   validateBudgetEvents(events);return {revision,events,policy_sha256}
  },
  async compareAndSwap(revision,events,policy_sha256){
   if(!SHA.test(revision||''))fail('invalid_ledger_revision')
   if(!HEX.test(policy_sha256||''))fail('active_policy_required')
   validateBudgetEvents(events)
   if(await head()!==revision)return false
   if(await activePolicy(revision)!==policy_sha256)fail('policy_mismatch')
   const oldFile=await req('GET',`contents/${path}?ref=${revision}`,undefined,true)
   if(!oldFile)fail('ledger_uninitialized')
   let oldText='',prior=[]
   if(oldFile){if(oldFile.encoding!=='base64'||typeof oldFile.content!=='string')fail('invalid_ledger_readback');oldText=Buffer.from(oldFile.content,'base64').toString('utf8');try{prior=oldText.split('\n').filter(Boolean).map(JSON.parse)}catch{fail('invalid_ledger_readback')}}
   validateBudgetEvents(prior)
   if(events.length!==prior.length+1||prior.some((e,i)=>JSON.stringify(e)!==JSON.stringify(events[i]))||oldText&&!oldText.endsWith('\n'))fail('ledger_history_rewrite')
   const commit=await req('GET',`git/commits/${revision}`)
   if(!SHA.test(commit.tree?.sha||''))fail('invalid_ledger_readback')
   const blob=await req('POST','git/blobs',{content:oldText+JSON.stringify(events.at(-1))+'\n',encoding:'utf-8'})
   const tree=await req('POST','git/trees',{base_tree:commit.tree.sha,tree:[{path,mode:'100644',type:'blob',sha:blob.sha}]})
   const next=await req('POST','git/commits',{message:'chore(budget): record bounded inference liability',tree:tree.sha,parents:[revision]})
   if(!SHA.test(next.sha||''))fail('invalid_ledger_readback')
   const changed=await req('PATCH',`git/refs/heads/${ref}`,{sha:next.sha,force:false})
   return !changed.conflict&&changed.object?.sha===next.sha
  }
 }
}
async function appendEvent(ledger,build,casAttempts,policySeal){
 for(let i=0;i<casAttempts;i++){
  let state;try{state=await ledger.read()}catch{fail('ledger_unavailable')}
  if(state.policy_sha256!==policySeal)fail('policy_mismatch')
  validateBudgetEvents(state.events)
  const event=build(state.events)
  if(event===null)return
  const next=[...state.events,event]
  validateBudgetEvents(next)
  let saved;try{saved=await ledger.compareAndSwap(state.revision,next,policySeal)}catch(error){if(error?.code==='harness_api_policy_mismatch')throw error;fail('ledger_unavailable')}
  if(saved)return
 }
 fail('ledger_contention')
}
function usageCost(body,price,maxTokens){
 const u=body.usage
 if(!only(u,['input_tokens','output_tokens','cache_creation_input_tokens','cache_read_input_tokens','cache_creation','server_tool_use','service_tier','inference_geo'])||!integer(u.input_tokens)||!integer(u.output_tokens)||u.server_tool_use!=null&&Object.values(u.server_tool_use).some(v=>v!==0)||u.service_tier!=null&&u.service_tier!=='standard'||u.inference_geo!=null&&u.inference_geo!=='global')return null
 const creation=u.cache_creation_input_tokens??0,read=u.cache_read_input_tokens??0
 if(!integer(creation)||!integer(read))return null
 if(creation>0&&u.cache_creation==null)return null
 let five=creation,one=0
 if(u.cache_creation!=null){if(!only(u.cache_creation,['ephemeral_5m_input_tokens','ephemeral_1h_input_tokens']))return null;five=u.cache_creation.ephemeral_5m_input_tokens??0;one=u.cache_creation.ephemeral_1h_input_tokens??0;if(!integer(five)||!integer(one)||five+one!==creation)return null}
 const usage={input:u.input_tokens,output:u.output_tokens,cache_read:read,cache_write_5m:five,cache_write_1h:one}
 if(usage.input+read+five+one>price.context_window_tokens||usage.output>maxTokens)return {over:true}
 const numerator=RATE_KEYS.reduce((n,k)=>n+BigInt(usage[k])*BigInt(price.rates[k]),0n)
 const amount=Number((numerator+BigInt(MICRO-1))/BigInt(MICRO))
 if(!integer(amount))return null
 return {usage,amount}
}
/** Every paid turn is one separately reserved request. maxAttempts may retry a
 * refused/uncertain attempt within this invocation, retaining its FULL liability.
 * Reusing requestId after a restart refuses replay; it never guesses a refund.
 */
export async function requestMessages({purpose,system,messages,max_tokens,model,requestId,apiKey=process.env.ANTHROPIC_API_KEY,fetchImpl=fetch,ledger,policy=loadInferencePolicy(),now=()=>new Date(),maxAttempts=1,timeoutMs,tools,tool_choice}={}) {
 const clock=()=>new Date(typeof now==='function'?now():now).toISOString()
 activated(policy)
 const limits=policyLimits(policy)
 if(!PURPOSES.has(purpose)||!policy.purposes.includes(purpose))fail('purpose_not_approved')
 if(typeof requestId!=='string'||requestId.length<3||requestId.length>500)fail('request_identity_required')
 if(typeof apiKey!=='string'||!apiKey)fail('api_key_required')
 model=model||policy.default_model
 if(typeof model!=='string'||!model)fail('model_not_configured')
 if(!integer(max_tokens,1,limits.max_output_tokens)||!integer(maxAttempts,1,limits.max_attempts))fail('request_over_limits')
 const timeout=timeoutMs??limits.timeout_ms
 if(!integer(timeout,1,limits.timeout_ms))fail('request_over_limits')
 if(typeof system!=='string'&&!Array.isArray(system)||!Array.isArray(messages)||!messages.length)fail('invalid_request')
 if(tools!==undefined&&(!Array.isArray(tools)||tools.length>16||tools.some(t=>!only(t,['name','description','input_schema','cache_control'])||typeof t.name!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(t.name)||!t.input_schema||t.type!==undefined)))fail('unsupported_tools')
 if(tool_choice!==undefined&&(!only(tool_choice,['type','name','disable_parallel_tool_use'])||!['auto','any','tool','none'].includes(tool_choice.type)||tool_choice.type==='tool'&&!tools?.some(t=>t.name===tool_choice.name)))fail('invalid_tool_choice')
 const payload={model,max_tokens,system,messages,service_tier:'standard_only',...(tools?{tools}:{}),...(tool_choice?{tool_choice}:{})}
 let body;try{body=JSON.stringify(payload)}catch{fail('invalid_request')}
 if(Buffer.byteLength(body,'utf8')>limits.max_request_bytes)fail('request_over_limits')
 // Price the whole approved model input window, not an unverified tokenizer
 // estimate. This intentionally over-reserves small requests, including tools,
 // cache writes and hidden protocol overhead. Unknown price classes refuse.
 const price=pricing(policy,model,clock())
 if(max_tokens>price.max_output_tokens)fail('request_over_limits')
 const amount=liability(price.context_window_tokens,max_tokens,price.rates)
 const requestHash=hash(requestId),inputHash=hash(body)
 const policySeal=inferencePolicySeal(policy)
 const store=ledger||makeGithubLedger({...policy.ledger})
 const ownAttempts=new Set()
 for(let attempt=1;attempt<=maxAttempts;attempt++){
  const at=clock(),attemptId=hash(`${requestHash}:${attempt}`)
  // A previous attempt may have outlived a price window. Do not reserve a new
  // paid attempt using an expired or changed approved schedule.
  if(hash(pricing(policy,model,at))!==hash(price))fail('prices_changed')
  await appendEvent(store,events=>{
   const prior=events.filter(e=>e.event==='reserved'&&e.request_sha256===requestHash)
   if(prior.some(e=>e.input_sha256!==inputHash))fail('request_identity_conflict')
   if(prior.some(e=>!ownAttempts.has(e.attempt_id)))fail('request_already_reserved')
   const status=budgetStatus({policy,events,now:at})
   if(amount>status.available_microusd||purpose!=='review'&&amount>status.routine_available_microusd)fail('budget_exhausted')
   return {schema_version:1,event:'reserved',attempt_id:attemptId,at,period:londonPeriod(at),request_sha256:requestHash,input_sha256:inputHash,purpose,model_sha256:hash(model),policy_sha256:hash(policy),price_sha256:hash(price),amount_microusd:amount,attempt}
  },limits.cas_attempts,policySeal)
  ownAttempts.add(attemptId)
  let authoritative
  try{authoritative=await store.read()}catch{fail('ledger_unavailable')}
  if(authoritative.policy_sha256!==policySeal)fail('policy_mismatch')
  const activeAttempt=validateBudgetEvents(authoritative.events).get(attemptId)
  if(!activeAttempt||activeAttempt.state!=='reserved'||activeAttempt.reservation.input_sha256!==inputHash)fail('attempt_state_conflict')
  // CAS contention can itself cross expiry. This check is immediately before
  // transport; a failure leaves the durable reservation as full liability.
  if(hash(pricing(policy,model,clock()))!==hash(price))fail('prices_changed')
  let response,json,reason=null
  try{response=await fetchImpl('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},body,signal:AbortSignal.timeout(timeout)})}catch{reason='transport'}
  if(!reason&&!response.ok)reason='provider-refusal'
  if(!reason){try{json=await response.json();if(!json||json.type!=='message'||!Array.isArray(json.content)||typeof json.id!=='string')reason='malformed-response'}catch{reason='malformed-response'}}
  const cost=reason?null:usageCost(json,price,max_tokens)
  if(!reason&&!cost)reason='usage-unavailable'
  if(cost?.over)reason='usage-over-bound'
  const settledAt=clock()
  await appendEvent(store,events=>{
   const found=events.filter(e=>e.attempt_id===attemptId)
   if(found.length!==1||found[0].event!=='reserved')fail('attempt_state_conflict')
   return reason?{schema_version:1,event:'uncertain',attempt_id:attemptId,at:settledAt,reason}:{schema_version:1,event:'settled',attempt_id:attemptId,at:settledAt,amount_microusd:cost.amount,usage:cost.usage,response_sha256:hash(json.id)}
  },limits.cas_attempts,policySeal)
  if(!reason)return json
  // Unknown usage, invalid payloads and out-of-bound usage cannot be repaired
  // by another charge. Transport/refusal retries reserve a distinct liability.
  if(!['transport','provider-refusal'].includes(reason)||attempt===maxAttempts)fail(reason.replaceAll('-','_'))
 }
 fail('attempts_exhausted')
}
