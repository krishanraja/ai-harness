#!/usr/bin/env python3
"""The VPS clock: fires GitHub workflows on time, then checks they did their job.

Why this exists. GitHub's scheduler is the unreliable part of the fleet, not the
workflows. Measured on krishanraja/lozatron between 25 September and 3 October
2026: of fourteen hourly cron knocks a day, GitHub started about four, some of
them six hours late. COMPOUND's 05:15 UTC knowledge cron started between 09:54
and 11:55. Hunter's hourly drain fired every four to seven hours until a Vercel
cron became its clock. Each repository then grew its own workaround (wider
windows, more knocks), and each workaround was sized to the last delay seen
until GitHub produced a longer one.

A `workflow_dispatch` sent through the API starts in seconds. So the trigger
moves off GitHub's queue and onto this box, which has a real cron, and the
workflows themselves stay exactly where they are: same secrets, same logs, same
state commits, same failure emails.

What one entry does, every tick (cron runs this every five minutes):

  1. At the entry's local time, dispatch the workflow once.
  2. After `proof_after_minutes`, read the entry's proof from the repository
     (for Lozatron: today's 09:00 slot recorded in state/delivered.json).
  3. If the proof is missing, dispatch once more. Never more than
     `max_dispatches` attempts per slot, whatever happens.
  4. If the proof is still missing at `give_up_after_minutes`, record the slot
     as missed. It is written to the log and the state file, and it is never
     retried silently into the next day.

A dispatched workflow is responsible for its own idempotency. The clock only
promises that the knock arrives on time and that a missing result is noticed.
For Lozatron that promise is backed by the slot ledger: a clock run goes
through the same slot gate a scheduled run does, so it cannot send twice.

Pull-only. This script contacts GitHub and nothing else. It never messages a
person. A missed slot is a line in the log and a row in the state file; the
workflow's own failure email is the one notice anyone receives.

Secrets. The token is a fine-grained GitHub token limited to the repositories
named in the config, with Actions read and write and Contents read. It is read
from the environment (CLOCK_GITHUB_TOKEN) or from a root-only env file, and it
is never printed, logged or written to state. Without it the clock refuses to
run (exit 78, the same convention as vps-heartbeat.sh).

Standard library only. Python 3.10 or later (the VPS runs 3.10).

    clock.py --config clock.json --state /var/lib/vps-clock/state.json
    clock.py --config clock.json --dry-run            # say what it would do
    clock.py --config clock.json --dry-run --now 2026-10-04T13:00:00Z

Cron (root):
    */5 * * * * /usr/bin/python3 /opt/vps-clock/clock.py --config /opt/vps-clock/clock.json >> /var/log/vps-clock.log 2>&1
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Optional, Protocol
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

UTC = dt.timezone.utc
API = "https://api.github.com"
DEFAULT_STATE = Path("/var/lib/vps-clock/state.json")
DEFAULT_ENV_FILE = Path("/etc/vps-clock/env")
TOKEN_VAR = "CLOCK_GITHUB_TOKEN"
STATE_RETENTION_DAYS = 14
EXIT_NO_TOKEN = 78
TIME_RE = re.compile(r"^([01]\d|2[0-3]):([0-5]\d)$")
DAY_NAMES = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")


class ConfigError(ValueError):
    pass


# --------------------------------------------------------------------- config

@dataclass(frozen=True)
class Proof:
    """Where the evidence of a completed run lives.

    kind `json_key_present`: the JSON file at `path` has `key` (a template)
    inside the object at `field`. kind `json_field_equals`: the value at
    `field` equals `value` (a template). Templates take `{date}` (the slot's
    local date, YYYY-MM-DD), `{hour}` (two-digit local hour) and `{minute}`.
    """

    kind: str
    path: str
    field: str
    template: str

    def expected(self, local_slot: dt.datetime) -> str:
        return self.template.format(
            date=local_slot.date().isoformat(),
            hour=f"{local_slot.hour:02d}",
            minute=f"{local_slot.minute:02d}",
        )

    def satisfied_by(self, document: dict, local_slot: dt.datetime) -> bool:
        expected = self.expected(local_slot)
        value = document.get(self.field)
        if self.kind == "json_key_present":
            return isinstance(value, dict) and expected in value
        return str(value) == expected


@dataclass(frozen=True)
class Entry:
    name: str
    repo: str
    workflow: str
    ref: str
    at: str
    tz: str
    days: tuple[str, ...]
    inputs: dict
    proof: Optional[Proof]
    proof_after_minutes: int
    give_up_after_minutes: int
    max_dispatches: int

    @property
    def zone(self) -> ZoneInfo:
        return ZoneInfo(self.tz)

    def slot_for(self, local_date: dt.date) -> dt.datetime:
        """The slot's moment, in local time, for one local calendar date.

        zoneinfo resolves daylight saving: 09:00 New York is 13:00 UTC in
        summer and 14:00 UTC in winter. A wall time that does not exist on a
        spring-forward day normalises forward through UTC, so it fires once
        rather than never.
        """
        hour, minute = (int(part) for part in self.at.split(":"))
        naive = dt.datetime.combine(local_date, dt.time(hour, minute))
        aware = naive.replace(tzinfo=self.zone)
        return aware.astimezone(UTC).astimezone(self.zone)

    def runs_on(self, local_date: dt.date) -> bool:
        return "daily" in self.days or DAY_NAMES[local_date.weekday()] in self.days

    def current_slot(self, now: dt.datetime) -> Optional[dt.datetime]:
        """Today's slot if it has started and is still inside its give-up
        window, else yesterday's if that one still is (a late-evening slot
        whose window crosses midnight). None when nothing is live."""
        local_today = now.astimezone(self.zone).date()
        for local_date in (local_today, local_today - dt.timedelta(days=1)):
            if not self.runs_on(local_date):
                continue
            slot = self.slot_for(local_date)
            opens = slot.astimezone(UTC)
            closes = opens + dt.timedelta(minutes=self.give_up_after_minutes)
            if opens <= now < closes:
                return slot
        return None

    def slot_key(self, slot: dt.datetime) -> str:
        return f"{slot.date().isoformat()}T{self.at}"


def _require(raw: dict, key: str, kind: type, where: str):
    value = raw.get(key)
    if not isinstance(value, kind) or (isinstance(value, str) and not value.strip()):
        raise ConfigError(f"{where}: `{key}` must be a non-empty {kind.__name__}")
    return value


def load_config(path: Path) -> list[Entry]:
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ConfigError(f"cannot read config {path}: {exc}") from exc
    if raw.get("version") != 1:
        raise ConfigError("config `version` must be 1")
    entries = []
    names = set()
    for index, item in enumerate(raw.get("entries", [])):
        where = f"entries[{index}]"
        name = _require(item, "name", str, where)
        if name in names:
            raise ConfigError(f"{where}: duplicate name {name!r}")
        names.add(name)
        repo = _require(item, "repo", str, where)
        if repo.count("/") != 1:
            raise ConfigError(f"{where}: `repo` must be owner/name")
        at = _require(item, "at", str, where)
        if not TIME_RE.match(at):
            raise ConfigError(f"{where}: `at` must be HH:MM, 24-hour")
        tz = _require(item, "tz", str, where)
        try:
            ZoneInfo(tz)
        except (ZoneInfoNotFoundError, ValueError) as exc:
            raise ConfigError(f"{where}: unknown time zone {tz!r}") from exc
        days = item.get("days", ["daily"])
        if isinstance(days, str):
            days = [days]
        days = tuple(str(day).lower()[:3] if day != "daily" else "daily" for day in days)
        if any(day not in DAY_NAMES and day != "daily" for day in days):
            raise ConfigError(f"{where}: `days` must be 'daily' or weekday names")
        inputs = item.get("inputs", {})
        if not isinstance(inputs, dict) or not all(isinstance(v, str) for v in inputs.values()):
            raise ConfigError(f"{where}: `inputs` values must be strings, as GitHub sends them")
        proof = None
        if item.get("proof") is not None:
            p = item["proof"]
            kind = _require(p, "kind", str, f"{where}.proof")
            if kind not in ("json_key_present", "json_field_equals"):
                raise ConfigError(f"{where}.proof: unknown kind {kind!r}")
            template_key = "key" if kind == "json_key_present" else "value"
            proof = Proof(
                kind=kind,
                path=_require(p, "path", str, f"{where}.proof"),
                field=_require(p, "field", str, f"{where}.proof"),
                template=_require(p, template_key, str, f"{where}.proof"),
            )
        proof_after = int(item.get("proof_after_minutes", 30))
        give_up = int(item.get("give_up_after_minutes", 240))
        max_dispatches = int(item.get("max_dispatches", 2))
        if not (5 <= proof_after < give_up):
            raise ConfigError(f"{where}: need 5 <= proof_after_minutes < give_up_after_minutes")
        if not (1 <= max_dispatches <= 3):
            raise ConfigError(f"{where}: `max_dispatches` must be 1 to 3")
        entries.append(Entry(
            name=name,
            repo=repo,
            workflow=_require(item, "workflow", str, where),
            ref=item.get("ref", "main"),
            at=at,
            tz=tz,
            days=days,
            inputs=dict(inputs),
            proof=proof,
            proof_after_minutes=proof_after,
            give_up_after_minutes=give_up,
            max_dispatches=max_dispatches,
        ))
    if not entries:
        raise ConfigError("config has no entries")
    return entries


# ------------------------------------------------------------------ the brain

class Api(Protocol):
    def dispatch(self, entry: Entry) -> tuple[bool, str]: ...
    def proof(self, entry: Entry, slot: dt.datetime) -> Optional[bool]: ...


@dataclass
class Event:
    entry: str
    slot: str
    action: str
    detail: str = ""

    def line(self, now: dt.datetime) -> str:
        tail = f" {self.detail}" if self.detail else ""
        return f"[{now.strftime('%Y-%m-%dT%H:%M:%SZ')}] {self.entry} slot={self.slot} {self.action}{tail}"


def _iso(moment: dt.datetime) -> str:
    return moment.astimezone(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def _parse(value: str) -> dt.datetime:
    return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))


def tick(entries: list[Entry], state: dict, now: dt.datetime, api: Api,
         *, dry_run: bool = False) -> list[Event]:
    """One pass over every entry. Mutates `state` unless `dry_run`.

    The state for a slot is {dispatches: [{at, ok, detail}], proved_at,
    outcome}. `outcome` is `proved` or `missed` once settled, and a settled
    slot is never touched again.
    """
    events: list[Event] = []
    slots_state = state.setdefault("slots", {})
    # Slots that closed before the clock's first ever tick are not the clock's
    # misses, so installing it at 15:00 does not log the morning as missed.
    since = _parse(state["first_tick"]) if state.get("first_tick") else now
    if not dry_run:
        state.setdefault("first_tick", _iso(now))
    for entry in entries:
        slot = entry.current_slot(now)
        if slot is None:
            events.extend(_settle_expired(entry, slots_state, now, since, dry_run))
            continue
        key = entry.slot_key(slot)
        record = slots_state.setdefault(entry.name, {}).get(key) or {"dispatches": []}
        if record.get("outcome"):
            continue
        dispatches = record["dispatches"]
        opens = slot.astimezone(UTC)

        if not dispatches:
            events.append(_dispatch(entry, key, record, now, api, dry_run, reason="on time"
                                    if now - opens < dt.timedelta(minutes=10) else "late start"))
        elif entry.proof is not None:
            last = _parse(dispatches[-1]["at"])
            if now - last < dt.timedelta(minutes=entry.proof_after_minutes):
                pass
            elif dry_run:
                then = ("re-dispatch if missing" if len(dispatches) < entry.max_dispatches
                        else "keep waiting, no dispatches left")
                events.append(Event(entry.name, key, "would-check-proof",
                                    f"{entry.proof.path} {entry.proof.field} "
                                    f"{entry.proof.expected(slot)}, then {then}"))
            else:
                # Checked on every tick until the slot settles, including after
                # the last dispatch: a late scheduled run can still deliver.
                proved = api.proof(entry, slot)
                if proved:
                    record["proved_at"] = _iso(now)
                    record["outcome"] = "proved"
                    events.append(Event(entry.name, key, "proved"))
                elif len(dispatches) < entry.max_dispatches:
                    detail = "proof missing" if proved is False else "proof unreadable"
                    events.append(_dispatch(entry, key, record, now, api, dry_run,
                                            reason=f"retry, {detail}"))
        elif dispatches and any(d.get("ok") for d in dispatches):
            # No proof configured: a successful dispatch is all that can be said.
            record["outcome"] = "dispatched"
            events.append(Event(entry.name, key, "settled", "no proof configured"))
        elif len(dispatches) < entry.max_dispatches:
            last = _parse(dispatches[-1]["at"])
            if now - last >= dt.timedelta(minutes=entry.proof_after_minutes):
                events.append(_dispatch(entry, key, record, now, api, dry_run,
                                        reason="retry, previous dispatch refused"))

        if not dry_run:
            slots_state[entry.name][key] = record
    if not dry_run:
        _prune(slots_state, now)
    return events


def _dispatch(entry: Entry, key: str, record: dict, now: dt.datetime, api: Api,
              dry_run: bool, *, reason: str) -> Event:
    attempt = len(record["dispatches"]) + 1
    if dry_run:
        return Event(entry.name, key, "would-dispatch",
                     f"{entry.repo} {entry.workflow}@{entry.ref} attempt {attempt} ({reason})")
    ok, detail = api.dispatch(entry)
    record["dispatches"].append({"at": _iso(now), "ok": ok, "detail": detail})
    action = "dispatched" if ok else "dispatch-refused"
    return Event(entry.name, key, action, f"attempt {attempt} ({reason}): {detail}")


def _settle_expired(entry: Entry, slots_state: dict, now: dt.datetime,
                    since: dt.datetime, dry_run: bool) -> list[Event]:
    """Close any open slot whose give-up window has passed. A slot the box
    was down for entirely is recorded too, so an outage of the clock itself
    leaves a mark rather than a gap."""
    events = []
    local_today = now.astimezone(entry.zone).date()
    for back in (0, 1):
        local_date = local_today - dt.timedelta(days=back)
        if not entry.runs_on(local_date):
            continue
        slot = entry.slot_for(local_date)
        closes = slot.astimezone(UTC) + dt.timedelta(minutes=entry.give_up_after_minutes)
        if now < closes or closes <= since:
            continue
        key = entry.slot_key(slot)
        bucket = slots_state.setdefault(entry.name, {})
        record = bucket.get(key) or {"dispatches": []}
        if record.get("outcome"):
            continue
        outcome = "missed" if record["dispatches"] else "missed-clock-down"
        detail = (f"{len(record['dispatches'])} dispatch(es), no proof by {_iso(closes)}"
                  if record["dispatches"] else "the clock never ran inside the window")
        if not dry_run:
            record["outcome"] = outcome
            bucket[key] = record
        events.append(Event(entry.name, key, outcome, detail))
    return events


def _prune(slots_state: dict, now: dt.datetime) -> None:
    cutoff = (now - dt.timedelta(days=STATE_RETENTION_DAYS)).date().isoformat()
    for name in list(slots_state):
        slots_state[name] = {k: v for k, v in slots_state[name].items() if k[:10] >= cutoff}


# ------------------------------------------------------------------- GitHub

class GitHub:
    """The only network code. Errors are returned as short text that never
    includes the token or a response body that could echo it."""

    def __init__(self, token: str, opener: Callable = urllib.request.urlopen):
        self._token = token
        self._open = opener

    def _request(self, method: str, url: str, body: Optional[dict] = None,
                 accept: str = "application/vnd.github+json") -> tuple[int, bytes]:
        data = None if body is None else json.dumps(body).encode()
        request = urllib.request.Request(url, data=data, method=method, headers={
            "Authorization": f"Bearer {self._token}",
            "Accept": accept,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "vps-clock",
            **({"Content-Type": "application/json"} if data else {}),
        })
        try:
            with self._open(request, timeout=30) as response:
                return response.status, response.read()
        except urllib.error.HTTPError as exc:
            return exc.code, b""
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            return 0, type(exc).__name__.encode()

    def dispatch(self, entry: Entry) -> tuple[bool, str]:
        owner, name = entry.repo.split("/")
        url = (f"{API}/repos/{urllib.parse.quote(owner)}/{urllib.parse.quote(name)}"
               f"/actions/workflows/{urllib.parse.quote(entry.workflow)}/dispatches")
        status, raw = self._request("POST", url, {"ref": entry.ref, "inputs": entry.inputs})
        if status in (200, 204):
            return True, f"HTTP {status}"
        if status == 0:
            return False, f"network error {raw.decode(errors='replace')}"
        hint = {401: "token rejected", 403: "token lacks Actions write",
                404: "repo, workflow or ref not found, or token cannot see it",
                422: "inputs or ref refused by the workflow"}.get(status, "refused")
        return False, f"HTTP {status} {hint}"

    def proof(self, entry: Entry, slot: dt.datetime) -> Optional[bool]:
        """True or False when the file was read; None when it could not be."""
        assert entry.proof is not None
        owner, name = entry.repo.split("/")
        url = (f"{API}/repos/{urllib.parse.quote(owner)}/{urllib.parse.quote(name)}"
               f"/contents/{urllib.parse.quote(entry.proof.path)}?ref={urllib.parse.quote(entry.ref)}")
        status, raw = self._request("GET", url, accept="application/vnd.github.raw+json")
        if status != 200:
            return None
        try:
            document = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return None
        return entry.proof.satisfied_by(document, slot) if isinstance(document, dict) else None


# ----------------------------------------------------------------- plumbing

def read_token(env_file: Path) -> Optional[str]:
    value = os.environ.get(TOKEN_VAR, "").strip()
    if value:
        return value
    try:
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("export "):
                line = line[len("export "):]
            if line.startswith(f"{TOKEN_VAR}="):
                return line.split("=", 1)[1].strip().strip("'\"") or None
    except OSError:
        return None
    return None


def load_state(path: Path) -> dict:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def save_state(path: Path, state: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    os.replace(tmp, path)


class _Lock:
    """One tick at a time. A slow network must never let two overlapping cron
    ticks both decide to dispatch the same slot."""

    def __init__(self, path: Path):
        self.path = path
        self.handle = None

    def __enter__(self):
        import fcntl
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.handle = open(self.path, "w")
        try:
            fcntl.flock(self.handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            self.handle.close()
            self.handle = None
        return self.handle is not None

    def __exit__(self, *_):
        if self.handle is not None:
            self.handle.close()


def main(argv: Optional[list[str]] = None, api_factory: Callable[[str], Api] = GitHub) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n", 1)[0])
    parser.add_argument("--config", type=Path, default=Path(__file__).with_name("clock.json"))
    parser.add_argument("--state", type=Path, default=DEFAULT_STATE)
    parser.add_argument("--env-file", type=Path, default=DEFAULT_ENV_FILE)
    parser.add_argument("--dry-run", action="store_true",
                        help="Print what would happen. No network call, no state write.")
    parser.add_argument("--now", help="Pretend it is this UTC moment (ISO 8601). Dry runs only.")
    args = parser.parse_args(argv)

    try:
        entries = load_config(args.config)
    except ConfigError as exc:
        print(f"config error: {exc}", file=sys.stderr)
        return 2

    if args.now and not args.dry_run:
        print("--now is for dry runs only", file=sys.stderr)
        return 2
    now = _parse(args.now) if args.now else dt.datetime.now(UTC)
    if now.tzinfo is None:
        now = now.replace(tzinfo=UTC)
    now = now.astimezone(UTC)

    if args.dry_run:
        state = load_state(args.state)
        for event in tick(entries, state, now, _NoNetwork(), dry_run=True):
            print(event.line(now))
        print(f"[{_iso(now)}] dry run: {len(entries)} entr{'y' if len(entries) == 1 else 'ies'}, "
              "nothing dispatched, state untouched")
        return 0

    token = read_token(args.env_file)
    if not token:
        print(f"[{_iso(now)}] no {TOKEN_VAR} in the environment or {args.env_file}; "
              "refusing to run", file=sys.stderr)
        return EXIT_NO_TOKEN

    with _Lock(args.state.with_suffix(".lock")) as held:
        if not held:
            print(f"[{_iso(now)}] another tick holds the lock; exiting")
            return 0
        state = load_state(args.state)
        events = tick(entries, state, now, api_factory(token))
        state["last_tick"] = _iso(now)
        save_state(args.state, state)
    for event in events:
        print(event.line(now))
    return 0


class _NoNetwork:
    def dispatch(self, entry: Entry) -> tuple[bool, str]:
        raise AssertionError("dry run must not dispatch")

    def proof(self, entry: Entry, slot: dt.datetime) -> Optional[bool]:
        raise AssertionError("dry run must not read proof")


if __name__ == "__main__":
    raise SystemExit(main())
