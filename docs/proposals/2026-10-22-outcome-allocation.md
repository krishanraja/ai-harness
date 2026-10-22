# Credits serve outcomes: an allocation layer for the tool router, 2026-10-22

Status: approved by Krish on 2026-10-22 (rulings below). Not yet built, active or released. Nothing has been spent.

## Rulings (Krish, 2026-10-22)

- Ruling (Krish, 2026-10-22): generation within prepaid credits, inside an allocation he approved that week, counts as authorized; publication, ad spend, top-ups and plan changes still need their own approval.
- Ruling (Krish, 2026-10-22): the router rule change in section 3 is approved.
- Ruling (Krish, 2026-10-22): the outcome map lives in Control Center.
- Ruling (Krish, 2026-10-22): Heartside takes most of the Runway and Higgsfield credits until December; Full Time also gets a share.
- Ruling (Krish, 2026-10-22): HeyGen is for training his face clone and ElevenLabs for his voice clone, both for Mindmake outbound and makeyourmindup shorts. This closes founder visibility for those two uses. Creating each clone, and publishing or sending anything made with it, is still an action-time approval, and outbound still follows Rule 2: enough richness about the person, never a generic sequence.
- Ruling (Krish, 2026-10-22): a reserve is held back each week; its size is set in the first weekly allocation.
- Next step, at his request: a map of every tool, which he marks with where he wants each one used. That marked map becomes the outcome map's tool column.

## What this moves

The North Star's second line: "the harness also lets a fleet of agents run Mindmake's daily operations to his standard." Today a session uses a tool only when a prompt happens to need one. A fleet that never proposes the work cannot run daily operations. This proposal makes the router start from each venture's measured outcome and work back to the tool, the credits and the approval.

Decision rules (`KRISH.md`, run before proposing):

- Rule 3 passes for Heartside: Christmas orders land inside 90 days. Most of the allocation goes there for that reason.
- Rule 6 passes: the proposal is shown to Krish before anything is built, and every asset it produces is made to be shown.
- Rule 8 flag: Full Time creative puts football into the work. It is in the mission by the 2026-10-06 ruling, but any step that needs Krish's own hours on football gets flagged first.
- Rule 7 is resolved by the 2026-10-06 ruling that the portfolio rolls into the mission.

## The finding, from live reads on 2026-10-22

| Fact | Source |
|---|---|
| Higgsfield: 1,413 credits, Ultra plan | `balance` |
| Higgsfield spend, 2026-10-21: four Seedance 2.5 renders at 210 credits each, 840 credits within ten seconds. No record says which venture or outcome they served | `transactions` |
| Higgsfield stills: GPT Image 2.5 Flare at 2.75 credits each, 30 or so between 2026-09-26 and 2026-10-15 | `transactions` |
| So 1,413 credits is about six Seedance clips, or about 500 stills | arithmetic on the two rows above |
| HeyGen: Creator plan, premium credits reset 2027-02-21, remaining balance not returned | `get_current_user` |
| ElevenLabs: 262,044 characters | economics snapshot, 2026-10-20 |
| The economics snapshot covers 50 services. Higgsfield, HeyGen, Runway, Canva, Descript and Riverside are not among them | `get_service_economics_snapshot`, as of 2026-10-20T08:10Z |
| The tool value catalog gives Higgsfield one generic line: "Prototype a visual direction before committing to a finished campaign asset." No venture, no unit cost, no reset date | `get_tool_value_catalog`, version 2026-10-19.3 |
| The router says "Never invent work to exhaust a subscription" and selects only when a task arrives | `candidates/tool-router/SKILL.md` |
| The router is still a candidate: `activation: false`, behaviour unmeasured | `state/candidates/tool-router.yaml` |

Not checked in this session: the Runway balance and plan, the Higgsfield credit reset date and whether unused credits are lost, and whether Heartside opened on 20 October as planned.

The diagnosis: the system knows what each tool *can* do. It does not know what each venture *needs* this week, what one useful output costs, or when an allowance lapses. Without those three facts, "use it strategically" has nothing to compute against.

## The principle

Start from the outcome, never from the credit. A credit is worth spending only when it moves a venture's measured number. A credit that sits idle while a ranked outcome needs it is waste too. Today the router only guards against the first failure. This proposal guards against both.

## 1. Where each venture's outcome comes from

Ruling (Krish, 2026-10-22): each venture's own repository is the only reference for where it is and what comes next. Its `NOW.md`, written by the docs steward and stamped with the commit it read, holds status and next steps; its `docs/NORTH_STAR.md` holds the ambition, which rarely changes. Control Center and the harness hold only pointers, placements and rulings. A session that needs a venture's number, deadline or next step reads that repository, checks the `NOW.md` head against the repository's latest commit, and treats anything older as unknown.

| Venture | Repository (status, next steps, North Star) |
|---|---|
| Heartside | `krishanraja/heartside` (marketing: `krishanraja/growth-heartside`) |
| Full Time | `krishanraja/full-time` |
| Legibility | `krishanraja/legibility` |
| Mindmake | `krishanraja/mindmake` |
| CTRL | `krishanraja/mm-ctrl` |
| Pulse | `krishanraja/fractionl-pulse` |

Heartside, Legibility and growth-heartside were not in the docs steward's fleet, so nothing kept their `NOW.md` current. They were admitted on 2026-10-22; each needs its steward caller workflow and secret before the guarantee holds there. An earlier draft of this section carried each venture's goal, deadline and plan; it was removed under this ruling because nothing kept it current.

## 2. Unit economics per tool, not just balances

For every creative service, the economics snapshot gains the fields a decision needs:

- Balance and unit (credits, characters, minutes).
- Reset date and whether unused credits lapse.
- Cost of a typical useful output, measured from receipts. Higgsfield already shows 210 credits for a Seedance clip and 2.75 for a GPT Image still.
- Last used, and for which venture.

This work belongs in `krishanraja/control-center`, not here. The services to add first: Higgsfield, HeyGen, Runway, Canva, Riverside (Descript was retired the same day, so it was dropped). Higgsfield and HeyGen already expose read-only balance endpoints through their own connectors, so a collector reads them without spending anything.

## 3. A rule change in the router

Current line in `candidates/tool-router/SKILL.md`:

> Never invent work to exhaust a subscription.

Proposed replacement:

> Never invent work to exhaust a subscription. Waste also runs the other way: when an allowance will lapse, or sits idle while a ranked venture outcome needs work it can do, propose that work. Anchor every proposal to the venture's measured number and deadline from the outcome map, name the expected credit cost from measured unit costs, and stop at a reviewable plan. Proposing is not spending, and drafting is not publishing.

A second addition, to the "Match value to the task" section:

> For creative work, explore cheaply before rendering expensively. Make stills or a storyboard first; render motion only for a concept Krish has chosen or one that has already earned attention. Run a virality or attention check before a final render when one is available, and record its credit cost.

## 4. Attribution: every spend names its outcome

The 840-credit burst on 2026-10-21 cannot be linked to any venture or result. Every generation from now on records:

- venture, outcome and asset (for example: Heartside, orders, "Annual Review poster, clip 2");
- credits spent, from the provider receipt;
- where the asset went (draft, approved, published) and the number it was meant to move.

A weekly line in the existing Sunday growth review then reads: credits spent per venture, assets published, and the venture's number over the same period. If a venture's creative has not moved its number in three weeks, the router shifts the next allocation to the next outcome on the ladder and says so.

## 5. A weekly allocation through the growth engine protocol

There is no stored outcome map. Each venture's growth engine proposes its week through Control Center's existing growth engine protocol (ADR-038): the credits it wants by tool, the assets, their measured unit cost, and the number from its own repository it expects to move. The proposal reaches Krish's one list as a walled `spend` or `strategy` item; his approval of that exact payload authorises generation within prepaid credits. The engine reports what it spent and what moved. Freshness comes from the engine doing the work reporting it, not from a summary someone has to remember to update. Nothing publishes without its own approval.

## Decisions only Krish can make

1. **Is spending prepaid credits "spend"?** `PORTFOLIO.md` says spend is Krish's action. Proposed: generation within prepaid credits, inside an allocation he approved that week, counts as authorized. Publication, ad spend, top-ups and plan changes never do.
2. **The router rule change** in section 3.
3. **Where the outcome map lives:** Control Center (proposed) or each venture's repository.
4. **Founder visibility for HeyGen or any voice clone of Krish.** Resolved 2026-10-22 for two uses only (see Rulings). This supersedes, for those uses, the open founder-visibility rule in `skills/krish-principles/references/who-krish-is.md`; updating that reference is a follow-up for its owner, `harness-maintainer`, not part of this proposal.
5. **Reserve size**, and whether Heartside takes most of the creative credits until 10 December.

## Proof before it counts

- Control Center readback shows the new creative services with balance, reset date and unit cost.
- A fresh session given "What should we make this week?" reads the map, names Heartside first with a costed plan of stills before clips, and stops at a reviewable plan without spending.
- A fresh session given "Use up my Higgsfield credits" ties every proposed asset to a venture number, or declines the rest.
- After four weeks: credits per Heartside order and per Full Time pilot listener, read from receipts and Shopify or Control Center, not estimated.

Until those pass, the record says proposed, not working.

## What this does not do

- It does not activate or release `tool-router`. The candidate's own gates still stand.
- It does not spend, publish, top up or change any plan.
- It does not touch `control-center`. Section 2 is a request for that repository.
- It narrows one approval boundary, for one case: prepaid credits inside an allocation Krish approved that week count as approved (see "How the prepaid-credit ruling relates to the existing approval rules"). It changes no other approval boundary in the operating contract.

## The tool map

The map Krish marks is published as a private page: https://claude.ai/artifact/VyAyRMMBQQVPsZnwE1xtUj. It lists 73 tools by job, with route and known balance, against eight columns: Heartside, Full Time, Legibility, Mindmake outbound, makeyourmindup, CTRL, Pulse and operations. His marks are saved in the page's database (`placements`, one document per tool), where a session reads them back. The four tools he has already ruled on (Higgsfield, Runway, HeyGen, ElevenLabs) are recorded there. When he has marked the rest, the marks become the outcome map's tool column in Control Center.

One gap the map surfaced: ElevenLabs is reachable only through the Control Center gateway, and only for voice listing and allowance reads. Training a voice clone or generating speech needs a new adapter or a native connector first.

## Krish's placements, read back 2026-10-22

Read from the map's `placements` collection after Krish said he was done. Main takes most of a tool's allowance; Some takes a share.

| Tool | Main | Some |
|---|---|---|
| Higgsfield | Heartside | Full Time |
| Runway | Heartside | Full Time |
| HeyGen (face clone) | Mindmake outbound, makeyourmindup | |
| ElevenLabs (voice clone) | Mindmake outbound, makeyourmindup | |
| Canva | Full Time, Legibility, Mindmake outbound, makeyourmindup | |
| Teleprompter | Mindmake outbound, makeyourmindup | |
| Brandfetch | Mindmake outbound, makeyourmindup | |
| NewsAPI | Mindmake outbound, makeyourmindup | |
| Apify | Legibility, Mindmake outbound, makeyourmindup, CTRL, Pulse | |
| 21st Dev | Legibility, CTRL, operations | Heartside, Full Time |
| API-Football | Full Time | |
| football-data.org | Full Time | |

- Ruling (Krish, 2026-10-22): Fireflies and Descript are removed permanently, from the harness and from his Claude. They are retired routes in the cloud account adapter and are gone from the map.
- Ruling (Krish, 2026-10-22): a tool he has not placed stays usable, and is suggested proactively only when a concrete idea gives a good reason to use it.

Both rulings and the approved section 3 rule change are now in `candidates/tool-router/SKILL.md`. The candidate's installed copies on the cloud surfaces predate this edit and need a fresh upload before they carry it.

Removal outside this repository, closed the same day: Krish disconnected the Fireflies and Descript connectors from his accounts and cancelled the Fireflies subscription. krishanraja/control-center#525 removed Fireflies from the tool value catalog, listed both as retired routes, and retired Fireflies in the service registry (row kept for charge matching; Descript had no row). With his approval the Fireflies key was deleted from Control Center's Vercel settings and read back as gone. This supersedes every earlier statement here that Fireflies is still listed.

Football data (API-Football, football-data.org) is placed on Full Time, which is in the mission by the 2026-10-06 ruling; Rule 8's flag still applies to any step that needs Krish's own hours on football.

## First weekly allocation, 22 to 28 October (history, not status)

- Ruling (Krish, 2026-10-22): the first weekly allocation is approved: up to 773 of 1,413 Higgsfield credits, Heartside first, with the two video clips gated on his concept picks and 640 credits held in reserve.
- Ruling (Krish, 2026-10-22): growth-heartside may record prepaid credits inside an approved allocation as no new money (krishanraja/growth-heartside#12).
- Done the same day: 40 Heartside stills (8 home moments × 5 breeds, dog and room only) on `gpt_image_2_5` at high quality, 2k, 9:16. Higgsfield's transaction log shows 40 charges of 2.75 credits, 110 in total, matching the reservation and receipts recorded in the engine. The Full Time stills were held back, because Krish is improving Full Time's product before inviting testers.
- Booked: HeyGen face and voice clone recording, 23 October, 10:00 to 10:30 London.

- Ruling (Krish, 2026-10-22): this work builds the system; a venture's creative execution belongs to that venture's own engine or repository (for Heartside, `krishanraja/growth-heartside`). The 40 stills made in this session are recorded in Higgsfield and handed to growth-heartside as mocks; further Heartside production happens there. The tool router now says that allocation is not production.

### How the prepaid-credit ruling relates to the existing approval rules

The 2026-10-22 prepaid-credit ruling narrows the general approval rule (`authority`: anything that spends needs explicit approval immediately before the action) for one case only: generation paid from credits already bought, inside a weekly allocation Krish approved that week, within that allocation's credit limit. The weekly approval is the explicit approval; it names the provider, the credits and the work. Everything else keeps its gate unchanged: any request that spends new money (a top-up, a plan change, an overage, a paid gateway operation through Control Center's `prepare_*` and `execute_api_operation`), and every publication, post or send. A session that cannot point to the approved allocation and its remaining credits has no authority under this ruling.
