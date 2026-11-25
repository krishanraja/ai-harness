# software-qa's route in the registry, 2026-11-25

Status: proposed. Krish asked for it on 2026-11-25 ("you are welcome to do the rest", after internal-auditor's neighbours check named software-qa's unrecorded route as its one major finding).

## What it supersedes

From 2026-11-24 until this change, the registry's software-qa row said its route was "Not recorded yet" and that its role was "to be confirmed against its own README". That was true: nobody had read the README. This change replaces that row; the earlier value stays in this file and in git history, so the record of when the route was unknown and when it became known is kept.

## Source

software-qa's `README.md` and `.github/workflows/qa-manual.yml` at commit 7927a79, read on 2026-11-25. They say it is a venture QA harness: a real PostgreSQL per run with the venture's own migrations and seeded synthetic fixtures, adapters for CTRL and Legibility, and a `qa-manual` workflow dispatched with an adapter, a suite and a seed. The internal auditor's specialist routing already dispatches it (internal-auditor `src/routing.ts`).

## The walls

It owns no gate. ctrl-check keeps CTRL review (stages 5 to 7) and ux-testing-agent keeps app QA; software-qa hands them evidence. Only the internal auditor's routing dispatches its workflow, inside that repository's own CI on a throwaway database; a session never dispatches it and opens an auditor-fix issue instead. Venture-specific detail (which adapters, which inputs) stays in software-qa's own README, not in the shared table.

## Which part of the North Star it moves

The corrections Krish gives twice in a week: a capability no session can call is one more "you did not know that existed".
