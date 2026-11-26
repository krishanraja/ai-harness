# Provider-operator extraction review — 2026-08-06

## Sources

- User-managed Claude Cloud archives: `n8n`, `instantly`, `krish-fleet-ops`, and `krish-outbound`, exported and hash-preserved before review.
- Local unprovenanced variants: `N8N`, `n8n-cli`, and `fleet-ops` across user skill directories.
- Current primary documentation reviewed on 2026-08-06: official n8n documentation and official Instantly API reference.

Provider/source licenses for the user-authored archives and local unprovenanced variants are unknown. No third-party code or long copied documentation was admitted. Durable mechanics were rewritten and checked against primary sources.

## Security and freshness findings

The archived n8n/fleet material contains credential values, private operational identifiers, volatile workflow maps, schedules, schemas, and dated runtime claims. The Instantly archive references missing bundled files and embeds provider claims that require live revalidation. The legacy n8n CLI skill advertises destructive commands and local credential storage without Krish's authority gates or downstream readback.

No credential value, private identifier, live recipient data, current fleet map, or copied runtime snapshot was transferred into the candidate artifacts. Sensitive remediation remains deferred by prior user instruction.

## Disposition

- Admit candidate `n8n-operator` as the distinct n8n provider producer/operator, behind held-out evaluation and canary gates.
- Admit candidate `instantly-operator` as the distinct Instantly provider operator, behind held-out evaluation and canary gates.
- Route live fleet identity and architecture to `mindmaker-os`; preserve durable fleet reconciliation as a one-level reference.
- Route outbound strategy to `krish-content-marketer` and outbound expression to `krish-voice`; do not create a competing outbound producer.
- Keep legacy cloud skills only until the candidate release passes and Krish approves exact replacements/retirement.

## Overlap decision

The two provider operators each have a distinct trigger, repeatable workflow, bounded authority, owned verification method, and less than 20% functional overlap with their context and prose owners. `krish-fleet-ops` and `krish-outbound` fail the missing-skill test because existing owners can absorb their durable logic without a competing route.
