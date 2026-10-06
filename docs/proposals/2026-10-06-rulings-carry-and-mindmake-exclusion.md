# Carry the 2026-10-06 rulings, and keep mindmake out of the canon sync

Status: proposed on branch `canon/rulings-2026-10-06` for Krish's merge decision. The
rulings themselves are Krish's, dated 2026-10-06; this document records how the harness
carries them and the two corrections that ride along. Nothing here is released, tagged,
installed or uploaded.

## Evidence

- Release `harness-v2026.10.05.1` shipped a who-Krish profile that says the mission and
  the product portfolio are "both current, explicitly split", that the ikigai's twelve
  month commitment is "PAUSED, being reset", and (in `content-corpus` and `mindmake`) that
  the publication runs `split_the_bill`, `mind_the_gap` and `lift_the_lid`, with
  follow.the.money on the dead-names list.
- Krish ruled on 2026-10-06: the portfolio rolls into the mission; the commitment is
  ongoing; Full Time is a B2C monetisation experiment app, not a job search asset; CTRL
  being priced is fine; the publication has three channels (follow.the.money Mondays,
  under.the.hood Wednesdays, mind.the.gap Fridays) at home.makeyourmindup.ai; Hunter is
  active. Founder visibility stays open.
- Krish closed the canon pull request on `krishanraja/mindmake`. `state/fleet.yaml`
  excluded only the who-Krish paragraph there (`who_krish: false`). The block still
  carries a release stamp, so every release moves it, `scripts/reconcile.mjs` classifies
  the repository as `canon-moved`, and the nightly run would reopen a stamp-only pull
  request.
- The `mindmake-os` router's section map cited `## 0.` as "Mental model" and "0a, then 0b
  and 0c" as one block of rulings. The architecture doc now has `## 0.` Start here,
  `## 0a.` canon, `## 0b.` open issues, `## 0c.` retired, plus sections 16 to 18 the map
  did not list.

## Decision

1. Carry each ruling into the profile, the operating contract, the canon template's
   who-Krish paragraph, the cloud account instructions, `krish-principles`, `mindmake`
   and `content-corpus`, and the evals that encoded the superseded rulings. The ikigai
   stays verbatim; only its harness annotation lines change.
2. Add `canon_sync: false` with a required `canon_sync_reason` to the mindmake entry.
   `scripts/lib/fleet.mjs` decides sync targets; the reconciler and the seeder skip an
   excluded repository before any request and the reconciler reports it as `excluded`.
   The repository stays in the fleet list for parity with the docs steward and so the
   observer keeps reading its rulings. `scripts/validate-surfaces.mjs` fails a malformed
   flag or an exclusion with no reason.
3. Correct the `mindmake-os` section map to the live headings and say what each of 0a,
   0b and 0c holds.

## Verification

- `scripts/test-canon-sync.mjs` runs the real reconciler with `fetch` replaced by a
  function that throws: a full run scoped to mindmake exits 0 with one `excluded` row and
  no request, and a positive control on a synced repository does hit the stub. A mutation
  run with the flag flipped fails the test.
- `scripts/render.mjs --check`, `scripts/validate-surfaces.mjs`,
  `scripts/brain-rules.mjs --check`, the Node test suites, `scripts/audit-harness.mjs` and
  `scripts/Test-Harness.ps1`.

## Not in scope

- The docs steward in `krishanraja/control-center` has its own fleet list and write
  path; whether it writes to mindmake is that repository's decision.
- The architecture doc's own section 0.3 and `docs/KRISH.md` in Control Center still
  carry the 2026-10-05 split; they are edited there, not from here.
