# Skills follow main in every claude.ai account, and tool-router is admitted, 2026-10-29

## Rulings (Krish, 2026-10-29)

- Ruling (Krish, 2026-10-29): skills stay current on every surface with zero intervention, following main.
- Ruling (Krish, 2026-10-29): tool-router is included everywhere.

Both are recorded in commit `666252d3b25f`, which the six `tool-router.*` rows in `brain/rules.yaml` cite as their source. This record supersedes the admission gate in `docs/proposals/2026-10-19-tool-router.md`: that proposal kept the candidate outside `production_active` until a blind trigger comparison and a behaviour canary had run. Krish admitted it before either ran, so both are now post-admission checks. Taking it off a surface is a rollback that needs his ruling.

## What this moves

The North Star's first part: "every ruling is learned once, shipped everywhere". On 2026-10-29, seven of the 29 skills in the one readable claude.ai account were behind main, because each skill had been uploaded by hand. The second account had never been read back. A ruling merged to main reached neither account until someone uploaded it.

## How the accounts stay current

- Both accounts are personal. claude.ai syncs plugins from GitHub only for Team and Enterprise organizations, and the Skills API writes only to API workspaces. No tool in a Claude session writes to the account's skill catalogue.
- So the accounts hold none of the harness skills. Control Center's `get_skill` serves every skill and the account routing live from ai-harness main.
- The Instructions for Claude field holds a fixed pointer that loads the routing through `get_skill`, so it never needs changing again.
- Ruling (Krish, 2026-10-29): uploaded skills whose names are exactly the harness production names may be deleted from both accounts, and nothing else.

### Why there is no scheduled routine

Krish first ruled that a Claude routine in each account keep it in sync. On 2026-10-29 both attempts failed:

- **Account krishanraja@gmail.com:** the Cowork safety check refused to create the task. Each run would have deleted skills and rewritten the field unattended, on authority read from a file at run time.
- **Account krish@mindmake.co:** the task ran and stopped with `account-unproven` before changing anything, because that session's connector did not yet offer `check_krish_account` (observation 219).

So the recurring part is removed rather than worked around. The pointer and live routing leave nothing to sync.

## What is still owed

Krish runs the setup once in a chat in each account, in the Claude desktop app, where the built-in browser is available:

> Run my account setup: call Control Center get_skill with name "account" and file "setup", and follow it.

It shows him the exact skills to delete and the field's new text, and changes nothing until he says yes. If Control Center does not yet offer `check_krish_account` in that chat, disconnecting and reconnecting the connector in claude.ai's settings refreshes its tools; otherwise the setup asks him to confirm the account in the chat.

## Known overlap, not resolved here

The judge panel on PR 180 found that `tool-router` restates three operating-contract rules nearly verbatim:

- connected MCP first;
- first-task inventory;
- venture state from the venture's own repository.

It also found that its relevance-gated cost read sits beside the unconditional chargeable-operation rule. The skill text is unchanged from the reviewed candidate. Retiring the twins is a separate revision.
