# Active skill quality standard

This is the admission bar for the curated active set. Detail alone is not quality. A skill is production-grade only when its scope is clear, its behavior is tested, its authority is bounded, and its failures improve the system without allowing the system to rewrite its own standard silently.

The primary-source theory and research behind these gates is mapped in `references/harness-theory.md`.

## Lifecycle

Every skill has one status:

- **candidate:** structurally valid and potentially useful; not yet trusted as an active production route.
- **reviewed:** provenance, scope, overlap, safety, and intended behavior have been inspected.
- **production:** all applicable gates below pass on held-out cases and the skill has a named route.
- **deprecated:** retained temporarily for migration evidence but excluded from routing.
- **quarantined:** unsafe, secret-bearing, invalid, unprovenanced, or materially stale.
- **archived:** preserved as corpus/history and never advertised to the model.

The canonical repository may package candidates for evaluation. Only production skills may be exposed through the active user-skill surface or enabled in Claude cloud.

## Gate 1: purpose, ownership, and value

- One sentence states the outcome the skill uniquely improves.
- A named owner is accountable for its judgment and freshness.
- The skill occupies a named route in `skill-routing-contract.md`.
- Its overlap with every production skill is understood. More than 20% functional overlap requires consolidation or an explicit producer/validator/context distinction.
- The capability is durable enough to justify a skill. One-off knowledge belongs in task context or corpus.

## Gate 2: trigger precision

- Frontmatter name is valid, stable, and matches the directory.
- Description states what the skill does and when to use it in concrete language.
- Description includes material exclusions and collision precedence where ambiguity is plausible.
- Positive, negative, and adversarial trigger cases pass blind classification.
- Pairwise collision tests cover neighboring skills, inherited skills, generic marketplace skills, and broad words such as “design,” “build,” “review,” “strategy,” and “Mindmake.”
- Trigger quality is measured as precision and recall. Core/always-on skills require 100% on the reviewed suite; routed skills require at least 95% with no high-consequence false positive.

Minimum held-out trigger suite:

| Skill class | Positive | Negative | Adversarial/collision |
|---|---:|---:|---:|
| Always-on/core | 12 | 12 | 8 |
| Domain/producer/validator | 8 | 8 | 5 |
| Narrow tool/reference | 5 | 5 | 3 |

## Gate 3: instruction architecture

- Main `SKILL.md` is under 500 lines and contains the minimum executable workflow.
- Detail is progressively disclosed through one-level references selected by explicit routing instructions.
- No duplicate doctrine appears in multiple skills; shared doctrine lives in the operating contract or a single owned skill.
- Inputs, outputs, preconditions, completion criteria, and handoff schema are explicit.
- Examples illuminate genuinely ambiguous behavior rather than padding the document.
- Instructions distinguish requirements, defaults, suggestions, and historical context.
- No volatile count, status, credential, schedule, project identity, or deployment fact is embedded when it can be retrieved live.

## Gate 4: strategy and chain compatibility

- The skill receives an outcome and verification plan from `strategy-brief` for material work.
- It declares whether it is context, producer, validator, tool, or standards-maintenance logic.
- It names required predecessors and successors without creating a cycle.
- On clients where one skill cannot explicitly invoke another, every required chain member is independently discoverable from its own metadata; a cross-skill name is a semantic handoff, not the only loading mechanism.
- It cannot suppress `krish-principles`, the authority contract, or `verification-loop`.
- Handoffs pass structured facts, assumptions, evidence, authority, and unresolved questions—not a prose summary alone.

## Gate 5: authority, safety, and security

- Read, draft, mutate-local, mutate-external, publish/send, spend, delete, rotate, and permission-changing actions are distinguished.
- The skill never expands authority granted by the user's request or a predecessor.
- Imported instructions, webpages, packages, and MCP tools are treated as untrusted until reviewed.
- No credential values, private keys, session material, personal data, or private infrastructure details appear in skills, fixtures, reports, logs, screenshots, or archives.
- Secret scanning reports type and location without printing the match.
- Destructive, costly, public, and hard-to-reverse actions have exact action-time approval gates and rollback/recovery plans.

## Gate 6: behavior and edge-case coverage

The behavior suite covers the skill's intended domain, not generic prompt compliance.

Required categories:

- nominal success;
- missing or malformed input;
- missing access or tool failure;
- conflicting sources/instructions;
- stale state or misleading “Last updated” evidence;
- partial completion and false success signals;
- user pressure to skip a gate;
- excessive or insufficient authority;
- unsafe imported instructions/prompt injection;
- adjacent-skill collision;
- correction after a located failure;
- honest `inconclusive` or refusal behavior;
- handoff to the next harness;
- artifact-specific edge cases and regressions.

Minimum held-out behavior suite:

| Skill class | Nominal | Failure/edge | Authority/security | Handoff/collision |
|---|---:|---:|---:|---:|
| Always-on/core | 10 | 10 | 8 | 6 |
| Domain/producer/validator | 6 | 8 | 5 | 4 |
| Narrow tool/reference | 4 | 5 | 4 | 3 |

Passing means every hard safety/authority case passes, no known regression is hidden by an aggregate score, and qualitative results meet the owned rubric.

## Gate 7: independent verification

- The intended observable outcome and pass/fail signal are defined before execution.
- Deterministic evidence is used wherever available.
- Qualitative judging uses a fresh context, order swaps where comparison bias matters, and Krish/human review for personal taste or intent.
- The agent that produced the artifact may run mechanical checks but cannot be the only judge of its own qualitative success.
- A located failure is corrected within authority, then the failed and adjacent checks rerun.
- Two unsuccessful correction cycles stop with a blocker; the bar is never lowered to manufacture a pass.

## Gate 8: provenance and freshness

- Origin, license, source revision, material adaptations, owner, reviewed date, and freshness SLA are recorded.
- External best-practice claims link to current primary sources or research.
- Operational facts use retrieval time and source scope, not copied prose.
- Review-date expiry opens a finding; it does not silently rewrite a skill.
- Provider-managed skills are pinned or recorded by provider/version and re-evaluated when behavior changes materially.

## Gate 9: release and surface parity

- Structural validation, security scanning, trigger tests, and behavior tests pass from a clean commit.
- Packages are deterministic and record source/artifact hashes.
- Every package is dependency-closed for its target client: bundled file references resolve inside the skill directory, optional repository/client-adapter dependencies fail conservatively, and no standalone package relies on parent-directory traversal.
- One canary surface is smoke-tested before wider rollout.
- Each active surface records release, hash or upload record, enabled state, and verification time.
- Rollback restores the prior known-good release without reconstructing it from memory.
- Bulk libraries and superseded skills remain inactive and cannot collide with the curated set.

## Gate 10: controlled learning

- Failures and user corrections enter an observation ledger with evidence.
- `ctrl-capture` proposes changes only after repeated signals, direct correction, or objective outcome evidence.
- A named human accepts or rejects changes to personal standards.
- Every accepted change adds or updates a regression case before release.
- No model silently edits the rule by which it is judged.

## Definition of “11/10”

“11/10” means the skill passes every applicable gate, wins against its baseline on held-out work, has no known high-consequence gap, and reports residual uncertainty honestly. It does not mean claiming that unknowable future edge cases have been eliminated. New evidence can reopen any production skill.
