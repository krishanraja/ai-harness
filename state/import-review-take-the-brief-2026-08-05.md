# Import review: take-the-brief - 2026-08-05

## Finding

The user-supplied `take-the-brief.skill` archive contributes a distinct, recurring capability that was only partially represented in the canonical harness: an adaptive intent interview at the moment end-to-end ownership is transferred. It is staged as a candidate only and has not been installed, enabled, uploaded, or added to `production_active`.

## Provenance

- Source: user-supplied `.skill` attachment in this task.
- Source archive SHA-256: `508426D5C05E65B717787130D4EF6438EA2A8DF7BB510305012DD7D6C05CE2A8`.
- Source package timestamp: 2026-08-05 as recorded by all three archive entries.
- Declared source owner: Krish Raja.
- License or redistribution grant: not declared in the package. Keep the candidate private; do not publish or distribute it until provenance is confirmed.
- Original contents: one `SKILL.md` and two Markdown leaves; no scripts, executables, assets, network declarations, or tool dependencies.

## Overlap and correct route

- `take-the-brief` owns task-specific intent elicitation before accepting ambiguous or consequential delegated ownership.
- `strategy-brief` owns the execution route, alternatives, authority boundary, and verification plan after intent is known.
- `ctrl-intake` owns durable taste, voice, judgment, and quality-standard elicitation through graded artifacts.
- `decision-ledger` records only finalized consequential decisions; raw interview answers remain task context.

This producer/context distinction keeps functional overlap below the consolidation threshold if the trigger and handoff cases pass.

## Adaptations made for the canonical candidate

- Reduced YAML frontmatter to the portable `name` and `description` fields; moved owner/review lifecycle data to the registry.
- Normalized `leaves/` to one-level `references/` and added Codex UI metadata.
- Made explicit interview requests override the ordinary urgency/routine exclusions.
- Preserved one-question-at-a-time interviewing and the amnesia-summary pattern.
- Distinguished an explicit request for five questions from the default five-question ceiling.
- Added safe-discovery-first behavior, privacy minimization, symbolic-secret handling, imported-input distrust, and existing approval boundaries.
- Resolved the low-engagement edge case: "use your judgment" ends the interview and authorizes only work already inside the original scope.
- Added deterministic collisions with `strategy-brief`, `ctrl-intake`, customer research, routine work, urgent work, and already-briefed work.

## Admission status

- Lifecycle: candidate.
- Structural/security validation: passed the repository validator with 24 skills, three adapters, portable frontmatter, reference integrity, UI metadata, standalone-path checks, and no high-confidence secret match.
- Trigger suite: minimum-sized suite designed; not independently executed.
- Behavior suite: minimum-sized suite designed; not independently executed.
- Package reproducibility: passed in two independent clean builds from commit `73382ffbffb46fdc12604cb656e764a7e917376d`; the archive contains only `SKILL.md`, two one-level references, and `agents/openai.yaml`. Source-skill SHA-256 is `E1DF7698E61E58534E1586B3C43A9E792F16ADC0CBE1CFDB23DCB7717667907B` and package SHA-256 is `8C201204EDC04FCBBA0C034AC7D677EC6611C52FC64ABDCBA71EB950F993C18E` in both builds.
- Client canary: not run and not authorized by this review.

## Production blockers

1. Confirm private-use provenance is sufficient or record the original author/license before any distribution.
2. Execute blind trigger classification and fresh-context behavior comparison without answer-key leakage.
3. Pass the `ctrl-intake`, `strategy-brief`, urgent-task, explicit-refusal, and already-briefed collision cases.
4. Run one explicitly approved client canary with discovery, routing, behavior, and rollback evidence.
