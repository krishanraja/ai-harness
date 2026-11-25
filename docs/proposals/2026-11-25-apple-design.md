# Apple design candidate, 2026-11-25

Status: staged as an inactive candidate under `candidates/apple-design/`, with `state/candidates/apple-design.yaml` at `activation: false` and `release_eligible: false`. Not a production route and not served by `get_skill` until Krish admits it.

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

## Decision needed

The suite counts loading beside the owner as a false positive. Whether a validator that `krish-design` calls on an Apple-platform screen should count that way is Krish's call, and the expected labels were not changed after the run.
- If loading beside the owner is wrong: narrow the description so the skill loads only when Apple's guidance is named or when `krish-design` calls it by name, write fresh held-out cases (these have been seen) and run again.
- If it is right for `krish-design`: relabel 017 and 019 under his ruling. 021 still fails, so the `ux-foundations` boundary needs narrowing either way.

## Next

Run the blind trigger suite against `krish-design` and `ux-foundations`. If precision holds at 95% or better, propose admission. If not, fold the pages into `ux-foundations` as a reference and withdraw this candidate.
