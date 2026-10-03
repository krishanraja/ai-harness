# The output sentinel (spec, not built)

Status: spec. It's built after Krish rules on `docs/harness/VPS-ROLE-2026-10-03.md`.

## The failure it exists for

The fleet's recurring failure is not a crash. It is a run that reports success
and produces nothing, or a job that stopped and is still shown as healthy.
Examples from the record:

- **Lozatron** failed its Test step on every run for eight days. Nobody acted.
- **The Vera auditor**'s only working node has been disabled since 2026-09-06.
  `workflow_health` still reads healthy, because `fleet-reconcile` classifies
  on run and error counts alone.
- **The Synthesis workflow**'s "Log Run to Supabase" node writes `success`
  whatever the parse result.
- **COMPOUND's knowledge refresh** exited "outside the window" and reported
  success, with nothing written since 2026-09-21.
- **The `openclaw-vps` heartbeat** has returned 401 since 2026-09-19.

In every case the thing that failed was also the thing reporting on itself.
The sentinel is a second opinion from a different provider. It checks
**outputs, not heartbeats**, which is the ruling of 2026-09-20: "is it still
writing anything a surface reads".

## Scope: only what the database cannot see about itself

Control Center already computes read-time health for intake sources
(`intake_source_health`, migration `20260920100000`). The sentinel does not
repeat that. It checks three things:

| Check | Source | Finding when |
|---|---|---|
| **Green but empty n8n workflows** | n8n API: each active scheduled workflow's last successful execution. Database: the newest row in the table that workflow is declared to write. | A success inside the expected cadence with no matching row in the same window. This needs a small checked-in map from workflow to table and cadence. That map is the skill-map drift check, which has had no owner since the Truth Reconciler backstop was marked for retirement. |
| **Late or dead GitHub schedules** | GitHub API: the last successful run of each scheduled workflow in the fleet (`harness-steward`, `docs-steward`, the COMPOUND jobs, Hunter, Lozatron) | No success inside its expected cadence plus a grace period. Repeated failures, which usually means an expired secret. |
| **Harness clocks** | `state/heartbeats.json`, and the 14-day expiry on `state/cloud-checks/*.json` | A clock older than its declared age. A cloud check due to expire within 3 days. |

## Where findings go

- **Into `silent_failures`**, which Control Center already reads. Tier 3,
  `failure_type` `sentinel_output_missing`, `workflow_id` `sentinel:<check>`. It
  dedupes on an open row for the same `workflow_id`, unlike
  `audit_critical_infra`, which wrote 721 rows in 7 days for one failure.
- **Pull-only.** A table and a banner, never a phone.
- **Lozatron findings stay out of Control Center.** It is a personal agent, so
  its miss signal is the clock's log and the workflow's own failure email.

## Credentials

- **No `service_role`.** It gets a dedicated Postgres role with:
  - `SELECT` on the freshness inputs it reads
  - `INSERT` on `silent_failures`
  - nothing else
- **n8n:** a read-only key, if n8n offers one. Otherwise the existing key,
  loaded from a root-only env file.
- **GitHub:** a fine-grained token with Actions read-only on the fleet repos.
- **Never in a repository, a log or a chat.**

## Watched itself

The sentinel posts its own heartbeat. Its clock is added to `EXPECTED_CLOCKS`
in `scripts/audit-harness.mjs`, so a dead sentinel becomes a harness finding.
Otherwise it would be "a single point of failure wearing the costume of a
safeguard" (`state/fleet.yaml`).

## Proof before trust

It's proven by making it fail, not by its own green status:

1. Point one check at a throwaway workflow that succeeds and writes nothing.
2. Watch the finding land within one cadence.
3. Make the workflow write, and watch the finding close.

Each check needs one such run on record before it counts as live.
