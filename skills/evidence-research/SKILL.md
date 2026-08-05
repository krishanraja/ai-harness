---
name: evidence-research
description: Decision-grade research and due diligence for Krish. Use when asked to investigate, research, compare, verify, diligence, map a market, evaluate evidence, establish current truth, or produce a sourced recommendation; when claims are recent, disputed, niche, costly, or consequential; and when strategy depends on external facts. Do not use for a simple stable fact with one authoritative source or as a substitute for execution. Frame the decision first, prefer primary evidence, preserve contradictions and dates, separate fact from inference, and hand a claim-evidence matrix to strategy and verification.
---

# Evidence Research

Turn external information into decision-grade evidence. The output is not a pile of links; it is a traceable answer to a decision or uncertainty.

## Preconditions

Apply `krish-principles` and receive the outcome, stakes, constraints, and verification plan from `strategy-brief`.

Before searching, state:

- the decision or uncertainty the research must reduce;
- what would change the call;
- the freshness horizon;
- the required evidence quality;
- material exclusions, jurisdictions, segments, or definitions;
- time/cost boundary and stopping rule.

Persist a `RESEARCH BRIEF` before collection. It is incomplete unless it names:

```text
DECISION: [call or uncertainty]
CHANGE CONDITIONS: [evidence that changes the call]
BOUNDARIES: [market/segment/geography/jurisdiction/population and exclusions]
FRESHNESS: [acceptable source/data age and retrieval requirement]
QUALITY FLOOR: [required source/method standard]
TIME/COST CAP: [research budget]
STOP RULE: [saturation or decision threshold]
```

## Source hierarchy

Prefer the closest authoritative evidence:

1. official records, current product/service documentation, source code, filings, standards, laws, datasets, and direct first-party statements;
2. original research papers and methodological appendices;
3. reputable analysis that links its primary evidence;
4. independent practitioner evidence with disclosed context;
5. community discussion for discovery, lived experience, and failure modes—not as sole proof of a hard claim;
6. search snippets, unsourced summaries, affiliate pages, and generated aggregations only as leads.

Source prestige does not cure weak methodology, stale data, conflicts of interest, or source laundering.

## Research workflow

### 1. Decompose claims

Break the decision into the smallest claims that could independently be true or false. Mark each as factual, causal, forecast, preference, or unknown.

### 2. Define proof

For each material claim, name the evidence that would support it, contradict it, and falsify the current hypothesis. Do this before collecting confirming links.

### 3. Search in passes

- **Orientation:** establish vocabulary, entities, date range, and authoritative source locations.
- **Primary evidence:** retrieve the strongest documents/data directly.
- **Contradiction:** search for failures, contrary results, alternative explanations, and excluded populations.
- **Freshness:** verify current status, publication/event dates, revisions, and whether a newer source supersedes the result.
- **Decision relevance:** stop collecting when additional evidence is unlikely to change the call or meaningfully narrow uncertainty.

Do not inflate confidence by counting multiple articles that repeat the same underlying source.

### 4. Extract with provenance

For every decision-bearing item record:

- claim supported or challenged;
- source title and direct URL or local path;
- source type and authority;
- publication date and event/data date when different;
- retrieval date;
- scope, sample, jurisdiction, product version, or population;
- short evidence summary;
- limitation, conflict, or dependency;
- confidence and what would change it.

Respect quotation and copyright limits. Prefer accurate paraphrase with direct citation.

Minimize private or personal data at collection time. Prefer aggregate or deidentified evidence over raw personal records; when record-level data is genuinely necessary, extract only the fields required for the named decision and preserve the applicable access, retention, and sharing boundary.

### 5. Resolve without erasing conflict

When sources disagree, test whether they differ by date, definition, sample, incentive, methodology, product version, or jurisdiction. If disagreement remains, preserve it and state which decision is robust across both possibilities.

### 6. Synthesize for action

Lead with the call, not the research journey. State:

- what is established;
- what is likely but inferred;
- what remains unknown or inaccessible;
- the strongest countercase;
- the smallest next action that buys information or preserves reversibility;
- any revisit trigger or expiry date.

## Claim-evidence matrix

```text
CLAIM | TYPE | EVIDENCE | CONTRARY EVIDENCE | DATE/SCOPE | CONFIDENCE | DECISION EFFECT
```

Every material recommendation must resolve to this matrix. A citation that does not support the attached claim is a failure.

The matrix must preserve conflicting evidence, publication/event/data dates, retrieval time, and source scope. Never discard a conflict merely because one source wins the current recommendation.

## Edge cases

- **Paywall or access block:** use an accessible primary copy, abstract, filing, repository, or report the limitation. Never imply the inaccessible source was read.
- **Dynamic page:** record retrieval time and use the page's authoritative visible state; do not rely on a stale snippet.
- **PDF/table:** inspect the relevant page/table and its notes, definitions, and methodology—not extracted text alone.
- **No evidence found:** report the negative search scope and remain inconclusive; absence of evidence is not evidence of absence.
- **Vendor benchmark:** inspect cohort, exclusions, incentive, and whether the metric matches Krish's use case.
- **Forecast:** expose assumptions and scenario range; do not present a point estimate as a fact.
- **Small or biased sample:** limit the claim to the observed population.
- **Correlated sources:** count the original evidence once.
- **User-supplied claim:** verify it proportionately; do not launder it into certainty by repetition.
- **High-stakes domain:** prioritize current authoritative sources and clearly mark the boundary between information and professional advice.

## Handoff and verification

Pass `strategy-brief` the call, claim-evidence matrix, contradictions, expiry/revisit triggers, unresolved decisions, and an explicit `KRISH-OWNED CHOICE` naming the strategic judgment that only Krish can make. If no such choice remains, state `KRISH-OWNED CHOICE: none` rather than inventing one. Then run `verification-loop` to check citation support, dates, source scope, alternative explanations, and separation of fact from inference.

For a current domain fact, return a `FACT PACKET` to the named domain owner and writer with claim, competing claims, first-party/transaction evidence, source scope, retrieval time, confidence, expiry, and unresolved conflict. For Mindmaker commercial copy, name `mindmaker` and the selected writer explicitly.

For approved execution, return an `EXECUTION EVIDENCE PACKET` to the narrow executor containing the approved decision, assumptions, supporting and contrary evidence, authority boundary, verification criteria, expiry date, and named revisit trigger. The recommendation itself is not mutation authority.

## External action preparation

Research may prepare an approval-ready action without performing it:

- **Paid source:** identify the exact report/product, seller, current price/currency if observable, purchase URL/target, expected information value, accessible alternatives, and residual evidence limit; wait for spend approval.
- **Expert/vendor contact:** draft the exact message or contact plan, name recipient, purpose, channel, questions, and every piece of Krish/company/customer data that would be shared; wait for contact/send approval.
- **Account/signup:** identify the exact service, account/workspace target, terms/data implications, required fields, and alternatives; wait for account creation and terms acceptance approval.
- **Publication:** prepare a private draft with claim/evidence boundaries, uncertainty, legal/reputational risks, and correction conditions; name the exact publication surface and `publish` action; wait for approval.

Research does not authorize contacting people, purchasing reports, signing up for services, publishing findings, or mutating external systems.
