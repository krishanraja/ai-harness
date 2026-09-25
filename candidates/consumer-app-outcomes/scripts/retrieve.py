#!/usr/bin/env python3
"""Retrieve candidate outcome records for a diagnosed leak.

Ranks by term match, then by computed evidence status, so a record that has
been tested in a real product outranks an untested one with the same match.
Contrary and harmful results always print next to the record they concern.

  python scripts/retrieve.py --stack retention --query "users stop coming back"
  python scripts/retrieve.py --query "paywall" --brief
"""
import argparse
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import catalog as C  # noqa: E402

STOPWORDS = {'a', 'an', 'and', 'the', 'to', 'of', 'in', 'on', 'for', 'at', 'is', 'are', 'it', 'its', 'we', 'our',
             'they', 'them', 'their', 'users', 'user', 'app', 'after', 'before', 'with', 'but', 'not', 'dont',
             'do', 'does', 'why', 'how', 'what', 'when', 'then', 'that', 'this', 'from', 'into', 'out', 'too',
             'one', 'people', 'nobody', 'forever', 'hit', 'get', 'keep', 'just', 'very', 'really'}
# Everyday phrasings of a leak mapped onto the catalog's own vocabulary.
SYNONYMS = {
    'churn': ['return', 'retention'], 'leave': ['return', 'retention'], 'stop': ['return'],
    'coming': ['return'], 'back': ['return'], 'lapse': ['return'], 'forget': ['return'],
    'week': ['day', 'retention'], 'day': ['retention'],
    'paywall': ['pay', 'paid', 'price'], 'upgrade': ['paid', 'premium'], 'subscription': ['renewal', 'paid'],
    'signup': ['account', 'signup'], 'register': ['account', 'signup'], 'login': ['account'],
    'invite': ['share', 'referral'], 'referral': ['share', 'invite'], 'viral': ['share'],
    'slow': ['wait', 'loading'], 'payment': ['pay', 'sensitive'], 'freeze': ['wait', 'tap'], 'loading': ['wait'], 'spinner': ['wait', 'loading'],
    'notification': ['push', 'notification'], 'push': ['notification'],
    'abandon': ['abandonment', 'quit'], 'refuse': ['wont', 'denied'], 'privacy': ['data', 'permission'],
    'generic': ['template'], 'bland': ['template'], 'confusing': ['confusing', 'unclear'], 'drop': ['abandonment', 'quit'],
}


def stem(word):
    for suffix in ('ations', 'ation', 'ings', 'ing', 'ies', 'ied', 'ers', 'er', 'ed', 'es', 'ly', 's'):
        if word.endswith(suffix) and len(word) - len(suffix) >= 3:
            return word[: -len(suffix)]
    return word


def terms(text):
    return [w for w in re.findall(r'[a-z0-9]+', text.lower().replace("'", '')) if w not in STOPWORDS]


def query_terms(query):
    words = terms(query)
    expanded = set(words)
    for w in words:
        expanded.update(SYNONYMS.get(w, []))
        expanded.update(SYNONYMS.get(stem(w), []))
    return {stem(w) for w in expanded}


def stems(text):
    return {stem(w) for w in terms(text)}


def matches(term, have):
    return term in have or any(h.startswith(term) or term.startswith(h) for h in have if min(len(h), len(term)) >= 4)


def score(query, record):
    # The problem name and id describe the leak itself, so they count double;
    # the signal, hypothesis and measures only corroborate it.
    headline = stems(record['id'].replace('-', ' ') + ' ' + record['problem'])
    body = stems(' '.join([record['source_signal'], record['hypothesis'],
                           ' '.join(record['primary_metrics']), ' '.join(record['guardrails'])]))
    return sum(2 if matches(t, headline) else 1 if matches(t, body) else 0 for t in query_terms(query))


def retrieve(stack=None, query='', limit=5, include_retired=False):
    cat = C.load_catalog()
    rows, errors = C.load_evidence()
    if errors:
        raise SystemExit('evidence log is unreadable; run scripts/validate.py\n' + '\n'.join(errors))
    grouped = C.evidence_by_record(rows)
    ranked = []
    for record in cat['records']:
        if stack and record['stack'] != stack:
            continue
        annotated = C.annotate(record, grouped.get(record['id'], []))
        if annotated['status'] == 'retired' and not include_retired:
            continue
        s = score(query, record) if query.strip() else 0
        if query.strip() and s == 0:
            continue
        ranked.append((-s, C.STATUS_ORDER.index(annotated['status']), annotated['strongest_supporting_level'], record['id'], annotated))
    ranked.sort(key=lambda item: item[:4])
    return [item[4] for item in ranked[: max(1, limit)]]


def brief(records):
    lines = []
    for r in records:
        tag = r['status'] if r['status'] == 'candidate' else f"{r['status']}, strongest support level {r['strongest_supporting_level']}"
        lines.append(f"{r['id']}  [{tag}]")
        lines.append(f"  problem:    {r['problem']}")
        lines.append(f"  hypothesis: {r['hypothesis']}")
        lines.append(f"  metrics:    {', '.join(r['primary_metrics'])} | guardrails: {', '.join(r['guardrails'])}")
        for row in r['evidence']['contrary']:
            lines.append(f"  {row['result'].upper()}: {row['id']} ({row['product']}, level {row['evidence_level']}): {row['summary']}")
    return '\n'.join(lines) if lines else 'No matching records. Widen the query or drop --stack.'


def main(argv=None):
    cat = C.load_catalog()
    parser = argparse.ArgumentParser()
    parser.add_argument('--stack', choices=C.stacks(cat))
    parser.add_argument('--query', default='')
    parser.add_argument('--limit', type=int, default=5)
    parser.add_argument('--include-retired', action='store_true', help='also list records retired by a harmful result')
    parser.add_argument('--brief', action='store_true', help='compact text instead of JSON')
    args = parser.parse_args(argv)
    records = retrieve(args.stack, args.query, args.limit, args.include_retired)
    print(brief(records) if args.brief else json.dumps(records, indent=2, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    sys.exit(main())
