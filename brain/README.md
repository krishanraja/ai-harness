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
