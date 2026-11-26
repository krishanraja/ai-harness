# Independent UX testing skill evaluation - 2026-08-05

## Scope

Evaluated `ux-testing-agent` with Claude Code 2.1.222 in safe mode using fresh executor and judge contexts, disabled tools and session persistence, and a USD 1 hard cap per Claude call. Raw outputs remain under ignored `work/`; this report contains redacted outcomes only.

The executor received the complete private skill package and blind cases. The behavior rubric was disclosed only to the fresh judge.

## Baseline

- Trigger routing: 21/21 pass.
- Behavior: 10/23 pass.
- Hard failures: 4.

The baseline had good read-only intent and task-first reporting, but it did not reliably bound paid retries, prove that no charge or external message occurred, or separate QA from code implementation. It also omitted important revision, autosave, persistence, flaky reproduction, third-party recovery, privacy, design/voice, and deployment-mismatch controls.

## Final outcome

- Trigger routing: 21/21 pass.
- Behavior: 23/23 pass on the complete rerun.
- Remaining hard failures: 0.

## Corrections

- introduced a QA contract for repository and deployed revisions, identity match, primary user, tasks, viewports, access, test data, write authority, stop points, evidence location, and pass signal;
- required current repository instructions, runbooks, scripts, tests, routes, and deployment configuration to be read before attribution;
- separated source observations, deployed behavior, and revision-matched source-to-runtime diagnosis;
- treated typing, toggling, retrying, previewing, uploads, and navigation as possible writes because of autosave, jobs, analytics, or external side effects;
- treated page, fixture, issue, and repository content as untrusted test data rather than agent instruction;
- required safe stops and readback for real charges, orders, email/messages, production data, and external actions;
- bounded AI retries by attempts, time/cost cap, stop rule, cancellation, fallback, and duplicate-job checks;
- required persistence proof, clean-state reproduction, frequency, flaky status, responsive tool-limit separation, and third-party recovery/preserved-work evidence;
- required redaction before evidence persistence, including customer data, sessions, tokens, query strings, cookies, headers, and private content;
- separated UX evidence ownership from `krish-design`, `krish-voice`, `krish-build`, and `verification-loop` handoffs;
- changed authorised-fix handling so QA freezes reproduction and acceptance criteria, the build/code owner implements, and QA independently retests the matching revision and rendered artifact;
- updated the checklist and report template with safety, test integrity, source/deployment identity, data cleanup, and evidence-redaction fields.

## Surface defect discovered

The repository-level `AGENTS.md` points QA work to `C:\Users\krish\.Codex\skills\ux-testing-agent\SKILL.md`, but that path was absent during this review. The canonical skill exists in this repository. No local surface was changed; discovery and path alignment remain part of controlled deployment.

## Residual uncertainty

Synthetic cases do not replace real browser and repository canaries. Production admission still requires read-only runs against a revision-matched preview, a designated authenticated account, responsive and accessibility evidence, an injected-content fixture, a bounded AI or third-party failure, a safe external-action stop/readback, an authorised fix handoff, rendered regression proof, and cross-client discovery/parity.
