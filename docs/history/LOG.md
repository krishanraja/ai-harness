# History log

Chronological record for `krishanraja/ai-harness`. Newest first. The steward
rolls entries out of `NOW.md`'s "What changed recently" into this file when they
pass 30 days, and adds a line whenever a document is superseded, banners or
moved. Nothing here is ever rewritten.

## 2026-11-01

- stamped: `NOW.md` audit failures (13 recent bullets, 11 Where bullets) fixed by rolling the entries below here; head moved to 06e31ad.

- rolled from NOW.md: krish-voice voice-profile v1.5 records rulings 7 and 8 (Krish, 2026-10-31): a script closes on the one thing he would do, never a list of orders, and a slow listener can hold it heard once; the rules and numbers live in content-engine (SCRIPT_CLOSE, LISTENING, krishanraja/content-engine#307). (2026-10-31)

- rolled from NOW.md: krish-voice's profile is v1.4: it records where each kind of voice rule lives and how it gets better (doctrine and profile by reviewed pull request; written-voice rules from his words through the taste ledger, live; read-aloud rules he keeps through content-engine's learning proposals, live in its Scripts step). Behaviour case 031 holds that a measured pattern is never a rule without his yes. (2026-10-31)

- rolled from NOW.md: krish-voice's profile is v1.3: the Spoken script register is measured from 14 of Krish's recorded takes against their scripts (he keeps the length, says it plainer, adds an aside, tells his own part), with its limits; behaviour case 030 holds it. (2026-10-31)

- rolled from NOW.md: krish-voice's profile is v1.2: Jonny's Mindmake emails take Krish's email style, as Jonny, with Krish in the third person (ruling 6); `outbound-email-voice.md` says the same, and behaviour case 029 holds it. (2026-10-31)

- rolled from NOW.md: krish-voice has a measured voice profile (`references/voice-profile.md`, v1.1) with Krish's five channel rulings, and `evals/voice/fingerprint.mjs` scores a draft against it (9 of 10 held-out originals beat generic rewrites). (2026-10-31)

- rolled from NOW.md: `contract/channel-tasks.md` defines the seven channel tasks (platform truth, profile audit, idea bank, reel script, caption set, trend scan, channel plan) and the weekly loop from gap to North Star. growth-makeyourmindup, growth-heartside and growth-fulltime link to it directly (their pull requests 45, 31 and 18, merged). (2026-10-30)

- rolled from NOW.md: Second night of the 2026-10-28 rollout: mm-ctrl's steward passed on its alias, 7 of 18 NOW.md files pass the audit (from 1 of 14), and the fold runs on every session's merge here. Two defects in that work are fixed: the bot merger opened and closed pull requests for older content-engine fallback branches one by one (#243, #244, #266), and the audit failed busy repositories on bullets the fold added hours before the steward trims. (2026-10-30)

- rolled from NOW.md: the judge's PR 189 findings are fixed, and so are the two gaps that let them merge. A Krish ruling now overrules only the blocking findings whose file its own commit changed, and a ruling in a merge commit overrules nothing (`scripts/judge.mjs`; replayed on PR 189's range, it would have kept the taste-sync provenance regression blocking). The canon block's 14 clauses are now in `brain/rules.yaml` (recorded in `docs/proposals/2026-10-30-canon-block-in-ledger.md`), so an in-place edit to one fails `validate-surfaces` until it records a source; `canon.taste` cites the new `docs/proposals/2026-10-30-taste-by-venture.md`, which quotes his 2026-10-28 words and gives the reasons and the fallback. The approved-taste headers that again say how a rule was approved, and that each names its claim, are rendered by krishanraja/inspirationhouse#32 (merged) and arrive by the next taste-sync pull request, not by hand. Krish ruled on 2026-10-30 that taste rules stay separate per venture but able to be cross analysed later. (2026-10-30)

- rolled from NOW.md: 2026-10-27 **A Drive file now has a registered home, because the Drive create and copy tools default to the top of his Drive when no parent is named.** `tools-access` rule 11 requires an explicit `parentId` inside CURRENT, ARCHIVE or Ventures, `CURRENT/00_INBOX` when the home is unknown, and a read-back of the file's parent; one behaviour case and one trigger case cover it (PR 141). Ruling (Krish, 2026-10-18): every Drive file has a registered home, always; no session saves a file loose at the top of his Drive.

- rolled from NOW.md: 2026-10-27 **LORIMER's sync stopped needing hands: PR 170 merged.** The sync had stopped on 2026-10-27 over Claude's own `.trash`, an unregistered `tool-router` and a `__pycache__` that `locked-revision`'s scripts left in an installed skill on 2026-10-22; the hash algorithm was left alone because ignoring `__pycache__` would let a planted `.pyc`, which Python can load in place of verified source, go unmeasured. Registered as v2026.10.27.1, then v2026.10.27.2 after Heartside's context routing moved to its current docs (PR 172, a manifest change only).

- rolled from NOW.md: 2026-10-26 **Epidemic Sound joins the tool map for Heartside, Full Time and makeyourmindup creative, on his own channels only.** Until now the map's only music route was Runway's `generate_music`, on Heartside and Full Time credits. It gives agents a licensed library with stems and edit-to-length. Its stock voiceover is never presented as Krish. Control Center's catalog carries the placement (krishanraja/control-center#565). Ruling (Krish, 2026-10-26): Epidemic Sound is a tool for his ventures, for Full Time and Heartside creatives and makeyourmindup content. Ruling (Krish, 2026-10-26): Heartside and Full Time creatives go on his own channels, not paid ads.

## 2026-10-30

- stamped: `NOW.md` audit failures (23985 characters, 19 recent bullets, 18 Where bullets) fixed by rolling the entries below here and cutting "Where it is right now" to 8 bullets.

- rolled from NOW.md: 2026-10-24 **Control Center's cron now knocks the watchdog at :17 every hour, because GitHub started its schedule twice in the first eight hours and then not at all for five.** The workflow takes a `trigger` choice (`manual` or `control-center-clock`) and names each run after it, so Control Center counts its own clock's runs as scheduled delivery and still never a manual one. The GitHub schedule stays as a backup. Ruling (Krish, 2026-10-24): Control Center's cron, not the VPS, fires the harness watchdog hourly.

- rolled from NOW.md: 2026-10-24 **One model-written repository review that breaks the gate is now refused and named, instead of failing the whole weekly proposals run.** On 2026-10-19 a single `invalid_review_text` threw out of `openReviews`, so `repository-administration` proposals failed and the watchdog has held `central-repository-proposals` red since; valid proposals in the same batch were lost with it. GitHub failures still stop the run.

- rolled from NOW.md: 2026-10-23 **The weekly digest reaches Krish's list through Control Center, because the engine refused the harness's own post every night.** The board takes an item that only he can close from Krish or Control Center, never from an agent's key, so housekeeping failed nightly from 2026-10-18 and the first watchdog run reported it. Control Center's connections sweep now writes the pending item from `state/digest/latest.json`; housekeeping only reads the board to record delivery, and waits without failing until it is there. Ruling (Krish, 2026-10-23): route the harness digest through Control Center.

- rolled from NOW.md: 2026-10-23 **The independent harness watchdog now runs hourly at :17, because Control Center had been reporting harness-central as critically down for four days.** The watchdog was built as a manual-only observer awaiting approval, and Control Center read "never ran" as "down". Ruling (Krish, 2026-10-23): activate the harness watchdog hourly at :17. The manifest's `watchdog.activation` is now `enabled`, which is the value Control Center's reader counts as a normal schedule. Notification delivery stays disabled.

- rolled from NOW.md: 2026-10-23 **The North Star now has a number, a weekly ladder and an urgency rating, so every session knows how far behind it is and how hard to push.** Ruling (Krish, 2026-10-23): every repository chases one aggressive number on a weekly ladder, and urgency U1 to U5 sets its intensity. The number and ladder are in `docs/NORTH_STAR.md`; where it stands is the first line under "Where it is right now". Contract: ai-harness `contract/north-star-metric.md`.

- rolled from NOW.md: 2026-10-23 **The publisher could never deliver to a repository whose last administration pull request was squash-merged with its branch left in place.** Control Center blocked with `administration_branch_has_unknown_drift` on the closeout hook fix, because a squash merge leaves the branch diverged from main. When that exact branch head was merged, the publisher now opens a fresh, content-named branch beside it, never resetting or deleting the old one; any other divergence still blocks. A test reproduces the block on the old code.

- rolled from NOW.md: 2026-10-23 **The closeout hook let a fresh cloud session stop without closing out, because the clone's `origin/main` was two days stale.** A canary session committed product work and was not stopped: the range read from the stale base swept in already-published `NOW.md` updates. The hook now fetches the default branch first (ten seconds, best effort) and also measures from the local default branch once HEAD has left it, so published closeouts never excuse a session. A test reproduces the failure on the old code. The new hook bytes are bound in `contract/repository-administration.json`, and the old ones upgrade in place.

- rolled from NOW.md: 2026-10-22 **Every session now has to leave NOW.md and a North Star check current before it ends, because the steward only rewrote NOW.md nightly from commit messages.** Ruling (Krish, 2026-10-22): every session checks at the end that the North Star does not need recalibrating and that status and next steps are current, automatically. One script enforces it as Claude Code's Stop hook and as a pull request check, so Codex is held by the same rule; the publisher delivers it to all 13 admitted repositories, Heartside, Legibility and growth-heartside newly among them. The steward's validator accepts a session's own NOW.md update as current and never lets the steward touch a North Star. Four fleet lists had drifted (three repositories were in two of them), so `state/fleet.yaml` is now the one list. PR 152; `docs/proposals/2026-10-22-session-closeout-and-one-system.md`.

- rolled from NOW.md: tool-router now places 21st Dev's monthly AI credits on interface implementation once krish-design has decided the design, within the prepaid allowance only, with design lookups left to design-intelligence-search; Control Center (krishanraja/control-center#615, #617) tracks every prepaid credit pool wiped at its reset, gives each growth engine its placement share in its directive and emails Krish a week before a wipe and every Monday. (2026-10-29)

- rolled from NOW.md: Every growth engine now has one doctrine: `contract/north-star-metric.md` gained an Engines section (lead with the gap line, scale volume to policy bounds at U3 and above, file the clearing lookup or queue the clearing ask with every hold, take another path after a no to one ask without re-asking a Purged person, check in every other day while a plan is open, learn from wins and declines) and Control Center's line-manager duties (monitor, push, rank by weekly goals, hold). The four missing engines (growth-makeyourmindup, growth-mindmake, growth-fulltime, growth-legibility) joined `state/fleet.yaml`, the docs steward fleet and the central steward's options, and stay out of the repository administration publisher until Krish accepts them there; the canon block points engines at the section. Rule 4's re-route covers a no to a single ask only: a Purge on a go-live or a no on a check_in ends the plan and its goal until Krish reopens it. Reconciliation finding for Krish: rule 5 asks for a check_in at least every other day, while growth-legibility (AGENTS.md, Autonomy) and growth-makeyourmindup (AGENTS.md) say at least twice a week; the canon lets a repository's rule win on repository matters, so which cadence binds those two is his call and neither side was changed. Steward readiness, open in those repositories: growth-fulltime's NOW.md names `history_log: docs/history/LOG.md` but has no `docs/history/`, and growth-legibility's NOW.md has `head: see Git HEAD` instead of a sha (its fleet `bootstrap_head` bde3bcf came from origin/main); `scripts/steward/validate.mjs` fails both until each repository fixes its own NOW.md. (2026-10-29)

- rolled from NOW.md: krish-principles now carries "Working with Krish", his own instructions for how any AI works with him (decide don't defer, never hand the blank page back as a question, carry the why, match conviction to stakes, show don't tell, push back once like a peer, fewer round-trips per decision, watch the isolation pattern), in his words, so Claude, Codex and Cursor get them through get_skill and the release instead of one account's pasted settings. (2026-10-29)

- rolled from NOW.md: The claude.ai pointer now loads the live routing on every conversation, short tasks included, after an end-to-end test in one account showed that a one-line edit, a single-function fix, a correction and a decision recall all skipped routing under the old "substantive conversation" wording. The setup doc now matches the real page: the remove dialog does not name the skill, so each removal is checked by the list losing exactly that one name, and the field lives under Settings > Account. (2026-10-29)

- rolled from NOW.md: No recurring job runs in either claude.ai account any more. On 2026-10-29 the Cowork safety check refused to create the unattended sync in one account, and the run in the other stopped at `account-unproven` because its connector did not yet offer `check_krish_account`. The Instructions for Claude field now holds a fixed pointer (`adapters/cloud/account-instructions.md`) that loads the full routing (`adapters/cloud/account-routing.md`) live through `get_skill`, so it never needs changing again. `adapters/cloud/account-setup.md` is a one-time setup Krish runs in a chat in each account: it shows the exact skills to delete and the new field text, and changes nothing until he says yes. (2026-10-29)

- rolled from NOW.md: The claude.ai account routine now assumes nothing from an earlier run: it opens a fresh tab at the skills page, acts on whichever of Krish's two accounts the browser shows, after Control Center's `check_krish_account` confirms the signed-in email is his (any other account stops the run), reads lazily loaded lists to the end, checks each delete confirmation names the same skill, and stops with a named reason on a missing browser, a sign-in page, an unrecognised page or an unconfirmed read-back. Runs that stop part way are safe to repeat. (2026-10-29)

- rolled from NOW.md: The claude.ai accounts stop holding harness skills. Control Center's get_skill serves every skill, the account instructions (name "account", file "instructions") and the account routine (file "sync") live from main. The loaders merged in #180 are removed, because they still needed an upload whenever a description changed. A scheduled Cowork task in each account runs `adapters/cloud/account-sync.md`, which deletes uploaded copies of exact harness names and makes the instructions field equal the served text. The canon now tells every session with no installed skills to read them through get_skill. Both claude.ai surfaces stay recorded as stale until a routine run's observation is read back. (2026-10-29)

- rolled from NOW.md: Skills stop being copied into claude.ai. Each account will hold a loader per production skill whose body reads the instructions live from ai-harness main through Control Center's new get_skill (krishanraja/control-center, branch claude/stoic-cannon-90pyv6, not yet merged or deployed). On 2026-10-29 seven of the 29 skills in the readable account were behind main and the second account had never been read back. tool-router is now production skill 30. Both claude.ai surfaces stay recorded as stale until the one-time cut-over is read back. (2026-10-29)

- rolled from NOW.md: The first night of the 2026-10-28 rollout read back: 12 of 13 canon-sync pull requests merged themselves (full-time held by its red typecheck), 10 of 12 nightly stewards passed every step on the new token, and this repository's NOW.md was cut to the audit limits. Two leaks were found and fixed: mm-ctrl's steward failed every night because its GitHub name is mindmake-ctrl (fleet entries now answer to aliases), and steward fallback branches never got a pull request (the bot merger now opens one for the newest and reports the rest; content-engine held eight). (2026-10-29)

- rolled from NOW.md: **The harness's own pull requests merge themselves, and NOW.md audits run nightly** (PR 175, merged 2026-10-28; Rulings, Krish, 2026-10-28). `scripts/merge-bot-prs.mjs` merges canon-sync and PC-evidence pull requests when green; closeout notes in `now-notes/` are folded into NOW.md on main; `scripts/steward/audit-now.mjs` checks every NOW.md against `config/now-audit.json`. This file failed that audit on 2026-10-28 and 2026-10-29 (size, bullet count) and is cut back to the limits in this run. Canon sync to v2026.10.27.2 merged here as #177.

- rolled from NOW.md: **Release and surfaces.** Latest approved release is v2026.10.27.2 (source `6a8eef1`, published 2026-10-27T16:55:34Z). `CURRENT.md` still records all four local surfaces at v2026.10.06.3, 29/29 exact and awaiting automatic install, and the cloud surfaces stale (the two supervised Claude accounts need a manual upload, Codex Cloud an environment refresh; `claude-secondary-cloud` is unknown). A hash match proves installed bytes only. Canaries on the local surfaces show zero failures with declared unmeasured routes; `cursor-primary` has no headless canary.

- rolled from NOW.md: **LORIMER's sync.** `state/heartbeats.json` shows `harness-sync-lorimer` `blocked` since 2026-10-28T07:50Z with reason `release-assets` (one failing run), after the `checkout-untracked` outage of ten runs closed on 2026-10-27. `session-miner-lorimer` was `degraded` as of 2026-10-26. Read the file, not this line, before trusting either.

- rolled from NOW.md: **Epidemic Sound and taste.** Epidemic Sound is on the tool map for Heartside, Full Time and makeyourmindup, on his own channels only (`docs/proposals/2026-10-26-epidemic-sound-placement.md`). `krish-voice` and `krish-design` read approved taste from `references/approved-taste.md` (PR 164) and canon tells every repository to report his typed corrections to the taste ledger (PR 165, `docs/proposals/2026-10-26-two-way-taste.md`).

- rolled from NOW.md: **Skill review dates.** As of the registry on 2026-10-19, 13 of 29 skills were past their freshness SLA, led by `krish-design` and `krish-content-marketer` (both reviewed 2026-08-05). Not recomputed since.

- rolled from NOW.md: **Candidates**, excluded from packaging and not among the 29: `consumer-app-outcomes`, `tool-router` (behaviour unmeasured; byte-identical copy in `.scratch\ai-harness\quarantine\2026-10-27\`) and `tool-economics` (staged, inactive). See `state/candidates/`.

- rolled from NOW.md: **Credential exposure** opened 2026-09-12 is in approved remediation, not closed (`state/credential-exposure-2026-09-12.md`).

## 2026-10-29

- stamped at `bb1c0ef`: `NOW.md` head moved from `e7040e8`. The NOW.md audit failures (size, 39 recent bullets, stale Where section) were fixed by rolling 27 bullets here and cutting "Where it is right now" to current facts; LORIMER's heartbeat (`release-assets`, 2026-10-28) and the PR 175 merge were brought in. The long release paragraph and five superseded "still to read back" lines left NOW.md; their text is kept below.

- rolled from NOW.md: 2026-10-19 **A vendor-neutral stack lookup showed the Claude account could skip its tool catalogues, so catalogue discovery moved to the front of the cloud instructions.** The commit's own account: the lookup "found that the Claude account could bypass catalogs and return incomplete page metadata." Discovery now comes first, no-spend preparation is separated from execution, and owner approval is kept; the corrected Claude session found the specialist API and both clients prepared exact-input plans, while provider execution "remains pending human dashboard approval." Ruling (Krish, 2026-10-19): verify specialist API discovery from a simple prompt without naming the provider, and correct missed routing. Ruling (Krish, 2026-10-19): finish master instructions and secure cloud tool access for Claude and ChatGPT/Codex, with useful tool execution first and Gemini last. The adapter had to be refit to the account instruction size limit. Commits `9144a3c`, `17c9d5c`, `115d575`, `d350c56`, `bd743ba` (PRs 148, 149).

- rolled from NOW.md: 2026-10-19 **Tool Router was installed on four surfaces without a single paid lookup or model test run, so the record says configuration, not behaviour.** Ruling (Krish, 2026-10-19): execute and merge PR 150, preserving personal instructions and the restriction on paid lookups and model test runs. The commit separates what is proven from what is not: installation evidence is distinct from "unmeasured session behavior", the candidate stays outside `production_active` and automatic release packaging, and "no formal admission or behavioral certification is implied." CI was skipped on purpose to avoid rerunning the API-backed judge. Commit `039b1de`; `docs/proposals/2026-10-19-tool-router.md`.

- rolled from NOW.md: 2026-10-19 **Tool economics was staged as a candidate on the MCP connection that already existed, and Gemini refused the link.** Ruling (Krish, 2026-10-19): use the already connected harness MCP for Claude, ChatGPT and Codex rather than duplicate reader links. A routing clarification kept MCP first while leaving room for direct API use. The candidate's evidence records that Gemini rejected the economics URL-token link because it requires standard OAuth. It routes among tools present in a session and stores no vendor balances or fixed prices. Commits `af0e567` (PR 146), `1f631ad` (PR 147); `docs/proposals/2026-10-19-tool-economics.md`.

- rolled from NOW.md: 2026-10-18 **Every repository got a North Star, and a session that moves none of it must say so.** Ruling (Krish, 2026-10-18): every repository has a North Star, and every session anchors to it. `docs/NORTH_STAR.md` names three goals: by 30 November 2026 no AI working for Krish needs the same correction twice, by the same date a fleet of agents runs Mindmake's daily operations to his standard, and by January 2027 the harness is the public reference for how one operator runs a company on AI agents. A later ruling the same day set the dates to agent speed: "North Star timeframes assume agents do the work, not humans." Commits `b37a7d0`, `669e86d`.

- rolled from NOW.md: 2026-10-18 **Documentation checks and learning were cut loose from the subscription, and nothing new that costs money was switched on.** The commits' own terms: push validation and dry runs "use read-only jobs", the scheduled writer stays separate, and "new spending, transcript transport, docs enrollment and notification policies remain disabled" (`config/inference-policy.json` is disabled, unpriced, with no approved allowance). A first attempt failed because "GitHub validates job environment expressions before runner context exists", so the private handoff directory is now allocated in an executing step. Commits `061ca41`, `b4e8c15`, `3b1b137` (PRs 136 to 138); `docs/harness/subscription-independence.md`.

- rolled from NOW.md: 2026-10-18 **Cloud sessions are covered by two layers because no supported interface lets a GitHub runner read them.** Ruling (Krish, 2026-10-18): cloud sessions are covered by live capture through Control Center plus one weekly Claude-scheduled miner per account; no GitHub collector. Before that, "every cloud-events submission stopped with 'Cloud progress could not be represented safely' before sending" because provider timestamps carry six fractional digits and the checkpoint validator allowed three. Imported inbox lessons now carry their source account (Ruling (Krish, 2026-10-18): inbox lessons carry their source account). Commits `41ef254`, `8c8e371`, `b72dc3a` (PRs 140 to 143).

- rolled from NOW.md: 2026-10-18 **Superseded proposal and sync histories were kept, not overwritten.** The dated 2026-09-13 to 2026-10-12 proposals, variant branch snapshots and the 2026-09-08 and 2026-09-20 notes now sit in `docs/proposals/` and `docs/history/branch-snapshots/`, with `docs/history/BRANCH_RECONCILIATION_2026-10-18.md` recording the reconciliation, so current state was not overwritten by variants. Commits `a616b12`, `55bae53`, `efa198d`, `238755f`, `b7b15f2`, `88db1cb` (PR 139).

- rolled from NOW.md: 2026-10-17 **Repository operating guides are now administered from a central brain, under an approved plan, with a rollback.** Ruling (Krish, 2026-10-17): approved brain-repository-administration-v1 for autonomous implementation, tested merges, bounded rollout and rollback. Release v2026.10.17.1 carries it. The commits' own evidence: ten independently read-back target views, four fresh-Claude pilot fixtures, and a rollback that preserved current human instructions; "source-history coverage and long-term effectiveness remain separately unmeasured." Only declared administration regions (`krish-repo-admin`, `docs/HARNESS_CONTEXT.md`) are touched, and this steward leaves them alone. Commits `e5ad24c`, `7ef3bb6`, `add0c61`, `93253e6`, `14d6420`, `7a657d1` (PRs 130 to 135); `docs/harness/repository-administration.md`.

- rolled from NOW.md: 2026-10-16 **The PC's nightly sync reported `blocked` and said nothing about why, so it now sends one fixed reason word, and the judge panel spent the day finding what each fix left unsaid.** LORIMER's sync on 2026-10-16 ended `blocked` with no cause. The sync's dirty-checkout gate stays in full ("loosening the gate rested on a suspicion") but now names which kind of dirt stopped it: tracked edits, untracked files, or a git warning, counts only. The recorder (`scripts/record-machine-heartbeat.mjs`, words in `scripts/heartbeat-reasons.mjs`) appends every reason an outage carried, each dated, bounded at ten, and checks every value it reads back, so a damaged entry starts a span afresh. The digest says the reason is what the latest run said, and "never invent a run count". The guardian now counts blocked runs, not hours: the policy promised two blocked nights in a row but the code "fired a day after the first, so a PC switched off after one bad night would have reached Krish." Ruling (Krish, 2026-10-16): the PC sync's heartbeat may carry one fixed reason word to the public ledger as a standing automatic send, never error text, names or paths. `scripts/judge.mjs` now shows the panel the scripts a canon line cites, after the panel marked the guardian policy a contradiction without being shown the script that implements it. Commits `b6e917b`, `45cc96e`, `1954d65`, `8daa818`, `eadbd3f`, `02ac386`, `bf1771f` (PR 129); proposal `docs/proposals/2026-10-15-pc-guardian-and-chat-lessons.md`.

- rolled from NOW.md: 2026-10-15 **Releases now cut, register and install without a person, because Krish's merge is the approval.** Ruling (Krish, 2026-10-15): every release built from main after he merges a change counts as approved by him and installs on his PC automatically. `harness-auto-release.yml` releases main after Validate passes if a skill changed since the last release, and a register job in `release.yml` records the release in the registry with `scripts/register-release.mjs`, which recomputes the skills-tree aggregate from git objects and reproduces v2026.10.06.3's recorded aggregate exactly. Ledger, heartbeat and registration commits change no skill, so it cannot loop. Stage 8 of the routing contract grew by six characters to name who approves a release. Commits `8bdb572`, `2d4db3f`, `461471b` (v2026.10.15.2).

- rolled from NOW.md: 2026-10-15 **LORIMER's nightly sync had been dying every day since 2026-10-06 and nothing said so.** The commit's own account: the task "has started every day since 2026-10-06 and died with exit code 64, PowerShell's code for a script path that does not exist." A run that died before reading the release sent a heartbeat the recorder refused, so "nine days of silence looked exactly like a healthy machine that was switched off." `scripts/Repair-HarnessPc.ps1` is a one-line repair, the sync now fast-forwards a clean checkout, and the digest raises "Your PC stopped checking in" when the sync goes quiet past the guardian's `silent_days`. Ruling (Krish, 2026-10-15): fix the PC's nightly sync and fold the session miner into it, so nothing needs installing by hand. Commit `5fe25d2`; proposal `docs/proposals/2026-10-15-pc-guardian-and-chat-lessons.md`.

- rolled from NOW.md: 2026-10-15 **Lessons mined from private chats now reach the public ledger through GitHub, with no key and no hosted inbox.** The hosted inbox still refused the miner's event ids and two of its kinds, so the miner sends redacted lessons as a `repository_dispatch` through the PC's existing `gh` login and `scripts/intake-observations.mjs` records them, capped at 100 events and deduplicated by event id. Public logs carry counts only. Ruling (Krish, 2026-10-15): redacted lessons mined from his private Claude Code and Codex chats may be stored in the public ai-harness ledger. Ruling (Krish, 2026-10-15): mine both Claude accounts and the local sessions too. Cloud sessions are read from `list_events` results with no hand-written export, after auto mode refused a scratch file of raw session text. Commits `2d4db3f`, `8bdb572`, `368e11e`; `docs/harness/cloud-session-miner.md`.

- rolled from NOW.md: 2026-10-15 **The docs steward moved into this repository because a public repo cannot call a private repo's reusable workflow.** control-center went private on 2026-10-15 and nine fleet repos called its workflow. The workflow, runbook, schema, fleet manifest and the digest and validator scripts now live here unchanged apart from paths, and every raw link into control-center was repointed to `https://controlcenter.krishraja.com/api/canon/` for `KRISH.md` and `PORTFOLIO.md`. Ruling (Krish, 2026-10-15): make krishanraja/control-center private without breaking anything that reads it, and give KRISH.md and PORTFOLIO.md a home every client can read. The canon block in `AGENTS.md` was re-rendered at release v2026.10.15.1. Commits `6c1c96d`, `0cd1eaa`; PR 128 also added `docs/harness/VPS-CONTROL-CENTER-PRIVATE-PROMPT.md`.

- rolled from NOW.md: 2026-10-15 **A red test was fixed inside the miner PR instead of being merged over.** `test-register-release` expected `claude-code-user`'s previous release to be the latest approved one, but since v2026.10.15.1 that surface lags two releases, so a correct reconcile failed the test. Ruling (Krish, 2026-10-15): fix the release-registration test inside the cloud miner PR rather than merge over red CI. Commit `7aa058b`, PR 127.

- rolled from NOW.md: 2026-10-14 **The harness learned to hand Krish a finished change instead of a memo, after a week in which three proposal pull requests sat unmerged and nothing changed.** The commit's own account: proposal PRs 99, 103 and 123 were never merged, so no skill, contract or rule changed from 2026-10-07 to 2026-10-14, because capture could write a document and nothing else. Ruling (Krish, 2026-10-14): capture opens merge-ready change requests; his merge is the acceptance and nothing merges itself. Ruling (Krish, 2026-10-14): the always-on surface is net zero or negative unless growth is justified. Ruling (Krish, 2026-10-14): silent by default, at most three decisions and one Control Center queue item a week. Ruling (Krish, 2026-10-14): the weekly process review may only tune the learning policy. The weekly run now drafts change packages under a read-only token; only a final step holds the write token, and `scripts/change-guard.mjs` refuses anything outside skill bodies, the two contracts and append-only eval files, anything over 4 canon files or 150 lines, and any added Ruling line, URL, em dash or secret (26 guard tests). The brief shrank from 87 blocks a week, 85 of them "nothing changes", to 6 candidates. Merging is not a release. Commits `0d6d309`, `e45ff43`, `d6196e4`, `9785788`, merged as PR 124 (`7c2bb6c`); proposal `docs/proposals/2026-10-14-merge-ready-change-requests.md`.

- rolled from NOW.md: 2026-10-14 **The observer was recording noise, and the judge had been passing canon changes unreviewed since at least 2026-10-06.** Of 1,357 ledger rows, 589 were about 50 standing findings re-recorded nightly and 106 held a second ruling joined into the first. Worse, `judge.mjs` treated a rejected API key (exit 2) as a pass, so changes merged green without a review. An unmeasured judge now fails and says so. On 100 real commits, 23 ruling quotes now give 14 distinct rulings. The same failure recurred on the PR 124 merge: the judge was unmeasured because its `ANTHROPIC_API_KEY` secret is invalid, and every other check passed. Commit `fd6f6a1`, PR 124.

- rolled from NOW.md: 2026-10-14 **Every capture surface was labelled and the fleet manifest was made to stop claiming more than the ledger showed.** `claude-code-cloud` was said to write observations with none in the inbox; claude.ai, Desktop and ChatGPT had no write path described. The importer now accepts `claude-ai`, `claude-code-web` and `chatgpt`, the audit stops counting out-of-scope Perplexity as a gap and now flags Cursor, which has sent no observation since the 2026-09-12 setup test. The always-on measure was also corrected: the honest baseline is 116,314 characters, not 74,318, once the two contracts and the who-Krish profile are counted. Ruling (Krish, 2026-10-14): Perplexity is out of capture scope. Commit `e328412`; `docs/harness/capture-connectors.md`.

- rolled from NOW.md: 2026-10-14 **Krish ruled that his own Claude Code and Codex sessions may be mined, privately, reversing the 2026-09-12 removal of the session scraper.** Ruling (Krish, 2026-10-14): mine session transcripts privately; only distilled, redacted observations leave the machine. `scripts/mine-sessions.mjs` redacts each excerpt before a model sees it, re-checks every lesson and leaves its cursor unmoved on any failure (24 redaction and 13 miner tests, including a planted key, email, name and path that never reach an envelope). Nothing runs until Krish installs it: the weekly task on LORIMER is opt-in and the audit reports its clock as awaited. Commit `8679173`; `docs/harness/cloud-session-miner.md`.

- rolled from NOW.md: 2026-10-07 **The cloud surfaces caught up to v2026.10.06.3, one day after the release, and the registry's own deployment verdict did not notice.** The reconcile moved `claude-cloud`, `perplexity-cloud` and `codex-cloud` from v2026.10.06.1 to v2026.10.06.3 with four skills replaced in the Claude and Perplexity catalogues (`apify`, `krish-build`, `ux-testing-agent`, `verification-loop`) and the Codex Cloud environment validated by a fresh task. Claude's catalogue lists 31 entries against 29 canonical skills with the canonical names exact. Cloud evidence stays inventory, not byte parity. The top-level verdict string in `state/skill-registry.yaml` still reads `cloud-surfaces-stale`, and `CURRENT.md` renders it as written, so it contradicts the per-surface rows beside it (see waiting on Krish). Commit `c2a842d`, PR 121.

- rolled from NOW.md: 2026-10-06 **Three canary failures in a row were each traced to a different layer, and each fix went into the next immutable release instead of rewriting the one that failed.** v2026.10.06.1 failed `principles-trigger-013` ("Thanks.") and `-032`: the rotation seeded on the release id drew `krish-principles` back onto the sheet, although it is an adapter invariant Codex reads every turn. The commit's own evidence: the same two cases failed 0/3 on `codex-current` at v2026.09.13.3 and .4 and were never on the sheet for the two releases between, so it was not a regression. The rotation now drops adapter invariants after the draw, and a test sweeps 41 release seeds and fails on the old code. Then v2026.10.06.2 surfaced four adjacent collisions (strategy replacing the build producer rather than handing back, post-fix regression closure mistaken for UX testing, an Apify guard read with no declared `krish-build` neighbour). v2026.10.06.3 carried the repair and was installed on every local surface the same evening. Commits `b4e2434`, `40e8c83`, `8080fbd`, `c98d5b9`; proposals `docs/proposals/2026-10-06-canary-routing-repair.md` and `docs/proposals/2026-10-06-v2-adjacent-canary-repair.md`.

- rolled from NOW.md: 2026-10-06 **Krish's 2026-10-06 rulings overturned parts of the profile that had shipped the day before, and the mindmake repository was taken out of the canon rollout.** Ruling (Krish, 2026-10-06): "the portfolio rolls into the mission; one queue, the mission leads, products ordered beneath it by the ladder," superseding the 2026-10-05 split. Ruling (Krish, 2026-10-06): the ikigai's twelve month commitment is ongoing and the pause is lifted. Ruling (Krish, 2026-10-06): Full Time is a B2C monetisation experiment app, not a job search asset; CTRL being priced is fine; Hunter is active; the publication has three channels. Ruling (Krish, 2026-10-06): the mindmake repository stays out of the canon rollout and must not be reopened nightly. The exclusion needed code, not a flag: `who_krish: false` removed only the paragraph, so every release still moved the block's stamp and the reconciler would have reopened a stamp-only pull request on mindmake each night. `state/fleet.yaml` now carries `canon_sync: false` with a required reason, and `scripts/test-canon-sync.mjs` runs the real reconciler with the network stubbed and proves mindmake is never contacted. Founder visibility is explicitly not ruled and stays open. Commit `88a059d`, PR 108.

- rolled from NOW.md: 2026-10-06 **The rollout widened to ChatGPT Cloud and Perplexity, and a cloud surface was recorded for the first time.** Ruling (Krish, 2026-10-06): include ChatGPT Cloud instructions and every reachable surface except SURFACE in the governed v2026.10.06.1 rollout; SURFACE followed in its own reconcile. `state/cloud-checks/codex-cloud.json` is new and Perplexity gained its own account instructions (`adapters/cloud/perplexity-account-instructions.md`). Cloud evidence stays inventory, not byte parity. Commits `57dae24`, `86e40f5`.

- rolled from NOW.md: 2026-10-05 **Who Krish is became part of the canon, and shipped to every client as release v2026.10.05.1.** The profile, his full ikigai and the rule that the mission and the product portfolio are both current now live in `skills/krish-principles/references/` and reach the Claude, Codex, Cursor and cloud adapters, while what he works on stays live in Control Center rather than copied here. The commit also corrected a wrong claim: README and `NOW.md` had called this repository private, and it is public. Ruling (Krish, 2026-10-05): "the mission and the product portfolio are both current, explicitly split." Ruling (Krish, 2026-10-05): the ikigai's twelve month commitment and ninety day plan are paused and being reset. Ten regression eval cases record the new behaviour. Commit `58910a0`, PR 104.

- rolled from NOW.md: 2026-10-05 **The release was registered, then installed on three local surfaces, and the run still ended blocked.** Ruling (Krish, 2026-10-05): "merge PR 104, cut a release and install it on Claude Code, Codex and Cursor." The registry commit recomputed the skills-tree aggregate from git objects (146 files, 29 skills) and checked the method reproduces the previous release's recorded aggregate exactly. The LORIMER run installed all three surfaces with rollback directories and ran canaries, but ended `blocked` with `cursor-primary` and `codex-current` listed as unmeasured, which is why the canary numbers above are mixed. Commits `34eef24`, `e61b104`.

- rolled from NOW.md: 2026-10-06 **The canon block in `AGENTS.md` was synced to v2026.10.05.1 within a day of release,** by the harness's own pull request, touching only the text between the markers. Commit `92d23ae`, PR 107.

- rolled from NOW.md: 2026-10-04 **The VPS was given one job that matters, a clock for GitHub workflows, after Lozatron went silent for nine days.** Lozatron had sent nothing since 25 September: all 33 runs failed a live-ledger version check in the Test step, and the same run history showed GitHub's scheduler starting about four of fourteen hourly runs a day, some six hours late. `scripts/vps/clock.py` moves the trigger off GitHub's queue: at an entry's local time it sends a `workflow_dispatch`, reads the proof from the repository, and dispatches once more only if the proof is missing, capped per slot and recording a miss rather than retrying into the next day. It is standard library only and refuses to run without a token. COMPOUND's daily brief, due 06:30 Eastern, had started four to seven hours late every day from 2026-09-22 to 2026-10-03 and joined the clock as a second entry. The clock was switched on the same day with 26 passing tests, the token proved read-only against both workflows, and a cron line plus log rotation added. What the VPS is for stays proposed, not ruled (`docs/harness/VPS-ROLE-2026-10-03.md`): the clock, an outside watchdog and the family agents, nothing else. The output sentinel for runs that report success and produce nothing is a spec only (`architecture/SENTINEL.md`). Commits `6a88897`, `f0ed548`, `27cb6e6`.

- rolled from NOW.md: 2026-10-03 **The first live run of the host prompt hit four gaps, all in the prompt and none in the session.** Krish had already rebooted, and the prompt had no branch for that; it compared the cron count against the 33 of the 2026-09-19 audit when the live baseline was 30; it said nothing about the loz sandbox container coming back exited, because it has no restart policy; and its Ollama search swept run logs that include a personal-agent job, which would have forced a read the 2026-09-09 ruling forbids. The prompt now uses the session's own count as baseline, skips to the after-checks after a reboot, and searches ops scripts and job definitions only. Hardening is done except Ollama (skipped by Krish's ruling) and the loz sandbox, still open (`state/vps/HARDEN-AND-CLOCK-2026-10-03.md`). Commits `93a11ce`, `2d963fe`.

- cut from NOW.md (old "Where it is right now" release paragraph, as of 2026-10-28): Session closeout and one fleet list merged on 2026-10-22 (PR 152): `scripts/closeout/check.mjs` is both the Claude Code Stop hook and the `closeout` pull request check, the repository administration publisher delivers it with its check workflow, and `validate-surfaces` now fails when any fleet list disagrees with `state/fleet.yaml` (`docs/proposals/2026-10-22-session-closeout-and-one-system.md`). The publisher's first run opened AEO-Engine's delivery pull request; content-engine had been blocked since at least 2026-10-20 because its profile omitted a mandatory startup read (`docs/REPO_MAP.md`), which held every non-pilot target, and the fix is in the next pull request. Latest approved release is **v2026.10.27.2** (source commit `6a8eef1`, PR 172), immutable and published 2026-10-27T16:55:34Z, registered after v2026.10.27.1 the same day (PR 170 changed `locked-revision`; PR 141 changed `tools-access`); LORIMER installed v2026.10.26.1 (source commit `2de59f6`, PR 165, changing `krish-design` and `krish-voice`) on 2026-10-27, registered in `state/skill-registry.yaml` rather than by hand (`CURRENT.md`). LORIMER installed it on 2026-10-27 on `claude-code-user`, `cursor-primary` and `codex-current`: six skills replaced on each (`ctrl-capture`, `harness-maintainer`, `krish-design`, `krish-principles`, `krish-voice`, `mindmake-os`), 29/29 exact with the aggregate matching the release, and the replaced v2026.10.06.3 folders kept as rollback. The registry records that only once the machine evidence pull request (PR 169) merges. Until then the four local surfaces (`codex-surface-07a67cda9f99`, `cursor-primary`, `claude-code-user`, `codex-current`) are still recorded at v2026.10.06.3 with 29/29 exact per-skill matches and are marked as awaiting automatic install of v2026.10.26.1; the three cloud surfaces (`claude-cloud`, `perplexity-cloud`, `codex-cloud`) are also at v2026.10.06.3, the two supervised accounts needing a manual upload and Codex Cloud an environment refresh. Cloud names and dates are inventory, not byte parity, and a local hash match proves installed bytes only, not discovery or routing. `CURRENT.md` renders the registry's deployment verdict as written: current on all declared local surfaces, cloud surfaces stale, local canaries zero failures with declared unmeasured routes. The v2026.10.26.1 canaries on `claude-code-user` and `codex-current` are graded partial with zero failures, the same as v2026.10.06.3, and none of the 34 cases on both sheets went from fired to not fired. `cursor-primary` has no supported headless canary (the new reports are in PR 169). Nothing in this file proves what is installed on LORIMER; read `state/heartbeats.json` for that. Its latest `harness-sync-lorimer` heartbeat (2026-10-27T12:20Z) reports `ok` against v2026.10.26.1. That closes an outage of ten blocked runs from 2026-10-16, reason `checkout-untracked`. The cause was a Claude Code agent worktree left under `.claude/worktrees/` since 2026-10-06. It was removed, its branch kept, and the path is now ignored (PR 168); `session-miner-lorimer` reports `degraded` (2026-10-26T08:53Z, three failing runs since 2026-10-18, no reason recorded). The credential-exposure lifecycle opened 2026-09-12 is in approved remediation, not closed (`state/credential-exposure-2026-09-12.md`). Review dates in `state/skill-registry.yaml` as of 2026-10-19: 13 of 29 skills are past their freshness SLA, unchanged since 2026-10-16 and recomputed from the registry: `krish-design` and `krish-content-marketer` (both reviewed 2026-08-05, 75 days against 60), `harness-maintainer` (2026-08-20, 60 days against 30), `mindmake` (2026-08-29, 51 against 45), `video-engine` (2026-08-29, 51 against 30), and 36 to 37 days against 30 for `tools-access`, `n8n-operator`, `instantly-operator`, `evidence-research`, `apify`, `mindmake-os`, `design-intelligence-search` and `decision-ledger`. Three candidates live in `candidates/` and are excluded from release packaging until admission, none counted among the 29: `consumer-app-outcomes` (`state/candidates/consumer-app-outcomes.yaml`); `tool-router`, which was uploaded and enabled on both Claude accounts, installed on ChatGPT and written hash-exact to the Codex surface on 2026-10-19 with behaviour recorded as unmeasured. Krish approved moving it off Codex on 2026-10-27 because the sync refuses unregistered skill directories, so it now sits byte-identical in `.scratch\ai-harness\quarantine\2026-10-27\` (`state/candidates/tool-router.yaml`, `state/cloud-checks/tool-router-2026-10-19.json`); and `tool-economics`, inactive and staged (`state/candidates/tool-economics.yaml`). Cloud account adapters were also reworded on 2026-10-19 (`adapters/cloud/account-instructions.md`), and those edits are not in any published release. The repository now has a North Star (`docs/NORTH_STAR.md`, set by Krish 2026-10-18) that every session reads first. The docs steward lives in this repository (`docs/steward/`, `scripts/steward/`). Full detail and exact surface table: `CURRENT.md`.

- cut from NOW.md (superseded read-back or merged into the Next lines): Still to read back: after Sunday's runs (steward propose 21:40 UTC, repository proposals 23:10 UTC), the watchdog's `central-proposals` and `central-repository-proposals` rows back as healthy. Housekeeping and the digest are green as of 2026-10-23 23:27.

- cut from NOW.md (superseded read-back or merged into the Next lines): Still to read back: after Control Center's sweep delivers the pending 2026-W42 digest, housekeeping, propose and the watchdog's `central-*` rows going green. The digest itself asks Krish to run `Repair-HarnessPc.ps1` on his PC.

- cut from NOW.md (superseded read-back or merged into the Next lines): Still to read back: the first scheduled watchdog run (the next :17) and Control Center's `harness-central` row turning healthy.

- cut from NOW.md (superseded read-back or merged into the Next lines): Merge the content-engine profile fix so the pilots pass and the publisher delivers to the other 11 targets. Heartside, Legibility and growth-heartside each still need the `CLAUDE_CODE_OAUTH_TOKEN` repository secret for the nightly steward.

- cut from NOW.md (superseded read-back or merged into the Next lines): 13 skills have expired review dates as of 2026-10-19 (listed above; `harness-maintainer` at 60 days against 30 and `video-engine` at 51 days against 30 are the longest-running of the 30-day group). Per this repo's own rule, an expired review date opens a finding and is never silently bumped; each needs Krish's review, not a stamp update.

## 2026-10-28

- stamped at `e7040e8`: `NOW.md` head moved from `5aa5e31`. PR 170 (sync guard, `locked-revision` bytecode), PR 141 (`tools-access` rule 11) and PR 172 (Heartside routing) merged; releases v2026.10.27.1 and v2026.10.27.2 registered. No bullets older than 30 days to roll.

## 2026-10-27

- stamped at `5aa5e31`: `NOW.md` head moved from `fc5d64c`. Release v2026.10.26.1 (source `2de59f6`, PR 165) was registered, so the release sentence, the two-way taste bullet and the LORIMER heartbeat figures were brought to the registry and `state/heartbeats.json`. The Epidemic Sound bullets from the 2026-10-26 session were kept. Four 2026-09-25 bullets rolled out below.

- rolled from NOW.md: 2026-09-25 **A consumer-app lifecycle skill was built as a candidate, then repaired after its own evidence failed a live check.** `consumer-app-outcomes` turns 73 live-read pages of the public Consumer App Studio taxonomy into 60 practitioner-hypothesis records with an append-only evidence log. Committed once under `skills/`, the release builder would have packaged it as a 30th skill on the next build; it moved to `candidates/` because that directory is evaluated but never packaged. A live readback then found all 15 onboarding, retention and trust-building records citing pages that do not exist, so those were rebuilt from the real pages and all 73 sources now sit in a checked source ledger. `Test-Harness.ps1` now validates every candidate package the same way it validates an admitted skill, including the append-only proof on the evidence log, without packaging it. Commits `519c7a2`, `6ff5514`, `59ff88b`, `d8bbcd4`, `02f29f3`, `4e32beb`.

- rolled from NOW.md: 2026-09-25 **The two supervised cloud accounts gained a routing floor after a claude.ai listing was found silently truncating skill descriptions.** On 2026-09-25 that catalog listed its last seven skills, including `strategy-brief`, `verification-loop` and `video-engine`, with no description at all, even though every `SKILL.md` and its description are valid and under the documented length limits. `adapters/cloud/account-instructions.md` is now a 1,884-character paste-in that forces the three always-on gates and names every production skill and its trigger directly, so cloud routing no longer depends on a description the catalog may not render. Commit `7d51b0b`.

- rolled from NOW.md: 2026-09-25 **A canary-audit attribution bug overstated how many skills had never fired.** `audit-harness.mjs` credited every core-trigger case to a skill literally called "core", which does not exist, so it reported `krish-principles`, `strategy-brief` and `verification-loop` as uncanaried. The true count of skills with no positive canary on any surface is 2 of 29 (`apify`, `ctrl-build`), not 5; `canaries.mjs` now keeps every unproven skill on every sheet until it fires, and the sheet says so. Commit `abc2952`.

- rolled from NOW.md: 2026-09-25 **The SURFACE machine identity resolver stopped exiting before it could record evidence.** Unrelated Claude and Cursor skill directories appeared on a Codex-only managed host, and identity resolution had been coupled to the absence of those unowned roots, so the run exited before writing anything. The resolver now binds SURFACE to its machine name and managed Codex root, records other roots without managing them, and carries a regression fixture proving they cannot make the host ambiguous. Commits `f8bcd22`, `b643a9a`.

## 2026-10-25

- stamped at `fc5d64c`: `NOW.md` head moved from `2948842`. Only automation commits landed (brain, intake, observe, digest state files); no documentation consequence. Three 2026-09-24 bullets rolled out of NOW.md below.

## 2026-10-24

- stamped at `2948842`: `NOW.md` head moved from `801ad37`. Release v2026.10.24.1 (source `691ea40`, the taste-file change) was registered; the release sentence, the taste bullet and the LORIMER heartbeat counts (eight failing runs, still `checkout-untracked`) were corrected against `CURRENT.md` and `state/heartbeats.json`. No bullet passed 30 days.

## 2026-10-21

- stamped at `737d620`: commits since `5e228d9` were brain, repository-administration view and observation ledger updates only. `NOW.md` head and date moved; no registry, heartbeat-sync or release state changed.

- rolled from NOW.md: 2026-09-20 **A wrong operating claim about the VPS fleet was found and corrected in the same session that made it.** The retirement map had the gateway job count wrong by sixteen jobs and mischaracterized the Telegram exposure; both were corrected the same day after independent verification against the live host (git clean, live n8n not clean), rather than left standing. Nine of eleven previously "unknown" jobs were settled to retire, and Krish's override keeping `loz-api-monitor` running against the general retirement instruction was written in as a named exception, not left implicit. Commits `71dc30c`, `d62858f`, `c4c9c65`, `9bec007`.

## 2026-10-20

- stamped at `5e228d9`: commits since `a84ea87` were brain, heartbeat and observation ledger updates only. `NOW.md` head and date moved; the LORIMER sync heartbeat now shows five failing runs with the same `checkout-untracked` reason.

- rolled from NOW.md: 2026-09-19 **The content-format canon moved from two channels to three, and the mandate authority moved out of the canon text into a database table.** `venture_formats.mandate` in Mindmaker OS is now the single source of format mandate truth for `split.the.bill`, `mind.the.gap` and `lift.the.lid`; the OpenClaw VPS was independently audited from the host the same day and the operator handoff was corrected against two verifiers after the first draft stated things to still go and check that had, in fact, already been checked twenty minutes earlier. Commit `748a1ce`.

## 2026-10-19

- reconciled at `a84ea87`: `NOW.md` added three 2026-10-19 bullets (cloud catalogue-first discovery, Tool Router installation without paid test runs, tool economics candidate), recorded `tool-router` and `tool-economics` as candidates outside the 29 admitted skills, restated LORIMER's sync as `blocked` with four failing runs and the session miner as `blocked` with two, and re-counted expired reviews at 13 of 29 with days recomputed to 2026-10-19. Registry unchanged since the last reconcile. No document moved or archived; `AGENTS.md`, `docs/HARNESS_CONTEXT.md` and the registry were read and left alone.

## 2026-10-18

- reconciled at `a2102fa`: `NOW.md` moved to release v2026.10.17.1 (published, registered, recorded on no surface), added five bullets (North Star, subscription-independent checks, two-layer cloud coverage, preserved proposal histories, central-brain repository administration), restated LORIMER's sync as `blocked` with reason `checkout-untracked` and the session miner as `blocked`, replaced the stale `cloud-surfaces-stale` note with the reworded verdict, and re-counted expired reviews at 13 of 29. No document moved or archived; `AGENTS.md`, `docs/HARNESS_CONTEXT.md` and the registry were read and left alone.
- bannered on arrival: `docs/history/branch-snapshots/2026-09-08-proposal-variant-a5dbd655.md` (replaced by `docs/proposals/2026-09-08.md`) and `docs/history/branch-snapshots/2026-09-20-telegram-note-ed1545ec.md` (replaced by `docs/harness/VPS-RETIREMENT-MAP-2026-09-19.md`); both came from the 2026-10-18 branch reconciliation without the Historical banner. Nothing deleted.

## 2026-10-16

- reconciled at `1b2fc25`: `NOW.md` gained the 2026-10-16 bullet for the PC sync's fixed reason word and the guardian's blocked-run count (PR 129), noted LORIMER's last sync heartbeat as `blocked`, and corrected the expired-review count from 2 to 13 of 29 skills, recomputed from `state/skill-registry.yaml`. No bullet was old enough to roll. Registry verdict and expired review dates are unchanged and wait on Krish.

## 2026-10-15

- reconciled at `908ad07`: `NOW.md` moved to release v2026.10.15.2 (published, registered by the release workflow, recorded on no surface yet), added five 2026-10-15 bullets (automatic release and install, the PC sync that died with exit code 64 for nine days, mined lessons sent through GitHub, the docs steward moving here, the red test fixed in place) and restated review ages (`harness-maintainer` 56 days, `video-engine` 47 days), both still waiting on Krish. The registry and `CURRENT.md` were not edited.

## 2026-10-14

- reconciled at `181341f`: `NOW.md` gained four 2026-10-14 bullets for the learning-loop merge (PR 124: merge-ready change requests, the observer and judge repair, surface labels, the private session miner), the credential asks that wait on Krish, and review ages restated (`harness-maintainer` 55 days, `video-engine` 46 days). `CURRENT.md` and the registry were not touched by those commits. Nothing rolled out of `NOW.md`: the oldest bullet is 2026-09-19.

## 2026-10-10

- reconciled at `259f0a8`: the only commit since `467448f` was the observer ledger (`state/` files, no documentation consequence). `NOW.md` head and `as_of` advanced and the review ages restated (`harness-maintainer` 51 days, `video-engine` 42 days); the registry dates are unchanged and still wait on Krish.

## 2026-10-08

- reconciled at `467448f`: `NOW.md` now records the three cloud surfaces at v2026.10.06.3 (they were stale at v2026.10.06.1), notes that the registry's top-level deployment verdict still says `cloud-surfaces-stale` and waits on the next registry reconcile, and refreshes review ages for `harness-maintainer` (49 days) and `video-engine` (40 days) against their 30-day SLA, both still waiting on Krish. Nothing rolled out of `NOW.md`: the oldest bullet is 2026-09-19.

## 2026-10-07

- reconciled at `8042cab`: `NOW.md` moved from v2026.10.05.1 to v2026.10.06.3 (all four local surfaces 29/29 exact, three cloud surfaces stale at v2026.10.06.1), closed the `CURRENT.md` versus LORIMER record disagreement flagged at `5b22a53`, added the 2026-10-06 rulings and canary-repair bullets, and refreshed review ages for `harness-maintainer` (48 days) and `video-engine` (39 days) against their 30-day SLA, both still waiting on Krish. Nothing rolled out of `NOW.md`: the oldest bullet is 2026-09-19.

## 2026-10-06

- The v2026.10.06.2 live canaries preserved four adjacent routing collisions:
  strategy could replace rather than hand back to the build producer, generic
  post-fix regression closure could be mistaken for UX testing, and an Apify
  exclusion-guard read lacked a declared `krish-build` neighboring route. The
  producer handback, verification precedence, UX exclusion, Apify discovery
  gate, and canary route declaration were narrowed together for the next
  immutable patch release without rewriting the v2 evidence.

- The v2026.10.06.1 rollout surfaced three different boundaries rather than one
  generic canary failure: an adapter-invariant measurement leak, a skipped
  strategy-to-producer handoff, and catalogue discovery trying to enforce Video
  Engine conversation history before loading its guard. The invocation sheet,
  strategy/build metadata, Video Engine discovery boundary, and the
  take-the-brief neighboring-route declaration were repaired together for the
  next immutable patch release; isolated Codex canaries passed the previously
  failing strategy route 3/3 and the exact launcher while containing punctuation.

- The `v2026.10.06.1` Codex canary failed `principles-trigger-013` and `principles-trigger-032` because the tier-three rotation, seeded on that release id, drew `krish-principles` back onto the sheet. The 2026-09-13 observability boundary had removed it from the Tier 1, changed-skill and never-proven lists but not from the rotation. Codex reads that file on every turn because its root adapter says to, so those cases failed exactly as they had on `v2026.09.13.3` and `.4`; they were never run on `v2026.09.24.3` or `v2026.10.05.1`. The rotation now drops adapter invariants after the draw, so every other release's sheet is unchanged, and a regression test sweeps 41 release seeds. No skill bytes changed.

- reconciled at `5b22a53`: added the v2026.10.05.1 who-Krish canon, release and LORIMER install bullets to `NOW.md`, recorded that `CURRENT.md` and the LORIMER machine-run record disagree on whether `claude-code-user` and `codex-current` are installed, and refreshed review ages for `harness-maintainer` (47 days) and `video-engine` (38 days) against their 30-day SLA, both still waiting on Krish.

## 2026-10-04

- reconciled at `a5ce22b`: added the VPS clock and host-prompt bullets to `NOW.md`, refreshed review ages for `harness-maintainer` (45 days) and `video-engine` (36 days) against their 30-day SLA, both still waiting on Krish.

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
- reconciled at `1137278`: added four "What changed recently" bullets for the
  day's non-documentation work that the digest surfaced and this file already
  carried but `NOW.md` did not yet: the `consumer-app-outcomes` candidate build
  and repair, the cloud account routing floor for claude.ai and Perplexity, the
  canary-audit attribution fix (2 of 29 skills genuinely uncanaried, not 5), and
  the SURFACE identity resolver fix. Bumped `harness-maintainer`'s expired
  freshness count from 35 to 36 days and dropped the "What is next" bullet about
  the `f11caf9` schema drift, since that correction is already recorded above
  and under 2026-09-24 and is no longer an open action.

## 2026-09-24

- rolled from NOW.md: 2026-09-24 **The experience-quality system became durable instead of session-local, on Krish's own ruling.** Ruling (Krish, 2026-09-24): "harden the quality system, make it durable across future work, finish the build-apps safeguards, and keep the fleet as autonomous as possible." Three changes landed together: a material review firewall makes it mechanically impossible inside the governed workflow to present an unverified candidate (Ruling, same day: "Future app and website work must make it mechanically impossible within the governed workflow to present an unverified material candidate"); scroll-build interactions now require causal evidence that progress follows user scroll and that a locked region only releases after its sequence completes (Ruling, same day: "fix the two sections to build with scroll lock until complete, then harden the underlying system for future use"); and project delivery is fail-closed when a repository has no real test, build or QA command, so a placeholder script can no longer manufacture readiness. Commits `06447cd`, `bcc8bdd`, `6ce37fa`.
- rolled from NOW.md: 2026-09-24 **Release v2026.09.24.3 was registered and rolled out across every available local and cloud surface.** Ruling (Krish, 2026-09-24): "publish and roll out the hardened harness release across available local and cloud surfaces." The rollout sync was taught to consume already-approved reconciliations rather than re-litigate them, and to stop treating a provider-managed cloud cache as canonical drift when classifying what changed (Ruling, same day: "finish the governed rollout across available local clients without treating provider-managed cloud caches as canonical drift"). Commits `baf69e0`, `10d494d`, `b1ff8d1`, `f11caf9`.
- rolled from NOW.md: 2026-09-24 **The canon block was synced two releases late.** PR #74 rendered the krish-canon markers in `AGENTS.md` up through v2026.09.13.8 and then v2026.09.15.2 in the same pass, having missed both releases when they shipped. The block is detected-and-proposed by design, never silently overwritten, which is exactly why the backlog was visible instead of silently lost.

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
