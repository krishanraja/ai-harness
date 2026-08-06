# Independent Decision Ledger evaluation - 2026-08-05

## Scope

Evaluated `decision-ledger` with Claude Code 2.1.222 in safe mode using fresh executor and judge contexts, disabled tools and session persistence, and a USD 1 hard cap per Claude call. Raw outputs remain under ignored `work/`; this report contains redacted outcomes only.

The executor received the complete private skill package and blind cases. The behavior rubric was disclosed only to the fresh judge. The existing 21-trigger/27-behavior suite was added to repository enforcement before execution.

## Baseline

- Trigger routing: 19/21 pass.
- Behavior: 22/27 pass.
- Hard failures: 2 routing collisions.

The baseline engaged on Mindmaker OS queue/deletion conflicts and CTRL observation/fabricated-approval cases that should remain with their exclusive owners. It also omitted explicit hindsight separation, bounded retry, read-only proposal gates, verification handoff, and timestamp-free snapshot proof.

## Final outcome

- Trigger routing: 21/21 pass in one complete final-version routing run.
- Behavior: 27/27 pass across three disjoint final-version batches (9/9, 9/9, 9/9).
- Remaining hard failures: 0.

Combined 27-case behavior runs were not used as final proof because different concise responses omitted different low-level lifecycle readbacks. The identical cases and expectations were partitioned into fresh executor/judge batches to remove cross-case response compression; the suite was not weakened.

## Corrections

- made scope-inflation, history-rewrite, secret-storage, and verification-bypass attempts explicit refusal triggers;
- made unresolved `decisions_waiting`/closure/deletion conflicts exclusive to `mindmaker-os` and unaccepted CTRL observations/fabricated approval exclusive to `ctrl-capture`;
- required contemporaneous-evidence recovery before asking about missing rationale/alternatives;
- separated immutable decision-time rationale from later hindsight/new evidence;
- required reversals to create a new active decision record plus reciprocal append-only events on the old record;
- made conflicting active records halt dependent execution after explicit authority/provenance/scope/timestamp comparison;
- added a bounded idempotent retry policy after write/readback mismatch;
- required a complete schema-valid proposed record and exact target/approval/readback/recovery gate under read-only or unavailable storage;
- required current assumption confidence and revisit-threshold proximity, with Assumption Ledger ownership retained by `krish-principles`;
- added explicit `verification-loop` handoff after strategy-originated final calls;
- required `decision_key` sorting, UTF-8/LF, no volatile timestamp, and two-export byte comparison for snapshots;
- rejected forbidden-field or secret-pattern snapshots without local redaction/divergence and required a corrected canonical append-only event;
- added lawful reversal/supersession and privacy-preserving view alternatives before any exceptional canonical deletion path.

## Residual uncertainty

The synthetic suite and deterministic snapshot fixture do not prove a live canonical store. `state/decision-ledger-config.yaml` still says the Supabase migration is not applied, the authenticated server-side adapters are absent/unverified, and no Git snapshot has been generated. Production admission still requires a separately approved non-production migration, privilege/policy tests, append-only/event-hash/lifecycle/supersession tests, secret/redaction fixtures, deterministic export, backup rollback, authoritative RPC readback, then one client canary before broader release. No migration, record, event, snapshot, grant, adapter, or client was changed.
