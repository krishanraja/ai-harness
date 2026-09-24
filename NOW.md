---
repo: krishanraja/ai-harness
product: The harness
as_of: 2026-09-25
lifecycle: live
operational_state: CURRENT.md
state_doc: state/skill-registry.yaml
history_log: docs/history/LOG.md
authority_order: [CURRENT.md, state/skill-registry.yaml, contract/krish-operating-contract.md, contract/skill-routing-contract.md, contract/active-skill-quality-standard.md]
---
# The harness now

The harness is Krish's governed, cross-client operating layer: one operating
contract, one routing contract, 29 curated skills, deterministic release
packages, per-surface deployment evidence, behavioral canaries and a controlled
learning path. It exists to stop client, machine and session drift.

`CURRENT.md` is the sole human-readable source for live release, deployment,
surface and canary state. This file deliberately does not repeat those volatile
facts. `docs/history/LOG.md` is the append-only historical ledger.

## What changed in the current release

- The experience-quality system is durable rather than session-local. App work
  now has explicit coverage for narrative, journeys, conversion, visual-system
  integrity, device-specific interaction, accessibility, overlap and contrast.
- `build-apps-with-krish` now compiles accepted decisions before synthesis,
  binds every acceptance claim to the candidate actually reviewed, and refuses
  to treat implementation as review closure.
- Scroll-build interactions require causal evidence that progress follows user
  scroll and that the locked region releases only after its sequence completes.
- Project delivery is fail-closed when a repository has no real test, build or
  QA command. Placeholder scripts cannot manufacture readiness.
- Provisional Codex-only overlays were consolidated into immutable release
  `v2026.09.24.3` and the canonical release was installed on the in-scope local
  and cloud surfaces. Exact current status and exceptions are in `CURRENT.md`.

## Operating rule

Do not infer completion from a package, upload, passing build, or an agent saying
it is done. Read the evidence attached to the current surface, preserve measured
failures as failures, and correct the lowest owning layer through a new governed
release. Never rewrite an immutable release or its historical evidence.

## Read next

1. `CURRENT.md` — generated current release and surface truth.
2. `state/skill-registry.yaml` — machine-owned release and deployment register.
3. `contract/krish-operating-contract.md` — authority, verification, truth,
   freshness, secrets and observation capture.
4. `contract/skill-routing-contract.md` — which skill owns which request.
5. `contract/active-skill-quality-standard.md` — admission standard.
6. `contract/experience-quality-contract.md` — durable product-experience gates.
7. `docs/history/LOG.md` — append-only chronology.

## Historical material

Dated proposals, deployment reports, canary records and observations are
evidence of what happened, not instructions for the current system. They remain
available for audit and rollback. Any historical document that conflicts with
`CURRENT.md`, the registry or a live target readback loses.
