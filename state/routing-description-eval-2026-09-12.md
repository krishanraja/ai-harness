# Rejected routing-description comparison, 2026-09-12

Status: rejected before release. The shorter descriptions were not promoted.

## Method

A fresh ephemeral Codex process received the complete 29-skill name and description
catalogue plus all trigger cases for the four edited descriptions. The prompt omitted
`should_trigger`, expected routes, reasons, and behavior requirements. It asked for
selected skill names only and ran read-only without repository tool use.

The same procedure ran once against `origin/main` descriptions and once against the
candidate descriptions. This is a stochastic blind classification comparison, not a
live-client trigger canary and not evidence about behavior after routing.

## Results

| Skill | Baseline | Candidate | Delta |
|---|---:|---:|---:|
| build-apps-with-krish | 21/24 | 21/24 | 0 |
| ctrl-intake | 23/23 | 23/23 | 0 |
| krish-design | 17/21 | 17/21 | 0 |
| krish-voice | 21/21 | 21/21 | 0 |

The candidate did not reduce classification accuracy in this comparison, but this
was not a live-client canary. It therefore could not prove that removed explicit
trigger phrases were non-load-bearing. The four descriptions were restored to their
previously released text before merge. The three persistent build-apps and four
persistent krish-design misses remain visible baseline limitations.

## Scratch evidence

- Baseline output SHA-256:
  `EBD96C947941B536CDB1C489143D3C7DBDBEFBE2965C10441C1EB10B728181AA`
- Initial candidate output SHA-256:
  `FECA8C902E366DDE17BF8929ECE67A9721610B570ECB78884E97C5725238505C`
- Corrected build-apps candidate output SHA-256:
  `6944E72B9EEEACF1E160712AC9D9F3A31772028100113F8A783EEE192D00194D`

The underlying value-free outputs remain in the operator's local scratch area for
review. They are not release artifacts and do not become a second evaluation source
of truth.
