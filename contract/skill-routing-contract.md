# Skill routing contract

This file decides which skill runs, in what order, and which apparent matches must be ignored. It is the deterministic layer above individual skill descriptions.

## Routing principles

1. Apply `krish-operating-contract.md` to every request.
2. Classify the request before loading a skill: domain context, artifact capability, validation, or standards maintenance.
3. The narrowest applicable skill wins. A broad `mandatory` or `always` claim inside a skill never overrides this router.
4. Use one primary writer. Validators may stack after the writer; two competing writers may not.
5. Load domain context before an artifact skill and run verification after creation.
6. If two skills still conflict, prefer the newer reviewed release only when its provenance and compatibility are known. Otherwise stop and record a routing collision.
7. Record the route for material work as: `context -> producer -> verifier -> approval gate -> delivery`.

## Core routes

| Request | Context | Primary producer | Verification |
|---|---|---|---|
| Mindmaker OS architecture, fleet, Control Center, n8n, Supabase, OpenClaw, or reconciliation | `mindmaker-os` | Task-specific tool or skill | Live-state check plus revision/hash |
| Mindmaker commercial offer, positioning, or client work | `mindmaker` | Task-specific commercial skill | Source and claim check |
| Outbound writing under Krish's name | Relevant domain skill, then `content-corpus` when evidence is needed | `krish-voice` | Source check and Krish Voice kill-list pass |
| Content strategy or angle generation | Relevant domain skill, then `content-corpus` | `krish-content-marketer` | `krish-voice` only when drafting the final artifact |
| Software implementation | Relevant domain skill | `krish-build` | Tests/build, then `code-reviewer` for material changes |
| Product or interface design | Relevant domain skill | `krish-design` | `ux-foundations`, then observable browser/UX QA |
| App or repository UX testing | Relevant domain skill | `ux-testing-agent` | Evidence bundle and reproducible findings |
| Skill creation or revision | Relevant domain skill | `skill-creator` | Frontmatter, trigger, behavior, security, and packaging evals |
| Harness/configuration audit | `mindmaker-os` when OS-related | No prose producer | Deterministic harness audit; model critique is supplemental |

## Collision rules

- `ux-foundations` replaces the retired generic cloud skills `strategy`, `ux-design`, `ux-concepts`, `ux-toolkit`, `design`, `ux`, `ux-principles`, `ab-test-plan`, and `design-system-builder`. Do not enable both generations.
- `data-pipeline-architect` is the design/planning route; `data-pipeline` is the implementation route. If a request spans both, plan first and implement second.
- `krish-voice` owns final prose voice. `krish-content-marketer` owns strategy and angle selection; it does not override the voice pass.
- `mindmaker-os` owns operating-system architecture and live-state routing. `mindmaker` owns the commercial brand. Load both only when the work genuinely crosses the boundary.
- `code-reviewer`, `ctrl-check`, and deterministic tests are validators, not competing producers.
- Generic marketplace skills never become always-on merely because they are installed. They must occupy a named route here first.

## CTRL standards chain

The CTRL chain is for creating or changing a reusable standard. It is not the default route for routine work.

1. `ctrl-intake`: stages 1-2, INGEST and SORT.
2. `ctrl-compile`: stage 3, COMPILE.
3. `ctrl-build`: stage 4, GENERATE.
4. `ctrl-check`: stages 5-7, SCRUB, CRITIQUE, and PROVENANCE + MEASURE.
5. Stage 8, DELIVER, is the explicit human-approved installation or publication step. No skill silently performs it.
6. `ctrl-capture`: stage 9, LEARN. It proposes evidence-backed changes; a named human accepts or rejects each one.

Never skip from intake to build, allow capture to edit a standard directly, or treat self-critique as an independent verifier.

## Approval gates

Explicit approval is required immediately before any cloud upload, enable/disable action, skill deletion, credential rotation/revocation, protected-folder move, directory-link replacement, publication, send, charge, or irreversible external mutation.

Approval applies to the named action and targets only. It does not transfer to later stages.

## Required route evidence

For material outputs, record:

- selected skills and why each was selected;
- skills deliberately suppressed because of a collision;
- source revisions and retrieval times for dynamic facts;
- deterministic checks run and their results;
- inferred findings that remain unverified;
- the exact action still behind an approval gate.
