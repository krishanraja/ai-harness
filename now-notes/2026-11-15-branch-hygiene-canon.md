Status: the canon block carries the branch rule (one worktree and one branch per pull request, a branch with no pull request after a day gets one or is removed, every repository runs the weekly branch sweep); docs/proposals/2026-11-15-branch-hygiene.md is approved and brain/rules.yaml records canon.branches.
Next: the next release and canon sync carry the block to every fleet repository; confirm each one also carries .github/workflows/branch-sweep.yml.
North Star check (2026-11-15): holds.
