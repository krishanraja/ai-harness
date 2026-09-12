---
name: design-intelligence-search
description: "Manual-only design-data retrieval companion for Krish's app workflow. Use only when krish-design or build-apps-with-krish explicitly delegates a bounded search for product patterns, style territories, palettes, typography, landing structures, icons, charts, motion, or a mobile-web candidate packet. Never trigger directly from a user's generic design, build, implement, improve, review, accessibility, or QA request; those remain owned by krish-design, build-apps-with-krish, krish-build, ux-foundations, or ux-testing-agent. Returns advisory candidates with pinned provenance and uncertainty; it never chooses taste, states standards, writes project files, implements code, tests a rendered UI, or mutates an external surface. Last reviewed 2026-09-12."
disable-model-invocation: true
---

# Design Intelligence Search

Retrieve options from a pinned local design dataset without becoming a designer, builder, standards authority, or validator.

## Role and route

Act as a subordinate read-only tool. Accept work only from an explicit `krish-design` or `build-apps-with-krish` delegation. A direct user request for an interface routes to its normal owner; that owner may then invoke this skill for one bounded evidence need.

The governing chain remains:

`build-apps-with-krish -> krish-design -> design-intelligence-search (optional evidence) -> krish-design lock -> krish-build -> ux-testing-agent / verification-loop`

This package contains a pinned adaptation of UI/UX Pro Max's local Python search engine. Its rows are advisory historical corpus, not current standards, verified user evidence, Krish's taste, or implementation authority.

## Input contract

Require a delegation packet with:

```text
OWNER: [krish-design | build-apps-with-krish]
DECISION: [the bounded design question]
PRODUCT + USER: [product type, audience, usage context]
SURFACE: [page/component/mobile-web flow]
EXISTING SYSTEM: [approved tokens/components/decision log, or none]
SEARCH NEED: [product | style | color | typography | landing | icons | chart | motion | mobile-web]
CONCEPT ARM: [the one exploration arm allowed to use this corpus]
STACK: [detected web stack, if implementation hints are requested]
CONSTRAINTS: [brand, content, data, accessibility, performance, authority]
```

If the owner, decision, or concept arm is missing, stop before retrieval and name every missing required field. Do not infer permission to lead the design.

Read `references/query-contract.md` before running a query. For any responsive mobile-web surface, also read `references/mobile-web-contract.md`.

## Query workflow

1. Inspect the actual project and approved design state supplied by the owner. Never let generic corpus output overwrite it.
2. Run `scripts/query.py` with the narrowest explicit mode and domain. The wrapper performs no network calls and exposes no persistence or force option.
3. Keep every seeding input inside one named concept arm, including a corpus packet, preset, seed, reference set, style prompt, extracted vocabulary, or derived summary. Refuse reuse across arms so false convergence cannot be manufactured.
4. Return several source-linked candidates, not one asserted answer. If no result is useful, report the miss, broaden once at most when justified, preserve both queries, and never synthesize candidates or citations. Label weak relevance, contradictions, and freshness limits.
5. Compare candidates against `krish-design` doctrine, approved tokens, product truth, and the existing system. Flag every material conflict explicitly and leave it unresolved for the owner; the owner decides what survives.
6. Route current accessibility or platform requirements to `ux-foundations`; current framework mechanics to the applicable technical skill or official documentation; implementation to `krish-build`; observed behavior to `ux-testing-agent`.

Example commands:

```text
python scripts/query.py "B2B analytics mobile web" --mode mobile-web --stack nextjs --project "Ops Console"
python scripts/query.py "trustworthy dense finance dashboard" --mode candidates --domain style --limit 5
```

Use the actual skill-directory path when the current working directory differs.

## Mobile-web invariant

For `--mode mobile-web`, the output is incomplete unless the final packet addresses every section of `references/mobile-web-contract.md`: responsive system, input parity, browser and viewport behavior, forms and virtual keyboard, state range and recovery, performance, accessibility-source handoff, and real-device/browser evidence.

Reject a native-only stack in mobile-web mode and return the scope mismatch to the delegating owner; never silently redefine the product as native or reinterpret a native request as web. Do not reuse native-only safe-area or touch rules without checking their mobile-web applicability. Do not assume a desktop breakpoint set, hover model, fixed viewport height, or one browser engine covers mobile web. When both audiences matter, release-critical evidence must include an actual WebKit iOS Safari path and an actual Chromium Android Chrome path; emulation alone is not final proof.

## Hard boundaries

- Never invoke the upstream installer, marketplace plugin, global CLI, `uipro init`, or `uipro update`.
- Never run upstream `--persist` or `--force`, create a competing `MASTER.md`, or write project files.
- Never use the upstream `ux`, `web`, `react`, or stack rows as normative or current authority. Stack rows are explicitly labelled implementation leads and must be reverified.
- Never let corpus popularity choose Krish's visual language or bypass rendered-mock approval.
- Never feed the same corpus packet to every divergence generator.
- Never implement, deploy, certify accessibility, or call a static recommendation observed usability evidence.

## Output

```text
DESIGN INTELLIGENCE PACKET
OWNER + DECISION: [delegation identity]
PIN: [source repository, commit, local vendor hash]
QUERY: [mode, terms, domain/stack, retrieval time]
CONCEPT ARM: [where this evidence may influence]
CANDIDATES: [ranked alternatives with source rows and reasons]
MOBILE-WEB CONTRACT: [covered dimensions and open evidence, if applicable]
CONFLICTS: [Krish doctrine, approved system, current source, or project truth]
AUTHORITY: advisory corpus only
HANDOFF: [krish-design decision | current-source lookup | krish-build | ux-testing-agent]
```

Completion means the bounded evidence packet is reproducible and honestly labelled. It does not mean a design is approved, built, accessible, responsive, or verified.
