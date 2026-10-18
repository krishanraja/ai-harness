# Subscription-independent automation

The brain remains the source of repository learning. These adapters change how
interpretation runs, not how evidence becomes accepted knowledge. Iterations
retain earlier goals, experiments retain their conditions, and generated
CLAUDE.md guidance stays within the existing context budgets.

## Current implementation boundaries

PR #136 separated deterministic documentation checks from subscription access.
Push validation and dry runs are read-only and do not start a model or writer.
The existing scheduled documentation writer remains a legacy route until its
central replacement and actual enabled callers have passed their cutover gates.

The additional API and observer code is prepared with disabled defaults.
Source code, fixture passes and a manual run do not prove activation, private
source access, successful scheduled delivery or long-term effectiveness.

| Route | Current credential/runtime | Prepared replacement | Activation/proof still required |
| --- | --- | --- | --- |
| Validation, packaging, release registration | GitHub runners and existing repository tokens | Same deterministic paths | Existing required CI and release gates |
| Observation, intake, consolidation, reconciliation, accepted guide delivery | Existing GitHub/fleet credentials | Same brain and receipt protocols | Preserve existing source and consumer proofs |
| Harness proposal drafting | Subscription OAuth action | `draft-harness-changes.mjs` via shared API | Approved accounting policy, cutover, actual scheduled proposal/no-work proof |
| Docs push checks and dry runs | Read-only GitHub job | Already independent of model access | PR #136 CI verifies the mode boundaries |
| Scheduled documentation drafting | Each enabled caller's OAuth action | Central bounded draft plus separately guarded publisher | Capture live callers, privacy and repository gates, canary, normal schedule, exact old-schedule cutover |
| Judge | Direct API key | Same measured protocol through shared API boundary | Approved accounting policy; real measured review remains required |
| Repository learning proposals | Existing API action | `repository-api-drafts.mjs` | Approved accounting policy and scheduled downstream proof |
| Fresh-context fixtures | Existing API action | `repository-api-context.mjs` with observed allowlisted reads | Approved accounting policy; labelled API fixture, never native client discovery |
| Native title-history replay | Direct API and authorized pinned source read | Same comparison through shared API boundary | Approved accounting policy; private prose remains in memory |
| Local session interpretation | Local `claude -p` | Explicit `--extractor api`, no fallback | Private execution/source approval and verified preflight; no cursor advancement on failure |
| Two required cloud accounts | Existing source-specific session access | Supported collector/export feeding the existing durable intake | Independently verified account identities, enumeration windows, pagination and real receipts |
| Local collection and installed-client probes | PC files/native clients | Explicitly local adapters | Their absence cannot stop central processing or certify API parity |
| Independent central observation | New manual-only GitHub observer | `harness-watchdog.yml` and one runtime manifest | Approved hourly activation, normal scheduled run, retained report |
| Observation outside GitHub | Existing Control Center owner | Same check shared with existing six-hour health sweep | Private change review, deployed readback and actual scheduled evidence |
| Weekly digest | Existing Control Center workbench route | Durable pending state, exact retry and authoritative readback | Existing credential; no new destination |
| Later actionable incidents | Disabled notification policy | Same route with stable occurrence identities | Separate named activation; no watcher-to-notification wiring is active |

`config/harness-jobs.json` is the observer's runtime manifest. Required account
slots with no independently verified binding remain blocked. A healthy PC or
one healthy account cannot stand in for missing required source coverage.

## Shared API enforcement

`scripts/harness-api.mjs` is the only prepared paid request boundary. It reserves
maximum liability before every request and keeps uncertain charges across
retries, restarts and London month rollover. Concurrent workers use non-forced
GitHub ref updates; a stale worker cannot apply a different active policy.
Prices are checked before each attempt and again after reservation, immediately
before transport. No prompt, source excerpt, provider prose or secret is written
to accounting.

`config/inference-policy.json` is disabled, unpriced and has no approved allowance.
USD 50/month, including USD 10 reserved for required reviews, is a proposal only.
The implementation reserves an entire approved model input window rather than
trusting an unverified tokenizer estimate. The cadence must fit the approved
ceiling; do not reduce review quality to conceal exhaustion. Provider billing
and unrelated shared-key use are not guaranteed by this application ledger.

After exact policy, prices and setup authority are approved, initialize the
dedicated `harness/inference-budget` ref with an existing empty
`state/inference-budget.jsonl` and `state/inference-policy.json` containing the
approved policy. The reader computes its canonical policy seal at the same ref
revision as the events. A missing file, mismatched seal or unavailable ledger
refuses a paid call; it never resets the balance. Use the gateway's
`inferencePolicySeal` function when comparing approved policy revisions.

The `HARNESS_INFERENCE_MODE` repository variable accepts only empty/`legacy` or
`bounded-api`. Every paid job validates it before selecting a route. An unknown
value or bounded-route failure cannot restore subscription inference. The
configuration must cover every concurrently enabled paid consumer before the
new allowance is described as active. Do not distribute the central API key to
fleet callers to work around reusable workflow secret isolation.

Krish enters any needed `ANTHROPIC_API_KEY` and narrowly scoped
`HARNESS_BUDGET_TOKEN` in the appropriate Actions secret box, never in a prompt:

- https://github.com/krishanraja/ai-harness/settings/secrets/actions
- https://github.com/krishanraja/control-center/settings/secrets/actions

Existing `FLEET_TOKEN` is confined to deterministic source preparation and guarded
publication. The model receives source data and structured output schemas, not
repository write tools or credentials. No credential is rotated or revoked by
these changes.

## Source and privacy gates

An API inference key does not grant access to either account's chat history.
No supported Claude history or scheduled-trigger tools are exposed in the
current environment. The account migration therefore remains unverified until
the source interfaces themselves can be exercised.

Prefer already-authorized distilled episodes through the existing intake.
Private excerpts must not enter public dispatches, branches, artifacts, logs or
PRs. The optional private extractor uses the disabled
`config/session-extraction.json` contract: exact execution repository/revision,
verified audience, named source identities, bounded redacted input and approved
retention/provider settings. Unsupported retention/provider preflight remains a
blocker. Do not fill review hashes with invented observations.

The docs rollout similarly starts disabled and uses an exact captured allowlist.
Private targets require an approved private execution context; a public runner
does not become private because its output is quiet. Coupled truth/source edits
outside the allowed documentation paths are blocked for the owning workflow.

## Verification and rollback

CI exercises budget races, missing state, policy/price changes, uncertainty,
malformed replies, scope escapes, accumulated intent, source receipts and
delivery retries with synthetic providers. No fixture is a paid runtime result.
Standard and Perplexity packages keep their existing repeat-build checks.

Cut over one reviewed route at a time after a real bounded canary. Observe its
normal scheduled cycle and authoritative downstream output before retiring the
old schedule. Weekly jobs remain pending until their normal tick. Preserve
known-good revisions, receipt/cursor history, unresolved monetary liability and
notification state. Never silently fall back to OAuth, erase the ledger or
advance a source cursor to make a blocked route look healthy.
