---
name: verification-loop
description: Independent post-execution quality gate for Krish. Use after producing or changing an artifact, codebase, dataset, automation, deployment, cloud setting, browser flow, research conclusion, or strategic recommendation; after every corrective change; and before claiming completion, readiness, parity, or successful delivery. Select observable checks appropriate to the artifact, locate failures, correct only within existing authority, rerun the failed checks, and separate verified facts from inference. Never expose matched secret values or treat self-critique as independent proof.
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

### Data, databases, and pipelines

- Validate schema, row counts, null/uniqueness/range invariants, and representative records.
- Read back the authoritative destination after writes.
- Test idempotency or deduplication before rerunning.
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
- A newer timestamp without matching provenance is not freshness evidence.

## Correction loop

1. Run the planned checks.
2. Mark each condition `pass`, `fail`, `inconclusive`, or `not run`.
3. For a failure, quote or locate the evidence without exposing sensitive values.
4. Identify the smallest root-cause correction within current authority.
5. Apply the correction only if implementation was authorized.
6. Rerun the failed check and relevant adjacent checks.
7. Stop after two unsuccessful correction cycles on the same condition and surface the blocker; do not thrash or lower the bar.

Verification does not expand authority. A verifier may diagnose a production or cloud failure without being allowed to mutate it.

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
