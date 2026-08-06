# Voice from a corpus

STATUS: provisional. Written from the chain's existing doctrine, not yet run against a real client corpus. See AWAITING at the end before treating any of this as settled.

What to do when someone hands you a body of their own writing and wants a voice skill out of it.

Load `leaves/transcripts.md` with this file before processing a corpus. Preserve the intake contract's consent, audience, retention, and withdrawal boundaries in every derived packet.

## The one thing to understand before you start

**A corpus is a record of what survived. The kill list is what did not.**

Everything a writer cuts, rejects, or would never send is absent from their published work by definition. Absence in a corpus is indistinguishable from never having had the occasion, so no amount of reading their good writing produces the constraint that matters most.

This is why corpus-only voice extraction produces skills that sound approximately right and fail on the specific tells the person cannot stand. The shapes come from the corpus. The kill list comes from grading, and there is no substitute.

Run both. The corpus is the pair generator, not the standard.

## Establish authorship before reading anything

Client corpora are contaminated by default and the contamination is invisible in the text.

Sort every source into the intake authorship classes and ask directly, once, per surface:

> Which of these did you write start to finish, with nobody else touching it?

- **Produced by subject.** The only class that evidences writing mechanics.
- **Signed off by subject.** Ghostwritten, agency-drafted, or editor-rewritten. This is what most executive LinkedIn and bylined content actually is. It evidences what they accept, which is a judgment signal, not a voice signal. Route it to grading, never to shape extraction.
- **Received / uncertain.** Excluded.

If the produced-by-subject set is thin, say so and work from it anyway. A small honest corpus beats a large contaminated one, and a voice built on their ghostwriter's habits is worse than no voice skill.

## Scope by surface before extracting

Their email voice, their post voice and their stage voice are different registers. A single extraction across all of them averages into a voice nobody has.

Split the corpus by surface first. Extract per surface. Note where a shape holds across all of them, because that is the signature and the rest is register.

Date-weight within each surface. Voice moves, and a five-year span is not one voice. Where old and recent diverge on the same shape, preserve both and flag it rather than picking the more frequent one.

## What to extract from the corpus

Per the pasted-writing rule in `leaves/transcripts.md`: sentence shapes with real examples, verbatim sentences worth keeping, the words they actually use, the constructions that never appear.

Concretely, take:

- **Sentence and paragraph shapes.** Actual openers, closers, transitions, how they enter and leave an argument. Quote them.
- **Lexicon.** Words that recur and are not genre-standard. Words available to them that they never use.
- **Structural habits.** How they handle evidence, qualification, concession, the shape of their first line and last line.
- **Exemplar passages.** Whole spans, unedited, that a writer could pattern-match against.

Do not take adjectives. Do not build a dimension table of enums. A voice standard is exemplars, shapes and a kill list, and the moment it becomes a set of labels it has stopped describing anyone in particular.

**Never fabricate a sample.** If a shape has no real example, describe it in prose and include no quoted example.

## Separate signature from genre

The most frequent construction in someone's writing is usually the genre, not the person. Everyone writing that surface writes it that way.

You cannot see this from their corpus alone, which is why peer material is not optional. Pull real writing by a peer on the same surface and compare frequencies. A shape common in them and common in peers is genre. A shape common in them and rare in peers is signature, and the signature is the whole point.

Without peer comparison the extraction is a self-reaction and you cannot tell a standard from a style.

## Generate the pairs from the extraction

The corpus feeds the sort. For each candidate shape, write two versions of the same passage, matched on subject, length and register, differing on that one shape. One carries it, one does not.

Same rules as the standard sort: shown separately, at least four positions apart, never side by side. Manipulation-check three of them, and stop if two of three come back wrong.

This is what makes voice grading cheap. You are not writing pairs from imagination, you are testing shapes you already found.

## The kill list comes from the rejected line

Grade with the standard question. The verdict is nearly worthless here and the one line is everything:

> Would you send this?
> **Send** / **Would not send** / *(skip)*
> One line: what makes it that?

The kill list is assembled from the lines attached to **would not send**, and only from those. A rejection without a line is a data point you cannot use for voice.

Push once for specificity when a line is a label. "Too corporate" is not a kill rule. Ask what in the passage made it that, and quote back the span they point at.

## If they will not sit for a full sort

Use the two-minute move. Four of their own past documents, which two would you send today, and why not the others.

The why-not is the entire yield. Two rejection lines from their own work outperform a long corpus pass, because those two lines are the only thing in the whole exercise that could not have been derived from the text.

Mark the result thin. It is thin and it is real.

## Output: the voice packet

Hand a bounded derived packet to the voice owner, with authorised purpose and audience, containing:

```text
VOICE PACKET
SUBJECT + SURFACES: [per-surface scope]
AUTHORITY + WITHDRAWAL: [purpose, audience, retention, revocation, and derivative handling]
AUTHORSHIP BASIS: [produced-by-subject ids only, with dates]
PEER BASELINE: [ids used for genre separation]
SHAPES: [each with verbatim example and surface scope]
LEXICON: [recurring terms; conspicuous absences]
EXEMPLARS: [whole approved spans, unedited]
KILL LIST: [each entry linked to the rejection line that produced it]
SIGNATURE VS GENRE: [which shapes survived peer comparison]
CONTRADICTIONS: [preserved, unresolved]
AWAITING: [what is not established and what would fill it]
```

Candidate judgment rules still require grading. Shapes alone do not authorise a rule about when the voice applies, and known authorship proves only what they produced in that situation, not a current or universal preference.

Nothing in the packet may contain "always", "never", "must" or "forbidden" outside a quoted span or a graded kill-list entry.

After the packet is graded and provenance-complete, hand final drafting to the exact named voice owner. Use `krish-voice` only when Krish is the subject; otherwise identify the client's or subject's designated voice owner. Keep `ctrl-intake` out of final drafting, and verify final prose only against graded exemplars and kill-list evidence within the packet's declared surface. Ungraded shapes remain candidates and cannot become pass/fail rules.

## AWAITING for this leaf

To be resolved by the first real client run, not by further design:

- Whether per-surface extraction is worth its cost on a corpus under roughly twenty pieces, or whether a single-surface scope is the honest default.
- How many pairs a voice sort actually needs before the kill list stops growing. The 30-item instrument is calibrated for judgment standards, not voice, and is probably heavier than this job requires.
- Whether peer baseline can be assembled fast enough to be routine, or whether it becomes the step that kills the engagement.
- Whether the rejection lines cluster into a usable kill list, or arrive too situated to generalise across a surface.
- What had to be written by hand after the packet was delivered. That gap is the next revision of this file.
