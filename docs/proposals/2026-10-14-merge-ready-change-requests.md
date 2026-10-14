# Close the learning loop: merge-ready change requests

Status: accepted. Krish decided each point below on 2026-10-14, in the session
that asked whether this repository improves on its own from the work he does
across his AI tools. This file is the provenance for the doctrine change and the
`brain/rules.yaml` entries that cite it.

## Evidence

- Capture runs and promotion does not. The observer appended 1,357 rows by
  2026-10-13. The weekly proposer wrote 87 blocks for 2026-10-05 to 2026-10-12,
  of which 85 said nothing changes. Proposal pull requests 99, 103 and 123 sat
  unmerged (16, 9 and 2 days).
- Of 46 commits that touched `skills/` since 2026-08-15, none came from the
  weekly proposer: 23 came from synthetic canary failures, 9 from rulings made
  in a session, 6 from captured proposals applied by hand.
- From 2026-10-07 to 2026-10-14 no commit touched a skill, contract, adapter,
  eval or rule, while about 22 new rulings were captured and not carried.
- The independent judge could not review anything: on pull request 115 its log
  reads `anthropic 401: API key is invalid`, and the job reported success with
  no comment, so a canon change merged unreviewed.
- The canon only grew. The always-on surface measures 116,314 characters; 326
  rules are live and 13 of 29 skills are past their review SLA.

The cause is structural: capture could only write a document, so every change
waited for a session Krish had to start himself.

## Decision

1. Capture may open a versioned change request: a pull request carrying the
   exact proposed bytes, evidence ids, regression case, context delta and
   rollback. Only a named human merging it is acceptance. Nothing merges
   itself, and merging is not release.
2. Distil, do not accumulate. Every change states its always-on context delta
   (`contract/context-budget.yaml`). On always-on surfaces the budget is net
   zero or negative, met by replacing, merging, compressing or moving detail to
   a reference, or else stated as `Growth justified:` with the reason. Every
   cycle reserves one slot for consolidation.
3. Revealed behaviour is evidence: what the owner merged, closed, let expire,
   overrode, reverted or kept doing by hand. It outranks a stated preference it
   contradicts, and still only qualifies a proposal.
4. Silence by default. At most three decisions a week, one queue item, and only
   in a week where a change request is ready. Unmerged change requests close
   themselves after 14 days as superseded.
5. The process reviews itself inside the same weekly run. It may change only
   the learning policy file and may propose retiring a stage with no accepted
   change in six weeks. It never adds a stage.

Also decided the same day, carried by later changes: private transcript mining
of Claude Code and Codex sessions (only distilled, redacted observations leave
the machine), the weekly digest in the Control Center queue, and Perplexity out
of capture scope.

## What changes in the canon

- `skills/ctrl-capture/SKILL.md`: the opening boundary, the revealed evidence
  class, workflow step 8, and the change and history invariants.
- `skills/ctrl-capture/leaves/weekly.md`: revealed preference and consolidation
  candidates, change-request decision states, and section 7.
- `contract/skill-routing-contract.md`: stage 9 and the capture prohibition.
- `contract/active-skill-quality-standard.md`: Gate 10.
- `architecture/HARNESS_EVENT_ENVELOPE.md` and `brain/README.md`: the same
  boundary in their own words.

## If wrong

A steward could flood the owner with low-value requests, or a change could
regress routing. The decision budget caps the first; the change guard, the
judge, the full regression and the owner's merge gate the second. If fewer than
half of change requests are accepted over four weekly cycles, or none merges,
stop and re-diagnose rather than add machinery.

## Revisit trigger

After four weekly cycles with at least 80 percent acceptance and zero reverts,
propose a ruling that would let description-only and routing-only changes that
pass the judge and canaries merge without a person. Until then, every change
waits for a merge.

## Validation

- `node scripts/brain-rules.mjs --check` passes with this file as the source of
  the changed entries.
- `evals/ctrl-capture-behavior-cases.jsonl` cases 024 to 026 record the new
  behaviour.
- The judge measures the change once the `ANTHROPIC_API_KEY` repository secret
  is replaced.

## Prior known-good and rollback

The canon at `b537a3b`. Revert this change's commit; `brain/rules.yaml` history
keeps the superseded hashes and sources.
