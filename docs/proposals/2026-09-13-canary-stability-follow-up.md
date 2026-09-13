# Canary stability follow-up, 2026-09-13

Status: approved within Krish Raja's 2026-09-13 instruction to execute the audited correction plan, close the observed gaps, and grade the resulting harness.

## Evidence

The immutable `v2026.09.13.1` release installed with exact parity on LORIMER and fixed the design-search reachability, mind/make OS architecture collision, and external-route measurement defects. Its full live report still failed four cases. Targeted fresh-session repetition separated them:

- `app-trigger-024` routed to `krish-design` on Claude three of three times. The routing contract assigns isolated design work directly to that owner, so the eval was wrong.
- `decision-trigger-019` reached `decision-ledger` once and only global doctrine twice on Codex. The defensive historical-rewrite trigger is real but sat at the end of the description.
- `corpus-trigger-007` loaded both `content-corpus` and the correct `krish-content-marketer` owner twice, and only global strategy once. The recorder labelled any target read as ownership and discarded the neighboring reads.
- `design-intel-trigger-011` routed to `krish-design` three of three times on Codex. Its single full-sheet miss was stochastic variance, not a reason to broaden another description.

## Decision

Correct the app eval, front-load the decision ledger's defensive trigger, distinguish a Codex exclusion-guard read followed by the expected owner from target ownership, and repeat only an apparent mismatch twice. Record the two-of-three majority and retain every attempt. Do not weaken a route based on one semantic sample and do not erase minority evidence.

## Release and rollback

The intended follow-up is `v2026.09.13.2`, with `v2026.09.13.1` as immediate rollback. The same independent PR gates, deterministic publication, progressive local install, exact parity, and fresh canaries apply. Cloud uploads and credential rotation remain separately evidenced actions.
