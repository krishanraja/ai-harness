#!/usr/bin/env python3
import json,pathlib,sys
root=pathlib.Path(__file__).resolve().parents[1]
cat=json.loads((root/'references/outcome-catalog.json').read_text(encoding='utf-8'))
src=json.loads((root/'references/source-ledger.json').read_text(encoding='utf-8'))
errors=[]
records=cat.get('records',[]); sources=src.get('records',[])
stacks={x['stack'] for x in records}; expected={x['stack'] for x in cat.get('stack_outcomes',[])}
if len(records)!=60:errors.append(f'expected 60 outcome records, found {len(records)}')
if len(stacks)!=12 or stacks!=expected:errors.append('stack coverage mismatch')
if len(sources)!=73:errors.append(f'expected 73 source pages, found {len(sources)}')
ids=[x['id'] for x in records]
if len(ids)!=len(set(ids)):errors.append('duplicate outcome ids')
source_ids={x['id'] for x in sources}
for r in records:
 for key in ['problem','target_outcome','hypothesis','primary_metrics','guardrails','source_url','source_id','evidence_level']:
  if not r.get(key):errors.append(f"{r.get('id')}: missing {key}")
 if r.get('source_id') not in source_ids:errors.append(f"{r.get('id')}: unresolved source")
 if r.get('evidence_level')!='public-practitioner-hypothesis':errors.append(f"{r.get('id')}: evidence inflated")
for s in sources:
 if not s['url'].startswith('https://www.consumerapp.studio/stacks/'):errors.append(f"{s['id']}: out-of-scope source")
if errors:
 print('\n'.join(errors),file=sys.stderr);sys.exit(1)
print(f'CONSUMER APP OUTCOME VALIDATION PASSED: {len(records)} records, {len(stacks)} stacks, {len(sources)} source pages')
