#!/usr/bin/env python3
"""Apply a declarative, fail-closed JSON revision to an immutable baseline."""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import re
import sys
import tempfile
from pathlib import Path
from typing import Any


class RevisionError(RuntimeError):
    """Raised when an approved revision cannot be applied exactly."""


SHA256_PATTERN = re.compile(r"^[A-Fa-f0-9]{64}$")


def _require_nonempty_string(value: Any, label: str) -> None:
    if not isinstance(value, str) or not value:
        raise RevisionError(f"{label} must be a non-empty string")


def _validate_file_reference(value: Any, label: str) -> None:
    if not isinstance(value, dict):
        raise RevisionError(f"{label} must be an object")
    unknown = set(value) - {"path", "sha256"}
    if unknown:
        raise RevisionError(f"{label} has unsupported fields: {sorted(unknown)}")
    _require_nonempty_string(value.get("path"), f"{label}.path")
    if value.get("sha256") is not None and not SHA256_PATTERN.fullmatch(str(value["sha256"])):
        raise RevisionError(f"{label}.sha256 must be a 64-character hexadecimal hash")


def validate_spec_structure(spec: Any) -> None:
    if not isinstance(spec, dict):
        raise RevisionError("Revision spec must be a JSON object")
    allowed = {
        "$schema", "schema_version", "revision", "baseline", "candidate",
        "operations", "file_invariants", "required_files", "report", "build_scope",
    }
    unknown = set(spec) - allowed
    if unknown:
        raise RevisionError(f"Revision spec has unsupported fields: {sorted(unknown)}")
    if spec.get("schema_version") != 1:
        raise RevisionError("schema_version must equal 1")
    _require_nonempty_string(spec.get("revision"), "revision")
    _validate_file_reference(spec.get("baseline"), "baseline")
    _validate_file_reference(spec.get("candidate"), "candidate")

    operations = spec.get("operations")
    if not isinstance(operations, list) or not operations:
        raise RevisionError("Spec must contain at least one approved operation")
    for index, operation in enumerate(operations):
        label = f"operations[{index}]"
        if not isinstance(operation, dict):
            raise RevisionError(f"{label} must be an object")
        unknown_operation = set(operation) - {"id", "target", "before", "after"}
        if unknown_operation:
            raise RevisionError(f"{label} has unsupported fields: {sorted(unknown_operation)}")
        _require_nonempty_string(operation.get("id"), f"{label}.id")
        target = operation.get("target")
        if not isinstance(target, dict):
            raise RevisionError(f"{label}.target must be an object")
        if target.get("root") is True:
            if set(target) != {"root"}:
                raise RevisionError(f"{label}.target root form has unsupported fields")
        else:
            if set(target) != {"collection", "key", "value"}:
                raise RevisionError(
                    f"{label}.target must contain exactly collection, key, and value"
                )
            _require_nonempty_string(target["collection"], f"{label}.target.collection")
            _require_nonempty_string(target["key"], f"{label}.target.key")
        for field in ("before", "after"):
            value = operation.get(field)
            if not isinstance(value, dict) or not value:
                raise RevisionError(f"{label}.{field} must be a non-empty object")

    invariants = spec.get("file_invariants", [])
    if not isinstance(invariants, list):
        raise RevisionError("file_invariants must be an array")
    for index, invariant in enumerate(invariants):
        if not isinstance(invariant, dict) or set(invariant) != {"baseline", "candidate"}:
            raise RevisionError(
                f"file_invariants[{index}] must contain exactly baseline and candidate"
            )
        _require_nonempty_string(invariant["baseline"], f"file_invariants[{index}].baseline")
        _require_nonempty_string(invariant["candidate"], f"file_invariants[{index}].candidate")

    required_files = spec.get("required_files", [])
    if not isinstance(required_files, list):
        raise RevisionError("required_files must be an array")
    for index, required in enumerate(required_files):
        label = f"required_files[{index}]"
        if isinstance(required, str):
            _require_nonempty_string(required, label)
            continue
        if not isinstance(required, dict):
            raise RevisionError(f"{label} must be a path string or object")
        unknown_required = set(required) - {"path", "sha256", "min_size"}
        if unknown_required:
            raise RevisionError(f"{label} has unsupported fields: {sorted(unknown_required)}")
        _require_nonempty_string(required.get("path"), f"{label}.path")
        if required.get("sha256") is not None and not SHA256_PATTERN.fullmatch(str(required["sha256"])):
            raise RevisionError(f"{label}.sha256 must be a 64-character hexadecimal hash")
        if required.get("min_size") is not None:
            minimum = required["min_size"]
            if not isinstance(minimum, int) or isinstance(minimum, bool) or minimum < 0:
                raise RevisionError(f"{label}.min_size must be a non-negative integer")

    if spec.get("report") is not None:
        _require_nonempty_string(spec["report"], "report")
    build_scope = spec.get("build_scope", [])
    if not isinstance(build_scope, list) or any(not isinstance(item, str) or not item for item in build_scope):
        raise RevisionError("build_scope must be an array of non-empty strings")
    if len(build_scope) != len(set(build_scope)):
        raise RevisionError("build_scope entries must be unique")


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def resolve_spec_path(spec_path: Path, value: str) -> Path:
    path = Path(value)
    if not path.is_absolute():
        path = spec_path.parent / path
    return path.resolve()


def atomic_write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.", suffix=".tmp", dir=path.parent
    )
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
            json.dump(data, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        os.replace(temporary_name, path)
    except Exception:
        try:
            os.unlink(temporary_name)
        except FileNotFoundError:
            pass
        raise


def _collection_at(document: Any, collection_path: str) -> list[Any]:
    current = document
    for component in collection_path.split("."):
        if not isinstance(current, dict) or component not in current:
            raise RevisionError(f"Collection path does not exist: {collection_path}")
        current = current[component]
    if not isinstance(current, list):
        raise RevisionError(f"Collection path is not a list: {collection_path}")
    return current


def locate_target(document: Any, target: dict[str, Any]) -> dict[str, Any]:
    if target.get("root") is True:
        if not isinstance(document, dict):
            raise RevisionError("Root target requires a JSON object baseline")
        return document

    required = {"collection", "key", "value"}
    missing = sorted(required - set(target))
    if missing:
        raise RevisionError(f"Target is missing fields: {', '.join(missing)}")

    collection = _collection_at(document, str(target["collection"]))
    matches = [
        item
        for item in collection
        if isinstance(item, dict) and item.get(target["key"]) == target["value"]
    ]
    if len(matches) != 1:
        raise RevisionError(
            "Target must resolve to exactly one object: "
            f"{target['collection']}[{target['key']}={target['value']!r}] "
            f"resolved to {len(matches)}"
        )
    return matches[0]


def apply_operations(document: Any, operations: list[dict[str, Any]]) -> Any:
    revised = copy.deepcopy(document)
    seen_ids: set[str] = set()

    for index, operation in enumerate(operations):
        operation_id = str(operation.get("id", f"operation-{index + 1}"))
        if operation_id in seen_ids:
            raise RevisionError(f"Duplicate operation id: {operation_id}")
        seen_ids.add(operation_id)

        before = operation.get("before")
        after = operation.get("after")
        if not isinstance(before, dict) or not isinstance(after, dict):
            raise RevisionError(f"{operation_id}: before and after must be objects")
        if set(before) != set(after):
            raise RevisionError(
                f"{operation_id}: before and after must name the same fields; "
                f"before={sorted(before)}, after={sorted(after)}"
            )

        target = locate_target(revised, operation.get("target", {}))
        for field, expected in before.items():
            if field not in target:
                raise RevisionError(f"{operation_id}: baseline field is missing: {field}")
            actual = target[field]
            if actual != expected:
                raise RevisionError(
                    f"{operation_id}: stale baseline at {field}; "
                    f"expected {expected!r}, found {actual!r}"
                )

        for field, replacement in after.items():
            target[field] = replacement

    return revised


def build_expected_candidate(spec_path: Path, spec: dict[str, Any]) -> tuple[Any, Path]:
    validate_spec_structure(spec)
    baseline = spec.get("baseline", {})
    if not isinstance(baseline, dict) or not baseline.get("path"):
        raise RevisionError("Spec baseline.path is required")
    baseline_path = resolve_spec_path(spec_path, baseline["path"])
    if not baseline_path.is_file():
        raise RevisionError(f"Baseline does not exist: {baseline_path}")

    expected_hash = baseline.get("sha256")
    if expected_hash:
        actual_hash = sha256_file(baseline_path)
        if actual_hash.lower() != str(expected_hash).lower():
            raise RevisionError(
                f"Baseline hash mismatch: expected {expected_hash}, found {actual_hash}"
            )

    document = load_json(baseline_path)
    operations = spec.get("operations")
    if not isinstance(operations, list) or not operations:
        raise RevisionError("Spec must contain at least one approved operation")
    return apply_operations(document, operations), baseline_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("spec", type=Path, help="Path to the approved revision JSON")
    parser.add_argument("--output", type=Path, help="Override candidate output path")
    parser.add_argument(
        "--force", action="store_true", help="Replace an existing candidate file"
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    spec_path = args.spec.resolve()
    try:
        spec = load_json(spec_path)
        expected, baseline_path = build_expected_candidate(spec_path, spec)

        if args.output:
            output_path = args.output.resolve()
        else:
            candidate = spec.get("candidate", {})
            if not isinstance(candidate, dict) or not candidate.get("path"):
                raise RevisionError("Spec candidate.path is required when --output is omitted")
            output_path = resolve_spec_path(spec_path, candidate["path"])

        if output_path == baseline_path:
            raise RevisionError("Candidate path must not overwrite the immutable baseline")
        if output_path.exists() and not args.force:
            raise RevisionError(
                f"Candidate already exists: {output_path}. Use a new version or --force explicitly."
            )

        atomic_write_json(output_path, expected)
        result = {
            "status": "passed",
            "baseline": str(baseline_path),
            "candidate": str(output_path),
            "candidate_sha256": sha256_file(output_path),
            "operation_count": len(spec["operations"]),
        }
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except (OSError, ValueError, RevisionError) as exc:
        print(json.dumps({"status": "failed", "error": str(exc)}, indent=2), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
