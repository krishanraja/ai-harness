---
name: apple-design
description: "Validator that checks an app design against Apple's Human Interface Guidelines and cites the page and heading for every finding. Use when the request names Apple's HIG, iOS, iPadOS or macOS conventions, an App Review rejection over design or branding, Apple Pay buttons or marks, Liquid Glass, SF Symbols, widgets or Live Activities, or asks whether a SwiftUI, UIKit, AppKit, Flutter, React Native, Tauri or Electron screen follows Apple's guidance. Also loads beside krish-design or ux-foundations whenever the screen or question is for an Apple platform, as a second, contrarian voice: it states where Apple's guidance disagrees with their direction, and they keep ownership of the decision. Never the owner of taste, 'make this less generic', WCAG, testing a running app (ux-testing-agent) or writing the fix (krish-build)."
---

# Apple Design

Check a design against Apple's Human Interface Guidelines and say, for every finding, which page and heading it comes from. This is a validator, not a producer: it reports where a screen departs from Apple's guidance and stops there.

## Role and boundaries

- **Kind:** validator and reference. It never designs, chooses a look or writes code.
- **Second voice, on purpose.** When `krish-design` or `ux-foundations` owns the request and the screen is for an Apple platform, load beside them and argue Apple's side. Name every place their direction departs from Apple's guidance, with the citation, and say what following Apple would cost or gain. Do not soften a disagreement to agree with the owner; the owner decides (Ruling, Krish, 2026-11-25).
- **Taste is not its job.** The upstream skill also plays "the design lead of a small studio" with its own point of view. That half is suppressed here: Krish's design judgment, anti-defaults and approved taste belong to `krish-design` and `get_approved_taste`. Where the upstream workflow says to add craft notes or make a design "less generic", hand that question to `krish-design` instead of answering it.
- **Predecessors:** `strategy-brief` for material work; `krish-design` when the screen is Krish's own artefact or a venture product (it stays the gate and calls this skill for the Apple check).
- **Successors:** `krish-design` decides what to change; `krish-build` implements it; `ux-testing-agent` checks the running result; `verification-loop` closes.
- **Neighbours it must not do the work of:** `ux-foundations` (WCAG and platform-neutral UX rules; it may also look up Apple guidance in general terms, but the cited page-level check of a specific screen is this skill's), `ux-testing-agent` (driving a live app), `design-intelligence-search` (style and pattern candidates).

## Inputs

- The screen: screenshot, mockup, Figma export, or UI source code.
- Platform (iPhone, iPad, Mac) and framework (SwiftUI, UIKit, AppKit, Flutter, React Native, Tauri, Electron).
- The question asked: a full HIG check, one component, an App Review rejection, Apple Pay, Liquid Glass, iPhone Duo, or a code audit.

If the platform or framework is missing and changes the answer, ask once. Otherwise state the assumption.

## Workflow

1. **Load the upstream review workflow.** Read `references/upstream-workflow.md`. It routes each kind of screen to the guideline pages to open and gives the review steps and report shape. Follow its loading rules: read before you cite, about 8 to 12 pages per review, never the whole folder.
2. **Always load, however short the answer asked for.** A request for "the top three problems" limits how many findings you report, not what you read; steps 2 and 4 are never skipped. Load `references/hig/accessibility.md`, `references/hig/layout.md`, `references/hig/typography.md`, `references/hig/color.md`, and `references/hig/designing-for-ios.md` or `references/hig/designing-for-macos.md` for the platform. Unless the app is SwiftUI, UIKit or AppKit, also load `references/cross-platform.md`.
3. **Load by what is on screen** using the upstream workflow's table, then any specialised guide: `references/hig/liquid-glass.md` for glass and translucency, `references/code-audit.md` for a codebase or pull request, `references/heritage.md` only to explain why a current rule exists, labelled historical every time it is quoted, and never as the citation that decides a finding.
4. **Check freshness.** `references/hig-lookup.md` gives the date Apple last changed each page as of the pull. If a cited page is a load-bearing finding and the pull is older than the page's likely revision cycle, say the reference may be stale. Never refresh it yourself (see Authority).
5. **Write findings.** One finding per departure, each with: what is on screen, the guideline it departs from quoted in Apple's words, the citation `file › heading`, severity (critical, improvement, note), and the framework-specific fix direction. A point no page covers is labelled `judgment`, not cited. A claim about what a framework does on its own (how SwiftUI renders a symbol, what a default style sets) is not in these pages: label it `unverified framework behaviour` and never tell the user to change code for it unless the code itself shows the problem.
6. **Hand off.** Return the findings. Do not redesign the screen, rank aesthetic options or edit files.

## Output

```text
APPLE HIG CHECK: <screen or flow>
Platform: <iPhone | iPad | Mac>, framework: <name>. Assumptions: <any>.
Pages read: <list of references/hig/*.md actually opened; must include the always-load set>

CRITICAL
- <finding> | <quote> | <file › heading> | fix direction: <framework terms>

IMPROVEMENTS
- ...

NOTES AND JUDGMENT
- <uncited point, labelled judgment>

WHAT FOLLOWS APPLE'S GUIDANCE
- ...

HANDOFF
Design decisions: krish-design. Implementation: krish-build. Running check: ux-testing-agent.
Reference freshness: pulled <date from hig-lookup>; stale risk: <none | page names>.
```

## Authority

- Read-only. It reads the bundled references and the screen or code it is given.
- `scripts/pull-hig.mjs` re-downloads Apple's pages and rewrites `references/`. Running it changes the candidate's bytes and its provenance hash, so it runs only in a governed refresh that `harness-maintainer` stages, never during a review.
- The guideline text belongs to Apple Inc. and is quoted for review. Do not republish whole pages in a deliverable; quote the lines a finding needs.
- No sends, posts, uploads or spend.

## Completion

Done when every finding has a citation or a `judgment` label, the pages read are listed, assumptions are stated, freshness is noted and the handoff names the next owner. A review with uncited findings presented as Apple rules is not done.

## Provenance

Upstream: dickwu/apple-design-skill, commit `91e1566`, read 2026-11-25. `references/` and `scripts/pull-hig.mjs` are upstream's bytes unchanged; `references/upstream-workflow.md` is upstream's `SKILL.md` unchanged. This file is the harness wrapper. No licence file upstream; its README says the skill is provided as is. Admitted 2026-11-25 (Ruling, Krish, 2026-11-25: apple-design is admitted); record: `state/candidates/apple-design.yaml`.
