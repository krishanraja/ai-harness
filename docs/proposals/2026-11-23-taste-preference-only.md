# The taste system holds only preference and inspiration, 2026-11-23

Status: ruled by Krish on 2026-11-23.

`Ruling (Krish, 2026-11-23): the taste system holds only preference and inspiration; defects move out of it.`

## Why

Measured on 2026-11-23: 81 of the 403 records on content-engine's rejection floor were process failures, and sessions were told to send every correction to the taste engine. An engine failure filed as taste never reached the internal-auditor.

## What changes here

The canon's taste sentence now sends his preferences to `report_to_taste_engine`, and defects and engine failures to `record_harness_observation`. A correction holding both is split. The exact sort and the move of existing records live in krishanraja/inspirationhouse (`src/rejection/defects.ts`) and content-engine's migration `20261207090000_defects_leave_taste`.

## Bounds

Nothing is deleted. This widens no authority: it changes where a lesson is recorded, and sends, posts and spends keep their own approvals.
