# Connector write limits

What three connectors could and could not write when last used, and the safe pattern for each. Source: the Make Your Mind Up growth push session's brand sync of 18 November 2026, sent to the skill curator. Connectors change; re-check a limit against the tool's own schema before planning around it, and update this file when a limit lifts. Re-check by 2 December 2026.

Every write here still needs Krish's approval for that action and target, under the operating contract. Nothing in this file widens it.

## Claude Design System artifacts

- A `.d.ts` file is not a served type. Send it with `contentType` `text/plain`.
- Retiring a component is a move in one call: send exact copies under `project/archived/` and set the old paths to `null`. Never delete first and copy later.
- Upload assets first, then write their blob ids and stored sizes into the index, and send the index once, last. The store can change a file's size (an SVG was rewritten on upload), so take the size from the upload result, not from the local file.
- Plan the whole tree before the one publish, and re-read the live index first (`verification-loop`, files and documents).

## Google Drive

- The connector can create files and change metadata, but cannot rewrite a file's contents.
- To update a text file, file a dated replacement beside it and set the old file's description to "Superseded on <date> by <new name>".
- Never rename or move a file whose path other machines depend on.
- `create_file` accepts a file reference, so content need not be pasted: set the content to `sha256:<hex>:<absolute path>`. It works for text and binary uploads.
- Where the file goes is `tools-access` (rule 11) and the owning repository's Drive map.
- Who may write to Drive is the canon's Claude and Codex division. A Codex browser upload is not a route around this limit.

## Canva

- Brand kit edits, font changes and page deletions are not possible through the connector.
- For those, write a stand-alone prompt for a Claude Cowork session on Krish's computer, and tell him the session's exact name when it starts (canon). Its ground rules:
  - no publish, share, export, spend or delete;
  - a backup copy before each change;
  - wait for the owner's yes after each template before the next;
  - never put the owner's name, a retired claim or a sister brand on a design.
