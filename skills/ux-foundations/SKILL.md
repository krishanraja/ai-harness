---
name: ux-foundations
description: "Thin generic UX reference: usability heuristics, accessibility essentials, common interaction patterns, and a minimal A/B test structure. This is a fundamentals LOOKUP only, replacing nine retired generic UX skills. Use ONLY when a generic usability principle, WCAG basic, standard pattern, or test-design fundamental needs to be checked or cited, e.g. 'which heuristic does this violate', 'accessibility basics for this form', 'standard pattern for X', 'structure an A/B test'. Do NOT use this skill for designing or building Krish's own artifacts, pages, dossiers, or products; krish-design carries his actual standards and inherits krish-principles. If both could apply, krish-design wins and may point here for a fundamentals check. Last reviewed 2026-07-03."
---

# UX Foundations: Generic Reference

Fundamentals only. Krish's own design standards live in krish-design, which always takes precedence. This file exists so retiring the nine generic UX skills loses nothing durable.

---

## 1. Usability heuristics (Nielsen, condensed)

1. **Visibility of system status.** The system always shows what is happening (loading, saved, failed) within a reasonable time.
2. **Match between system and real world.** Speak the user's language; follow real-world conventions.
3. **User control and freedom.** Clearly marked exits, undo, and redo. No traps.
4. **Consistency and standards.** Same words and actions mean the same things everywhere; follow platform conventions.
5. **Error prevention.** Eliminate error-prone conditions or confirm before destructive actions.
6. **Recognition over recall.** Options visible; instructions retrievable. Do not make users remember state across screens.
7. **Flexibility and efficiency.** Accelerators for experts (shortcuts, defaults) that novices never see.
8. **Aesthetic and minimalist design.** Every extra unit of information competes with the relevant ones.
9. **Help users recognise, diagnose, recover from errors.** Plain-language errors that state the problem and the fix.
10. **Help and documentation.** Ideally unnecessary; if needed, searchable, task-focused, short.

Severity when auditing: blocker (prevents task completion), major (significant friction or frequent), minor (cosmetic or rare). Rate by impact times frequency.

---

## 2. Accessibility essentials (WCAG 2.x, the working set)

- **Contrast**: 4.5:1 minimum for body text, 3:1 for large text and UI components (AA).
- **Keyboard**: every interactive element reachable and operable by keyboard; visible focus state; logical tab order; no keyboard traps.
- **Touch targets**: minimum 44x44px (Apple) / 48x48dp (Android).
- **Semantics**: real buttons and links, labelled form fields, alt text that carries meaning (or empty alt for decoration), one h1, heading levels in order.
- **Motion**: respect prefers-reduced-motion; no content that flashes more than 3 times per second.
- **Colour**: never the only carrier of meaning; pair with text, icon, or pattern.
- **Forms**: labels attached to inputs, errors announced and adjacent to the field, no placeholder-as-label.

Conformance levels: A (baseline), AA (the standard legal and practical target), AAA (specialised).

---

## 3. Common interaction patterns

- **Forms**: single column beats multi-column; group related fields; inline validation on blur, not on every keystroke; primary action right-aligned or full-width on mobile; show progress on multi-step flows.
- **Navigation**: current location always visible; mobile primary nav within thumb reach; breadcrumbs for deep hierarchies.
- **Feedback**: optimistic UI for fast operations with rollback on failure; skeletons over spinners for content loads over ~1s; toasts for confirmations, inline for errors.
- **Empty states**: explain what belongs here and give the first action. Never a blank pane.
- **Destructive actions**: confirm with the consequence named, or provide undo. Undo beats confirm where feasible.
- **Mobile**: one-handed reach zones; avoid hover-dependent interactions; drag interactions always get a tap alternative.
- **Anti-patterns to catch in audits**: mystery-meat navigation, disabled buttons with no explanation, infinite scroll where users need to reach the footer, modal-on-modal, unsolicited interruptions before first value.

---

## 4. A/B test structure (minimal)

1. **Hypothesis**: "Changing X to Y will improve metric M for segment S because reason R." No hypothesis, no test.
2. **One variable per test.** Multivariate only with the traffic to power it.
3. **Primary metric decided before launch**, plus guardrail metrics that must not degrade.
4. **Sample size computed up front** from baseline rate and minimum detectable effect; run to the computed size, not to significance-peeking.
5. **Full business cycles**: run at least one complete weekly cycle; avoid ending mid-pattern.
6. **Decision rule pre-committed**: ship, kill, or iterate thresholds written down before data arrives.

Anti-patterns: stopping early on a good day, testing trivia while the value proposition is unvalidated, calling a test on a segment it was not powered for.

---

## 5. Cross-references

- **krish-design**: Krish's actual standards; always wins on his work.
- **krish-principles**: how to evaluate and decide, including the ranked table for design trade-offs.
- **frontend-design (public skill)**: environment design tokens for web builds.
