# Proposal: every session reads its engine's open instruction first

Status: approved by Krish on 2026-11-14 in two steps.
- The change itself is decision 4.3 of the 14 Nov decision list (control-center `docs/audits/2026-11-14-fleet-integration/DECISIONS-BATCHED.md`, "merge #240"), which he approved with everything before Batch 6 (his words: "I agree with everything else until Batch 6"), recorded word for word in control-center `docs/audits/2026-11-14-fleet-integration/KRISH-ANSWERS.md` at control-center commit `38aa01edb670aa599b666f0515c4116c97838c3b`.
- The approval-wall exemption below is his answer, typed on 2026-11-14 in the fleet-integration session (claude.ai/code), to the question whether `ack_engine_instruction` is exempt from the approval wall like a taste report (his answer: "Yes, exempt it (Recommended)"). It is recorded as `Ruling (Krish, 2026-11-14)` in this pull request's commits and in control-center `docs/audits/2026-11-14-fleet-integration/CLOSEOUT.md`.
Source: fleet integration plan I-13, "His instruction reaches the session that does the work".

## The change

One sentence in the canon block's North Star paragraph, as it landed:

> Where the Control Center connector offers it, read your repository's open instruction first with `get_engine_instruction`, and answer it with `ack_engine_instruction`, which records only that instruction's state in Control Center and so, like a taste report, is exempt from the approval wall and is never a send, post or publish to anyone (Ruling, Krish, 2026-11-14); never print, log or commit his words. `registered: false` means the repository is no engine; a failed read means do not act from memory.

And one sentence in the operating contract's authority section, beside the send wall:

> An engine's `ack_engine_instruction` is not one of these: it records only the state of Krish's own instruction in Control Center (received, started, blocked or done), reaches no one, and needs no approval (Ruling, Krish, 2026-11-14).

The first draft of this proposal stopped at "never print, log or commit his words". The exemption was added after Krish answered the question above, so the text that landed is the text he approved.

## Why

Krish instructs each growth engine with his next best action from Control Center (Ruling, Krish, 2026-11-11: Krish instructs each engine with his next best action, which starts it). Until now the instruction reached the engine's scheduled run through its directive, but a session working in the engine's repository never read it, so the session doing the work could act against the latest instruction without knowing it existed.

Control Center's connector added two tools for this (control-center pull request 808):

- `get_engine_instruction({ repository })` returns whether the repository is a registered engine, whether it is held, and the open instruction with its id, words, date, what it supersedes and its acknowledgement.
- `ack_engine_instruction({ instruction_id, state, line, evidence_url? })` records received, started, blocked or done, forward only, on Krish's own account connections only.

## Walls

The tools read and acknowledge only. An instruction is never an approval: walled work it asks for still comes back as a proposal behind its wall. The acknowledgement writes one state row to Krish's own instruction in Control Center, on his own account connections, and reaches no person, channel or account, which is why he ruled it outside the approval wall, as the taste report already is (Ruling, Krish, 2026-10-26). The send, post, publish, spend, delete, rotate and permission walls are unchanged, and no other tool joins the exemption. His words are never printed, logged or committed. Repositories that are not engines get `registered: false` and change nothing.
