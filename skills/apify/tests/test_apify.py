import importlib.util
import json
from pathlib import Path
import sys
import unittest
from urllib.parse import parse_qs, urlparse


MODULE_PATH = Path(__file__).parents[1] / "scripts" / "apify.py"
SPEC = importlib.util.spec_from_file_location("guarded_apify", MODULE_PATH)
apify = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
sys.modules[SPEC.name] = apify
SPEC.loader.exec_module(apify)


def response(status=200, body=None, headers=None):
    return apify.ApiResponse(
        status,
        headers or {},
        json.dumps(body if body is not None else {}).encode("utf-8"),
    )


class FakeTransport:
    def __init__(self, responses):
        self.responses = list(responses)
        self.calls = []

    def request(self, method, url, headers, json_body, timeout):
        self.calls.append((method, url, headers, json_body, timeout))
        result = self.responses.pop(0)
        if isinstance(result, Exception):
            raise result
        return result


class ApifyOperatorTests(unittest.TestCase):
    def client(self, responses):
        transport = FakeTransport(responses)
        client = apify.ApifyOperator(
            "secret-test-token", transport=transport, sleep=lambda _: None, jitter=lambda: 0
        )
        return client, transport

    def test_actor_id_is_normalized_and_rejects_extra_path_parts(self):
        self.assertEqual(apify.ApifyOperator.actor_id("owner/name"), "owner~name")
        self.assertEqual(apify.ApifyOperator.actor_id("owner~name"), "owner~name")
        self.assertEqual(apify.ApifyOperator.actor_id("abc123"), "abc123")
        with self.assertRaises(ValueError):
            apify.ApifyOperator.actor_id("owner/name/extra")

    def test_start_requires_explicit_approval_and_positive_total_cap(self):
        client, transport = self.client([])
        with self.assertRaises(ValueError):
            client.start_run("owner/name", {}, approval_ref="", max_total_charge_usd="1")
        with self.assertRaises(ValueError):
            client.start_run("owner/name", {}, approval_ref="approved", max_total_charge_usd="0")
        self.assertEqual(transport.calls, [])

    def test_start_uses_bearer_and_both_charge_controls(self):
        client, transport = self.client([response(body={"data": {"id": "run-1"}})])
        result = client.start_run(
            "owner/name",
            {"query": "bounded"},
            approval_ref="approval-7",
            max_total_charge_usd="1.25",
            max_items=25,
            build="1.2.3",
        )
        self.assertEqual(result["id"], "run-1")
        _, url, headers, _, _ = transport.calls[0]
        query = parse_qs(urlparse(url).query)
        self.assertEqual(query["maxTotalChargeUsd"], ["1.25"])
        self.assertEqual(query["maxItems"], ["25"])
        self.assertEqual(query["build"], ["1.2.3"])
        self.assertNotIn("token", query)
        self.assertEqual(headers["Authorization"], "Bearer secret-test-token")

    def test_ambiguous_start_is_not_retried(self):
        client, transport = self.client([response(status=503, body={"error": "unknown"})])
        with self.assertRaises(apify.AmbiguousRunStateError):
            client.start_run(
                "owner/name",
                {},
                approval_ref="approval-8",
                max_total_charge_usd="1",
            )
        self.assertEqual(len(transport.calls), 1)

    def test_get_retries_bounded_429_then_succeeds(self):
        client, transport = self.client([
            response(status=429, headers={"Retry-After": "0"}),
            response(body={"data": {"id": "run-1", "status": "RUNNING"}}),
        ])
        self.assertEqual(client.get_run("run-1")["status"], "RUNNING")
        self.assertEqual(len(transport.calls), 2)

    def test_clean_short_pages_use_pagination_total(self):
        headers = {"X-Apify-Pagination-Total": "5"}
        client, transport = self.client([
            response(body=[{"id": 1}], headers=headers),
            response(body=[{"id": 3}], headers=headers),
            response(body=[{"id": 5}], headers=headers),
        ])
        items = client.get_dataset_items("dataset-1", clean=True, page_size=2)
        self.assertEqual([item["id"] for item in items], [1, 3, 5])
        offsets = [parse_qs(urlparse(call[1]).query)["offset"][0] for call in transport.calls]
        self.assertEqual(offsets, ["0", "2", "4"])

    def test_clean_pagination_without_total_fails_closed(self):
        client, _ = self.client([response(body=[{"id": 1}])])
        with self.assertRaises(apify.ApifyError):
            client.get_dataset_items("dataset-1", clean=True, page_size=2)

    def test_empty_success_is_preserved_not_retried_or_fabricated(self):
        client, transport = self.client([
            response(body={"data": {"id": "run-1"}}),
            response(body={"data": {
                "id": "run-1", "status": "SUCCEEDED", "defaultDatasetId": "dataset-1",
                "defaultKeyValueStoreId": "kv-1", "usageTotalUsd": 0.1,
            }}),
            response(body=[], headers={"X-Apify-Pagination-Total": "0"}),
        ])
        result = client.run_and_collect(
            "owner/name",
            {"query": "none"},
            approval_ref="approval-9",
            max_total_charge_usd="0.50",
            cost_finalize_wait=0,
        )
        self.assertEqual(result["outcome"], "succeeded_empty_needs_diagnosis")
        self.assertEqual(result["items"], [])
        self.assertFalse(result["downstream_action_performed"])
        self.assertEqual(sum(call[0] == "POST" and "/runs" in call[1] for call in transport.calls), 1)


if __name__ == "__main__":
    unittest.main()
