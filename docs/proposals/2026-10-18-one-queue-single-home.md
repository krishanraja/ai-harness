# Keep the one-queue rule in the contract and reference, not again in the principles skill

Status: change request, awaiting Krish. Opened by the weekly harness steward on 2026-10-18 for candidate `consolidation:3b9ff706b1` (consolidation). Merging this pull request is the acceptance; it does not release anything.

## Evidence

The one-queue rule (mission leads, product work beneath it by the live ladder) is stated in the operating contract, in who-krish-is section 7 and again in the krish-principles skill body, all loaded every session (dup-1, dup-3, dup-5). The skill bullet now keeps the pointer and the Rule 7/8 guard and drops the restatement, the purpose-adjacent ruling quote and the portfolio member list. Also removes a ruling-shaped parenthetical that is already recorded in the contract.

Ledger ids: `dup-1`, `dup-3`, `dup-5`.

## Alternative explanations

The repetition may be deliberate redundancy so the rule survives when only the skill is loaded; the skill still names the rule and points to both full homes.,dup-2 and dup-4 sit in non-always-on skills or reference-vs-skill pairs and were left alone.

## What changes

- `evals/core-behavior-cases.jsonl` (eval, +1 -0)
- `skills/krish-principles/SKILL.md` (skill, +2 -2)

Always-on context: -192 characters. Growth justified: Not needed: the always-on surface shrinks by roughly 300 characters.

## If wrong

An agent loading only the skill misorders a Mindmake task against a product task; the new eval case principles-behavior-041 would catch it and the line can be restored from git.

## Validation

Run scripts/context-budget.mjs: the always-on surface must shrink. Re-run the duplicate scan: dup-1, dup-3 and dup-5 should no longer pair with krish-principles/SKILL.md. Eval case principles-behavior-041 appended; cases 035 and 040 unchanged.

## Prior known-good and rollback

Revert the merge commit; both files return to their prior bytes.
