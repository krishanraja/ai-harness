#!/usr/bin/env python3
"""Read-only, allow-listed adapter for the pinned UI/UX Pro Max corpus."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path


PINNED_COMMIT = "abb7f2fd5a083fa1ff55c326a963ff0d95c33f99"
UPSTREAM_TAG = "v2.14.1"
EXPECTED_VENDOR_SHA256 = "9D1A0F3C3DBFE96D6BFE54B656C216A30323C3815197409BCAC034481B0C6807"
ALLOWED_DOMAINS = {
    "product",
    "style",
    "color",
    "typography",
    "google-fonts",
    "chart",
    "landing",
    "icons",
    "gsap",
}
ALLOWED_WEB_STACKS = {
    "react",
    "nextjs",
    "vue",
    "svelte",
    "astro",
    "nuxtjs",
    "nuxt-ui",
    "html-tailwind",
    "shadcn",
    "angular",
    "laravel",
    "threejs",
}

HERE = Path(__file__).resolve().parent
VENDOR_ROOT = HERE / "vendor" / "ui-ux-pro-max"
VENDOR_SCRIPTS = VENDOR_ROOT / "scripts"


def directory_artifact_sha256(directory: Path) -> str:
    records = []
    for path in sorted(
        (item for item in directory.rglob("*") if item.is_file() and "__pycache__" not in item.parts and item.suffix != ".pyc"),
        key=lambda item: str(item).lower(),
    ):
        relative = path.relative_to(directory).as_posix()
        # Git may materialize these reviewed text files with LF or CRLF. Normalize
        # line endings so integrity is byte-stable across supported host platforms.
        normalized = path.read_bytes().replace(b"\r\n", b"\n")
        file_hash = hashlib.sha256(normalized).hexdigest().upper()
        records.append(f"{relative}\0{file_hash}")
    return hashlib.sha256("\n".join(records).encode("utf-8")).hexdigest().upper()


def verify_vendor_integrity() -> None:
    if not VENDOR_ROOT.is_dir():
        raise RuntimeError(f"Pinned vendor directory is missing: {VENDOR_ROOT}")
    observed = directory_artifact_sha256(VENDOR_ROOT)
    if observed != EXPECTED_VENDOR_SHA256:
        raise RuntimeError(
            "Pinned vendor integrity mismatch: "
            f"expected {EXPECTED_VENDOR_SHA256}, observed {observed}. "
            "Do not auto-update; route repair through harness-maintainer."
        )


sys.dont_write_bytecode = True
verify_vendor_integrity()
if str(VENDOR_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(VENDOR_SCRIPTS))

from core import search, search_stack  # noqa: E402
from design_system import generate_design_system  # noqa: E402


def envelope(query: str, mode: str) -> dict:
    return {
        "schema_version": 1,
        "mode": mode,
        "query": query,
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
        "provenance": {
            "repository": "nextlevelbuilder/ui-ux-pro-max-skill",
            "commit": PINNED_COMMIT,
            "tag_observed": UPSTREAM_TAG,
            "license": "MIT",
        },
        "authority": "advisory historical corpus only",
        "constraints": [
            "krish-design retains taste and design authority",
            "current standards require ux-foundations or another primary-source owner",
            "implementation hints require current official verification",
            "no project persistence or external mutation performed",
        ],
    }


def candidate_query(args: argparse.Namespace) -> dict:
    if args.domain not in ALLOWED_DOMAINS:
        allowed = ", ".join(sorted(ALLOWED_DOMAINS))
        raise ValueError(f"Domain '{args.domain}' is not allowed. Allowed: {allowed}")
    result = envelope(args.query, "candidates")
    result.update(
        {
            "domain": args.domain,
            "max_results": args.limit,
            "candidates": search(args.query, args.domain, args.limit),
        }
    )
    return result


def mobile_web_query(args: argparse.Namespace) -> dict:
    if args.stack and args.stack not in ALLOWED_WEB_STACKS:
        allowed = ", ".join(sorted(ALLOWED_WEB_STACKS))
        raise ValueError(f"Stack '{args.stack}' is not an allowed web stack. Allowed: {allowed}")

    generated = generate_design_system(
        query=args.query,
        project_name=args.project,
        persist=False,
        output_dir=None,
        variance=args.variance,
        motion=args.motion,
        density=args.density,
        force=False,
    )
    result = envelope(args.query, "mobile-web")
    result.update(
        {
            "project": args.project,
            "design_candidates": generated.get("design_system"),
            "persistence": generated.get("persistence"),
            "stack": args.stack,
            "stack_hints": search_stack(args.query, args.stack, args.limit) if args.stack else [],
            "stack_authority": "implementation leads only; reverify against current official sources",
            "required_contract": "references/mobile-web-contract.md",
            "required_evidence_sections": [
                "product and state truth",
                "responsive system",
                "input and interaction parity",
                "mobile browser and viewport behavior",
                "forms and virtual keyboard",
                "visual consistency and theming",
                "performance and resilience",
                "accessibility-source handoff",
                "evidence and handoff",
            ],
        }
    )
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("query")
    parser.add_argument("--mode", choices=("candidates", "mobile-web"), required=True)
    parser.add_argument("--domain", choices=sorted(ALLOWED_DOMAINS))
    parser.add_argument("--stack")
    parser.add_argument("--project", default="Unnamed project")
    parser.add_argument("--limit", type=int, choices=range(1, 11), default=5)
    parser.add_argument("--variance", type=int, choices=range(1, 11))
    parser.add_argument("--motion", type=int, choices=range(1, 11))
    parser.add_argument("--density", type=int, choices=range(1, 11))
    args = parser.parse_args()
    if args.mode == "candidates" and not args.domain:
        parser.error("--domain is required for candidates mode")
    if args.mode != "mobile-web" and args.stack:
        parser.error("--stack is available only in mobile-web mode")
    return args


def main() -> int:
    args = parse_args()
    try:
        result = candidate_query(args) if args.mode == "candidates" else mobile_web_query(args)
    except (ValueError, FileNotFoundError) as exc:
        print(json.dumps({"error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 2
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
