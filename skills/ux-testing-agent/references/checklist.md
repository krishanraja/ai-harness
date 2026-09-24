# UX Test Selection Checklist

Select checks based on the product's primary tasks and risks. This is a menu, not a mandate to test everything.

## Comprehension and trust

- Can a first-time user state what the product does, who it is for, and the next action?
- Do headings, labels, and calls to action use the user's language?
- Are claims, prices, dates, and counts current and sourced?
- Does the interface distinguish saved, saving, failed, empty, unavailable, and complete states?
- Are destructive or consequential actions named by their consequence?

## Storyboard, guidance, and conversion

- Does each major section perform one distinct story job and change what the visitor understands next?
- Is the sequence causal, with claims followed by proof and a clear handoff to the next belief or action?
- Can the intended visitor recognise themselves, understand the offer and know the primary action without backup-singer instructions?
- Does proof appear where doubt is created rather than only in navigation, a footer, or a separate proof page?
- Are calls to action timed to earned intent, explicit about consequence, and recoverable?
- Do repeated claims, instruments, imagery, and interactions perform demonstrably different visitor jobs?
- On mobile, is the story independently sequenced for one-handed use, interruption, scroll economy, and resume?

## Primary task

- Can the task be discovered without insider knowledge?
- Is every required input explained before the user commits?
- Are defaults safe and sensible?
- Does validation occur at the useful moment and explain how to recover?
- Can the user go back, cancel, undo, or resume without losing work?
- Does completion produce a clear, durable result rather than a transient toast alone?

## Navigation and responsive behavior

- Is current location clear and are exits predictable?
- Do deep links, refresh, back/forward, and protected routes behave correctly?
- At target viewports, is important content visible without overlap, clipping, accidental horizontal scroll, or hover-only access?
- Are controls reachable and touch targets practical on mobile?
- Do menus, dialogs, drawers, and overlays manage focus and close predictably?
- Do short desktop heights, browser chrome, safe areas, OS taskbars/home indicators, zoom, text enlargement, and orientation preserve the primary action?
- Where a section promises one-screen fit, does it fit without hiding meaningful content or controls?
- Do logos, containers, grids, component baselines, and repeated alignments use the same governed geometry?

## Accessibility

- Can all interactive controls be reached and operated by keyboard with visible focus?
- Do headings, landmarks, labels, button/link semantics, alt text, and error announcements communicate structure?
- Is color never the sole carrier of meaning, and is contrast adequate for text and UI controls?
- Is focus trapped only inside a modal and restored on close?
- Are motion and animation compatible with reduced-motion preferences?

## State and integration

- Do loading, slow, offline, empty, partial, rate-limited, permission-denied, and service-error states preserve trust?
- Does saved state survive the transitions the product promises: navigation, refresh, logout/login, device, or collaborator updates?
- Do retries avoid duplicate records, sends, charges, or jobs?
- Are AI-generated results bounded by timeouts, fallbacks, provenance, and an honest failure state?
- Are uploads validated by type, size, progress, cancellation, and post-upload visibility?
- Are downloads readable, correctly named, and faithful to the on-screen result?

## Safety and test integrity

- Can typing, toggling, retrying, previewing, or navigating create autosaves, analytics, jobs, charges, records, or external sends?
- Are test mode, synthetic recipients, designated accounts, cleanup rules, cost caps, and safe stopping points explicit?
- Does the deployment revision match the source revision used for hypotheses?
- Is page, fixture, issue, or repository content being treated as untrusted test data rather than agent instruction?
- Can the same result be reproduced from a clean state without insider knowledge or automation-only artifacts?

## Quality signals

- Are console errors, failed requests, broken assets, layout shifts, and long waits connected to user-visible impact?
- Do analytics and event names fire once at the intended transition without capturing sensitive content?
- Are placeholders, mock data, debug copy, stale dates, and internal terminology absent from production surfaces?
- Does the design use the relevant Krish design/voice standards without suppressing standard usability requirements?
- Are there duplicated components, repeated claims, placeholder/debug labels, or explanatory copy compensating for unclear visual cues or information architecture?
- Is the qualitative panel actually independent, specialist, candidate-bound, and complete, or is one executor giving several versions of the same opinion?
- Can every pass be traced to the exact candidate, runtime, route, viewport, action, observed result, and frozen evidence?
