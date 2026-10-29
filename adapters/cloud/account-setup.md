# Account setup: one time per claude.ai account, with Krish in the chat

Ruling (Krish, 2026-10-29): skills stay current on every surface with zero intervention, following main. Ruling (Krish, 2026-10-29): uploaded skills whose names are exactly the harness's production skills may be deleted from either account, and nothing else.

Krish runs this once in a chat in each account. After it, nothing in the account ever needs changing again:

- the account holds no copies of his harness skills;
- its Instructions for Claude field holds a fixed pointer;
- Control Center serves every skill, and the routing, live from `krishanraja/ai-harness` main.

There is no recurring job. An unattended job that deletes skills and rewrites settings is not something Claude should run on its own, so the one change is made here, with Krish present.

Assume nothing from an earlier attempt: no tab is open and no page is loaded. Do the steps in order. When a step says stop, change nothing further and go straight to step 6.

## 1. Read what the account should look like

- Call Control Center `get_skill` with name `index`. Keep the `commit` and the list of `skills[].name`. Count them and say the count. Those names are the only ones that may be deleted.
- Call `get_skill` with name `account` and file `instructions`. Keep its `text`: the fixed pointer for the instructions field.
- If Control Center is not connected, or either call fails or returns `ok: false`, stop with `control-center-unavailable`.

## 2. Get a browser

- Use your built-in browser. If its tools are not loaded, load them. If the only tool present is an `enable__` tool for the built-in browser, call that first. If there is no built-in browser, use Claude in Chrome the same way. If neither is available, stop with `no-browser`.
- Open a new tab at `https://claude.ai/customize/skills`. Never reuse a tab that was already open, and never work from whatever page a tab happens to show. If the page does not load after one reload, stop with `page-unavailable`.
- If claude.ai shows a sign-in page instead, stop with `sign-in-needed`. Never type a password, a code or an email, and never sign in or out for Krish.

## 3. Prove the browser is signed in to one of Krish's accounts

Krish may be signed in to either of his two claude.ai accounts, in either browser, on any machine. Both get exactly the same setup, so set up whichever of his accounts the browser shows. Never change an account that is not his.

- In your tab, open `https://claude.ai/settings/account` and read the email address shown as signed in.
- If Control Center offers `check_krish_account`, call it with that email.
  - `krish: true` proves the account. Keep its `account_ref`.
  - `krish: false` means stop with `not-krish-account`.
- If the tool is not offered, ask Krish to confirm, in this chat, that the account shown is his. Show him the email only in this chat. Without his confirmation, stop with `account-unproven`.
- Never copy the email into a report or anywhere else.

## 4. Show Krish exactly what will change, and wait for his yes

- Return to `https://claude.ai/customize/skills` in the same tab. Scroll to the end of the list, so that skills loaded only as the list is scrolled are read too. Read every skill name.
- A skill will be deleted only when its name exactly equals a name from step 1: whole name, same case. Every other skill stays, including the ones Anthropic provides and any Krish made himself.
- Open `Settings > Account` and read the Instructions for Claude field.
- Show Krish, in this chat:
  - the exact list of skills that match and will be deleted;
  - the list of skills that will stay;
  - the field's current text beside the fixed pointer from step 1.
- Ask for his yes to that exact change. Change nothing until he says yes. If he says no, or changes the list, do only what he approves.

## 5. Make the approved change and read it back

- Delete each approved skill one at a time with that skill's own delete control.
  - The confirmation does not name the skill, so before confirming check that the open menu belongs to that skill's own row, and that the dialog only asks to remove a skill.
  - After confirming, check that the list lost exactly that one name. If the dialog says anything else, or any other name disappears, stop with `unexpected-confirmation`.
  - If the page has no delete control where you expect one, or looks different from what is described here, stop with `page-changed`.
- Reload the skills page, scroll to the end, and read the list again. If any approved name remains, stop with `delete-not-confirmed`.
- If Krish approved the instructions change, replace the whole field with the fixed pointer, save, reload, and read it back. If it does not equal the pointer, stop with `instructions-not-confirmed`.

## 6. Report, and tidy up

- Close the tabs you opened.
- Call Control Center `record_harness_observation` once, with surface `claude-ai`:
  - kind `successful_pattern` when every step passed, or `failure` with the stop reason;
  - the `account_ref` if you have one;
  - the harness commit from step 1;
  - how many skills were deleted;
  - whether the instructions changed.
- Never include names of people, email addresses, or text copied from the page.
- Tell Krish in one line what changed. If the other account still needs setup, say so.

A setup that stops part way is safe to run again. The next run reads everything afresh and shows only what is still left.
