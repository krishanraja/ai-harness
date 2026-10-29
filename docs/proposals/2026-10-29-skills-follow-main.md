# Skills follow main in every claude.ai account, and tool-router is admitted, 2026-10-29

## Rulings (Krish, 2026-10-29)

- Ruling (Krish, 2026-10-29): skills stay current on every surface with zero intervention, following main.
- Ruling (Krish, 2026-10-29): tool-router is included everywhere.

Both are recorded in commit `666252d3b25f`, which the six `tool-router.*` rows in `brain/rules.yaml` cite as their source. This record supersedes the admission gate in `docs/proposals/2026-10-19-tool-router.md`: that proposal kept the candidate outside `production_active` until a blind trigger comparison and a behaviour canary had run. Krish admitted it before either ran, so both are now post-admission checks. Taking it off a surface is a rollback that needs his ruling.

## What this moves

The North Star's first part: "every ruling is learned once, shipped everywhere". On 2026-10-29, seven of the 29 skills in the one readable claude.ai account were behind main, because each skill had been uploaded by hand. The second account had never been read back. A ruling merged to main reached neither account until someone uploaded it.

## Why loaders

- Both accounts are personal. claude.ai syncs plugins from GitHub only for Team and Enterprise organizations, and the Skills API writes only to API workspaces.
- So the accounts hold one loader per production skill. Each loader carries the skill's own name and description, plus a body that reads the skill live through Control Center's `get_skill` (krishanraja/control-center#604), which reads ai-harness main at call time.
- A loader changes only when a description does. `scripts/build-cloud-loaders.mjs --check` fails the steward check on drift, so that one upload is never silent.

## What is still owed

A one-time cut-over in each account: replace the uploaded skills with the loaders, paste `adapters/cloud/account-instructions.md`, and commit the `get_skill` read-back to `state/cloud-checks/`. Until that record exists, both surfaces stay recorded as stale.

## Known overlap, not resolved here

The judge panel on PR 180 found that `tool-router` restates three operating-contract rules nearly verbatim:

- connected MCP first;
- first-task inventory;
- venture state from the venture's own repository.

It also found that its relevance-gated cost read sits beside the unconditional chargeable-operation rule. The skill text is unchanged from the reviewed candidate. Retiring the twins is a separate revision.
