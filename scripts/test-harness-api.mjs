#!/usr/bin/env node
/** No provider calls or real credentials. Exercise liability before transport. */
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {requestMessages,budgetStatus,londonPeriod,makeGithubLedger,validateBudgetEvents,inferencePolicySeal} from './harness-api.mjs'

const NOW='2026-10-18T12:00:00.000Z'
const policy=()=>({schema_version:1,enabled:true,approval_ref:'fixture:approved',timezone:'Europe/London',monthly_limit_usd:1,review_reserve_usd:0.2,purposes:['review','proposals','docs','extraction','replay','context'],default_model:'fixture-model',models:{'fixture-model':{approved:true,approval_ref:'fixture:prices',valid_from:'2026-01-01T00:00:00.000Z',valid_until:'2027-01-01T00:00:00.000Z',context_window_tokens:1000,max_output_tokens:100,usd_per_million_tokens:{input:1,output:2,cache_read:0.1,cache_write_5m:1.25,cache_write_1h:2}}},limits:{max_request_bytes:10000,max_output_tokens:100,max_attempts:2,timeout_ms:1000,cas_attempts:8}})
function memoryLedger(initial=[],activePolicy=policy()){
 let revision=0,events=structuredClone(initial)
 return {async read(){return {revision,events:structuredClone(events),policy_sha256:inferencePolicySeal(activePolicy)}},async compareAndSwap(expected,next,policySeal){if(policySeal!==inferencePolicySeal(activePolicy))throw Object.assign(new Error('harness_api_policy_mismatch'),{code:'harness_api_policy_mismatch'});if(expected!==revision)return false;assert.deepEqual(next.slice(0,events.length),events);assert.equal(next.length,events.length+1);events=structuredClone(next);revision++;return true},events:()=>structuredClone(events)}
}
const answer=(usage={input_tokens:10,output_tokens:5})=>({id:'private-provider-id',type:'message',content:[{type:'text',text:'Private model output.'}],usage})
const response=(body=answer(),status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}})
const base=()=>({purpose:'docs',system:'Private source pack.',messages:[{role:'user',content:'Private request.'}],max_tokens:100,requestId:'private-source-request',model:'fixture-model',apiKey:'fixture-only-key',now:()=>NOW,policy:policy()})
let calls=0
const ok=async()=>{calls++;return response()}
const ledger=memoryLedger()
const first=await requestMessages({...base(),ledger,fetchImpl:ok})
assert.equal(first.content[0].text,'Private model output.')
assert.equal(calls,1)
assert.equal(ledger.events()[0].amount_microusd,2200,'Reserve whole input window at highest cache/input rate and output cap before sending')
assert.equal(ledger.events()[1].amount_microusd,20)
assert.ok(!JSON.stringify(ledger.events()).match(/Private|fixture-only-key|private-source-request|private-provider-id/),'Ledger never stores prompts, responses, source identity or credentials')
assert.equal(budgetStatus({policy:policy(),events:ledger.events(),now:NOW}).liability_microusd,20)
await assert.rejects(()=>requestMessages({...base(),ledger,fetchImpl:ok}),/request_already_reserved/)
await assert.rejects(()=>requestMessages({...base(),messages:[{role:'user',content:'Changed input.'}],ledger,fetchImpl:ok}),/request_identity_conflict/)
assert.equal(calls,1,'A replay never performs another paid request')
const disabled=JSON.parse(readFileSync(new URL('../config/inference-policy.json',import.meta.url),'utf8'))
assert.equal(disabled.enabled,false);assert.deepEqual(disabled.models,{});assert.equal(disabled.monthly_limit_usd,null)
await assert.rejects(()=>requestMessages({...base(),policy:disabled,ledger:memoryLedger(),fetchImpl:ok}),/disabled/)
for(const change of [p=>{p.approval_ref=null},p=>{p.models={}},p=>{p.models['fixture-model'].approved=false},p=>{p.models['fixture-model'].valid_until=NOW},p=>{delete p.models['fixture-model'].usd_per_million_tokens.cache_write_1h}]){
 const p=policy();change(p);await assert.rejects(()=>requestMessages({...base(),policy:p,ledger:memoryLedger(),fetchImpl:ok}),/approval_required|approved_prices_required|prices_expired/)
}
await assert.rejects(()=>requestMessages({...base(),purpose:'unapproved',ledger:memoryLedger(),fetchImpl:ok}),/purpose_not_approved/)
await assert.rejects(()=>requestMessages({...base(),apiKey:'',ledger:memoryLedger(),fetchImpl:ok}),/api_key_required/)
await assert.rejects(()=>requestMessages({...base(),timeoutMs:1001,ledger:memoryLedger(),fetchImpl:ok}),/over_limits/)
await assert.rejects(()=>requestMessages({...base(),tools:[{type:'web_search_20250305',name:'web_search'}],ledger:memoryLedger(),fetchImpl:ok}),/unsupported_tools/)
await assert.rejects(()=>requestMessages({...base(),system:'a'.repeat(10000),ledger:memoryLedger(),fetchImpl:ok}),/over_limits/)
assert.equal(calls,1,'Invalid authority/prices/input never reaches provider')

const toolLedger=memoryLedger();let sent
await requestMessages({...base(),ledger:toolLedger,tools:[{name:'submit_result',description:'Return structured output.',input_schema:{type:'object'}}],tool_choice:{type:'tool',name:'submit_result'},fetchImpl:async(url,options)=>{sent=JSON.parse(options.body);return response()}})
assert.equal(sent.tools[0].name,'submit_result');assert.equal(sent.service_tier,'standard_only')
assert.notEqual(toolLedger.events()[0].input_sha256,ledger.events()[0].input_sha256,'Tool schemas and choice are bound into input identity')

const tight=policy();tight.monthly_limit_usd=0.003;tight.review_reserve_usd=0
const racing=memoryLedger([],tight);let release,started
const hold=new Promise(r=>{release=r}),ready=new Promise(r=>{started=r})
const running=requestMessages({...base(),requestId:'race-one',policy:tight,ledger:racing,fetchImpl:async()=>{started();await hold;return response()}})
await ready
await assert.rejects(()=>requestMessages({...base(),requestId:'race-two',policy:tight,ledger:racing,fetchImpl:ok}),/budget_exhausted/)
release();await running
assert.equal(racing.events().filter(e=>e.event==='reserved').length,1,'Concurrent in-flight liability consumes headroom')
const conflictLedger=memoryLedger();let misses=0
const contended={read:()=>conflictLedger.read(),compareAndSwap:async(...args)=>++misses<=2?false:conflictLedger.compareAndSwap(...args)}
await requestMessages({...base(),ledger:contended,fetchImpl:ok})
assert.ok(misses>=4,'Reservation and settlement retry CAS conflicts without additional provider calls')

const uncertain=memoryLedger()
await assert.rejects(()=>requestMessages({...base(),ledger:uncertain,fetchImpl:async()=>{throw new Error('Private provider body or secret must not escape')}}),/^Error: harness_api_transport$/)
assert.equal(uncertain.events()[1].event,'uncertain')
assert.equal(budgetStatus({policy:policy(),events:uncertain.events(),now:NOW}).liability_microusd,2200)
await assert.rejects(()=>requestMessages({...base(),ledger:uncertain,fetchImpl:ok}),/request_already_reserved/)
for(const body of [answer(undefined),answer({input_tokens:10,output_tokens:5,new_charge:1}),answer({input_tokens:10,output_tokens:5,cache_creation_input_tokens:3}),answer({input_tokens:10,output_tokens:101}),{error:{message:'private-error'}}]){
 if(body.usage!==undefined&&Object.keys(body.usage).length===2)delete body.usage
 const missing=memoryLedger();await assert.rejects(()=>requestMessages({...base(),ledger:missing,fetchImpl:async()=>response(body)}),/usage_unavailable|usage_over_bound|malformed_response/)
 assert.equal(budgetStatus({policy:policy(),events:missing.events(),now:NOW}).liability_microusd,2200,'Unknown usage or charges cannot refund maximum liability')
}
const cached=memoryLedger()
await requestMessages({...base(),ledger:cached,fetchImpl:async()=>response(answer({input_tokens:10,output_tokens:5,cache_creation_input_tokens:10,cache_read_input_tokens:5,cache_creation:{ephemeral_5m_input_tokens:3,ephemeral_1h_input_tokens:7},service_tier:'standard',inference_geo:'global'}))})
assert.equal(cached.events()[1].amount_microusd,39,'Both TTL cache charges and reads settle with conservative microdollar rounding')
const retry=memoryLedger();let attempt=0
await requestMessages({...base(),ledger:retry,maxAttempts:2,fetchImpl:async()=>++attempt===1?response({error:{message:'private'}},503):response()})
assert.equal(attempt,2);assert.notEqual(retry.events()[0].attempt_id,retry.events()[2].attempt_id)
assert.equal(budgetStatus({policy:policy(),events:retry.events(),now:NOW}).liability_microusd,2220,'A retry retains the first uncertain maximum and adds its own settled cost')
const expiring=policy();expiring.models['fixture-model'].valid_until='2026-10-18T12:00:01.000Z'
let current=NOW,expiryCalls=0
const expiryLedger=memoryLedger([],expiring)
await assert.rejects(()=>requestMessages({...base(),policy:expiring,ledger:expiryLedger,maxAttempts:2,now:()=>current,fetchImpl:async()=>{expiryCalls++;current='2026-10-18T12:00:02.000Z';return response({},503)}}),/prices_expired_or_unavailable/)
assert.equal(expiryCalls,1,'A refusal cannot retry after its approved pricing window expires')
assert.equal(expiryLedger.events().filter(e=>e.event==='reserved').length,1)
current=NOW;expiryCalls=0
const crossed=memoryLedger([],expiring)
await assert.rejects(()=>requestMessages({...base(),policy:expiring,now:()=>current,ledger:{read:()=>crossed.read(),compareAndSwap:async(...args)=>{const saved=await crossed.compareAndSwap(...args);current='2026-10-18T12:00:02.000Z';return saved}},fetchImpl:async()=>{expiryCalls++;return response()}}),/prices_expired_or_unavailable/)
assert.equal(expiryCalls,0,'CAS delays cannot send a request after approved prices expire')
assert.equal(crossed.events()[0].event,'reserved','Unsent but unresolved liability is retained conservatively')

assert.equal(londonPeriod('2026-03-31T23:30:00.000Z'),'2026-04','London month uses local DST, not UTC month')
const march=memoryLedger()
await assert.rejects(()=>requestMessages({...base(),ledger:march,now:()=> '2026-03-31T22:30:00.000Z',fetchImpl:async()=>{throw new Error('timeout')}}),/transport/)
assert.equal(budgetStatus({policy:policy(),events:march.events(),now:'2026-04-01T12:00:00.000Z'}).liability_microusd,2200,'Unresolved prior-month liability carries into the next month')
assert.equal(budgetStatus({policy:policy(),events:ledger.events(),now:'2026-11-01T12:00:00.000Z'}).liability_microusd,0,'Settled prior-month charges do not become new-month spending')
const reviewOnly=policy();reviewOnly.monthly_limit_usd=0.003;reviewOnly.review_reserve_usd=0.002
await assert.rejects(()=>requestMessages({...base(),policy:reviewOnly,ledger:memoryLedger([],reviewOnly),fetchImpl:ok}),/budget_exhausted/)
await requestMessages({...base(),purpose:'review',policy:reviewOnly,ledger:memoryLedger([],reviewOnly),fetchImpl:ok})
const unavailable=memoryLedger();await assert.rejects(()=>requestMessages({...base(),ledger:{read:async()=>{throw new Error('secret')},compareAndSwap:unavailable.compareAndSwap},fetchImpl:ok}),/^Error: harness_api_ledger_unavailable$/)
const brokenSettlement=memoryLedger();let writes=0
await assert.rejects(()=>requestMessages({...base(),ledger:{read:()=>brokenSettlement.read(),compareAndSwap:async(...args)=>++writes===1?brokenSettlement.compareAndSwap(...args):Promise.reject(new Error('private'))},fetchImpl:ok}),/ledger_unavailable/)
assert.equal(brokenSettlement.events().length,1,'Cancellation or unavailable settlement keeps durable reservation liability')
assert.throws(()=>validateBudgetEvents([{...ledger.events()[0],prompt:'private'}]),/invalid_ledger/)

// Drive the real GitHub adapter's non-force CAS and refusal paths with a fake API.
const head='a'.repeat(40),next='b'.repeat(40),tree='c'.repeat(40),requests=[]
let remote=head,blobText
const github=makeGithubLedger({token:'fixture-budget-token',fetchImpl:async(url,options)=>{
 const route=url.split('/ai-harness/')[1],body=options.body?JSON.parse(options.body):null;requests.push({route,method:options.method,body})
 if(route==='git/ref/heads/harness/inference-budget')return response({object:{sha:remote}})
 if(route.startsWith('contents/state/inference-policy.json'))return response({encoding:'base64',content:Buffer.from(JSON.stringify(policy())).toString('base64')})
 if(route.startsWith('contents/'))return response({encoding:'base64',content:''})
 if(route===`git/commits/${head}`)return response({tree:{sha:tree}})
 if(route==='git/blobs'){blobText=body.content;return response({sha:tree})}
 if(route==='git/trees')return response({sha:tree})
 if(route==='git/commits')return response({sha:next})
 if(route.startsWith('git/refs/')){assert.equal(body.force,false);remote=body.sha;return response({object:{sha:remote}})}
 throw new Error('Unexpected API route')
}})
assert.deepEqual(await github.read(),{revision:head,events:[],policy_sha256:inferencePolicySeal(policy())})
await assert.rejects(()=>github.compareAndSwap(head,[ledger.events()[0]],'f'.repeat(64)),/policy_mismatch/)
assert.equal(await github.compareAndSwap(head,[ledger.events()[0]],inferencePolicySeal(policy())),true)
assert.equal(JSON.parse(blobText).event,'reserved')
assert.equal(await github.compareAndSwap(head,[ledger.events()[0]],inferencePolicySeal(policy())),false,'A moved remote ref is never reset')
assert.equal(requests.filter(r=>r.route==='git/commits'&&r.method==='POST')[0].body.parents[0],head)
assert.throws(()=>makeGithubLedger({token:''}),/ledger_auth_required/)
const missingFile=makeGithubLedger({token:'fixture',fetchImpl:async url=>url.includes('/contents/state/inference-policy.json')?response({encoding:'base64',content:Buffer.from(JSON.stringify(policy())).toString('base64')}):url.includes('/contents/')?new Response('',{status:404}):response({object:{sha:head}})})
await assert.rejects(()=>missingFile.read(),/ledger_uninitialized/,'Missing state file is unavailable accounting, never a zero balance')
await assert.rejects(()=>missingFile.compareAndSwap(head,[ledger.events()[0]],inferencePolicySeal(policy())),/ledger_uninitialized/,'CAS cannot recreate lost accounting from a missing file')
let staleCalls=0
const larger=policy();larger.monthly_limit_usd=500
await assert.rejects(()=>requestMessages({...base(),policy:larger,ledger:memoryLedger(),fetchImpl:async()=>{staleCalls++;return response()}}),/policy_mismatch/,'A stale worker cannot apply a larger local cap to the authoritative state')
assert.equal(staleCalls,0)
const changing=memoryLedger();let reads=0
await assert.rejects(()=>requestMessages({...base(),ledger:{read:async()=>{const state=await changing.read();if(++reads===2)state.policy_sha256='f'.repeat(64);return state},compareAndSwap:(...args)=>changing.compareAndSwap(...args)},fetchImpl:async()=>{staleCalls++;return response()}}),/policy_mismatch/,'A policy change after reservation refuses before paid transport')
assert.equal(staleCalls,0)
assert.equal(changing.events()[0].event,'reserved')
console.log('HARNESS API OK: disabled defaults, approved price gates, full-window liability, CAS races, review reserve, exact retry identity, uncertainty, rollover, privacy and non-force GitHub persistence')
