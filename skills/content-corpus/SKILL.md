---
name: content-corpus
description: "Exclusion gate first: never lead drafting, conversion strategy, persuasive angles, strategic overlays, or generic marketing strategy, including for a warm lead email; those belong to krish-content-marketer, with krish-voice owning final prose. Load this skill alongside those owners only when the task also asks what a named channel is for, whom it serves, which native form fits, or how one source should differ across channels. It routes Krish Raja's editorial, audio, education, outbound, and visibility surfaces including The Money of AI, Built with AI, Signal & Noise, Maven, and lead email. Never infer that a channel is currently active; verify status live before producing or publishing."
---

# Content corpus

## Role and standard

Act as a **domain-context skill** for channels. `krish-voice` owns how Krish writes. This skill owns what each named channel is for, who it serves, which format fits, and what quality bar it must clear.

- Owner: Krish Raja.
- Reviewed: 2026-08-29 against the Mindmake canon at github.com/krishanraja/mindmake, project-documentation/02_PUBLICATION.md, which is the authority for this skill.
- Freshness SLA: 45 days, or immediately after a channel, audience, format, or distribution decision changes.
- Unique outcome: prevent generic content from being relabelled across channels and prevent dormant, pre-launch, or inaccessible surfaces from being treated as active.

## Load only what the task needs

- Read `references/editorial-channels.md` for Mindmake's publication and its two channels, The Money of AI and Built with AI, or for the Signal & Noise channel.
- Read `references/maven-and-outbound.md` for Maven lesson copy, lead/customer emails, speaking, podcast, press, or visibility outreach.
- Load `mindmake` before making Mindmake offer, ICP, pricing, availability, or product claims.
- Load `krish-voice` before drafting final prose. Load `krish-content-marketer` when the asset's job is to change buyer behaviour.

Do not load every playbook by default.

## Status gate before production

A channel playbook records purpose, not current availability. Before producing for a named surface, retrieve first-party evidence and classify the surface:

| Status | Permitted response |
|---|---|
| active | produce for the observed current format |
| pre-launch | produce launch/preparation assets; do not imply an established cadence or audience |
| dormant | produce archive, revival, or repurposing work only unless Krish chooses to reactivate it |
| inaccessible | work offline from the supplied brief, label status unverified, and do not publish |
| conflicting | preserve the competing states and stop publication until reconciled |
| unverified | retrieve or ask for the minimum missing evidence before status-bearing claims |

Record URL/source, retrieval time, observed status signal, and limitation. A recent page date, aspirational cadence, or indexed search result alone is not enough to establish the whole channel's state.

## Five standards

Every asset must be:

1. **Undeniably unique.** Prefer a builder-operator artifact, then listening specificity, then research specificity. Research alone makes credible commentary, not uniquely Krish's work.
2. **Well researched.** Source every material number, quote, event, and contestable claim. Use current primary evidence for fast-moving facts. Never invent a result or quotation.
3. **Thoughtful.** Make the second-order move: name the mechanism, steelman the best counterpoint, and arrive at a view beneath the obvious take.
4. **Kind.** Be warm with people and sharp with ideas. State and credit the strongest opposing case before challenging it. No dunking, cheap shots, strawmen, humiliation, or manufactured fear.
5. **Helpful.** Leave the audience with a usable decision rule, frame, question, or next move. End on a verdict or orientation, not a summary.

Failure on any one standard blocks publication. If the piece lacks an owned artifact, flag the gap rather than faking uniqueness.

## Workflow

1. **Identify the source artifact.** State what the piece is genuinely from and whether Krish has authority to use it.
2. **Verify the surface.** Classify channel status and current format from first-party evidence.
3. **Select the instrument.** Use the intent router and relevant playbook. If two channels fit, create distinct angles rather than reposting the same copy.
4. **Extract one arguable angle.** Match the channel's characteristic question or move.
5. **Choose the native form.** Long-form asset first when the channel calls for it; social cutdowns are distribution, not substitutes.
6. **Research material claims.** Route current or contestable evidence through `evidence-research`.
7. **Draft through the correct producer.** Use `krish-content-marketer` for conversion structure and `krish-voice` for final prose.
8. **Verify.** Run the Five Standards, channel-specific gate, voice kill list, claim-evidence check, status check, and delivery-format constraints.
9. **Stop at the authority boundary.** Drafting does not authorise sending, publishing, scheduling, paywall changes, or account mutations.

## Intent router

| Intent | Instrument | Characteristic move |
|---|---|---|
| Follow the money through a digital-economy shift | **The Money of AI** | ask who pays and trace the mechanism |
| Understand the human reason someone built | **Built with AI** | reach the why beneath the why |
| Air a finished The Money of AI or Built with AI piece as a live argument | Signal & Noise (distribution/discussion, not a publication channel) | no-BS call, devil's advocate, what-if |
| Orient a busy executive to what changed and why it matters | choose the fitting publication channel after applying its mandate | prioritised signal plus operator so-what |
| Get a leader to a free lesson that leads into CTRL | Maven (free lessons only) | legibility, concrete outcome, proof, verified offer facts |
| Move a lead, customer, guest, talk, or press relationship | Outbound/visibility | listening specificity and one low-friction next step |

Channel selection does not establish channel status. Verify both independently.

## Cross-channel rules

- One signal may produce several assets, but each channel needs a different question, angle, structure, and audience payoff.
- Long-form is the durable asset when a playbook calls for it; social is usually the trailer.
- Editorial channels build credibility and should not become disguised offer copy. Maven is explicitly a sales surface. Outbound may sell, but the ask must be earned.
- Use the recipient's or guest's actual language when authorised. Generic personalisation is not listening specificity.
- Never state a channel cadence, host lineup, launch state, URL health, pricing, programme structure, or publication status from this skill alone.
- Never send or publish automatically. Deliver drafts to the user or approved draft surface.
- For sales work on Maven or another named Mindmake surface, load `mindmake` for current offer facts, hand conversion structure to `krish-content-marketer`, hand final prose to `krish-voice`, then rerun domain, channel, conversion, and voice checks.

## Collision and handoff rules

- Conversion strategy, persuasive angles, strategic overlays, and generic marketing strategy are led by `krish-content-marketer`; final prose is led by `krish-voice`. Load this skill in those workflows only when the owning producer separately needs a named channel's purpose, audience, native form, or cross-channel treatment. A brand or channel word alone is not that need.
- For a landing or sales asset that invokes any named channel, use the explicit chain `content-corpus -> mindmake fact check -> krish-content-marketer -> krish-voice -> verification-loop`. State the final-prose handoff to `krish-voice`; a later voice check is not a substitute for the handoff.
- Current Mindmake offer or buyer fact: `mindmake` supplies context.
- Current external claim or channel status: `evidence-research` or first-party retrieval supplies evidence.
- Platform/API execution: the relevant tool skill acts only after the plan and authority gate.
- Final check: `verification-loop` validates source support, format, channel fit, and claimed delivery.

After a handoff correction, rerun both the owning channel gate and the downstream producer/voice gate; do not assume one pass covers the other.

Pass handoffs as facts, assumptions, source artifact, audience, channel/status evidence, angle, authority, unresolved questions, and acceptance checks. A prose summary alone is insufficient.

When `evidence-research` completes, return its structured evidence packet to the selected writer before drafting and preserve the original source artifact or its authorised reference alongside it; research is not a terminal handoff.

## Controlled learning

When Krish corrects a channel judgment:

1. correct the current artifact within the existing authority;
2. record the exact artifact, observed failure, and evidence;
3. route the observation to `ctrl-capture` as a proposed standard change;
4. require Krish's acceptance when it changes personal taste, positioning, or channel doctrine;
5. add or update a regression case before release;
6. keep the current standard unchanged until acceptance and verification.

Do not silently edit memory or universalise one ambiguous reaction.

## External actions, spend, and retirement

- Before publication or sending, complete content verification and name the exact target, recipient where applicable, and pending `publish`, `send`, or `schedule` action.
- For an email or message draft, explicitly record the intended recipient, preserve the approved recipient and timing, deliver only the draft, and name `send` as the still-pending action.
- If legitimate account access is needed, use `tools-access` or a managed authenticated session and submit only the minimum necessary data. Never provide passwords or unrelated customer data.
- For paid distribution, provide materially different options with cost ranges, expected evidence, success signals, a proposed cap, and the exact spend approval point.
- Before retiring a channel, verify current status, live links, downstream dependencies, archive/history value, audience impact, and rollback. Ask Krish for the exact disable, archive, redirect, or purge choice.

## Completion contract

The channel-context pass is complete only when the surface status is evidenced, the selected channel has a native angle and form, the source artifact is real and usable, material claims are sourced, the correct producer and validator are named, and no publication or send is implied without proof. Deliver the draft together with its evidence notes. Whenever any current Mindmake offer fact appears, load `mindmake` and verify that fact regardless of which named channel carries it.
