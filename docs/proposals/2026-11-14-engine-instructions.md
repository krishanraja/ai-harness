# Proposal: every session reads its engine's open instruction first

Status: Proposed, for Krish (2026-11-14)
Source: fleet integration plan I-13, "His instruction reaches the session that does the work".

## The change

One sentence in the canon block's North Star paragraph:

> Where the Control Center connector offers it, read your repository's open instruction first with `get_engine_instruction`, and answer it with `ack_engine_instruction`; never print, log or commit his words. `registered: false` means the repository is no engine; a failed read means do not act from memory.

## Why

Krish instructs each growth engine with his next best action from Control Center (Ruling, Krish, 2026-11-11: Krish instructs each engine with his next best action, which starts it). Until now the instruction reached the engine's scheduled run through its directive, but a session working in the engine's repository never read it, so the session doing the work could act against the latest instruction without knowing it existed.

Control Center's connector added two tools for this (control-center pull request 808):

- `get_engine_instruction({ repository })` returns whether the repository is a registered engine, whether it is held, and the open instruction with its id, words, date, what it supersedes and its acknowledgement.
- `ack_engine_instruction({ instruction_id, state, line, evidence_url? })` records received, started, blocked or done, forward only, on Krish's own account connections only.

## Walls

The tools read and acknowledge only; an instruction is never an approval, and his words are never printed, logged or committed. Repositories that are not engines get `registered: false` and change nothing.
