# Public read routes

Use for read-only measurement of engagement on posts and comments the fleet has made, and for reading a public publication or profile, when no signed-in browser is needed. These routes are undocumented public endpoints. They were seen working on 18 November 2026, when, by the growth push session's own report, they read 17 of 23 posted comments with no Codex session. Re-check them by 18 December 2026; after that date treat the table as unverified until a live read confirms it. Treat each as a lead: read it live, record the retrieval time, and fall back to a browser session when it fails or its fields change.

They are reads only. Nothing here posts, reacts, follows or signs in.

## Routes

| What you need | Route | Fields seen |
|---|---|---|
| A Substack Note or comment's engagement | `https://substack.com/api/v1/reader/comment/<id>`, where `<id>` is the number in the `c-NNN` part of its link | `reaction_count`, restacks, `children_count` |
| An X post's likes and replies | `https://cdn.syndication.twimg.com/tweet-result?id=<status id>&token=a` | `favorite_count`, `conversation_count`, `in_reply_to_screen_name` |
| A Substack user's publications | `https://substack.com/api/v1/user/<handle>/public_profile` | publications, and `subscriberCount` where the user shows it |
| A publication's recent posts | `<publication url>/api/v1/archive?sort=new&limit=<n>` | title, date, bylines, audience (free or paid only) |
| One post | `<publication url>/api/v1/posts/<slug>` | `body_html` when free; a cut-off preview when paid |
| What a publication shows strangers | the raw HTML of `<publication url>/about` | hero text, the description used for meta, Open Graph and Twitter tags, and author bios, inside the page's embedded preload data |

## No public route found yet

- Instagram comment likes. Record them as unknown unless a browser session already in the plan reads them; do not start one only for this count.

## When the signed-in browser fails

On 18 November 2026, by the growth push session's own report, one read-only Codex pass on the worker's signed-in Chromium timed out on X, on two Substack About pages and on four of five Instagram comment pages. Plan every browser task with the public route above as its fallback before it starts. An item neither route read is recorded as unverified, and a task with an unverified item is still open, not done.

## Rendering a public page without Playwright

`verification-loop` owns the rule (a stranger's view, never Krish's signed-in profile). Where Playwright is not installed, Chrome can dump the rendered page on its own:

```text
google-chrome --headless=new --no-sandbox --user-data-dir=<new empty folder> --dump-dom <url>
```

## Recording what you read

Record the route, the retrieval time and the raw counts beside each item. A count read at one age (say 47 hours) is not comparable with one read at another; say the age. A missing field is unknown, not zero.
