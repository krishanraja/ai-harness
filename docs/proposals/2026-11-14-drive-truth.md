# Proposal: harness text names only Drive folders that exist

Status: skills fixed 2026-11-14; the operating contract's File routing waits on Krish
Source: fleet integration plan I-15 (ai-harness half), "Drive by id".

## What was wrong

Krish's Drive was reorganised on 2026-10-22 (filearchives `docs/DECISIONS.md`
D-031, locked): `CURRENT` and `PERSONAL-SYSTEMS` no longer exist; business work
lives in `Ventures` (`Active Ventures`, one folder per venture), personal
material in `Family Admin\Krish`, and an AI session files what it cannot place
in `Inbox from My AI` at the top of his Drive (content-engine `docs/DRIVE.md`,
"The top of his Drive", Krish, 2026-10-24). The live `system_config
drive_destinations` (updated 2026-10-28) agrees: roots `Ventures`, `--ARCHIVE`
and `Family Admin`, `inbox` the Inbox from My AI.

The harness still named the old tree:

- `skills/tools-access/SKILL.md` rule 11: `CURRENT, ARCHIVE or Ventures` and a
  fallback to `CURRENT/00_INBOX`.
- `skills/video-engine/SKILL.md` step 3:
  `drive_root/Ventures/Active/Mindmaker/04_Content/Video Engine`, a path that
  moved to `makeyourmindup > Video Engine` and is read by folder ID.
- `contract/krish-operating-contract.md`, File routing, routes 3, 5 and 6
  (`drive_root/Personal/...`, `drive_root/Ventures/_Knowledge/...`,
  `drive_root/Ventures/Active/`), and `contract/paths.yaml` `rules_file`
  (`Ventures\Active\Mindmaker-OS\architecture\RULES.md`; the one RULES.md on
  Drive dates from 2026-10-04, before the reorganisation).

## The change

Name roots by what `drive_destinations` holds and folders by the owning
repository's Drive map (content-engine `docs/DRIVE.md`, growth-heartside
`docs/DRIVE-MAP.md`), never by a path restated here: Drive moves, IDs and the
map follow it. The two skills change in one pull request; the contract's File
routing is canon and goes to Krish as its own proposal.
