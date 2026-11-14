# Proposal: the canon names the research library as a research document's home

Status: approved by Krish on 2026-11-14 as part of wave 3 (cluster I-30, decision D21), recorded word for word in control-center `docs/audits/2026-11-14-fleet-integration/KRISH-ANSWERS.md` at control-center commit `38aa01edb670aa599b666f0515c4116c97838c3b` (his words: "I want wave 3 now"). The design is `integration/SYNTHESIS.md` I-30 in the same folder.
Source: fleet integration plan I-30 (ai-harness half), "A research shelf for every venture".
Ruling: on 2026-11-14 the judge panel on pull request 254 reported two blocking regressions against the operating
contract (file routing's homes, and the approval wall for a filing). Krish ruled that the sentence goes in as written
(his words: "merge ai-harness #254 with my ruling"). File routing and the authority wall are unchanged; reconciling
their text with this sentence is a later change, if he asks for one.

## What was wrong

Research a session paid for (web searches, research calls, subagent reports) kept being lost in scratch folders and
chat windows, or committed into whichever repository the session happened to be in. content-engine's piece materials
store already kept Make Your Mind Up's research by its sha256, every version, never deleted; on 2026-11-14 it gained a
shelf for every other venture (`venture:<slug>`, content-engine #693), so every venture now has one home for research.
The canon said nothing about where research lives, so each client decided for itself.

## The change

One sentence in the canon's Route paragraph, after "One home per fact": file routing's home for a research document is
the research library. The session that wrote it files it there as it writes, where its authority already covers that
write (`add_piece_material`, kind `research`, on its piece or on its venture's own shelf), and cites it by its id. It is
not committed to a repository as its home and not left only in scratch or a chat. Every other artifact follows file
routing as before.

## How it sits with the rules beside it

- File routing (operating contract): this names the home for one kind of artifact, research documents. It narrows file
  routing for that kind and supersedes nothing; a deliverable, a corpus and code keep the homes file routing gives them.
- Authority: the sentence grants no new authority. A filing is a write to Krish's own store and happens only where the
  session's authority already covers it; it is never a send, post or publish to anyone. Without that authority the
  session says where the document is.
- One home per fact: a research document then has one home, cited by id, instead of copies across repositories.
