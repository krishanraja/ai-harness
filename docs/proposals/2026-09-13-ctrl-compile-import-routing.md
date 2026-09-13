# CTRL compile import routing

Status: approved corrective change after `v2026.09.13.7` live evidence.

## Evidence

Claude Code routed both selected CTRL compile positives correctly. Codex routed
the broader compile positive correctly but sent all three fresh attempts for
"generate the machine-readable CTRL import from the compiled human-readable
standard" to `ctrl-build` instead. The canonical chain assigns deterministic
import generation to Compile and platform packaging of that completed import to
Build.

The same run also recorded a correct `decision-ledger` exclusion-guard read plus
the expected `mindmake-os` owner, then failed it because the verifier searched
the human-readable note for the target name despite the structured
`target_guard_read: true` field.

## Correction

- Put machine-readable import generation first in `ctrl-compile` discovery
  metadata and contrast it directly with downstream packaging in `ctrl-build`.
- Repeat that boundary in the skill's opening paragraph.
- Make the verifier honour structured guard-only evidence before interpreting a
  target name in a note.
- Add a regression proving that guard-only target reads plus the expected owner
  pass, while actual target activation still fails.

User authority: Krish approved closing observed gaps and merging the result to
main on 2026-09-13.
