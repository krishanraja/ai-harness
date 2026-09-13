---
name: krish-design
description: "Ownership gate first: invoke for EVERY request to design, imitate, build, reshape, reskin, lay out, classify a routine visual repair, or visually QA anything a human will look at or touch, even when asked to skip commercial/design judgment or reopen an approved system unnecessarily. Krish's mandatory design doctrine for pages, artefacts, PDFs, decks, SVG, React UI, forms, flows, landing pages, and visual QA. Trigger on 'design', 'build a page', 'lay this out', 'make this look', 'reskin', 'UX', 'interaction', 'form', or visual 'artifact'. Covers sequencing, material approval, routine-vs-material classification, house systems, anti-defaults, visual QA, and Canva handoff. Inherits krish-principles. It does not own copy voice, build mechanics, or multi-phase app orchestration. Last reviewed 2026-09-13."
---

# Krish Design: Taste, Systems, and the Interaction Weapon

How Krish designs. Inherits krish-principles; read that first. Words on the page follow krish-voice. This file governs everything the user sees and touches.

Stability tags per krish-principles: [LOAD-BEARING] is stable conviction, [IN-PLAY] is actively tested.

## Design task contract

Act as the visual and interaction **producer**, not the end-to-end app orchestrator, code owner, copy owner, UX auditor, or release authority.

Before design, record:

```text
STATE OF USE: [where, when, device, cognitive state]
USER + ACTION: [who acts and what they must understand/do]
GOVERNING RULE: [what the surface may claim and how it must behave]
DATA TRUTH: [available, sparse, loading, stale, error, adversarial]
MATERIALITY: [material | routine inside locked system]
BRAND + VOICE: [current first-party context]
AUTHORITY: [render/draft scope and exact approval walls]
PROOF: [viewports, state range, accessibility, rendered evidence]
```

If a load-bearing field is missing, discover it from current sources or state a bounded assumption. Ask Krish one focused question only when the answer is a material taste, product, positioning, or trade-off judgment he owns.

For every output, name the artifact revision, rendered evidence, current approval state, downstream owner, and pending action. Never imply that a design lock is code, deployment, or release authority.

---

## 1. Interaction as sequencing (the weapon)

Design's job is to control the order and rate at which a user absorbs information and acts on it. Layout is not decoration; it is choreography.

**One rendered material surface, then explicit approval.** [LOAD-BEARING]
For every new or materially changed app or product surface, produce one rendered artifact, present it without anchoring Krish's first reaction, and wait for his explicit approval before implementation or the next material surface. Show every revised material mock cold too: withhold the design rationale and change log until after his first reaction, then reveal a concise feedback-to-change map; never hide safety, authority, factual, or data constraints needed for responsible judgment. If two consecutive revised mocks within the same conceptual spine are rejected, stop refining that spine and return to fresh concept divergence and adversarial judging. Reset the revision count for the newly selected spine. Continue refining the rejected spine only when Krish explicitly asks for that scoped override. A material change alters the surface's purpose, journey, hierarchy, interaction model, responsive behavior, visual language, signature component, or user-facing meaning. Lock the approved revision and rationale immediately. Routine repairs and extensions within an already approved layout, interaction model, component system, and responsive doctrine continue autonomously and still receive visual QA. If the boundary is genuinely ambiguous, ask one focused classification question. For multi-surface or multi-phase delivery, `build-apps-with-krish` orchestrates this gate without replacing this skill.

Routine visual repairs are classified here, implemented through `krish-build`, and checked at every applicable viewport and state. Do not reopen taste or product discovery merely to fix spacing, wrapping, alignment, or another defect inside the lock.

After every rejected mock, capture Krish's exact first reaction, then classify the root cause as **product rule, interaction, design system, copy, data truth, or frame-level execution** before choosing the next action. Fix the lowest correct owner and revise only the current surface.

**Fresh divergence is blind; judging is historically informed.** [LOAD-BEARING]
For any load-bearing fresh divergence, produce at least three independent concept spines with deliberately different governing interaction metaphors. A set is meaningfully diverse only when each spine differs from the others on at least two load-bearing axes: sequencing, user agency, primary interaction, information structure, or state model. Palette, type, copy, component skin, and ornament do not count. When a rejected spine triggers the divergence, give generators a sanitized brief containing the user outcome, invariant product, data, safety, accessibility, brand, and implementation constraints, plus Krish's failure signals rewritten as non-solution requirements. Do not show generators the rejected renders, layout descriptions, rationales, change logs, rankings, or solution-specific features, and do not leak them through leading summaries. Give two fresh-context primary judges anonymized candidates in independently randomized orders, the sanitized brief, the complete rejected history, and the same rubric. Keep their verdicts hidden from each other. If they materially disagree on the winner, a hard-constraint pass, or whether the set is diverse enough, use a third blinded tiebreaker with the same evidence but none of the earlier verdicts or rationales. Follow the tiebreaker on technical and evidentiary questions, preserve material dissent, and gather missing evidence when the verdict is inconclusive. Escalate one focused question to Krish only when the residual disagreement depends on his taste, positioning, priority, product thesis, or another judgment only he can make. If the first set is superficially convergent, reject it before human review and run one additional blinded round targeted at the missing conceptual territory. If that round also converges, stop and surface the brief, model mix, or unresolved product constraint as a blocker. Present Krish only the rendered synthesis unless comparing alternatives is itself his decision.

Before rendering a divergent synthesis, prove that its interaction, information, and state model are feasible with the real code and data constraints. For a tiebreaker, randomize the anonymized candidate order again and preserve the material minority rationale.

When one exploration arm would benefit from a broader pattern vocabulary, explicitly delegate a bounded query to `design-intelligence-search`. Name the decision, product and user, surface, existing system, search need, concept arm, stack if relevant, and constraints. Keep the returned corpus inside that arm until divergence is judged; never give the same preset packet to every generator. Treat every result as an advisory candidate: this skill still decides fit against Krish's taste, approved tokens, real product truth, and current evidence.

**The verdict sits where the user acts.** [LOAD-BEARING]
Never bury the conclusion in a summary box at the bottom. Place the verdict, the response, the answer directly at the point of interaction (under the chips they click, beside the control they touch). If the user has to scroll to find out what their action meant, the layout failed. Proven in the record: relocating a curveball response from a distant verdict box to directly under the clickable chips.

**Design for the state of use, not for completeness.** [LOAD-BEARING]
Every artifact has a moment: a live sales call, a pre-sprint intake on a phone, a morning brief between meetings, an interview leave-behind. Design for the user's cognitive state in that moment (busy, live, one-handed, distracted). A landscape one-pager for a live call is scannable in glances; a mobile intake is tappable with a thumb. Ask "where and when is this used" before "what should it contain".

**Reduce input cost to near zero.** [LOAD-BEARING]
The off-the-top-of-the-head standard: the system drafts first from what it already knows, then asks only confirm, pick, or name-one questions answerable in a single sentence. Never ask a user to prepare, recall at length, or type when a tap would do. Chips, sliders, and voice input before free text. Free text is the fallback, not the default.

**Impossible to lose input.** [LOAD-BEARING]
Anything a user types or chooses persists: autosave with a visible status indicator, always-available export (copy, download, email fallback), resume on return. Losing a user's input once is a trust kill. Note: raw localStorage silently fails in the artifact sandbox; use the environment's persistent store (see krish-build).

**Progressive disclosure, one ask per screen.** [LOAD-BEARING]
One scenario, one question, one decision per screen. A 90-second session that completes beats a 10-minute session that gets abandoned. No-scroll one-ask is the ceiling for anything used under time pressure.

**Gate progress on the input that matters, softly.** [IN-PLAY]
Require the field that makes the submission attributable or useful (a name, a reasoning line), gate the Continue on it, but offer a quiet skip rather than a wall. Attribution comes from the capture, not from per-user URLs or link gymnastics.

**Voice is a first-class input.** [IN-PLAY]
Where the Web Speech API or equivalent is available, offer voice capture alongside tapping. Busy users talk faster than they type.

---

## 2. House design systems

Reach for these without re-deciding. They are defaults to deviate from on purpose, not law. Brand facts and positioning live in the mindmake skill; this is the visual layer only.

### Mindmake
- Authority: for current Mindmake brand work, retrieve the recorded revision of `project-documentation/00_NORTH_STAR.md` and `03_DESIGN_CONTRACT.md` from `krishanraja/mindmake`. This subsection is a routing floor, not a substitute for the live contract.
- Ground and surfaces: deep ink green (`#0a100d` with the recorded raised-ink and paper bands), warm cream, and one semantic accent system. Mint means the answer; amber means what moved or changed. Never use either as arbitrary decoration.
- Type roles: Archivo carries structure; Newsreader is reserved for the claim/payoff; IBM Plex Mono carries data, sources, timestamps, and controls; Source Serif 4 carries running text. Do not flatten the roles into one generic sans system.
- Feel: dark, warm, physical, and instrument-like. Motion and microinteraction communicate that the system is alive; the six instrument marks carry specific meanings and are not decorative variety.
- Conflict rule: the current North Star controls identity and founder visibility when another design document disagrees. Preserve historical filenames and legal-entity names only where the source or law requires them.

### AdFixus (RETIRED 2026-07, kept only for historical artifacts)
**Never choose this for new work, and never present AdFixus as a live venture.** The offer is retired; the system is recorded so an existing deliverable can still be matched or amended. Krish's adtech and identity history stays live as network and evidence, but it is not a brand to design for.
- Palette: dark navy base, cyan accent.
- Type: Helvetica.
- Feel: enterprise, credible, breathing room mandatory (see anti-defaults). Deliverables ship external-ready: no placeholder text, no internal notes.

### Signal & Noise
- Logo-led: the actual wordmark image, centred, alone. No co-branding logos unless required.
- Header band background sampled to match the logo's own cream tone (sample a corner pixel, match the band).
- Feel: editorial, podcast-professional.

### Machine-first (agent-native products)
- Palette: cool technical base with exactly one signal colour (amber in the record). One.
- Type: monospace as co-star, not garnish.
- Hero: a live streaming API response or real system output. Never an illustration, never a gradient, never a mascot.
- Feel: the product demonstrates itself. Built for an audience that distrusts marketing surfaces.

### Personal / celebratory (invites, occasion pieces)
- No fixed system; direction set per piece with reference boards.
- Standing decisions from the record: London sits centre and tallest in any three-city arrangement (Sydney, London, New York); muted 70s tones when going retro; silhouettes over cartoon faces (see anti-defaults); print grain via SVG feTurbulence at low opacity for texture.

---

## 3. Narrative flow: document templates

### The verified-record dossier
For guest prep, prospect intelligence, and any research subject.
- Structure: constant spine across the series (identity block, career arc, current thesis, covered ground, question ladder, host notes).
- Type: Fraunces (serif display), JetBrains Mono (metadata elements).
- Palette: varied per subject, and the variation carries meaning (see section 5). Examples from the record: teal and oxblood for a verification thesis; bronze with a segmented fraction ring for a four-role portfolio operator.
- Question styling encodes intent: inquiry styling for laddered gentle questions, pressure styling for the press. Steelman notes precede any press question (per krish-principles section 6).

### The landscape live-call one-pager
For anything referenced during a live conversation.
- Landscape orientation, scannable in glances, zero scrolling.
- Contents: who they are, what the play is, the one worked example, the ask, the names that matter. Nothing that requires reading a paragraph mid-call.

### The interview leave-behind / interactive artefact
Self-contained HTML, tabbed, interactive.
- Standfirst opens, verdict closes each section, and the verdict is placed where the user acts (section 1).
- Interactive elements (dials, chips, toggles) carry the argument; text supports.
- Columns balance to within a few pixels; cards stretch to equal height with actions pinned to the bottom (align-items stretch, margin-top auto on the action).

### The two-page sales one-pager
Named flagship case study on page 1 with a pull quote; the compounding mechanism plus a results grid (2x3 stat cards) on page 2, anonymised where the named permission does not exist; one honest note about deployment breadth. Honesty in the artifact is a sales asset, not a concession.

---

## 4. Interaction craft: reusable patterns

**The capture engine.** [LOAD-BEARING]
The proven interaction core for any quiz, intake, testimonial, or survey flow: a state machine driving one step at a time; chip and slider rendering for structured input; Web Speech voice input; manual copy, download, and email fallback for the output; a done screen that echoes the user's most meaningful answer back to them. Reskin it per brand; do not rebuild it per project.

**Affordance standard for controls.** [LOAD-BEARING]
A control must announce it is touchable: for a dial or slider, a white draggable thumb, an accent ring, a centre dot, and a pulsing hint animation that stops permanently on first touch, plus a short instruction pill ("Drag to set the level"). A flat dot is not an affordance. First-touch learning beats persistent chrome.

**Reordering gets two paths.** [IN-PLAY]
Drag-and-drop via pointer events for the fast path, always-available up and down arrows for the reliable one. Never drag-only, especially on mobile.

**Exports are self-describing.** [LOAD-BEARING]
Any exported output (Markdown, JSON) carries its full context header: what this is, when, the complete option text, the user's reasoning verbatim. An export that needs the app open to interpret is not an export. Exclude unanswered defaults so a default ordering never masquerades as a real ranking.

Before accepting any capture-flow export, inspect the emitted file and explicitly confirm that full context and verbatim reasoning are present and that every unanswered or untouched default is absent.

---

## 5. Consistency is the system, variation is the signal

Across any series (dossiers, episode assets, workshop pages): hold the structural template constant, vary the palette and one signature element per subject, and make the variation mean something (the four-segment ring for the four-role operator). Consistency builds the brand; variation carries the information. Random variation is noise; no variation is wallpaper.

---

## 6. Anti-defaults: what gets rejected on sight

- **The three current AI-site aesthetics.** [LOAD-BEARING] Whatever the prevailing template looks are (gradient-mesh hero, glassmorphism cards, mascot illustration), if it reads as generated-default, it is out. Check what the current defaults are and design away from them.
- **Cramped density.** [LOAD-BEARING] Rejected on sight. Add a page before shrinking the type. Breathing room is a feature, not waste.
- **Cartoon faces.** [LOAD-BEARING] Read as childish. Silhouettes, geometric abstraction, or type-led instead.
- **AI-tell copy patterns on the page.** [LOAD-BEARING] "Fragment. Fragment. Rhetorical turn." and its relatives. On-page copy follows krish-voice fully, including no em dashes anywhere and the banned word list.
- **Nested scrollbars inside components.** [LOAD-BEARING] The page scrolls; components do not. Rewrite the layout to natural height with sticky navigation before shipping a scrollbar inside a card.
- **Manufactured symmetry debt.** [IN-PLAY] Asymmetric stat card label lengths, unbalanced columns, stray min-heights that create phantom whitespace. Caught in QA (section 7).

## Design truth, evidence, and authority

- **Data honesty:** if the intended state needs data the product cannot reliably provide, fail the concept. Design and render an intentional sparse/default fallback and surface the material product fork. Never mock representative data as if it were live.
- **Range proof:** test representative, empty, loading, stale, error, adversarial, long-content, translated, and quiet states as applicable at both narrow and wide intended viewports. Fix the lowest shared content-contract, responsive, or component rule; do not add nested scrollbars or shrink type into illegibility.
- **Mobile-web reliability floor:** derive responsive changes from content and task failure rather than a copied device list; preserve semantic task and status across layouts; support touch, keyboard, coarse/fine pointers, zoom, orientation, virtual keyboards, dynamic browser chrome, safe-area/display-mode differences, retry and input preservation. Treat `vh`/`svh`/`lvh`/`dvh`, fixed/sticky controls, current accessibility thresholds, Core Web Vitals, and browser support as current-source decisions. For release-critical flows, verify representative state and performance on physical devices; when both audiences matter, include actual WebKit iOS Safari and Chromium Android Chrome paths. Emulation helps diagnose but is not final proof.
- **Stale-render recovery:** verify artifact revision, file size, and modification time; render through a fresh self-contained path; inspect high-resolution pixels; keep the visual verdict unverified until the current artifact is actually seen.
- **Private evidence:** redact or recapture screenshots with safe test data while preserving route, viewport, revision, and reproduction steps. If safe evidence is impossible, report the limitation and keep the affected verdict unverified. Never commit or upload customer/session material.
- **Ethical interaction:** refuse dark patterns, hidden or preselected consent, misleading hierarchy, and designs that obscure a user's real choice. Make the action and consequence legible, offer an ethical alternative, and state the business trade-off explicitly.
- **Visual approval:** record only the reviewed artifact and scope. Implementation, upload, send, publication, account mutation, spend, and deployment remain separate exact action-time approvals.
- **External tools:** prepare the minimum safe handoff locally. Route authentication through `tools-access`. Before Canva or another external upload, name the exact file, account/workspace, and target artboard, then wait for approval and verify the returned rendered artifact.

## Routing and handoffs

| Request | Route |
|---|---|
| Connected product rules, multiple app surfaces, implementation, and release | `build-apps-with-krish`; write every approved artifact revision, evidence, and approval scope into its one canonical state artifact before the next owner continues |
| One material visual surface or non-app visual artifact | `krish-design` |
| Locked implementation or routine visual repair | `krish-build` with artifact revision, state fixtures, viewports, and visual checks -> `verification-loop` |
| Read-only deployed UX audit | `ux-testing-agent`; supply this doctrine only as evaluation context and require reproducible evidence with route, viewport, revision, steps, expected result, observed result, and artifact |
| Final on-page words | `krish-voice` |
| Generic accessibility/usability lookup | `ux-foundations` beneath this personalized design owner |
| Bounded pattern, palette, type, landing, chart, motion, or mobile-web candidate retrieval for one named concept arm | `design-intelligence-search` beneath this personalized design owner; retain taste and standards authority here |

After any copy, accessibility, design, or implementation handoff, inspect and verify the combined rendered result. A handoff is not completion.

---

## 7. Visual QA: the end-of-build scan

Run this checklist proactively at the end of every visual build, before presenting. Do not wait to be asked.

1. **Stale content.** Hero subtitles, dates, counts, and claims still true? (Stale figures are credibility kills per krish-principles.)
2. **Typos and spacing.** Double spaces, missing punctuation, orphaned words.
3. **Symmetry.** Stat card labels within similar lengths; columns balanced to within a few pixels; cards equal height with actions aligned.
4. **Affordances.** Every interactive element announces itself (section 4). Hints stop after first use.
5. **Verdict placement.** Conclusions sit at the point of action, not in a distant box.
6. **Whitespace audit.** No phantom gaps from stray min-heights; no cramping either.
7. **Copy compliance.** No em dashes, no banned words, no AI-tell patterns (verify against krish-voice, programmatically where possible per krish-build).
8. **Render verification.** Actually look at the output (render the PDF page to an image, open the HTML) rather than trusting the code. A build that was never looked at was never QA'd.
9. **Present the file.** Presenting is a separate explicit step from creating (mechanics in krish-build). The user reacts to what they were shown, not what was written to disk.
10. **Responsive range.** Inspect intended narrow and wide viewports with long, empty, loading, error, and representative states; no overflow, clipping, phantom whitespace, or nested scroll.
11. **Accessibility.** Check keyboard path, visible focus, semantic labels, contrast, target size, motion/reduced-motion behavior, zoom/reflow, and non-drag/non-voice alternatives as applicable. Use current standards evidence through `ux-foundations` when the requirement may have changed.
12. **Voice and combined proof.** Run `krish-voice` on final words, then re-render and inspect the actual combined artifact so copy changes do not silently break layout.

---

## 8. The Canva ceiling

Raw SVG cannot load a real display font; type-led work in raw SVG defaults to bold-generic regardless of everything else done right. When the design is type-led (posters, invites, anything where the lettering IS the design), state the ceiling honestly and hand off to Canva (MCP available) for the final artboard and font pass rather than shipping the compromised version as final. The handoff is part of the design, not a failure of it.

Preserve a reviewable safe local draft before the handoff. The artifact remains provisional until the exact approved Canva target is rendered, returned, and visually verified.

---

## 9. Cross-references

- **krish-principles**: the doctrine this file applies. Radical simplicity, bias for actionability, opinionated then honest all originate there.
- **krish-voice**: every word on any surface. Non-negotiable.
- **krish-build**: how the artifact gets built, validated, and shipped, including the present-files rule and programmatic copy checks.
- **mindmake**: brand facts, positioning, the expensed-buyer constraint.
- **ux-foundations**: generic usability heuristics and accessibility basics, for fundamentals lookup only.
- **frontend-design (public skill)**: read alongside this file when building web UI; it carries the environment's design tokens.
