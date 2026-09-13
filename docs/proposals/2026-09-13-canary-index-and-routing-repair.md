# Canary index and routing repair

Status: approved correction, awaiting immutable release and live evidence.

## Observed evidence

The LORIMER rollout of `v2026.09.13.2` installed all three local surfaces with
exact artifact parity, then correctly stopped as `blocked`. Both live clients
were given canaries for a skill named `core`, although no such invocable skill
exists. `evals/core-trigger-cases.jsonl` is a storage bundle containing cases
for `krish-principles`, `strategy-brief`, and `verification-loop`; the selector
had inferred the filename as the skill instead of indexing each record's
declared owner.

The same run also produced majority evidence for two real Codex routing misses:

- the archived workflow-ID/liveness case invoked `n8n-operator` in two of three
  fresh sessions instead of remaining with `mindmake-os`;
- the adversarial visual-design case reached `krish-design` in only one of
  three fresh sessions.

Evidence is retained in `state/machine-runs/v2026.09.13.2-lorimer.json` and the
two matching files under `state/canaries/`.

## Correction

1. Build the canary skill catalogue from every case record's declared `skill`,
   falling back to the filename only for conventional single-skill files.
2. Refuse malformed JSON and invalid explicit skill fields instead of silently
   dropping them.
3. Add a regression that forbids a fictional `core` skill and requires positive
   canaries for all three real core skills.
4. Front-load the n8n archived-liveness exclusion and the visual-design
   ownership gate in the descriptions the clients use for discovery.

## Acceptance

- Full harness validation and repeat-build pass.
- The generated sheet contains no `core` skill and contains positive cases for
  `krish-principles`, `strategy-brief`, and `verification-loop`.
- A new immutable release installs with exact parity.
- Fresh Claude and Codex reports carry no failed canary verdict. Unsupported
  external routes and Cursor's UI-only invocation remain explicit `partial` or
  `manual-required`, never fabricated passes.

User authority: Krish approved closing all audited gaps and the sharper,
less-fragile correction path on 2026-09-13.
