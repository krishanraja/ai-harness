# Capture: how each tool feeds the brain

The harness learns from the work Krish does across his AI tools. This page says,
for each tool, how its signal reaches the ledger, what is already live, and the
one-time steps only Krish can take. Nothing here runs by itself until those steps
are done; until then the audit keeps a `surface-contract` finding open for every
tool that reads the brain and writes nothing back.

| Tool | How it feeds the brain | State |
|---|---|---|
| Claude Code and Codex on LORIMER | The hosted `record_harness_observation` tool, Ruling lines in commits, and the private weekly session miner | Tool and Ruling lines live; the miner runs from the nightly sync and waits for a submission route (below) |
| Claude Code cloud sessions | Ruling lines in merged commits today; the claude.ai connector and the cloud session miner once added | Ruling lines live |
| claude.ai and Claude Desktop | One custom connector plus one line in the account instructions | Needs a connector-compatible endpoint, then Krish adds the connector |
| ChatGPT | The same hosted endpoint as a custom connector | Best effort only: write tools are in beta, may be plan-limited, and ask for confirmation on every call |
| Cursor | The hosted tool | Configured; its headless agent needs logging in again |
| Perplexity | None | Out of scope by Krish's ruling of 2026-10-14: deep research only |

## What only Krish can do, once each

1. **Replace the judge panel key.** Repository secret `ANTHROPIC_API_KEY` in
   `krishanraja/ai-harness`. Until it is valid the judge cannot measure a canon
   change, so no change request is ever marked ready, and the digest asks for
   this instead.
2. **Arm the digest.** Repository secret `CONTENT_ENGINE_KEY` in
   `krishanraja/ai-harness`, holding the content engine's board key. It only
   reads the board: Control Center's connections sweep puts the digest on his
   list from `state/digest/latest.json` on main (2026-10-23), and housekeeping
   reads it back to record delivery. Without the key the digest still reaches
   the list, but the harness cannot confirm it.
3. **Add the claude.ai connector**, once the endpoint accepts a connector (see
   Control Center below). In claude.ai: Settings, Connectors, Add custom
   connector, paste the endpoint address Control Center issues for the
   `claude-ai` identity. The same connector is loaded into Claude Desktop and
   into Claude Code cloud sessions.
4. **Paste the updated account instructions** from
   `adapters/cloud/account-instructions.md` into claude.ai's personal
   instructions. The new last line tells it when to log a signal.
5. **ChatGPT, if wanted.** Enable developer mode, add the same endpoint as a
   custom connector for the `chatgpt` identity, and accept that every write asks
   for confirmation.
6. **Nothing to install for the session miner.** The nightly PC sync runs it
   once a week. Where its lessons go is Krish's call, recorded in
   `contract/learning-policy.yaml` (`miner.submit`); until he chooses, it reads
   nothing and its clock reports degraded.
7. **Create the cloud session miner** as a weekly Claude Code scheduled task
   from the prompt in `docs/harness/cloud-session-miner.md`, with the claude.ai
   connector attached.

## If the PC stops checking in

The weekly digest says so on Krish's list, with the one line that fixes it. In
any PowerShell window:

```
irm https://raw.githubusercontent.com/krishanraja/ai-harness/main/scripts/Repair-HarnessPc.ps1 | iex
```

It finds the checkout, brings it up to date, points the nightly task at it,
runs it once and says in one line how that went. From then on the sync keeps
its own checkout current every day.

## What Control Center must change first

The hosted endpoint lives in `krishanraja/control-center` (`api/harness/*`). It
authenticates each client with a static bearer token, which the claude.ai and
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
