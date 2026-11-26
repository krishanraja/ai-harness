# Release v2026.08.29.3 — cross-surface deployment — 2026-08-29

## Outcome

Release `harness-v2026.08.29.3` is the approved 29-skill production set. It preserves the reconciled inputs from the additional Codex machine and Claude Desktop, including `locked-revision`, `video-engine`, the Mindmake rename and doctrine updates, and Claude's verified correction of the VPS `mindmaker-os` sync paths. It is deployed to every surface reachable from this machine: Cursor local, Claude local, Codex local, Claude Cloud, and Perplexity Computer.

The other Codex machine remains independently machine-local. Its daily governed job can now consume this immutable GitHub release; no direct deployment to that host is claimed here.

## GitHub release evidence

- Source commit: `d631f868be5f9896e283d662a0b49c46aa58f522` on `main`.
- Tag and release: `harness-v2026.08.29.3`.
- Release URL: `https://github.com/krishanraja/ai-harness/releases/tag/harness-v2026.08.29.3`.
- Release workflow: `33262923230`, passed.
- GitHub release ID: `RE_kwDOTurJpM4Wl6fk`; draft and prerelease false.
- `gh release verify`: passed for the release and all assets.
- Published assets: 60 — 29 standard `.skill` archives, 29 Perplexity ZIPs, one manifest, and `SHA256SUMS.txt`.
- Published manifest SHA-256: `AD15B2FFF963564B29354E8C6CE3566D83C020C72750A8A80F45E41414AEB693`.
- Published checksum-file SHA-256: `75BE014DA45222C6F8860F0A98E91798258367E4ABC4BD72F96FB3DEE5762A2C`.
- All 59 checksum entries verified after a fresh download.
- Two clean local builds and the GitHub workflow produced identical hashes for all 58 transport archives. Manifest differences were limited to `built_at_utc`.

## Gate results

- `Test-Harness.ps1`: passed — 29 skills, three adapters, no high-confidence secrets.
- Installer self-test: passed — portable-root package, supporting-leaf preservation, plan-only, add, exact parity, unknown-drift refusal, release-bound reconciliation, replacement, and backup preservation.
- Standard packages retain a top-level skill directory; Perplexity packages place `SKILL.md` at archive root.
- `ctrl-intake` Perplexity detail visibly retained `leaves/voice.md` and `leaves/transcripts.md` together.
- Legacy collisions `mindmaker`, `mindmaker-os`, `mobile-app-ui-design`, and local `ui-ux-pro-max` are absent from active governed routes. Local retirements remain in dated recoverable backups.

## Local deployment evidence

All three post-deployment plan-only audits report `exact=29`, `unreconciled=0`, `add=0`, with no missing or extra personalized directories. The Codex `.system` directory remains provider-managed and excluded from personalized parity.

The release skill-set aggregate is `DDD4AD8EAC617B34C6FEBA17D38E5210DCAF87CEB06076D0EA10EFBF32FAE018`, calculated from ordinal `skill-name NUL installed-skill-hash` records using SHA-256.

- Cursor record: `C:\Users\krish\.cursor\skills.harness-backups\cursor-primary\v2026.08.29.3-20260829T162803Z-1770a7fa\deployment-record.json`.
- Claude local record: `C:\Users\krish\.claude\skills.harness-backups\claude-code-user\v2026.08.29.3-20260829T162803Z-95ab5d84\deployment-record.json`.
- Codex local record: `C:\Users\krish\.codex\skills.harness-backups\codex-current\v2026.08.29.3-20260829T162800Z-2d784bc7\deployment-record.json`.

Claude Desktop's inbound `mindmake-os` was not overwritten as drift. Its change was compared against canonical, admitted because it repaired two nonexistent VPS paths and documented the infrastructure naming exception, committed, released, and then propagated outward. Cursor and Codex replaced the known `.2` baseline; Claude local was already exact to `.3` and was recorded without replacement.

## Cloud evidence

Claude Cloud has exactly 29 user-managed canonical skills, all enabled. Anthropic's three provider-managed skills remain separate. `mindmake-os` was replaced from the `.3` standard package and its enabled detail visibly contains both corrected `/root/.../mindmaker-os/SKILL.md` paths and the anti-rename guard.

Perplexity Computer has exactly the same 29 canonical names and all 29 are enabled. The two superseded routes were removed after approved replacement. `mindmake-os` was replaced from the `.3` Perplexity package and its enabled detail visibly contains both corrected paths and the guard.

Cloud names, dates, enabled states, visible resources, and held-out content prove the observable deployment contract but not provider-internal byte storage. The downloaded release hashes and local installs provide byte proof; cloud parity retains that unavoidable provider-bound uncertainty.

## Verdict

PASS for every reachable surface. GitHub is the release authority, but this deployment followed inbound reconciliation rather than assuming repository bytes were newest: the newest objectively better Claude change was promoted first, then the new immutable release was pushed outward.
