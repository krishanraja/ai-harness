#!/usr/bin/env python3
import argparse,json,pathlib,re
p=argparse.ArgumentParser()
p.add_argument('--stack',choices=['onboarding','activation','retention','monetisation','engagement','habit-formation','growth-viral','conversion-optimisation','trust-building','experience-refinement','intent-shaping','premium-positioning'])
p.add_argument('--query',default='')
p.add_argument('--limit',type=int,default=5)
a=p.parse_args()
path=pathlib.Path(__file__).resolve().parents[1]/'references'/'outcome-catalog.json'
rows=json.loads(path.read_text(encoding='utf-8'))['records']
terms=set(re.findall(r'[a-z0-9]+',a.query.lower()))
scored=[]
for r in rows:
 if a.stack and r['stack']!=a.stack:continue
 text=' '.join(str(r[k]) for k in ['problem','source_signal','target_outcome','hypothesis']).lower()
 score=sum(1 for t in terms if t in text)
 if not terms or score:scored.append((score,r))
scored.sort(key=lambda x:(-x[0],x[1]['id']))
print(json.dumps([r for _,r in scored[:max(1,a.limit)]],indent=2,ensure_ascii=False))
