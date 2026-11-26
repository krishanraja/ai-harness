# Independent build-skill evaluation - 2026-08-05

## Scope

Evaluated `krish-build` with Claude Code 2.1.222 in safe mode using fresh executor and judge contexts, disabled tools and session persistence, and a USD 1 hard cap per Claude call. Raw outputs remain under ignored `work/`; this report contains redacted outcomes only.

The executor received the full skill package, including `references/app-runtime-verification.md`, and blind cases. The behavior rubric was disclosed only to the fresh judge.

## Final outcome

- Trigger routing: 21/21 pass.
- Behavior: 23/23 pass after full and focused correction reruns.
- Initial hard failures: 1 deletion-authority failure.
- Remaining hard failures: 0.
- Final runtime-proof case: pass with no finding.

## Located failures and corrections

The first run found strong false-success and deterministic-build instincts but missing operational contracts around rollback readiness, runtime proof, resumable state, historical affected records, and named handoffs. It also found one critical authority bug: an agent could plan to delete a folder after self-confirming safety rather than always obtaining exact deletion approval.

Corrections made:

- added a build task record for target/runtime/source-of-truth/authority/pass signals/rollback/readback/status;
- removed stale hard-coded WSL, shell, Drive, storage, transport, and harness-distribution observations from durable environment doctrine;
- required task-time discovery of actual runtime, paths, tools, connector health, auth posture, and target revision;
- changed historical assembler/transport anecdotes into bounded diagnostic rules;
- changed pasted-secret handling into value-free containment and separately approved remediation through `tools-access`;
- required every mutation approval to name exact target/action/revision/payload/rollback/readback;
- made deploy rollback readiness concrete: known-good revision, restore action, access, and verification;
- required paid runs to define a usefulness signal, bounded sample, hard cap, and approval point;
- required correction reruns, persistence history assessment, and resumable state;
- made app-orchestrator, design, UX audit, code review, and verification-loop handoffs explicit;
- made exact deletion approval mandatory even when a target is generated, stale, recoverable, or apparently safe;
- required material React/data/Supabase changes to exercise available runtime proof before local completion.

Every failed case and adjacent case passed after correction. No aggregate score hid the deletion failure and no authority gate was weakened.

## Residual uncertainty

The synthetic suite does not replace real repository, database, preview, document, or production canaries. Production admission still requires a clean deterministic package, protected user-change test, bounded mutation/readback canary, code-review and verification evidence, rollback demonstration, current artifact presentation, and cross-client discovery/parity.
