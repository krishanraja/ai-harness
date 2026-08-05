# Harness theory and evidence map

This reference records the current primary sources behind the active-skill quality standard. It is an evidence map, not a substitute for testing the Krish-specific harness.

## Skill architecture and progressive disclosure

- [Anthropic Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview): skills use metadata for discovery and load instructions/resources on demand.
- [Anthropic Agent Skills best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices): concrete trigger descriptions, concise main instructions, progressive disclosure, validation, and evaluation.
- [Claude custom skills management](https://support.claude.com/en/articles/12512180-use-skills-in-claude) and [creation guidance](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills): cloud packaging, enablement, and authoring behavior.
- [OpenAI Codex AGENTS.md guidance](https://learn.chatgpt.com/docs/agent-configuration/agents-md.md) and [skill guidance](https://learn.chatgpt.com/docs/build-skills.md): layered repository instructions and on-demand skills.
- [Cursor rules guidance](https://docs.cursor.com/context/rules-for-ai): focused, scoped rules and client routing.

Implementation consequences:

- metadata must select precisely before bodies consume context;
- main skill files stay executable and concise, with one-level references;
- standalone packages use forward-slash paths, bundle the files they need, and do not assume access beyond their skill directory;
- client adapters may supply shared contracts locally, while standalone skills must fail conservatively when that context is unavailable;
- Claude Cloud chain members rely on independently precise metadata and automatic composition; a skill name in another skill's body is a handoff, not an invocation mechanism;
- large downloaded libraries remain inactive because metadata budget and collisions can hide the personalized routes;
- client adapters stay thin and point to one canonical contract/router.

## Long-running and multi-stage harnesses

- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents): explicit initialization, progress artifacts, structured state, clean checkpoints, and end-to-end verification help agents resume and complete multi-context work.

Implementation consequences:

- strategy, execution, progress, verification, and delivery have explicit handoffs;
- a release is built from a clean commit and records state outside model memory;
- CTRL stages pass structured artifacts rather than relying on conversational recall;
- completion is tied to an observable result, not the agent saying it is done.

## Self-correction limits

- [Huang et al., ICLR: Large Language Models Cannot Self-Correct Reasoning Yet](https://openreview.net/forum?id=IkmD3fKBPQ): intrinsic self-correction without external feedback can degrade correct reasoning.
- [Tyen et al., ACL Findings: LLMs Cannot Find Reasoning Errors, but Can Correct Them!](https://aclanthology.org/2024.findings-acl.826/): correction improves when the error location is supplied.
- [Position bias in LLM-as-a-judge](https://arxiv.org/abs/2406.07791): comparative model judging can be affected by presentation order.

Implementation consequences:

- `verification-loop` locates failures with deterministic or external evidence before correction;
- model self-critique is never the only verifier;
- qualitative comparisons use fresh context and order swaps when stakes justify them;
- two failed correction cycles stop instead of lowering the bar or thrashing.

## Local standard

External guidance establishes useful mechanics, not Krish-specific quality. Production admission additionally requires held-out Krish tasks, collision tests against the actual active set, personal-taste judgment where applicable, and observed value over the prior baseline.
