---
name: krish-design
description: "Krish's design doctrine and house systems. MANDATORY before building or reshaping ANY visual artifact for Krish: HTML pages and artefacts, one-pagers, PDFs, decks, invites, SVG, React UI, forms, intake flows, reskins, landing pages, or visual QA passes. Trigger on: 'design', 'build a page', 'one-pager', 'dossier', 'brief I can use live', 'lay this out', 'make this look', 'reskin', 'the UX of', 'interaction', 'form', 'artifact', 'leave-behind', or any request that produces something a human will look at or touch. Covers interaction-as-sequencing doctrine, material product-surface approval, the Mindmaker / AdFixus / Signal & Noise / machine-first systems, document templates, anti-defaults, end-of-build visual QA, and the Canva handoff rule. Inherits krish-principles (read it first). Does NOT cover on-page copy voice (krish-voice), build mechanics (krish-build), or multi-phase app orchestration (build-apps-with-krish). Last reviewed 2026-08-05."
---

# Krish Design: Taste, Systems, and the Interaction Weapon

How Krish designs. Inherits krish-principles; read that first. Words on the page follow krish-voice. This file governs everything the user sees and touches.

Stability tags per krish-principles: [LOAD-BEARING] is stable conviction, [IN-PLAY] is actively tested.

---

## 1. Interaction as sequencing (the weapon)

Design's job is to control the order and rate at which a user absorbs information and acts on it. Layout is not decoration; it is choreography.

**One rendered material surface, then explicit approval.** [LOAD-BEARING]
For every new or materially changed app or product surface, produce one rendered artifact, present it without anchoring Krish's first reaction, and wait for his explicit approval before implementation or the next material surface. A material change alters the surface's purpose, journey, hierarchy, interaction model, responsive behavior, visual language, signature component, or user-facing meaning. Lock the approved revision and rationale immediately. Routine repairs and extensions within an already approved layout, interaction model, component system, and responsive doctrine continue autonomously and still receive visual QA. If the boundary is genuinely ambiguous, ask one focused classification question. For multi-surface or multi-phase delivery, `build-apps-with-krish` orchestrates this gate without replacing this skill.

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

Reach for these without re-deciding. They are defaults to deviate from on purpose, not law. Brand facts and positioning live in the mindmaker skill; this is the visual layer only.

### Mindmaker
- Palette: forest greens, cream, mint accent.
- Type: Space Grotesk (display), Inter (body), Space Mono (labels, eyebrows, metadata).
- Feel: operator-grade, warm, precise. Text wordmark over logo images where a logo would need base64 weight.

### AdFixus
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

---

## 8. The Canva ceiling

Raw SVG cannot load a real display font; type-led work in raw SVG defaults to bold-generic regardless of everything else done right. When the design is type-led (posters, invites, anything where the lettering IS the design), state the ceiling honestly and hand off to Canva (MCP available) for the final artboard and font pass rather than shipping the compromised version as final. The handoff is part of the design, not a failure of it.

---

## 9. Cross-references

- **krish-principles**: the doctrine this file applies. Radical simplicity, bias for actionability, opinionated then honest all originate there.
- **krish-voice**: every word on any surface. Non-negotiable.
- **krish-build**: how the artifact gets built, validated, and shipped, including the present-files rule and programmatic copy checks.
- **mindmaker**: brand facts, positioning, the expensed-buyer constraint.
- **ux-foundations**: generic usability heuristics and accessibility basics, for fundamentals lookup only.
- **frontend-design (public skill)**: read alongside this file when building web UI; it carries the environment's design tokens.
