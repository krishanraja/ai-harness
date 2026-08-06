# Criterion-level judgment

Run in a fresh isolated context after the standard bundle is validated and before any review history is loaded. Freeze standard and submission hashes across every pass.

## Load the standard bundle first

Load only:

- accepted applicable criteria and their decision rules, priority, surface, situation, and pointers;
- AWAITING, not-applicable, untested, withdrawn, and contradiction boundaries;
- minimal runtime-authorised exemplars with ids and situations;
- review policy and current status.

Never load sealed holdout items, expected answers, judge rubrics, past ledger verdicts, or unauthorised exemplars. If a runtime exemplar is not in the manifest, exclude it. If an exemplar is actually a holdout item, stop, preserve its first-open state, and return exact contamination evidence to `ctrl-build`.

## Evidence before verdict

For every applicable criterion, cite the smallest exact passage and stable locator before judging it. For whole-artifact properties, cite the relevant set of locators and explain why no single span suffices.

Use exactly the criterion's decision rule:

- `holds`: the cited evidence satisfies it;
- `breaks`: the cited evidence violates it;
- `not-applicable`: the criterion does not govern this surface/situation;
- `insufficient-evidence`: required submission/source information is missing.

For the last two, name the reason and exact evidence that would resolve the status. Do not turn absence into a failure or quote unrelated text.

## Complete coverage

Review every applicable accepted criterion. When the set exceeds one reliable pass, declare the pass budget, partition by stable criterion ids, use independent contexts over the same hashes, and merge the per-criterion records. Preserve disagreements rather than forcing consensus. Never discard later/lower-priority criteria merely to fit context.

Do not return an aggregate score. Prioritise material breaks in the owner summary without erasing the full criterion table.

## House advisories

Evidence quality, genericness, accessibility, or organisation style can be useful when separately authorised. Report each as `HOUSE ADVISORY`, name its non-subject policy/source, and keep it advisory unless an authorised governance policy says otherwise.

If a subject criterion holds but a house advisory objects, report both and the owner decision point. Do not average them into `borderline`, overwrite the personal standard, or imply that the house lens came from the subject.

An uncovered semantic observation is also advisory. Describe it without scoring and propose it to the ledger only under the privacy/authority contract. Repetition may later go to `ctrl-capture`; it does not become a rule during review.

## Claims and current truth

Source presence and factual truth are separate checks. A citation can exist and still be stale, weak, or irrelevant. For a current or high-stakes claim, hand verification to `evidence-research` or consult an authorised current primary source, then record the source/date and limit. If that route is unavailable or unauthorised, label the claim `unverified`; do not approve it from memory.

Research findings remain factual evidence or house policy. They do not become the subject's preference unless the CTRL evidence chain establishes that.

## Proposed revisions

When improvement is requested, propose the smallest passage-level change that resolves each material `breaks` while preserving supported meaning, facts, citations, voice, and situation. Link the patch to the exact original passage and criterion.

Treat proposed text as a new frozen artifact. Rerun applicable mechanical checks, provenance, the failed criterion, and any criterion the change may affect. Report the recheck; do not mutate, send, or publish the original.

If a safe fix requires new facts, subject judgment, design decisions, or code, route to the correct owner instead of inventing it.

## Decision rights

Check reports evidence. The authorised human decides whether to accept a patch, send/publish, or change gate disposition. A clean review means no identified break under the named standard/version and reviewed evidence; it is not a guarantee.

Do not automatically make a criterion blocking after a run count or absence of complaints. Blocking requires explicit owner policy, measured false positives with feedback capture, appeal/override, monitoring, rollback, and governance approval.
