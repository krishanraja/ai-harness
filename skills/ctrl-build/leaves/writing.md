# Writing the package

## Description: route before execution

The description is the always-visible routing surface. Make it concise but comprehensive enough to select the skill without opening the body.

Include:

1. what the skill does in task language;
2. several authorised real-world phrasings, including casual/partial requests;
3. adjacent contexts that should route elsewhere;
4. adversarial guard situations that should trigger the skill to refuse or preserve a boundary;
5. the review date when the local governance convention requires it.

Use third-person declarative wording when the target router expects metadata, but validate the actual current target contract rather than hardcoding one character limit across clients. Do not copy a generic description across overlapping skills, and do not make every skill pushy. Both over-triggering and under-triggering are defects.

Test the description against the currently loaded catalog, not in isolation. The private routing suite must meet the active quality standard, currently at least 8 positive, 8 negative, and 5 adversarial-collision cases, then pass as a complete regression after corrections.

## Body: operational and economical

Write instructions in imperative form. Assume the model is capable; include only task-specific knowledge, fragile sequences, evidence-backed judgment, and necessary safeguards.

- Do not restate the description in the body.
- Give each subject-specific directive a valid `[C…]` or `[E…]` pointer and retain its situation.
- Give substantive directives their evidence-backed reason when the reason affects judgment or extension to edge cases.
- Label generic safety, packaging, and platform mechanics as governance rather than pretending the subject said them.
- Use `NOT ESTABLISHED: <gap>` or omit the claim when no allowed pointer exists; record the gap in the build manifest.
- Preserve AWAITING, untested, deleted, contradictory, and withdrawn exclusions.
- Use direct reference links with when-to-read guidance and no required multi-hop chain.
- Match freedom to fragility: narrative guidance for judgment; schemas/checklists for repeatable work; tested scripts for error-prone mechanics.

Choose sections because the task needs them, not because a template listed them. Common useful sections are workflow, decision rules, surface routing, gotchas, output contract, verification, learning handoff, and references.

## Situated rules and fallback

Write the complete situation into the directive:

> For weekly progress updates on this engagement, lead with the decision [E12].

Do not write:

> Never produce a deck.

For every situated directive, write its adjacent else branch. For an uncovered surface or situation, route to a relevant accepted core criterion if it truly applies. Otherwise state `NOT ESTABLISHED`, ask the owner a bounded question, or send new standards evidence through `ctrl-intake`/`ctrl-compile`. Never choose the closest rule merely to avoid an empty result.

## Voice and exemplars

Use a real excerpt only when authorship, situation, purpose, audience, retention, and runtime inclusion are authorised. Reproduce it exactly or use an explicitly approved redacted derivative; never silently polish it or fabricate a quote.

Do not confuse known authorship with universal preference. A sample shows what the subject produced in that context. The compiled voice criterion determines whether and where it governs.

Keep sealed holdout items, rejected/accepted answer keys, judge rubrics, and private raw artifacts out of runtime. User-facing documentation may contain only non-secret smoke prompts without answer keys, held-out ids, judge rubrics, or private fixtures. Synthetic fixtures may test mechanics only and must not be attributed to the subject.

## Gotchas and output contracts

A gotcha needs witnessed or accepted evidence. Name the recognizable failure, its consequence, the correction, situation, and pointer. Do not add generic AI-writing dislikes unless the compiled subject standard or an explicitly separate organizational policy establishes them.

Output format should be only as rigid as the evidence requires. Preserve fixed schemas exactly when downstream systems depend on them; use higher freedom when judgment and surface context matter.

## Learning handoff

Runtime feedback is evidence, not an automatic rule change. Record kept/edited/rejected outcomes only within authorised logging scope, with artifact/criterion/version ids and privacy limits. Recurring verified corrections go to `ctrl-capture`; an accepted change then returns through Compile, Build, independent evaluation, and controlled release. The package never edits itself.

## Private evaluation design

Keep evaluation beside, not inside, runtime. Use the active harness standard, currently at least:

- routing: 8 positive, 8 negative, 5 adversarial-collision;
- behavior: 6 nominal, 8 failure/edge, 5 authority/security, 4 handoff/collision.

Cases should be realistic, messy, disjoint from source examples where possible, and cover neighboring skill collisions. The executor receives the skill and blind scenarios, never expected answers. A fresh judge receives the expectations and executor output. Hard authority/security failures cannot be averaged away.

After a failure, record the before result, smallest contract correction, focused rerun, and complete regression. A package passes only when every case and required validator passes on the frozen candidate bytes.

## Final personalization check

Ask whether the package's subject-specific behavior could have been produced by swapping in another person's name. If yes, either the compiled evidence is too thin or the build discarded its useful distinctions. Do not fix this by adding personal data or invented quirks; return the exact evidence gap.
