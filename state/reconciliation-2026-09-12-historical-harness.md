# Historical harness reconciliation, 2026-09-12

## Scope and evidence

The historical Downloads harness was inspected read-only and remains unchanged. It
contains 1,932 files, 1,110 `SKILL.md` files, and one dirty Git worktree based on commit
`077eb33ad6d8498b7abaeb0a0e35a9239a3974d8`. Provider-managed and Git internals account
for 497 excluded files. The deterministic comparison covered 1,436 files against the
139-file canonical tree.

| Class | Files | Disposition |
|---|---:|---|
| byte-exact | 2 | no action |
| same path, different bytes | 6 | canonical retained; historical bytes preserved as corpus |
| historical-only | 1,428 | inactive corpus pending demand-led review |
| canonical-only | 131 | expected; the historical tree is not a deployment surface |

The historical aggregate is
`5F01F193F563C6E00C2BF150AF985618D26C37FAE4BDAB8ECEC2E030A205C4CB`.
The compared canonical aggregate is
`DFA17298AD35373352FDBF2B2D42E7681FCB8CC3BF2B4D76F59D6661E438650A`.

## Same-name decisions

Five canonical skills overlap: `content-corpus`, `krish-voice`, `mindmake`,
`mindmake-os`, and `ux-testing-agent`. The six differing files are older or less safe
forms. The Mindmake router differs only by its older review evidence. Its commercial
reference retains retired publication names. The OS router hard-codes machine paths,
deletion instructions, a direct-main push, and a cron schedule that the current canon
deliberately replaced with named roots and live lookup. The remaining three are larger
pre-decomposition monoliths whose current responsibilities now have narrower owners.

Decision: `retire-local-drift` from production routing while preserving all bytes as
inactive corpus. No historical file is promoted, overwritten, or deleted.

## Historical-only material

The 55 top-level historical-only skills and the nested bulk bundle are not evidence
that 55 capabilities are missing. They are an unreviewed mixture of templates, agent
briefs, tool manuals, retired ventures, backups, and generic producer skills. They
remain searchable evidence and must pass provenance, overlap, security, behavior, and
collision gates before any admission.

The 59 KB multi-agent memory paper is retained as research corpus, not operating
doctrine. Its recommendations are not promoted until their citations and current
provider assumptions are independently verified and a concrete recurring failure
earns a change through `ctrl-capture`.

## Result

The historical folder is now reconciled as preserved inactive evidence. It is neither
a second source of truth nor a claim that the repository already contains every useful
idea inside it. Future extraction is demand-led: a real failure or repeated need opens
one bounded review, one candidate change, and one regression case.

