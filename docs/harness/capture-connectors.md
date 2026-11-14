# Capture: how each tool feeds the brain

The harness learns from the work Krish does across his AI tools. This page says,
for each tool, how its signal reaches the ledger, what is already live, and the
one-time steps only Krish can take. Nothing here runs by itself until those steps
are done; until then the audit keeps a `surface-contract` finding open for every
tool that reads the brain and writes nothing back.

| Tool | How it feeds the brain | State |
|---|---|---|
| Claude Code and Codex on LORIMER | The hosted `record_harness_observation` tool, Ruling lines in commits, and the private weekly session miner | Tool and Ruling lines live; the miner runs from the nightly sync and waits for a submission route (below) |
| Claude Code cloud sessions | Ruling lines in merged commits, and `record_harness_observation` through the Control Center connector | Both live: the ledger holds `[claude-code-web]` rows from 2026-10-15 to 2026-11-11. Live capture is the route; the weekly cloud session miner is retired (step 7) |
| claude.ai and Claude Desktop | One custom connector plus the account instructions' fixed pointer (`adapters/cloud/account-instructions.md`) | Live: the endpoint takes a capability URL (control-center ADR-037, 2026-10-15) and the ledger holds `[claude-ai]` rows from 2026-10-20 to 2026-10-30 |
| ChatGPT | The same hosted endpoint as a custom connector | Live, best effort: write tools ask for confirmation on every call; the ledger holds `[chatgpt]` rows from 2026-10-17 to 2026-11-11 |
| Cursor | The hosted tool | Configured; its headless agent needs logging in again |
| Perplexity | None | Out of scope by Krish's ruling of 2026-10-14: deep research only |

## What only Krish can do, once each

1. **The judge panel key.** Repository secret `ANTHROPIC_API_KEY` in
   `krishanraja/ai-harness`. Done: the judge measured a verdict on pull request
   209 on 2026-11-09. If it stops measuring, the digest asks for it again.
2. **Arm the digest.** Repository secret `CONTENT_ENGINE_KEY` in
   `krishanraja/ai-harness`, holding the content engine's board key. It only
   reads the board: Control Center's connections sweep puts the digest on his
   list from `state/digest/latest.json` on main (2026-10-23), and housekeeping
   reads it back to record delivery. Without the key the digest still reaches
   the list, but the harness cannot confirm it.
3. **Add the claude.ai connector.** Done where the ledger shows it (above). In
   claude.ai: Settings, Connectors, Add custom connector, paste the endpoint
   address Control Center issues for the `claude-ai` identity. The same
   connector is loaded into Claude Desktop and into Claude Code cloud sessions.
4. **Paste the account instructions** from
   `adapters/cloud/account-instructions.md` into claude.ai's personal
   instructions, through the one-time `adapters/cloud/account-setup.md` in each
   account. It is a fixed pointer that loads the routing live.
5. **ChatGPT, if wanted.** Enable developer mode, add the same endpoint as a
   custom connector for the `chatgpt` identity, and accept that every write asks
   for confirmation.
6. **Nothing to install for the session miner.** The nightly PC sync runs it
   once a week. Where its lessons go is Krish's call, recorded in
   `contract/learning-policy.yaml` (`miner.submit`); until he chooses, it reads
   nothing and its clock reports degraded.
7. **Nothing to do for the cloud session miner: it is retired.** Ruling
   (Krish, 2026-11-13: "readers not required"): the two cloud-account reader
   slots are not required; live capture through the connector (above) is the
   route, and no Claude scheduled task reads sessions, which keeps his
   2026-10-29 ruling of zero Claude routines. One task still runs: "Session
   miner" (`trig_01SGAM5qY3jYEbWCz97KtGEe`, Sundays 11:46 New York time),
   still enabled on 2026-11-14, which wakes the standing session
   `session_01AE3PvMNyhCbgp6vvPmrDYr`. Only Krish can switch it off. Until he
   does, `scripts/mine-sessions.mjs --source cloud-events` reads and sends
   nothing and says the miner is retired. `claude-cloud-account-1` and `claude-cloud-account-2` stay
   in `config/harness-jobs.json`, enabled but `required: false`, so the
   watchdog shows them as inaccessible without counting them toward its
   health. `docs/harness/cloud-session-miner.md` keeps the old prompt as the
   record.

## If the PC stops checking in

The weekly digest says so on Krish's list, with the one line that fixes it. In
any PowerShell window:

```
irm https://raw.githubusercontent.com/krishanraja/ai-harness/main/scripts/Repair-HarnessPc.ps1 | iex
```

It finds the checkout, brings it up to date, points the nightly task at it,
runs it once and says in one line how that went. From then on the sync keeps
its own checkout current every day.

## What Control Center had to change first (done)

Done by control-center ADR-037 on 2026-10-15; kept as the record. The hosted
endpoint lives in `krishanraja/control-center` (`api/harness/*`). It
authenticated each client with a static bearer token, which the claude.ai and
ChatGPT connector screens cannot send. Before step 3:

- accept a connector: a revocable per-identity capability URL (rate-limited,
  append-only, unable to approve anything), or OAuth;
- accept the surfaces `claude-ai`, `claude-code-web` and `chatgpt`, and the
  kinds `preference` and `friction`, in `api/harness/_event.ts`;
- accept `event_id`s that begin `session-miner:`;
- say in the tool description which surface label to use: `claude-code-web`
  when `CLAUDE_CODE_REMOTE` is `true`, `claude-ai` in claude.ai or Desktop.

This repository's importer already accepts all of these, so the order is safe:
importer first (done), then the server, then the clients.

## How to tell it worked

Each added surface is verified by one test signal, read back from the ledger:
after the next nightly observer run, `state/observations/<month>.jsonl` holds a
row whose quote starts with `[claude-ai]`, `[chatgpt]` or `[claude-code-web]`.
The audit's `surface-contract` finding for that tool can then be closed by
changing its `writes` entry in `state/fleet.yaml`.
