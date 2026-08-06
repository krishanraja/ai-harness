# Instantly handoffs

Keep one primary owner per job:

| Job | Owner | Packet passed to Instantly operator |
|---|---|---|
| Audience, offer, sequence arc, proof, CTA, success metric | `krish-content-marketer` | Approved targeting/strategy and exclusions |
| Final subject/body/personalisation/signature | `krish-voice` | Locked copy revision and variables |
| Authenticated workspace and scopes | `tools-access` | Value-free access record |
| n8n nodes, retries, item schemas, error routes | `n8n-operator` | Verified provider request/response contract |
| Cross-system code or deployment | `krish-build` | Provider contract, rollback, acceptance criteria |
| Final proof | `verification-loop` | Provider readback, counts, downstream outcome |

The Instantly operator owns only provider mechanics: resolving resources, validating live API contracts and payloads, executing an exactly approved provider action, and reading the result back.

For analytics, separate provider metrics from business interpretation. Retrieve complete bounded data with cursor/time window and hand the evidence to the relevant commercial owner. Do not infer copy quality, consent, or commercial success from open/reply counts alone.
