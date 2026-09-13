# Representative canary follow-up

Status: approved correction after the blocked `v2026.09.13.3` rollout.

## What the repaired index exposed

`v2026.09.13.3` proved the shared-file index repair and the two original routing
changes: both clients saw the real core skill names, the archived n8n liveness
case remained out of `n8n-operator`, and adversarial visual-design ownership
routed to `krish-design`.

It also showed that choosing the shortest and longest positive prompt is not a
sound live-canary policy. It selected phase-ambiguous cases where another owner
must act first, such as `take-the-brief`, or where an adjacent specialist owns
the immediate QA action. Those are useful held-out collision cases, but poor
release-health sentinels.

The run also found real discovery boundaries worth tightening: pure social
messages could load `krish-principles`; explicit do-not-interview language could
still load `take-the-brief`; a routine visual repair had contradictory test and
skill ownership; and an Instantly action inside n8n could omit the provider
operator.

## Correction

- Pin two representative, reviewed positive canaries for each shared core skill
  while preserving the existing fallback heuristic for uncurated suites.
- Keep all unpinned negative and collision ordering unchanged.
- Add regression assertions for the exact pinned cases and the external-route
  observability case.
- Front-load the social, interview, strategy, verification, routine-visual, and
  Instantly provider boundaries in client discovery metadata.
- Align the routine visual-repair eval with the doctrine: `krish-design`
  classifies it and refuses needless reapproval; build and verification remain
  downstream producers.

## Acceptance

- Regression and full harness validation pass.
- Fresh Claude and Codex reports contain no failed canary verdict.
- Exact release parity is proven independently on every local surface.
- Unsupported external task routing and Cursor UI-only invocation remain
  explicit partial/manual-required evidence.

User authority: Krish approved closing all audited gaps and continuing with the
sharper, less-fragile correction path on 2026-09-13.
