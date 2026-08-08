# Query contract

## Purpose

Use the pinned corpus to widen or test one design exploration arm. Never treat a ranked row as a design verdict.

## Allowed retrieval

| Need | Domain or mode | Treatment |
|---|---|---|
| Product-category patterns | `product` | Advisory pattern candidates |
| Style territory | `style` | Vocabulary and alternative territories |
| Palette | `color` | Candidate tokens; verify contrast in rendered context |
| Type pairing | `typography` or `google-fonts` | Candidate pairing; verify availability, licensing, loading and legibility |
| Landing structure | `landing` | Candidate sequencing, subordinate to product truth |
| Icon family/use | `icons` | Candidate family and semantics, subordinate to approved system |
| Chart form | `chart` | Candidate chart type, subordinate to data/task truth |
| Motion territory | `gsap` | Candidate behavior, subordinate to reduced-motion and performance evidence |
| Responsive mobile web | `mobile-web` | Combined candidates plus the mobile-web evidence contract |

The wrapper rejects upstream `ux`, `web`, and `react` domains because their claims overlap maintained owners and may become stale. It accepts selected web stacks only as implementation leads, never requirements.

## Retrieval rules

1. Use concrete multi-dimensional terms: product, user, task, trust level, density, tone, and surface.
2. Pass the domain explicitly. Auto-detection is evidence for exploration only and may be ambiguous.
3. Keep at least three materially distinct candidates when choice matters.
4. Preserve returned source rows and ranking scores where available.
5. If results are weak or empty, broaden once and report the miss. Do not fabricate a match.
6. Challenge generic recommendations against approved Krish doctrine and actual product constraints.
7. Bind every seeding input to one concept arm: corpus packet, preset, seed, reference set, style prompt, extracted vocabulary, and derived summary. Independent arms must not share any of them before divergence is judged.

## Current-source boundary

Route these elsewhere:

- normative accessibility, platform guidance, units, exceptions and current thresholds -> `ux-foundations`;
- current React, Next.js, browser or framework mechanics -> the applicable reviewed technical skill and official documentation;
- implementation -> `krish-build`;
- rendered, task-first validation -> `ux-testing-agent`;
- final qualitative and outcome closure -> `verification-loop` and Krish where taste is load-bearing.

## Freshness

The source pin proves which corpus was queried, not that every row is current. The weekly harness audit compares the upstream repository and package metadata with the pinned commit, reviews material changes, and never updates production automatically.
