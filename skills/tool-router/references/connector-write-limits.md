# Connector write limits

What three connectors could and could not write when last used, and the safe pattern for each. Source: the Make Your Mind Up growth push session's brand sync of 18 November 2026, sent to the skill curator. Connectors change; re-check a limit against the tool's own schema before planning around it, and update this file when a limit lifts. Re-check by 2 December 2026.

This file records what each connector cannot do, and how to shape a change so Krish can decide on it. It grants no authority. Publishing, uploading, sending and deleting stay his decision under the operating contract (`authority.never-publish-post-send` and `authority.treat-any-purge-deletion`), taken on the prepared change, for that change only. Until he decides, the change stays prepared and unsent.

## Claude Design System artifacts

- A `.d.ts` file is not a served type; a prepared change gives it `contentType` `text/plain`.
- Shape a component's retirement as one move: exact copies under `project/archived/`, and the old paths set to `null`, which deletes them. Put the paths to be deleted in front of Krish by name. A change that deletes first and copies later is the wrong shape.
- In the prepared order, assets come before the index, and the index carries the blob ids and stored sizes the store returned. The store can change a file's size (an SVG was rewritten on upload), so the size comes from the upload result, not the local file.
- Prepare the whole tree first, and re-read the live index before the change is put to Krish (`verification-loop`, files and documents).

## Google Drive

- The connector can create files and change metadata, but cannot rewrite a file's contents.
- So an update to a text file takes the shape of a dated replacement beside it, with the old file's description set to "Superseded on <date> by <new name>".
- A file whose path other machines depend on is never renamed or moved.
- `create_file` accepts a file reference instead of pasted content: `sha256:<hex>:<absolute path>`, for text and binary files.
- Where a file goes is the Drive placement rule in `tools-access` and the owning repository's Drive map.
- Who may write to Drive is the canon's Claude and Codex division. A Codex browser upload is not a route around this limit.

## Canva

- Brand kit edits, font changes and page deletions are not possible through the connector.
- For those, write a stand-alone prompt Krish can give a Claude Cowork session on his computer if he chooses; when a session starts, tell him its exact name (canon). The prompt's ground rules:
  - no publish, share, export, spend or delete;
  - a backup copy before each change;
  - wait for the owner's yes after each template before the next;
  - never put the owner's name, a retired claim or a sister brand on a design.
