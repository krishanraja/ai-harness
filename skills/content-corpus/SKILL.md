---
name: content-corpus
description: "The channel corpus. Companion to krish-voice. krish-voice is HOW Krish writes (voice mechanics, kill list, sentence shapes). This is WHAT each channel is for, who it serves, and the bar it has to clear. Load this alongside krish-voice before producing for any named channel (Techonomic, The Builder Economy, Signal & Noise, Mindmaker Live), any outbound to a lead or visibility target, or any Maven sales copy (Lightning Lessons, workshops, the cohort). Triggers: 'write for Techonomic', 'Builder Economy post/episode', 'Signal & Noise script', 'Mindmaker Live digest', 'draft the lead email', 'visibility outreach', 'write Maven copy', 'Lightning Lesson copy', 'workshop page', 'cohort page', 'course landing copy', 'name this course/cohort/workshop', 'what should this channel say', 'which channel does this belong to'. Do NOT produce channel content or Maven sales copy without consulting both this file and krish-voice."
---

# Content Corpus: The Channels

## What this is

`krish-voice` is the voice. This is the map of where the voice goes.

The voice skill makes any sentence sound like Krish. It does not tell you what a Techonomic essay is *for*, why a Builder Economy episode opens differently from a Signal & Noise one, or what "kind" means when the house style is spiky. That is this file's job.

Always load both. Voice is the *how*. This is the *what, who, and how-good*. If the two ever appear to conflict, the kill list in `krish-voice` wins on mechanics (no em dashes, dropped pronouns, hard verdicts) and this file wins on channel mandate (who you're serving, what shape the piece takes, what bar it clears).

**The whole point of this corpus:** stop the fleet from producing four flavours of the same generic AI post with a different logo on top. Each channel is a different instrument. Same hand, different instrument.

---

## The Five Standards (every channel, no exceptions)

Krish asked for content that is **undeniably unique, well-researched, thoughtful, kind, and helpful.** Those aren't vibes. They're a gate. Run every piece against all five before it ships.

### 1. Undeniably unique
The test: could anyone else in Krish's peer group have produced this, given the same news cycle? If yes, it failed. Uniqueness has three sources, in order of strength:

1. **Builder-operator artifact.** A thing Krish built, shipped, watched break, or observed from inside Mindmaker OS, a client session, a deal, a pricing experiment. This is unclone-able by definition, nobody else has the artifact. Reach here first, always.
2. **Listening specificity.** The other person's actual phrase used back at them. A guest's offhand line that becomes the episode frame. A prospect's word ("advertising tax") that becomes the email's spine. Signals real attention, not outreach at scale.
3. **Research specificity.** Real numbers, named companies, dated events. Table stakes, it makes a piece credible, not unique. Necessary, never sufficient. If a piece leans *only* on research, it's commentary, and commentary competes with the whole timeline.

If a draft sources only from "a thing I read," flag it and push back toward an artifact. (See `krish-voice` → Builder-Operator Evidence.)

### 2. Well-researched
Specific beats vague, sourced beats asserted, dated beats timeless-sounding.

- Every number is either cited (real study, real filing, real dashboard) or owned as lived experience ("from the P&Ls I've run, headcount is 60-70% of OPEX"). Never "studies show" without a study. **Never invent a number, outcome, or quote**, flag the gap instead.
- Before publishing a claim about what a company *did*, check it happened and when. The internet remembers wrong dates.
- For anything market-moving or contestable, verify against a primary source, not a summary of a summary. Use the research tools available (Perplexity, web search/fetch), don't write from memory on fast-moving AI facts.
- "Well-researched" is not "more citations." It's *the right* citation: the one that makes a skeptic stop arguing.

### 3. Thoughtful
The reader should hit at least one "I never thought of it that way." Thoughtfulness is the *second-order* move, past the obvious take to the one underneath it.

- Map the board before picking a side. Acknowledge the strongest counter-argument, then show why the take still holds. (krish-voice: "Counterpoint to myself.")
- Name the mechanism, not the trend. "The identity collapse," not "the cookie apocalypse."
- Discard the lazy version out loud before stating yours. The "Not X, Y" move. The reader feels the work.

### 4. Kind
This is the standard most likely to be misread, so be precise. **Kind is not soft.** The house style stays spiky. Kindness is *where* the spike points.

- **Warm with people, critical of ideas.** Argue against the *position*, never the person holding it. Steelman before you dismantle. Make the antagonist mildly defensive by being *right*, not by being cruel.
- **No cheap shots, no strawmen, no dunking.** A reader who holds the view you're arguing against should finish feeling understood, then challenged, not mocked.
- **Generous with credit.** Use a guest's or source's actual phrasing and attribute it. Borrowed conviction, returned with interest.
- **Assume the reader is smart and busy.** Compression *is* a kindness, it respects their time. Condescension (over-explaining, "let me break this down for you") is the opposite of kind.
- The antagonist archetypes in `krish-voice` (the vendor-class hype merchant, the framework consultant) are *roles to argue against*, never real named people to humiliate. Punch at the pattern, not the person.

### 5. Helpful
The reader leaves with something they can *use*, a frame, a decision rule, a question to take into their next meeting, a mechanism that makes a messy thing legible. A piece that's sharp but leaves nothing in the reader's hands is entertainment, not help.

- End on a verdict the reader can act on or repeat, not a summary.
- The dinner-table test (from krish-voice): can the reader retell this tonight? If they can retell it, they can use it.
- Helpful ≠ how-to listicle. The help can be a *reframe* that changes how they see something they already deal with.

**The gate:** if a piece fails any one of the five, it does not ship. Most AI-default content fails #1 and #4 simultaneously, generic *and* subtly mean (dunking is the laziest way to sound sharp). Watch those two hardest.

---

## How a piece gets built (the pipeline, per channel)

This mirrors the OS content flow (Zara signal → Cleo draft → Agatha approval → Krish). For any single piece, the sequence is the same regardless of channel:

1. **Source the artifact.** What is this piece *from*? (Standard #1.) Prefer internal.
2. **Find the channel.** Which instrument? The mandate, audience, and shape change everything downstream. Use the router below.
3. **Extract the angle.** One arguable sentence. (krish-voice → Step 1.) The channel decides what *kind* of angle: Techonomic wants a question, Signal & Noise wants a fight, Builder Economy wants a human truth, Mindmaker Live wants a "so-what."
4. **Pick the format** from the channel playbook (not a generic intro-body-conclusion).
5. **Draft in voice** (krish-voice → Step 3).
6. **Run the Five Standards gate + the krish-voice kill list.**
7. **Deliver** in the channel's delivery shape.

---

## Channel Router (which instrument is this?)

Decide before drafting. If a signal could fit two channels, it usually wants a *different angle* in each, not the same words reposted.

| If the impulse is to… | …the channel is | Gear | Length / form |
|---|---|---|---|
| Follow the money on a digital-economy shift and ask the question everyone assumes answered | **Techonomic** | A (essay) | 600–1,000w essay |
| Sit a builder down and find the *why beneath the why* | **The Builder Economy** | B (scrappy) | Podcast convo + IG cutdowns |
| Stress-test a piece of conventional AI/media wisdom out loud, with a foil | **Signal & Noise** | B (dialogic) | Audio script, two voices |
| Tell a busy exec the 3 things that changed this week and why they matter | **Mindmaker Live** | A (teaching) | Weekly digest, fixed sections |
| Move a deal, a guest, a talk, or a relationship forward | **Outbound** (Lead / Visibility) | depends on recipient | Email / DM, as short as possible |
| Sell a Maven course, workshop, or free lesson (the one channel where selling is the job) | **Maven Sales Surface** | A (operator) | Paste-ready Maven fields, hard char limits |

A note on overlap with personal-brand LinkedIn/X: those remain Cleo's distribution targets per krish-voice's format table. A Techonomic essay *spawns* a LinkedIn cutdown; it isn't written *as* one. Long-form is the asset, social is the trailer.

---

# CHANNEL PLAYBOOKS

Each playbook is self-contained. Read the one you're producing for, plus the Five Standards, plus krish-voice.

---

## 1. Techonomic (techonomic.co)

**One-line mandate.** Techonomic investigates how the digital world gets *paid for*. The economics of attention, content, distribution, and access as the old stack reshapes, and who funds the open web when the funding model breaks.

**Stance.** Interrogative, exploratory, investigative. This is the channel that *asks the question others assume is already answered*, then follows the money to a real answer. Not hot takes. Not predictions dressed as certainty. An investigation with a point of view.

**Audience.** Operators, founders, publisher/media commercial leaders, and the AI-curious strategic class. People who can do something with an economic insight. They are smart and time-poor; the slower essay open is permitted *because* the payoff is depth they can't get from a thread.

**The characteristic question.** "Who pays for this, and what happens to that when [shift] lands?" Every Techonomic piece is, underneath, a money question. Attention is money. Distribution is money. Access is money. Trace it.

**Posture (from krish-voice, load-bearing here).** Curiosity and optimism about *what monetisation looks like next*, NOT a rearguard defence of identity infrastructure, NOT cookie-deprecation doom. AdFixus is evidence inside a piece, never the lens. Never frame a Techonomic essay around cookie mechanics / Safari addressability / CAPI as the *subject*. The subject is always the broader economic question.

**Format & length.** 600–1,000 words. Essay voice. Gear A. Built for durability and SEO, it should still read well in a year and rank for the question it answers.

**Structure that fits.** The Mechanism, the Longitudinal Take, the Inflection Point, or the Inversion (krish-voice → Step 2). Techonomic earns a slower open: a structural framing, a historical arc, or a named mechanism. The essay *investigates*, it can hold a "counterpoint to myself" section and a mid-piece pivot. It should not feel like it knew the answer before it started, even though the angle is committed.

**Opening move.** Structural framing or a sharp historical inversion. *"Publishers optimised for scale at the exact moment scale stopped being a moat."* Never "As AI evolves…"

**Closing move.** A hard, forward-looking verdict that reframes the question, and ideally hands the reader a lens they'll reuse. Not a summary. Not "time will tell."

**Antagonist (pick one per piece).** The optimising publisher (better yield on a collapsing foundation). The AI-skeptic commentator who writes elegant doom from the outside. The platform that's monetising a behaviour it pretends is a community.

**Source artifact.** Strongest: a pattern Krish has seen across client/commercial conversations, or a monetisation experiment inside the portfolio. Acceptable: a well-researched market shift, *if* paired with an operator's read nobody else has.

**Commercial mechanic.** Personal-brand long-horizon credibility + AdFixus (open-internet monetisation) + Meliora (incumbent GTM redesign). Never a CTA, the credibility *is* the mechanic.

**Uniqueness lever for this channel.** Most writing about the digital economy is either doom (the skeptics) or boosterism (the vendors). Techonomic's unclone-able lane is the *operator's investigation*: someone who has run the P&Ls asking the money question with genuine curiosity instead of a thesis to sell. Protect the curiosity. The moment it reads like a position paper, it's lost.

**Kind/helpful check for this channel.** Investigative ≠ accusatory. Follow the money without assuming bad faith, incentives, not villains. Helpful = the reader walks away able to ask the same money question about *their* corner of the digital world.

**Worked angle (illustration, not a template).**
*Question:* Who actually pays for AI search answers when the click, the thing that funded the open web, stops happening? *Investigation:* trace the value that used to flow publisher-ward through a click, and where it pools now. *Verdict:* names the new mechanism, not "the end of SEO."

---

## 2. The Builder Economy (thebuildereconomy.com, Podcast + Instagram)

**One-line mandate.** The builder economy is the creator economy's sequel: just as anyone could *broadcast*, now anyone can *build* with AI. The channel celebrates and interrogates the people doing it, and digs past what they built to *why they really built it*.

**Stance.** Inspiring, fun, zany, generous. The most *human* of the channels. Where Techonomic follows the money and Signal & Noise picks the fight, Builder Economy finds the *person*. The signature move: **the why beneath the why.** A builder says "I built it to save time." The real answer is underneath, fear, obsession, a thing they couldn't stop thinking about, a problem that was personal. Get there, kindly.

**Audience.** Builders, would-be builders, creators crossing into building, the AI-curious who want permission and momentum. They come for energy and a sense that *they could do this too*. Inspiration is the product; the thesis is the spine.

**The characteristic move.** Layered "why." Surface why → strategic why → human why. Three turns of the screw, asked warmly, never as a gotcha. The guest should feel *seen*, not interrogated.

**Format.** Long-form conversation (podcast), cut down into Instagram clips/carousels/Reels. The daily Instagram cron is the distribution arm. Each episode is a quarry; the social cuts are what most people actually see, so the *moments* (the line where the guest's real why lands) are the deliverable, not just the full convo.

**Register.** Gear B. Scrappy, fast, momentum-driven. Dry British humour, self-aware, irreverent, willing to be a bit zany. "I jest, but…" "No one knows anything anymore, which, honestly, levels the playing field." Self-deprecation welcome. This is the channel where Krish is most *fun*.

**Opening move (episode).** Drop into the person or the build, not the CV. Not "today's guest is the founder of…", start with the *thing*: the weird origin, the 2am decision, the build that shouldn't have worked. (Mirrors krish-voice: open with the scene, never the context.)

**Opening move (IG cut).** The single most retellable line from the episode, on screen in the first second. The dinner-table test, weaponised for the scroll.

**Closing move.** Momentum, not a bow. Send the listener off *wanting to build something*. The inspiration has to convert to a feeling of "I could start tonight."

**Antagonist (soft, for this channel).** The gatekeeper who says you need permission/credentials/a team to build. The cynic who calls the builder economy a fad. Argue against the *gate*, never against any builder, even a clumsy one. This is the kindest channel; keep the spike pointed at the gate.

**Source artifact.** The guest's own story is the artifact. Plus Krish's builder-operator reality (Mindmaker OS, the agent fleet) as the credible mirror, he's not interviewing from outside, he builds too. That parity is the magic; it makes the conversation a peer exchange, not a journalist's interview.

**Commercial mechanic.** Personal-brand distribution + the builder-economy thesis that underwrites Mindmaker's whole worldview (anyone will build → AI literacy is survival → Mindmaker). Indirect, always. Never sell on this channel; the inspiration *is* the sell.

**Uniqueness lever.** Builder-to-builder, not host-to-subject. The "why beneath the why" only works because Krish has his own why and can trade it. Most builder podcasts stay on the surface ("walk me through your stack"). The unclone-able move is the third turn of the why, reached through genuine warmth.

**Kind/helpful check.** This is where kindness is easiest and most essential. Helpful = the listener leaves with permission *and* a real mechanic (how the guest actually started, the first ugly version). Inspiration without a usable handhold is a sugar high. Give them the handhold.

**Worked angle (illustration).**
*Surface why:* "I built a scheduling agent to save admin time." *Strategic why:* "…because admin was eating the part of the job I actually love." *Human why:* "…I'd watched my dad lose the craft to the paperwork." That third turn is the episode. That's the IG cut.

---

## 3. Signal & Noise (podcast, with Rio Longacre + Brett House)

**One-line mandate.** Cut the noise out of the AI-in-media conversation. No-BS, spiky, devil's-advocate, what-if. The channel that says the thing everyone's thinking but the conference panel won't.

**Stance.** Adversarial-by-design. Where Builder Economy is warm, Signal & Noise is *combative, toward ideas.* It stress-tests conventional wisdom in real time, with a co-host as foil. The energy is two smart people who disagree well and like each other. Devil's advocate is the default setting; "what-if" is the engine.

**Audience.** Media/adtech/AI insiders who are sick of hype and sick of doom in equal measure. They can smell BS and they reward the host who names it first. They want the argument they're not allowed to have at work.

**The characteristic moves.** (1) **The no-BS call**, name the emperor's nudity plainly. (2) **Devil's advocate**, take the unpopular side *on purpose* to see if it holds. (3) **What-if**, push a current trend to its absurd or revealing conclusion. "What if this is exactly backwards?" "What if the thing everyone's scared of is the boring part?"

**Format.** Dialogic script. Written as if arguing with a co-host (Rio, Brett). Different sentence rhythm from the solo channels, call-and-response, interruption, build-and-counter. Gear B. Built for audio: it has to *sound* like a real argument, not two monologues taking turns.

**Opening move.** Drop mid-fight. Open on the spiky claim or the contrarian question, already in motion. No "welcome back to the show." The listener should feel they walked in on a debate already getting good.

**Closing move.** Not resolution, *clarity about the disagreement.* The best episodes don't tie a bow; they leave the listener with a sharper version of the question and a side they can now defend. A hard verdict from Krish is allowed, but the channel tolerates an honest unresolved tension better than the others.

**Antagonist.** The whole hype/doom binary. The vendor-class AI hype merchant on one flank, the elegant-from-the-outside AI-skeptic on the other. Signal & Noise lives in the messy, true middle and shoots both ways. Steelman both, then find the third thing that's actually going on.

**Source artifact.** Krish's from-inside-the-machine read (he ships agents, runs the fleet) as the BS-detector. The co-hosts bring their own. The friction between three informed views *is* the artifact, it's not researchable, it's lived.

**Commercial mechanic.** Personal-brand credibility + Meliora (AI-native media commercial models) + Mindmaker (the practitioner voice vs. the hype). Never a CTA on-air.

**Uniqueness lever.** Spiky is cheap; *spiky and right* is rare, and *spiky, right, and kind to the people while brutal to the ideas* is the unclone-able combination. Plenty of podcasts are contrarian for engagement. Signal & Noise is contrarian because the consensus is actually wrong, and it can show its work from inside production systems.

**Kind/helpful check (the hard one for this channel).** Spiky is the house style; cruelty is still banned. Devil's-advocate the *idea*, never sneer at the *people* who hold it. The "what-if" must illuminate, not just provoke, a what-if that's only edgy is noise, which is literally the thing the show is against. Helpful = the listener can now tell signal from noise *themselves* on the next hype cycle. That's the whole promise in the name.

**Worked angle (illustration).**
*Consensus:* "AI will let media companies do more with smaller teams." *Devil's advocate:* "What if it does the opposite, what if the teams that win *add* humans to ride the AI, and the cutters hollow out?" *Where it lands:* not a prediction, a lens for spotting which media orgs are actually building leverage vs. just cutting cost and calling it strategy.

---

## 4. Mindmaker Live (weekly "what changed and why it matters")

**One-line mandate.** The weekly briefing that keeps a busy executive AI-fluent without making them do the reading. Three buckets, **Headlines, Resources, Perspectives**, each answering one question: *what changed this week, and why does it matter to you?*

**Stance.** Teaching, oriented, generous. Not interrogative (Techonomic), not combative (Signal & Noise), not inspirational (Builder Economy), *orienting*. The trusted, well-read friend who already filtered the week so you don't have to. Calm authority. The value is *curation + the so-what*, not hot takes.

**Audience.** Senior enterprise leaders, the Mindmaker ICP. AI-fluent-executive aspirants. Time-poor, accountable, allergic to both hype and homework. They pay (in attention or money) for someone trustworthy to tell them what's load-bearing this week. This is the most directly **Mindmaker-commercial** channel: it *is* the AI-literacy positioning in motion.

**The fixed structure (this channel has one, keep it).**

- **Headlines**, what actually happened this week that a leader needs to know. 3–5 items max. Each: *what happened* (one line, dated, sourced) → *why it matters* (the operator's so-what, not the press-release summary). Ruthless filter: if it doesn't change a decision, it's not a headline.
- **Resources**, 1–3 things worth their time. A tool, a paper, a framework, a doc. Each: *what it is* → *who it's for / when to reach for it.* Honest about limits, a resource recommended with its caveats is more trustworthy than a rave.
- **Perspectives**, 1–2 shifts in how to *think* about something, not just what happened. The reframe layer. Where Krish's actual POV lives. This is the section that makes it Mindmaker Live and not an RSS digest.

**Format & length.** Weekly. Teaching voice, Gear A. Tighter than an essay, scannable, sectioned, every item earning its slot. No dumbing down (krish-voice: accessible entry, enterprise audience). Could be written digest, video/live, or both; structure holds either way.

**Opening move.** Orient fast. The one thing that mattered most this week, up top, in a sentence, then the sections. No "welcome to this week's edition."

**The "why it matters" rule (load-bearing).** Every single item carries a so-what in *operator* language. "OpenAI shipped X" is a headline anyone can copy. "OpenAI shipped X, which means the build-vs-buy math on [Y] just flipped for any team that was waiting" is Mindmaker Live. The so-what is the entire product. No item ships without one.

**Closing move.** A single forward orientation, what to watch next week, or the one move worth making now. A verdict-flavoured nudge, not a summary of what was just listed.

**Antagonist.** The firehose itself, the noise that makes leaders feel behind. The breathless AI-newsletter that lists everything and prioritises nothing. The enterprise AI-literacy *theatre* that signs the contract and changes no behaviour. Mindmaker Live is the antidote: signal, prioritised, with a so-what.

**Source artifact.** The week's real news (well-researched, dated, sourced, Standard #2 is strictest here) *filtered through* Krish's operator judgment about what's load-bearing. The curation *is* the artifact. Anyone can list ten things; the value is the eight he left out and the reason the two survivors matter.

**Commercial mechanic.** Mindmaker, most directly. This channel *is* the AI-Fluent-Executive positioning enacted weekly. It demonstrates the product (clarity, judgment, literacy) rather than describing it. The implicit CTA is "imagine this judgment applied to *your* org", never stated.

**Uniqueness lever.** Curation judgment is the moat. Aggregators are infinite and free; *trusted prioritisation with an operator's so-what* is scarce. The unclone-able part is the *why-it-matters* line on each item, that's where the 16 years and the production-fleet reality show up. A competitor can copy the three buckets; they can't copy the judgment about what goes in them.

**Kind/helpful check.** This is the most straightforwardly *helpful* channel, usefulness is the entire format. Kind = honest about uncertainty ("nobody knows if this sticks, but here's why it's worth watching"), generous with resources and credit, never fear-mongering to drive urgency. Helpful = the leader walks into Monday genuinely oriented, not more anxious.

**Worked structure (illustration).**
> **This week:** the one that mattered, in a sentence.
> **Headlines**, 3 dated items, each with a flipped-decision so-what.
> **Resources**, 2 picks with who-it's-for and caveats.
> **Perspectives**, 1 reframe: the way to think about [theme] that the headlines don't surface.
> **Watch next week:** one thing.

---

## 5. The Maven Sales Surface (maven.com/mindmaker)

**This channel is different in kind from the four above, so read this header before the playbook.** Techonomic, Builder Economy, Signal & Noise, and Mindmaker Live are editorial: their rule is never sell, the credibility is the mechanic. This one is the opposite. The Maven surface (the free Lightning Lessons, the six $599 workshops, the cohort) is direct-response sales copy. It exists to convert a browsing leader into a buyer. It is the one place where selling is the job, not a violation. Everything else in this corpus still applies (the Five Standards, the kill list, the voice), but the "never sell" cross-channel rule is explicitly suspended here. This playbook was derived the hard way across a long sales-copy session; it captures what was learned so the next pass does not relearn it from scratch.

**One-line mandate.** Make a senior leader scanning a long list of "AI for executives" courses stop, understand the value in one read, and buy. Legibility first, cleverness second. If a cold browser cannot tell what they get in a second, the copy has failed regardless of how sharp it is.

**The buyer: the Accountable Delegator.** Senior commercial leader who has been made accountable for AI, talks the talk fluently in the room, and privately cannot do it. Treats a leadership problem as a tooling problem. Real driver is fear of exposure, the moment the gap shows in front of a board or their own team. The durable commercial profile is owned by `mindmaker`, section 3.1. Apply this buyer **implicitly**: speak to the feeling, never name the archetype, never call them a beginner, name the impostor feeling as accurate rather than reassuring it away.

**The expensed-buyer constraint (load-bearing, governs the whole register).** This is bought by a business for an employee. So the existential stakes that sit under Mindmaker's worldview (these are the moves that stop you being made redundant by the shift) stay in the engine and never on the surface. No survival framing, no extinction language, no fear as the hook. The register is professional and aspirational: agency, design, leading at a higher level because AI now carries the operational load. Nobody expenses fear. The moment a headline, a course name, or a hero leans on doom, it has broken this rule. This single constraint is why most "clever" angles for this surface fail.

**The proof move (the spine of every piece): "I do this, watch."** This is the differentiator against the entire category. The regular AI consultant sells a deck and a roadmap and never builds. The regular AI educator teaches frameworks they read about, plus tutorials, plus a certificate. Krish runs a real agent fleet in production and sells the reps, not the slides. So the copy is always "I do this, watch," never "here is what you should consider." Every claim earns its place by being a thing he actually runs: the live fleet, the bills, the failures (an agent that nuked a production database, a platform update that broke 95 nodes overnight, an agent rebuilt three times before it earned its keep). The receipts are the moat. Reach for them before any borrowed stat.

**Stance.** Sharp, dry, confident senior operator telling a peer how it actually works. Done the thing, not theorising. Funny with teeth, but see the wit rule below. Never a hype merchant, never a coach.

**The wit rule, applied here (this is the sales-copy expression of the "kind" standard).** The spike points at the tool, the hype, the vendor, the AI, and never at the reader, because on this surface the reader is the buyer who already fears the exact gap you might be tempted to poke. "Your AI has the memory of a goldfish" lands (points at the tool). Anything that points at the leader's competence fails. And the over-correction trap is live here too: avoiding the put-down does not mean ending every line on a hug. Sharp and dry, just never punching down. (Full rule in `krish-voice`, Calibration.)

**The promise ladder (the spine of the offer architecture, keep it honest).** The three tiers escalate by proximity and guarantee, never by withholding content:
- **Free Lightning Lesson:** the map, the framework, the homework. No personal build or feedback (honest at hundreds to thousands of attendees).
- **Workshop ($599, capped 30):** you are guaranteed to ship your first build, within a four-week async check-in window. For vibe coding specifically the deliverable is a first prototype plus a team adoption plan, not a production tool.
- **Cohort ($2,500, 8 weeks):** outcome-guaranteed. Target agreed in week 1; $2,500 of value banked or Krish keeps working past week 8.
Never sell the ladder by making the free tier deliberately weak. It escalates on guarantee and proximity, not on hiding the good stuff.

**The naming aesthetic (paid for in blood; apply to every course, lesson, and workshop title).** A title has to do two things at once: be instantly legible to a cold browser, and break the pattern of the category. Both are required. What fails: generic category titles ("Future-Proof Yourself," "The AI-Fluent Executive") that vanish into the list; clever-but-opaque coinages and abstractions ("Unautomatable," "Design Your Leadership") that a scanning buyer cannot decode or that read as the wrong category entirely. For an AI product, the words "AI" and the role ("leader," "executive," "operator") generally need to be explicit, because a browser will not infer them. No made-up words. No doom. Say the value plainly, then make it sharp. If a name needs a subtitle to explain itself, the name is not done.

**Format and field discipline.** Maven has hard per-field character limits (title, hero, the six key outcomes at 80 chars with three 140-char details each, agenda, personas, FAQ, syllabus modules). Spaces count. Measure the limits from the live page before writing, never guess, and validate every field programmatically before delivery. The copy is paste-ready only if every field is inside its budget. The syllabus follows Maven's module structure: outcome-led module descriptions, then lessons, projects, and the live event inside each module, on the "I do, we do, you do" arc.

**Opening move.** The hero leads with the buyer's real situation made legible, not a clever line. "Run the honest maths on your calendar and most of it is automatable. That is not a threat, it is a timetable." Concrete, plain, then sharp. Never "As AI evolves" and never a riddle.

**Closing move (per offer).** A guarantee, stated plainly. The guarantee is the close. Proximity plus a promise the buyer can hold, not a scarcity trick or a fake deadline.

**Antagonist.** The AI-literacy theatre that signs the contract and changes no behaviour. The consultant who sells the deck. The educator teaching frameworks they have only read. The vendor hype. Argue against the pattern, never a named person.

**Source artifact.** Mindmaker OS in production, full stop. The live fleet, the real bills, the real failures. This surface is unclone-able for exactly one reason: nobody else in the category is actually running the thing they teach. Protect that. The moment the copy could have been written by someone who has not built it, it has failed.

**Commercial mechanic.** Mindmaker, directly. This is the only channel where the sell is explicit. The ladder is the mechanic: free feeds workshop feeds cohort feeds the enterprise offers.

**Uniqueness lever.** The production receipts plus the operator's register. Every competitor can claim "hands-on" and "practical." Only Krish can open the live dashboard and show the bills and the scars. The unclone-able move on this surface is the specific, dated, real artifact in place of the generic promise.

**Kind/helpful check.** Kind = never poke the buyer's competence, never manufacture urgency, name the impostor feeling as real rather than papering over it. Helpful = the buyer can tell exactly what they walk out with (a built thing, an outcome, a guarantee), not a vague "transformation." The dinner-table test still applies: a leader should be able to tell a peer what this course gives them in one sentence.

**Worked angle (illustration, not a template).**
*The trap:* naming the cohort something clever like "Unautomatable" or "Design Your Leadership." *Why it fails:* coinage is not instantly legible to a cold browser, and "Design Your Leadership" reads as an art course with no AI in it. *The fix:* a name that says AI and role in plain words and breaks the category by naming the actual benefit (leading at a higher level because AI carries the rest), with the existential stakes left in the engine, never on the tin.

---

# OUTBOUND: Leads & Visibility (functional correspondence)


All leads and all visibility opportunities are communicated **in Krish's voice**, this is non-negotiable and already wired into the OS (Cleo Email Draft, Nell outbound, Nova visibility all load `krish-voice` before composing). This corpus adds the *channel intent* on top of the voice mechanics. For all the mechanics, dropped pronouns, "Sending this over," "Sounds good?", the kill list, mirroring their language, see `krish-voice` → Functional Correspondence. This section is *only* the strategic overlay.

**Hard rule (from the OS).** No email sends itself. Everything lands in Gmail Drafts for Krish to send (PUB-001 / PUB-005). Email drafts are the exempt path *because nothing is sent*. Stay inside that.

### Leads (Felix enterprise pipeline, Nell outbound, customer drafts)

**Intent by lead state** (the OS infers this; the voice serves it):
- **Cold**, earn the reply. ≤180 words. One research-backed observation about *their* world, then one low-friction ask. Zero flattery, zero "I was impressed by." Lead with an outcome or an observation, not a credential. (krish-voice Gear A for enterprise.)
- **Warm**, keep momentum. ≤120 words. Reference the *actual* last touch and mirror a phrase they used. "As promised." Move the next concrete step.
- **Customer**, paid → check-in, trial → conversion, churned → win-back. Intent set by `customer_kind`. Warm, specific to their usage, never a template.

**The lead overlay rule.** Every cold/warm outbound must pass the **listening test**: what phrase, framing, or word did *this* person/company use that I can reflect back? If the draft would read identically sent to a different prospect, it failed. The OS has the lead's enrichment context, use it. Generic personalisation ("I see you're in [industry]") is worse than none.

**Kind/helpful in outbound.** Kind = respect their time (short, no warm-up, easy to say no). Helpful = the email gives them something *before* it asks, an observation, a relevant signal, a genuinely useful link, so the ask is earned, not extracted. Never manufacture urgency. "Happy to work around that" beats any false-deadline close.

### Visibility (Nova, speaking, podcasts, CFPs, press, guest appearances)

**Intent by target type:**
- **CFP / conference / speaking**, the application or the pitch. Lead with the *angle* (what Krish would actually say on that stage that no one else would), not a bio. The enrichment gives `suggested_angle`, `audience`, `past_speakers`, anchor the pitch to *that* event's audience, not a generic talk abstract.
- **Podcast / guest appearance**, the guest pitch. Why *this* show, why *now*, what their audience gets. Mirror the show's own framing. (krish-voice Gear B usually, unless it's an enterprise show.)
- **Press relationship**, the relationship, not the transaction. Warm, low-ask, useful-first. A journalist remembers the source who gave them a good line with no strings.

**The visibility overlay rule.** A visibility pitch is *content in miniature*, it has to demonstrate the angle, not describe it. "I'd love to talk about AI in media" is dead on arrival. "Here's the spiky take I'd bring: [one real angle]" gets the slot. Apply the relevant channel's stance to the pitch: a Signal & Noise-flavoured podcast wants the devil's-advocate angle *in the pitch itself*.

**Kind/helpful in visibility.** Kind = make it easy to say yes (clear angle, low friction, no ego). Helpful = lead with what *their* audience gets, not what Krish wants. Generous framing wins bookings; self-promotional framing gets ignored.

---

# Cross-Channel Rules

**One signal, different instruments.** A single Zara signal can feed multiple channels, but never as the same words. Techonomic asks the money question; Signal & Noise picks the fight; Builder Economy finds the human; Mindmaker Live says why it matters this week. If you're tempted to repost the same paragraph across two channels, you've found a *topic*, not channel-specific *angles*. Generate the distinct angle per channel.

**The voice is one; the registers are two.** krish-voice's Gear A (enterprise: Techonomic, Mindmaker Live, enterprise outbound) vs Gear B (builder: Builder Economy, Signal & Noise, creator outbound). Same person, different room. Know the gear before the first sentence.

**Long-form is the asset; social is the trailer.** Essays and episodes are the durable assets. LinkedIn/X/IG cuts are distribution *of* them, not substitutes *for* them. Don't write a "LinkedIn post" when the real asset is a Techonomic essay that should spawn one.

**Never sell on the content channels.** No CTAs on Techonomic, Builder Economy, Signal & Noise. The credibility *is* the mechanic. Mindmaker Live's "imagine this judgment in your org" stays implicit. Selling is the outbound channels' job, and even there it's earned, not extracted.

**Every piece, every channel:** Five Standards gate + krish-voice kill list. No em dashes. No invented numbers. One antagonist (an idea, never a person). A verdict, not a summary. The dinner-table test. Kind to people, sharp on ideas, useful in the hand.

---

# The One-Paragraph Version (for when context is tight)

`krish-voice` is *how* to write; this is *where* and *how good*. Six channels, one voice, two gears. **Techonomic** follows the money and asks the question others assume answered (essay, Gear A, investigative). **The Builder Economy** finds the why beneath the why, warmly (podcast + IG, Gear B, inspiring). **Signal & Noise** picks the fight with the consensus, kindly toward people and brutally toward ideas (dialogic audio, Gear B, devil's-advocate). **Mindmaker Live** tells busy execs the 3 things that changed this week and why each matters (weekly digest, Gear A, teaching, every item carries a so-what). **Outbound** (leads + visibility) moves relationships forward in Krish's voice, leading with what *they* get. **The Maven Sales Surface** is the one channel where selling is the job: direct-response course copy for the Accountable Delegator, register kept professional not survivalist (it is expensed), spine is "I do this, watch" backed by production receipts, names plain-legible and never coined, every field inside Maven's hard char limits. Everything clears five standards: undeniably unique (artifact > listening > research), well-researched (sourced or owned, never invented), thoughtful (the take under the take), kind (warm to people, sharp on ideas, never cruel), helpful (the reader leaves with something usable). Generic-and-mean is the AI default and the thing to kill on sight.
