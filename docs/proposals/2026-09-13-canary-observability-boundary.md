# Canary observability boundary

Status: approved final correction after the blocked `v2026.09.13.4` rollout.

## Evidence

The `.4` run proved the representative strategy sentinels, social exclusions,
briefing override, nested Instantly action, and existing Tier 1 routes. It also
made three remaining measurement boundaries explicit:

- `krish-principles` is directly imported by every rendered root adapter. A
  Codex read of that file is therefore not an implicit routing event and cannot
  be expected to disappear for social messages.
- The second verification sentinel asked for release-manifest comparison, which
  Claude correctly gave first to `harness-maintainer`; the verification owner
  is downstream.
- Uncurated suites could still select adversarial adjacent-owner collisions as
  ordinary positive release sentinels. This produced repeated false release
  failures for CTRL Check. A UX experimentation prompt also proved too broad to
  be a stable UX-foundations sentinel.

The same run found two real exclusion misses on Codex: future-plan language
could wake `verification-loop`, and hypothetical Instantly wording could wake
`instantly-operator` after its positive gate was strengthened.

## Correction

- Verify the always-imported principles layer statically in adapters, as the
  validator already does, and remove it from invocation canaries.
- Pin an owner-clear rerun-after-fix verification sentinel.
- Prefer ordinary positive cases over adversarial collisions for release
  canaries; retain every collision in held-out evaluation.
- Pin primary-standard UX sentinels rather than a generic A/B test.
- Put the future-plan and hypothetical-provider exclusions before their positive
  discovery gates.

## Acceptance

- Full regression, adapter, secret, and deterministic release checks pass.
- Fresh Claude and Codex live reports have no failed verdict.
- The release sheet has no `krish-principles` invocation cases, while every root
  adapter continues to import it and is validated to do so.
- Cursor remains manual-required and external task routing remains partial.

User authority: Krish approved closing the audited gaps using the sharper,
less-fragile correction path on 2026-09-13.
