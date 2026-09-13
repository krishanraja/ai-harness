# Handoff and canary correction proposal, 2026-09-13

Status: approved for implementation, verification, merge, release and governed rollout by Krish Raja's instruction, "ok go", after the documentation audit and correction plan were presented on 2026-09-13.

## Evidence

- `AGENTS.md` routed a fresh session to `NOW.md`, which named `v2026.09.12.4`, while the registry and immutable GitHub release named `v2026.09.12.5`.
- README named `.4`, the architecture named `.2`, and the root canon block named `.2`.
- Pull request 46 proposed a `.4` canon render after `.5` had already superseded it. It was closed as stale.
- The `.5` live reports preserve exact local byte parity and failed behavioral evidence. Two failures were instrument defects: a non-skill `task system` route was treated as observable, and a delegation-gated design skill was simultaneously described as routable while hidden from the Codex catalog.
- The remaining Codex failures identify adjacent ownership collisions between `mindmake-os`, `content-corpus`, `krish-content-marketer`, and `decision-ledger`.

## Decision

1. Generate `CURRENT.md` from registry, heartbeat, deployment and canary evidence. Route new sessions there first. Keep README and architecture free of duplicated live release claims, and label dated handoffs as historical.
2. Make `design-intelligence-search` discoverable but retain a strict structured-delegation gate: only `krish-design` or `build-apps-with-krish`, one bounded search need, one concept arm. Generic user design requests remain excluded.
3. Treat an external expected route as unmeasured unless it is an observable canonical skill. A target staying out is containment evidence, not proof of the external handoff.
4. Require headless runners to declare unsupported explicit-manual invocation capability. Preserve those gaps as partial evidence, never as success or failure.
5. Front-load the exact exclusion boundaries exposed by the `.5` live canaries in the three owning descriptions. No new skill, daemon, n8n workflow or per-machine script is added.

## Verification

- `scripts/Test-Harness.ps1`, including the canary regression suite and generated-current-state check.
- Independent harness judge and repeat-build checks on the pull request.
- Deterministic `.skill` and Perplexity packages from the clean merge commit.
- Progressive local install with `.5` as rollback, exact parity, then fresh Claude and Codex canaries. Cursor remains an explicit manual check.
- SURFACE consumes the immutable release through its own job when online. The mounted drive is observation-only, never a deployment channel.
- Cloud catalogues remain supervised and are not called current until their own inventory and fresh-chat behavior evidence exists.

## Release boundary

The intended follow-up is `v2026.09.13.1`. Publication and rollout are permitted by the instruction quoted above, but only after the pull request gates pass. A live behavioral failure blocks promotion and is recorded unchanged. Credential provider rotation remains a separate security action because it requires provider-side replacement and superseded-access failure proof.

## Rollback

`harness-v2026.09.12.5` remains the installed prior release. `harness-v2026.09.12.4` remains its prior immutable rollback artifact. No historical canary report is rewritten.
