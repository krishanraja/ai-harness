# Open on Krish, 2026-09-09

Things this session established, could not do from inside the container, and
would otherwise be lost when the session ends. Each one carries the exact
command or click, so none of them needs re-deriving.

Ordered by what happens if it is not done.

---

## 1. Four credentials are live and exposed

Tested on 2026-09-09 by authenticating with each one, after Krish said they had
been rotated. All four returned 200 with full access. Something was rotated,
but not these.

| Credential | Test result | Where to rotate |
|---|---|---|
| GitHub PAT | 200, authenticates as `krishanraja` | github.com/settings/tokens |
| Supabase management token | 200, lists all 7 projects | supabase.com/dashboard/account/tokens |
| Vercel token | 200, authenticates as `hello-4642` | vercel.com/account/tokens |
| n8n API key | 200, lists all 123 workflows | n8n Settings, API |

Plus the ed25519 host key `SHA256:g6fwjez+KYxHebrUwwNsgCKaT66ZjMF5QyNF+GAkuuk`,
which cannot be tested from here and needs checking on the VPS itself:

```
grep -c . /root/.ssh/authorized_keys        # then remove the stale entry
```

And a production login and password still reachable in mm-ctrl git history at
commit `8174677`. Rotating the account is the fix; rewriting the history is not,
because the value is already public.

And a plaintext Supabase `service_role` JWT inside two VPS scripts,
`sync-briefs-to-skills.sh` and `regenerate-standards-digest.py`. Rotating the
service role key requires updating both scripts and the n8n credential in the
same window.

All values are named here symbolically and appear nowhere in this repository.

## 2. `main` is still unprotected, so the judge still cannot block

Half of the gate landed on 2026-09-09: `harness-steward.yml` now exits non-zero
on a blocking verdict, and the `judge` check went honestly red for the first
time on pull request 32. The other half is a repository setting, and the agent
proxy refuses write access to the branch-protection API path, so it has to be
applied from outside the container.

Through the API:

```bash
curl -X PUT \
  -H "Authorization: Bearer $GH_PAT" \
  -H "Accept: application/vnd.github+json" \
  -H "Content-Type: application/json" \
  https://api.github.com/repos/krishanraja/ai-harness/branches/main/protection \
  -d '{
    "required_status_checks": { "strict": false, "contexts": ["judge", "surfaces"] },
    "enforce_admins": false,
    "required_pull_request_reviews": null,
    "restrictions": null,
    "allow_force_pushes": false,
    "allow_deletions": false
  }'
```

Or in the browser: Settings, Branches, Add rule on `main`, require status checks
to pass, tick `judge` and `surfaces`.

`enforce_admins` is deliberately `false`. That is the override: Krish can still
merge past a bad verdict, and when he does, the reason belongs in the commit
body as a `Ruling (Krish, DATE):` line, which `observe.mjs` already extracts
into the ledger. A recorded override is the thing that makes a mandatory gate
survivable; a silent bypass is not.

**Verify it is real, not merely red.** Open a throwaway pull request that a
bench will block and confirm the merge button is actually disabled. A red check
that merges anyway is the exact failure this is fixing, so proving the check
goes red proves nothing on its own.

## 3. Two declared clocks have never reported

Neither can be started from here.

- **`harness-sync-lorimer`.** Run `scripts/Invoke-HarnessSync.ps1` once on
  LORIMER, as was already done on SURFACE.
- **`session-feed`.** Create the Routine, or remove it from `EXPECTED_CLOCKS`
  with a recorded reason. Deliberately not automated: three weekly Routines
  were disabled in September for failing silently, so standing a new one up is
  Krish's call.

From 2026-09-09 both findings age. Under 14 days they read as a pending
install; past 14 days they escalate to an unmade decision, because a permanent
finding at a fixed volume is one everybody learns to scroll past.

## 4. The reading job nobody else can do

`standards_registry` holds 122 rows still marked active, against 314 entries in
`brain/rules.yaml`. Two live rule sets, nothing reconciling them, nothing
touched since 31 May. Each row is one of three things: already said by the
canon, worth adding, or dead. This is judgement, which is why the audit names
it and never performs it.

The em dash rule is the known twin and the first to resolve in one direction or
the other, since the canon enforces it independently and still carries 29
violations of it across 12 files.
