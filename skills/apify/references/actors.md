# Apify actor catalogue (full reference)

Loaded as needed from `SKILL.md`. Slugs and prices verified against live Store pages around late May 2026; they drift, so confirm on the actor's Pricing tab before committing volume. Where a slug is marked "confirm", the Store display name is correct but the exact `owner/actor` slug should be checked on the page before use.

For the API path, replace the `/` in any slug with `~`: `apify/instagram-scraper` -> `apify~instagram-scraper`.

## Contents
1. Social and discourse
2. Search and web
3. Local and maps
4. LinkedIn and B2B
5. Reviews and product signal
6. Free / no-Apify-needed sources
7. Normalisation schema sketch (for the signal stack)
8. Cost reference

---

## 1. Social and discourse

### X / Twitter
- **`kaitoeasyapi/twitter-scraper`** (confirm slug) ~$0.25 / 1K tweets. Cheapest. Search, profiles, URLs.
- **`apidojo/tweet-scraper`** ~$0.40 / 1K. More robust. The official `apify/twitter-scraper` listing now just routes to these community actors, so start here.
- **`apidojo/twitter-scraper-lite`** lighter, event-based, covers search/URLs/profiles/lists.
- Typical input: `{ "searchTerms": ["ai agents"], "maxItems": 500 }` or `{ "startUrls": [...] }` or `{ "twitterHandles": ["levelsio"] }`. Field names vary by actor; check the schema.
- Output fields: tweet text, author handle/name, created_at, likes/retweets/replies, tweet URL.
- Note: follower/following lists and some gated search may need session cookies. Most read pulls do not.

### Instagram
- **`apify/instagram-scraper`** from $1.50 / 1K. Official.
- Modes: posts, profiles, hashtags. Hashtag discovery is the historically flaky mode (mixed reviews).
- Input: `{ "directUrls": [...] }` or `{ "search": "term", "searchType": "hashtag", "resultsLimit": 200 }`.
- Output: caption, owner, timestamp, likes/comments, media URLs.

### TikTok
- **`clockworks/tiktok-scraper`** $1.70 / 1K. Posts and profiles.
- Input: `{ "profiles": ["handle"], "resultsPerPage": 100 }` or hashtag/search modes.
- Output: video description, author, play/like/comment counts, video URL, music.

### Facebook
- **`apify/facebook-posts-scraper`** $2.00 / 1K. Public posts only.
- Billing differs by event type (profile vs post vs comment). Model the real mix on a 100-row test.

### YouTube
- **`streamers/youtube-scraper`** $2.40 / 1K videos. Video metadata plus transcripts.
- Transcripts are the high-value output: searchable claims at scale from long-form "how we built our AI workflow" content.
- Input: channel URLs, video URLs, or search terms. `maxResults` to cap.
- Output: title, description, transcript, views, channel, published date.

### Reddit
- **`trudax/reddit-scraper`** (confirm slug) pay-per-result, cheap; rental breaks even ~12K results/month.
- Highest signal for practitioner ground truth: r/automation, r/n8n, r/LocalLLaMA, r/SaaS, r/ExperiencedDevs, r/msp.
- Input: subreddit URLs, search terms, or post URLs; `maxItems` and `maxComments` to cap.
- Output: post title/body, author, subreddit, score, comments (text, author, score).

---

## 2. Search and web

### Google SERP
- **`apify/google-search-scraper`** official.
- **`scraperlink/google-search-scraper`** (confirm slug) ~$0.50 / 1K SERPs, billed per full SERP page (~10 results), so roughly ~$0.05 per row. Cheapest.
- Input: `{ "queries": "term one\nterm two", "maxPagesPerQuery": 1, "countryCode": "us" }`.
- Output: title, URL, description, position, related queries, people-also-ask.

### Website to clean Markdown
- **`apify/website-content-crawler`** compute-only, very cheap. The RAG workhorse.
- Crawls a site and emits clean Markdown suitable for chunking/embeddings. Point it at company blogs, careers pages, vendor docs.
- Input: `{ "startUrls": [{ "url": "https://..." }], "maxCrawlPages": 50 }`.
- Output: url, clean Markdown text, title, metadata. Doubles as agent/RAG input.

---

## 3. Local and maps

### Google Maps places
- **`compass/crawler-google-places`** ~$2 to $4 / 1K places. Reliable, pay-per-event. Bypasses the ~120-listing Maps cap.
- **`scraperlink`** Maps (confirm slug) ~$0.50 / 1K if you don't need contact enrichment.
- Input: `{ "searchStringsArray": ["dentist brooklyn"], "maxCrawledPlacesPerSearch": 100 }`.
- Output: name, category, address, phone, website, rating, review count, hours, coordinates. Contact-enrichment add-on costs extra per place.
- Tip: use many categories with fewer search terms per query to avoid false negatives.

### Google Maps reviews
- Maps reviews actors ~$0.05 to $0.50 / 1K reviews. Local/competitor sentiment, owner responses, ratings over time.

---

## 4. LinkedIn and B2B

LinkedIn is the richest public B2B graph and the most aggressively defended. Cookieless actors trade depth for safety; cookie-based ones carry account-ban risk. Default to cookieless.

### Companies
- **`harvestapi` LinkedIn Company Scraper** (confirm slug) from $3 / 1K companies. Firmographics, TAM sizing. No cookies.
- Output: company name, industry, size, HQ, description, follower count, specialties.

### Profiles
- **`dev_fusion/linkedin-profile-scraper`** (confirm slug) cookieless. Input is a list of public `/in/username` URLs you already have.
- **Mass LinkedIn Profile Scraper** (confirm slug) $10 / 1K public profiles, no cookies. For bulk where you have the URLs.
- Output: headline, experience array, skills, education, sometimes email.

### Jobs (revealed org behaviour — the best say-vs-do source)
- **`bebity` LinkedIn Jobs Scraper** (confirm slug) $29.99 / month rental. Hiring-intel volume.
- Use to track who is hiring "Head of AI", "AI enablement", "automation engineer" and in which function. Revealed preference beats any exec post.
- Output: job title, company, location, posted date, seniority, description.

### Pricing-model rule for LinkedIn
Pay-per-result (profiles, companies) scales linearly and is right below ~3K items/month. Bebity Jobs is a rental, so it only pencils out if you run it regularly (daily/weekly hiring sweeps), not for a one-off.

---

## 5. Reviews and product signal

Verify slugs and prices on the Store before use; not priced this session.
- **Trustpilot / G2 / Capterra** review scrapers: product reality, churn signal, "this didn't deliver" language. Great for puncturing hype on a specific AI-tool category.
- **Product Hunt** scraper: what's shipping in AI tooling, launch traction.

---

## 6. Free / no-Apify-needed sources

Don't pay Apify for these:
- **Hacker News**: Algolia API `http://hn.algolia.com/api/v1/search?query=...&tags=story`. Free, fast, same data into the pipeline. Best for the technical-leader layer and "Show HN" AI tooling.
- **Reddit** (light use): official Reddit API has a free tier; Apify only earns its place at volume or when you want zero auth setup.
- **RSS**: company blogs and Substacks often expose feeds; cheaper than crawling.

Rule: Apify earns its place for LinkedIn (jobs/profiles/companies), reviews, X at volume, and Maps. The free APIs cover ~70% of the AI-in-business signal at zero cost and zero ban risk.

---

## 7. Normalisation schema sketch (for the signal stack)

Land every source in one shape so Agatha/Cleo can reason across them and detect the say-vs-do gap. Suggested Supabase table `signal_raw`:

```
id              uuid (pk)
source          text     -- 'reddit' | 'hn' | 'linkedin_jobs' | 'g2' | 'x' | 'linkedin_post'
layer           text     -- 'revealed' | 'narrative'
captured_at     timestamptz
author          text
title           text
body            text
url             text     -- unique; dedup key
metric_primary  numeric  -- score/likes/applicants, source-specific
entity          text     -- company or product, where known
raw             jsonb    -- full original row from the dataset
```

Dedup on `url`. `layer` lets you query the narrative set and the revealed set separately and surface the gap. `raw` keeps the original so you never re-scrape to recover a field.

---

## 8. Cost reference

- Free plan: $5/month platform credit. Covers validation runs across actors.
- Pay-per-result: billed per dataset row. Cap with `maxItems` on the run.
- Rental: flat monthly, unlimited runs. Worth it above ~3K items/month on that target run regularly.
- Compute units: stack on top of actor fees for rental and your own actors. Pay-per-result actors usually bundle compute into the per-row price.
- `maxItems` query param caps billed rows for pay-per-result actors. Set it every time.
- Verify before scaling: last-update under 90 days, success rate 90%+, output schema documented in the README.
