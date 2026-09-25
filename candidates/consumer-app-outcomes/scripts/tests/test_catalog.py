import contextlib
import datetime
import io
import json
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

SCRIPTS = pathlib.Path(__file__).resolve().parents[1]
PACKAGE = SCRIPTS.parent
sys.path.insert(0, str(SCRIPTS))

import catalog as C  # noqa: E402
import record_result as R  # noqa: E402
import retrieve as Q  # noqa: E402
import validate as V  # noqa: E402

TODAY = datetime.date(2026, 9, 25)


def quiet(fn, *args, **kwargs):
    out, err = io.StringIO(), io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        code = fn(*args, **kwargs)
    return code, out.getvalue(), err.getvalue()


def row(**overrides):
    base = {'id': 'ev-2026-09-20-01', 'record_id': 'retention.gone-after-day-one', 'observed_at': '2026-09-20',
            'recorded_at': '2026-09-20', 'recorded_by': 'Krish Raja', 'product': 'mm-ctrl', 'evidence_level': 1,
            'design': 'rct', 'primary_metric': 'day-two return', 'result': 'supported',
            'summary': 'Lift with no guardrail movement.', 'source_ref': 'experiment export'}
    base.update(overrides)
    return base


class PackageCopy(unittest.TestCase):
    """Each test works on a throwaway copy, so the real references are never touched."""

    def setUp(self):
        self.tmp = pathlib.Path(tempfile.mkdtemp())
        self.pkg = self.tmp / 'consumer-app-outcomes'
        shutil.copytree(PACKAGE, self.pkg, ignore=shutil.ignore_patterns('__pycache__'))
        self.saved = {k: getattr(C, k) for k in ('ROOT', 'REFS', 'CATALOG_PATH', 'LEDGER_PATH', 'EVIDENCE_PATH')}
        C.ROOT, C.REFS = self.pkg, self.pkg / 'references'
        C.CATALOG_PATH = C.REFS / 'outcome-catalog.json'
        C.LEDGER_PATH = C.REFS / 'source-ledger.json'
        C.EVIDENCE_PATH = C.REFS / 'evidence-log.jsonl'

    def tearDown(self):
        for key, value in self.saved.items():
            setattr(C, key, value)
        shutil.rmtree(self.tmp, ignore_errors=True)

    def write_evidence(self, rows):
        C.EVIDENCE_PATH.write_text(''.join(json.dumps(r) + '\n' for r in rows), encoding='utf-8')

    def edit_catalog(self, change):
        cat = C.load_catalog()
        change(cat)
        C.CATALOG_PATH.write_text(C.format_catalog(cat), encoding='utf-8')

    def assert_fails(self, needle):
        code, _, err = quiet(V.main, [])
        self.assertEqual(code, 1, 'validation should have failed')
        self.assertIn(needle, err)


class ShippedData(unittest.TestCase):
    def test_shipped_references_validate(self):
        code, out, err = quiet(V.main, [])
        self.assertEqual(code, 0, err)
        self.assertIn('VALIDATION PASSED', out)

    def test_catalog_is_canonically_formatted(self):
        raw = C.CATALOG_PATH.read_text(encoding='utf-8')
        self.assertEqual(raw, C.format_catalog(json.loads(raw)))
        self.assertGreater(raw.count('\n'), len(json.loads(raw)['records']))

    def test_every_stack_is_covered_by_its_router_and_contracts(self):
        router = (PACKAGE / 'references' / 'stack-router.md').read_text(encoding='utf-8')
        for stack in C.stacks(C.load_catalog()):
            self.assertIn(stack, router)

    def test_skill_manifest_and_references_resolve(self):
        text = (PACKAGE / 'SKILL.md').read_text(encoding='utf-8')
        front = text.split('---')[1]
        keys = set(re.findall(r'^([a-z_]+):', front, re.M))
        self.assertEqual(keys, {'name', 'description'})
        self.assertIn('name: consumer-app-outcomes', front)
        self.assertLessEqual(len(re.search(r'^description: (.*)$', front, re.M).group(1)), 1024)
        self.assertLessEqual(len(text.splitlines()), 500)
        for ref in re.findall(r'`((?:references|scripts)/[^`\s]+\.(?:md|json|jsonl|py))`', text):
            self.assertTrue((PACKAGE / ref).is_file(), f'SKILL.md names missing {ref}')
        agent = (PACKAGE / 'agents' / 'openai.yaml').read_text(encoding='utf-8')
        short = re.search(r'short_description: "([^"]+)"', agent).group(1)
        self.assertTrue(25 <= len(short) <= 64)
        self.assertIn('$consumer-app-outcomes', agent)


class CatalogGuards(PackageCopy):
    def test_missing_ledger_page_fails(self):
        ledger = C.load_ledger()
        ledger['records'] = [r for r in ledger['records'] if r['id'] != 'cas-ret-01']
        C.LEDGER_PATH.write_text(json.dumps(ledger), encoding='utf-8')
        self.assert_fails('not a problem page in source-ledger.json')

    def test_duplicate_record_id_fails(self):
        self.edit_catalog(lambda c: c['records'].append(dict(c['records'][0])))
        self.assert_fails('duplicate id')

    def test_catalog_cannot_claim_stronger_evidence(self):
        def inflate(c):
            c['records'][0]['evidence_level'] = 'production-experiment'
        self.edit_catalog(inflate)
        self.assert_fails('stronger evidence belongs in evidence-log.jsonl')

    def test_stored_status_is_rejected(self):
        raw = json.loads(C.CATALOG_PATH.read_text(encoding='utf-8'))
        raw['records'][0]['status'] = 'supported'
        C.CATALOG_PATH.write_text(json.dumps(raw), encoding='utf-8')
        self.assert_fails('canonically formatted')

    def test_new_stack_needs_records_not_validator_edits(self):
        self.edit_catalog(lambda c: c['stack_outcomes'].append({'stack': 'new-stack', 'outcome': 'Something.'}))
        code, _, err = quiet(V.main, [])
        self.assertEqual(code, 1)
        self.assertIn('stack new-stack has 0 records', err)


class EvidenceGuards(PackageCopy):
    def test_valid_row_passes(self):
        self.write_evidence([row()])
        code, out, err = quiet(V.main, [])
        self.assertEqual(code, 0, err)
        self.assertIn('1 evidence rows', out)

    def test_level_five_row_is_refused(self):
        self.write_evidence([row(evidence_level=5)])
        self.assert_fails('level 5 is what the catalog already is')

    def test_unknown_record_is_refused(self):
        self.write_evidence([row(record_id='retention.invented')])
        self.assert_fails('is not in the catalog')

    def test_contact_details_are_refused(self):
        self.write_evidence([row(summary='Ask jane@example.com for the export.')])
        self.assert_fails('email address or phone number')

    def test_client_name_is_refused_as_product(self):
        self.write_evidence([row(product='Acme Corp')])
        self.assert_fails('product must be a lowercase product code')

    def test_harmful_result_must_name_breach(self):
        self.write_evidence([row(result='harmful')])
        self.assert_fails('must name the guardrail it breached')

    def test_retraction_must_target_earlier_row(self):
        self.write_evidence([row(id='ev-2026-09-20-02', result='retracted', retracts='ev-2026-09-20-09')])
        self.assert_fails('retracts must name an earlier evidence id')


class StatusDerivation(unittest.TestCase):
    def test_ladder(self):
        a = row(id='a', evidence_level=1)
        b = row(id='b', evidence_level=2)
        weak = row(id='w', evidence_level=3)
        contrary = row(id='c', result='contrary')
        harmful = row(id='h', result='harmful', guardrail_breaches=['opt-out'])
        self.assertEqual(C.status_for([]), 'candidate')
        self.assertEqual(C.status_for([a]), 'tested')
        self.assertEqual(C.status_for([a, weak]), 'tested')
        self.assertEqual(C.status_for([a, b]), 'supported')
        self.assertEqual(C.status_for([a, b, contrary]), 'contested')
        self.assertEqual(C.status_for([a, b, harmful]), 'retired')

    def test_retraction_withdraws_a_row(self):
        rows = [row(id='a'), row(id='b', result='retracted', retracts='a')]
        self.assertEqual(C.effective_rows(rows), [])
        self.assertEqual(C.status_for(C.effective_rows(rows)), 'candidate')


class AppendOnly(PackageCopy):
    def git(self, *args):
        subprocess.run(['git', '-C', str(self.pkg), *args], check=True, capture_output=True)

    def commit_base(self, rows):
        self.write_evidence(rows)
        self.git('init', '-q')
        self.git('-c', 'user.email=t@t', '-c', 'user.name=t', 'add', '-A')
        self.git('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '-m', 'base')

    def test_appending_passes(self):
        self.commit_base([row()])
        self.write_evidence([row(), row(id='ev-2026-09-21-01', observed_at='2026-09-21', recorded_at='2026-09-21')])
        code, out, err = quiet(V.main, ['--base', 'HEAD'])
        self.assertEqual(code, 0, err)
        self.assertIn('append-only check passed', out)

    def test_editing_a_row_fails(self):
        self.commit_base([row()])
        self.write_evidence([row(result='contrary')])
        code, _, err = quiet(V.main, ['--base', 'HEAD'])
        self.assertEqual(code, 1)
        self.assertIn('append-only', err)

    def test_deleting_a_row_fails(self):
        self.commit_base([row()])
        self.write_evidence([])
        code, _, err = quiet(V.main, ['--base', 'HEAD'])
        self.assertEqual(code, 1)
        self.assertIn('append-only', err)


class Retrieval(PackageCopy):
    def test_plain_language_retention_query_finds_three_retention_records(self):
        found = Q.retrieve('retention', 'users stop coming back after week one', 3)
        self.assertEqual(len(found), 3)
        self.assertTrue(all(r['stack'] == 'retention' for r in found))

    def test_tested_record_outranks_candidate_on_equal_match(self):
        baseline = Q.retrieve('retention', '', 5)
        last = baseline[-1]['id']
        self.write_evidence([row(record_id=last)])
        self.assertEqual(Q.retrieve('retention', '', 5)[0]['id'], last)

    def test_contrary_evidence_is_always_shown(self):
        self.write_evidence([row(), row(id='ev-2026-09-20-02', result='contrary', product='mm-other',
                                        summary='No lift; opt-outs rose.')])
        found = Q.retrieve('retention', 'day one', 5)
        target = next(r for r in found if r['id'] == 'retention.gone-after-day-one')
        self.assertEqual(target['status'], 'contested')
        self.assertIn('CONTRARY', Q.brief([target]))

    def test_retired_records_are_hidden_unless_asked(self):
        self.write_evidence([row(result='harmful', guardrail_breaches=['guilt or loss messaging'])])
        ids = [r['id'] for r in Q.retrieve('retention', '', 10)]
        self.assertNotIn('retention.gone-after-day-one', ids)
        ids = [r['id'] for r in Q.retrieve('retention', '', 10, include_retired=True)]
        self.assertIn('retention.gone-after-day-one', ids)


class Recording(PackageCopy):
    ARGS = ['--record', 'retention.gone-after-day-one', '--product', 'mm-ctrl', '--level', '1', '--design', 'rct',
            '--metric', 'day-two return', '--result', 'supported', '--summary', 'Lift, guardrails flat.',
            '--source-ref', 'experiment export', '--observed-at', '2026-09-20']

    def test_append_then_validate(self):
        code, out, err = quiet(R.main, self.ARGS, today=TODAY)
        self.assertEqual(code, 0, err)
        self.assertIn('ev-2026-09-25-01', out)
        code, _, err = quiet(V.main, [])
        self.assertEqual(code, 0, err)

    def test_dry_run_writes_nothing(self):
        before = C.EVIDENCE_PATH.read_text(encoding='utf-8')
        code, out, _ = quiet(R.main, self.ARGS + ['--dry-run'], today=TODAY)
        self.assertEqual(code, 0)
        self.assertIn('"result": "supported"', out)
        self.assertEqual(C.EVIDENCE_PATH.read_text(encoding='utf-8'), before)

    def test_refuses_row_that_would_fail(self):
        code, _, err = quiet(R.main, self.ARGS[:-4] + ['--source-ref', 'ping ops@example.com'], today=TODAY)
        self.assertEqual(code, 1)
        self.assertIn('REFUSED', err)

    def test_retraction_round_trip(self):
        quiet(R.main, self.ARGS, today=TODAY)
        code, out, err = quiet(R.main, ['--retracts', 'ev-2026-09-25-01', '--summary', 'Wrong cohort window.',
                                        '--source-ref', 'analysis rerun'], today=TODAY)
        self.assertEqual(code, 0, err)
        self.assertIn('is now candidate', out)
        self.assertEqual(len(C.EVIDENCE_PATH.read_text(encoding='utf-8').splitlines()), 2)


if __name__ == '__main__':
    unittest.main()
