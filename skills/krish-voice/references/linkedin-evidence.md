# What lands on LinkedIn, and in an email: the evidence

Version 1, 7 November 2026. Review by 7 February 2027: platform rules move faster than this file.

This file holds the platform evidence behind the scored checks in `kill-list.json`. It does not change Krish's voice. It tells a drafter which habits the platform and readers reward, and how strong the evidence is. Grades:

- **primary**: LinkedIn said it, or LinkedIn engineering published it.
- **multi-study**: two or more independent large samples agree.
- **single-vendor**: one tool vendor's sample; correlation only.
- **opinion**: practitioner guidance with no sample.

Only primary and multi-study rules may become a hard fail, which holds a draft. Any graded rule may be a scored check: advice shown beside a draft with its grade, which never holds anything. Where studies conflict, the file says so and the check stays advisory.

## What LinkedIn itself has said (primary)

- The feed was rebuilt on 12 March 2026 around one LLM for retrieval and a generative ranker that predicts "passive tasks (click, skip, long-dwell) and active tasks (like, comment, share)". Retrieval reads "author information (name, headline, company, industry), engagement counts, article metadata, and post text". Posts from people a reader does not follow now compete "on equal footing". ([LinkedIn Engineering](https://www.linkedin.com/blog/engineering/feed/engineering-the-next-generation-of-linkedins-feed))
- LinkedIn is cutting "comment to agree" prompts, video that does not match its text, comment automation and engagement pods, and wants "genuine insight, actionable ideas, and thoughtful perspectives". ([LinkedIn News](https://news.linkedin.com/2026/ImprovingTheFeed))
- AI slop is defined by LinkedIn's creator team as content "potentially sophisticated or polished in its presentation, but lacks substance". LinkedIn says content it classifies as slop gets about 40% fewer views (self-reported), and replaced "Enhance your post" with a proofreader that "does not change your voice". ([Social Media Today](https://socialmediatoday.com/news/linkedin-says-1m-people-have-reported-ai-slop/828465), [Tubefilter](https://www.tubefilter.com/2026/08/10/linkedin-ai-slop-button-thinkfluencing-proofreading-tool/))
- No primary statement on links either way. The "link penalty" figures circulating are untraced. ([audit](https://fast-growth.fr/linkedin-algorithm-2026-proven-invented/))

## The rules

| # | Rule | Grade | Enforced as |
|---|---|---|---|
| 1 | The first line carries a concrete element: a specific number, a first-hand experience, a defensible contrarian claim, or a personal stake. No setup or context opener. | multi-study ([ciela](https://ciela.ai/blogs/viral-linkedin-posts-ai-analysis), [ViralBrain](https://www.viralbrain.ai/blog/linkedin-intelligence-report-q1-2026)); agrees with the doctrine | scored: `first_line_concrete`, `no_setup_opener` |
| 2 | The first line is complete in about 110 characters, before LinkedIn's "see more". | single-vendor | scored: `first_line_length` |
| 3 | At least one first-hand detail: something Krish did, saw or measured. Polish without substance is what LinkedIn demotes. | primary | doctrine (artifact-grounded specificity); not machine-checked |
| 4 | No engagement bait: "comment YES", "comment X below", "agree?", "tag someone". | primary | **hard fail** `engagement_bait` |
| 5 | Reply to comments personally; never automated or templated replies. | primary | conduct, not text |
| 6 | Length by intent: one sharp idea under about 150 words, or a full argument of about 900 to 1,500 characters (deliberate long form allowed). The 200 to 350 word middle is weakest in one study. | conflicting studies (van der Blom, AuthoredUp, Saywhat, ciela) | scored, advisory: `length_band` |
| 7 | Not broetry: blank lines at most 40% of lines, and at least 4 lines. | single-vendor (van der Blom), consistent with LinkedIn's dwell signal | scored: `blank_line_ratio` |
| 8 | No AI tells: reflexive lists of three, "delve", "pivotal", "testament", hollow "not X but Y", em dashes. | opinion and community guide ([Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)); agrees with `ai-tells-and-decks.md` | **hard fail** for the kill-list words and em dash; the rest is the doctrine |
| 9 | Hashtags: none is best, three at most. | single-vendor | scored: `hashtags` |
| 10 | Links are fine. Put the value in the post first and the link last; a post that is only a link fails. | conflicting studies | advice |
| 11 | Use a document carousel or an image for a framework or data; text is the default for an opinion. | multi-study | advice to the producer, not prose |
| 12 | A closing question, if any, is specific and easy to answer. "Thoughts?" fails. | multi-study, weak | scored: `closing_question` |
| 13 | Each post maps to one of Krish's standing themes (The Money of AI, Building with AI). | single-vendor | advice; `content-corpus` owns themes |
| 14 | Cold email: body about 50 to 100 words (hard ceiling 120), subject of 1 to 4 words, one ask, an interest-based ask ("Worth a look?") on a first touch, at most one question, no buzzwords. | multi-study ([Gong](https://www.gong.io/blog/do-execs-really-reply-to-cold-email-here-s-what-the-data-says), [Hunter, 34M emails](https://hunter.io/blog/cold-email-word-count), [Reply.io](https://reply.io/wp-content/uploads/How-to-write-better-cold-emails-Reply-Research.pdf)) | scored: `email_length`, `subject_words`, `questions` |
| 15 | An email reads in under 9 seconds: short paragraphs, plain words. | single-vendor (Gong, Lavender) | advice |

## Writers who land in Krish's field, and why

Measured on public post pages on 7 Nov 2026; most of these posts predate the 2025 to 2026 fall in reach.

- **Ethan Mollick**: a first-hand experiment in plain words, the whole story in the first line, no formatting tricks ("I added an AI policy to my syllabus.", 21,490 reactions).
- **Justin Welsh**: undercuts his own label ("I call myself a solopreneur. That's actually a lie."), then three takeaways.
- **Lara Acosta**: admits a failure, then shows the proof (Story, Lesson, Actionable, You).
- **Scott Galloway**: one sentence that carries a whole opinion through a sharp contrast.
- **Dave Gerhardt**: "If I were running..." hypothetical from a credible operator, then a concrete plan.
- Krish's own inspiration writers are in `inspiration-writers.md`.

What they share is what the doctrine already asks: the point first, a first-hand detail, one idea, a clean close. None of them needs a formatting trick to land.
