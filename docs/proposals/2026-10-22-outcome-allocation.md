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

## 1. An outcome map per venture

The router reads this before it suggests any creative or data work. It is ordered by the live priority ladder (`PORTFOLIO.md`), and every growth-agent rule there still applies: drafts only, no sends, no ad spend, no invented reviews, numbers or customers.

| Venture | The number that matters | Deadline | What creative or data work moves it | Best-fit tools | Hard limits |
|---|---|---|---|---|---|
| **Heartside** (P1) | One-off orders in USD, average order value | Last printed order 10 December (to be confirmed per product in Printful) | Product shots for all 11 products. Short organic clips for TikTok, Reels and Shorts in the plan's voice (`docs/V2-FROM-THE-DOG.md`, section 6). The 15-second "dog reads your review" video. "Who would your dog fire?" comment prompts | Higgsfield Marketing Studio for product shots and ads; Shorts Studio and Seedance for clips; virality check before final render; ElevenLabs for the dog's voice | Label AI-made ads as platforms require. No grief, illness or old age. No invented reviews, scarcity or "was" prices. No ad spend (Krish's action, and against Gate 4 until revenue flows) |
| **Full Time** (P1) | Pilot listeners, target 100 (one counted 2026-10-06) | None set | Social clips cut from published editions. Audiograms of each pundit. A visual identity per pundit so listeners can pick one | ElevenLabs (already voices the show); Higgsfield stills for pundit art; Higgsfield or Runway for short motion clips; Descript to cut clips | No betting, live-score or league-table framing. No Premier League mark. Rule 8 flag for Krish's own hours. Blocked in practice until editions publish again: none since 2026-09-05 per its repository |
| **Legibility** (P2) | Weekly trusted reads per active account, 7 or more | Eight-week beta kill criteria | Developer content that shows real calls and real costs. Diagrams, not cinema | Little media spend. Canva or plain diagrams | No claims of coverage it lacks. No outbound engine before a design partner |
| **Mindmake** (the mission) | A client who says the proof works and stands behind it | None set | Visuals for published thinking across the three channels. Possibly a presenter-led explainer | Higgsfield stills for article art; HeyGen only if Krish rules on founder visibility | Founder visibility is OPEN: no avatar, face or voice clone of Krish before he says yes. No price, booking link or offer ladder |
| **CTRL, Pulse** (P3) | Six measures; Pulse not for sale yet | None | Pulse weekly brief visuals at most | Minimal | No claims beyond evidence. No new price points |
| **Circle** | Dormant | None | None | None | Not worked |

The map is a proposal. Each venture's row should live where its owner can edit it: in Control Center beside `product_icp`, or in the venture's own repository. It should not live in a skill, because it changes weekly.

## 2. Unit economics per tool, not just balances

For every creative service, the economics snapshot gains the fields a decision needs:

- Balance and unit (credits, characters, minutes).
- Reset date and whether unused credits lapse.
- Cost of a typical useful output, measured from receipts. Higgsfield already shows 210 credits for a Seedance clip and 2.75 for a GPT Image still.
- Last used, and for which venture.

This work belongs in `krishanraja/control-center`, not here. The services to add first: Higgsfield, HeyGen, Runway, Canva, Descript, Riverside. Higgsfield and HeyGen already expose read-only balance endpoints through their own connectors, so a collector reads them without spending anything.

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

## 5. A weekly allocation proposal

Once a week the fleet drafts one short allocation for Krish to approve or edit:

1. Credits and allowances available, with reset dates.
2. The outcome each venture is chasing, in ladder order, with its deadline.
3. A proposed split, with a reserve held back. For the Heartside window to 10 December, most creative credits go to Heartside product shots and clips.
4. The exact first assets to make, their measured unit cost, and the number each should move.
5. Last week's result: what was made, what was published, what moved.

Nothing generates until Krish approves the allocation. Nothing publishes without its own approval.

## Decisions only Krish can make

1. **Is spending prepaid credits "spend"?** `PORTFOLIO.md` says spend is Krish's action. Proposed: generation within prepaid credits, inside an allocation he approved that week, counts as authorized. Publication, ad spend, top-ups and plan changes never do.
2. **The router rule change** in section 3.
3. **Where the outcome map lives:** Control Center (proposed) or each venture's repository.
4. **Founder visibility for HeyGen or any voice clone of Krish.** Still OPEN. Until he rules, Mindmake creative uses no face or voice of his.
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
- It does not change any approval boundary in the operating contract.

## The tool map

The map Krish marks is published as a private page: https://claude.ai/artifact/VyAyRMMBQQVPsZnwE1xtUj. It lists 73 tools by job, with route and known balance, against eight columns: Heartside, Full Time, Legibility, Mindmake outbound, makeyourmindup, CTRL, Pulse and operations. His marks are saved in the page's database (`placements`, one document per tool), where a session reads them back. The four tools he has already ruled on (Higgsfield, Runway, HeyGen, ElevenLabs) are recorded there. When he has marked the rest, the marks become the outcome map's tool column in Control Center.

One gap the map surfaced: ElevenLabs is reachable only through the Control Center gateway, and only for voice listing and allowance reads. Training a voice clone or generating speech needs a new adapter or a native connector first.
