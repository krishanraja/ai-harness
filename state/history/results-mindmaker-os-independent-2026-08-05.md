# Independent Mindmaker OS router evaluation - 2026-08-05

## Scope

Evaluated `mindmaker-os` with Claude Code 2.1.222 in safe mode using fresh executor and judge contexts, disabled tools and session persistence, and a USD 1 hard cap per Claude call. Raw outputs remain under ignored `work/`; this report contains redacted outcomes only.

The executor received the complete private skill and blind cases. The behavior rubric was disclosed only to the fresh judge. One full behavior rerun returned malformed JSON and was rejected; the final result is the union of two complete, disjoint fresh batches covering all 23 cases.

## Baseline

- Trigger routing: 21/21 pass.
- Behavior: 1/23 pass.
- Hard failures: 3.

The old 40-line router correctly avoided embedding current counts but treated source authority too coarsely. It did not reliably handle pagination, tenant identity, source/build/deploy/runtime separation, concept-level closure, safe send testing, stale-copy preservation, self-healing recurrence, or explicit owner handoffs.

## Final outcome

- Trigger routing: 21/21 pass.
- Behavior: 23/23 pass across two complete disjoint batches.
- Remaining hard failures: 0.

## Corrections

- introduced claim-specific authorities for durable architecture, Supabase relational state, n8n runtime, VPS/OpenClaw runtime, repository code, build artifact, deployment provider, rendered behavior, runbooks, harness parity, commercial truth, and authenticated identity;
- made architecture snapshots and `Last reconciled` labels historical claims rather than current runtime proof;
- added an OS claim record with exact target, authority, scope, revision/retrieval, status, conflict, and expiry;
- required complete pagination, stable-identifier deduplication, filters, tenant, page counts, query scope, and retrieval time for live APIs;
- preserved the full `source commit -> built artifact -> deployed revision -> observed runtime` chain;
- added a durable reconciliation record with per-copy provenance/hash, source-specific correction order, authority, recovery, and verification;
- prohibited mtime, filename, freshness labels, and document instructions from serving as content parity or deletion authority;
- made concept closure inspect exact identity, `concept_decisions`, `concept_id`, authoritative close path, audit history, dependent views, generators, propagation, stale reads, and intentional reopen semantics;
- made self-healing proof trace the full fingerprint, detection, correction, owner, implementation, deployment, original reproduction, and recurrence-monitor chain;
- required exact production cron, concept-write, external-send, credential, and stale-copy gates;
- routed commercial truth to `mindmaker`, runtime implementation to `krish-build`, rendered reproduction to `ux-testing-agent`, visual response to `krish-design`, access identity to `tools-access`, harness parity to `harness-maintainer`, and closure evidence to `verification-loop`.

## Architecture conflicts discovered

The current Control Center architecture document still describes `TOOLS.md` as a credential registry and prescribes monolithic skill copies plus deletion of any divergent architecture file. Those instructions conflict with the canonical no-secret skill contract, thin-router architecture, recovery-first reconciliation, and exact deletion authority. The candidate router explicitly refuses those unsafe paths. No Control Center file or copy was changed or deleted during this evaluation.

## Residual uncertainty

Synthetic cases do not prove current OS state. Production admission still requires live, non-secret canaries against the intended Supabase project, n8n tenant with pagination, VPS/OpenClaw runtime, Control Center repository and deployed revision, rendered app, concept-closure path, one self-healing recurrence, and cross-client discovery/parity. The architecture conflicts require a separately reviewed Control Center documentation change and rollout; they must not be solved by copying the monolith back into skills.
