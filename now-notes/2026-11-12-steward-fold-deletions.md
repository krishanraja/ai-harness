Status: The docs steward's validator allows the one deletion the runbook asks for: a closeout note it folds into NOW.md, in a diff that also changes NOW.md. Any other deletion, or a note deleted without NOW.md changing, still fails.
Changed: Every steward run that folded closeout notes was reported failed after its commit landed (control-center's 2026-11-12 run: 17 "was deleted" failures, nothing else); the validator now passes that run.
Next: Watch the next nightly steward run in control-center pass "Published documentation validation".
North Star check (2026-11-12): holds.
