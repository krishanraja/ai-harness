# Routing and canary repair proposal, 2026-09-12

Status: accepted by Krish for implementation and pending post-release verification.

Asked by: Krish Raja, interactive session on 2026-09-12: "close the gaps" and "i approve all of this" in response to the audited harness remediation and rollout plan.

## Decision and scope

Apply a class 3 routing fix plus canary-instrument repair. The accepted change is limited to:

- `content-corpus`, `design-intelligence-search`, `mindmake-os`, and `mindmake` routing metadata;
- `scripts/Invoke-HarnessSync.ps1`, `scripts/canaries.mjs`, and their regression checks;
- synthetic canary citation evidence produced by the authenticated v2026.09.12.3 run and its explicit store lifecycle in `brain/stores.yaml`;
- release registry and explanatory documentation required to publish and verify v2026.09.12.4.

The four long descriptions in `krish-design`, `build-apps-with-krish`, `ctrl-intake`, and `krish-voice` are explicitly excluded. A shorter rewrite was already rejected in `state/routing-description-eval-2026-09-12.md`, and PR 42's judge correctly found that a description-budget finding did not prove the removed phrases were non-load-bearing. Their prior wording and review dates remain live.

## Evidence

- `state/canaries/v2026.09.12.3-claude-code-user.json` records a generic design request loading the manual-only design search and a warm lead-email context request missing `content-corpus`.
- `state/canaries/v2026.09.12.3-codex-current.json` records video launcher collisions, Mindmake versus mind/make OS collisions, and the manual-only skill being absent from the model-routable catalog.
- The same run reached `Invoke-HarnessSync.ps1:1117` and failed because an unmeasured surface record has `surface`, not `id`.
- Anthropic's current Claude Code skill documentation, retrieved 2026-09-12 from `https://code.claude.com/docs/en/skills`, defines `disable-model-invocation: true` for a skill that remains user-invocable but must not be selected by the model.
- `scripts/canaries.mjs` detected a changed aggregate but returned no changed skills, so modified non-tier-one skills were not guaranteed a place in the next release sheet.

## Supersession map

The previous routing metadata remains recoverable at commit `abb0d4d` and release `harness-v2026.09.12.3`. These are explicit successors, not silent in-place reinterpretations:

| Artifact | Previous source | Successor reason |
|---|---|---|
| `skills/content-corpus/SKILL.md` description | `abb0d4d` | Narrowly name prior-source selection for a warm lead email while preserving `krish-content-marketer` as conversion owner and `krish-voice` as prose owner. |
| `skills/design-intelligence-search/SKILL.md` description and OpenAI prompt | `abb0d4d` | Preserve agent delegation and require its existing `OWNER` plus `SEARCH NEED` packet at the routing boundary. Claude's user-only switch was rejected because it would also block the intended delegation. |
| `skills/mindmake-os/SKILL.md` description | `abb0d4d` | Route live fleet and architecture reconciliation, while making inventory-first and exact deletion approval visible before the body loads. |
| `skills/mindmake/SKILL.md` description | `abb0d4d` | Stop a brand-word collision from loading commercial context for internal runtime state. |
| `skills/video-engine/SKILL.md` description | `abb0d4d` | No wording change is retained after review. The exact-match contract and in-skill rejection behavior remain as they were. |
| canary selector and run recorder | `abb0d4d` | Record unmeasured surfaces by their real field and require every declared changed skill on the release sheet. |

## Evidence classification

`brain/usage.jsonl` is a citation-coverage ledger, not evidence of real customer or operator usage. Rows produced by canaries are synthetic evaluation traffic and must say so explicitly. They may prove that a live client retrieved a rule during a frozen test; they must never be used as proof that the rule appeared in real-world work, improved an outcome, or paid. Real-world observations continue through the governed observation and proposal path.

## Alternatives considered

- Treat all raw `wrong-skill` labels as failures. Rejected because negative collision cases often require a neighbouring skill; the report verdict already distinguishes those.
- Make the manual-only design search implicitly discoverable on Codex. Rejected because that weakens containment. Codex CLI cannot automate its UI-only explicit invocation, so that surface must remain honestly unmeasured for the explicit path.
- Shorten every over-budget description. Rejected because the prior comparison did not prove removed phrases were unused and the judge identified lost triggers and review dates.
- Count reading `video-engine/SKILL.md` as a successful launch. Rejected. The current canary retains the collision as a failure until a client-level exact dispatcher or stronger evidence supports another contract.

## Expected effect and risk

Expected: changed skills cannot escape release canaries; the manual design search requires its existing delegation packet; content and OS collisions improve; Cursor remains explicitly manual for behavioral evidence; the run record completes with `partial` when Cursor is unmeasured. The Codex video-engine collisions remain recorded failures until a client-level control can preserve the positive route without contradiction.

If wrong: a legitimate design delegation may become inaccessible in Claude, commercial work may under-route to `mindmake`, or the content split may load too many skills. The first detector is the same frozen post-install canary sheet plus a manual Claude `/design-intelligence-search` check. Roll back all affected surfaces to immutable v2026.09.12.3 if a load-bearing positive regresses.

## Validation and operating owner

- Focused tests: `Test-Harness.ps1`, `test-canaries.mjs`, two deterministic release builds, and installer self-test.
- Post-install: fresh Claude and Codex canaries for every `changed_skills` entry; Cursor recorded as manual-required until checked in the client.
- Cadence: the LORIMER scheduled job runs daily, but live behavioral canaries run on a new release or a reported routing incident, not on every no-op heartbeat.
- Operator: the LORIMER harness job or any authenticated maintainer can run the headless Claude and Codex canaries. Krish is required only for client UI checks, cloud catalogue uploads, and provider approval walls.
- Privacy: reports store prompts, skill names, outcomes, and value-free notes only. They store no OAuth token, API key, browser profile, private corpus, or provider response body.
- Rollback: immutable `harness-v2026.09.12.3` plus each surface's deployment backup directory.

## Acceptance boundary

Krish's instruction authorises this proposal and its governed release. It does not waive action-time approval for provider credential regeneration, destructive deletion, public publication, or spend. A green canary is behavioral evidence only; local parity, cloud upload readback, and old-key failure proof are separate completion gates.
