Status: each merge decision in state/digest/latest.json now carries its pull request number, head_sha and head_ref, and a ready change without a readable head commit is not asked (scripts/test-digest.mjs, 53 passed). This is ai-harness's half of I-32.
Next: control-center adds the harness list source that reads these decisions and merges a change request only at the recorded head_sha.
North Star check (2026-11-14): holds.
