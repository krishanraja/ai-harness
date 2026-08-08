# Robust mobile-web UI contract

Use this reference whenever the target is a web app expected to work reliably on phones or phone-like narrow viewports. It is an execution and evidence envelope, not a substitute for current normative sources.

## 1. Product and state truth

- Name the primary mobile task, context of use, content/data range, authentication state and completion signal.
- Preserve existing approved tokens, components and interaction decisions.
- Cover representative, empty, loading, slow, partial, stale, offline, permission-denied, validation-error, server-error and recovery states where applicable.
- Keep long, translated and adversarial content from breaking hierarchy or controls.

## 2. Responsive system

- Derive breakpoints from content and interaction failure, not a copied device list.
- Define container, gutter, spacing, type, density, navigation and component-behavior rules across the intended range.
- Verify narrow phone portrait, phone landscape, large phone, tablet/narrow desktop and wide desktop when in scope.
- Avoid accidental horizontal scrolling, nested scroll traps, clipped overlays and fixed elements covering content.
- Keep the same semantic task and status across layouts even when navigation or composition changes.

## 3. Input and interaction parity

- Support touch without requiring hover; support keyboard and visible focus wherever a keyboard can reach the app.
- Account for coarse and fine pointers, tap feedback, accidental double submission, gesture conflicts and safe escape paths.
- Keep hit areas, spacing, zoom behavior and focus order tied to current platform/accessibility evidence from `ux-foundations`, not recalled numbers from the vendor corpus.
- Ensure drag, swipe, long-press and hover interactions have discoverable alternatives for critical tasks.

## 4. Mobile browser and viewport behavior

- Test dynamic browser chrome, scrolling, orientation change, standalone/PWA mode when supported, and resizing after load.
- Treat `vh`, `svh`, `lvh` and `dvh` behavior as an implementation decision requiring current browser support evidence.
- Handle notches and safe-area insets only where the browser and display mode expose them; do not copy native layout assumptions blindly.
- Verify sticky headers, bottom bars, sheets, dialogs and full-height panels while the address bar expands/collapses.
- Establish the supported browser matrix from the intended audience. At minimum, test the actual iOS Safari and Android Chrome paths when both audiences matter; emulation alone is not final proof.

## 5. Forms and virtual keyboard

- Use semantic labels, appropriate input types, input modes, autocomplete purpose and clear inline recovery.
- Verify focus does not hide the field, error or primary action behind the virtual keyboard or fixed UI.
- Preserve entered work through validation failures, navigation interruptions, retries and expected refresh/re-auth boundaries.
- Prevent duplicate submissions and communicate pending, success, partial and failure states truthfully.

## 6. Visual consistency and theming

- Use semantic design tokens rather than page-local values.
- Keep typography, spacing, icon family, radii, elevation, focus, pressed, disabled, loading and error states consistent.
- Verify light/dark and high-contrast behavior only when those modes are supported; never infer one theme from another.
- Let `krish-design` decide which corpus candidates fit the product. Popularity or ranking is not taste evidence.

## 7. Performance and resilience

- Define task-relevant budgets before implementation: initial route, interaction responsiveness, layout stability, media/font weight and slow-network behavior.
- Retrieve current Core Web Vitals definitions and thresholds from authoritative sources when making a current claim.
- Test representative real content, throttled network/CPU where useful, image/font failure, API delay, retry and offline/degraded states.
- Prefer progressive rendering and preserved layout; do not trade away comprehension or accessibility for a synthetic score.
- Verify on representative physical devices for release-critical flows. Desktop emulation is useful diagnosis, not complete mobile proof.

## 8. Accessibility-source handoff

- Send normative questions, units, conformance levels and platform comparisons to `ux-foundations` with the target browsers, devices and decision.
- Keep automated findings separate from manual keyboard, screen-reader, zoom, orientation and task evidence.
- Never call this packet certification or legal compliance.

## 9. Evidence and handoff

Before a mobile-web design is called locked, record:

```text
MOBILE-WEB EVIDENCE
SURFACE + REVISION: [artifact]
SUPPORTED RANGE: [content-driven viewport range]
BROWSERS + DEVICES: [real and emulated, identified separately]
INPUTS: [touch, keyboard, pointer, assistive setup]
STATES: [attempted state matrix]
PERFORMANCE: [budgets and observed signals]
CURRENT-SOURCE REQUIREMENTS: [ux-foundations evidence]
OPEN RISKS: [unverified conditions]
NEXT OWNER: [krish-design | krish-build | ux-testing-agent]
```

`krish-build` receives the locked artifact, token/component rules, state fixtures, supported range and acceptance checks. `ux-testing-agent` receives the deployed revision, target matrix, primary tasks, safe test state and observable pass signals.
