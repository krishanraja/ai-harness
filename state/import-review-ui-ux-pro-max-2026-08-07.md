# UI/UX Pro Max import review — 2026-08-07

## Decision

Admit only the pinned local search engine and data through the manual-only `design-intelligence-search` adapter. Do not install the upstream skill, plugin, CLI, updater, broad trigger, persistence workflow, or generic standards claims.

## Source and provenance

- Repository: `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill`
- Commit: `abb7f2fd5a083fa1ff55c326a963ff0d95c33f99`
- Exact observed tag: `v2.14.1`
- Retrieved: 2026-08-07
- License: MIT; license text retained with the vendored source
- Upstream metadata is internally inconsistent: skill and Claude plugin report 2.13.0, repository CLI package reports 2.5.0, and the npm package observed on 2026-08-07 reports 2.14.1. The commit, not a marketing version, is the identity anchor.

## What was retained

- The Python search and design-system generation engine.
- The CSV product, style, colour, typography, font, chart, landing, icon, motion, interface, and stack datasets.
- Upstream offline unit tests and data validator.

## What was suppressed

- Broad automatic routing for design, implementation, review, accessibility, UX, React, and web work.
- Installer, marketplace, global CLI, update command, and project initialisation.
- `--persist`, `--force`, `MASTER.md`, and all project-file mutation.
- Normative accessibility, platform, browser, React, and framework authority.
- Taste selection, design approval, implementation, deployment, and QA claims.

## Collision result

The upstream package overlaps `krish-design`, `build-apps-with-krish`, `krish-build`, `ux-foundations`, `ux-testing-agent`, and `verification-loop`. Its unique admitted value is reproducible local retrieval. The adapter therefore sits beneath the existing owners and may affect only one named concept arm at a time.

## Mobile-web adaptation

The corpus is wrapped in a separate mobile-web contract covering content-derived responsiveness, touch/keyboard/pointer parity, dynamic viewport and browser chrome, safe areas and display modes, virtual keyboards and forms, state recovery, token consistency, performance/resilience, current-source accessibility handoff, and real browser/device evidence. Vendor rows remain candidates; the contract and current owners decide whether they survive.

## Deterministic evidence

- Upstream offline unit tests at import: 36/36 passed.
- Upstream data validation at import: 12 domains and 22 stacks passed, including `ui-reasoning.csv`.
- Adapter exposes no network, persistence, force, install, update, or project-output option.
- The full vendored directory hash is recorded in `skills/design-intelligence-search/references/upstream-provenance.json`.

## Freshness policy

The weekly harness audit checks upstream commit/tag and package metadata drift. Changes are reviewed and re-evaluated before a new pin; production never auto-updates from upstream.
