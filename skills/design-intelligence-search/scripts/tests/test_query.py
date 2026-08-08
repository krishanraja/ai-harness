import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
import importlib.util


SCRIPT = Path(__file__).resolve().parents[1] / "query.py"


class QueryAdapterTests(unittest.TestCase):
    def run_query(self, *args, cwd=None):
        return subprocess.run(
            [sys.executable, str(SCRIPT), *args],
            cwd=cwd,
            text=True,
            encoding="utf-8",
            errors="strict",
            capture_output=True,
            check=False,
        )

    def test_allowed_candidate_query_is_labelled(self):
        result = self.run_query("trustworthy finance dashboard", "--mode", "candidates", "--domain", "style")
        self.assertEqual(result.returncode, 0, result.stderr)
        payload = json.loads(result.stdout)
        self.assertEqual(payload["authority"], "advisory historical corpus only")
        self.assertEqual(payload["domain"], "style")
        self.assertGreater(len(payload["candidates"]), 0)

    def test_disallowed_normative_domain_is_rejected_by_parser(self):
        result = self.run_query("target size", "--mode", "candidates", "--domain", "ux")
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn("target size", result.stdout)

    def test_native_stack_is_rejected(self):
        result = self.run_query("commerce", "--mode", "mobile-web", "--stack", "swiftui")
        self.assertEqual(result.returncode, 2)
        self.assertIn("not an allowed web stack", result.stderr)

    def test_directory_hash_changes_when_vendor_content_changes(self):
        spec = importlib.util.spec_from_file_location("design_intelligence_query", SCRIPT)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "one.txt").write_text("first", encoding="utf-8")
            first_hash = module.directory_artifact_sha256(root)
            (root / "one.txt").write_text("second", encoding="utf-8")
            second_hash = module.directory_artifact_sha256(root)
        self.assertNotEqual(first_hash, second_hash)

    def test_mobile_web_packet_is_complete_and_read_only(self):
        with tempfile.TemporaryDirectory() as tmp:
            before = set(Path(tmp).rglob("*"))
            result = self.run_query(
                "B2B analytics mobile web",
                "--mode",
                "mobile-web",
                "--stack",
                "nextjs",
                "--project",
                "Ops Console",
                cwd=tmp,
            )
            after = set(Path(tmp).rglob("*"))
        self.assertEqual(result.returncode, 0, result.stderr)
        payload = json.loads(result.stdout)
        self.assertIsNone(payload["persistence"])
        self.assertEqual(before, after)
        self.assertEqual(len(payload["required_evidence_sections"]), 9)
        self.assertIn("mobile browser and viewport behavior", payload["required_evidence_sections"])
        self.assertGreater(len(payload["stack_hints"]), 0)


if __name__ == "__main__":
    unittest.main()
