# Growth push findings, batch 2, 2026-11-18

Status: proposed. It takes effect when the pull request that carries it merges.

Source: the second batch of findings from the Make Your Mind Up growth push session, 18 November 2026, sent to the skill curator session Krish asked for that day. It builds on batch 1 (`docs/proposals/2026-11-18-growth-push-batch-1.md`, merged as #286) and repeats none of it. Recipient names, addresses and pitch wording stay out of this file and the skills.

Asker: Krish, 18 November 2026, for the growth push ("spin off a sub session that is constantly turning your findings, learnings and workflow experiments in to skills"). Value test: the next growth push batch makes none of these seven mistakes again; a repeat is a correction given twice and counts against the North Star.

## What changes, and where

| Finding | Owner | Change |
|---|---|---|
| B1. A researched "contact form" was a testimonial form, two were pages that only publish an email address, and one real form was drawn by JavaScript | `evidence-research` | A "Contact route" edge case: confirm each route's kind from the live page by its fields, with the cheap check (forms and labels, schema.org `email` and `mailto:`, form-builder markers). |
| B2. Email and message or form take different registers, so the channel belongs to the draft | `krish-voice`: `references/outbound-email-voice.md` and `references/humour.md` | The pitch section confirms the route before drafting. The first impression rules say the channel comes from the confirmed route, and a route change means writing it again in the other register, never trimming or adding jokes. Batch 1 already says email is Never and a first message or form leads with personality; both rulings stand as written. |
| B3. A parent session could not message its cloud child after creating it. This curator, a cloud child, then could not message its parent on Krish's computer either | `krish-build`, `references/long-running-run-safety.md` | A new "Sub-sessions and agent fan-out" section: everything the child needs goes in its first prompt; never assume messaging works in either direction; the hand-back is durable (a pull request, a committed note), with a message only as an extra; a later batch takes a fresh child, never a planned forward by Krish. The skill's routing line now names child sessions and agent fan-outs. |
| B4. A 4-core worker ran at most two workflow agents at a time | same section | Size fan-outs to the cap by grouping items per agent; keep finished stages' prompts byte-identical so resume reuses them; when a ruling changes mid-run, stop, keep unaffected prompts identical and put the new rule only in the affected stages. |
| B5. Agents on the shared worker must not read other sessions' folders | same section | Copy the evidence into the task's own folder first and point the agents there. The prohibition's home stays the machine's own instructions file. |
| B6. The worker's signed-in browser timed out on most pages in one read-only pass | `tool-router`, `references/public-read-routes.md` | A "When the signed-in browser fails" section: plan each browser task with the public route as its fallback, record an unread item as unverified, and treat a task with one as still open. |
| B7. The venture humour check cannot run on the worker, and Control Center's humour call needs an approval each time | `krish-voice`, `references/humour.md` | Under Checking: write "humour engine not run" beside the draft, never imply a pass, and apply the house rules by hand. All three rules already live in that file. |

## Refused or narrowed, and why

- **The exact concurrency formula as a fleet constant (B4).** It is the workflow runner's current setting on one machine type, and it can change. The skill keeps it as a dated observation and tells the reader to read the cap before planning, not to assume two.
- **A fleet rule against reading other sessions' folders (B5).** That rule already lives in the worker's own instructions file. Copying it into a skill would give one fact two homes, so the skill carries only the practice (copy the evidence in first) and points to the machine's file.
- **Krish's per-call approval link for the humour call (B7).** How Control Center gates that call is its own business and can change. The skill says only that the call may need his approval each time, and that "not run" must then be written down.
- **Nothing in B2 changes a ruling.** The 2026-11-10 and 2026-11-18 rulings already said what the finding asks. The only gap was what happens when a route changes after drafting, which this batch fills.

## Evidence held

Four new behaviour cases: `research-behavior-025` (contact route), `voice-behavior-043` (a route change forces a rewrite), `voice-behavior-044` (humour engine not run) and `build-behavior-033` (sub-sessions and fan-out). No `tool-router` case was added, because that file records observed runs and none has been run. The browser timeouts quoted in the public routes reference are the growth push session's own report of its read-only Codex pass on 18 November 2026, not a tool-router case.

## Judge panel advisories, first round

None blocked. Fixed: the humour Checking line points to the rules' homes instead of restating them; the shared-machine line no longer restates the folder rule its machine file owns; Krish is no longer a planned route for forwarding a batch; this file names its asker and value test.

## Judge panel, second round

- **Blocking: tool order.** The browser fallback section now restates the order `tool-router` and the operating contract set (a connected tool first, then the public route, then the browser) instead of reading as a rival rule, and says a route is only as good as its last live read.
- **One home for hand-back.** The sub-session hand-back now points to the operating contract's Session closeout route instead of restating it.
- **Freshness.** The browser observation carries the same re-check date as the routes table.
- **Not changed: no ledger row for reference files.** `brain/rules.yaml` tracks contract rules and skill chapters only; reference files are recorded through this proposal, as batch 1's were.

## Judge panel, third round

- **Blocking: unverified versus unknown.** The browser section now separates an item whose route failed (unverified, the task stays open) from an item with no route at all (unknown, as the routes file already said), so the two lines no longer contradict.
- **Blocking: provenance of reference files.** `brain/rules.yaml` says in its header that reference files sit outside the ledger and that their source lives in the commit bodies that change them. The commit that carries this round names this proposal and its sha256 as the source of every reference-file change in the batch: `skills/krish-voice/references/humour.md`, `skills/krish-voice/references/outbound-email-voice.md`, `skills/krish-build/references/long-running-run-safety.md` and `skills/tool-router/references/public-read-routes.md`. Adding ledger rows for reference files would change the ledger's design, which is not this batch's call.
- **Advisories fixed.** The humour Checking line no longer lists the rules it points to. The fan-out figures name their sources and say to re-check the cap on each machine.

## Judge panel, fourth round

- **Blocking: ghost facts in reference files.** The new reference-file rules now also sit in a ledger-tracked chapter that routes to them: `krish-voice` Reference routing names the confirmed-route register rule and "humour engine not run", and `tool-router` names what to record when a browser read fails. Those chapter rows (`krish-voice.reference-routing`, `tool-router.match-value-to-the`) take this proposal as their source, so the doctrine has a first_seen, a closing history row and a sha256 pin, as batch 1's humour rule did through the same chapter.
