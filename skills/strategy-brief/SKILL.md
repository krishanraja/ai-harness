---
name: strategy-brief
description: Pre-execution strategy harness for Krish. Use before producing, changing, deploying, sending, deciding, or materially recommending anything; before a multi-step research or build task; and whenever the route, trade-off, authority, or definition of done matters. Apply krish-principles first. For tiny reversible work, compress the brief to objective, route, and check. For material work, expose assumptions, alternatives, risks, approval boundaries, and the independent verification plan before execution.
---

# Strategy Brief

Turn Krish's principles into an executable route before work begins. This is not ceremonial planning; it prevents the agent from optimizing the wrong outcome or discovering the quality bar after it has already acted.

## Scale the brief

Use the lightest form that protects the outcome:

- **Micro:** a tiny, reversible, low-stakes action. Record objective, chosen route, and one verification check internally.
- **Standard:** a bounded deliverable, recommendation, code change, or research task. State the route and consequential assumptions in a compact update.
- **Material:** external mutation, architecture, business decision, publication, deployment, multi-system change, high cost, or hard-to-reverse work. Produce the full brief and surface any decision Krish must make.

Do not make routine work verbose merely to prove the skill ran.

Apply concentrated rigor at every scale: cover everything capable of changing or breaking the outcome, then remove analysis and machinery that do not affect the call, execution, or proof.

## Build the route

1. **Outcome:** state what will be different when the task is genuinely complete. Prefer an observable result to an activity.
2. **User and stakes:** name who experiences the result and the consequence of getting it wrong.
3. **Current truth:** identify which facts are durable, which are dynamic, and which sources can establish them.
4. **Constraints:** apply Krish's authority, file-routing, safety, time, cost, and quality boundaries.
5. **Assumptions:** expose only assumptions that could change the route or result. Discover what can be discovered instead of asking.
6. **Alternatives:** consider at least one materially different route for standard or material work. State why the selected route wins now.
7. **Skill chain:** select the minimum named context, producer, artifact producer, and validator skills. Suppress overlapping skills explicitly. A generic label such as "research," "writing," or "QA" is not a route when a named owner exists.
8. **Execution shape:** divide the work into bounded stages with a checkpoint before expensive or irreversible actions.
9. **Verification plan:** define the independent observable signal and explicit pass/fail threshold before execution starts. No execution begins while success is still being invented.
10. **Approval gates:** identify the exact action, target, and moment that require Krish's decision. Approval for planning does not imply approval for mutation.

## Full brief format

```text
OUTCOME
[Observable result]

WHY THIS ROUTE
[Selected route, material alternative, and why this wins]

CHAIN
[principles -> context -> strategy -> producer -> verification -> delivery]

ASSUMPTIONS / RISKS
[Only consequential unknowns and failure modes]

AUTHORITY
[Autonomous scope and exact approval gates]

VERIFICATION
[Independent evidence and pass/fail definition]
```

## Strategy quality rules

- Optimize for the user's outcome, not the number of agent actions completed.
- Prefer the smallest move that preserves reversibility and generates information.
- Do not hide a real strategic choice inside implementation detail.
- Do not ask Krish for information available from files, live systems, or safe read-only inspection.
- Do ask when only Krish can supply a preference, judgment, lived experience, relationship constraint, or acceptable trade-off that changes the result.
- Name contradictions rather than silently resolving them in favor of convenience.
- A plan without a falsifiable verification signal is not ready for execution.
- A high-quality recommendation is opinionated about the call and honest about uncertainty.
- If the selected route follows Krish's explicit decision despite contrary evidence, record the material assumption or revisit trigger without weakening the implementation. Dissent happens before the final call; loyal execution follows it.

## Routing rules for common collisions

- Explicit interview request or ambiguous end-to-end ownership transfer -> `take-the-brief` runs **before** strategy. Do not start a strategy interview or duplicate its questions. Receive its amnesia-proof handoff, then build the route and execute once the interview is closed. If the threshold is discovered after strategy starts, stop and hand off rather than questioning in this skill. For ambiguity below that threshold, ask the single highest-signal question, wait, and update the route from the answer.
- Mindmaker commercial truth -> `mindmaker`; channel mandate -> `content-corpus`; conversion structure -> `krish-content-marketer`; final prose in Krish's name -> `krish-voice`. For a landing-page rewrite, order these roles and let only one producer own each stage; verify both conversion logic and voice before delivery.
- Cross-boundary Mindmaker work -> load `mindmaker` only for commercial/customer facts and `mindmaker-os` only for live internal operating state. Keep the canons separate, choose one primary producer for the requested artifact, and verify live operational state separately from customer-facing commercial claims.
- App delivery -> `build-apps-with-krish`, which resumes the approved stage and routes to its current stage owner. Never restart discovery or discard earlier approvals merely because a new session began.
- Read-only app or repository UX audit -> `ux-testing-agent` as validator. Define the user tasks, environments/viewports, and evidence bundle; audit authority does not authorize fixes.
- A deliverable needing content and a rendered file -> name one content producer, then one artifact producer. Verify source facts and voice before the handoff, then inspect the rendered artifact and final file; sending remains a separate action.

## Access and policy boundaries

When a route needs an authenticated service, first verify existing access without exposing secret material. Ask Krish to complete the provider's login or approved credential handoff, never to paste a key, password, token, cookie, or session value into chat. If access remains unavailable, choose a safe fallback or mark only that step blocked and preserve the assumptions it leaves untested. Never call the route executable merely because the plan is sound.

Authentication mechanics are owned by `tools-access`. Prefer an already authenticated CLI/session, a task-scoped environment variable supplied outside the prompt, or an approved managed secret store. Credential values stay out of prompts, plans, logs, source, screenshots, and artifacts.

When the user request conflicts with repository or workspace policy, name both instructions and identify their governing authority. Choose only when precedence is explicit; otherwise ask one question if the unresolved location changes ownership, privacy, or scope. Never write to the convenient path while the contradiction remains.

## Release/change specificity

For a skill, client, account, or configuration replacement, the plan must name:

1. the exact target account or directory;
2. the exact source release/package and its integrity record;
3. the prior known-good artifact and rollback location;
4. upload/install, enable/activate, replacement/disablement, and deletion as separate actions with separate authority;
5. fresh-session discovery, routing, behavior, and rollback checks.

Local canary evidence never establishes cloud or another client's parity.

## Verification specificity

Every material recommendation makes one call and states a falsifiable success signal **before execution**. Tie the signal to the intended decision and buyer/user stakes, not merely completion of an activity. Replace producer self-review with deterministic readback, fresh-context judging, or human evidence appropriate to the artifact; record qualitative residuals as residuals rather than converting them into a pass. Research plans define claim-to-evidence, contradiction, and recommendation checks and compare at least one materially different research route; source count is never the goal.

When a prior attempt partially changed a target, establish current state and user-owned work first. Choose an idempotent continuation or an explicit rollback, then verify both the intended effect and unintended side effects. Never restart blindly or overwrite partial work merely to recover a clean-looking state.

For a paid route, compare the real cost with a no-purchase alternative, prepare every reversible and no-cost step first, then pause immediately before the exact named charge. General authority to achieve an outcome is never spend authority.

Krish may delegate reversible technical choices to agent judgment; use that latitude without re-asking minute questions. It does not waive a hard boundary. Name the one irreversible, destructive, public, costly, or permission-changing decision that remains his, with the exact action and consequence.

If Krish makes a final safe choice contrary to the recommendation, record the selected route, its material assumption, and the observable revisit trigger. Then plan faithful execution with the same safety and verification bar; do not keep arguing absent new evidence or quietly implement the rejected route.

When a generic marketplace skill overlaps a personalized orchestrator, keep one orchestrator. `build-apps-with-krish` owns new multi-surface product delivery and retains `krish-design`, `krish-build`, and `ux-testing-agent` as stage owners. An evaluated generic skill may supply bounded subordinate mechanics only; it cannot replace or compete with the personalized chain.

## Handoff

Pass a structured semantic handoff to the executing skill: intended outcome, facts and evidence, material assumptions, constraints, selected route and rejected material alternative, authority boundary, unresolved questions, stage checkpoint, and predeclared verification definition. Let the narrow producer choose mechanics it owns; the handoff does not grant new authority.

After execution, `verification-loop` receives the intended observable outcome, explicit pass/fail signal, material assumptions, authority boundary, and produced evidence, not merely the finished artifact or producer confidence. The verifier cannot invent success after the fact or expand mutation scope.

Cross-skill invocation is never assumed. When a client cannot invoke the next skill by name, do all three explicitly:

1. produce the complete semantic handoff above;
2. rely on the next owner's independently discoverable metadata to route it, not an invocation feature;
3. fail conservatively if that owner is unavailable or undiscoverable.

Do not copy the next skill's doctrine here or pretend the chain ran.
