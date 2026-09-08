/**
 * The routing instruction, in one place, because two things need it.
 *
 * scripts/eval.mjs sends it. scripts/audit-harness.mjs has to know whether the
 * last control was taken against this version or an earlier one, and a control
 * that ran on a different prompt cannot vouch for this one. If each held its own
 * copy they would drift, and the drift would look exactly like a valid control.
 *
 * What is deliberately NOT here: routing rules. Three of them used to sit
 * between the instruction and the descriptions (narrowest skill wins, load
 * nothing on a mere mention, an exact-phrase trigger fires only on that phrase).
 * They were written for the harness and no client sends them, so they were
 * measuring obedience to themselves rather than whether a description is good
 * enough to route on, which is what Gate 2 asks. The 2026-09-08 control showed
 * it: recall moved 0.250 between two models over identical cases and the
 * stronger model scored lower, under-firing on "load nothing when the message
 * merely mentions a topic".
 *
 * The descriptions are the subject. Nothing here may do their job for them.
 */

import { createHash } from 'node:crypto'

export const ROUTER_INSTRUCTION = [
  'You are the skill router for a curated set of agent skills. Given a user message, decide which skills, if any, that message should load.',
  '',
  'Each skill below gives its name and its description. The description is the only thing that says when the skill applies; decide from it alone.',
  '',
  'The available skills:',
  '',
].join('\n')

export const ROUTER_ANSWER_FORMAT = 'Answer with JSON only: {"skills": ["name", ...]} listing every skill that should load, or {"skills": []} for none. No prose.'

/**
 * Identity of the instruction, not of the skills.
 *
 * A skill edit changes the descriptions on purpose and must not invalidate a
 * control. A rewrite of the instruction is exactly what must, so only the
 * instruction and the answer format are hashed.
 */
export const ROUTER_PROMPT_SHA = createHash('sha256')
  .update(ROUTER_INSTRUCTION + '\n' + ROUTER_ANSWER_FORMAT, 'utf8')
  .digest('hex')
  .slice(0, 16)

/** Assemble the full system text around a rendered block of descriptions. */
export function routerSystemText(routerBlock) {
  return ROUTER_INSTRUCTION + routerBlock + '\n\n' + ROUTER_ANSWER_FORMAT
}
