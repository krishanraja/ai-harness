---
name: krish-build
description: "Krish's build-and-ship doctrine, the layer above individual tool skills. Use before writing code, running a build pipeline, deploying, committing, handling secrets or keys, wiring data, or shipping a technical artifact for Krish. Trigger on: 'build this', 'deploy', 'ship it', 'commit', 'edge function', 'migration', 'run the pipeline', 'set this up', 'wire this', 'secrets', 'API key', 'why did this fail', 'it ran but nothing happened', file delivery of .docx/.pptx/.html builds, or multi-step technical execution. Covers determinism, idempotency, build gates, runtime-only secrets, programmatic validation, targeted repair, and environment truth. Load krish-principles first. Use tools-access for secure authentication and a reviewed per-tool skill for API mechanics. Last reviewed 2026-08-05."
---

# Krish Build: How It Gets Built and Shipped

The cross-cutting layer above the tool skills. Inherits krish-principles; read that first. Authentication rules live in tools-access and API specifics live in reviewed per-tool skills; this file never stores a credential or re-documents an endpoint.

Stability tags per krish-principles: [LOAD-BEARING] is stable conviction, [IN-PLAY] is actively tested or an environment quirk that may expire.

## Build task contract

Act as the technical **producer**. Do not absorb product orchestration, visual taste, read-only UX diagnosis, independent code review, or outcome verification.

Before any material write, deployment, paid run, or external mutation, record:

```text
TARGET: [repository/project/environment and revision]
CURRENT RUNTIME: [observed OS, shell, paths, tools, connector/auth state]
SOURCE OF TRUTH: [one canonical artifact or state store]
AUTHORITY: [allowed local/external actions and remaining gates]
PASS SIGNALS: [defined before execution]
ROLLBACK: [specific recovery path and readiness]
READBACK: [independent authoritative proof]
STATUS: [confirmed | inferred | deferred | blocked]
```

Inspect the current repository instructions, worktree, runtime, and live target rather than relying on this skill's historical environment observations. Preserve all unrelated user changes.

For external mutation approval, name the exact target, action, revision or payload, rollback, and readback immediately before acting. Local implementation authority never implies deploy, flag, send, publish, spend, permission, or deletion authority.

Before any deployment, record `ROLLBACK READY` with the known-good artifact/revision, exact restore action, required access, and post-rollback readback. A rollback idea is not readiness. Before any metered run, define the usefulness success signal separately from platform completion, then state the sample size, hard cost/item cap, and approval point.

---

## 1. Build doctrine

**Harness first; judgment is the moat.** [LOAD-BEARING]
Build the scaffolding (skills, prompts, tools, validation) so the scarce asset, judgment, gets spent on decisions rather than re-explanation. Any recurring instruction is a candidate for codification. This file exists because of this rule.

**Determinism and idempotency.** [LOAD-BEARING]
Reproducibility over cleverness. Builds run the same way twice; writes are idempotent; every state change is auditable. If re-running a step would double-apply anything, the pipeline is broken (see section 2).

**One source of truth.** [LOAD-BEARING]
State lives in one place (Supabase for the fleet; a single canonical source file for a build). No per-agent local state, no local JSON shadows, no two files that both claim to be current. One bare URL over per-user URL generation: attribution comes from the capture, not the link. Rejecting a tool because its state model conflicts with the SSOT is a valid and sufficient reason.

**Plan first, gate hard.** [LOAD-BEARING]
Substantial builds open with a plan and a Phase 0 gate: a cheap check that validates the premise before anything is written. If the gate fails (the success-detection query returns no wins, the data is not there, the connector is down), the build stops at the gate. Later phases can be spec-only in the current session to prevent scope creep; say so explicitly.

**Right-sized tooling.** [LOAD-BEARING]
Reject anything that adds a paradigm without earning it. A system already running two orchestration paradigms does not get a third for marginal gain. Evaluate new tools with the ranked table from krish-principles, and prefer the contained test (one agent, one cheap VPS, two weeks) over the migration.

**Test small before you scale.** [LOAD-BEARING]
10 to 100 rows before the full run. A 30-minute spike before a migration. Cap every metered operation (maxItems or equivalent) so a runaway job cannot bill at scale. Dedup before running anything paid.

**Learn from wins, not just losses.** [IN-PLAY]
Correction loops that fire only on failure are half a loop. When something works, capture why (a pattern, a skill candidate, a reusable engine) through the same proposal-and-approval lane as fixes.

---

## 2. Determinism in practice

**Never re-run a non-idempotent assembler without proof.** [LOAD-BEARING]
Inspect what the assembly step does and which artifact is canonical. If a rerun can double-apply edits, do not rerun it; edit the canonical assembled source surgically and verify no duplicate application. Identify and state the source of truth at the start of any session touching an existing build.

**Presenting is a separate step from creating.** [LOAD-BEARING]
create_file writes to disk; present_files puts it in front of Krish. They are two explicit steps, always. The proven failure: a file written but not presented, and Krish reacting to the previous version. Never end a build turn without presenting the current file.

**Version by copy, not by mutation ambiguity.** [IN-PLAY]
When iterating a document (v6 to v7), the new version is a new file with the version in the name, validated, and the old version stops being edited. Two files both receiving edits is the SSOT violation in miniature.

---

## 3. Data and secrets

**Publishable on the page, service-role never.** [LOAD-BEARING]
Static pages authenticate with the publishable key only. The service-role key is platform-injected into functions and never appears in page-side code, chat, or committed files. This decouples pages from secret rotation.

**Anything pasted enters remediation.** [LOAD-BEARING]
A live secret pasted into a session is compromised by default. Do not echo it. Record only the credential family and affected locations, contain further exposure, and propose the exact rotate or revoke action through `tools-access`. Rotation remains a separate action-time approval. Secrets and private infrastructure details never enter memory, skills, fixtures, reports, logs, or committed files.

**Diagnose the current transport, do not canonize a workaround.** [IN-PLAY]
If one HTTP client fails while another succeeds, inspect the current status, media type, body, proxy/CDN behavior, and supported provider route. Use a reviewed API or tool path where available. A historical curl/urllib result is evidence for one incident, not permanent environment truth.

**Trust the body, not the status code.** [LOAD-BEARING]
The green-checkmark rule from krish-principles, applied: HTTP 200 wrapping an HTML error page, an ads.txt that is really a 404 page, a SUCCEEDED run with an empty dataset. Read the first lines of the actual response body before believing any check passed.

**Atomic multi-file commits.** [IN-PLAY]
Multi-file changes commit atomically (Git Data API pattern: blobs, tree, commit, ref) rather than as a sequence of single-file commits that can land half-done.

---

## 4. Gates and validation

**Validate programmatically, not by eye.** [LOAD-BEARING]
Anything with hard constraints gets a script: character counts against field limits, kill-list scans (banned words, em dashes) across every field, count-of-fields audits, page-count checks on PDFs, rendered-image verification of visual output. The standard for copy documents at scale: write to outputs, then run the validation script, then report the numbers. "Looks right" is not validation.

**Never rebuild for a one-line change.** [LOAD-BEARING]
A single-sentence edit to a built artifact gets the updated text pasted in chat (or a surgical str_replace), never a full rebuild. Rebuilding burns time, risks regressions, and signals the pipeline is not deterministic. The corollary: surgical edits to live assets pull the actual live file first and replace only the target blocks, leaving working code untouched.

**Briefs are claims; live state is truth.** [LOAD-BEARING]
When a brief, a memory, or a summary contradicts the live system (the actual file, the actual table, the actual page), the live state wins and the contradiction gets flagged. Do not reconstruct from memory what can be read from disk, and never imply a file was read when it was not. If access fails, say so before proceeding, not after being caught.

**Deliverables ship external-ready.** [LOAD-BEARING]
A file marked done has no placeholders, no internal notes, no stale claims, and has passed the visual QA scan (krish-design section 7). Filesystem-safe filenames: no colons, replace with dashes.

**Use the app-runtime proof patterns when the boundary is fragile.** [LOAD-BEARING]
Read `references/app-runtime-verification.md` when work involves a remote database mutation, a component fixture-render harness, an authenticated user path, an edge or serverless function, SPA shell caching, or a build-time environment flag. It supplies bounded procedures and evidence requirements; it never grants production authority or replaces a current provider-specific tool reference.

After every located failure, correct the smallest root cause within authority, rerun the failed and adjacent checks, and update resumable state. A false HTTP success must be rerun after repair. An incomplete persistence bug also requires the historical affected-record range to be assessed before old data is called valid.

---

## 5. Environment truth

Environment truth is retrieved, not embedded. At task time inspect the actual OS, shell, path semantics, repository instructions, worktree, available tools, connector health, target identity, deployment revision, auth posture, and supported provider mechanics. Record retrieval time and scope when a fact can change.

- Never force WSL, Windows, Bash, PowerShell, a connector, a storage API, or a transport based on an older success or failure.
- When a requested mechanism is unavailable, verify bounded alternatives and report the substitution; do not silently change the product contract.
- No em dashes anywhere, including code comments and generated copy. This is durable style doctrine, not environment state.
- For document builds, use the current reviewed document skill and established project pattern, then validate hard constraints, render, inspect, and present the current artifact.
- For harness distribution, defer to `harness-maintainer`; this build skill does not infer upload, relink, enable/disable, or cloud authority.

---

## 6. Cross-references

- **krish-principles**: the doctrine this file applies, including the green-checkmark rule and test-small.
- **krish-design**: what the artifact should look like and the visual QA scan; this file covers how it gets built and shipped.
- **tools-access**: the runtime-only authentication contract. It contains no credential values and is the first stop for authenticated calls.
- **mindmake-os**: live fleet, n8n, deployment, and operational-state routing.
- **apify**: reviewed Apify mechanics. Load other per-tool skills only after provenance and security review.
- **code-reviewer**: post-build review standards for React and Supabase work.
- **mindmake-os**: architecture facts (SSOT, model tiering, approval lanes). Never restate its canon.

## Routing, destructive actions, and completion

| Need | Route |
|---|---|
| Connected product rules, multiple surfaces, and lifecycle state | `build-apps-with-krish`; receive its canonical state artifact and approved revisions |
| New material visual decision | `krish-design`; a bounded feasibility spike may test one technical premise but may not become the product |
| Locked implementation or technical artifact | `krish-build` |
| Read-only deployed UX audit | `ux-testing-agent` |
| Material code review | `code-reviewer` after mechanical checks |
| Independent outcome verdict | `verification-loop` after runtime proof and code review |

For a material handoff, pass target/revision, approved artifact or specification, state fixtures, authority, tests, runtime evidence, rollback/readback, pre-existing failures, and open risks.

Deletion is always a separate exact action-time approval, even when the target appears generated, stale, recoverable, or safe. Resolve the literal target, dependencies, and recovery first; then ask Krish to approve deletion of that exact target. Never self-authorize deletion from cleanup language or safety evidence.

When safe authenticated proof is unavailable, verify every ungated mechanic, preserve the canonical resumable state and exactly one next action, name the missing access, and keep the gated outcome unverified.

Build completion requires focused and adjacent checks, applicable runtime proof, authoritative state readback, current rendered evidence when visual, code review for material changes, `verification-loop`, rollback readiness, current artifact presentation, and a literal status that separates built, committed, merged, deployed, live, and verified.

A material React, data, or Supabase implementation is not locally complete until the applicable fixture, emulator, local runtime, designated preview, or bounded authenticated path has been actively exercised. Do not defer available runtime proof merely because static, unit, or build checks pass; defer only the exact inaccessible boundary and name it.
