"""
apify.py - thin helper around the Apify v2 API for Krish's fleet.

Handles the footguns from SKILL.md:
  - converts human slug (owner/actor) to the API's owner~actor form
  - Bearer auth (keeps the token out of URLs/logs)
  - always lets you cap cost with max_items
  - run + poll + paginate so you get ALL dataset items, not the run object
  - optional dedup hook before an expensive run

Token: set APIFY_TOKEN in the environment. The canonical value lives in the
tools-access skill (Apify entry). Do not hardcode it here.

Prefer this helper or the official `apify-client` over hand-rolled requests.

Usage:
    from apify import Apify
    apify = Apify()  # reads APIFY_TOKEN from env

    # quick/test pull (<300s), returns items directly
    items = apify.run_sync("apify/google-search-scraper",
                           {"queries": "ai automation"},
                           max_items=50)

    # robust pull of any size: run async, poll, fetch all rows
    items = apify.run_and_collect("trudax/reddit-scraper",
                                  {"searches": ["n8n agents"]},
                                  max_items=500)
"""

import os
import time
import requests

API_BASE = "https://api.apify.com/v2"


class Apify:
    def __init__(self, token=None, session=None):
        self.token = token or os.environ.get("APIFY_TOKEN")
        if not self.token:
            raise RuntimeError(
                "No Apify token. Set APIFY_TOKEN in the environment "
                "(canonical value in the tools-access skill)."
            )
        self.s = session or requests.Session()
        self.s.headers.update({
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
            "User-Agent": "krish-apify/1.0",
        })

    @staticmethod
    def _slug(actor):
        # Store shows owner/actor; the API path needs owner~actor.
        return actor.replace("/", "~")

    def run_sync(self, actor, run_input, max_items=None, clean=True, timeout=300):
        """Run and get dataset items directly. Best for <300s test/small pulls.

        Hard-fails at 300s. For anything bigger use run_and_collect.
        """
        url = f"{API_BASE}/actors/{self._slug(actor)}/run-sync-get-dataset-items"
        params = {"clean": "true" if clean else "false", "timeout": timeout}
        if max_items is not None:
            params["maxItems"] = max_items
        r = self.s.post(url, params=params, json=run_input, timeout=timeout + 30)
        r.raise_for_status()
        return r.json()

    def start_run(self, actor, run_input, max_items=None, timeout=None, memory=None):
        """Start an async run. Returns the run object (has id, defaultDatasetId, status)."""
        url = f"{API_BASE}/actors/{self._slug(actor)}/runs"
        params = {}
        if max_items is not None:
            params["maxItems"] = max_items
        if timeout is not None:
            params["timeout"] = timeout
        if memory is not None:
            params["memory"] = memory
        r = self.s.post(url, params=params, json=run_input, timeout=60)
        r.raise_for_status()
        return r.json()["data"]

    def wait_for_finish(self, run_id, poll_every=5, max_wait=1800):
        """Poll a run until it reaches a terminal status. Returns the run object."""
        deadline = time.time() + max_wait
        terminal = {"SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"}
        while True:
            r = self.s.get(f"{API_BASE}/actor-runs/{run_id}", timeout=30)
            r.raise_for_status()
            run = r.json()["data"]
            if run["status"] in terminal:
                return run
            if time.time() > deadline:
                raise TimeoutError(f"Run {run_id} still {run['status']} after {max_wait}s")
            time.sleep(poll_every)

    def get_dataset_items(self, dataset_id, clean=True, fields=None, page_size=1000):
        """Fetch ALL items from a dataset, paginating offset/limit."""
        items, offset = [], 0
        while True:
            params = {"clean": "true" if clean else "false",
                      "offset": offset, "limit": page_size}
            if fields:
                params["fields"] = ",".join(fields)
            r = self.s.get(f"{API_BASE}/datasets/{dataset_id}/items",
                           params=params, timeout=60)
            r.raise_for_status()
            batch = r.json()
            items.extend(batch)
            if len(batch) < page_size:
                return items
            offset += page_size

    def run_and_collect(self, actor, run_input, max_items=None, fields=None,
                        clean=True, poll_every=5, max_wait=1800):
        """Robust default: start async, poll to completion, fetch all rows.

        Raises if the run did not SUCCEED so you never silently accept a
        green-but-empty result.
        """
        run = self.start_run(actor, run_input, max_items=max_items)
        run = self.wait_for_finish(run["id"], poll_every=poll_every, max_wait=max_wait)
        if run["status"] != "SUCCEEDED":
            raise RuntimeError(f"Actor {actor} run {run['id']} ended {run['status']}")
        items = self.get_dataset_items(run["defaultDatasetId"], clean=clean, fields=fields)
        if not items:
            # SUCCEEDED with zero rows is the 'ran green but wrote nothing' case.
            # Usually a bad query/URL, a geo block, or the actor wrote to the
            # key-value store. Surface it, do not swallow it.
            raise RuntimeError(
                f"Actor {actor} SUCCEEDED but dataset {run['defaultDatasetId']} is empty. "
                "Check input/query, geo, and whether output went to the key-value store."
            )
        return items


def dedup_against_existing(items, key, existing_keys):
    """Drop rows whose `key` (e.g. 'url') is already in existing_keys.

    Call this BEFORE an expensive run is not possible (you scrape first), but
    call it AFTER a cheap discovery pull and BEFORE enrichment/loading, and
    pre-filter input URLs against existing_keys where the actor takes URLs.
    existing_keys is typically a set pulled from Supabase signal_raw.url.
    """
    seen = set(existing_keys)
    out = []
    for it in items:
        k = it.get(key)
        if k and k not in seen:
            seen.add(k)
            out.append(it)
    return out


if __name__ == "__main__":
    # Tiny smoke test: cheap SERP pull, capped at 10 rows.
    apify = Apify()
    rows = apify.run_sync(
        "apify/google-search-scraper",
        {"queries": "agentic ai in business", "maxPagesPerQuery": 1},
        max_items=10,
    )
    print(f"got {len(rows)} rows")
    for row in rows[:3]:
        print("-", row.get("title"), "|", row.get("url"))
