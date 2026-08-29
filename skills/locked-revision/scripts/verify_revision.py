#!/usr/bin/env python3
"""Verify that a candidate contains exactly the approved semantic delta."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from apply_revision import (
    RevisionError,
    atomic_write_json,
    build_expected_candidate,
    load_json,
    resolve_spec_path,
    sha256_file,
)


def semantic_differences(expected: Any, actual: Any, path: str = "$") -> list[dict[str, Any]]:
    differences: list[dict[str, Any]] = []
    if type(expected) is not type(actual):
        return [{"path": path, "kind": "type", "expected": type(expected).__name__, "actual": type(actual).__name__}]

    if isinstance(expected, dict):
        for key in sorted(set(expected) | set(actual)):
            child = f"{path}.{key}"
            if key not in expected:
                differences.append({"path": child, "kind": "unexpected_field", "actual": actual[key]})
            elif key not in actual:
                differences.append({"path": child, "kind": "missing_field", "expected": expected[key]})
            else:
                differences.extend(semantic_differences(expected[key], actual[key], child))
    elif isinstance(expected, list):
        if len(expected) != len(actual):
            differences.append({"path": path, "kind": "length", "expected": len(expected), "actual": len(actual)})
        for index, (expected_item, actual_item) in enumerate(zip(expected, actual)):
            differences.extend(semantic_differences(expected_item, actual_item, f"{path}[{index}]"))
    elif expected != actual:
        differences.append({"path": path, "kind": "value", "expected": expected, "actual": actual})
    return differences


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("spec", type=Path, help="Path to the approved revision JSON")
    parser.add_argument("--candidate", type=Path, help="Override candidate path")
    parser.add_argument("--report", type=Path, help="Override report path")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    spec_path = args.spec.resolve()
    errors: list[str] = []
    differences: list[dict[str, Any]] = []
    checks: list[dict[str, Any]] = []
    candidate_path: Path | None = None
    candidate_hash: str | None = None

    try:
        spec = load_json(spec_path)
        expected, baseline_path = build_expected_candidate(spec_path, spec)

        if args.candidate:
            candidate_path = args.candidate.resolve()
        else:
            candidate_spec = spec.get("candidate", {})
            if not isinstance(candidate_spec, dict) or not candidate_spec.get("path"):
                raise RevisionError("Spec candidate.path is required")
            candidate_path = resolve_spec_path(spec_path, candidate_spec["path"])

        if not candidate_path.is_file():
            errors.append(f"Candidate does not exist: {candidate_path}")
        else:
            actual = load_json(candidate_path)
            differences = semantic_differences(expected, actual)
            if differences:
                errors.append(f"Candidate has {len(differences)} undeclared or missing semantic changes")
            candidate_hash = sha256_file(candidate_path)
            expected_candidate_hash = spec.get("candidate", {}).get("sha256")
            if expected_candidate_hash and candidate_hash.lower() != str(expected_candidate_hash).lower():
                errors.append(
                    f"Candidate hash mismatch: expected {expected_candidate_hash}, found {candidate_hash}"
                )

        for invariant in spec.get("file_invariants", []):
            left = resolve_spec_path(spec_path, invariant["baseline"])
            right = resolve_spec_path(spec_path, invariant["candidate"])
            check = {"kind": "file_invariant", "baseline": str(left), "candidate": str(right)}
            if not left.is_file() or not right.is_file():
                check["status"] = "failed"
                errors.append(f"Invariant file is missing: {left} or {right}")
            else:
                left_hash = sha256_file(left)
                right_hash = sha256_file(right)
                check.update({"baseline_sha256": left_hash, "candidate_sha256": right_hash})
                check["status"] = "passed" if left_hash == right_hash else "failed"
                if left_hash != right_hash:
                    errors.append(f"Invariant changed: {left} != {right}")
            checks.append(check)

        for required in spec.get("required_files", []):
            details = required if isinstance(required, dict) else {"path": required}
            path = resolve_spec_path(spec_path, details["path"])
            check = {"kind": "required_file", "path": str(path)}
            if not path.is_file():
                check["status"] = "failed"
                errors.append(f"Required file is missing: {path}")
            else:
                size = path.stat().st_size
                digest = sha256_file(path)
                check.update({"size": size, "sha256": digest, "status": "passed"})
                if details.get("sha256") and digest.lower() != str(details["sha256"]).lower():
                    check["status"] = "failed"
                    errors.append(f"Required file hash mismatch: {path}")
                if details.get("min_size") is not None and size < int(details["min_size"]):
                    check["status"] = "failed"
                    errors.append(f"Required file is smaller than min_size: {path}")
            checks.append(check)

        report = {
            "schema_version": 1,
            "status": "passed" if not errors else "failed",
            "revision": spec.get("revision"),
            "baseline": str(baseline_path),
            "candidate": str(candidate_path) if candidate_path else None,
            "candidate_sha256": candidate_hash,
            "approved_operation_ids": [operation.get("id") for operation in spec.get("operations", [])],
            "semantic_difference_count": len(differences),
            "semantic_differences": differences[:200],
            "checks": checks,
            "errors": errors,
        }

        report_value = args.report or (Path(spec["report"]) if spec.get("report") else None)
        if report_value:
            report_path = report_value.resolve() if args.report else resolve_spec_path(spec_path, str(report_value))
            atomic_write_json(report_path, report)
            report["report_path"] = str(report_path)

        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 0 if not errors else 1
    except (OSError, ValueError, KeyError, TypeError, RevisionError) as exc:
        failure = {"schema_version": 1, "status": "failed", "revision": None, "errors": [str(exc)]}
        print(json.dumps(failure, ensure_ascii=False, indent=2), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
