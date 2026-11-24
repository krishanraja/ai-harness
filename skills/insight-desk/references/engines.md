# Engines

The desk consults two engines through Control Center. Neither holds taste; both are readers or idea sources whose results the desk records in the sheet's `consults` list. Every call is recorded, whatever its result.

## Results

Each consult records `engine`, `op`, `result` and `ref` (the run id or the command's output file).

| Result | Means | The desk |
|---|---|---|
| `pass` | the engine answered and found nothing against the idea | carries on |
| `flagged` | the engine answered and flagged something | fixes the idea or says on the sheet why not |
| `unavailable` | not served, held, capped, unreachable or uncalibrated | records `unavailable`, never `pass`, and says so on the sheet |

Exit 2 from any engine command means unavailable. It is never a pass, and a test that depends on it is `unavailable`, not `pass`.

## divergence-engine

Formerly divergent-thinker (Krish's pick, 2026-11-24); sheets that name the old engine stay valid.


- Runs in the venture's own namespace only, as the adapter names it (for example `<repository>:ideas`), never another venture's.
- `score` with the three obvious ideas as the obvious set: free. Run it every sheet.
- `map`, then `provoke`: paid. Only when the ideas cluster in one family, once each per sheet.
- `challenge`: paid. At most once per sheet, for kill the favourite.
- `diverge`: not used by the desk. It belongs to the engine's own U4 and U5 recovery.
- `record`: free. For anything that goes live from the sheet.
- Paid calls stay inside Control Center's per-caller daily caps and are never routed around. A refusal is `unavailable`.
- Its sparks are proposals: an idea taken from one is labelled with its spark and run ids and faces the same screen.
- Where the repository has no client, the connector tools `divergent_score`, `divergent_record` and `divergent_run` serve a session on Krish's account; a scheduled run with neither records `unavailable`.

## humour engine

- Only where the adapter sets `humour.allowed` to true, through the command in the adapter's `humour.check`. The skill names no venture's command; each venture's lives in its own `config/insight-desk.json`.
- It reads whether a stranger gets the joke, by what mechanism and at whose expense. It never decides whether the idea is funny enough; the venture's taste and Krish decide.
- Live calls are paid and capped by Control Center. The desk sends the idea's premise and mechanic, not finished copy, because it writes none.
- Where the adapter says humour is unavailable or never assumed, the desk makes no humour call and does not reach for comedy as a method unless `get_approved_taste` for the venture allows it.

## Recording

Krish's words about a sheet go word for word to the venture's floor and to `report_to_taste_engine`. An engine failure or a defect goes to `record_harness_observation`, never to the taste ledger.
