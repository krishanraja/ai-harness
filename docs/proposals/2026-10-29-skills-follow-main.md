# Skills follow main in every claude.ai account, and tool-router is admitted, 2026-10-29

## Rulings (Krish, 2026-10-29)

- Ruling (Krish, 2026-10-29): skills stay current on every surface with zero intervention, following main.
- Ruling (Krish, 2026-10-29): tool-router is included everywhere.

Both are recorded in commit `666252d3b25f`, which the six `tool-router.*` rows in `brain/rules.yaml` cite as their source. This record supersedes the admission gate in `docs/proposals/2026-10-19-tool-router.md`: that proposal kept the candidate outside `production_active` until a blind trigger comparison and a behaviour canary had run. Krish admitted it before either ran, so both are now post-admission checks. Taking it off a surface is a rollback that needs his ruling.

## What this moves

The North Star's first part: "every ruling is learned once, shipped everywhere". On 2026-10-29, seven of the 29 skills in the one readable claude.ai account were behind main, because each skill had been uploaded by hand. The second account had never been read back. A ruling merged to main reached neither account until someone uploaded it.

## How the accounts stay current

- Both accounts are personal. claude.ai syncs plugins from GitHub only for Team and Enterprise organizations, and the Skills API writes only to API workspaces. No tool in a Claude session writes to the account's skill catalogue.
- So the accounts hold none of the harness skills. Control Center's `get_skill` (krishanraja/control-center#604) serves each skill, the account instructions and the routine's steps live from ai-harness main.
- Ruling (Krish, 2026-10-29): a Claude routine in each account keeps it in sync, opening its own Claude browser if needed. It replaces the loader design merged in #180, which still needed an upload whenever a description changed.
- Ruling (Krish, 2026-10-29): the routine may delete, from both accounts, uploaded skills whose names are exactly the harness production names, and nothing else.

## What is still owed

Krish creates the scheduled task once in each account's Cowork (daily is enough), set to run on his computer rather than remotely, since Cowork runs tasks remotely by default and a remote run may have no browser, and signs that account's built-in browser in to claude.ai if it is not already. The task's whole prompt, with the label changed for the second account:

> Account sync for the primary account. Call Control Center get_skill with name "account" and file "sync", and follow the returned text exactly, using your built-in browser. The routine's first run removes the old copies and pastes the instructions; its observation is the read-back.

## Known overlap, not resolved here

The judge panel on PR 180 found that `tool-router` restates three operating-contract rules nearly verbatim:

- connected MCP first;
- first-task inventory;
- venture state from the venture's own repository.

It also found that its relevance-gated cost read sits beside the unconditional chargeable-operation rule. The skill text is unchanged from the reviewed candidate. Retiring the twins is a separate revision.
