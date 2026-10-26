# Epidemic Sound joins the tool map, 2026-10-26

Status: placed by Krish on 2026-10-26, and live in Control Center's tool value catalog, where sessions read placements (krishanraja/control-center#565). Nothing has been downloaded, generated or spent.

## Ruling

- Ruling (Krish, 2026-10-26): Epidemic Sound is a tool for his ventures, to produce Full Time and Heartside creatives and makeyourmindup content.
- Ruling (Krish, 2026-10-26): Heartside and Full Time creatives go on his own channels, not paid ads. This corrects the first reading here, which treated paid ads as a possible use.

Read as placements, in the catalog's venture slugs: **Main** on `heartside`, `full_time` and `publication` (makeyourmindup), **Some** on none. He named the three uses together and set no split between them, so none is recorded as Some.

## What this moves

The North Star's second line: a fleet of agents running Mindmake's daily operations to his standard. Before today, the only music route on the map was Runway's `generate_music`, paid from the Runway credits placed on Heartside and Full Time. makeyourmindup had no music tool placed at all. Epidemic Sound adds a licensed library with stems and edit-to-length for all three. The router can now pick it for music in those three places without asking him again.

Decision rules (`KRISH.md`):

- Rule 3 passes for Heartside: Christmas orders land inside 90 days, and video needs a soundtrack.
- Rule 8 is not tripped. Rule 8 protects Krish's own time in music. An agent choosing a licensed track for an approved edit does not use his time. Any step that would need his own hours choosing or making music gets flagged first.

## What the connector does, read 2026-10-26

| Fact | Source |
|---|---|
| Connected and answering in a Claude Code cloud session | `SearchRecordings`, term "warm cosy acoustic christmas": 500 matches, each with BPM, mood and genre tags, credits and bass, drums, instruments and vocals stems |
| Music search by term, topic, mood, genre, BPM, key, duration, vocals, or a Spotify track to match | `SearchRecordings`, `SearchSimilarToRecording`, `SearchExternalReferences` schemas |
| Sound effects search | `SearchSoundEffects`, `SearchSimilarToSoundEffect` |
| Cut a track to an exact length (up to 300 seconds), loopable, keeping chosen regions at set offsets | `EditRecording`, then `PollEditRecordingJob`, then `DownloadRecordingEdit` |
| Download as MP3 or WAV, full mix or one stem | `DownloadRecording` returns a signed URL |
| Text-to-speech with stock voices, plus voices made on the account | `ListVoices`, `ListUserGeneratedVoices`, `GenerateVoiceover` |

The plan, read from his Epidemic Sound receipt in Gmail (12 October 2026): **Creator**, on a free trial, $19.59 a month from 12 November 2026 unless cancelled. No later upgrade email. The connector itself exposes no account or plan read. Not checked: whether downloads, edits or voiceovers count against an allowance.

## Gates that stay closed

- **Own channels only.** Everything made with it goes on Krish's own channels, never paid ads (his ruling above). The Creator plan covers that: own channels, one monetised channel per platform, no digital ads. Pro covers up to three channels per platform. Source: epidemicsound.com Creator plan page, read 2026-10-26. If two of Heartside, Full Time and makeyourmindup monetise on the same platform, moving to Pro is his call; Control Center's `NOW.md` carries the question. Publication still needs his approval each time.
- **Voiceover is not his voice.** For makeyourmindup and Mindmake outbound, his voice is the ElevenLabs or HeyGen clone (Ruling, Krish, 2026-10-22). Epidemic Sound's stock voices may narrate only where his voice is not implied. They are never presented as him.
- **Record the track.** Every asset records its venture, outcome and asset (2026-10-22 allocation, section 4), plus the Epidemic Sound recording ID and edit ID, so the licence can be traced later.
- **Production belongs to the venture.** Heartside creative runs in `krishanraja/growth-heartside`, not in a harness session (Ruling, Krish, 2026-10-22).

## In Control Center

Placements are read from Control Center's `get_tool_value_catalog`. krishanraja/control-center#565 (merged 2026-10-26) added both entries to `api/harness/_tool-value-catalog.ts`: the value line in `tools`, and the placement (Main on `heartside`, `full_time` and `publication`) in `placements.tools`, with its own-channels and plan note. The catalog moved to version 2026-10-26.1, ruled on 2026-10-26. `tests/api/economicsMcp.test.ts` holds the placement.

## Proof before it counts

- `get_tool_value_catalog` returns both entries (see the readback in the commit that marked this live).
- A fresh session asked to soundtrack a Heartside clip picks Epidemic Sound, checks the plan gate before any publication step, and records the recording ID with the asset.
