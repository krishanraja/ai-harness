Status: The closeout fold takes an optional `--now-cap <bytes>` (and `--history <docs/history/file.md>`, default `docs/history/LOG.md`): it moves the oldest dated status lines under "Where it is right now" to the history file until NOW.md fits, notes or none, and with no flag it behaves as before (hook 08dfe093, recorded as a byte change in `contract/repository-administration.json`).
Next: have content-watcher's fold step pass `--now-cap 12000 --history docs/history/NOW-changes.md`, then read back its NOW.md under the cap on main.
North Star check (2026-11-15): holds.
