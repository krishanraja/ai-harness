# Hosted harness observation deployment, 2026-09-12

## Result

The learning intake now has one hosted, stateless Streamable HTTP MCP endpoint
and one write-only tool, `record_harness_observation`. No n8n workflow, local
collector, watcher, or capture scheduler was added.

- Control Center pull request 312 merged as `0b41c0e0513f`.
- AI harness pull request 36 merged as `840ad04b6845` after Krish's recorded
  override of the judge's paying-leader and per-event approval objections.
- Production endpoint: `https://controlcenter.krishraja.com/api/harness/mcp`.
- Supabase migration `harness_mcp_emitters` applied successfully.
- `harness_emitter_clients` has RLS enabled, no anonymous or authenticated
  grants, and service-role `SELECT` only.
- `harness_event_inbox` remains append-only to the server role with `INSERT`
  and `SELECT`, no update or delete grant.

## Identities and canaries

Three separately revocable identities are active on LORIMER. Supabase stores
only SHA-256 token digests. Raw values are held in distinct Windows user
environment variables and are referenced symbolically by each client config.

| Surface | Discovery evidence | Write evidence |
|---|---|---|
| Codex | Global MCP config reports one enabled Streamable HTTP server | Fresh Codex session wrote inbox 6 |
| Claude Code | `claude mcp get` reports connected | Isolated identity canary wrote inbox 7 |
| Cursor | Native `mcp list-tools` reports exactly one tool | Isolated identity canary wrote inbox 8 |

The protocol canary also proved unauthenticated POST returns 401, authenticated
tool discovery returns exactly one tool, and retrying the same stable payload
returns the original inbox 4 receipt with `duplicate: true`.

## Contract activation

The canonical operating contract owns capture thresholds, exclusions, retry
behavior, and failure honesty. `ctrl-capture` remains the only interpretation
and promotion owner. Local Codex, Claude Code, and Cursor entry files now point
to that contract. Exact pre-change copies are retained under the local scratch
backup directories.

## Second workstation

The S drive was connected for read-only inspection. Its Codex and Claude config
files exist, Cursor has no MCP config, and none contains the hosted emitter.
No file was changed there. A mounted filesystem cannot safely set that
machine's Windows user environment or prove a client runtime is active. The
server has no dependency on the drive or workstation, and no unused credential
was created. Provision a separate identity during a session on that machine,
then run tool discovery and one write canary before marking it active.

## Independent gaps found

- Claude Code's account OAuth session is expired, which blocks a fresh model
  canary even though its MCP connection succeeds.
- Cursor Agent is not logged in for headless use. Native MCP discovery itself
  succeeds.
- Cursor's existing global MCP config contains a raw third-party credential.
  Its value was not copied into this repository. Rotation at the provider and
  replacement with a secret reference require a separate approved action.
- A fresh Codex session reports two malformed unmanaged skill manifests and an
  expired OAuth grant for an unrelated MCP server. These are pre-existing
  catalog and authentication defects, not emitter failures.
- The full local harness validator still flags two pre-existing secret-shaped
  handover fixtures inside untracked `work` trees. CI validation from a clean
  checkout passes.

## Remaining distribution constraint

Capture needs no machine-local process. Local skill and adapter updates are a
different constraint: Codex, Claude Code, and Cursor consume local files and do
not all support a shared remote instruction source. An offline workstation
therefore still needs one machine-level release sync when it reconnects. That
is one updater per physical machine, not one collector or updater per client,
and cannot be eliminated without native remote skill loading from the clients.
