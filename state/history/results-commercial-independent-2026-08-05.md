# Independent commercial-skill evaluation - 2026-08-05

## Scope

Evaluated the canonical candidates `mindmaker`, `content-corpus`, and `krish-content-marketer` with Claude Code 2.1.222 in safe mode. Each batch used a fresh executor and a separate fresh judge, disabled tools and session persistence, and applied a USD 1 hard cap per Claude call. Raw model output remains under ignored `work/`; this report stores only redacted outcomes and actionable findings.

The evaluator received the complete candidate skill package, including one-level references, and blind cases. The executor did not receive the hidden `must`/`must_not` rubric. The judge received the rubric only after execution.

## Freshness reconciliation

Reviewed on 2026-08-05:

- Private Mindmaker commercial repository at main revision `9801c85969bea5e0553f71548262efef02fe2061`; relevant commercial documentation was last reviewed 2026-06-28.
- Official Mindmaker website, current cohort/workshop/enterprise surfaces, and Maven public course surface.
- Official Mindmaker Live surface.
- Official Signal & Noise podcast/about surfaces.
- The Builder Economy official site.
- Techonomic official domain and indexed-site check.

Findings applied to the skills:

- The old eight-week/six-workshop snapshot was removed. Reviewed intended architecture currently uses a four-week cohort and five workshops, but duration, syllabus, prices, dates, seats, guarantees, and availability remain live-only facts.
- Intended repository canon, customer-visible publication state, and transaction state now remain separate source scopes.
- Channel playbooks no longer imply activity. At review time, Mindmaker Live and Signal & Noise showed current activity; The Builder Economy showed pre-launch language; Techonomic was inaccessible and had no indexed official results. These statuses were evidence for the review, not durable skill instructions.
- The old rule that treated an established current course name as a naming failure was removed. Established names are preserved unless Krish explicitly opens a naming or repositioning task.
- Content self-correction now proposes a governed observation through `ctrl-capture`; it cannot silently edit Krish's durable standard.

## Coverage and outcome

| Skill | Trigger suite | Behavior suite | Hard failures | Final result |
|---|---:|---:|---:|---|
| `mindmaker` | 21/21 | 23/23 after full and focused reruns | 0 | pass |
| `content-corpus` | 21/21 | 23/23 after full and focused reruns | 0 | pass |
| `krish-content-marketer` | 21/21 | 23/23 after full and focused reruns | 0 | pass |

Total final reviewed coverage: 63 trigger cases and 69 behavior cases. All high-consequence authority and security cases passed. No aggregate score was used to hide an individual failure.

## Located failures and corrections

The first run found no routing failures and no hard safety failures. It located omitted operational details across source conflicts, exact pending targets, minimum access, cost caps, rollback evidence, retirement dependencies, evidence return paths, named writer/voice handoffs, and post-correction reruns.

Corrections made:

- made buyer, purpose, evidence scope, exact pending action, minimum access, success signal, cap, rollback, and retirement-choice fields explicit;
- required dual loading for Mindmaker/Mindmaker OS crossover and a decision/rollout check before escalating recollection conflicts;
- required the strongest opposing case to be stated and credited before attack;
- made named sales-surface chaining explicit: channel context -> Mindmaker fact check -> conversion producer -> voice -> verification;
- required evidence packets and original source artifacts to return to the writer;
- added an explicit unsent-sequence protocol preserving recipient, timing, draft surface, and separate send/schedule approval;
- made class-level cause, correction, adjacent reruns, and controlled-learning handoff explicit.

Every failed case and adjacent cases passed after correction. A final one-case rerun removed the last low-severity ambiguity in the named sales-surface handoff.

## Residual uncertainty

This evidence proves behavior on the reviewed held-out suite, not every future prompt or live platform state. The three skills remain candidates until the remaining production gates pass: clean committed packaging, baseline comparison where applicable, deterministic release, canary discovery/behavior verification, exact surface parity, and user-approved activation. No local or cloud skill surface was changed during this evaluation.
