# Claude Cloud and MCPMarket audit - 2026-08-05

## Scope and authority

This was a read-only inspection of the authenticated Claude Cloud skill settings and the authenticated `krish-2` MCPMarket workspace. No skill, connector, toolkit, server, toggle, upload, deletion, or permission was changed. Visible dates are inventory evidence, not proof that the content is current or canonical.

## Claude Cloud

### Inventory verdict

- 34 skills are uploaded and all 34 are enabled.
- 32 are user-authored and 2 are Anthropic-managed (`morning` and `skill-creator`).
- 16 of the 23 canonical candidates have a same-name cloud skill.
- 7 canonical candidates are absent from cloud.
- 16 enabled user-authored cloud skills are outside the canonical candidate set.
- Same-name presence does not establish parity. Cloud does not expose a complete downloadable artifact hash in this view, and several representative copies materially differ from the canonical repository.

### Canonical candidate coverage

| Canonical skill | Claude Cloud | Visible cloud date | Enablement | Finding |
|---|---|---:|---|---|
| `apify` | present | 2026-06-15 | enabled | Same-name only; parity not established |
| `build-apps-with-krish` | absent | - | - | Candidate exists only in the canonical repository |
| `content-corpus` | present | 2026-06-10 | enabled | Stale by its canonical 45-day review SLA |
| `ctrl-build` | present | 2026-08-05 | enabled | Current-looking, but cloud hash is unavailable |
| `ctrl-capture` | present | 2026-08-05 | enabled | Representative inspection shows the corrected Stage 9 workflow |
| `ctrl-check` | present | 2026-08-05 | enabled | Current-looking, but cloud hash is unavailable |
| `ctrl-compile` | present | 2026-08-05 | enabled | Current-looking, but cloud hash is unavailable |
| `ctrl-intake` | present | 2026-08-05 | enabled | Current-looking, but cloud hash is unavailable |
| `decision-ledger` | absent | - | - | Store and adapters remain intentionally inactive |
| `evidence-research` | absent | - | - | Candidate exists only in the canonical repository |
| `harness-maintainer` | absent | - | - | Candidate exists only in the canonical repository |
| `krish-build` | present | 2026-07-03 | enabled | Older than the hardened canonical copy |
| `krish-content-marketer` | present | 2026-06-11 | enabled | Near its 60-day review deadline |
| `krish-design` | present | 2026-07-03 | enabled | Older than the canonical approval/divergence protocol |
| `krish-principles` | present | 2026-07-03 | enabled | Older than the canonical rigor and dissent protocol |
| `krish-voice` | present | 2026-08-03 | enabled | Same lineage, but full artifact parity is not established |
| `mindmaker` | present | 2026-06-10 | enabled | Near its 60-day review deadline; live business reconciliation required |
| `mindmaker-os` | present | 2026-07-07 | enabled | Enabled 2,226-line monolith; the UI cannot fully render it and it embeds dynamic state and stale reconciliation claims |
| `strategy-brief` | absent | - | - | Candidate exists only in the canonical repository |
| `tools-access` | present | 2026-06-13 | enabled | Legacy credential-bearing design; sensitive remediation is deferred by user instruction |
| `ux-foundations` | present | 2026-07-03 | enabled | Same-name only; cloud hash is unavailable |
| `ux-testing-agent` | absent | - | - | Safer canonical replacement is not uploaded |
| `verification-loop` | absent | - | - | Candidate exists only in the canonical repository |

### Enabled non-canonical skills

Every item below is currently enabled, so each can compete for routing. No disposition has been applied.

| Skill | Visible date | Current classification |
|---|---:|---|
| `n8n` | 2026-05-26 | Quarantined monolith; extract only durable API mechanics |
| `instantly` | 2026-05-21 | Pending user confirmation because the related outbound motion is paused or retired |
| `krish-fleet-ops` | 2026-05-19 | Quarantined stale operational-state copy |
| `design-system-builder` | 2026-05-06 | Superseded by `krish-design` plus `build-apps-with-krish` unless a distinct workflow is demonstrated |
| `code-reviewer` | 2026-05-04 | Unprovenanced; potential narrow validator only after review |
| `strategy` | 2026-04-24 | Overlaps `krish-principles` and `strategy-brief` |
| `ux-design` | 2026-04-24 | Superseded generic UX cluster |
| `ux-concepts` | 2026-04-24 | Superseded generic UX cluster |
| `ux-toolkit` | 2026-04-24 | Superseded generic UX cluster |
| `design` | 2026-04-24 | Superseded generic UX/design cluster |
| `ux` | 2026-04-24 | Superseded generic UX cluster |
| `ux-principles` | 2026-04-24 | Superseded generic UX cluster |
| `data-pipeline-architect` | 2026-04-24 | Possible planning route; provenance and collision review required |
| `data-pipeline` | 2026-04-24 | Possible implementation route; provenance and collision review required |
| `krish-outbound` | 2026-03-20 | Pending user confirmation because its current distinct role is unclear |
| `ab-test-plan` | 2026-03-02 | Generic overlap now covered by `ux-foundations`; retire only with approval |

The Anthropic-managed `morning` and `skill-creator` skills are also enabled. `skill-creator` has a clear provider-managed role. `morning` should remain only if Krish names a durable morning workflow that is not already owned by Mindmaker OS.

## MCPMarket workspace

### Deployed state

- MCP servers: 0.
- Skills: 1 draft/unpublished skill, `OS Memory Search`; it has 0 tools, 0 toolkits, and placeholder usage text.
- Toolkits: 1 enabled private toolkit, `My Toolkit`; it has 0 tools.

The workspace therefore supplies no current runtime capability. No object was edited or removed.

### Catalog findings

Official provenance is useful but not sufficient: several publishers list duplicate skill names or broad generic material. Marketplace assets should enter quarantine, then pass provenance, overlap, authority, trigger, behavior, and canary gates before activation.

Highest-value capability lanes for Mindmaker OS:

1. **Observability and proof:** PostHog, Sentry, and Langfuse connectors or narrowly scoped references. These can strengthen `verification-loop` across product behavior, exceptions, and LLM traces without becoming three always-on doctrine skills.
2. **Design-to-runtime handoff:** Figma connector plus selected Design-to-Code source material. Route through `build-apps-with-krish`; do not activate a generic design skill beside `krish-design`.
3. **Deployment mechanics:** Vercel and Cloudflare provider material as narrow tool references under `krish-build`. Avoid duplicating the cross-cutting build doctrine.
4. **Operating data:** Supabase, Google Drive, and Apify connectors for live retrieval. Keep business state out of skill prose.
5. **Security validation:** Semgrep and Sentry material as inputs to a future narrow security validator or to `verification-loop`, not as broad auto-fixing agents.
6. **Messaging operations:** Gmail or Resend only when a named current workflow and send-approval boundary exists.

Catalog items worth quarantined evaluation include Anthropic's skill creator and instruction optimizer material, Figma Design-to-Code, PostHog AI observability and session-replay material, Sentry agent-instruction and security-review material, Vercel deployment guidance, Cloudflare Workers/Agents/Sandbox guidance, Apify competitive-intelligence material, Langfuse observability, Resend email best practices, and Semgrep security guidance.

Do not bulk-install the Anthropic, Firecrawl, Figma, PostHog, or Sentry catalogs. Their useful fragments should improve an owned canonical route or justify a new skill only after the seven-part missing-skill test passes.

## Reconciliation implication

The safest sequence is canonical commit -> deterministic package -> one local canary -> held-out behavior evidence -> explicit cloud activation/replacement decision -> staged rollout with rollback evidence. Uploading the 23 candidates into the current all-enabled cloud library would increase collision risk and would not constitute alignment.
