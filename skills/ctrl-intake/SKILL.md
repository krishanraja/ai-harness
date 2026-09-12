---
name: ctrl-intake
description: "Elicit a named person's reusable taste or quality standard from their grading of real artifacts. Use for triadic or repertory-grid intake, approved-versus-rejected comparison, transcript-to-candidate extraction, voice-standard intake from their own corpus, or repairing unsupported inferred profiles. Refuse shortcuts that infer durable rules without grading, misuse private sources, contaminate holdouts, or supply desired constructs. Do not use for one-task briefing, compilation, packaging, review, or ledger updates. Last reviewed 2026-08-05."
---

# CTRL Intake

Stages 1 and 2 of the standards chain: INGEST and SORT. Produce evidence and graded distinctions, never the profile, rubric, or standing rules.

The subject must make every judgment. An AI may facilitate neutral questions one at a time, randomise items, record exact words, validate schemas, and preserve gaps. It may not answer for the subject, name the dimension in advance, infer personality, or convert ungraded material into their standard.

## Intake contract

Before reading source material, persist:

```text
INTAKE
SUBJECT + OWNER: [whose judgment, and who can approve its standard]
PURPOSE + SURFACES: [reusable work types this may govern]
AUTHORISED SOURCES: [exact files/folders/date range and authorship class]
PROCESSING CONSENT: [what may be derived and retained]
AUDIENCE: [who may see raw and derived outputs]
PRIVACY: [redaction/pseudonymisation and third-party exclusions]
RETENTION / WITHDRAWAL: [duration and derivative handling]
METHOD: [live / self-serve sort / transcript candidates / thin comparison]
CORPUS SPLIT: [training/elicitation versus untouched holdout]
STATUS: [draft / provisional / ready for compile]
```

Subject consent to take part is not consent to publish, share broadly, train unrelated systems, or profile other speakers. A manager may supply authorised role/task requirements, clearly labelled as the manager's requirements; those are not the employee's personal judgment.

## Route to the right method

| Situation | Read |
|---|---|
| Subject can grade real work in a facilitated session | `leaves/live-session.md` |
| Subject needs a self-serve or asynchronous instrument | `leaves/sort.md` |
| Transcripts, recordings, emails, or writing exist before grading | `leaves/transcripts.md` |
| A body of the subject's own writing must become a voice standard | `leaves/voice.md` |

Usually extract candidates from authorised transcripts first, then validate them through a live session or sort. Transcript candidates never become rules by themselves.

The voice route is a corpus-to-shapes extraction that still ends in grading. Before starting it, load both `leaves/voice.md` and `leaves/transcripts.md`; never substitute corpus extraction for a sort.

## Evidence invariants

1. **Grading establishes distinctions.** Statements, writing, and behavior produce candidates or exemplars. A reusable criterion needs the subject to distinguish work on that dimension.
2. **Never supply the construct.** Ask which items group together and why. If the facilitator names `clarity`, the response is anchored to the facilitator's judgment.
3. **Situation is part of the evidence.** Preserve source, date, speaker/authorship, verbatim span, situation, sensitivity, and allowed audience.
4. **Contradictions remain.** Never choose, average, or silently reconcile them before grading.
5. **AWAITING is a result.** State what is not established and the observation that would fill it.
6. **Holdout stays untouched.** Select it before analysis, keep whole matched pairs together, and never use it to write candidates, criteria, or examples.
7. **Unknown authorship stays unknown.** Distinguish `produced by subject`, `signed off by subject`, `received`, and `uncertain`. Only known-own text can evidence their writing mechanics.
8. **Skips are missing data.** Honour skip/withdrawal, exclude it from scoring, and never infer rejection.

## Corpus and holdout viability

Do not use a fixed holdout count that consumes the corpus.

- For a full measured engagement, collect enough work to leave roughly 10 to 14 varied items for elicitation/training and a separate 6 to 10 item holdout, keeping matched pairs intact.
- With 10 to 14 total items, reserve a smaller untouched subset that leaves viable elicitation material and mark the downstream baseline limited.
- With four items, run a thin comparison or collect more. Do not claim a measured baseline, and output an explicit `AWAITING` list naming every construct, contrast, surface, provenance, or holdout gap still needed.
- If no honest untouched set exists, set `holdout_status: none` and `STATUS: provisional`. Never train and test on the same work.

## Workflow

1. Confirm the intake contract and authorised storage before source access.
2. Inventory artifacts with stable ids, provenance, authorship class, situation, sensitivity, and eligibility for grading/holdout.
3. Create the corpus split before reading content deeply. Record the randomisation or selection method.
4. Extract transcript candidates only when applicable; retain quotes and leave contrast poles empty.
5. Run neutral triads, matched-pair sorts, or a thin comparison. Ask one question, wait, and preserve exact wording.
6. For each distinction, ask for the subject's contrast pole, why it matters, and what someone could point at in work to see it present or absent. Keep rationale separate from observable.
7. Use manipulation checks to detect confounded pairs. If two of three fail, stop the compile handoff, preserve responses, redesign affected pairs, and rerun.
8. Validate schemas, unique ids, source links, holdout isolation, consent scope, AWAITING fields, contradictions, and withdrawal state.
9. Freeze the raw intake version and hand a manifest to `ctrl-compile`.

## Privacy and edge cases

- Confidential or third-party content: exclude it or create an authorised redacted derivative. Keep source access separate from derived outputs and record audience, retention, and deletion boundary.
- Multi-speaker recording: name the subject, separate speakers, exclude uninvolved data, and store only necessary extracts.
- Source withdrawal: identify derived rows and holdout effects, remove or quarantine through the agreed exact path, preserve an audit event, and downgrade evidence status.
- Downstream sharing: name exact recipient/audience and fields; pseudonymise or redact nonessential data; require sharing approval.
- Case-study/publication request: treat it as a separate purpose and action. Prepare a deidentified aggregate with reidentification risk, then require subject and publication approval.
- Confounded item pair: discard its inference, not the participant response. Preserve the evidence and rebuild the instrument.

## Outputs and handoff

Write only inside the authorised subject folder:

```text
<subject>/
  intake-manifest.json
  evidence.jsonl
  constructs.md
  grades.jsonl
  session-notes.md
```

The manifest records schemas/versions, subject/owner, purpose/surfaces, authorised-source classes, privacy/retention, item ids, split and holdout status, manipulation-check result, contradictions, AWAITING fields, withdrawn/quarantined ids, and exact files/hashes handed to compile.

Preserve raw evidence immutably as a versioned input; corrections create a new version or audit event rather than rewriting history. Do not write a summary or profile in this stage.

## Chain boundaries

- One task's real goal, why, constraints, success, and handoff interview: `take-the-brief`; do not create a durable person profile.
- Completed intake to tested criteria/profile: `ctrl-compile`; keep holdout isolated.
- Existing ledger or repeated gate evidence proposing a change: `ctrl-capture`; use fresh intake only when new elicitation is approved and genuinely required.
- Known-authorship voice mechanics: load both voice-route leaves, then hand a bounded derived packet to the exact named voice owner only with authorised purpose/audience. Use `krish-voice` when Krish is the subject; otherwise name the client or subject's designated voice owner. Candidate judgment rules still require grading, and final prose verification may use only graded evidence within the packet's stated surface.

Completion means the evidence packet is authorised, provenance-complete, schema-valid, honestly limited, holdout-safe, and ready for `ctrl-compile`. It does not mean the person's standard has already been inferred.
