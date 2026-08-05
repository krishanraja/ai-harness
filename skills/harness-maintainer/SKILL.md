---
name: harness-maintainer
description: Governance and lifecycle manager for Krish's canonical AI harness. Use when auditing, adding, revising, splitting, merging, admitting, deprecating, quarantining, packaging, syncing, or diagnosing a skill, rule, adapter, evaluation, or client surface; when a skill mis-triggers, overlaps, goes stale, or behaves differently across Claude, Cursor, Codex, or cloud; and when proposing a missing skill or chapter. Apply the active-skill quality standard, preserve the curated-only policy, stage changes before activation, and never upload, enable, disable, delete, relink, or publish without the required approval.
---

# Harness Maintainer

Keep the personalized harness coherent, testable, current, and small enough that its best skills actually load.

## Role

This is standards-maintenance and release-governance logic. It is not a general producer and does not replace Skill Creator, domain skills, `strategy-brief`, or `verification-loop`.

Read, in order:

1. `../../contract/krish-operating-contract.md`
2. `../../contract/skill-routing-contract.md`
3. `../../contract/active-skill-quality-standard.md`
4. `../../state/skill-registry.yaml`

Read `references/reconciliation-and-release-evidence.md` when the task inventories client surfaces, compares same-name artifacts, reviews an imported/provider skill, executes admission gates, prepares a canary, or proposes any install, upload, replacement, enablement, disablement, relink, retirement, or rollback.

## Curated-only policy

- Production routing exposes only skills that pass every applicable quality gate.
- Bulk libraries, marketplace downloads, research files, and superseded copies remain searchable corpus or quarantine, never active by default.
- A new need starts with discovery: determine whether an existing skill needs a chapter, a reference, a routing fix, or an eval before proposing a new skill.
- Add a new skill only when the capability has a distinct trigger, workflow, owner, verification method, and less than 20% overlap with the retained set.

## Maintenance workflow

### 1. Observe

Capture the request, mis-trigger, failure, stale claim, client drift, or missing capability. Record evidence and affected surfaces without changing them.

### 2. Diagnose the layer

Classify the cause:

- operating-contract gap;
- routing/collision gap;
- skill trigger gap;
- instruction/workflow gap;
- missing reference or example;
- authority/security gap;
- stale embedded state;
- verification/eval gap;
- packaging/surface parity gap;
- genuinely missing capability.

Fix the lowest correct layer. Do not create a new skill for a router bug or duplicate doctrine to avoid editing its owner.

### 3. Inspect provenance and overlap

For imported or provider-managed material, record source, license, maintainer, revision, requested authority, dependencies, and security findings. Compare its functions and triggers against every neighboring production skill.

### 4. Stage the smallest coherent change

- Keep volatile facts live and durable doctrine versioned.
- Maintain progressive disclosure and one-level references.
- Preserve explicit inputs, outputs, handoffs, authority, and completion criteria.
- Update the registry and routing contract with the same change.
- Never edit a production surface as the drafting environment.

### 5. Build tests before admission

Add positive, negative, adversarial, collision, nominal, failure, authority, security, handoff, and regression cases at the counts required by the quality standard. Keep held-out cases separate from examples embedded in the skill.

### 6. Verify independently

From a clean tree, run structural and security gates, blind trigger classification, behavior comparison against the baseline, pairwise collision tests, deterministic packaging, and fresh-context qualitative judging. Record failures individually; a hard authority or safety failure cannot be averaged away. Personal doctrine or taste changes require Krish's judgment.

### 7. Release progressively

Build from a clean commit. Smoke-test one canary client and record the source commit, source-skill hash, artifact hash, installed hash or cloud upload record, client, enabled state, verification time, and prior known-good rollback artifact. Keep `production_active` empty until the applicable admission and canary gates pass. Then propose the next exact surface mutation. Activation, replacement, disablement, deletion, and directory-link changes require their named approval gates; readiness is not authority.

### 8. Learn without self-authoring

Log failures and corrections. Route possible standard changes through `ctrl-capture`; require a named human decision and a regression test before release.

## Missing-skill test

Propose a new skill only if all answers are yes:

1. Does the need recur or carry enough consequence to justify durable machinery?
2. Is there a recognizable trigger that can be distinguished from existing skills?
3. Is there a repeatable workflow rather than a collection of facts?
4. Is there an owned standard for good output?
5. Can success be verified independently?
6. Can its authority be bounded safely?
7. Would a chapter/reference/router change be materially worse?

If any answer is no, improve the existing layer or keep the knowledge as corpus.

If a new skill is justified, hand content architecture to `skill-creator`; retain ownership here for registry, routing, evaluation, admission, release, and rollback. When one named provider skill has passed review and Krish approves one target, hand installation mechanics to `skill-installer`. Installation does not imply enablement or production admission.

## Output

```text
FINDING
[Evidence and affected surfaces]

CORRECT LAYER
[Contract | router | existing skill | eval | release | new skill]

PROPOSED CHANGE
[Smallest coherent change and suppressed duplicate]

QUALITY GATES
[Pass/fail/not run by gate, including held-out cases]

STATUS
[candidate | reviewed | production | deprecated | quarantined | archived]

NEXT APPROVAL
[Exact external or active-surface mutation, if any]
```

Never label a skill production-grade from structural lint alone.
