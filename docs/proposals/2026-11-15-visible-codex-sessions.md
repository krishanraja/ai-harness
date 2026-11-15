# Proposal: Claude starts Codex only through codex_thread, in a session Krish can see

Status: approved by Krish on 2026-11-15 (his words: "yes to the codex proposal"). The canon sentence below is now in
`contract/templates/canon-block.md` (`canon.codex` in `brain/rules.yaml`), recorded as
`Ruling (Krish, 2026-11-15): Claude starts Codex only through the codex_thread tool, from a session on his computer when he must see or share it; a failure to start is reported in one line, never worked around by editing MCP or Claude settings.`
The canonical copy of the tool is now `scripts/codex_thread.mjs` here, and `scripts/codex-thread-copies.mjs` checks
every fleet copy against it.
The operating contract's purge and deletion rule now says what a thread's approval policy "never" does not widen: it
runs read-only unless asked for workspace-write, workspace-write is for a worktree made for that one task, and any
deletion outside it, send, post, spend or permission change keeps its own approval.
Source: Krish's request of 2026-11-15 in a Claude Code session on his own computer, in his words: "I want Claude to
spin up codex sessions I can actually see"; "The Claude session that spawned it needs to be able to continually write
to it and read from it, but I also need to be able to do the same inside the Codex desktop app." Three repositories
already took it as a ruling on the same day, each in its own commit body:
`Ruling (Krish, 2026-11-15): Claude starts Codex only through scripts/codex_thread.mjs.`

## What was wrong

When a Claude session handed work to Codex, it went through the Codex plugin's long-running background server. That
server holds the thread open for as long as it runs and makes the thread ephemeral, so the work never appeared in
Krish's Codex Desktop app, and when it did appear the thread was locked: he could not type into it, and he could not
give it his signed-in browser. The social legwork Krish has assigned to Codex (Ruling, Krish, 2026-11-15: Codex does a
minimum of every video session and the social legwork, visible in Codex Desktop) needs exactly that: a session he can see, join and lend his browser to,
while the Claude session that started it keeps writing to it and reading from it.

## What is built (on main in three repositories)

`scripts/codex_thread.mjs`, the same file in all three (sha256
`1c22f9175334384b21188f090ff5f74fea23b163de2624b01bda2213cf981b53` at each `origin/main`):

| Repository | Where it landed |
|---|---|
| content-engine | pull request #719 (merge `777c0844`); the header says content-engine holds the source |
| growth-heartside | commit `d03aa91` |
| growth-makeyourmindup | commit `c372f00` |

It drives `codex app-server` directly, one short-lived server per command, so nothing holds the thread between turns:

- `node scripts/codex_thread.mjs open [options] "<message>"` starts a permanent thread (`ephemeral: false`) in Krish's
  everyday Codex home, names it by the message's first line, runs that first message and prints the thread id.
- `node scripts/codex_thread.mjs send [options] <thread> "<message>"` resumes the thread, runs one turn, then exits,
  which releases the thread back to Desktop.
- `node scripts/codex_thread.mjs read <thread> [--json]` prints every turn from the thread's session file under
  `sessions/` or `archived_sessions/`, including the turns Krish typed in Desktop.

The Codex home is `--home`, else `VE_CODEX_DESKTOP_HOME`, else `~/.codex`: on his PC that is `C:\Users\krish\.codex`,
the folder Desktop reads. Other options: `--cwd`, `--prompt-file`, `--sandbox` (read-only by default, or
workspace-write), `--json`, `--detach` with `--log` (the command runs on in the background and writes the thread id
first to its log; content-engine's `ve dispatch` uses this for background cards). Every run uses approval policy
"never" and declines any request the server still sends. The plugin's long-running server is never used.

Proved live on 2026-11-15 (content-engine commit `5e1ccf4a`): a thread opened and showed in his Desktop recents,
Claude sent a second turn, he typed in Desktop and Codex answered, and `read` printed all four turns.

## Where a visible session can start, and where it cannot

A session shows in Desktop only when it is written to the Codex home on the computer Desktop runs on. So a visible
session starts only from a Claude session running on Krish's own computer. A cloud container (claude.ai/code), Codex
cloud, a GitHub Actions job and the worker server each have their own Codex home, or none, and can never produce a
session he sees in Desktop. Work that does not need him to see or share it may still run there by that repository's
own route; work that does is started from his computer, or handed to a session there.

## The change to the canon (approved)

**The canon block (`contract/templates/canon-block.md`), after "Branches" (one sentence):**

> **Codex:** Claude starts Codex only through the repository's codex_thread tool (`scripts/codex_thread.mjs`,
> canonical in ai-harness), from a session on Krish's computer when he must see or share the session, and a Codex
> start failure is reported in one line, never worked around by editing MCP or Claude settings (Ruling, Krish,
> 2026-11-15; docs/proposals/2026-11-15-visible-codex-sessions.md).

The last clause closes a known detour: when a start fails, the fix that looks quickest is to change an MCP server or a
Claude setting so some other route works. That widens what a session can reach without his approval and hides the
failure he needs to see. One line naming the failure lets him fix the real cause.

## Copying the tool to every repository that dispatches Codex (approved)

The canonical copy moves to ai-harness at `scripts/codex_thread.mjs`, the same path it has in every repository, the
way the branch sweep is canonical here and copied byte for byte. A change is made here first, then copied unchanged;
the header line "content-engine holds the source" changes to name ai-harness in the same copy. Since his approval, ai-harness
holds the source.

Repositories that dispatch Codex today without it, read at `origin/main` on 2026-11-15:

- growth-mindmake: `scripts/dispatch-card.mjs` prints a Codex plugin background command for his machine.
- growth-legibility: `docs/ENGINE-ARCHITECTURE.md`, section 9, names the plugin's background task command as the
  dispatch.

Each would take the file unchanged and point its dispatch at `open` and `send`, keeping its own allowance guard, its
own yes on the card's digest and its own verification outside the sandbox. A repository that starts dispatching Codex
later takes the file first.

## How it would be proved

A check, run here like the branch sweep's copies, that every repository carrying `scripts/codex_thread.mjs` carries it
byte for byte, and that no repository's dispatch path still names the plugin's long-running server. A canary on his PC
opens a thread, sends a second turn, and reads both back, the same steps as the live proof above.

## What it does not do

It widens no authority: a thread runs read-only unless the caller asks for workspace-write, and every send, post, spend
or permission change Codex might take in his browser keeps its own approval. It changes no MCP server, Claude setting
or Codex setting. It does not stop work that needs no visibility from running in the cloud or in Actions.

## Which part of the North Star this moves

The first part: a ruling given once (start Codex where he can see it) is learned once and shipped to every repository
that dispatches Codex, instead of being corrected again in growth-mindmake and growth-legibility when their first card
runs invisibly. It also moves the second: Codex can only take the browser legwork off his hours if he can see the
session and lend it his browser, and this is the route that lets him.
