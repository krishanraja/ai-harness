"""Package an explicitly requested candidate without admitting it to production."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import zipfile

parser = argparse.ArgumentParser()
parser.add_argument("name")
parser.add_argument("--output", required=True, type=Path)
args = parser.parse_args()
if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", args.name):
    parser.error("invalid skill name")
root = Path(__file__).resolve().parent.parent
source = root / "candidates" / args.name
record = root / "state" / "candidates" / f"{args.name}.yaml"
if not source.joinpath("SKILL.md").is_file() or not record.is_file():
    parser.error("candidate source or manifest missing")
if not re.search(r"(?m)^release_eligible:\s*false\s*$", record.read_text(encoding="utf-8")):
    parser.error("candidate must remain outside production release eligibility")
if subprocess.check_output(["git", "status", "--porcelain"], cwd=root).strip():
    parser.error("package from a clean committed source")
revision = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip()
files = sorted((p for p in source.rglob("*") if p.is_file()), key=lambda p: p.relative_to(source).as_posix())
if any(p.is_symlink() for p in source.rglob("*")):
    parser.error("candidate symlinks are not transport files")
args.output.mkdir(parents=True, exist_ok=True)
manifest = {"name": args.name, "status": "provisional-not-production-admitted", "source_commit": revision,
            "files": {}, "artifacts": {}}
for p in files:
    manifest["files"][p.relative_to(source).as_posix()] = hashlib.sha256(p.read_bytes()).hexdigest()
for extension, prefix in (("skill", args.name + "/"), ("perplexity.zip", "")):
    target = args.output / f"{args.name}-provisional.{extension}"
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for p in files:
            entry = zipfile.ZipInfo(prefix + p.relative_to(source).as_posix(), date_time=(1980, 1, 1, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.create_system = 3
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, p.read_bytes())
    manifest["artifacts"][target.name] = hashlib.sha256(target.read_bytes()).hexdigest()
(args.output / f"{args.name}-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8", newline="\n")
print(json.dumps(manifest, indent=2))
