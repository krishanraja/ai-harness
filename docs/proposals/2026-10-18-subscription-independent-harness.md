# Subscription-independent harness: execution plan

Plan ID: `subscription-independent-harness-v1`

Status: proposed, not approved or activated. Prepared 2026-10-18 against
`krishanraja/ai-harness` main at
`7002eb7eb6d979777ad386a4085e4dbc6b75a62c`.

## Outcome

The central brain, repository administration, proposals, documentation upkeep,
verification and monitoring run on GitHub-hosted runners without a Claude
subscription, Claude OAuth session, claude.ai scheduled task or local inference
CLI. Existing API access remains metered and bounded. Source availability,
processing, delivery and effectiveness have distinct evidence.

The work extends the completed repository-administration loop. It preserves
scoped episodes, accumulated intent, exact acceptance proofs, append-only
history, durable receipts/checkpoints, instruction budgets, writer ownership,
repository exclusions and rollback. It does not replace the brain or create a
second knowledge store.

The existing learning path remains session evidence -> scoped episodes -> brain
knowledge and accepted requirements -> compact repository guidance -> observed
outcomes. Each CLAUDE.md administers its repository using that knowledge; it is
not a growing transcript archive. Preserve the title-revision case as a
regression: changing one quality dimension must retain the other accepted goals
and surface material trade-offs. Growth experiments retain their conditions and
uncertainty rather than becoming universal prohibitions after one failure.

Local installed-client tests and collection of files that exist only on a PC
remain explicitly local. Their absence cannot block central execution or be
reported as verified client behavior. Both previously requested Claude cloud
accounts remain named history sources; unavailable access is a blocked source,
never silently removed to manufacture full completion.

No new database, vector service, queue service, VPS, subscription, npm package
or home-PC dependency is added to central processing. Use existing repositories,
GitHub Actions/APIs and standard-library scripts. The existing Control Center
can observe GitHub from outside it; central processing does not depend on that
observer being available.

## Instructions and decision route

Read: AGENTS.md, CURRENT.md, NOW.md, operating/routing contracts, the previous
approved plan and completion evidence, existing workflow/miner/guardian code.
Current runtime ledgers take precedence over dated narrative state.

Route: `krish-principles` -> `mindmake-os` and `tools-access` for ownership and
access -> `strategy-brief` -> `harness-maintainer` for harness boundaries and
`krish-build` for implementation -> independent review and `verification-loop`.
Do not introduce a competing agent framework, a new skill or another scheduler.
This advances learning and operational capacity; it is supporting infrastructure,
not a new product or an excuse to restart commercial strategy.

## Verified starting inventory

| Check or learning route | Credential/runtime now | Intended result |
| --- | --- | --- |
| Structural/security checks, Windows repeat builds/install tests | GitHub runner/default token | Remain deterministic and account-independent |
| Release packaging, registration and auto-release | GitHub permissions | Preserve existing immutable releases and named approval gates |
| GitHub observation intake and heartbeat intake | Authenticated dispatch/default token | Remain deterministic; preserve exact durable acknowledgements |
| Observer, audit, reconciliation, consolidation, health and scoreboard | Existing GitHub/fleet credentials; optional hosted exporter | No model prerequisite; one failed source does not stop others |
| Harness steward proposal drafting | `CLAUDE_CODE_OAUTH_TOKEN` | First OAuth route migrated to bounded API-backed drafting |
| Reusable docs steward | Caller repository's OAuth/default token | Central API-backed drafting; deterministic target push checks |
| Judge (`scripts/judge.mjs`) | `ANTHROPIC_API_KEY` | Preserve measured review quality; add shared spend accounting |
| Brain proposals and fresh pilot contexts | API-key Claude action | Keep subscription independence; include every paid turn in cap |
| Native title replay | Direct API plus authorized source reads | Preserve private examples, source pins and balanced-goal checks |
| Session inference for Claude and Codex histories | `claude -p` | Bounded API inference; no inference CLI or subscription fallback |
| Both Claude cloud history collectors/check-ins | Provider standing sessions/tools | Supported account-specific collection/export, independent receipts |
| Local transcript collection and installed-client/held-out canaries | PC files and native clients | Declared local adapters/probes; separate from central availability |
| claude.ai/ChatGPT capture connectors | Existing authorized event endpoint | Keep distilled event transport; no automatic scope/privacy expansion |
| Guardian/digest | PC-focused clocks and weekly board route | Independent central/source monitoring and retry-safe delivery |
| Existing outer observer in Control Center | GitHub read on dashboard access | Reuse it for unattended outside-GitHub observation |

The nine harness workflow files were inspected. Execution must also read the
live enabled fleet callers and provider schedules before finalizing the manifest.
No Claude `list_sessions`, `list_events` or `list_triggers` capability is exposed
in this environment. Another product's session tool is not a substitute.

The current PC sync reports three blocked runs with `checkout-untracked`; the
local miner also reports blocked. Reuse their existing incident and repair
ownership. Do not delete untracked files or bundle a second PC repair.

## Architecture and cost controls

Keep deterministic preparation, bounded inference, validation, publishing and
measurement as separately owned responsibilities in the existing scripts.
One reviewed runtime manifest declares enabled jobs, owners, credentials,
cadence/grace, allowed side effects, budget class, outputs and completion proofs.
Reuse the stage-conveyor conformance checker if this topology adopts its schema;
do not maintain two independently edited job registries.

One dependency-free API boundary owns central paid calls. Prefer bounded source
packs and structured results over a general shell-capable agent. If a native
agent runtime is needed for a fixture, every paid request/tool turn must pass the
same enforcement boundary, or have independently verified equivalent limits.
An opaque action that can bypass accounting cannot satisfy the monetary gate.
Changing an API fixture's runtime requires honestly relabelled evidence; it must
not be presented as proof of native installed-client discovery.

Proposed approval ceiling: **USD 50 per calendar month in Europe/London**, shared
by controlled central API inference, including reviews, proposals, documentation,
extraction, fixtures, retries and manual reruns. Optional installed-client
subscription probes and unrelated consumers of a shared provider key are outside
that API allowance and must be reported separately. No local adapter may use the
central billing key outside the request boundary. This is a proposed allowance,
not an established preference or evidence that the existing cadence fits it.
Keep USD 10 of that ceiling available for required reviews; routine maintenance
cannot consume the reserved review allowance. Actual requests reserve against
both the global ceiling and their applicable class before starting.

- An atomic GitHub ledger on a dedicated state ref records immutable reservation,
  attempt identity, settlement and reconciliation events. Compare-and-swap the
  head before each request; parallel jobs cannot spend the same headroom.
- Reserve conservative maximum liability from bounded input/output, applicable
  current prices and all charge classes before sending. Include each retry,
  cache charge and agent turn. Unknown prices, oversized requests or unavailable
  accounting refuse the paid call. Prompts, max-turns and a weekly decision
  budget are not dollar limits.
- Bind requests to run/input/attempt identity. A retry reconciles an uncertain
  request before sending again. Timeouts, cancellation and missing usage retain
  their full liability; restarting or crossing a month boundary cannot refund it.
- Settle reported usage separately from provider invoiced cost. Prove the key's
  consumers and project scope. Charges made elsewhere with a shared key cannot
  be included in a false total-bill guarantee.
- Verify a provider/project hard limit if one is available. Do not describe an
  advisory dashboard budget or delayed usage report as hard enforcement. A hard
  invoice guarantee remains blocked without enforceable provider semantics and
  control of the key's consumers.
- Batch changed inputs and skip unchanged work deterministically. If the required
  cadence and review gates cannot fit the proposed ceiling, report that before
  activation; do not silently weaken checks or raise the cap.
- Budget exhaustion pauses paid work visibly. Intake, accepted-view publishing,
  deterministic checks, health and alerts continue. Never bypass a required
  measured judge or restore OAuth to make a budget failure look green.

## Execution sequence and pull-request gates

### 0. Establish scope and cheap acceptance tests

Refresh main and open PRs; preserve user-owned changes. Inventory all jobs and
their real callers, authentication, schedules, outputs, current failure state,
actual paid consumers and prior-known-good revisions. Record hashes and exact
rollback targets. Verify safe metadata/read access, not production writes.

Read supported provider interfaces and both accounts' schedules when available.
Record missing tools/access explicitly. Confirm the outside observer's deployed
behavior and existing health-sweep route before extending it. Source inspection
alone does not prove a live deployment.

Create failing fixtures for OAuth absence, CLI absence, no API key, caller-secret
isolation, budget races/uncertainty and missed source/worker/alert receipts.
Run the baseline and distinguish existing failures from this change.

Exit: complete manifest and failure reproductions; exact scope and access gaps
are reviewable before any new paid run or privacy change.

### 1. Ship deterministic separation and the shared budget boundary

Implement the runtime manifest, request/reservation boundary and deterministic
health states using standard-library code and fake API responses. Remove the
docs push-validation/dry-run requirement for a subscription credential. Prepare
the independent watchdog. Before activating the allowance or making the first
cap-backed paid call, cover every concurrently enabled API route, including the
judge, existing API actions and native replay. Stage their adapters here; do not
defer accounting until after a paid migration review. An opaque paid action must
gain enforceable accounting or remain outside the new activation until its
explicitly approved pause/cutover. Existing operation may continue during code
preparation, but the new cap is not claimed live while any enabled consumer can
bypass it. Do not silently pause an existing route to pass this gate.

Exit: missing OAuth, missing CLI, missing model key and exhausted budget cannot
disable free checks, intake, health or already-accepted instruction delivery.
An executable consumer/bypass inventory proves coverage before the first paid
canary or measured judge run under the new allowance.

### 2. Migrate the two OAuth workflows, one passing PR at a time

First migrate the central harness proposer. Preserve its evidence eligibility,
limited decision queue, structured package guard and owner-acceptance boundary.
Then migrate documentation upkeep.

Reusable workflows run with the caller's secrets. An API key held in ai-harness
does not become available to ten callers. Therefore centralize scheduled model
drafting in ai-harness and keep target push validation deterministic. Do not add
cross-repository dispatch credentials to every target or copy an API key across
the fleet simply to preserve the old layout.

The existing docs model can run git/gh and write directly. Replace that with
drafting without repository write credentials, followed by deterministic
validation and a separate writer holding the existing fleet credential. Use
non-persistent checkout credentials, fixed output paths, current-head seals, allowed diffs, protected
administration regions, no-op coalescing and exact post-merge readback. Prove
loop prevention because fleet-token pushes can trigger workflows.

Classify each target as public or private before enabling central reads. The
current digest exposes commit subjects, authors and paths in step summaries;
validator errors can quote source values. Do not reuse those public outputs for
private targets. Review the API project/data-use boundary and execution audience.
Private source packs, drafts, diffs, prompts and model traces must stay out of
public summaries, logs, artifacts and failure text; allow only safe counts,
opaque digests and status. Sanitize validators as well as successful runs.
Use a verified private execution context if transient processing on a public
repository's runner cannot meet the approved boundary. Do not activate that
target while its privacy route is unresolved.

Discover enabled docs callers before changing schedules. Do not enroll all
eleven manifest entries blindly: instruction writes still exclude mindmake,
and a suspended docs writer must not be reactivated. Resolve mm-ctrl's verified
mindmake-ctrl identity explicitly. Migrate callers only within a captured
allowlist, preserving each repository's gates and deployment policy.

Exit for each PR: required deterministic checks and measured judge pass,
API-backed runtime evidence is real, no subscription/CLI fallback exists, and
the exact target outcome is independently read back. If skill/canon changes are
necessary, use their established provenance, review and release gates.

### 3. Prove existing API routes under the same controls

Exercise the judge, brain proposals, fresh-context evaluations and native title
replay adapters staged in phase 1 through the shared accounting boundary.
Preserve fresh context, observed reads,
native entry routing and explicit evidence classes. Keep model-readable source
and writer authority separate. Keep private title examples/model prose out of
public artifacts and logs.

Exit: an executable inventory/bypass check proves every enabled central paid
route is accounted for. Missing review evidence stays blocked; a schema pass
does not replace qualitative review or certify personal taste.

### 4. Decouple session learning from subscription-backed inference

Separate collection, deterministic episode selection/redaction, interpretation
and submission. Reuse the current parser and durable protocol. No raw history
is moved, no scope inferred from a session title, and no assistant claim is
promoted into a verified fact or an accepted requirement.

Prefer source-side delivery of already authorized distilled episode events to
the existing GitHub intake. Cloud collection for each required account must use
a supported session interface/export; an API key cannot create that access.
API inference can operate on another provider's sessions without requiring a
Claude executable, but the source's own access still needs independent proof.

If excerpts must travel for remote extraction, prepare this exact optional
privacy route for approval: a minimal private caller in existing private
`krishanraja/control-center`, invoking harness extraction code pinned to a reviewed
full commit SHA. Reverify private visibility, collaborator/Actions audience and
trusted-main/fork/PR restrictions before accepting a batch. It sends
only bounded, locally redacted excerpts, with no raw session export. Cap each
batch at 60,000 UTF-8 bytes and 20 selected episodes; preserve deferred source
items. Bind source account, destination, batch identity, input hash and response.
Private run visibility, counts-only logs, no excerpt artifacts and separate
API/writer credentials are mandatory. Pass only explicitly named secrets; never
use `secrets: inherit` for this route.

The private caller needs its own approved execution-side `ANTHROPIC_API_KEY`
placement; it cannot inherit the secret held in ai-harness. Verify existing
narrow GitHub access to reserve/settle against the same central budget ledger
before inference, with that credential kept out of interpretation. If the
required access is absent, present the exact scope for approval rather than
copying a broad fleet token. This is one reviewed private inference placement,
not API-key distribution to every fleet caller.

Request one-day artifact and workflow-log retention where GitHub actually
supports it. Verify the mechanism, dispatch/event retention and current API
project retention/data-use settings; do not invent a per-workflow run-retention
switch or promise immediate event erasure. A repository-wide retention change
needs impact review and approval for the other workflows it affects. If that
boundary cannot be verified and approved, this extraction route remains blocked.

Public ai-harness dispatches, issues, logs, artifacts, PRs and branches receive
only the already authorized distilled observations and opaque receipts. A public
repository branch cannot be made a private transcript inbox.

Preserve stable identity, strict parsing, exact pending replay, input-change
refusal, cross-route dedupe, equal timestamps, clipped suffixes, ID/payload
receipts and GitHub checkpoints. Failed interpretation or uncertain delivery
cannot advance a cursor. Each account emits a source-run receipt even when it
finds zero new lessons; a zero count is not proof that it enumerated the source.

Exit: both required cloud accounts have independently verified identity,
window/pagination and a real receipt chain, or the overall history-source
migration is explicitly blocked. Local-only collection remains a declared
exception and never a prerequisite for core processing. Do not duplicate the
existing PC repair, migrate private storage without approval, or disable old
schedules until replacement coverage and exact cutover approval are established.

### 5. Activate deterministic monitoring and reliable notification

Use a separate GitHub-hosted watchdog, hourly at 17 minutes past the hour in
London. It has no LLM/OAuth/PC dependency, no dependency on worker job success,
and no shared model mutex. Read live run status plus durable output/receipt
state. Detect never-started, stale, failed, overlong, budget-paused, inaccessible
and partially covered jobs/accounts. One healthy source must not hide another.

Reuse the existing Control Center outer observer in `api/health.ts`. It currently
runs when the dashboard is opened and ignores unknown components in its overall
verdict. Extract its check once and wire it into the existing six-hour
`api/health/connections-sweep.ts` owner, preserving that route's authentication,
service checks and scheduled deployment. No new cron is needed. This makes
observation unattended without duplicating the health source of truth. Do not
build a second outside
monitor or add a new service. Treat unreadable GitHub evidence as unknown or
degraded, not healthy, and keep optional PC health separate from central health.
Verify the deployed scheduled path, not just source code.

Reuse the existing Control Center waiting-list/digest route and done-check
registry. Prepare idempotent incident/recovery records and fix the current
sent-before-delivery behavior. Record pending delivery before sending, retry
the same item, and confirm authoritative readback before marking it delivered.
Weekly digest suppression must not hide a later actionable outage. Alert only
when Krish can act; repair routine technical failures within authorized scope.
Activation of the named notification behavior is an explicit sign-off item.
No new email, Slack destination or outbound channel is introduced.

A GitHub-only watchdog cannot report its own total platform outage. The reused
outside observer supplies another failure domain, not an infinite guarantee:
its own unavailability must remain visible rather than claimed away.

Exit: simulated worker silence, source silence, no first run, API failure,
budget exhaustion, unavailable GitHub and notification retry have independent
evidence; normal scheduled watchdog and outside-sweep cycles have run.

### 6. Cut over, observe normal schedules and close

For every enabled route, run an authorized bounded canary and then observe at
least one real normal scheduled cycle at the migrated revision. An empty
eligible queue may prove a legitimate scheduled no-work result, but it cannot
substitute for an exercised API/source route. Manual dispatch does not prove
cron delivery. Weekly routes remain pending scheduled proof until their next
normal tick; do not redefine success to avoid waiting.

Read back saved provider schedules and public/private workflow definitions.
Retire an old schedule only after the replacement is verified and its exact
disablement has approval. Keep known-good source, workflow definitions, cursors,
budget liability and notification state recoverable. Never automatically fall
back to a subscription route. Do not revoke or delete old credentials as cleanup.

Deliver a row for every check/source: before/after credential class, source and
target revision, cadence, last scheduled run, actual consumer output, budget,
privacy boundary, rollback and unresolved blocker. Separately report code
merged, active, runtime verified, schedule verified and source coverage verified.
Do not repeat a blanket 100% claim while any required migration or proof is open.

## Required regression and acceptance gates

- Unset OAuth and remove the Claude CLI in the hosted fixture: every enabled
  central route still runs using its intended credential, with no hidden fallback.
- Default GitHub tokens and fleet credentials remain outside model drafting;
  caller secrets do not accidentally become a cross-repository credential store.
- Two concurrent reservations at the cap, duplicate attempts, cancellation,
  timeouts, missing usage, price changes, retries and month rollover cannot
  overspend or erase unresolved liability. Unknown accounting fails closed.
- A consumer cannot bypass the shared budget; provider usage and invoices are
  labelled correctly. Cap exhaustion leaves free operation and alerts functional.
- All existing episode/privacy/acceptance/history/rendering/reconcile suites
  still pass, including the full learning-loop fixture and merged-byte readback.
- Private material cannot reach public dispatches, logs, artifacts or proposals;
  synthetic and production evidence remain separate.
- Missing, stale or inaccessible sources are distinct from healthy zero-work
  sources. Never-started sources and independent account failures are detected.
- Failed notification delivery retries without duplicates or false sent state;
  a previously sent weekly digest cannot suppress a new material incident.
- Preserve multi-file skill resources, repeat-identical standard/Perplexity
  packages, paired-resource loading and the ctrl-intake voice/transcript route
  if a maintenance schedule or release is touched. Read saved prompts back.
- Windows validation, existing steward checks, context integrity and the
  measured judge run where applicable. No invented ruling, waiver or green
  status replaces an unmeasured gate. Preserve historical ledger bytes.
- Exact rollback and resumed delivery are exercised through the same operational
  surface with fixtures before relying on them in a failure.

## Approval and access boundaries

This planning request authorizes the plan and read-only discovery, not activation.
Implementation sign-off must name the bounded PR/merge/caller rollout scope and
the USD 50 monthly allowance before new paid routes are enabled. Prepare each
change and rollback for review before an approval gate becomes the next action.
An explicitly approved standing allowance covers routine calls within its named
scope; do not ask for approval for each retry already covered by that allowance.

The private extraction destination/data/retention and the existing outside
observer/notification activation are separate, named review items. New service,
permission, subscription, credential rotation, deletion or a budget increase is
outside this plan's routine technical discretion. Continue independent work if
one access or privacy boundary is blocked, without calling the whole goal done.

Use existing configured secrets where adequate; never inspect their values.
If needed, Krish enters `ANTHROPIC_API_KEY`, `FLEET_TOKEN` or the existing
notification credential only in the appropriate repository's Actions secret box:

- https://github.com/krishanraja/ai-harness/settings/secrets/actions
- https://github.com/krishanraja/control-center/settings/secrets/actions

Verify account/project scope and required secret presence through safe metadata
and approved runner preflights. Do not duplicate broad fleet credentials into a
model step or expand scopes silently. Commit/PR descriptions contain no model identifiers; ruling trailers quote
only decisions Krish actually made, never an agent-authored approval.

## The call and its limits

Choose the GitHub-first route with one budget boundary, central docs drafting,
source-specific adapters and the existing outside observer. A new VPS, queue
or inference framework adds operational burden without solving private-history
access. A fully deterministic alternative costs no model tokens but cannot
perform the required semantic interpretation or measured qualitative judging.

The sharpest smaller option is migrating only the two OAuth workflows. It
improves resilience quickly, but leaves history extraction, budget accounting
and whole-loop silence unresolved. It must be labelled a partial migration.

The first executable move after implementation sign-off is the cheap inventory,
failure fixtures and protected budget/watchdog foundation, followed by the
proposer and docs migrations. The consequential unknowns are supported access
to both cloud histories, the key's actual billing scope, required cadence within
the proposed cap, and private-event retention. Each has a falsifiable gate above;
none is silently converted into an assumption of success.
