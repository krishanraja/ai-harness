# Session closeout and one system, 2026-10-22

## Rulings (Krish, 2026-10-22)

- Ruling (Krish, 2026-10-22): every session that is ever done in a repository checks at the end that the North Star does not need recalibrating and that the repository's status and next steps are up to date, automatically, without Krish asking.
- Ruling (Krish, 2026-10-22): build it, with the ladder rule included: when growth engines compete for the same credits, the higher venture on the priority ladder is served first.
- Ruling (Krish, 2026-10-22): the documents of the router system are one cohesive system. Control Center must not write things in random places or change the canon somewhere a repository does not pick up, and neither Control Center nor the harness may be ignorant of what is actually going on in each venture.
- Standing, from earlier the same day: each venture's own repository is the only reference for where it is and what comes next; its North Star rarely changes; only Krish changes it.

## What this moves

The harness North Star's promise that every session, in every client, starts from the truth. Before this, a session's knowledge of where a repository stood came from a `NOW.md` the docs steward rewrote once a night from commit messages, and nothing at all made a session leave its own knowledge behind.

## What was found

- The docs steward's push run only validates. It writes nightly, so `NOW.md` lagged a day behind the work and was reconstructed from commits by a reader who did not do the work.
- Four lists named the fleet (`state/fleet.yaml`, the steward's `fleet.json`, the central steward's options, the publisher's targets and profiles). Heartside, Legibility and growth-heartside were in two of them, so they had no operating context, no publisher check and no closeout.
- The `north-star` blocks were added by hand in each repository; no writer owns them, which is acceptable because only Krish changes what they point at.
- growth-heartside kept an hourly copy of Heartside's status, which is exactly the stale copy the venture-status ruling forbids.

## What was built

1. **The rule.** The operating contract gains "Session closeout" and "One system: where each fact lives". The canon block carries one sentence of each to every repository, so Codex, Cursor and any client read it.
2. **One script, two callers.** `scripts/closeout/check.mjs` is Claude Code's Stop hook and the `closeout` job on every pull request. A range of commits that changes anything but `NOW.md`, the history archive or a harness-generated file (plan and handoff documents count) must change `NOW.md`, bump `as_of`, and keep one line `- North Star check (YYYY-MM-DD): holds.` or `...: recalibration proposed. <why>`. The North Star changes only with Krish's ruling. Automation commits and a stated `Closeout: not needed, <reason>` are exempt. The hook blocks a stop once and never twice, so it cannot trap a session.
3. **Delivery with no hand copying.** The repository administration publisher already owns `.github/workflows/harness-repository-context.yml` in every admitted repository. It now also delivers the hook byte for byte, registers it in `.claude/settings.json` without taking that file over, and upgrades the earlier check in place. The check pins the hook's hash, so a hand edit fails that repository's CI.
4. **The steward as backstop.** Its validator counts `NOW.md` current when no product commit landed after the last commit that touched it, ignores automation commits, holds the North Star check line to one form, and fails any steward diff that touches `docs/NORTH_STAR.md`.
5. **One fleet list.** `validate-surfaces` fails when any fleet list disagrees with `state/fleet.yaml`.
6. **Admission.** Heartside, Legibility and growth-heartside join the publisher's targets under `plan:closeout-and-one-system-v1`, a dated extension of the 2026-10-17 plan that leaves the original approval record untouched.
7. **Control Center reads, never stores.** A live `get_venture_state` read of each repository's `NOW.md` and its freshness, the ladder rule for competing engine spend, and growth-heartside's copy of Heartside's status replaced by a live read (their own pull requests).

## Material alternative, rejected

Let the docs steward write on every merge instead of nightly. It closes the lag but not the gap: the steward still guesses intent from commits, and it cannot judge whether the North Star still holds. The session that did the work is the only writer that knows both.

## What Krish still decides

- Merging, and with it the publisher's first rollout to the thirteen targets. Its pull requests merge themselves once their checks pass, as they have since 2026-10-17; the bytes they may write are bound to this approval by hash in `contract/repository-administration.json` (`approved_sha256`), so a changed hook or check cannot ship until a new hash is merged. Krish may instead ask for this first rollout to open pull requests only, for him to merge.
- The repository secret `CLAUDE_CODE_OAUTH_TOKEN` on heartside, legibility and growth-heartside for the nightly steward.
- Every proposed recalibration. Nothing here edits a North Star.

## Proof before it counts

- `node scripts/closeout/test-check.mjs`, `node scripts/steward/test-validate-closeout.mjs`, `node scripts/test-repository-admin.mjs`, `node scripts/validate-surfaces.mjs`, `node scripts/validate-repository-brain.mjs`.
- After rollout: a fresh session in a target that commits product work without touching `NOW.md` is stopped once with the closeout steps, and its pull request's `closeout` check fails until `NOW.md` is current.
