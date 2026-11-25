# Apple design candidate, 2026-11-25

Status: admitted 2026-11-25 as production skill 35 (Ruling, Krish, 2026-11-25: apple-design is admitted). It moved from `candidates/apple-design/` to `skills/apple-design/`; its suites moved to `evals/`; `state/candidates/apple-design.yaml` is closed (`valid_until: 2026-11-25`) and kept.

Krish asked to install dickwu/apple-design-skill "for my purposes", then to "figure out the rest". It went into krishanraja/software-qa as a project skill first (commit `6a46242` on main). This candidate is the rest: the harness-governed path, staged rather than activated, as `harness-maintainer` requires for imported material.

North Star check: this does not move the number (corrections given twice). It is a capability Krish asked for; it is staged so that it cannot add a mis-route, which would.

## Finding and correct layer

The harness has no page-cited check against Apple's Human Interface Guidelines. `ux-foundations` looks up current platform guidance in general terms; `krish-design` owns the judgment; neither carries Apple's pages. The upstream skill carries 123 of them plus curated guides for Liquid Glass, cross-platform translation, code audit and history.

Imported as is, it would collide. Its description fires on any "review my design", "is this good UI" or shared screenshot, and its persona includes a studio design lead with its own point of view and a "make this less generic" mode. Both are `krish-design`'s job, which is the mandatory gate for visual work. So the correct layer is a narrow validator: the upstream pages and workflow kept byte for byte as references, under a harness wrapper that fires only when Apple's guidance is named or a native Apple-platform convention is the question, and that hands every taste call back to `krish-design`.

## What the candidate is

- `SKILL.md`: the harness wrapper, which sets the trigger and its exclusions, the validator role, the workflow, the output, authority, completion and provenance.
- `references/upstream-workflow.md`: upstream's `SKILL.md`, unchanged, read as the review workflow.
- `references/hig/*.md` (124 files), `references/cross-platform.md`, `references/code-audit.md`, `references/heritage.md`, `references/hig-lookup.md`: upstream, unchanged.
- `scripts/pull-hig.mjs`: upstream's refresh script, unchanged; never run during a review.

## Missing-skill test

1. Recurs with consequence: yes, for any venture shipping an iOS, iPadOS or macOS app or an App Store submission. App Review rejections are costly.
2. Distinct trigger: yes, but only when narrowed to Apple's guidance being named or in question. The upstream trigger fails this test.
3. Repeatable workflow: yes, the upstream review steps.
4. Owned standard: yes, Apple's pages, cited by file and heading.
5. Independently verifiable: yes, because every finding names a page and heading a reviewer can open.
6. Bounded authority: yes. It is read-only, and the refresh script is gated.
7. A chapter elsewhere would be worse: probably. It would add 2 MB of references to `ux-foundations`, whose method is live primary-source lookup and not bundled corpora. Whether it should be a `ux-foundations` reference instead is the open question for the overlap review.

## Overlap review

| Neighbour | What it owns | Where this candidate stops |
|---|---|---|
| `krish-design` | design judgment, taste, anti-defaults, visual QA gate | returns cited findings; never picks a look or answers "less generic" |
| `ux-foundations` | WCAG and platform UX rules from current primary sources | WCAG stays there; Apple page-level checks of a specific screen come here |
| `ux-testing-agent` | exercising a running app | works from screenshots, mockups and code only |
| `krish-build` | implementing the fix | gives the fix direction only |
| `design-intelligence-search` | style and pattern candidates for krish-design | states guidance, proposes no styles |

The overlap estimate with `ux-foundations` is a judgement, not a measurement. It is the gate most likely to send this to a reference under `ux-foundations` instead of a skill.

## Gates run

- Structural: the description is 803 characters, `SKILL.md` is 72 lines and every referenced file exists. The harness validator, run locally on Linux, adds no failure beyond the 11 that main already shows there (all Windows path assumptions). Windows CI on the pull request is the real check.
- Security: the content is Markdown, plus one script that fetches only `developer.apple.com`. It contains no credentials and no embedded instructions to the model.
- Held-out suites: 22 trigger cases (8 positive, 8 negative, 6 adversarial or collision) and 23 behaviour cases (6, 8, 5, 4), written but not yet run blind.
- Held-out run, 2026-11-25. The method follows `scripts/Invoke-ClaudeHeldOutEval.ps1` (a blind executor, then a fresh judge), run as Sonnet subagents inside the session because the script reads only `skills/` and bills its own CLI budget. The executor saw only the prompts and seven skill descriptions (this candidate, `krish-design`, `ux-foundations`, `ux-testing-agent`, `krish-build`, `design-intelligence-search` and `krish-content-marketer`), shuffled and without expected answers.
  - Trigger: **failed the gate.** apple-design loaded on 13 prompts, 3 of them wrongly (precision 0.77 against the 0.95 bar), and missed none (recall 1.00). The main owner was right on 21 of 22; the one miss (020, visual QA at phone sizes) went to `krish-design` instead of `ux-testing-agent` and does not involve this candidate. All three false positives were co-loads, not wrong owners. On 017 ("Review this iPhone screen") and 019 ("make our macOS app look more Apple-like") `krish-design` stayed the owner and apple-design loaded beside it as a validator. On 021 (whether 44-point targets are a rule or advice) it loaded beside `ux-foundations`, the overlap this proposal predicted.
  - Behaviour: **passed.** 23 of 23 (nominal 6, failure-edge 8, authority-security 5, handoff 4), with no hard failures.
- Not run: a behaviour comparison against a baseline, the fresh-session canary and the named-human admission.

## Ruling and rerun

Ruling (Krish, 2026-11-25): apple-design should work together with krish-design, not be kept out of its way; he wants contrarian views and tension to get the best results.

Applied as follows:
- The description now has apple-design load beside `krish-design` or `ux-foundations` whenever the screen or question is for an Apple platform, as a second, contrarian voice. The owner keeps the decision.
- A "Second voice, on purpose" rule: argue Apple's side, name every departure with its citation, never soften a disagreement.
- Cases 017 and 019 relabelled to `should_trigger: true` under the ruling. 021 (beside `ux-foundations`) was relabelled on the same principle, which extends his answer from krish-design to ux-foundations. That extension is an interpretation, flagged for him.
- Eight new cases added after the ruling, unseen by anyone before the run: four negatives (Android, web marketing site, PDF, WCAG), two Apple-platform co-loads, one Android adversarial case and one positive.

Rerun, same blind method, new description:
- Trigger: precision 1.00 and recall 1.00 on all 30 cases. The 8 unseen cases: 3 true positives, 5 true negatives, no errors. Two owner labels differ from the expected route without involving whether apple-design loads: 020 (`krish-design` against `ux-testing-agent`, as before) and 022, where `krish-design` took the owner role and called apple-design, which the ruling allows.
- Behaviour: 22 of 23 on the first rerun. Case 012 failed because the `heritage.md` content was not labelled historical; the wrapper now requires that label. Case 012 reran blind and passed, so 23 of 23 with no hard failures.

## Baseline comparison and canary, 2026-11-25

**Planted-defect review.** A SwiftUI iPhone checkout screen with seven planted HIG defects: a hand-built Apple Pay button, a 24pt tap target, fixed 11pt type, low-contrast hard-coded colour, an "OK" destructive alert, glass on every content row and six tabs. It was reviewed twice by Sonnet, once with the candidate and once without any skill, and a fresh judge scored them blind (labels A/B).
- Detection: 7 of 7 in both arms. The skill adds no detection on defects this common.
- Citations, checked mechanically against the bundled pages: with the skill, 14 of 14 cited files exist, 14 of 14 headings are found, and 14 of 14 quotes appear word for word in the cited file. Without it, 9 of 10 files exist, 4 of 10 headings are found and 0 of 10 quotes appear in Apple's text. Every quote the baseline gave was paraphrased or invented.
- False claims: one with the skill (tab-bar symbols should be filled, which SwiftUI already does) and none without.

**Behaviour suite without the skill:** 8 of 23, against 23 of 23 with it. The gap is inflated: the six nominal cases require reading the skill's files, which a run without the skill cannot do. The meaningful failures without the skill were invented visionOS rules, an unscoped overall verdict, an offer to patch the code itself, and missed handoffs to ux-testing-agent, ux-foundations and krish-design.

**Fresh-session canary.** The candidate was installed at the user skill root of a cloud container. Installed hash `f2a86d2b...` matched the candidate; the prior copy was hashed (`c7780b72...`), kept and restored afterwards. Three fresh agents got natural prompts that did not name the skill, and their transcripts were checked for Skill calls:
- A SwiftUI "OK by Apple's rules, or will App Review push back?" request **loaded apple-design. Pass.** It gave cited findings with a handoff, but read only 5 pages and skipped the always-load set and the freshness check (it said so).
- An Android Material 3 question **loaded nothing. Pass.**
- An iPad settings-screen design review **loaded nothing. Fail.** The co-load did not happen. It only offered apple-design at the end. In that container krish-design is not installed (it is served by get_skill), so neither owner nor validator loaded.

## Findings to fix before admission

1. The co-load beside krish-design depends on the router, not only on this description. When admitted, the routing line for Visuals (and krish-design's own text) must name apple-design as the Apple-platform second voice. Otherwise the ruling does not happen in practice.
2. A short prompt let the skill skip its always-load pages and freshness check. Make those steps a hard requirement of a full check, or say when a three-finding answer may skip them.
3. One false claim in 15 findings: a finding about how a framework renders must be checked against the framework, not inferred.

## Fixes and canary round 2, 2026-11-25

Krish said yes to all three fixes on 2026-11-25.
- **Finding 2 (always-load skipped):** a short answer now limits findings, not reading. The output must list the always-load set.
- **Finding 3 (framework claim):** framework behaviour the references do not cover is labelled `unverified framework behaviour`, and the skill never asks for a code change on it alone.
- **Finding 1 (routing):** staged, not applied. apple-design is not served by `get_skill` until admitted, so pointing live krish-design at it now would send every Apple-platform design session to a skill that cannot load. The exact change, applied at admission with the admission commit:

```diff
@@ -1,6 +1,6 @@
 ---
 name: krish-design
-description: "Ownership gate first: invoke for EVERY request to design, imitate, build, reshape, reskin, lay out, classify a routine visual repair, or visually QA anything a human will look at or touch, even when asked to skip commercial/design judgment or reopen an approved system unnecessarily. Krish's mandatory design doctrine for pages, artefacts, PDFs, decks, SVG, React UI, forms, flows, landing pages, and visual QA. Trigger on 'design', 'build a page', 'lay this out', 'make this look', 'reskin', 'UX', 'interaction', 'form', or visual 'artifact'. Covers sequencing, material approval, routine-vs-material classification, house systems, anti-defaults, visual QA, and Canva handoff. Inherits krish-principles. It does not own copy voice, build mechanics, or multi-phase app orchestration. Last reviewed 2026-09-13."
+description: "Ownership gate first: invoke for EVERY request to design, imitate, build, reshape, reskin, lay out, classify a routine visual repair, or visually QA anything a human will look at or touch, even when asked to skip commercial/design judgment or reopen an approved system unnecessarily. Krish's mandatory design doctrine for pages, artefacts, PDFs, decks, SVG, React UI, forms, flows, landing pages, and visual QA. Trigger on 'design', 'build a page', 'lay this out', 'make this look', 'reskin', 'UX', 'interaction', 'form', or visual 'artifact'. Covers sequencing, material approval, routine-vs-material classification, house systems, anti-defaults, visual QA, and Canva handoff. Inherits krish-principles. On iPhone, iPad or Mac app work, also load apple-design beside this skill as the contrarian Apple second voice; this skill decides. It does not own copy voice, build mechanics, or multi-phase app orchestration. Last reviewed 2026-09-13."
 ---

 # Krish Design: Taste, Systems, and the Interaction Weapon
@@ -188,6 +188,7 @@
 | Read-only deployed UX audit | `ux-testing-agent`; supply this doctrine only as evaluation context and require reproducible evidence with route, viewport, revision, steps, expected result, observed result, and artifact |
 | Final on-page words | `krish-voice` |
 | Generic accessibility/usability lookup | `ux-foundations` beneath this personalized design owner |
+| Any screen, flow or artifact for an iPhone, iPad or Mac app, native or cross-platform | `apple-design` loads beside this owner as the contrarian Apple second voice (Ruling, Krish, 2026-11-25): it argues Apple's side with page-and-heading citations, and this owner decides |
 | Bounded pattern, palette, type, landing, chart, motion, or mobile-web candidate retrieval for one named concept arm | `design-intelligence-search` beneath this personalized design owner; retain taste and standards authority here |

 After any copy, accessibility, design, or implementation handoff, inspect and verify the combined rendered result. A handoff is not completion.
```

Also at admission: the Visuals line of `adapters/cloud/account-routing.md` gains "with apple-design beside it on iPhone, iPad or Mac app work", the staged routing-contract paragraph becomes a route row, and the krish-design trigger suite is rerun because its description changes.

**Canary round 2.** The candidate (hash `d9807920...`, equal to the source) and the patched krish-design (hash `49f89146...`) were installed together at the user skill root. Four fresh Sonnet agents got natural prompts, and their transcripts were checked for Skill calls. The prior copy was restored afterwards (hash `c7780b72...`).

| Prompt | Skills loaded | Result |
|---|---|---|
| iPad settings design review (the prompt that failed in round 1) | apple-design | Pass. It fired with no Apple wording; 6 quotes, all verbatim in the cited pages; handed off to krish-design, krish-build and ux-testing-agent |
| iPhone onboarding redesign | none | Fail |
| "Is this SwiftUI screen OK by Apple's rules?", three problems | apple-design | Partial. Quotes verbatim and the freshness check ran, but the always-load pages were only searched, not read; the output said so |
| Web pricing-section layout | none | Pass for apple-design (correctly absent) |

**krish-design loaded in 0 of 3 design prompts** (iPad, iPhone, web), even though its description makes it mandatory for every design request. Co-loading beside the owner cannot be observed while the owner does not fire. That is a krish-design trigger defect, not this candidate's. It is recorded as harness observation 364 (missed_trigger, krish-design).

## krish-design trigger fix and admission, 2026-11-25

Krish: "fix and then admit".

**krish-design fix.** Its description opened with gate language ("Ownership gate first: invoke for EVERY request") and named no ordinary review words. In round 2, three fresh agents asked for a design review, an onboarding redesign and a pricing layout loaded no skill. The new description leads with what it owns and when: design, redesign, review, critique, lay out, reskin or visual QA of app screens and flows, web pages, pricing sections, forms, dashboards, decks and artifacts. It names quick opinions ("what would you change", "give me a design review", "sketch the layout") as in scope, and keeps the old verbs (imitate, reshape, classify a routine visual repair) and every exclusion. It also names apple-design as the Apple second voice, and the routing table gains that row.
- Blind routing on krish-design's 21-case suite plus 8 plain design prompts, with all 34 production descriptions plus apple-design as the catalogue: the old description scored precision 0.90 and recall 1.00; the new one scored precision 0.947 and recall 1.00. The one false positive (012, a full app build, where krish-design loads beside build-apps-with-krish) is present in both.
- Canary round 3, the same three design prompts plus a control. iPad settings review: krish-design, then apple-design. iPhone onboarding: krish-design, then apple-design. Web pricing: krish-design only. Git question: nothing. **4 of 4.** Every quote checked was verbatim in its cited page.

**Admission.** The candidate moved to `skills/apple-design/` (with `agents/openai.yaml`), and its suites moved to `evals/`. The registry lists it in `production` and `production_active` with `expected_skill_count` 35. The routing contract carries its route row and collision rule in place of the staged paragraph. Both cloud routing texts name it (the Perplexity text was trimmed to stay at or under 1,500 characters). Routing cases 038 and 039 cover the co-load and its absence on web work. `scripts/Test-Harness.ps1` keeps the suite minimums, `brain/rules.yaml` records the new and changed chapters, and the neighbours table is re-rendered.

## Open after admission

- On short prompts apple-design searches its always-load pages instead of reading them in full, and says so in its output.
- Observation 364 (krish-design missed plain design prompts) is answered by this fix; the round 3 canary is the evidence.
