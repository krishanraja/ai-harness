#!/usr/bin/env python3
"""Create or verify an immutable release manifest of artifact hashes."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys
from pathlib import Path

from apply_revision import atomic_write_json, load_json, sha256_file


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    snapshot = subparsers.add_parser("snapshot", help="Create a release manifest")
    snapshot.add_argument("--root", type=Path, required=True)
    snapshot.add_argument("--output", type=Path, required=True)
    snapshot.add_argument("--revision", required=True)
    snapshot.add_argument("--baseline")
    snapshot.add_argument("--artifact", action="append", required=True)
    snapshot.add_argument("--force", action="store_true")

    verify = subparsers.add_parser("verify", help="Verify a release manifest")
    verify.add_argument("--manifest", type=Path, required=True)
    return parser.parse_args()


def snapshot(args: argparse.Namespace) -> int:
    root = args.root.resolve()
    output = args.output.resolve()
    if output.exists() and not args.force:
        raise RuntimeError(f"Manifest already exists: {output}")

    records = []
    seen: set[str] = set()
    for value in args.artifact:
        path = Path(value)
        if not path.is_absolute():
            path = root / path
        path = path.resolve()
        try:
            relative = path.relative_to(root).as_posix()
        except ValueError as exc:
            raise RuntimeError(f"Artifact is outside release root: {path}") from exc
        if relative in seen:
            raise RuntimeError(f"Duplicate artifact: {relative}")
        if not path.is_file():
            raise RuntimeError(f"Artifact does not exist: {path}")
        seen.add(relative)
        records.append({"path": relative, "size": path.stat().st_size, "sha256": sha256_file(path)})

    manifest = {
        "schema_version": 1,
        "revision": args.revision,
        "baseline": args.baseline,
        "created_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "root": Path(os.path.relpath(root, output.parent)).as_posix(),
        "artifacts": records,
    }
    atomic_write_json(output, manifest)
    print(json.dumps({"status": "passed", "manifest": str(output), "artifact_count": len(records)}, indent=2))
    return 0


def verify(args: argparse.Namespace) -> int:
    manifest_path = args.manifest.resolve()
    manifest = load_json(manifest_path)
    root_value = Path(manifest.get("root", "."))
    root = root_value if root_value.is_absolute() else (manifest_path.parent / root_value).resolve()
    errors: list[str] = []
    checks = []

    for record in manifest.get("artifacts", []):
        path = (root / record["path"]).resolve()
        check = {"path": record["path"]}
        try:
            path.relative_to(root)
        except ValueError:
            errors.append(f"Artifact escapes release root: {record['path']}")
            check["status"] = "failed"
            checks.append(check)
            continue
        if not path.is_file():
            errors.append(f"Artifact is missing: {record['path']}")
            check["status"] = "failed"
        else:
            size = path.stat().st_size
            digest = sha256_file(path)
            check.update({"size": size, "sha256": digest})
            check["status"] = "passed" if size == record["size"] and digest == record["sha256"] else "failed"
            if check["status"] == "failed":
                errors.append(f"Artifact changed: {record['path']}")
        checks.append(check)

    result = {
        "status": "passed" if not errors else "failed",
        "manifest": str(manifest_path),
        "revision": manifest.get("revision"),
        "checks": checks,
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


def main() -> int:
    args = parse_args()
    try:
        return snapshot(args) if args.command == "snapshot" else verify(args)
    except (OSError, ValueError, KeyError, TypeError, RuntimeError) as exc:
        print(json.dumps({"status": "failed", "error": str(exc)}, indent=2), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
