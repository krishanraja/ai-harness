import json
import pathlib
import shutil
import subprocess
import sys
import unittest
from hashlib import sha256
from tempfile import mkdtemp

SCRIPTS = pathlib.Path(__file__).resolve().parents[1]
SKILL = SCRIPTS.parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(SCRIPTS))

import adcopy as A  # noqa: E402
import validate as V  # noqa: E402

# Synthetic captions for a made-up mug brand. None of them is a real ad.
SWIPE = [
    {'id': 'SW-001', 'captured': '2026-11-15', 'source': 'paste', 'running_days': 64,
     'copy': 'Every morning your cat ignores you and then sits on your laptop like it pays the rent here.'},
    {'id': 'SW-002', 'captured': '2026-11-15', 'source': 'paste', 'running_days': None,
     'copy': 'The present your sister will pretend she did not cry over.'},
]


def good_set():
    return {
        'set': 'mug-roast', 'venture': 'testventure',
        'creative_read': {'0': 'a grey cat on a desk', '1': 'the cat turns to camera', '2': 'a paw on the mug', '3': 'the painted mug fills the frame'},
        'variations': [
            {'id': 'A', 'text': 'He knocked your coffee over twice this week.\nNow he wants his face on the mug.',
             'angle': 'the pet takes credit', 'hook': 'a crime report', 'reader': 'a gift buyer',
             'borrowed': 'SW-001', 'took': 'opens on a daily annoyance'},
            {'id': 'B', 'text': 'Gift idea for the friend whose cat runs the house: the cat, painted, on the mug she drinks from every morning, staring back.',
             'angle': 'the friend who has everything', 'hook': 'a plain gift tip', 'reader': 'someone buying for a friend',
             'borrowed': 'SW-002', 'took': 'names who the present is for'},
            {'id': 'C', 'text': 'Tag the person this cat owns. They need this mug, and the cat already approved the painting while you were asleep, which is how it approves everything in that flat.',
             'angle': 'the owner as the joke', 'hook': 'a direct order', 'reader': 'a follower who tags friends',
             'borrowed': 'SW-001', 'took': 'asks the reader to act on someone else'},
        ],
    }


class Workspace(unittest.TestCase):
    """Each test works on a throwaway copy, so the real files are never touched."""

    def setUp(self):
        self.tmp = pathlib.Path(mkdtemp())
        self.repo = self.tmp / 'repo'
        self.skill = self.repo / 'candidates' / 'ad-copywriter'
        # The tests are left out of the copy: they plant the very text the gate refuses.
        shutil.copytree(SKILL, self.skill, ignore=shutil.ignore_patterns('__pycache__', 'tests'))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def errors(self):
        return V.run(skill=self.skill, repo=self.repo)

    def assert_fails(self, needle):
        errors, _ = self.errors()
        self.assertTrue(any(needle in e for e in errors), f'expected an error containing {needle!r}, got {errors}')

    def write_swipe(self, entries=SWIPE, name='swipe.jsonl'):
        path = self.tmp / name
        path.write_text(''.join(json.dumps(e) + '\n' for e in entries), encoding='utf-8')
        return path


class ShippedFiles(unittest.TestCase):
    def test_the_shipped_skill_passes(self):
        errors, notes = V.run()
        self.assertEqual(errors, [])

    def test_the_denied_set_is_well_formed(self):
        self.assertGreater(len(A.DENIED_DIGESTS), 0)
        self.assertTrue(all(len(d) == 64 and int(d, 16) >= 0 for d in A.DENIED_DIGESTS))

    def test_the_skill_names_no_word_it_guards_against(self):
        for path in SKILL.rglob('*'):
            if path.is_file() and '__pycache__' not in path.parts:
                self.assertEqual(A.denied_runs(path.read_text(encoding='utf-8')), [], path.name)


class Gate(Workspace):
    def test_a_clean_copy_passes(self):
        self.assertEqual(self.errors()[0], [])

    def test_an_em_dash_fails(self):
        path = self.skill / 'references' / 'method.md'
        path.write_text(path.read_text(encoding='utf-8') + '\nOne more line ' + chr(0x2014) + ' with a dash.\n', encoding='utf-8')
        self.assert_fails('contains an em dash')

    def test_an_outside_link_fails(self):
        path = self.skill / 'SKILL.md'
        link = 'https:' + '//example.com'
        path.write_text(path.read_text(encoding='utf-8') + f'\nSee {link}.\n', encoding='utf-8')
        self.assert_fails('links out')

    def test_a_denied_name_fails_in_every_spelling(self):
        saved = A.DENIED_DIGESTS
        try:
            A.DENIED_DIGESTS = frozenset({sha256(b'zebrastripe').hexdigest()})
            path = self.skill / 'references' / 'fields.md'
            original = path.read_text(encoding='utf-8')
            for line in ('the Zebra-Stripe method', 'per zebra stripe', 'ZebraStripe.'):
                path.write_text(original + f'\n{line}\n', encoding='utf-8')
                self.assert_fails('names an outside source')
            path.write_text(original, encoding='utf-8')
            self.assertFalse(any('outside source' in e for e in self.errors()[0]))
        finally:
            A.DENIED_DIGESTS = saved

    def test_a_denied_name_in_the_proposal_fails(self):
        saved = A.DENIED_DIGESTS
        try:
            A.DENIED_DIGESTS = frozenset({sha256(b'quokka').hexdigest()})
            proposal = self.repo / 'docs' / 'proposals' / '2026-11-15-ad-copywriter.md'
            proposal.parent.mkdir(parents=True)
            proposal.write_text('Learned from a quokka.\n', encoding='utf-8')
            self.assert_fails('names an outside source')
        finally:
            A.DENIED_DIGESTS = saved

    def test_a_swipe_file_in_the_skill_fails(self):
        (self.skill / 'references' / 'swipe.jsonl').write_text(json.dumps(SWIPE[0]) + '\n', encoding='utf-8')
        self.assert_fails('a swipe file is never kept here')

    def test_a_committed_swipe_file_fails(self):
        subprocess.run(['git', 'init', '-q'], cwd=self.repo, check=True)
        (self.repo / 'my-swipe.csv').write_text('id,copy\n', encoding='utf-8')
        subprocess.run(['git', 'add', 'my-swipe.csv'], cwd=self.repo, check=True)
        self.assert_fails('my-swipe.csv: a swipe file is committed')

    def test_a_denied_set_that_drifts_from_the_council_fails(self):
        council = self.repo / 'candidates' / 'council' / 'scripts' / 'council.py'
        council.parent.mkdir(parents=True)
        council.write_text("DENIED_DIGESTS = frozenset({\n    '" + 'a' * 64 + "',\n})\n", encoding='utf-8')
        self.assert_fails('the denied-name set differs')

    def test_a_matching_council_set_passes(self):
        council = self.repo / 'candidates' / 'council' / 'scripts' / 'council.py'
        council.parent.mkdir(parents=True)
        rows = ''.join(f"    '{d}',\n" for d in sorted(A.DENIED_DIGESTS))
        council.write_text('DENIED_DIGESTS = frozenset({\n' + rows + '})\n', encoding='utf-8')
        errors, notes = self.errors()
        self.assertEqual(errors, [])
        self.assertTrue(any('matches candidates/council' in n for n in notes))

    def test_an_active_record_fails(self):
        record = self.repo / 'state' / 'candidates' / 'ad-copywriter.yaml'
        record.parent.mkdir(parents=True)
        record.write_text('id: ad-copywriter\nactivation: true\nrelease_eligible: false\n', encoding='utf-8')
        self.assert_fails('must say activation: false')

    def test_a_record_asking_for_a_surface_fails(self):
        record = self.repo / 'state' / 'candidates' / 'ad-copywriter.yaml'
        record.parent.mkdir(parents=True)
        record.write_text('activation: false\nrelease_eligible: false\nrequested_surfaces: [codex-current]\n', encoding='utf-8')
        self.assert_fails('must request no surface')

    def test_a_case_copied_from_the_skill_fails(self):
        suite = self.repo / 'evals' / 'candidates' / 'ad-copywriter-trigger-cases.jsonl'
        suite.parent.mkdir(parents=True)
        copied = 'Each one differs from the other two on all four of these, says the brief.'
        suite.write_text(json.dumps({'id': 't1', 'category': 'positive', 'prompt': copied,
                                     'should_trigger': True, 'held_out': True}) + '\n', encoding='utf-8')
        self.assert_fails('cases not held out')

    def test_too_few_cases_fail(self):
        suite = self.repo / 'evals' / 'candidates' / 'ad-copywriter-behavior-cases.jsonl'
        suite.parent.mkdir(parents=True)
        suite.write_text(json.dumps({'id': 'b1', 'category': 'nominal', 'scenario': 'x', 'held_out': True}) + '\n', encoding='utf-8')
        self.assert_fails('needs at least 6 nominal cases')

    def test_a_prompt_that_does_not_call_the_skill_fails(self):
        path = self.skill / 'agents' / 'openai.yaml'
        path.write_text(path.read_text(encoding='utf-8').replace('$ad-copywriter', 'the copywriter'), encoding='utf-8')
        self.assert_fails('default_prompt must call')

    def test_a_missing_reference_fails(self):
        (self.skill / 'references' / 'swipe-file.md').unlink()
        self.assert_fails('which does not exist')


class Lint(Workspace):
    def test_a_good_set_passes_with_the_swipe_file(self):
        entries, errors, notes = A.load_swipe(self.write_swipe())
        self.assertEqual(errors, [])
        self.assertEqual(A.lint(good_set(), entries), [])

    def test_no_swipe_file_skips_and_says_so(self):
        entries, errors, notes = A.load_swipe(self.tmp / 'missing.jsonl')
        self.assertIsNone(entries)
        self.assertEqual(errors, [])
        self.assertTrue(any('skipped' in n for n in notes))
        self.assertEqual(A.lint(good_set(), entries), [])

    def test_eight_copied_words_fail_and_seven_pass(self):
        entries, _, _ = A.load_swipe(self.write_swipe())
        doc = good_set()
        doc['variations'][0]['text'] += '\nThen he sits on your laptop like it pays the rent.'
        self.assertTrue(any('shares an eight-word run with SW-001' in e for e in A.lint(doc, entries)))
        doc = good_set()
        doc['variations'][0]['text'] += '\nThen he sits on your laptop like it pays.'
        self.assertFalse(any('SW-001' in e for e in A.lint(doc, entries)))

    def test_copied_words_fail_whatever_the_case_and_punctuation(self):
        entries, _, _ = A.load_swipe(self.write_swipe())
        doc = good_set()
        doc['variations'][1]['text'] += '\nTHE present, your sister will pretend she did not cry over!'
        self.assertTrue(any('SW-002' in e for e in A.lint(doc, entries)))

    def test_two_variations_are_not_a_set(self):
        doc = good_set()
        doc['variations'].pop()
        self.assertTrue(any('a set holds 3 variations' in e for e in A.lint(doc)))

    def test_the_same_angle_reader_or_hook_fails(self):
        for field in ('angle', 'reader', 'hook'):
            doc = good_set()
            doc['variations'][2][field] = doc['variations'][0][field].upper()
            self.assertTrue(any(f'the same {field}' in e for e in A.lint(doc)), field)

    def test_the_same_opening_fails(self):
        doc = good_set()
        doc['variations'][1]['text'] = 'He knocked your mug clean off the table and then asked for a portrait of himself on a new one.'
        self.assertTrue(any('open the same way' in e for e in A.lint(doc)))

    def test_lengths_too_close_fail(self):
        doc = good_set()
        doc['variations'][1]['text'] = 'Gift idea: the cat who runs the house, painted on her mug, staring back at breakfast.'
        doc['variations'][0]['text'] = 'Your cat knocked the coffee over twice this week and now wants a mug of his own face.'
        self.assertTrue(any('about the same length' in e for e in A.lint(doc)))

    def test_two_variations_sharing_eight_words_fail(self):
        doc = good_set()
        shared = ' The cat already approved the painting while you were asleep.'
        doc['variations'][1]['text'] += shared
        self.assertTrue(any('share an eight-word run' in e for e in A.lint(doc)))

    def test_a_name_in_place_of_an_id_fails(self):
        doc = good_set()
        doc['variations'][0]['borrowed'] = 'the big pet brand'
        self.assertTrue(any('never a name' in e for e in A.lint(doc)))

    def test_an_unknown_id_fails_only_when_the_swipe_file_is_read(self):
        doc = good_set()
        doc['variations'][0]['borrowed'] = 'SW-099'
        entries, _, _ = A.load_swipe(self.write_swipe())
        self.assertTrue(any('SW-099 is not in the swipe file' in e for e in A.lint(doc, entries)))
        self.assertEqual(A.lint(doc, None), [])

    def test_a_missing_creative_read_fails(self):
        doc = good_set()
        del doc['creative_read']['3']
        self.assertTrue(any('seconds 0, 1, 2 and 3' in e for e in A.lint(doc)))

    def test_a_missing_took_line_fails(self):
        doc = good_set()
        doc['variations'][2]['took'] = ' '
        self.assertTrue(any('needs took' in e for e in A.lint(doc)))

    def test_a_bad_swipe_entry_is_reported(self):
        path = self.write_swipe([{'id': 'Big Brand', 'captured': 'today', 'source': 'a friend', 'copy': ''}])
        _, errors, _ = A.load_swipe(path)
        for needle in ('id must look like SW-001', 'copy is empty', 'captured must be', 'source must be'):
            self.assertTrue(any(needle in e for e in errors), needle)

    def test_a_swipe_file_git_would_commit_fails(self):
        repo = self.tmp / 'engine'
        repo.mkdir()
        subprocess.run(['git', 'init', '-q'], cwd=repo, check=True)
        path = self.write_swipe(name='engine/swipe.jsonl')
        _, errors, _ = A.load_swipe(path)
        self.assertTrue(any('not ignored by git' in e for e in errors))
        (repo / '.gitignore').write_text('swipe.jsonl\n', encoding='utf-8')
        _, errors, _ = A.load_swipe(path)
        self.assertEqual(errors, [])

    def test_the_command_line_reports_and_fails(self):
        doc = good_set()
        doc['variations'].pop()
        path = self.tmp / 'set.json'
        path.write_text(json.dumps(doc), encoding='utf-8')
        self.assertEqual(A.main(['lint', str(path)]), 1)
        path.write_text(json.dumps(good_set()), encoding='utf-8')
        self.assertEqual(A.main(['lint', str(path), '--swipe', str(self.write_swipe())]), 0)


if __name__ == '__main__':
    unittest.main()
