#!/usr/bin/env python3
"""Tests for the VPS clock. Standard library only:

    python3 -m unittest discover -s scripts/vps -p 'test_*.py'
"""

from __future__ import annotations

import datetime as dt
import io
import json
import os
import sys
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import clock  # noqa: E402

UTC = dt.timezone.utc
CONFIG = Path(__file__).resolve().parent / "clock.json"
FAKE_TOKEN = "fake-clock-token-for-tests"


def at(*parts: int) -> dt.datetime:
    return dt.datetime(*parts, tzinfo=UTC)


class FakeApi:
    def __init__(self, dispatch_ok: bool = True, proof: bool | None = False):
        self.dispatch_ok = dispatch_ok
        self.proof_value = proof
        self.dispatches: list[str] = []
        self.proof_checks = 0

    def dispatch(self, entry):
        self.dispatches.append(entry.name)
        return (self.dispatch_ok, "HTTP 204" if self.dispatch_ok else "HTTP 401 token rejected")

    def proof(self, entry, slot):
        self.proof_checks += 1
        return self.proof_value


def entries():
    return clock.load_config(CONFIG)


def run_ticks(api, start, minutes, state=None, step=5):
    state = {} if state is None else state
    events = []
    for offset in range(0, minutes + 1, step):
        events += clock.tick(entries(), state, start + dt.timedelta(minutes=offset), api)
    return state, events


class SlotMaths(unittest.TestCase):
    def setUp(self):
        self.entry = entries()[0]

    def utc_slot(self, y, m, d):
        return self.entry.slot_for(dt.date(y, m, d)).astimezone(UTC)

    def test_nine_new_york_is_thirteen_utc_in_summer_and_fourteen_in_winter(self):
        self.assertEqual(self.utc_slot(2026, 7, 1), at(2026, 7, 1, 13, 0))
        self.assertEqual(self.utc_slot(2026, 12, 1), at(2026, 12, 1, 14, 0))

    def test_daylight_saving_change_days_resolve(self):
        self.assertEqual(self.utc_slot(2026, 3, 8), at(2026, 3, 8, 13, 0))    # spring forward
        self.assertEqual(self.utc_slot(2026, 11, 1), at(2026, 11, 1, 14, 0))  # fall back

    def test_a_wall_time_that_does_not_exist_still_fires_once(self):
        entry = clock.Entry(**{**self.entry.__dict__, "at": "02:30"})
        slot = entry.slot_for(dt.date(2026, 3, 8)).astimezone(UTC)
        self.assertEqual(slot, at(2026, 3, 8, 7, 30))

    def test_no_slot_before_it_opens_or_after_it_gives_up(self):
        self.assertIsNone(self.entry.current_slot(at(2026, 10, 4, 12, 59)))
        self.assertIsNotNone(self.entry.current_slot(at(2026, 10, 4, 13, 0)))
        self.assertIsNone(self.entry.current_slot(at(2026, 10, 4, 17, 0)))

    def test_weekday_only_entries_skip_weekends(self):
        entry = clock.Entry(**{**self.entry.__dict__, "days": ("mon", "tue", "wed", "thu", "fri")})
        self.assertIsNone(entry.current_slot(at(2026, 10, 4, 13, 5)))   # a Sunday
        self.assertIsNotNone(entry.current_slot(at(2026, 10, 5, 13, 5)))


class OncePerSlot(unittest.TestCase):
    def test_dispatches_once_at_the_slot_and_not_again_before_the_proof_is_due(self):
        api = FakeApi(proof=False)
        state, _ = run_ticks(api, at(2026, 10, 4, 12, 50), 35)
        self.assertEqual(api.dispatches, ["lozatron-briefing"])
        self.assertEqual(api.proof_checks, 0)
        self.assertIn("2026-10-04T09:00", state["slots"]["lozatron-briefing"])

    def test_proof_found_settles_the_slot_with_no_second_dispatch(self):
        api = FakeApi(proof=True)
        state, events = run_ticks(api, at(2026, 10, 4, 13, 0), 60)
        self.assertEqual(len(api.dispatches), 1)
        record = state["slots"]["lozatron-briefing"]["2026-10-04T09:00"]
        self.assertEqual(record["outcome"], "proved")
        self.assertEqual(api.proof_checks, 1, "a settled slot is never checked again")
        self.assertIn("proved", [event.action for event in events])

    def test_proof_missing_re_dispatches_exactly_once_then_waits(self):
        api = FakeApi(proof=False)
        state, _ = run_ticks(api, at(2026, 10, 4, 13, 0), 200)
        self.assertEqual(len(api.dispatches), 2, "max_dispatches is 2, whatever happens")
        self.assertNotIn("outcome", state["slots"]["lozatron-briefing"]["2026-10-04T09:00"])

    def test_a_late_delivery_after_the_last_dispatch_is_still_seen(self):
        api = FakeApi(proof=False)
        state, _ = run_ticks(api, at(2026, 10, 4, 13, 0), 120)
        api.proof_value = True
        state, _ = run_ticks(api, at(2026, 10, 4, 15, 5), 0, state)
        self.assertEqual(state["slots"]["lozatron-briefing"]["2026-10-04T09:00"]["outcome"], "proved")

    def test_still_missing_at_give_up_is_recorded_as_missed_once(self):
        api = FakeApi(proof=False)
        state, events = run_ticks(api, at(2026, 10, 4, 13, 0), 300)
        record = state["slots"]["lozatron-briefing"]["2026-10-04T09:00"]
        self.assertEqual(record["outcome"], "missed")
        self.assertEqual([e.action for e in events].count("missed"), 1)

    def test_a_refused_dispatch_is_retried_once_not_every_tick(self):
        api = FakeApi(dispatch_ok=False, proof=False)
        run_ticks(api, at(2026, 10, 4, 13, 0), 200)
        self.assertEqual(len(api.dispatches), 2)


class ClockOutages(unittest.TestCase):
    def test_coming_back_inside_the_window_dispatches_late(self):
        api = FakeApi(proof=True)
        state = {"first_tick": "2026-10-01T00:00:00Z"}
        _, events = run_ticks(api, at(2026, 10, 4, 15, 30), 0, state)
        self.assertEqual(len(api.dispatches), 1)
        self.assertIn("late start", events[0].detail)

    def test_every_window_the_clock_slept_through_is_recorded(self):
        api = FakeApi()
        state = {"first_tick": "2026-10-01T00:00:00Z"}
        _, events = run_ticks(api, at(2026, 10, 4, 18, 0), 0, state)
        self.assertEqual(api.dispatches, [])
        self.assertEqual([(e.slot, e.action) for e in events], [
            ("2026-10-04T09:00", "missed-clock-down"),
            ("2026-10-03T09:00", "missed-clock-down"),
        ])

    def test_installing_after_the_window_does_not_invent_a_miss(self):
        api = FakeApi()
        state, events = run_ticks(api, at(2026, 10, 4, 18, 0), 0)
        self.assertEqual(events, [])
        self.assertEqual(state["first_tick"], "2026-10-04T18:00:00Z")


class Config(unittest.TestCase):
    def write(self, payload):
        handle = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False)
        json.dump(payload, handle)
        handle.close()
        self.addCleanup(os.unlink, handle.name)
        return Path(handle.name)

    def base(self, **changes):
        entry = json.loads(CONFIG.read_text())["entries"][0]
        entry.update(changes)
        return {"version": 1, "entries": [entry]}

    def test_the_shipped_config_loads_and_targets_the_clock_trigger(self):
        entry = entries()[0]
        self.assertEqual(entry.inputs, {"dry_run": "false", "trigger": "clock"})
        self.assertEqual(entry.proof.expected(entry.slot_for(dt.date(2026, 10, 4))), "2026-10-04T09")

    def test_bad_values_are_refused_by_name(self):
        for changes, words in (
            ({"tz": "Mars/Olympus"}, "unknown time zone"),
            ({"at": "9am"}, "HH:MM"),
            ({"repo": "lozatron"}, "owner/name"),
            ({"inputs": {"dry_run": False}}, "strings"),
            ({"max_dispatches": 9}, "1 to 3"),
            ({"proof_after_minutes": 300}, "proof_after_minutes"),
        ):
            with self.subTest(changes=changes):
                with self.assertRaises(clock.ConfigError) as caught:
                    clock.load_config(self.write(self.base(**changes)))
                self.assertIn(words, str(caught.exception))


class Main(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        os.environ.pop(clock.TOKEN_VAR, None)

    def call(self, *argv, api=None):
        out, err = io.StringIO(), io.StringIO()
        with redirect_stdout(out), redirect_stderr(err):
            code = clock.main(["--config", str(CONFIG), "--state", str(self.tmp / "state.json"),
                               "--env-file", str(self.tmp / "env"), *argv],
                              api_factory=lambda token: api or FakeApi())
        return code, out.getvalue(), err.getvalue()

    def test_no_token_refuses_to_run_with_exit_78(self):
        code, _, err = self.call()
        self.assertEqual(code, 78)
        self.assertIn("refusing to run", err)
        self.assertFalse((self.tmp / "state.json").exists())

    def test_the_token_is_read_from_the_env_file_and_never_printed(self):
        (self.tmp / "env").write_text(f"export {clock.TOKEN_VAR}='{FAKE_TOKEN}'\n")
        self.assertEqual(clock.read_token(self.tmp / "env"), FAKE_TOKEN)
        code, out, err = self.call()
        self.assertEqual(code, 0)
        self.assertNotIn(FAKE_TOKEN, out + err)
        self.assertNotIn(FAKE_TOKEN, (self.tmp / "state.json").read_text())

    def test_dry_run_touches_no_network_and_no_state(self):
        code, out, _ = self.call("--dry-run", "--now", "2026-10-04T13:00:00Z")
        self.assertEqual(code, 0)
        self.assertIn("would-dispatch", out)
        self.assertIn("krishanraja/lozatron briefings.yml@main", out)
        self.assertFalse((self.tmp / "state.json").exists())

    def test_now_is_refused_outside_a_dry_run(self):
        code, _, err = self.call("--now", "2026-10-04T13:00:00Z")
        self.assertEqual(code, 2)
        self.assertIn("dry runs only", err)


class GitHubAdapter(unittest.TestCase):
    """The network layer, with urlopen replaced, so the request shape and the
    error wording are pinned without touching GitHub."""

    def opener(self, status, body=b""):
        seen = {}

        class Response:
            def __init__(self):
                self.status = status

            def read(self):
                return body

            def __enter__(self):
                return self

            def __exit__(self, *_):
                return False

        def fake(request, timeout):
            seen["url"] = request.full_url
            seen["method"] = request.get_method()
            seen["auth"] = request.get_header("Authorization")
            seen["body"] = request.data
            if status >= 400:
                import urllib.error
                raise urllib.error.HTTPError(request.full_url, status, "x", {}, None)
            return Response()

        return fake, seen

    def test_dispatch_posts_ref_and_inputs_to_the_workflow(self):
        fake, seen = self.opener(204)
        ok, detail = clock.GitHub(FAKE_TOKEN, fake).dispatch(entries()[0])
        self.assertTrue(ok)
        self.assertEqual(seen["method"], "POST")
        self.assertTrue(seen["url"].endswith(
            "/repos/krishanraja/lozatron/actions/workflows/briefings.yml/dispatches"))
        self.assertEqual(json.loads(seen["body"]),
                         {"ref": "main", "inputs": {"dry_run": "false", "trigger": "clock"}})

    def test_a_refusal_names_the_likely_cause_and_not_the_token(self):
        fake, _ = self.opener(422)
        ok, detail = clock.GitHub(FAKE_TOKEN, fake).dispatch(entries()[0])
        self.assertFalse(ok)
        self.assertIn("422", detail)
        self.assertNotIn(FAKE_TOKEN, detail)

    def test_proof_reads_the_ledger_and_finds_the_slot(self):
        ledger = json.dumps({"version": 3, "slots": {"2026-10-04T09": "2026-10-04T13:01:00+00:00"}})
        fake, seen = self.opener(200, ledger.encode())
        entry = entries()[0]
        slot = entry.slot_for(dt.date(2026, 10, 4))
        self.assertTrue(clock.GitHub(FAKE_TOKEN, fake).proof(entry, slot))
        self.assertIn("/contents/state/delivered.json?ref=main", seen["url"])
        other = entry.slot_for(dt.date(2026, 10, 5))
        self.assertFalse(clock.GitHub(FAKE_TOKEN, fake).proof(entry, other))

    def test_an_unreadable_ledger_is_unknown_not_false(self):
        fake, _ = self.opener(404)
        entry = entries()[0]
        self.assertIsNone(clock.GitHub(FAKE_TOKEN, fake).proof(entry, entry.slot_for(dt.date(2026, 10, 4))))


if __name__ == "__main__":
    unittest.main()
