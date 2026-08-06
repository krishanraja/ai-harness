# Deployment evidence — candidate-5754854

## Release identity

- Source commit: `57548547db9f8378698477cf198e862dfaaf3699`
- Source repository: private `krishanraja/ai-harness`
- Release ID: `candidate-5754854`
- Canonical skills: 26
- Adapters: 3
- Artifact-set SHA-256: `96097A8D7ED2EFB6A983ADC05260445AC1C3C617F8AC20ED5C3ECD84A07A3163`
- Repeat build: 26/26 artifact and source-skill hashes identical
- Integrated validation: passed; no high-confidence secrets

## Local deployments

Each installer readback reported 26 exact, zero replace, and zero add after deployment.

| Surface | Active result | Deployment record |
|---|---|---|
| Cursor | 26 canonical directories | `C:\Users\krish\.cursor\skills.harness-backups\cursor-primary\candidate-5754854-20260806T140444Z-6d27253e\deployment-record.json` |
| Claude Code/Desktop | 26 canonical directories | `C:\Users\krish\.claude\skills.harness-backups\claude-local\candidate-5754854-20260806T140448Z-c2eb9c04\deployment-record.json` |
| Codex | 26 canonical user directories plus untouched provider `.system` | `C:\Users\krish\.codex\skills.harness-backups\codex-local\candidate-5754854-20260806T140450Z-b0a2255d\deployment-record.json` |

## Reversible quarantine

- Cursor: eight approved extras moved and hash-verified. Record: `C:\Users\krish\.cursor\skills.harness-backups\cursor-primary\candidate-5754854-20260806T140623Z\quarantine-record.json`.
- Codex: the same eight user extras moved and hash-verified; `.system` excluded. Record: `C:\Users\krish\.codex\skills.harness-backups\codex-local\candidate-5754854-20260806T140642Z\quarantine-record.json`.
- Claude local: the exact approved 75 extras moved and hash-verified. Record: `C:\Users\krish\.claude\skills.harness-backups\claude-local\candidate-5754854-20260806T140657Z\quarantine-record.json`.
- Shared `.agents`: five canonical-name collisions moved and hash-verified; 61 distinct third-party skills retained. Record: `C:\Users\krish\.agents\skills.harness-backups\agents-shared\candidate-5754854-20260806T140716Z\quarantine-record.json`.
- Cursor's `skills-cursor` directory contains Cursor-managed product skills and management manifests. It is excluded from canonical ownership and retained as provider-managed, not treated as user duplication.

Nothing in these quarantines was permanently deleted. Recovery is the recorded inverse move followed by the stored directory-hash check.

## Claude Cloud

Approved actions executed:

- replaced `mindmaker-os`, `krish-content-marketer`, and `krish-voice` from the verified release artifacts;
- uploaded `n8n-operator` and `instantly-operator`;
- uninstalled legacy `n8n`, `instantly`, `krish-fleet-ops`, and `krish-outbound`.

Final visible inventory: 28 skills — 26 user-managed canonical names dated 2026-08-06 plus Anthropic-managed `morning` and `skill-creator`. All four retired names were absent on readback.

Fresh-chat canary passed. Claude routed fleet identity/health to `mindmaker-os`, added `n8n-operator` only for live workflow/execution evidence, and closed with `verification-loop`. It routed outbound strategy and copy to `krish-content-marketer` and `krish-voice`, provider mechanics to `instantly-operator`, workflow mechanics to `n8n-operator`, authentication proof to `tools-access`, and preserved exact mutation/send/activation gates.

Claude Cloud exposes no package hash. Its evidence is therefore the verified uploaded artifact, visible inventory/readback, fresh-chat behavior, and retained deterministic release package. Residual byte-level Cloud uncertainty remains explicit.

## Local runtime observations

- Claude Code 2.1.223 sees the full user-customization context only outside safe mode. A corrected read-only canary exhausted its model-call budget while loading that context and returned no routing result; no live provider or credential was touched. Do not treat this as a behavior pass.
- Cursor 3.14.27 launched and opened a fresh Agent chat successfully. Its custom composer did not expose a reliable automation focus target, so no message was sent and no behavior result is claimed.
- Codex user directories are byte-exact; discovery of newly installed skills requires a fresh Codex task because the current task's skill catalog was initialized before deployment.

These limitations affect runtime canary evidence, not installed artifact parity. Future freshness checks should use new client sessions with a bounded native canary path and must never weaken the release hash gate.

## GitHub-to-client operating rule

GitHub `main` remains candidate source. Only a clean, validated, deterministic release may feed local clients. Local automatic checks may download, stage, hash, and notify; they must not silently replace active skills. Claude personal Cloud stays a supervised browser deployment because its catalog is not the same as Claude Code or API-managed skills. Learning remains proposal + regression + review + release, never direct self-editing of active skills.
