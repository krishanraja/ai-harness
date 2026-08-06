"""Dependency-free guarded helper for approved Apify v2 REST runs.

This module never discovers credentials, selects an Actor, or infers approval.
Every run requires an explicit approval reference and positive USD charge cap.
Run creation is never retried automatically because a lost response can hide a
created, chargeable run. Prefer the official ``apify-client`` for production.
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
import hashlib
import json
import os
import random
import re
import time
from typing import Any, Callable, Mapping
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


API_BASE = "https://api.apify.com/v2"
TERMINAL_STATUSES = {"SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"}


class ApifyError(RuntimeError):
    """Base error with no credential-bearing request representation."""


class ApifyApiError(ApifyError):
    def __init__(self, status: int, message: str):
        super().__init__(f"Apify API returned HTTP {status}: {message}")
        self.status = status


class AmbiguousRunStateError(ApifyError):
    """A run may have been created; reconcile it before any retry."""


@dataclass(frozen=True)
class ApiResponse:
    status: int
    headers: Mapping[str, str]
    body: bytes

    def json(self) -> Any:
        return json.loads(self.body.decode("utf-8"))


class UrllibTransport:
    def request(
        self,
        method: str,
        url: str,
        headers: Mapping[str, str],
        json_body: Any | None,
        timeout: float,
    ) -> ApiResponse:
        body = None if json_body is None else json.dumps(
            json_body, sort_keys=True, separators=(",", ":")
        ).encode("utf-8")
        request = Request(url, data=body, headers=dict(headers), method=method)
        try:
            with urlopen(request, timeout=timeout) as response:  # nosec: caller controls official API target
                return ApiResponse(response.status, dict(response.headers.items()), response.read())
        except HTTPError as exc:
            error_body = exc.read() if exc.fp else b""
            return ApiResponse(exc.code, dict(exc.headers.items()) if exc.headers else {}, error_body)


class ApifyOperator:
    def __init__(
        self,
        token: str | None = None,
        *,
        transport: Any | None = None,
        sleep: Callable[[float], None] = time.sleep,
        jitter: Callable[[], float] = random.random,
    ) -> None:
        self._token = token or os.environ.get("APIFY_TOKEN")
        if not self._token:
            raise ApifyError("APIFY_TOKEN is not available from the approved runtime environment.")
        self._transport = transport or UrllibTransport()
        self._sleep = sleep
        self._jitter = jitter
        self._headers = {
            "Authorization": f"Bearer {self._token}",
            "Content-Type": "application/json",
            "User-Agent": "mindmaker-apify-operator/2.0",
        }

    @staticmethod
    def actor_id(actor: str) -> str:
        value = actor.strip()
        if re.fullmatch(r"[A-Za-z0-9_-]+", value):
            return value
        if re.fullmatch(r"[A-Za-z0-9_.-]+[~/][A-Za-z0-9_.-]+", value):
            return value.replace("/", "~")
        raise ValueError("Actor must be an API ID or one owner/name (or owner~name) pair.")

    @staticmethod
    def input_sha256(run_input: Mapping[str, Any]) -> str:
        canonical = json.dumps(
            run_input, sort_keys=True, separators=(",", ":"), ensure_ascii=False
        ).encode("utf-8")
        return hashlib.sha256(canonical).hexdigest()

    @staticmethod
    def _run_authority(approval_ref: str, max_total_charge_usd: Decimal | float | str) -> str:
        if not approval_ref or not approval_ref.strip():
            raise ValueError("An explicit approval_ref is required for every run.")
        try:
            cap = Decimal(str(max_total_charge_usd))
        except InvalidOperation as exc:
            raise ValueError("max_total_charge_usd must be a positive USD amount.") from exc
        if not cap.is_finite() or cap <= 0:
            raise ValueError("max_total_charge_usd must be a positive USD amount.")
        return format(cap, "f")

    @staticmethod
    def _with_query(path: str, params: Mapping[str, Any] | None = None) -> str:
        filtered = {key: value for key, value in (params or {}).items() if value is not None}
        query = urlencode(filtered)
        return f"{API_BASE}{path}" + (f"?{query}" if query else "")

    def _request(
        self,
        method: str,
        path: str,
        *,
        params: Mapping[str, Any] | None = None,
        json_body: Any | None = None,
        timeout: float = 60,
        read_retries: int = 0,
    ) -> ApiResponse:
        url = self._with_query(path, params)
        for attempt in range(read_retries + 1):
            try:
                response = self._transport.request(method, url, self._headers, json_body, timeout)
            except (URLError, TimeoutError, OSError) as exc:
                if method != "GET" or attempt >= read_retries:
                    raise ApifyError(f"Apify {method} transport failed; state is unverified.") from exc
                response = None
            if response is not None and response.status < 400:
                return response
            retryable = response is None or response.status == 429 or response.status >= 500
            if method != "GET" or not retryable or attempt >= read_retries:
                if response is None:
                    raise ApifyError(f"Apify {method} failed after bounded read retries.")
                preview = response.body.decode("utf-8", errors="replace")[:200]
                raise ApifyApiError(response.status, preview or "no response body")
            retry_after = response.headers.get("Retry-After") if response is not None else None
            try:
                delay = float(retry_after) if retry_after is not None else (2**attempt + self._jitter())
            except ValueError:
                delay = 2**attempt + self._jitter()
            self._sleep(min(delay, 30.0))
        raise AssertionError("unreachable")

    def get_actor(self, actor: str) -> Mapping[str, Any]:
        response = self._request("GET", f"/actors/{self.actor_id(actor)}", read_retries=3)
        return response.json()["data"]

    def validate_input(
        self, actor: str, run_input: Mapping[str, Any], *, build_tag: str | None = None
    ) -> Mapping[str, Any]:
        params = {"build": build_tag} if build_tag else None
        response = self._request(
            "POST",
            f"/actors/{self.actor_id(actor)}/validate-input",
            params=params,
            json_body=run_input,
        )
        return response.json()

    def start_run(
        self,
        actor: str,
        run_input: Mapping[str, Any],
        *,
        approval_ref: str,
        max_total_charge_usd: Decimal | float | str,
        max_items: int | None = None,
        build: str | None = None,
        timeout_secs: int | None = None,
        memory_mbytes: int | None = None,
    ) -> Mapping[str, Any]:
        cap = self._run_authority(approval_ref, max_total_charge_usd)
        if max_items is not None and max_items <= 0:
            raise ValueError("max_items must be positive when supplied.")
        params = {
            "maxTotalChargeUsd": cap,
            "maxItems": max_items,
            "build": build,
            "timeout": timeout_secs,
            "memory": memory_mbytes,
        }
        path = f"/actors/{self.actor_id(actor)}/runs"
        try:
            response = self._request("POST", path, params=params, json_body=run_input)
        except (ApifyError, OSError) as exc:
            raise AmbiguousRunStateError(
                "Run start was not confirmed. Do not retry; reconcile recent runs in the approved account."
            ) from exc
        return response.json()["data"]

    def get_run(self, run_id: str) -> Mapping[str, Any]:
        response = self._request("GET", f"/actor-runs/{run_id}", read_retries=3)
        return response.json()["data"]

    def wait_for_terminal(
        self, run_id: str, *, poll_every: float = 5, max_wait: float = 1800
    ) -> Mapping[str, Any]:
        deadline = time.monotonic() + max_wait
        while True:
            run = self.get_run(run_id)
            if run.get("status") in TERMINAL_STATUSES:
                return run
            if time.monotonic() >= deadline:
                raise ApifyError(
                    f"Run {run_id} remains non-terminal after the wait budget; it was not aborted or restarted."
                )
            self._sleep(poll_every)

    def get_dataset_items(
        self,
        dataset_id: str,
        *,
        clean: bool = False,
        fields: list[str] | None = None,
        page_size: int = 1000,
    ) -> list[dict[str, Any]]:
        if page_size <= 0:
            raise ValueError("page_size must be positive.")
        items: list[dict[str, Any]] = []
        offset = 0
        total: int | None = None
        while total is None or offset < total:
            response = self._request(
                "GET",
                f"/datasets/{dataset_id}/items",
                params={
                    "format": "json",
                    "clean": "true" if clean else "false",
                    "fields": ",".join(fields) if fields else None,
                    "offset": offset,
                    "limit": page_size,
                },
                read_retries=3,
            )
            batch = response.json()
            if not isinstance(batch, list):
                raise ApifyError("Dataset items response was not a JSON array.")
            items.extend(batch)
            raw_total = response.headers.get("X-Apify-Pagination-Total")
            if raw_total is not None:
                total = int(raw_total)
                offset += page_size
                continue
            if clean:
                raise ApifyError(
                    "Clean pagination lacks X-Apify-Pagination-Total; completeness is unverified. "
                    "Use the official iterate_items client or retry without clean."
                )
            if len(batch) < page_size:
                break
            offset += page_size
        return items

    def run_and_collect(
        self,
        actor: str,
        run_input: Mapping[str, Any],
        *,
        approval_ref: str,
        max_total_charge_usd: Decimal | float | str,
        max_items: int | None = None,
        build: str | None = None,
        fields: list[str] | None = None,
        poll_every: float = 5,
        max_wait: float = 1800,
        cost_finalize_wait: float = 10,
    ) -> Mapping[str, Any]:
        cap = self._run_authority(approval_ref, max_total_charge_usd)
        started = self.start_run(
            actor,
            run_input,
            approval_ref=approval_ref,
            max_total_charge_usd=cap,
            max_items=max_items,
            build=build,
        )
        run = self.wait_for_terminal(started["id"], poll_every=poll_every, max_wait=max_wait)
        if cost_finalize_wait > 0:
            self._sleep(cost_finalize_wait)
            run = self.get_run(started["id"])
        dataset_id = run.get("defaultDatasetId")
        items = self.get_dataset_items(dataset_id, clean=False, fields=fields) if dataset_id else []
        status = run.get("status")
        if status != "SUCCEEDED":
            outcome = "incomplete_terminal_run"
        elif not items:
            outcome = "succeeded_empty_needs_diagnosis"
        else:
            outcome = "succeeded_with_items"
        return {
            "actor": actor,
            "approval_ref": approval_ref,
            "input_sha256": self.input_sha256(run_input),
            "max_total_charge_usd": cap,
            "max_items": max_items,
            "run": run,
            "items": items,
            "outcome": outcome,
            "downstream_action_performed": False,
        }


def deduplicate_rows(
    items: list[Mapping[str, Any]], key: str, existing_keys: set[Any] | None = None
) -> list[Mapping[str, Any]]:
    """Deduplicate collected rows. This does not recover already-incurred scrape cost."""
    seen = set(existing_keys or set())
    output: list[Mapping[str, Any]] = []
    for item in items:
        value = item.get(key)
        if value is not None and value not in seen:
            seen.add(value)
            output.append(item)
    return output


if __name__ == "__main__":
    raise SystemExit("Import this guarded helper; it intentionally has no spend-capable CLI.")
