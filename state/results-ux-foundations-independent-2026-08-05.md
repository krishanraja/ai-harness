# Independent UX Foundations evaluation - 2026-08-05

## Scope

Evaluated `ux-foundations` with Claude Code 2.1.222 in safe mode using fresh executor and judge contexts, disabled tools and session persistence, and a USD 1 hard cap per Claude call. Raw outputs remain under ignored `work/`; this report contains redacted outcomes only.

The executor received the complete private skill package and blind cases. The behavior rubric was disclosed only to the fresh judge. The 21-trigger/23-behavior suite was added to repository enforcement before execution.

## Baseline

- Trigger routing: 21/21 pass.
- Behavior: 6/23 pass across three disjoint unchanged batches.
- Hard failures: 1.

The legacy single-file reference misattributed platform target guidance to WCAG, blended CSS pixels/points/`dp`, treated heuristics as requirements, asserted an exactly-one-`h1` rule, overstated WCAG's legal status, omitted current-source failure handling and experiment-integrity controls, and lacked explicit design/implementation/observed-QA handoffs.

## Final outcome

- Trigger routing: 21/21 pass in one complete final-version routing run.
- Behavior: 23/23 pass across three disjoint final-version batches (8/8, 8/8, 7/7).
- Remaining hard failures: 0.

A complete final-version run first reached 22/23 and, after a handoff correction, another complete run reached 21/23 because two otherwise-present facts were compressed out of individual answers. The high-risk response checks were made mandatory and the identical cases and expectations were partitioned into fresh executor/judge batches to remove cross-case response compression; the suite was not weakened.

## Corrections

- replaced remembered rules with a source-classification and current-primary-source lookup contract;
- separated normative WCAG criteria, informative W3C material, platform guidance, research, heuristics, and Krish-specific standards;
- distinguished WCAG 2.2 SC 2.5.8 Level AA at 24 by 24 CSS pixels from SC 2.5.5 Level AAA at 44 by 44 CSS pixels and preserved their exceptions;
- kept CSS pixels, Apple points, Android `dp`, and device pixels distinct and required dated primary links in cross-platform comparisons;
- removed exactly-one-`h1`, universal single-column, universal button-position, skeleton, validation-timing, and one-visible-variable claims;
- separated machine findings and screenshots from conformance, interaction evidence, and legal certification;
- added explicit unavailable-primary-source, hostile-content, confidential-artifact, retention, and no-certification boundaries;
- expanded the pre-launch experiment contract with assignment, population, power, instrumentation, SRM, attrition, contamination, stopping, privacy, and decision rights;
- made `krish-design`, `ux-testing-agent`, `krish-build`, `evidence-research`, counsel, and analytics/implementation ownership explicit;
- required artifact/revision identity, exact criteria, acceptance signals, approval boundaries, and post-fix observed readback in handoffs.

## Residual uncertainty

This evidence proves skill-level routing and prescribed behavior on synthetic cases, not the current accessibility or usability of any live product. Primary sources must still be rechecked for current requests. Production admission requires a clean deterministic package, one authorised client canary, observed discovery/routing checks, and active-surface parity. No product, source artifact, browser surface, cloud skill, local client skill, experiment, or deployment was changed.
