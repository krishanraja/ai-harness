# Independent evidence-research evaluation - 2026-08-05

## Scope

Evaluated `evidence-research` with Claude Code 2.1.222 in safe mode using fresh executor and judge contexts, disabled tools and session persistence, and a USD 1 hard cap per Claude call. Raw outputs remain under ignored `work/`; this report contains redacted outcomes only.

The executor received the full private skill and blind cases. The behavior rubric was disclosed only to the fresh judge.

## Final outcome

- Trigger routing: 21/21 pass.
- Behavior: 23/23 pass after a full correction rerun.
- Initial hard failures: 0.
- Remaining hard failures: 0.

## Located failures and corrections

The first behavior run passed 15/23 cases but exposed missing operational specificity around research thresholds, market exclusions, externally consequential preparation, domain handoffs, and execution evidence. A first correction raised the full result to 21/23. Two low-severity omissions remained: privacy minimization did not explicitly prefer aggregate or deidentified evidence, and strategic handoff did not explicitly identify the judgment that only Krish owns.

Corrections made:

- required a durable research brief naming the decision, change conditions, boundaries and exclusions, freshness horizon, quality floor, time/cost cap, and stop rule;
- required claim matrices to preserve conflicting evidence, publication/event/data dates, retrieval time, and source scope;
- required explicit fact packets to the domain owner and writer, including the `mindmaker` owner for Mindmaker commercial work;
- required execution evidence packets with the approved decision, assumptions, supporting and contrary evidence, authority boundary, verification, expiry, and revisit trigger;
- specified approval-ready preparation for paid sources, expert/vendor contact, account signup, and publication without authorizing those actions;
- required aggregate or deidentified evidence to be preferred over raw personal records, with field-level minimization when record data is necessary;
- required strategy handoffs to name the `KRISH-OWNED CHOICE`, or explicitly state that none remains.

The two final misses and their adjacent inconclusive case passed a focused rerun. The complete 23-case behavior suite then passed with no findings.

## Residual uncertainty

The synthetic suite does not replace live browser, paywall, dynamic-page, PDF/table, private-corpus, or high-stakes domain canaries. Production admission still requires a bounded real research task with citation readback, freshness verification, injection resistance, private-data minimization, correct owner handoff, and cross-client discovery/parity.
