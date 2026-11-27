# software-qa as the standards engine for building, 2026-11-27

Status: admitted with this change. Krish asked for it on 2026-11-27, in writing: "I basically need software-qa to act as the standards engine for all things building, and ai-harness to act as the brain that knows where and when it might need to be brought in to help/how, and what I expect from things", alongside "I want to be able to add this repo to any future build session, and it has a floor standard for UI and UX builds."

## What it supersedes

The 2026-11-25 registry row (docs/proposals/2026-11-25-software-qa-route.md) described software-qa only as venture QA evidence for CTRL and Legibility, called solely through the internal auditor. That stays true and stays in the row. This change adds the build role in front of it.

## What changed in software-qa (its own change, same day)

- `ui-library/`: every component in Krish's ui-inspo Drive folder (the 112-item vividsites bundle, MIT-0, and his own saves), normalised into one convention, de-duplicated, with the Drive names kept as aliases; plus the components on 21st.dev's Popular block and Featured list on 2026-11-27 and the wave-2 queue from his library index, minus glassmorphism pieces and the hosted Spline scene. A generated inventory gives each component's use, stack, source, licence, why it is there and its floor result.
- `floor/`: a static scan any build can run on its own code (`npm run floor:scan -- <src> --gate`). Its rules mirror the rendered visual lane and krish-design's anti-defaults and cite their source; a unit test fails if its lists drift from the lane's.
- `docs/BUILD-FLOOR.md`: the floor, with each item mapped to what checks it and to this repository's experience quality contract.
- `AGENTS.md`: what a session that attached the repository does with it.

## What changed here

- `state/fleet.yaml`: software-qa's row now says what it does for any build, how to call it (attach it; no dispatch, no writes outside the session) and when (before writing UI from scratch, and before presenting). Rendered into krish-principles `references/capabilities.md`, which every session reads before it builds.
- `adapters/cloud/account-routing.md`: names software-qa at the moment a build starts, beside its existing venture QA route. Claude accounts load this file live through their pointer; any surface that holds a pasted copy needs the copy refreshed.
- `contract/experience-quality-contract.md`: one paragraph naming software-qa as the contract's executable layer, what it covers and what it never stands in for. The contract stays the authority.

No skill text changed. krish-design keeps taste and material approval, krish-build implementation, build-apps-with-krish orchestration, ux-testing-agent observed task evidence. Their routing reaches software-qa through the neighbours table, which the canon tells every session to read before it builds.

## The walls

Attaching the repository and running its scan or lane is local work inside the session. It sends, publishes, spends and deletes nothing. Its CI workflow is still dispatched only by the internal auditor. It owns no gate: a clear floor scan is a lead, not an approval, and a build that was never rendered and looked at has not cleared the floor.

## Which part of the North Star it moves

The corrections Krish gives twice in a week. The anti-defaults he rejects on sight (glass cards, gradient text, purple gradients, em dashes, generic type) are now caught by a command before he sees the build, and every session is told where that command lives. Measure it by the share of design corrections in the taste ledger and harness observations that a floor rule would have caught.
