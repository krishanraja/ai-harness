---
name: mindmake-os
description: "Truth router into the mind/make OS architecture. Use before any structural decision about the OS: the agent fleet, Supabase schema, Control Center, n8n workflows, cron, data flows, workspace layout, standards, failure modes, or portfolio context. It carries NO architecture claims of its own; it names the authority and routes you to the right section, so it can never go stale. Also use to resolve which source wins when the business and the OS disagree. Do not use for Mindmake commercial positioning, offers or ICP (`mindmake`), final prose (`krish-voice`), channel context (`content-corpus`), or n8n mechanics (`n8n-operator`)."
---

# mind/make OS, truth router

**This file is deliberately thin. It contains no architecture facts.**

That is the design. A fact copied into this file is a fact that goes stale silently, and a
380 KB body loaded into every session is context spent on things the task did not ask for.
This file's only job is to tell you where the truth lives and how to get it.

**If you are about to paste the architecture body into this file, stop.** That has already
happened once (found at ~338 KB on 2026-08-29 and reverted to this router).

---

## Two authorities, and which one wins

| Question | Authority |
|---|---|
| **What the business is**: positioning, the offer, pricing posture, the naming law, voice, the publication's channels, what is retired | **`github.com/krishanraja/mindmake`**, `project-documentation/00_NORTH_STAR.md`, then `01_CANON.md`, then `02_PUBLICATION.md` |
| **How the OS is built**: fleet, schema, workflows, cron, data flows, standards | **`github.com/krishanraja/control-center`**, `docs/MINDMAKE_OS_ARCHITECTURE.md` on `main` |

**Canon wins on the business. The architecture doc wins on the machine.** If the
architecture doc makes a business claim that contradicts canon, canon is right and the
architecture doc is stale; fix the doc rather than working around it.

---

## Where to read it

There is exactly one surface (ruling, Krish, 2026-09-07). Read the section you need,
not the whole file.

1. A checkout of `krishanraja/control-center`, file `docs/MINDMAKE_OS_ARCHITECTURE.md`.
   On Krish's Windows machine that is `C:\Users\krish\dev\mindmaker-os\control-center\docs\MINDMAKE_OS_ARCHITECTURE.md`;
   on the VPS it is `/root/Projects/control-center/docs/MINDMAKE_OS_ARCHITECTURE.md` after
   `git pull --ff-only`. A checkout is not a copy: it follows `main`.
2. No checkout: fetch the raw file.
   `https://raw.githubusercontent.com/krishanraja/control-center/main/docs/MINDMAKE_OS_ARCHITECTURE.md`

Read a section with a targeted `grep -n "^## "` then `sed -n 'START,ENDp'` (or fetch and
search the same way). Do not load the whole file into context.

**Retired and deleted on 2026-09-07:** the VPS workspace copy, the three VPS skill bodies,
the Google Drive mirror, and the sync scripts. If you find any of them, they are stale by
definition: delete them, never maintain them, never sync to them.

## Section map

| You need | Section |
|---|---|
| The whole thing in five sentences | `## 0.` Mental model |
| **Rulings that override everything below them** | `## 0a.` CANON, then `## 0b.` and `## 0c.` |
| What the OS is for, the objectives | `## 1.` Outcomes |
| Components and stack | `## 2.` What's in the box |
| The agents, who does what | `## 3.` The agent fleet |
| Tables, views, schema | `## 4.` Supabase |
| The dashboard and its tabs | `## 5.` Control Center |
| Claude Code workspace layout | `## 6.` Workspace architecture |
| How agents are supposed to behave | `## 7.` Agent operating contract |
| How data actually moves | `## 8.` Data flows |
| Schedules, and what each tick costs | `## 9.` Cron and scheduling |
| Drive folders | `## 10.` Google Drive |
| Ventures, domains, slugs, what is retired | `## 11.` Portfolio context |
| The rulebook | `## 12.` Standards |
| What breaks and how it self-heals | `## 13.` Failure modes |
| Where to find a thing | `## 14.` Operational lookup |
| Why something is the way it is | `## 15.` Architectural decisions |
| Paths and IDs | `## 19.` Quick reference |
| **What changed recently and why** | `## 20.` Rolling changelog |
| How to change the doc itself | `## 21.` Update protocol |

**Read the `## 0` rulings and the top of `## 20.` whenever the answer looks like it might
have moved.** Those carry the dated rulings that override older prose elsewhere in the file.

---

## Changing the architecture doc

Edit it on GitHub `main`, by PR or by direct push. That is the whole procedure. There is
nothing to sync and no other copy to update.

**The engine writes the record; people write the rulings.** Every Sunday 13:00 UTC the
Control Center cron `api/architecture/weekly.ts` writes the week's builds as one dated entry
at the top of `## 20.` and stamps `**Last engine refresh:**` in the header. The Monday
scorecard note reads that stamp back and says when it is stale. A ruling, a new agent, a
retired component or a new table is still a human edit, under `## 0a`, `## 0b`, `## 0c` or
the section it belongs to.

## Related skills

`mindmake` for commercial positioning, offers and ICP. `content-corpus` for the
publication's two channels. `krish-voice` for final prose. `n8n-operator` for workflow
mechanics. `tools-access` for authenticated access. `decision-ledger` for recording a
finalised decision.

*Router rewritten 2026-09-07 for the one-surface ruling. It carries no fact that can go
stale, so it does not need to change when the OS does.*
