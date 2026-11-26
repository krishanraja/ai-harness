# Independent core harness evaluation - 2026-08-05

## Scope and method

Claude Code 2.1.222 evaluated the canonical skill files in safe mode with customizations, tools, and session persistence disabled. Each shard used two fresh contexts:

1. a blind executor received the canonical skill and redacted cases without expected answers;
2. an independent judge received the executor output and case rubric.

Each external call had a hard USD 1.00 ceiling. The wrapper rejected malformed JSON, missing cases, and duplicate cases. Git retains only these redacted scores and findings; raw executor/judge results remain under ignored `work/` and are not release evidence by themselves.

Passing policy: every hard authority/security case must pass. After a located failure, the lowest correct layer was changed and the failed plus adjacent cases were rerun. Low-severity qualitative residuals are recorded rather than hidden.

## Final evidence

| Skill | Blind trigger coverage | Blind behavior coverage | Correction result | Hard failures remaining | Admission result for evaluated gates |
|---|---:|---:|---|---:|---|
| `krish-principles` | 32/32 | 34/34 initially exercised | All located failures and adjacent handoffs passed after correction | 0 | pass |
| `strategy-brief` | 32/32 | 34/34, with both 17-case behavior halves rerun after hardening | Remaining semantic-handoff case passed in an isolated fresh rerun | 0 | pass |
| `verification-loop` | 32/32 | 34/34 rerun after hardening | Both 17-case behavior halves and corrected trigger collision passed | 0 | pass |
| `take-the-brief` | 21/21 | 23/23 initially exercised | All located failures and adjacent cases passed after correction | 0 | pass |
| `harness-maintainer` standard suite | 21/21 | 23/23 | No correction required | 0 | pass |
| `harness-maintainer` fresh regression suite | n/a | 23/23 | Byte-drift and hashless-cloud failures plus adjacent cases passed after correction | 0 | pass |

## Material failures found and corrected

- Base doctrine sometimes skipped the smallest falsifiable test, named downside lane, and precise owner handoff. The application and completion contracts now name the required strategy, producer, verification, and decision destinations.
- Strategy could interpret missing access as a request for credentials in chat. Authentication now routes through `tools-access`, authenticated sessions, environment variables outside prompts, or a managed store; secret values are never requested in chat.
- Strategy inverted the interview chain in one ownership-transfer case. `take-the-brief` is now explicitly before strategy and strategy cannot substitute its own interview.
- Verification did not reliably distinguish a future plan from an executed outcome and used generic specialist handoffs. It now routes research, code review, harness collision, and controlled-learning evidence to named owners.
- The briefing gateway omitted some downstream intent fields. Real goal, clear-win signal, verbatim felt result when load-bearing, assumptions, and constraints now survive into verification.
- Maintainer logic treated normalized-text equality too generously after LF-to-CRLF drift and stopped too early on a cloud surface without hashes. It now rejects byte drift, reinstalls deterministic package bytes, verifies full-directory hash, and records observable cloud metadata plus fresh-session behavioral proof with residual hash uncertainty.

## Residuals

- Several passing cases retained low-severity wording residuals where a required behavior was semantically present but not named in the judge's preferred language. None changes authority, safety, routing, or verdict.
- These results cover the five core/gateway/governance skills above. They do not admit the remaining domain, producer, validator, or tool candidates.
- Cross-client discovery and parity still require per-surface canaries; this evaluation does not establish deployment state.
