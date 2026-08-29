---
name: mindmake-os
description: "Truth router into the mind/make OS architecture. Use before any structural decision about the OS: the agent fleet, Supabase schema, Control Center, n8n workflows, cron, data flows, workspace layout, standards, failure modes, or portfolio context. It carries NO architecture claims of its own; it names the authority and routes you to the right section, so it can never go stale. Also use to resolve which source wins when the business and the OS disagree. Do not use for Mindmake commercial positioning, offers or ICP (`mindmake`), final prose (`krish-voice`), channel context (`content-corpus`), or n8n mechanics (`n8n-operator`)."
---

# mind/make OS — truth router

**This file is deliberately thin. It contains no architecture facts.**

That is the design. A fact copied into this file is a fact that goes stale silently, and a
338 KB body loaded into every session is context spent on things the task did not ask for.
This file's only job is to tell you where the truth lives and how to get it.

**If you are about to paste the architecture body into this file, stop.** That has already
happened once (found at ~338 KB on 2026-08-29 and reverted to this router). Sync the real
surfaces instead, listed below.

---

## Two authorities, and which one wins

| Question | Authority |
|---|---|
| **What the business is**: positioning, the offer, pricing posture, the naming law, voice, the publication's channels, what is retired | **`github.com/krishanraja/mindmake`** → `project-documentation/00_NORTH_STAR.md`, then `01_CANON.md`, then `02_PUBLICATION.md` |
| **How the OS is built**: fleet, schema, workflows, cron, data flows, standards | **`MINDMAKER_OS_ARCHITECTURE.md`** (see paths below) |

**Canon wins on the business. The architecture doc wins on the machine.** If the
architecture doc makes a business claim that contradicts canon, canon is right and the
architecture doc is stale; fix the doc rather than working around it.

The filename is still `MINDMAKER_OS_ARCHITECTURE.md` even though the OS is now
**mind/make OS**. That is deliberate: the VPS sync scripts key off that exact name, so
renaming it means changing `sync-architecture-surfaces.py` and `sync-to-drive.py` in the
same pass.

---

## Where to read it

Nearest first. Read the section you need, not the whole file.

1. `C:\Users\krish\control-center\docs\MINDMAKER_OS_ARCHITECTURE.md` — local, fastest.
2. VPS source of truth: `/root/.openclaw/workspace/MINDMAKER_OS_ARCHITECTURE.md`
3. VPS repo clone: `/root/Projects/control-center/docs/MINDMAKER_OS_ARCHITECTURE.md`
4. VPS Claude skill: `/root/.claude/skills/mindmaker-os/SKILL.md`
5. VPS openclaw skill: `/root/.openclaw/skills/mindmaker-os/SKILL.md`
6. Google Drive, by id `1F0srFZSS-Nvg2RlUG84zVSvuiN9o8zDc`

**Paths 4 and 5 say `mindmaker-os`, and that is correct. Do not "fix" them.**
Those directory names are what `sync-architecture-surfaces.py` and
`sync-to-drive.py` key off, so they are infrastructure, not a brand. A rename
sweep rewrote them to `mindmake-os` on 2026-08-29 and pointed this router at two
paths that do not exist, which is the exact failure this file exists to prevent.
Verified against the live box: only `mindmaker-os` exists on both. The Windows
directory holding THIS file is `mindmake-os`, because it is not a sync surface
and nothing keys off it.

Read a section with a targeted `grep -n "^## "` then `sed -n 'START,ENDp'`. Do not `cat`
the whole file into context.

## Section map

| You need | Section |
|---|---|
| The whole thing in five sentences | `## 0.` Mental model |
| **Rulings that override everything below them** | `## 0a.` CANON |
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

**Read `## 0a.` and the top of `## 20.` whenever the answer looks like it might have moved.**
Those two carry the dated rulings that override older prose elsewhere in the file.

---

## Changing the architecture doc

Never edit one surface alone. The body must be byte-identical across surfaces 1 to 5.

```
sudo git -C /root/Projects/control-center stash push -- docs/MINDMAKER_OS_ARCHITECTURE.md
sudo git -C /root/Projects/control-center pull --ff-only
sudo touch /root/Projects/control-center/docs/MINDMAKER_OS_ARCHITECTURE.md
sudo python3 /root/.openclaw/workspace/scripts/sync-architecture-surfaces.py
sudo python3 /root/.openclaw/workspace/scripts/sync-to-drive.py
```

Latest mtime wins, VPS breaks ties. Skill copies keep their own frontmatter; only the body
below `---` is synced. Healthy Drive output is `failed=0`. Verify with `md5sum` on the
no-frontmatter surfaces and by checking Drive's size and `modifiedTime`.

**This Windows file is not one of those surfaces** and needs no sync, because it carries no
body.

## Related skills

`mindmake` for commercial positioning, offers and ICP. `content-corpus` for the
publication's two channels. `krish-voice` for final prose. `n8n-operator` for workflow
mechanics. `tools-access` for authenticated access. `decision-ledger` for recording a
finalised decision.

*Router rewritten 2026-08-29, replacing a 338 KB full-body copy that had overwritten the
original router.*
