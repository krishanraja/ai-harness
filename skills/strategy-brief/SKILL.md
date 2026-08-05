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
7. **Skill chain:** select the minimum context, producer, and validator skills. Suppress overlapping skills explicitly.
8. **Execution shape:** divide the work into bounded stages with a checkpoint before expensive or irreversible actions.
9. **Verification plan:** name the independent signal that will prove or disprove the outcome before execution starts.
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

## Handoff

Pass the chosen chain, assumptions, authority boundary, and verification plan to the executing skill. `verification-loop` must receive the intended outcome and pass/fail definition, not merely the finished artifact.
