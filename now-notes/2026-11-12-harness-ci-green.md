Status: The surfaces and verify checks are green again. brain/rules.yaml records the krish-voice reference routing line #214 added, citing that commit's own 11 Nov rulings, and the knowledge history validator reads brain/knowledge.jsonl (now past 1 MiB) with a bounded 64 MiB buffer instead of dying with ENOBUFS.
Next: A pull request that edits a skill chapter runs `node scripts/brain-rules.mjs --revise --kind ruling --ref <commit>` in the same change, so the provenance check never has to catch it after merge.
North Star check (2026-11-12): holds.
