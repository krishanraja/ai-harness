# brain

The curated tier of the harness memory.

`state/observations/` is the raw tier: an append-only ledger of everything the
observer saw, written by machines, never edited. Anything can land there. This
directory is the other half, and the difference between them is approval. A
thing arrives here only through a pull request a person merged.

That split is not new architecture for its own sake. It is the one property
that separates a memory system from a pile of files: a private tier that is
cheap to write, a shared tier that is expensive to write, and an explicit
promotion step between them that leaves a record.

## What is here

| File | Holds | Written by |
|---|---|---|
| `rules.yaml` | one entry per rule in both contracts, and one per chapter of every skill: its hash, when it first appeared, where it came from, what it supersedes | `scripts/brain-rules.mjs`, checked on every push |
| `proposals.jsonl` | one row per event in a proposal's life: opened, merged or closed, and whether the finding it addressed actually went away | appended, never edited |
| `usage.jsonl` | one row per observed citation of a rule: which rule, **when**, by which producer, against which pull request or canary report | appended by `scripts/judge.mjs` and `scripts/canaries.mjs`, never edited |

## Why usage.jsonl exists

`rules.yaml` answers where a rule came from. It cannot answer whether anything
has ever reached for it, and those are different questions with the same smell.

`stores.yaml` records what happens when only the first is asked. The abandoned
`standards_registry` had `hit_count`, `last_hit_at` and `last_efficacy_check`
designed in April, and died with 122 rules nominally live, 6 of 169 ever hit and
no efficacy check ever run. That is the memory doctrine's "dead zones, never
retrieved" failure. This directory then shipped 314 entries carrying every field
that store had except the two the diagnosis named.

Two producers of rule ids already existed and threw their output away. The judge
refuses any finding that does not cite a clause id from `rules.yaml`. A canary
that fires proves a skill was reachable on a live client, and every chapter of
that skill is an entry here. Both now append instead of discarding, and
`scripts/audit-harness.mjs` opens a `dead-zone` finding for live rules nothing
has ever cited.

Counts are **derived, never stored**. A mutable `hit_count` column in
`rules.yaml` would break this directory's own first rule, and it would be the
same shape as the store this ledger exists to avoid repeating. Read the count
with `node scripts/brain-usage.mjs --report`; it is whatever the ledger says
today and it is never written back.

Every row carries `at`, the date the citation was observed, so the ledger
answers when as well as whether. That matters because the failure the retired
store actually had was not an empty column, it was `last_hit_at` going stale
while the row still read active. `deadZones({ since })` separates never cited
from cited but not lately, and the audit passes a ninety day window, the widest
freshness SLA any skill carries. The two are reported apart because "never
once" and "not since June" call for different work.

That is still weaker than efficacy. A rule cited once and never re-verified
reads as healthy here, and this ledger does not know whether citing it helped.
`last_efficacy_check` is the column the retired store had and this one does not,
and saying so is better than implying the instrument is complete.

**This tier is machine written, and that is a deliberate exception.** The rule
of this directory is that a thing arrives through a pull request a person
merged. A citation is not a claim about what should be true, it is a record that
something happened, and requiring a human to approve each one would mean either
nobody records them or somebody rubber-stamps them. So the gate moved rather
than disappeared: the ledger is append only and machine written, and nothing
downstream of it may act alone. A `dead-zone` finding is a finding, which the
quality standard already defines as a decision for a person; retiring a rule is
still a proposal. No script reads this file and edits a rule.

Two things the ledger deliberately refuses. A citation naming a rule that is not
in the canon, because it would make the count answer for a canon that is not
this one. And a citation from a void canary result, because a skill that could
not fire proves nothing about the rules inside it. The regression suite writes
its fixture citations under `--out-dir`, never here: a provenance ledger holding
invented rows is worse than an empty one.

## Why rules.yaml exists

Before it, the audit could tell you a skill was five days past its review date
or one release behind. It could not tell you where any individual rule came
from. Both contracts carry zero `Ruling (Krish` lines, so for 89 contract rules
and 225 skill chapters, "who decided this, and when" had no answer at all.

Every entry is `founding` today. That is the honest record: we know when each
rule entered this repository, and for almost all of them we do not know why.
Inventing a justification after the fact would have been worse than saying so.
The founding entries are the first thing a reviewer should read, because they
are the rules nobody has ever had to defend.

## The rules of this directory

- **A count is derived, never stored.** The moment a tally becomes a column,
  something has to write it, and the only way to write it is in place. Ask the
  ledger and add up what it says.
- **Nothing here is edited in place by a script.** The ledger files a script
  writes are JSONL, and a change of state is a new row for the same `id`. The
  current state of anything is the latest row that names it. A superseded entry
  gets a closing row; it never gets deleted, and neither does the thing it
  superseded.
- **Ids are slugs, never ordinals.** `authority.never-publish-post-send`, not
  `authority.3`. An ordinal renames every rule below an insertion, and a
  provenance record that survives an edit by name while pointing at different
  text is worse than no record. `scripts/test-brain-rules.mjs` asserts this
  directly.
- **Hashes are quoted.** A twelve character hex hash can be all digits, and the
  YAML reader turns a bare all-digit scalar into a number, which never compares
  equal to its own identical string. Unquoted, such an entry fails forever and
  no edit can fix it. This is not hypothetical: it happened on the first run.
- **No em dash.** `scripts/validate-surfaces.mjs` refuses this directory on it,
  the same way it refuses the contracts and the rendered adapters.

## Changing a rule

1. Edit the contract or the skill.
2. Update its entry in `rules.yaml`: new `text_sha`, and a `source` that is not
   the one it had before the edit. If the meaning changed rather than the
   wording, add `supersedes` naming the entry this replaces and set the old
   entry's `status` to `superseded`.
3. `node scripts/validate-surfaces.mjs` refuses the change until both are true.

Regenerate the whole ledger with `node scripts/brain-rules.mjs --backfill`. It
keeps every existing entry whose text has not changed, so a regeneration never
silently rewrites provenance you already recorded.
