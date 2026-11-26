# state/

Machine-owned evidence and the few truth files the harness reads. Prose that explains the harness lives in `docs/`; doctrine lives in `contract/` and `skills/`.

## Truth files (read these, keep them current)

| File | What it holds |
|---|---|
| `skill-registry.yaml` | Releases, deployments and skill lifecycle. The release authority. |
| `fleet.yaml` | The surface list and the registry of every repository and its route. |
| `heartbeats.json` | The latest heartbeat from each machine job. |
| `pins.yaml` | Files one repository owns and others carry a copy of. |
| `ventures.json` | The venture map, rendered from `fleet.yaml`. Do not edit by hand. |
| `scoreboard.jsonl` | The weekly learning scoreboard, one line a week. |
| `decision-ledger-config.yaml` | The decision ledger's store and schema. |
| `credential-exposure-2026-09-12.md` | An open gate: `scripts/render-current-state.mjs` reads its status into `CURRENT.md`. It moves to `history/` once closed. |
| `surfaces.example.json` | An example surface declaration. |

## Evidence folders (append, never rewrite)

| Folder | What it holds |
|---|---|
| `deployments/` | One record per release per surface. |
| `canaries/` | Behavioral canary results per release and surface. |
| `machine-runs/` | Per-machine install runs. |
| `reconciliations/` | Release-bound reconciliation records for drifted surfaces. |
| `cloud-checks/` | Cloud surface inventory reads. |
| `candidates/` | One manifest per candidate skill, kept after admission or rejection. |
| `approvals/` | Recorded approvals for named changes. |
| `observations/` | Monthly harness observation logs. |
| `digest/` | Weekly digests. |
| `evals/` | Evaluation runs. |
| `now-audit/` | The latest `NOW.md` audit. |
| `repository-administration/` | Repository administration evidence and migrations. |
| `session-miner/` | Session miner checkpoints. |
| `vps/` | VPS alignment and hardening records. |

## history/

Dated one-off reports from August to September 2026: independent skill results, release and deployment proofs, quality audits, import reviews and reconciliations. They are kept as evidence and cited by path from the registry, `contract/paths.yaml` and `docs/history/LOG.md`. Nothing reads them to decide current state.

A new dated report that is not a per-release record goes in `history/` from the start, not in this folder's root.
