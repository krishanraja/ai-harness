# Accessibility standards ledger

Last primary-source verification: 2026-08-05. Recheck the linked official source whenever the user asks what is current.

## Source order

1. The normative [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/) defines web success criteria and conformance levels.
2. W3C Understanding pages explain intent, benefits, examples, and exceptions. They are informative rather than the normative standard.
3. W3C tutorials and techniques provide guidance and possible implementations; a technique is not the only way to conform.
4. Apple and Android documentation is platform guidance in platform-specific units. It is not a WCAG threshold.
5. Law, regulation, contract, and procurement requirements require their own current jurisdictional analysis.

Always identify which class supports the claim.

## Maintained working set

### Text contrast

- WCAG 2.2 SC 1.4.3, Contrast (Minimum), Level AA: at least 4.5:1 for normal text and 3:1 for large-scale text, subject to the criterion's incidental, logotype, and inactive-component exceptions.
- Large-scale text has the definition and unit conditions in WCAG; do not restate it imprecisely from memory when it determines a result.
- Primary source: [WCAG 2.2 SC 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum).

### Non-text contrast

- WCAG 2.2 SC 1.4.11, Non-text Contrast, Level AA: 3:1 against adjacent colours for visual information required to identify applicable user-interface components and states, and for parts of graphics required to understand content, subject to the criterion's exceptions.
- This does not mean every graphic or every pixel boundary needs 3:1.
- Primary source: [WCAG 2.2 SC 1.4.11](https://www.w3.org/TR/WCAG22/#non-text-contrast).

### Pointer target size

- WCAG 2.2 SC 2.5.8, Target Size (Minimum), Level AA: at least 24 by 24 CSS pixels, or sufficient spacing under the criterion, with exceptions for spacing, equivalent controls, inline targets, user-agent-controlled sizing, and essential presentation.
- WCAG 2.2 SC 2.5.5, Target Size (Enhanced), Level AAA: at least 44 by 44 CSS pixels, with its stated exceptions.
- Sources: [Understanding SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [WCAG 2.2 SC 2.5.5](https://www.w3.org/TR/WCAG22/#target-size-enhanced).
- Do not call 44 by 44 an across-the-board WCAG AA threshold.

### Platform target guidance

- Apple uses points, not CSS pixels. Current Apple accessibility guidance gives platform- and control-dependent target recommendations; iOS and iPadOS commonly use a 44 by 44 point default control target, while other Apple platforms differ. Verify the current table rather than extracting one universal Apple number.
- Android recommends touch targets of at least 48 by 48 `dp`, with context such as precise-pointer use considered by its guidance.
- Sources: [Apple accessibility guidance](https://developer.apple.com/design/human-interface-guidelines/accessibility), [Android app accessibility guidance](https://developer.android.com/guide/topics/ui/accessibility/apps.html).

### Headings and structure

- WCAG 2.2 SC 2.4.6, Headings and Labels, Level AA requires headings and labels to describe topic or purpose.
- WCAG 2.2 SC 1.3.1, Info and Relationships, Level A requires relationships conveyed through presentation to be programmatically determined or available in text.
- W3C's headings tutorial recommends logical organization and explains that skipping ranks can be confusing. That tutorial does not create a blanket normative rule requiring exactly one `h1`.
- Sources: [Understanding SC 2.4.6](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html), [W3C headings tutorial](https://www.w3.org/WAI/tutorials/page-structure/headings/).

### Keyboard and focus

- Check the exact applicable criteria rather than saying only "keyboard accessible": Keyboard (SC 2.1.1), No Keyboard Trap (SC 2.1.2), Focus Order (SC 2.4.3), Focus Visible (SC 2.4.7), Focus Not Obscured (Minimum) (SC 2.4.11), and any relevant AAA criterion.
- A screenshot cannot establish any of these behavioural conditions.
- Primary source: [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

### Dragging, colour, motion, forms, and alternatives

- Dragging Movements (SC 2.5.7, AA) requires a non-dragging pointer alternative unless dragging is essential or controlled by the user agent.
- Use of Color (SC 1.4.1, A) prohibits colour as the only visual means for the named information and distinctions.
- Animation from Interactions (SC 2.3.3) is AAA; pause/stop/hide and three-flashes criteria have distinct scopes. Do not collapse them into a generic motion rule.
- Form requirements depend on applicable criteria including Info and Relationships, Labels or Instructions, Error Identification, Error Suggestion, and Error Prevention. A preferred inline-error pattern is not itself the normative requirement.
- Alternative text depends on the purpose and type of non-text content under SC 1.1.1; do not require descriptive alt text for every image.

## Judgment boundary

Passing these lookups does not establish complete accessibility. A credible audit needs defined pages and states, representative content and technologies, DOM/semantics inspection, keyboard operation, focus behaviour, responsive and zoom behaviour, relevant assistive-technology checks, documented methodology, findings, and revision identity. Legal compliance needs an additional applicable-law analysis.
