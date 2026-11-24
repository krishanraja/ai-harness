# Private figures: one home

Status: the list of repositories whose money never appears outside their owner now lives once, as `figures: private` on their rows in `state/fleet.yaml`'s registry (mindmake, krish-raja, dothinkdo, dothinkdo-skills, compound-finances). The revenue desk's `validate_sheet.py` reads it from there (or `--registry` outside this checkout) and is unavailable, exit 2, when no row is marked; its own copy is gone. The strategist reads the same rows in its own pull request.

Next: add or remove a private repository by changing its registry row only.

North Star check (2026-11-24): holds; this removes a drift risk between two copies and moves no number.
