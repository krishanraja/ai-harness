# Source precedence and freshness

## Purpose

Use this reference whenever a Mindmake fact may have changed, appears in customer-facing work, affects a transaction, or conflicts across sources. The goal is not to select one universal source of truth. The goal is to select the authoritative source for the question being asked.

## Source-by-question matrix

| Question | Authoritative evidence | What it proves |
|---|---|---|
| What the business intends | current private Mindmake commercial documentation and explicit Krish decision | intended architecture |
| What a customer can currently see | live official website, Maven, Substack, CTRL, or other named first-party surface | published claim at retrieval time |
| What a customer can currently buy | live checkout, Maven enrolment, approved proposal/invoice configuration, or billing system | transaction state at retrieval time |
| What the product currently does | live product plus current implementation evidence | observable and implemented capability |
| What mind/make OS is running | live runtime sources routed through `mindmake-os` | internal operating state |
| What happened historically | dated repository history, decision record, or archived artifact | historical state only |
| What Krish wants changed | direct current instruction or accepted decision record | desired next state, not completed state |

Source authority is scoped. A repository plan cannot prove a public update shipped. A public page cannot prove the checkout amount. A checkout cannot explain positioning intent. A recent "Last updated" label cannot prove every embedded fact is current.

## Volatile facts

Always retrieve these at task time when material:

- prices, discounts, credits, deposits, currency, billing cadence, and checkout configuration;
- dates, duration, seat caps, deadlines, schedule, cadence, and availability;
- guarantees, inclusions, bundles, eligibility, refund terms, and delivery format;
- page routes, CTA destinations, navigation, publishing status, and channel activity;
- product features, tiers, model/provider choices, integration support, counts, versions, and deployment status;
- agent/fleet counts, workflow status, current open loops, campaign state, and project completion;
- customer, revenue, performance, or proof statistics.

Do not renew a review date by checking only one of these fields.

## Retrieval record

For each material live fact record:

- claim;
- source URL, repository path/revision, or named system;
- retrieval time and timezone;
- source scope: intended, published, transactable, implemented, or historical;
- access limitations;
- whether the claim is observed, reported, or inferred.

Do not place credentials, session details, private personal data, or raw sensitive content in the record.

## Conflict protocol

1. State each conflicting claim without blending them.
2. Identify the source scope and retrieval/revision time for each.
3. Decide whether one source actually answers a different question.
4. Check the nearest observable downstream truth: for example, checkout after a pricing page or deployed behavior after repository intent.
5. If the conflict remains material, mark the output `unresolved` and ask only the decision that Krish genuinely owns.
6. Do not publish, sell, promise, change price, or perform a hard-to-reverse action while a material conflict is unresolved.

If access fails, use a labelled placeholder or provide non-volatile structure. Never substitute stale memory and call it verified.

## Freshness review

A freshness review must examine:

- whether the positioning and buyer families still hold;
- whether offer and product families changed;
- whether names were introduced, retired, or repurposed;
- whether intended architecture differs from published or transaction state;
- whether any volatile snapshot leaked into durable skill text;
- whether trigger, conflict, missing-access, and retired-name regressions still pass.

Record the sources and evidence used. Expiry opens a finding; it does not silently rewrite or disable the skill.
