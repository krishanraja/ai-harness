# Candidate 333f735 reconciliation and local deployment evidence - 2026-08-20

## Scope

Promote Krish's confirmed 2026-08-11 Mindmaker content refocus from Claude local into the governed harness; retire stale paid Maven cohort, workshop, and alumni doctrine; and replace one-way synchronization with inbound discovery plus a hard no-clobber installer gate.

The large Mindmaker OS architecture document remains deliberately deferred until Krish updates it. No `mindmaker-os` drift was overwritten.

## Reconciliation decision

- Source candidate: Claude local `content-corpus`.
- Observed pre-merge directory SHA-256: `265448C691C48A187C81DCA7D6DF00DF18DCC1D1B3736E38179361D53CBB79AF`.
- Decision: `merge-into-canonical`.
- Approver: Krish Raja.
- Confirmed doctrine: Mindmaker Live is the one content venture; Paid and Built are its two commissioned formats; Signal & Noise is a distribution/discussion channel; Make Your Mind Up is the CTRL lead magnet/URL; Maven carries free Lightning Lessons only; the paid cohort/workshop/alumni ladder is retired; the dry, dark, tongue-in-cheek register remains bounded by kindness and evidence rigour.
- Merge additions: current commercial canon, explicit stale-surface conflict handling, freshness metadata, and updated trigger/routing/behavior regressions.
- Release-bound reconciliation record: `C:\Users\krish\.scratch\claude-content-corpus-reconciliation-333f735.json`.

## Candidate identity

- Release ID: `333f735`.
- Clean source commit: `333f73549887d5b07860709c6bf81ed5a7689432`.
- Manifest: `C:\Users\krish\.scratch\ai-harness-release-333f735-a\release-333f735.json`.
- Manifest SHA-256: `B2A390AFBF61B8A59608E95B352CFB27A6061767F27DD9DF923628C751B431E9`.
- Transport artifact-set SHA-256: `811E017C8F0E423738BF7FA113FC5B1DAED536A55646F57D84CD1C859E353EAE` over sorted `filename + NUL + SHA-256` records for all 54 archives.
- Repeated build: all 27 standard `.skill` archives and all 27 Perplexity root-layout ZIPs were byte-identical across two clean builds.

Changed skill directory hashes:

| Skill | Directory SHA-256 | Standard package SHA-256 | Perplexity package SHA-256 |
|---|---|---|---|
| `content-corpus` | `601E1E97442B5C4BC95465202EAC2DD7B68491A5E55D661828335F8E57BB7AC0` | `098959DCD80B1FB65380A0E17522A6DE857BA710749919F4067F44F1A9E779AC` | `5089381520774401CD493FE02A782DD6EBA1AFAF84D17B69E3F8ED0E40E6D08F` |
| `harness-maintainer` | `DEAE5034DBD8A47A2607AF2937E7E28372A7713AE3F8AE4481E9446B06ECA1A8` | `255C9FA205597C4FC3E1BEECBA885C6F59E1704CF1EE79835FB12B37E0D61FD5` | `2DBAE22BE30599C732AD95463F6652E4810C09A9F4513927BA0BAF01A1AA504F` |
| `krish-voice` | `238DDC12DD1311C86FD4270336EEBE7DB3EDDD317279DF099AF385F4906810E6` | `FEB4C0BD57285E2231BC6A4A42351AADD998B29EDA5FF265719C530E85A4ACA6` | `3C621C90B13F22EA07819FCB9D107ECC03505D733F1568689C0983C519EEE46E` |
| `mindmaker` | `FB24FD42A4D8EC85FD5D022BFE1931182C4F114C3E127FAAFBC386C1C4E357C1` | `3E84963E797D3F291F763202ADA04755C481E04FF579AB9A659C312C147A0981` | `E698D8C1CD2853CCE8CE6DC54580687FB85B9249E50E23A60C0F7B83CDEA62EC` |

## Gate results

- Full harness validation: passed for 27 skills and three adapters; no high-confidence secrets.
- Installer self-test: passed portable root package, leaf preservation, plan-only, add, exact parity, unknown-drift refusal, release-bound reconciliation, replacement, rollback, and backup preservation.
- Deterministic packaging: 54/54 transport archives byte-identical across two builds.
- Diff hygiene: `git diff --check` passed.

## Local deployment

The four changed skills were installed from verified packages after the Cursor canary reached 4/4 exact:

- Cursor record: `C:\Users\krish\.cursor\skills.harness-backups\cursor\333f735-20260820T211937Z-569e32a4\deployment-record.json`.
- Claude local record: `C:\Users\krish\.claude\skills.harness-backups\claude-local\333f735-20260820T212001Z-5cd9ebef\deployment-record.json`.
- Codex record: `C:\Users\krish\.codex\skills.harness-backups\codex-local\333f735-20260820T212001Z-689a98f7\deployment-record.json`.

Post-install full-release plans:

- Codex: 27 exact, zero unreconciled.
- Cursor: 26 exact; `mindmaker-os` remains one preserved unreconciled drift.
- Claude local: 26 exact; `mindmaker-os` remains one preserved unreconciled drift.

The invalid full-manual `mindmaker-os` copies were not replaced, promoted, or deleted. The Claude-local extra `ui-ux-pro-max` was not changed.

## Recurring monitor

The existing automation ID `weekly-ai-harness-freshness-audit` was updated in place because a thread supports one active heartbeat. It now runs daily at 08:30 and combines:

1. a daily read-only inbound-change sentinel; and
2. the full deep reconciliation/freshness/upstream/mobile-web/resource-packaging audit on Mondays or immediately when the sentinel finds novel content, a safety/collision issue, or unexplained regression.

Its stored prompt was read back and contains the no-canonical-assumption rule, deployment-ancestry comparison, portable-resource and paired-leaf edge cases, `mindmaker-os` manual quarantine rule, and audit-and-stage-only authority.

## Remaining approval boundaries

- Candidate source has not yet been tagged as an immutable GitHub Release.
- Claude Cloud and Perplexity Computer still require supervised replacement of the four named skills from their exact transport packages and fresh-task readback.
- No cloud skill was uploaded, replaced, enabled, disabled, or deleted in this reconciliation step.
- The deferred Mindmaker OS architecture and local `mindmaker-os` divergence require a separate decision after Krish updates the architecture document.
