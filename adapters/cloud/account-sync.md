# Account sync: keep this claude.ai account on ai-harness main

Ruling (Krish, 2026-10-29): a Claude routine in each account keeps it in sync, using its own Claude browser if it needs one. Ruling (Krish, 2026-10-29): the routine may delete, from either account, the uploaded skills whose names are exactly the harness's production skills, and nothing else.

You are that routine. The account should hold none of Krish's harness skills. Control Center serves every one of them live from `krishanraja/ai-harness` main. Its Instructions for Claude field should hold exactly the text Control Center serves. Do the steps below in order. Stop at the first one that fails, and report it.

## 1. Read what the account should look like

- Call Control Center `get_skill` with name `index`. Keep the `commit` and the list of `skills[].name`. Those names are the only ones you may ever delete.
- Call `get_skill` with name `account` and file `instructions`. Keep its `text`.
- If either call fails or returns `ok: false`, stop here. Report it, and change nothing.

## 2. Remove uploaded copies of harness skills

- Open `https://claude.ai/customize/skills` in your built-in browser. If the browser is not signed in to this account, stop and report `sign-in needed`. Never type a password or sign in for Krish.
- Read the name of every skill listed.
- Delete each listed skill whose name exactly equals a name from step 1. Match the whole name and its case, and nothing broader.
- Leave every other skill alone, including the ones Anthropic provides and any Krish made himself.
- After the deletions, reload the page and read the list again. No name from step 1 may remain. If one does, report it.

## 3. Make the instructions field match

- Open `Settings > Profile`, then the Instructions for Claude field.
- If its text already equals the text from step 1, ignoring trailing whitespace, change nothing.
- Otherwise, replace the whole field with that text, save, reload, and read the field back. It must now equal the text.

## 4. Report

Call Control Center `record_harness_observation` once, with surface `claude-ai`:

- kind `successful_pattern` when every step passed, or `failure` when one stopped you;
- the account label from your own task prompt;
- the harness commit from step 1;
- how many skills you deleted;
- whether the instructions changed.

Never include names of people, email addresses, or text copied from the page.

## Rules that always hold

- Nothing here sends, posts or spends. Deletions happen only under the 2026-10-29 ruling above, and only for the names step 1 returned on this run.
- If the page looks different from what these steps describe, stop and report. Do not click your way around it.
- This file is the routine. The scheduled task only says to read it, so changing this file changes the routine, with no edit to the task.
