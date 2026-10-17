# Brain-led repository administration: execution plan

Plan ID: `brain-repository-administration-v1`

Status: approved by Krish on 2026-10-17 in the implementation session: "Okay I approve. Get going." Execution and bounded rollout follow the scope below.

Prepared on 2026-10-17 against GitHub `ai-harness` main at
`2abb99cbd9468b8bc2863dafbc8cdeb680706fbd`. The supplied workspace is older,
at `48aa086e8af640efb7f2480aca9ffeb36b286833`; implementation starts from fresh
main, preserving user-owned work. The plan was the only local change at sign-off.

## Outcome and constraints

The central brain learns from authorized session histories, repository changes,
human decisions and verified outcomes. It maintains knowledge of each
repository's system and uses that knowledge to improve how agents administer
the whole repository. Each `CLAUDE.md` and shared `AGENTS.md` is a concise
delivery surface for that operating knowledge.

The system must preserve accumulated intent through iteration, accommodate
different repository goals and maturity, retain uncertainty, and distinguish
an avoidable repeated mistake from an unsuccessful experiment. Its success is
better work with fewer repeated corrections, not more stored rules.

Implementation constraints:

- GitHub-hosted Actions, GitHub repositories and the existing AI access only.
  Add no database, vector service, hosted application, queue, VPS, home-PC
  requirement, new subscription or new package dependency to this loop.
- Use the existing standard-library Node scripts and GitHub APIs/git. Existing
  application dependencies and existing GitHub Actions remain their owners'.
- Provider-specific history access is the one allowed integration boundary.
  Prefer supported cloud reads or a cloud export inside the AI tool. Local-only
  histories remain an optional source, never a requirement for core execution.
- Raw histories stay at their authorized source. Redact before model extraction;
  send only bounded structured evidence to GitHub. The public harness must not
  receive private source material or private experiment data.
- Retain the existing separation of evidence, accepted knowledge, operational
  state and released instructions. The brain references authoritative code,
  examples and live state instead of manufacturing another source of truth.
- Do not expand agents' authority to publish content, send campaigns, spend,
  delete data, change permissions, or operate production applications.

## Findings the implementation must address

These findings were checked against the source revision above, with synthetic
inputs where appropriate; no private history was read for this review.

1. `mine-sessions.mjs` selects the last assistant excerpt plus a user correction,
   not a coherent decision history. Selection can attach an assistant turn from
   another session. Earlier requirements and repository metadata can disappear.
2. Extracted lessons are limited to 280 characters with no product details. That
   is useful for generic signals but insufficient as the only representation of
   conditional knowledge, rationale or evolving requirements.
3. `import-harness-events.mjs` assigns imported observations to `ai-harness`.
   `propose.mjs` counts local product rulings and omits them from actionable
   candidates. `change-guard.mjs` does not permit repository entry-file changes.
4. `brain/rules.yaml` indexes harness contracts and skill chapters. It does not
   yet represent repository operating knowledge, experiments or task decisions.
   `brain/usage.jsonl` admits judge/canary citations, not direct evidence that a
   repository session received or used relevant knowledge.
5. Direct GitHub dispatch intake already exists and its seven tests pass. The
   steward still requires the separate hosted observation exporter, creating an
   unnecessary hard dependency even when GitHub intake is working.
6. The docs steward and canon reconciler have fixed ownership territories.
   Adding another writer without changing those contracts would cause drift.
7. Content engine's title records retain an explicitly superseded lesson, and
   the helper emits all lessons. This illustrates why resolving applicability
   belongs before delivery, rather than being left to every fresh session.

## Scope and authority for sign-off

Sign-off on this plan authorizes the implementation phases below, including
local edits, branches, commits, pull requests, relevant CI dispatches, merging
the passing implementation and pilot changes, and the subsequent bounded fleet
rollout. It also authorizes exact rollback of changes made under this plan.
Routine implementation choices, dependency-free scripts, conflict resolution,
test repairs caused by this change and idempotent retries are included.

Named implementation owner: `krishanraja/ai-harness`.

Pilots, in order:

1. `krishanraja/content-engine`: full content-system administration, including
   continuity through title iteration and the existing failure/feedback sources.
2. `krishanraja/aeo-engine` (fleet alias `AEO-Engine`): research/growth-system
   administration, experimentation, evidence quality and its existing offline
   verification route. Do not run paid probes or ship packets for this pilot.

After both pilots pass, the remaining current fleet targets are `ai-harness`,
`control-center`, `mm-ctrl`, `fractionl-circle`, `fractionl-pulse`, `full-time`,
`contentarchives`, and `makeyourmindup`, all under `krishanraja`.

`mindmake` remains excluded from instruction writes. Reading its already
authorized observation feed is separate from changing its instructions. Do not
add repositories, reactivate an excluded writer, or treat a future fleet entry
as automatically authorized by this plan.

Target-repository changes are limited to entry instructions, explicitly named
context/reference files, and the minimal CI integration that validates their
ownership and budget. Application-code defects discovered during the work
become linked findings; fixing unrelated business behavior is outside this
rollout. Harness code, tests, policy, contracts and existing workflows necessary
for this feature are within scope.

## Phase 1: establish a reproducible baseline

Actions:

- Fetch current main into an isolated branch/worktree and compare it with the
  reviewed revision. Preserve all user changes. Rebase the plan on relevant
  intervening changes without restoring superseded assumptions.
- Run the harness baseline and record existing failures separately. Use the
  existing Windows GitHub runner for packaging/install tests that need Windows;
  no physical machine is required for this feature's gates.
- Verify actual read, branch, PR, workflow and merge access using existing
  credentials. Git push dry-run succeeded during planning; GitHub REST access
  from this environment previously returned Forbidden, so verify API operations
  on the authorized GitHub runner before claiming remote execution is ready.
- Inventory each pilot's actual entry files, instruction imports, current
  standards, privacy boundaries, workflows, authoritative sources, tests and
  existing native learning stores. Record source commits and file hashes.
- Inventory AI-history coverage per provider/account: supported cloud interface,
  available metadata, pagination, identity, read scope, redaction boundary,
  cursor, last successful receipt and known gaps. Inspect existing configured
  access; do not scrape credentials, browser state or hidden endpoints.

Deliverable: a value-free baseline and source-coverage report with exact rollout
allowlists, prior-known-good revisions and explicit unavailable capabilities.

Exit: the baseline is reproducible and every initial target has a bounded write
scope. An unavailable history source does not block independent core work.

## Phase 2: preserve context through history digestion and intake

Primary owners: `scripts/mine-sessions.mjs`, `scripts/intake-observations.mjs`,
`scripts/import-harness-events.mjs`, `architecture/HARNESS_EVENT_ENVELOPE.md`,
`contract/learning-policy.yaml`, and their existing tests.

Actions:

- Add a backward-compatible, versioned representation for a learning episode.
  Keep source/session/event identities stable and opaque; preserve repository,
  task/work item, workflow stage, actor and source revision when verified.
- Resolve repository identity from verified provider metadata or a local
  allowlist before removing private paths. Ambiguous scope stays unknown. Do
  not infer a repository from a sanitized sentence or default it to ai-harness.
- Group only related turns within the same session and work item. Preserve the
  objective, relevant prior decisions, latest requested delta, attempted
  behavior, observed outcome, what remained valid and what is uncertain.
- Retain conditional context and decision lineage within bounded limits instead
  of relying on one generic sentence. Capture useful outcomes and successful
  procedures as well as correction language; treat assistant claims as claims
  until supported by a human decision or observable evidence.
- Distinguish direct owner instructions, observations, hypotheses and proposed
  interpretations. Store supporting, contradicting, refining and superseding
  links rather than making recency alone decide meaning.
- Deduplicate an episode that reaches intake through a session digest, a commit
  and a direct observation. Retries must not inflate evidence counts. Persist
  non-secret receipt/cursor state in GitHub for cloud ingestion; advance only
  after acknowledged recording, with safe replay after partial failure.
- Keep legacy events readable. Historical scope that was discarded remains
  unknown unless an authorized source can establish it. Enrichment appends a
  record and never rewrites old evidence or invents attribution.

Deliverable: source adapters produce scoped, linked evidence using the same
strict redaction, validation and intake contract on every supported route.

Exit: fixtures prove preserved intent, session isolation, repository attribution,
idempotency and honest treatment of missing or contradictory evidence.

## Phase 3: extend the existing brain with repository knowledge

Primary owners: `brain/`, `scripts/brain-rules.mjs`, `scripts/brain-usage.mjs`,
`scripts/propose.mjs`, `state/fleet.yaml`, and related validators.

Actions:

- Extend the existing brain rather than building another memory service. Use
  a small schema, append-only history, and derived effective views. Keep one
  bounded profile/view per repository, not a new Markdown file per lesson.
- Represent global, repository-family, repository, workflow and individual-task
  scope. Transfer across repositories requires evidence of applicability and
  compatible authority; lexical similarity alone is insufficient.
- Give every learned item an ID, type, applicability, provenance, status,
  uncertainty and source revision. Preserve supersession and contradiction
  history. Unknown applicability cannot silently become a universal rule.
- Build a repository operating model from existing authoritative sources: goal
  and maturity, system boundaries, component relationships, workflow/stage
  owners, state locations, entry paths, verification, failure recovery, prior
  decisions and relevant experiments. Preserve unresolved intent/code conflicts.
- Separate verified facts, accepted requirements/preferences, experimental
  hypotheses, observed results, procedures and temporary working decisions.
  An unsuccessful growth experiment is conditional evidence, not an automatic
  prohibition. Stable safety or correctness boundaries still apply to tests.
- Reference native stores such as content engine's verdict/failure records and
  AEO's packet/evidence sources. The brain owns the learned interpretation and
  lineage; live state and sensitive data stay with their existing owners.
- Produce an effective context view for a repository and task stage. Preserve
  earlier accepted decisions while treating new feedback as a scoped change.
  Deliberate trade-offs between soft goals remain possible and visible.

Deliverable: the brain can explain what is known, why, where it applies, what
superseded it, what remains uncertain and what an agent should consult next.

Exit: the same evidence produces different appropriate views for the two pilots,
without leaking private data or flattening experimentation into blanket rules.

## Phase 4: derive concise repository operating instructions

Primary owners: `scripts/render.mjs`, `scripts/reconcile.mjs`,
`scripts/change-guard.mjs`, `scripts/context-budget.mjs`, `scripts/lib/fleet.mjs`,
the canon template/ownership contracts, and `docs/steward/RUNBOOK.md`.

Actions:

- Define a distinct managed administration region, separate from the shared
  canon region, with a source revision and content hash. Put exact targets and
  permitted references in the repository manifest. Models cannot choose new
  write targets or insert ownership markers themselves.
- Keep one shared operating guide in AGENTS where appropriate. Preserve
  CLAUDE's existing behavior; add a thin CLAUDE entry route where missing and
  explicitly admitted, including the AEO pilot. Detect circular imports and
  accidental duplicate mandatory loads.
- Teach administration of the whole system: where truth lives, how components
  and stages connect, how to retrieve relevant knowledge, what decisions must
  persist, which commands/checks establish readiness, how to recover and how
  outcomes return to the brain. Keep individual title rules and experiment
  histories out of the root guide.
- Generate bounded, repository-native context/reference files where needed.
  Ordinary sessions read them through normal repository access; no external
  retrieval endpoint or daemon is needed. Every generated view names its source
  revision and is reproducible from accepted knowledge.
- Start with at most 400 words in the administration region. Measure each
  client's complete bootstrap instructions, including mandatory imports and
  reads. The initial pilot should not increase that total; ongoing render-only
  upkeep must remain within its recorded budget.
- For the initial migration, map existing root instructions to retained clauses
  or their exact new owner/reference. Preserve unique meaning and authority.
  Do not satisfy a cap by deleting a valid rule or moving the same entire text
  behind another mandatory read. Record an explicit exception if faithful
  preservation cannot fit; do not invent a waiver.
- After that bounded migration, unattended writes touch only declared managed
  regions/files. Detect human edits, concurrent base movement and conflicts;
  preserve them and propose reconciliation instead of overwriting them.
- Give the docs steward and canon reconciler disjoint ownership rules. Update
  the existing promise about text outside the canon markers to recognize only
  the separately declared administration region. Preserve all exclusions.

Deliverable: a small, useful operating guide and scoped context for each pilot,
with deterministic rendering, ownership checks and recoverable prior bytes.

Exit: root instructions cover repository administration, budget checks pass,
unmanaged content is preserved, and identical inputs produce identical output.

## Phase 5: run the loop entirely in GitHub

Primary owners: existing observation intake and harness-steward workflows,
`scripts/open-changes.mjs`, `scripts/propose.mjs`, `scripts/scoreboard.mjs`,
`scripts/digest.mjs`, and `scripts/process-review.mjs`.

Actions:

- Make direct GitHub dispatch a complete intake route. Remove the mandatory
  hosted-exporter prerequisite from core observation/consolidation. An optional
  importer can contribute evidence without becoming a dependency.
- Use event-triggered runs for newly received evidence or relevant repository
  changes, scheduled catch-up for missed work, and periodic consolidation for
  deduplication, contradiction review, compression and effectiveness review.
- Use existing policy limits for model calls, decision volume and job duration.
  Batch and coalesce updates per repository, write nothing for no change, avoid
  release loops, and never create a second background scheduling system.
- Treat generated text and all incoming evidence as inert data. Keep model
  drafting separate from the credentialed writer. Validate paths, source/base
  hashes, exact allowed diffs, privacy, context cost and authority before writes.
- Expose source coverage and per-repository health through GitHub files and job
  summaries. A stopped source, unmeasured run or failed writer must be visible;
  another functioning source must not make it appear healthy.
- The core can continue from existing brain knowledge and GitHub evidence when
  an AI history source is unavailable. Preserve the missing-source status and
  do not claim comprehensive learning or silently create another collector.

Deliverable: one observable GitHub learning/maintenance loop with independent
ingestion adapters and no new operational service.

Exit: an end-to-end fixture goes from GitHub intake through the brain to a
validated instruction update and an independently read-back target revision.

## Automation policy after sign-off

This is a required implementation change to the current contracts; the current
human-merge rule is not silently assumed to permit all future autonomous edits.

The bounded standing authorization proposed by this plan is:

- Automatically append validated observations, experiment results, delivery
  receipts and use/outcome evidence. These records do not approve themselves.
- Automatically open and merge changes whose complete effect is a deterministic
  projection of already accepted knowledge into declared managed files/regions,
  provided exact-diff, source, privacy, ownership, budget and repository checks
  pass. Record the acceptance reference and prior-known-good revision.
- An explicit standing instruction from Krish can be an acceptance source when
  its verified provenance and scope are unambiguous. An agent's paraphrase or
  inference is not that source. Existing inferred lessons remain proposals.
- New inferred preferences, changed objectives, behavioral requirements,
  ambiguous supersession and unresolved conflicts stay in small reviewable
  change requests, within the existing decision budget. Evidence may accumulate
  automatically without being promoted into instructions.
- The model cannot change this policy, expand its own file allowlist or promote
  its own proposed requirement. Authority and product taste cannot be rewritten
  as technical maintenance. Changes that exceed the cap are reported, not
  repeatedly retried or paid for by deleting unrelated useful guidance.

Initial implementation and rollout merges are authorized by plan sign-off when
their named acceptance checks pass. Existing named approvals and immutable
release rules remain intact. If a harness skill changes, use its established
release pipeline; repository instruction revisions do not depend on installing
skills on a home PC or completing supervised account uploads.

## Phase 6: prove the pilots, then roll out the eligible fleet

Actions:

- Add meaningful regression fixtures for the failures below before enabling the
  new writer. Run the affected harness suites and required full checks.
- Execute a read-only planning pass for both pilots and inspect proposed bytes,
  source lineage, context cost and ownership. Correct within the signed scope.
- Test fresh agent contexts on two different kinds of work in each pilot:
  whole-system orientation/diagnosis and an iterative or experimental workflow.
  Use offline fixtures and tools with no product side effects. Pin the exact
  brain and repository revisions and report which files/knowledge were observed
  loading; do not claim use from a hash match alone.
- Replay the title correction sequence against the accumulated brief. Check
  factual/structural requirements deterministically and compare qualitative
  trade-offs with the existing accepted/rejected examples. Model criticism is
  supplemental; subjective title quality is not certified by a passing schema.
- Replay a growth experiment that underperforms. Preserve its conditions and
  uncertainty, allow a justified revised test, and show that an unrelated
  repository receives no prohibition from it.
- Merge passing pilot changes, verify target bytes and actual native entry
  routing, then expand one repository at a time through the same gates. Re-read
  each target before a write and respect repository-specific controls.
- Continue independent eligible repositories if one has an access or unresolved
  source conflict. Mark it blocked and explain the exact missing capability;
  never report the fleet complete while a target is unverified.

Required regression coverage:

1. Multi-turn intent survives a narrow revision; a later request does not erase
   unrelated accepted requirements.
2. Cross-session/work-item assistant context is never attached to an episode.
3. Repository attribution survives redaction; unknown stays unknown.
4. The same episode arriving twice or through two routes counts once; partial
   failures do not skip evidence or advance a cursor incorrectly.
5. Outcomes without correction language can be captured; unsupported success
   claims cannot become verified facts.
6. Conflicting/refined/superseded guidance resolves to the right applicable view
   while preserving its history. Legitimate soft-goal trade-offs remain possible.
7. A failed experiment remains conditional evidence; it cannot create a global
   prohibition or override an accepted boundary.
8. Source evidence cannot instruct the model, grant authority, choose a target,
   alter policy or cause an external product action.
9. Private material, paths, credentials and transcript fragments cannot reach
   public records, generated files or logs.
10. Repeated rendering is byte-identical; no-change runs create no update; human
    edits and concurrent changes are preserved; writers have disjoint regions.
11. Excluded repositories are never contacted by the new instruction writer,
    and no file outside each target's allowlist can change.
12. Complete startup context is budgeted, linked resources are present, entry
    routes work, and unsupported/absent runtime evidence stays unmeasured.
13. The GitHub route works without the hosted exporter or any PC; a missing
    source is visible, and telemetry commits cannot trigger an infinite loop.
14. Rollback restores the exact prior managed content and preserves intervening
    human edits and immutable evidence.

Exit: both pilots and every successfully admitted fleet target have passing
applicable gates, target readback, versioned evidence and an exact rollback.

## Phase 7: measure effectiveness and leave autonomous operation

Extend the existing scoreboard and digest with per-repository, source- and
version-bound evidence: ingestion coverage, knowledge delivered, observed use,
instruction/context size, repeat avoidable corrections per relevant opportunity,
and each repository's existing outcome measures where available.

Distinguish delivery, loading, application and effectiveness. A citation is not
proof of application; a successful run is not proof of improved judgment. No
opportunities means unknown effectiveness. A changed audience or experiment
condition must not be counted as the same operational mistake.

Trace each recurrence to the owning layer: missing evidence, wrong
interpretation, wrong scope, retrieval omission, stale generated instructions,
ignored guidance, code defect or a deliberate experimental result. Improve that
layer instead of appending another root rule automatically.

Completion report: commits/PRs, admitted and blocked targets, source coverage,
before/after context, test and fresh-context evidence, enabled schedules,
prior-known-good references, exact rollback, and effectiveness still awaiting
real work. Do not wait for future user activity to claim engineering completion,
and do not claim measured long-term improvement before that activity occurs.

## Rollback and stop conditions

Keep per-target prior bytes and the accepted brain revision before every write.
On an attributable regression, disable the new writer for that target, restore
only the managed content using current-base checks, read it back, and append a
superseding/rollback event. Never erase evidence or force-push a human branch.
If the target moved, re-read and reconcile instead of applying a blanket revert.

Continue routine fixes autonomously. Pause only the affected dependent action
when access is missing, a credential or new permission must be supplied, the
approved file/authority boundary would change, private-history access would
expand, a paid/new-service dependency is proposed, or intent cannot be recovered
without making up Krish's decision. State the exact blocker and continue the
independent work.

## Validation of this plan

The plan uses current GitHub source, not the older workspace assumptions.
Existing miner, importer, proposer, context-budget and change-guard suites passed
93 checks during investigation, and direct GitHub intake passed seven checks.
Additional synthetic probes reproduced lost earlier intent/repository metadata,
cross-session context attachment, and omission of ordinary experiment outcomes
from correction-based selection. These are design evidence, not evidence that
the proposed implementation has already run.

Sign-off reference: `brain-repository-administration-v1`, this document's Git
blob hash as reported with the final proposal. No live changes have been made.
