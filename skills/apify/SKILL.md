---
name: apify
description: "Use this skill whenever Krish asks to scrape, pull, extract, or collect public web data via Apify, or to decide which Apify actor to use for a job. Trigger on: Apify, apify.com, the Apify API, 'scrape X', 'pull leads from', 'scrape Reddit/LinkedIn/Instagram/TikTok/Twitter/YouTube/Google Maps/reviews', 'which actor should I use', 'run an actor', 'Apify token', 'dataset items', 'run-sync-get-dataset-items', any actor slug (apify/instagram-scraper, clockworks/tiktok-scraper, compass/crawler-google-places, apidojo/tweet-scraper, harvestapi, bebity, etc.), wiring Apify into n8n or Agatha, feeding scraped data into Supabase or a content/prospecting pipeline, or debugging why an Apify run cost too much, returned nothing, or 'ran green but wrote nothing'. Do NOT call the Apify API or pick an actor without consulting this skill first. Wrong actor slug (the ~ vs / footgun), wrong run endpoint, no maxItems cap, and not deduping are the default failure modes, and this skill exists to prevent them."
---

# Apify

Operator's reference for picking the right Apify actor and running it correctly, cheaply, the first time. Source of truth is `https://docs.apify.com/api/v2` and the live Store pages, mirrored here so Claude does not re-fetch on every task.

Two jobs this skill does:
1. **Routing.** Given a target (Reddit, LinkedIn jobs, Google Maps, a website), tell you which actor to use and what it costs. See section 3 for the inline table, `references/actors.md` for the full catalogue plus input schemas.
2. **Running.** Call the actor API correctly: right slug format, right endpoint, cost capped, results actually fetched. See sections 2 and 4.

Apify charges real money per run. The discipline in section 5 is not optional. Krish has had a cost spike here before.

---

## 1. The things that go wrong every time

Check this before writing any request:

1. **Actor ID uses `~` not `/` in the API path.** The Store shows `apify/instagram-scraper`. The API path needs `apify~instagram-scraper`. Tilde replaces the slash. Get this wrong and you get a 404. This is the single most common Apify failure.
2. **No `maxItems` cap.** Pay-per-result actors bill per row returned. Without `maxItems`, a broad query can return (and bill) tens of thousands of rows. Always set `maxItems` on the run. It caps what you are charged for, not just what you get back.
3. **Wrong cheapness.** For the same target there are often three actors at wildly different prices (Google Maps ranges ~$0.50 to ~$4 per 1K). Cheap plus stale plus low success rate is more expensive than mid-priced and reliable. Check last-update date (under 90 days) and success rate (90%+) before committing volume.
4. **Pay-per-result vs rental math.** Pay-per-result wins below roughly 3K items/month. Monthly rentals (e.g. Bebity LinkedIn Jobs at $29.99/mo) win once you exceed that and run daily. Don't rent for a one-off; don't pay-per-result for a daily standing pull.
5. **Run object is not the data.** `POST .../runs` returns a run object with `id` and `defaultDatasetId`. You then fetch items from the dataset separately. The exception is the `run-sync-get-dataset-items` endpoint, which returns items directly (section 4).
6. **"Ran green but wrote nothing."** Run status SUCCEEDED but the dataset is empty usually means: wrong `defaultDatasetId` read, or the input matched nothing (bad query, bad URL, geo-blocked), or the actor wrote to the key-value store not the dataset. Confirm `defaultDatasetId` from the run object and check the actor README for where it writes.
7. **Sync endpoints time out at 300s.** `run-sync-get-dataset-items` is great for small/test pulls but hard-fails at 5 minutes. For anything bigger, run async and poll, or attach a webhook.
8. **Don't guess input field names.** Every actor has its own input schema. `startUrls`, `searchQueries`, `maxItems`, `resultsLimit` all vary by actor. Read the schema (`references/actors.md` or `GET /v2/actors/{id}/input/schema`), don't paraphrase.
9. **Dedup before running.** Apify charges per run. If the target is already in Supabase or a recent dataset, query that first. (`tools-access` Hard Rule 3.)

---

## 2. Setup

### Base URL
```
https://api.apify.com/v2
```

Canonical actor path prefix is `/v2/actors/`. The older `/v2/acts/` prefix still works (routes to the same handler) and appears all over old docs and the fleet, but use `/v2/actors/` for new code.

### Auth

Token, two ways:
```http
# Preferred (keeps token out of logs/URLs):
Authorization: Bearer {APIFY_TOKEN}

# Documented default (token in query string):
POST https://api.apify.com/v2/actors/{id}/runs?token={APIFY_TOKEN}
```

Prefer the Bearer header. The query-param form leaks the token into request logs and n8n execution history. Both work.

The token lives in the `tools-access` skill (Apify entry, `token` auth type). Load it from there at session start. Do not paste it into chat or commit it. Rotate after any leak.

### Rate limits
- ~250,000 requests/minute per account globally
- Most endpoints: 60 requests/sec
- Dataset and queue endpoints: up to 400 requests/sec
- 429 on breach. Official clients back off automatically; if hand-rolling, use exponential backoff.

### Cleanest path: the official client

For anything non-trivial, the official client handles the `~` mapping, polling, and pagination for you:
```bash
pip install apify-client      # Python
npm install apify-client      # Node
```
It maps `compass/crawler-google-places` to the `~` form automatically, so you can pass the human slug. The Python helper in `scripts/apify.py` wraps the common calls (run + wait + fetch, with maxItems and dedup) if you don't want the full client.

---

## 3. Actor routing table (the ones Krish actually uses)

Prices verified against live Store pages around late May 2026. They drift. Confirm on the actor's Pricing tab before volume. Pay-per-result unless marked rental. Apify platform compute stacks on top.

| Job | Actor (Store slug) | Price | Notes |
|---|---|---|---|
| **X / Twitter** (cheapest) | `kaitoeasyapi/twitter-scraper` | ~$0.25 / 1K tweets | Confirm slug; cheapest tweet pull |
| **X / Twitter** (robust) | `apidojo/tweet-scraper` | ~$0.40 / 1K | Search, profiles, lists. `apidojo/twitter-scraper-lite` is the lighter sibling |
| **Instagram** | `apify/instagram-scraper` | from $1.50 / 1K | Posts, profiles, hashtags. Hashtag mode is the flaky part |
| **TikTok** | `clockworks/tiktok-scraper` | $1.70 / 1K | Posts and profiles |
| **Facebook** | `apify/facebook-posts-scraper` | $2.00 / 1K | Public posts only |
| **YouTube + transcripts** | `streamers/youtube-scraper` | $2.40 / 1K videos | Transcripts are the high-signal output for "how we built it" content |
| **Reddit** | `trudax/reddit-scraper` | pay-per-result, cheap under ~12K/mo | Confirm slug. Ground-truth practitioner threads |
| **Google SERP** | `apify/google-search-scraper` | official; or `scraperlink` ~$0.50 / 1K SERPs | scraperlink bills per SERP page (~10 results), ~10x cheaper per row |
| **Website to Markdown** | `apify/website-content-crawler` | compute-only, very cheap | Clean Markdown. Doubles as RAG input for agents |
| **Google Maps places** | `compass/crawler-google-places` | ~$2 to $4 / 1K places | Reliable, not cheapest. `scraperlink` Maps ~$0.50/1K if no enrichment |
| **Google Maps reviews** | (Maps reviews actor) | ~$0.05 to $0.50 / 1K reviews | Local/competitor sentiment |
| **LinkedIn companies** | `harvestapi` LinkedIn Company Scraper | from $3 / 1K companies | Confirm slug. Firmographics, TAM sizing, no cookies |
| **LinkedIn profiles** | `dev_fusion/linkedin-profile-scraper` | varies, cookieless | Input is `/in/` URLs you already have |
| **LinkedIn profiles (bulk)** | Mass LinkedIn Profile Scraper | $10 / 1K profiles | Confirm slug. No session cookies |
| **LinkedIn jobs** | `bebity` LinkedIn Jobs Scraper | $29.99 / month (rental) | Confirm slug. Hiring intel = revealed org behaviour |

Not priced this session, verify on page before use: **Trustpilot / G2 / Capterra** review scrapers (product reality, churn signal), **Product Hunt** scraper (what's shipping in AI tooling). For **Hacker News** you don't need Apify at all: the Algolia HN API (`http://hn.algolia.com/api/v1/search`) is free and returns the same data straight into a pipeline.

Full catalogue with input-schema snippets and output fields: `references/actors.md`.

---

## 4. Running an actor

### Test runs and small pulls: sync, returns data directly

Best default for under ~300s of work. Returns dataset items in the response body, no separate fetch.

```bash
curl -X POST \
  "https://api.apify.com/v2/actors/apify~google-search-scraper/run-sync-get-dataset-items?token=$APIFY_TOKEN&clean=true" \
  -H "Content-Type: application/json" \
  -d '{ "queries": "ai automation\nagentic workflows", "maxPagesPerQuery": 1 }'
```

Note the `~` in the actor ID. `clean=true` drops empty/hidden fields. The body is the actor's input object (field names are actor-specific).

### Bigger pulls: async run, poll, then fetch

```
1. POST /v2/actors/{id}/runs?token=...        body = input JSON
      -> returns { data: { id, defaultDatasetId, status } }
2. GET  /v2/actor-runs/{runId}?token=...       poll every 5s
      -> until status == "SUCCEEDED" (or "FAILED"/"ABORTED"/"TIMED-OUT")
3. GET  /v2/datasets/{defaultDatasetId}/items?clean=true&limit=1000&offset=0&token=...
      -> paginate offset/limit until fewer than `limit` rows come back
```

### Capping cost on the run (do this every time)

Pass `maxItems` so pay-per-result actors never bill beyond your cap:
```http
POST /v2/actors/{id}/runs?token=...&maxItems=500
```
`maxItems` caps what you are charged for. It does not guarantee the actor stops at exactly that count, but you won't pay past it. Also settable as a query param on the sync endpoint.

### Dataset items query params worth knowing
- `clean=true` -> skips empty and hidden (`#`-prefixed) fields
- `fields=field1,field2` -> pick only these fields, fixes output shape
- `offset` / `limit` -> pagination (`limit` default is no limit; set it)
- `format=json|csv|xlsx` -> export format

### Run options
- `?timeout=300` seconds, `?memory=2048` MB (power of 2, min 128). Higher memory can run faster but costs more compute.

The Python helper `scripts/apify.py` does run + poll + paginate + maxItems + a Supabase dedup hook in one call. Prefer it over hand-rolled requests.

---

## 5. Cost discipline (not optional)

Apify is metered. Before any non-test run:

1. **Dedup first.** Is this target already in Supabase or a recent dataset? Query before scraping. (`tools-access` Hard Rule 3.)
2. **Cap with `maxItems`.** Never run uncapped on a pay-per-result actor.
3. **Test 10 to 100 rows first.** The $5/month free credit covers validation runs. Check the output shape and success rate before scaling.
4. **Right pricing model.** Pay-per-result under ~3K/month; rental for daily standing pulls above that.
5. **Verify response content, not just status.** SUCCEEDED with an empty dataset is a failure (`tools-access` Hard Rule 4). Confirm row count and that the fields you need are populated.
6. **Cheap-but-stale is a trap.** An actor last updated 6 months ago at half the price will fail on layout changes and burn compute on retries. Update-recency beats sticker price.

---

## 6. Worked example: the AI-in-business signal stack

Krish's content engine for commentary on how leaders use AI inside their business. The wedge is the gap between what leaders *say* (narrative layer) and what they *do* (revealed layer). Four sources:

- **Reddit** (`trudax/reddit-scraper`) and **Hacker News** (free Algolia API, no Apify): ground-truth practitioner threads. What actually broke.
- **LinkedIn Jobs** (`bebity`, rental): revealed org behaviour. Who is hiring "Head of AI", "automation engineer", and in which function. Best say-vs-do source.
- **One review scraper** (Trustpilot/G2/Capterra): product reality and churn.

Pipeline: scrape -> normalise to a shared schema -> land in Supabase -> Agatha/Cleo surface the say-vs-do gap. Keep the narrative layer (LinkedIn/X posts) as a foil only, not as signal. See `references/actors.md` for the normalisation schema sketch.

---

## 7. Working with this skill

When Krish asks anything Apify-related:
1. Identify the target and pick the actor from section 3 (or `references/actors.md` for the long tail).
2. Confirm the actor slug on the Store if it's marked "confirm slug", and check last-update + success rate before volume.
3. Translate the slug to the `~` form for the API path.
4. Always set `maxItems`. Dedup first. Test small.
5. Use `scripts/apify.py` or the official `apify-client` rather than hand-rolling requests.
6. Before reporting "Apify is broken," re-run the call and inspect the actual response body and the run object's `defaultDatasetId`. Most "broken" turns out to be the `~` slug, an uncapped/empty input, or reading the run object instead of the dataset.

---

## 8. What this skill does not cover

- **Building your own Apify actor** (custom crawler code). This is store-actor consumption only.
- **n8n wiring.** To run an actor from a workflow, combine this with the `n8n` and `krish-fleet-ops` skills. The Apify node or an HTTP Request node both work; HTTP Request gives more control and lets you set the Bearer header and `maxItems` explicitly.
- **Outbound copy / sequence design** on scraped leads. That's `krish-outbound`. Loading leads into a campaign is `instantly`.
- **Enrichment economics.** Apollo (per-enrichment billing) is a separate tool in `tools-access`; use it for email/contact enrichment after Apify gives you the company or profile list.

For a full scrape-to-outreach pipeline, load `apify` + `instantly` + `krish-outbound` + `tools-access` together.
