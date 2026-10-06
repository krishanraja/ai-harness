/**
 * Which fleet repositories the canon sync may write to.
 *
 * Every repository in state/fleet.yaml stays in the list, because the list is
 * also the parity contract with the docs steward's fleet.json and the observer
 * still reads rulings out of every repository's commit history. Being in the
 * list is therefore not the same as being synced.
 *
 * A repository marked `canon_sync: false` is skipped by every writer of the
 * canon block (the nightly reconciler and the seeder) before any read or
 * write of that repository happens. Without this, a repository that had
 * opted out of the who-Krish paragraph still carried a release stamp that
 * fell behind on every release, so the reconciler classified it as
 * `canon-moved` and reopened a stamp-only pull request there every night,
 * including after Krish had closed one.
 *
 * Fail closed: anything other than the literal boolean `false` means synced,
 * and an exclusion must carry a reason, so a typo can neither silently
 * exclude a repository nor exclude one with no record of why.
 */

/** True when the canon sync may read and write this repository's block. */
export function isCanonSynced(repo) {
  return repo?.canon_sync !== false
}

/** The repositories the canon sync touches, in fleet order. */
export function canonSyncRepos(fleet) {
  return (fleet?.repos || []).filter(isCanonSynced)
}

/** The repositories the canon sync must never touch, with the recorded reason. */
export function canonExcludedRepos(fleet) {
  return (fleet?.repos || []).filter((r) => !isCanonSynced(r))
}

/**
 * Problems with the sync flags, for the validator. Returns a list of strings;
 * an empty list means the flags are well formed.
 */
export function canonSyncProblems(fleet) {
  const problems = []
  for (const r of fleet?.repos || []) {
    if (!('canon_sync' in r)) continue
    if (r.canon_sync !== true && r.canon_sync !== false) {
      problems.push(`${r.name}: canon_sync must be true or false, found ${JSON.stringify(r.canon_sync)}`)
    }
    if (r.canon_sync === false && !String(r.canon_sync_reason || '').trim()) {
      problems.push(`${r.name}: canon_sync is false with no canon_sync_reason; an exclusion must say why and who ruled it`)
    }
  }
  return problems
}
