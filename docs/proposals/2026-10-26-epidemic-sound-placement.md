# Epidemic Sound joins the tool map, 2026-10-26

Status: placed by Krish on 2026-10-26. Recorded here; not yet in Control Center's tool value catalog, which is where placements are read from. Nothing has been downloaded, generated or spent.

## Ruling

- Ruling (Krish, 2026-10-26): Epidemic Sound is a tool for his ventures, to produce Full Time and Heartside creatives and makeyourmindup content.

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

Not checked: the account's plan, whether downloads, edits or voiceovers count against an allowance, and the reset date. The connector exposes no account or plan read.

## Gates that stay closed

- **Licence before publication.** Epidemic Sound's Creator plan covers a creator's own channels, one monetised channel per platform, and excludes digital ads. Ads and business channels need the Pro plan, Business plan or Enterprise. Pro excludes cinema, TV shows and TV ads, and companies over $10m a year. Source: epidemicsound.com plan pages, read 2026-10-26; confirm current terms before relying on them. A Heartside or Full Time asset carrying Epidemic Sound music is not published, posted or used in an ad until the account's plan is confirmed to cover that use. Publication still needs his approval each time.
- **Voiceover is not his voice.** For makeyourmindup and Mindmake outbound, his voice is the ElevenLabs or HeyGen clone (Ruling, Krish, 2026-10-22). Epidemic Sound's stock voices may narrate only where his voice is not implied. They are never presented as him.
- **Record the track.** Every asset records its venture, outcome and asset (2026-10-22 allocation, section 4), plus the Epidemic Sound recording ID and edit ID, so the licence can be traced later.
- **Production belongs to the venture.** Heartside creative runs in `krishanraja/growth-heartside`, not in a harness session (Ruling, Krish, 2026-10-22).

## The request for Control Center

Placements are read from Control Center's `get_tool_value_catalog` (version 2026-10-22.1 on 2026-10-26, no Epidemic Sound entry). That catalog lives in `krishanraja/control-center`, which this session could not open. The change it needs:

```json
{"tool":"Epidemic Sound","value":"Licensed music, stems, sound effects and edit-to-length for video","use_when":"A video, short or ad needs a soundtrack or sound effects the account's plan licenses for that channel","idea":"Cut a licensed track to the exact length of an approved edit, then record its recording ID with the asset"}
```

```json
{"tool":"Epidemic Sound","main":["heartside","full_time","publication"],"some":[],"note":"Music and sound effects for Heartside and Full Time creatives and makeyourmindup content. Confirm the plan licenses the channel (ads need Pro or above) before publishing. Stock voiceover is never presented as Krish."}
```

The first goes in the `tools` list, the second in `placements.tools`, with `placements.ruled_on` moved to 2026-10-26.

## Proof before it counts

- `get_tool_value_catalog` returns both entries above.
- A fresh session asked to soundtrack a Heartside clip picks Epidemic Sound, checks the plan gate before any publication step, and records the recording ID with the asset.
