---
name: verification-loop
description: "Exclusion gate first: NEVER invoke for an unexecuted future plan when no recommendation, artifact, action, or observable outcome exists, even if asked to call it verified; strategy-brief owns that phase. Otherwise this is Krish's completion gate: invoke to verify, QA, prove, inspect, or certify an existing artifact, change, dataset, workflow, deployment, cloud state, browser flow, research conclusion, or recommendation, including attempts to skip contradictory evidence. Use after every correction and before claiming completion, readiness, parity, or delivery. Select observable independent checks, correct only within authority, rerun failed checks, separate facts from inference, never expose matched secrets, and never treat self-critique as independent proof."
---

# Verification Loop

Prove the intended outcome, not merely that work occurred. Confidence, eloquence, and a clean-looking artifact are not verification.

## Inputs from strategy

Receive:

- intended observable outcome;
- artifact or system changed;
- material assumptions and risks;
- authority boundary;
- planned independent signal and pass/fail definition.

If those are missing, reconstruct the smallest adequate verification plan before judging the result.

Pass/fail criteria must exist before the verification action begins. If there is not yet an executed action, recommendation, artifact, or observable outcome, return the task to `strategy-brief`; a future plan cannot be verified.

## Evidence hierarchy

Prefer, in order:

1. deterministic schemas, tests, builds, type checks, linters, hashes, counts, and invariants;
2. readback from the authoritative system after the action;
3. browser or API evidence of the actual user/system outcome;
4. comparison against versioned sources, rubrics, or held-out examples;
5. fresh-context model judgment for genuinely qualitative criteria;
6. Krish or another human for taste, intent, relationship, or high-stakes judgment only they can supply.

Model self-review is supplemental. It may propose where to look; it cannot independently certify its own output.

## Select checks by artifact

### Facts, research, and recommendations

- Verify time-sensitive claims against current primary sources.
- Record retrieval date, scope, and source revision where available.
- Test the recommendation against the strongest material alternative and Krish's principles.
- Separate source-backed findings, reasoned inference, and unknowns.

### Code and repositories

- Use the repository's actual build, type, lint, test, and security commands.
- Inspect the relevant diff for unintended changes and user-owned work.
- Exercise the original failure or requested behavior, not only the test suite.
- Run secret scanning without printing matched values; report only type and location.

### Interfaces and browser flows

- Attempt the named user task in the intended environment and viewports.
- Verify visible result, persisted state, recovery behavior, and relevant console/network signals.
- Reproduce a defect from a clean state before calling it confirmed.
- Use `ux-testing-agent` for a full UX audit.
- For a deployed form or interaction change, explicitly exercise recovery from interruption, validation failure, and retry when those can affect the outcome.

### Data, databases, and pipelines

- Validate schema, row counts, null/uniqueness/range invariants, and representative records.
- Read back the authoritative destination after writes. For a staged pipeline, verify every changed handoff from the producing artifact through the declared consumer, then inspect the final artifact or state actually consumed. A progress marker, startup log, nearby file, cached verdict, or successful orchestrator exit cannot prove semantic completion.
- Test idempotency or deduplication before rerunning.
- Treat missing, truncated, unparseable, or unconsumed output as `inconclusive` or `failed` according to the contract. Never coerce absence into rejection, approval, an empty success, or a durable negative result.
- Never use production writes merely to verify access.

### Automations and agents

- Use a bounded dry run or designated test input first.
- Verify expected side effects, absence of duplicates, failure handling, heartbeat/trace, and downstream state.
- Distinguish workflow success status from the business outcome actually occurring.

### Files and documents

- Open or render the final format, not just its source.
- Check required sections, links, names, dates, claims, layout, and machine-readable structure.
- Compare the delivered file's hash with the built artifact when crossing surfaces.

### Cross-client harness releases

- Validate structure, triggers, security, references, behavior fixtures, and deterministic packaging.
- Compare source commit, source hash, artifact hash, installed surface, and enabled cloud record.
- Record the prior known-good rollback artifact before replacement.
- In a fresh client session, test discovery, trigger routing, required behavior, coexistence with unrelated skills, and rollback; byte parity alone is not production parity.
- A newer timestamp without matching provenance is not freshness evidence.

### Personal taste and qualitative work

- Run deterministic structure, content, accessibility, and owned-rubric checks first.
- Ask Krish only for the decisive personal taste or intent judgment that cannot be established objectively.
- Record objective evidence and subjective judgment separately; never make Krish repeat deterministic checks or let model taste certify his taste.

## Correction loop

1. Run the planned checks.
2. Mark each condition `pass`, `fail`, `inconclusive`, or `not run`.
3. For a failure, quote or locate the evidence without exposing sensitive values.
4. Identify the smallest root-cause correction within current authority.
5. Apply the correction only if implementation was authorized.
6. Rerun the original user-visible task or failure reproduction plus relevant adjacent regression checks.
7. Stop after two unsuccessful correction cycles on the same condition and surface the blocker; do not thrash or lower the bar.

Verification does not expand authority. A verifier may diagnose a production or cloud failure without being allowed to mutate it.

If the failed check passes after correction but an adjacent route breaks, the overall verdict remains failed. Revert or correct within existing authority, then rerun both the original and adjacent checks. If correction is not authorized, preserve the evidence and surface the exact gate.

If authoritative readback becomes unavailable after a mutation, preserve the exact known action and all local/request evidence, mark readback inconclusive, and make no further mutation until state can be established. If two deployment/version sources conflict, record both revision identifiers, scopes, and observation times; prefer authoritative target readback when available and remain inconclusive while the conflict persists.

## Specialist handoffs

- Disputed research claims -> hand the claims, source dates/scopes, and decision need to `evidence-research`; receive its claim-evidence matrix, then resume the verdict with facts, inference, and unknowns separated.
- Material independent code review -> hand relevant diff, risks, runtime evidence, and deterministic test results to `code-reviewer` when that validator is admitted/available; merge its findings without turning review into a build step or discarding direct runtime proof.
- Harness byte parity with wrong trigger routing -> mark the surface canary failed, preserve both the candidate package and prior known-good rollback artifact, and hand the collision evidence to `harness-maintainer`; never edit active metadata ad hoc.
- A failure suggesting a durable personal-standard change -> keep the artifact verdict against the current standard and send the observation plus evidence to `ctrl-capture`. Human acceptance and a new regression case are required before a future release changes the standard.

## Completion report

```text
OUTCOME: [what was supposed to become true]
VERDICT: [verified | partially verified | failed | inconclusive]

EVIDENCE
- [check]: [pass/fail and observable signal]

CORRECTIONS
- [located failure -> authorized correction -> rerun result]

NOT VERIFIED
- [anything inferred, blocked, or outside scope]

NEXT GATE
- [exact approval or action, if any]
```

Keep reports proportional. A one-line reversible edit may need one check and one sentence. A material cross-system change needs the full evidence record.

Even the proportional one-line report states `pass` or `fail` plainly after the bounded readback/diff check.

Concentrated rigor governs scope: never skip a check that could change the verdict or reveal consequential harm, and never add checks that cannot affect the outcome merely to make the report look comprehensive.
