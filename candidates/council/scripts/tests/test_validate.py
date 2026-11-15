import unittest
from datetime import date, timedelta
from hashlib import sha256
import json
import pathlib
import shutil
import sys
from tempfile import mkdtemp

SCRIPTS = pathlib.Path(__file__).resolve().parents[1]
SKILL = SCRIPTS.parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(SCRIPTS))

import council as C  # noqa: E402
import validate as V  # noqa: E402


def ts_string(text):
    return "'" + text.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n') + "'"


def seats_source(seats):
    """A councilSeats.ts written the way the home writes it: briefs as joined arrays."""
    rows = []
    for s in seats:
        brief = '[\n      ' + ',\n      '.join(ts_string(line) for line in s['brief'].split('\n')) + ",\n    ].join('\\n')"
        lists = {f: '[' + ', '.join(ts_string(x) for x in s[f]) + ']' for f in C.SEAT_LISTS}
        rows.append('  {\n'
                    f"    key: {ts_string(s['key'])},\n"
                    f"    name: {ts_string(s['name'])},\n"
                    f'    brief: {brief},\n'
                    f"    agrees: {lists['agrees']},\n"
                    f"    clashes: {lists['clashes']},\n"
                    f"    asks: {lists['asks']},\n"
                    f"    default_action: {ts_string(s['default_action'])},\n"
                    '  },')
    return ('// a comment the reader skips\nexport interface CouncilSeat { key: string }\n'
            'export const COUNCIL_SEATS: CouncilSeat[] = [\n' + '\n'.join(rows) + '\n]\n')


def tests_source(tests):
    rows = [f"  {{\n    id: {ts_string(t['id'])},\n    label: {ts_string(t['label'])},\n    brief: {ts_string(t['brief'])},\n  }},"
            for t in tests]
    return ('/** block comment */\nexport const IDEA_TESTS: readonly IdeaTestDef[] = [\n' + '\n'.join(rows) + '\n]\n'
            'const TEST_IDS = new Set<string>(IDEA_TESTS.map(t => t.id))\n')


class Workspace(unittest.TestCase):
    """Each test works on a throwaway copy of the skill, so the real files are never touched."""

    def setUp(self):
        self.tmp = pathlib.Path(mkdtemp())
        self.repo = self.tmp / 'repo'
        self.skill = self.repo / 'candidates' / 'council'
        # The tests are left out of the copy: they plant the very words and links the gate refuses.
        shutil.copytree(SKILL, self.skill, ignore=shutil.ignore_patterns('__pycache__', 'tests'))
        self.cc = self.tmp / 'control-center'
        self.seats = C.load(self.skill / 'references' / 'seats.json')
        self.tests = C.load(self.skill / 'references' / 'idea-tests.json')

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def write_home(self, seats=None, tests=None):
        (self.cc / 'src' / 'lib').mkdir(parents=True, exist_ok=True)
        (self.cc / 'api').mkdir(parents=True, exist_ok=True)
        (self.cc / C.SEATS_HOME[0]).write_text(seats_source(seats or self.seats['seats']), encoding='utf-8')
        (self.cc / C.TESTS_HOME[0]).write_text(tests_source(tests or self.tests['tests']), encoding='utf-8')

    def write_json(self, name, doc):
        (self.skill / 'references' / name).write_text(C.canonical(doc), encoding='utf-8', newline='\n')

    def errors(self, control_center=None):
        return V.run(skill=self.skill, repo=self.repo, control_center=control_center)

    def assert_fails(self, needle, control_center=None):
        errors, _ = self.errors(control_center)
        self.assertTrue(any(needle in e for e in errors), f'expected an error containing {needle!r}, got {errors}')


class ShippedFiles(unittest.TestCase):
    def test_the_shipped_skill_passes_without_control_center(self):
        errors, notes = V.run(control_center=None)
        self.assertEqual(errors, [])
        self.assertIn('control-center comparison: switched off', notes)

    def test_five_seats_and_eight_tests_in_order(self):
        seats = C.load(C.SEATS_JSON)['seats']
        tests = C.load(C.TESTS_JSON)['tests']
        self.assertEqual(tuple(s['name'] for s in seats), C.SEAT_NAMES)
        self.assertEqual(tuple(t['id'] for t in tests), C.TEST_IDS)

    def test_the_denied_set_is_well_formed(self):
        self.assertGreater(len(C.DENIED_DIGESTS), 0)
        self.assertTrue(all(len(d) == 64 and int(d, 16) >= 0 for d in C.DENIED_DIGESTS))

    def test_the_gate_names_no_word_it_guards_against(self):
        for path in SKILL.rglob('*'):
            if path.is_file() and '__pycache__' not in path.parts:
                self.assertEqual(C.denied_runs(path.read_text(encoding='utf-8')), [], path.name)


class Structure(Workspace):
    def test_a_clean_copy_passes(self):
        self.assertEqual(self.errors()[0], [])

    def test_a_missing_seat_fails(self):
        self.seats['seats'].pop()
        self.write_json('seats.json', self.seats)
        self.assert_fails('the seats must be')

    def test_seats_out_of_order_fail(self):
        self.seats['seats'].reverse()
        self.write_json('seats.json', self.seats)
        self.assert_fails('in that order')

    def test_a_missing_idea_test_fails(self):
        self.tests['tests'] = self.tests['tests'][:7]
        self.write_json('idea-tests.json', self.tests)
        self.assert_fails('the idea tests must be')

    def test_an_empty_list_fails(self):
        self.seats['seats'][2]['asks'] = []
        self.write_json('seats.json', self.seats)
        self.assert_fails('asks must be a list of filled strings')

    def test_an_extra_field_fails(self):
        self.tests['tests'][0]['score'] = 'x'
        self.write_json('idea-tests.json', self.tests)
        self.assert_fails('fields must be exactly')

    def test_a_hand_edited_markdown_fails(self):
        md = self.skill / 'references' / 'seats.md'
        md.write_text(md.read_text(encoding='utf-8').replace('Raise the first two', 'Lift the first two'), encoding='utf-8')
        self.assert_fails('seats.md is not what the JSON draws')

    def test_json_that_is_not_canonical_fails(self):
        (self.skill / 'references' / 'idea-tests.json').write_text(json.dumps(self.tests), encoding='utf-8')
        self.assert_fails('not canonically written')

    def test_a_wrong_home_fails(self):
        self.seats['home']['path'] = 'src/lib/elsewhere.ts'
        self.write_json('seats.json', self.seats)
        self.assert_fails('must name its home')

    def test_a_missing_reference_fails(self):
        (self.skill / 'references' / 'protocol.md').unlink()
        self.assert_fails('which does not exist')


class Text(Workspace):
    def test_an_em_dash_fails(self):
        path = self.skill / 'references' / 'protocol.md'
        path.write_text(path.read_text(encoding='utf-8') + '\nOne more line \u2014 with a dash.\n', encoding='utf-8')
        self.assert_fails('contains an em dash')

    def test_an_outside_link_fails(self):
        path = self.skill / 'SKILL.md'
        link = 'https:' + '//example.com'
        path.write_text(path.read_text(encoding='utf-8') + f'\nSee {link} for more.\n', encoding='utf-8')
        self.assert_fails('links out')

    def test_a_denied_name_fails_in_every_spelling(self):
        planted = {sha256(b'zebrastripe').hexdigest(), sha256(b'quokka').hexdigest()}
        saved = C.DENIED_DIGESTS
        try:
            C.DENIED_DIGESTS = frozenset(planted)
            for line in ('the Zebra-Stripe method', 'per zebra stripe', 'ZebraStripe', 'a Quokka.'):
                path = self.skill / 'references' / 'protocol.md'
                original = path.read_text(encoding='utf-8')
                path.write_text(original + f'\n{line}\n', encoding='utf-8')
                self.assert_fails('names an outside source')
                path.write_text(original, encoding='utf-8')
            self.assertEqual(self.errors()[0], [])
        finally:
            C.DENIED_DIGESTS = saved

    def test_a_denied_name_in_a_companion_fails(self):
        saved = C.DENIED_DIGESTS
        try:
            C.DENIED_DIGESTS = frozenset({sha256(b'quokka').hexdigest()})
            record = self.repo / 'state' / 'candidates' / 'council.yaml'
            record.parent.mkdir(parents=True)
            record.write_text('id: council\nactivation: false\nrelease_eligible: false\nnote: quokka\n', encoding='utf-8')
            self.assert_fails('council.yaml: names an outside source')
        finally:
            C.DENIED_DIGESTS = saved

    def test_an_active_record_fails(self):
        record = self.repo / 'state' / 'candidates' / 'council.yaml'
        record.parent.mkdir(parents=True)
        record.write_text('id: council\nactivation: true\nrelease_eligible: false\n', encoding='utf-8')
        self.assert_fails('must say activation: false')

    def test_a_record_asking_for_a_surface_fails(self):
        record = self.repo / 'state' / 'candidates' / 'council.yaml'
        record.parent.mkdir(parents=True)
        record.write_text('id: council\nactivation: false\nrelease_eligible: false\nrequested_surfaces: [codex-current]\n', encoding='utf-8')
        self.assert_fails('must request no surface')


class Evals(Workspace):
    def write_suite(self, kind, rows):
        path = self.repo / 'evals' / 'candidates' / f'council-{kind}-cases.jsonl'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(''.join(json.dumps(r) + '\n' for r in rows), encoding='utf-8')

    def trigger_rows(self):
        rows = []
        for category, n in V.TRIGGER_MINIMUMS.items():
            rows += [{'id': f't-{category}-{i}', 'category': category, 'prompt': f'case {category} {i}',
                      'should_trigger': category == 'positive'} for i in range(n)]
        return rows

    def behavior_rows(self):
        return [{'id': f'b-{category}-{i}', 'category': category, 'scenario': f'case {category} {i}'}
                for category, n in V.BEHAVIOR_MINIMUMS.items() for i in range(n)]

    def test_full_suites_pass(self):
        self.write_suite('trigger', self.trigger_rows())
        self.write_suite('behavior', self.behavior_rows())
        errors, notes = self.errors()
        self.assertEqual(errors, [])
        self.assertTrue(any(n.startswith('held out:') for n in notes))

    def test_a_short_suite_fails(self):
        self.write_suite('trigger', self.trigger_rows()[1:])
        self.assert_fails('needs at least 8 positive cases')

    def test_a_case_copied_from_the_skill_fails(self):
        rows = self.behavior_rows()
        rows[0]['scenario'] = 'A seat argues from its own lane and nowhere else, always.'
        self.write_suite('behavior', rows)
        self.assert_fails('not held out')

    def test_duplicate_ids_fail(self):
        rows = self.trigger_rows()
        rows[1]['id'] = rows[0]['id']
        self.write_suite('trigger', rows)
        self.assert_fails('unique id')


class Home(Workspace):
    def test_a_matching_home_passes_byte_for_byte(self):
        self.write_home()
        errors, notes = self.errors(self.cc)
        self.assertEqual(errors, [])
        self.assertEqual(sum('byte for byte' in n for n in notes), 2)

    def test_one_changed_character_in_the_home_fails(self):
        seats = json.loads(json.dumps(self.seats['seats']))
        seats[3]['default_action'] = seats[3]['default_action'].replace('week', 'month')
        self.write_home(seats=seats)
        self.assert_fails('seat scale: default_action differs from control-center', self.cc)

    def test_a_changed_brief_line_in_the_home_fails(self):
        tests = json.loads(json.dumps(self.tests['tests']))
        tests[5]['brief'] = tests[5]['brief'] + ' '
        self.write_home(tests=tests)
        self.assert_fails('idea test heard_it: brief differs', self.cc)

    def test_a_home_with_more_entries_fails(self):
        tests = json.loads(json.dumps(self.tests['tests'])) + [{'id': 'extra', 'label': 'x', 'brief': 'y'}]
        self.write_home(tests=tests)
        self.assert_fails('has 9 entries in control-center and 8 here', self.cc)

    def test_an_absent_home_is_skipped_and_says_so(self):
        errors, notes = self.errors(self.tmp / 'nowhere')
        self.assertEqual(errors, [])
        self.assertEqual(sum('skipped' in n for n in notes), 2)

    def test_a_home_without_the_export_fails(self):
        self.write_home()
        (self.cc / C.TESTS_HOME[0]).write_text('export const SOMETHING_ELSE = []\n', encoding='utf-8')
        self.assert_fails('no export named IDEA_TESTS', self.cc)

    def test_a_home_in_a_shape_the_reader_cannot_follow_fails(self):
        self.write_home()
        (self.cc / C.SEATS_HOME[0]).write_text('export const COUNCIL_SEATS = build()\n', encoding='utf-8')
        self.assert_fails('cannot read COUNCIL_SEATS', self.cc)


class Reader(unittest.TestCase):
    def test_escapes_and_join(self):
        source = "export const X: string[] = [\n  'it\\'s', \"two \\\"q\\\"\", 'back\\\\slash', ['a', 'b'].join('\\n'), // note\n]\n"
        self.assertEqual(C.read_export(source, 'X'), ["it's", 'two "q"', 'back\\slash', 'a\nb'])

    def test_unterminated_string_fails(self):
        with self.assertRaises(C.SourceError):
            C.read_export("export const X = ['open\n]", 'X')


class Dissenter(unittest.TestCase):
    def test_the_rotation_matches_control_center(self):
        self.assertEqual(C.dissenter(date(1970, 1, 1)), 'Offer')
        self.assertEqual(C.dissenter(date(1970, 1, 2)), 'Attention')
        self.assertEqual(C.dissenter(date(2026, 11, 15)), 'Experience')
        self.assertEqual(C.dissenter(date(2026, 11, 16)), 'Scale')
        self.assertEqual(C.dissenter(date(1969, 12, 31)), 'Distribution')

    def test_one_seat_a_day_cycles_through_all_five(self):
        start = date(2026, 11, 15)
        week = [C.dissenter(start + timedelta(days=i)) for i in range(5)]
        self.assertEqual(sorted(week), sorted(C.SEAT_NAMES))


if __name__ == '__main__':
    unittest.main()
