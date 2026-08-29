from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = SKILL_ROOT / "scripts"
sys.path.insert(0, str(SCRIPTS))

from apply_revision import RevisionError, apply_operations, build_expected_candidate  # noqa: E402


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class LockedRevisionTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.baseline = self.root / "baseline.json"
        self.candidate = self.root / "candidate.json"
        self.report = self.root / "nonregression.json"
        self.spec_path = self.root / "revision.json"
        self.baseline.write_text(
            json.dumps(
                {
                    "title": "Approved",
                    "shots": [
                        {"shot_id": "A", "copy": "Keep", "duration": 48},
                        {"shot_id": "B", "copy": "Old", "duration": 72},
                    ],
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        self.spec = {
            "schema_version": 1,
            "revision": "v2",
            "baseline": {"path": "baseline.json", "sha256": sha256(self.baseline)},
            "candidate": {"path": "candidate.json"},
            "operations": [
                {
                    "id": "change-approved-copy",
                    "target": {"collection": "shots", "key": "shot_id", "value": "B"},
                    "before": {"copy": "Old"},
                    "after": {"copy": "New"},
                }
            ],
            "required_files": ["candidate.json"],
            "report": "nonregression.json",
            "build_scope": ["shot-B"],
        }
        self.spec_path.write_text(json.dumps(self.spec, indent=2) + "\n", encoding="utf-8")

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def run_script(self, script: str, *args: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, "-B", str(SCRIPTS / script), *args],
            text=True,
            capture_output=True,
            check=False,
        )

    def test_build_expected_candidate_changes_only_declared_field(self) -> None:
        expected, baseline_path = build_expected_candidate(self.spec_path, self.spec)
        self.assertEqual(baseline_path, self.baseline.resolve())
        self.assertEqual(expected["shots"][0], {"shot_id": "A", "copy": "Keep", "duration": 48})
        self.assertEqual(expected["shots"][1], {"shot_id": "B", "copy": "New", "duration": 72})
        self.assertEqual(expected["title"], "Approved")

    def test_stale_before_value_fails_closed(self) -> None:
        operation = dict(self.spec["operations"][0])
        operation["before"] = {"copy": "Not the baseline"}
        with self.assertRaisesRegex(RevisionError, "stale baseline"):
            apply_operations(json.loads(self.baseline.read_text(encoding="utf-8")), [operation])

    def test_apply_and_verify_cli_round_trip(self) -> None:
        applied = self.run_script("apply_revision.py", str(self.spec_path))
        self.assertEqual(applied.returncode, 0, applied.stderr)
        verified = self.run_script("verify_revision.py", str(self.spec_path))
        self.assertEqual(verified.returncode, 0, verified.stderr)
        result = json.loads(verified.stdout)
        self.assertEqual(result["status"], "passed")
        self.assertEqual(result["semantic_difference_count"], 0)
        self.assertTrue(self.report.is_file())

    def test_undeclared_candidate_change_is_rejected(self) -> None:
        applied = self.run_script("apply_revision.py", str(self.spec_path))
        self.assertEqual(applied.returncode, 0, applied.stderr)
        candidate = json.loads(self.candidate.read_text(encoding="utf-8"))
        candidate["title"] = "Unapproved"
        self.candidate.write_text(json.dumps(candidate, indent=2) + "\n", encoding="utf-8")
        verified = self.run_script("verify_revision.py", str(self.spec_path))
        self.assertNotEqual(verified.returncode, 0)
        result = json.loads(verified.stdout)
        self.assertEqual(result["status"], "failed")
        self.assertGreater(result["semantic_difference_count"], 0)

    def test_release_manifest_detects_tampering(self) -> None:
        applied = self.run_script("apply_revision.py", str(self.spec_path))
        self.assertEqual(applied.returncode, 0, applied.stderr)
        manifest = self.root / "release-manifest.json"
        snapshotted = self.run_script(
            "release_manifest.py",
            "snapshot",
            "--root",
            str(self.root),
            "--output",
            str(manifest),
            "--revision",
            "v2",
            "--artifact",
            "candidate.json",
        )
        self.assertEqual(snapshotted.returncode, 0, snapshotted.stderr)
        verified = self.run_script("release_manifest.py", "verify", "--manifest", str(manifest))
        self.assertEqual(verified.returncode, 0, verified.stderr)
        self.candidate.write_text("{}\n", encoding="utf-8")
        tampered = self.run_script("release_manifest.py", "verify", "--manifest", str(manifest))
        self.assertNotEqual(tampered.returncode, 0)
        self.assertEqual(json.loads(tampered.stdout)["status"], "failed")


if __name__ == "__main__":
    unittest.main()
