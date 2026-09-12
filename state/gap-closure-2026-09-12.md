# Harness gap closure evidence, 2026-09-12

## Local release parity

A bounded no-op machine sync downloaded and verified all 60 immutable assets for
`v2026.09.08.2`, then independently recomputed all three reachable local skill
surfaces. Each contained 29 skills and 139 files, all 29 per-skill hashes matched,
and each aggregate matched
`9D3F2E690A450CC3E23E9B3C86A4A9DC2D563EE111678AA811F8837C098B4B05`.
No install was required. The registry had remained on `.1` after the actual `.2`
install and is corrected by this evidence.

## Auto-discovery correction

The shared third-party directory previously classified as inert was observed in a
fresh Codex session. It contributed malformed-skill errors and competed for the
client's finite description budget. Its 59 valid manifests and 324 files were moved
intact to an inactive catalog. The two already-forbidden malformed skills were moved
to a separate quarantine; a plaintext n8n credential in the legacy copy was replaced
with a symbolic reference before the move. A fresh session no longer reports either
malformed skill.

One older duplicate Vercel plugin was replaced by the smaller account-managed Vercel
plugin. A stale OAuth-backed MCP entry was removed after its refresh grant failed.
Both changes are recoverable through the plugin catalogue and MCP add flow.

## Active configuration hygiene

Active Codex, Claude Code, Cursor, and Claude Desktop configuration now refers to
user-scoped environment variables instead of storing the observed Skyvern and n8n
values inline. JSON and TOML parse checks passed. Claude Code connected to Skyvern and
the hosted harness observer after resolving those references. Provider-side rotation
and historical-copy scrubbing remain one atomic remediation batch because the values
have appeared in session history and preserved backups.

## Validation

- Harness validation: passed, 29 skills, 3 adapters, no high-confidence secrets.
- Fresh Codex startup: passed without malformed-skill or expired-OAuth errors.
- Description audit: canonical total reduced from 21,615 to 19,634 characters; all
  four high-risk description findings are closed. The client still reports global
  truncation while useful provider plugins are enabled, so this remains a platform
  budget residual rather than a reason to remove working capabilities.
- Hosted harness observer: connected in Claude Code and previously canaried in fresh
  Codex, Claude, and Cursor sessions.

## Freshness review

Seven expired review records were examined rather than date-bumped mechanically.
The durable evidence-research method, decision-ledger boundaries, and tools-access
contract remain correct. The decision ledger still reports its Supabase migration as
unapplied, so it continues to fail closed with `STORE_UNAVAILABLE` instead of
inventing durable memory.

Current official documentation reconfirmed the Apify execution and cost controls,
n8n saved-versus-published distinction, and Instantly API v2 authentication,
pagination, and bulk-lead constraints. Eight Apify tests passed. The pinned design
adapter passed 41 wrapper and vendor tests and its directory hash remains intact.
Upstream design intelligence has advanced to tag `v2.15.0` and a newer head, which is
recorded as observed drift but not promoted without a bounded semantic review.

## Unavoidable live gates

The additional Windows machine cannot receive a machine-scoped secret or produce a
runtime canary through a mounted drive. Its local configuration must be completed by
one command executed on that machine when it is online. Claude and Cursor headless
account sessions also require their owners' interactive login surfaces.
