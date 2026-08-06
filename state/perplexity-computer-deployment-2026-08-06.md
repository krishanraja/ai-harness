# Perplexity Computer deployment evidence — 2026-08-06

## Release identity

- Canonical repository: private `krishanraja/ai-harness`
- Canonical source commit used for the transport build: `03004a84e0155c6cb92b8a84371908ec138d5430`
- Underlying 26-skill release: `candidate-5754854`
- Surface: Krish Raja's Perplexity Computer account
- Transport: deterministic ZIP with `SKILL.md` at the archive root
- Package count: 26
- Validation: `scripts/Test-Harness.ps1` passed; no high-confidence secrets
- Repeat transport build: 26/26 package names and SHA-256 values identical
- Retained manifest: `C:\Users\krish\.scratch\perplexity-harness\candidate-03004a8-a\perplexity-package-manifest.json`

## Pre-deployment inventory

`My skills` contained zero user-created skills. Perplexity example skills were classified as provider-managed and were not changed or treated as canonical duplicates.

## Canary

`take-the-brief` was uploaded first and enabled. In a fresh Perplexity Computer session, an explicit request to transfer ambiguous end-to-end ownership caused Computer to read `skills/user/take-the-brief/references/questions.md`, ask one high-signal question, and stop awaiting the answer. Discovery, bundled-reference loading, positive routing, one-question behavior, and the stop condition therefore passed on this surface.

## Final readback

The `My skills` inventory contained exactly 26 enabled canonical names:

`apify`, `build-apps-with-krish`, `content-corpus`, `ctrl-build`, `ctrl-capture`, `ctrl-check`, `ctrl-compile`, `ctrl-intake`, `decision-ledger`, `evidence-research`, `harness-maintainer`, `instantly-operator`, `krish-build`, `krish-content-marketer`, `krish-design`, `krish-principles`, `krish-voice`, `mindmaker`, `mindmaker-os`, `n8n-operator`, `strategy-brief`, `take-the-brief`, `tools-access`, `ux-foundations`, `ux-testing-agent`, and `verification-loop`.

Readback classification: 26 present and enabled; zero missing; zero extra user-managed skills; zero duplicate user-managed names. Provider example skills were excluded from personalized parity.

## Local-client interpretation and residual uncertainty

Perplexity Computer skills are account-level. The signed-in Windows client consumes the same account surface; there is no separate user skill directory to populate or declare canonical. A client refresh or restart may be required before a previously open desktop window displays the newest account state.

Perplexity exposes no downloadable installed-package hash. Exact byte parity inside the cloud is therefore not claimed. Evidence consists of the clean canonical source, repeat-identical retained transport artifacts, visible exact enabled-name readback, and the live routing/reference/behavior canary. GitHub remains the only editable canonical source.
