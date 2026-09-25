# History log

Chronological record for `krishanraja/ai-harness`. Newest first. The steward
rolls entries out of `NOW.md`'s "What changed recently" into this file when they
pass 30 days, and adds a line whenever a document is superseded, banners or
moved. Nothing here is ever rewritten.

## 2026-09-25

- The `consumer-app-outcomes` candidate was repaired and moved to
  `candidates/`. As committed under `skills/`, the release builder would have
  shipped it as a 30th skill, and its own validator could not run because
  `source-ledger.json` was never committed. A live readback found all 15
  onboarding, retention and trust-building records citing pages that do not
  exist. Those were rebuilt from the real pages, and all 73 sources are now in
  a checked ledger. The catalog gained an append-only evidence log with
  computed status, so records can gain or lose strength from real product
  results. Validation now runs candidate packages without packaging them.
  Routing and registry changes are staged in the proposal, not applied.

- The SURFACE maintainer exposed a pre-record failure after unrelated Claude or
  Cursor skill directories appeared on a Codex-only managed host. Host identity
  had been coupled to the absence of unowned client roots, so the runner exited
  before it could write fresh evidence. The resolver now binds SURFACE to its
  machine name and managed Codex root, records other roots without managing
  them, and carries a regression fixture proving they cannot make the host
  ambiguous or expand the runner's authority.
- Release `v2026.09.24.3` became the durable cross-client quality-system release.
  Its 29 canonical skills were hash-verified on Claude Code, Cursor and Codex on
  LORIMER, then replaced through the authenticated Claude and Perplexity cloud
  catalogue flows without deleting user-owned skills. Cloud catalogues expose
  inventory and content readback, not byte-level installed-package parity.
- The two Codex-only quality overlays were retired as provisional state because
  their accepted changes are now contained in the immutable release. The live
  Claude canary retained its stochastic `strategy-brief` failure, Codex retained
  its partial/unmeasured verdict, and Cursor retained its manual-canary status;
  none was relabelled green.
- `NOW.md` was collapsed to a fresh, non-duplicative narrative entry point.
  Volatile state belongs only in generated `CURRENT.md` and the registry; this
  file remains the append-only chronology. This collapse dropped four required
  frontmatter keys and all seven required sections from `docs/steward/SCHEMA.md`
  without updating the schema itself, and the commit that made it (`f11caf9`)
  carried no `docs(steward):` prefix, so it fell outside the docs steward's own
  territory. Corrected below.

## 2026-09-24

- reconciled at `e1dae13`: `NOW.md`'s schema drift (see the 2026-09-25 entry above)
  was corrected: the strict validator had started failing on eleven counts. Restored
  the missing frontmatter (`head`, `production_url`, `truth_files`, `steward`) and
  rebuilt the seven required sections from `CURRENT.md`, `state/skill-registry.yaml`,
  the digest and recent commit rulings, and removed six em dashes. The intent behind
  the shorter form, that `CURRENT.md` is the sole volatile-state authority and
  `NOW.md` stays narrative rather than a duplicate ledger, is preserved inside the
  compliant structure rather than discarded. Also found and reported rather than
  silently fixed: `harness-maintainer`'s skill review is 35 days old against its
  own 30-day freshness SLA.

## 2026-09-20

- reconciled at `9bec0078`: sections 4.5, 4.6 and 4.7 of the retirement map settled with Krish's rulings, and the Telegram change applied on the host with its evidence merged. His override on `loz-api-monitor` is written in as an exception rather than left implicit, because a job running against a documented instruction to stop it looks like an oversight to the next reader.
- reconciled at `d62858f`: the settle-the-unknowns prompt was written, run on the host, and its 206-line report merged. The gateway job count is settled at 45 against three disagreeing numbers, nine of eleven unknown jobs retire, and the retirement map gained a corrections section that wins over its own body. Two claims of mine were corrected in the same pass: Telegram is not a pull-only breach (every node is disabled and the delivery claims are false), and the bot-token exposure is one live node with an unknown live count, not sixty. `NOW.md` re-headed with three bullets.
- reconciled at `0390a0d`: two non-steward commits since `b654fb0`. The VPS retirement map
  (62 rows, two refutation lenses each, every row labelled with the model that checked it)
  and a correction to the OpenClaw operator handoff, which had been written as a list of
  things to go and find out twenty minutes after the audit that found them out was committed
  to this repository. `NOW.md` re-headed with two bullets.

## 2026-09-19

- reconciled at `b654fb0`: the canon's two-channel rule was replaced by the three
  subchannels and the authority for a mandate moved to `venture_formats.mandate` in
  Mindmaker OS. The OpenClaw VPS was audited from the host, its report and the raw
  audit output committed to `state/vps/` and merged, and the operator handoff
  corrected against two independent verifiers. `NOW.md` re-headed with three new
  "What changed recently" bullets and two "Do not trust" lines.
- note: the `openclaw-vps` heartbeat stops at 2026-09-19T09:05Z because its GitHub
  token is invalid, not because the host stopped. `audit-harness.mjs` will open a
  finding at 48 hours; that finding will be true about the credential and false
  about the machine.

## 2026-09-08

- SURFACE installed `v2026.09.08.2` with 29 of 29 per-skill hashes and the
  139-file release aggregate matching. The first full Codex canary sheet was
  recorded as a failure rather than corrected to expectation.
- Machine release work moved into `scripts/Invoke-HarnessSync.ps1` and the
  `Mindmake AI Harness Sync` Windows Scheduled Task. It plans before applying,
  passes the previous deployment record, stops on unknown drift, verifies direct
  manifest parity, records observable canaries, opens an evidence pull request
  and sends a cloud heartbeat. Cursor canaries remain manual.
- The reconciler and the harness audit added (`scripts/reconcile.mjs`,
  `scripts/audit-harness.mjs`), both wired into `harness-steward.yml` nightly.
  The reconciler writes only through pull requests and never overwrites an edit
  made inside the markers; the audit never writes at all.
- Proposal issue #3 opened and resolved the same day: a block edit in
  `contentarchives` widening the secrets rule to cover commit messages and issue
  and pull request bodies. Resolved as option 1, the edit belonging in the canon
  rather than in one copy of it, so `contract/templates/canon-block.md` carries
  it and all ten surfaces re-render.
- `NOW.md` corrected. It had claimed trigger accuracy read `unmeasured` for all
  29 skills, inherited from a plan document rather than read from the registry.
  The registry carries `evaluation_evidence` for `n8n-operator` and
  `instantly-operator` only, while 19 per-skill result files from 2026-08-05 sit
  in `state/` and were never folded in.
- `NOW.md` and this log created. ai-harness joined the docs steward fleet as its
  ninth repository (`control-center` `docs/steward/fleet.json`), so the canon is
  maintained the same way it asks every other repository to be maintained. The
  registry is registered as a truth file: read, never written.

  Two entries rolled out of `NOW.md` on creation because they were already past
  the 30 day window:

## 2026-08-07

- Design-intelligence search evaluated and deliberately narrowed to a
  manual-only, read-only subordinate of `krish-design`, with the upstream
  installer, auto-trigger language and generic stack authority suppressed
  (`state/design-intelligence-search-evaluation-2026-08-07.md`,
  `state/import-review-ui-ux-pro-max-2026-08-07.md`).

## 2026-08-05

- The curated set was established: independent per-skill evaluations across 18
  skills, a quality readiness matrix, and the first release proof
  (`state/quality-readiness-matrix-2026-08-05.md`,
  `state/release-proof-2026-08-05.md`).
