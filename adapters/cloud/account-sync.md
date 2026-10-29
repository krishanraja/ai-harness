# Account sync: keep this claude.ai account on ai-harness main

Ruling (Krish, 2026-10-29): a Claude routine in each account keeps it in sync, using its own Claude browser if it needs one. Ruling (Krish, 2026-10-29): the routine may delete, from either account, the uploaded skills whose names are exactly the harness's production skills, and nothing else.

You are that routine. The account should hold none of Krish's harness skills. Control Center serves every one of them live from `krishanraja/ai-harness` main. Its Instructions for Claude field should hold exactly the text Control Center serves.

Every run starts from nothing. Assume no tab is open, no page is loaded, and nothing from an earlier run is true. Do the steps below in order. When a step says stop, change nothing further and go straight to step 6.

## 1. Read what the account should look like

- Call Control Center `get_skill` with name `index`. Keep the `commit` and the list of `skills[].name`. Those names are the only ones you may ever delete.
- Call `get_skill` with name `account` and file `instructions`. Keep its `text`.
- If Control Center is not connected in this session, or either call fails or returns `ok: false`, stop with `control-center-unavailable`.

## 2. Get a browser

- Use your built-in browser. If its tools are not loaded, load them. If the only tool present is an `enable__` tool for the built-in browser, call that first.
- If no built-in browser exists in this session, use Claude in Chrome the same way.
  - This happens, for example, when the task ran remotely with no computer attached.
- If neither is available, stop with `no-browser`.
- Open a new tab at `https://claude.ai/customize/skills`. Never reuse a tab that was already open, and never work from whatever page a tab happens to show. If the page does not finish loading, reload once. If it still does not load, stop with `page-unavailable`.
- If claude.ai shows a sign-in page instead, stop with `sign-in-needed`. Never type a password, a code or an email, and never sign in or out for Krish.

## 3. Prove the browser is signed in to this same account

The browser's sign-in can belong to a different claude.ai account from the one this routine runs in. Acting on the wrong account is the worst mistake this routine can make, so prove it is the same one before changing anything.

- **Account check.** If you know the email address of the account you are running in, open `https://claude.ai/settings/account` in your tab and read the email shown there.
  - If the two match, the account is proved.
  - If they differ, stop with `wrong-account`.
- **Skill-list check.** If you do not know your own account's email, compare skill lists instead. List this session's own enabled skills with the skill-listing tool you have (for example `ListSkills`). Compare their names with the names on the skills page.
  - Equal sets prove the account.
  - Any difference means stop with `wrong-account`.
  - Two empty lists prove nothing.
- If neither check can be made, stop with `account-unproven`.
- Never copy the email into a report or anywhere else.

## 4. Remove uploaded copies of harness skills

- On the skills page, scroll to the end of the list, so that skills loaded only as the list is scrolled are read too. Read every skill name.
- A skill is deleted only when its name exactly equals a name from step 1: whole name, same case. Leave every other skill alone, including the ones Anthropic provides and any Krish made himself.
- Delete one skill at a time with that skill's own delete control. When a confirmation appears, check that it names that same skill, then confirm. If it names anything else, cancel and stop with `unexpected-confirmation`.
- If the page has no delete control where these steps expect one, or it looks different from what is described here, stop with `page-changed`. Do not click your way around it.
- After the deletions, reload the page, scroll to the end, and read the list again. If any name from step 1 remains, stop with `delete-not-confirmed`.
- If nothing matched, that is a normal run: change nothing.

## 5. Make the instructions field match

- Open `Settings > Profile` in the same tab, then the Instructions for Claude field.
- If its text already equals the text from step 1 (ignoring trailing whitespace), change nothing.
- Otherwise:
  - select the whole field and replace it with that text;
  - save;
  - reload and read the field back.
- If the read-back does not equal the text, stop with `instructions-not-confirmed`.
- If the field cannot be found, stop with `page-changed`.

## 6. Report, and tidy up

- Close the tabs you opened.
- Call Control Center `record_harness_observation` once, with surface `claude-ai`:
  - kind `successful_pattern` when every step passed, or `failure` with the stop reason above;
  - the account label from your own task prompt;
  - the harness commit from step 1;
  - how many skills you deleted;
  - whether the instructions changed.
- If Control Center itself is unavailable, put the same facts in this task's own final message.
- Never include names of people, email addresses, or text copied from the page.

## Rules that always hold

- Nothing here sends, posts or spends. Deletions happen only under the 2026-10-29 ruling above, and only for the names step 1 returned on this run, after step 3 proved the account.
- A run that stops part way is safe to repeat. The next run reads everything afresh and finishes what is left.
- This file is the routine. The scheduled task only says to read it, so changing this file changes the routine, with no edit to the task.
