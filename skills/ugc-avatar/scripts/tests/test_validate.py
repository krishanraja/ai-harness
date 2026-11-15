import datetime
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

import avatar as A  # noqa: E402
import validate as V  # noqa: E402

LOOKS = A.load(A.LOOKS)
TODAY = datetime.date(2026, 11, 15)
VENTURES = ('heartside', 'fulltime', 'makeyourmindup', 'mindmake', 'legibility')


def script(venture='heartside', piece='P001', **speaker):
    base = {'role': 'a presenter explaining how the gift is made', 'age_min': 25, 'age_max': 40,
            'setting': 'home', 'register': 'casual'}
    base.update(speaker)
    return {'venture': venture, 'piece': piece, 'script_id': 'S001', 'persona': 'p1', 'speaker': base,
            'lines': ['Here is how the painting gets onto the mug.']}


def use_yes(venture='heartside', piece='P001', by='Krish', words='Yes, use an AI presenter for this one.', stage='use'):
    return {'by': by, 'stage': stage, 'venture': venture, 'piece': piece, 'words': words}


QUOTE = {'provider': 'a lip-sync provider', 'item': 'lip-sync render, 20 seconds', 'credits': 120}
ASSET = sha256(b'the finished cut').hexdigest()


def reservation(quote=QUOTE, credits=None):
    return {'id': 'res-1', 'quote_sha256': A.digest(quote), 'credits': quote['credits'] if credits is None else credits}


def approval(quote=QUOTE, by='Krish', words='Yes to that quote.'):
    return {'by': by, 'quote_sha256': A.digest(quote), 'words': words}


def verdict(asset=ASSET, passed=True, reviewer='a second session', maker='the making session'):
    return {'asset_sha256': asset, 'passed': passed, 'reviewer': reviewer, 'maker': maker}


def release_yes(asset=ASSET, piece='P001', by='Krish', words='That is a 10. Ship it.', stage='release'):
    return {'by': by, 'stage': stage, 'piece': piece, 'asset_sha256': asset, 'words': words}


class Temp(unittest.TestCase):
    def setUp(self):
        self.tmp = pathlib.Path(mkdtemp())
        self.workspace = self.tmp / 'workspace'
        self.workspace.mkdir()

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def roll(self, s, use='default', **kw):
        use = use_yes(s['venture'], s['piece']) if use == 'default' else use
        return A.roll(s, self.workspace, use=use, looks=LOOKS, today=TODAY, **kw)

    def refused(self, s, needle, **kw):
        with self.assertRaises(A.Refused) as caught:
            self.roll(s, **kw)
        self.assertTrue(any(needle in r for r in caught.exception.reasons), f'{needle!r} not in {caught.exception.reasons}')


class AgeClamp(Temp):
    def test_a_minimum_under_18_is_refused(self):
        self.refused(script(age_min=17, age_max=30), 'age_min 17 is under 18')

    def test_a_maximum_under_18_is_refused(self):
        self.refused(script(age_min=16, age_max=17), 'age_max 17 is under 18')

    def test_18_is_allowed(self):
        look = self.roll(script(age_min=18, age_max=18))
        self.assertEqual(look['age'], 18)

    def test_the_default_range_is_adult(self):
        low, high = A.age_bounds({}, LOOKS)
        self.assertGreaterEqual(low, 18)
        self.assertGreaterEqual(high, low)

    def test_a_reversed_range_is_refused(self):
        self.refused(script(age_min=40, age_max=30), 'is below age_min')

    def test_an_age_that_is_not_a_whole_number_is_refused(self):
        self.refused(script(age_min='25'), 'must be a whole number')
        self.refused(script(age_min=True), 'must be a whole number')

    def test_every_draw_stays_inside_the_bounds_and_over_18(self):
        for seed in range(60):
            workspace = self.tmp / f'w{seed}'
            workspace.mkdir()
            look = A.roll(script(age_min=18, age_max=22), workspace, use=use_yes(), looks=LOOKS, seed=seed, today=TODAY)
            self.assertTrue(18 <= look['age'] <= 22)
            self.assertIn(f'aged {look["age"]}', look['prompt'])

    def test_words_that_describe_a_child_are_refused(self):
        for role in ('a teenager reacting to the gift', 'a young looking presenter', 'a girl next door', 'a kid at home'):
            self.refused(script(role=role), 'describe an adult')

    def test_a_child_in_the_lines_is_refused(self):
        s = script()
        s['lines'] = ['As a teen I always wanted one.']
        self.refused(s, 'describe an adult')


class FirstYes(Temp):
    def test_no_first_yes_refuses_the_roll(self):
        self.refused(script(), 'no first yes from Krish', use=None)

    def test_a_first_yes_from_someone_else_is_refused(self):
        self.refused(script(), 'the first yes is not Krish\'s', use=use_yes(by='a session'))

    def test_a_first_yes_for_another_piece_is_refused(self):
        self.refused(script(), 'a yes covers one piece', use=use_yes(piece='P002'))

    def test_a_first_yes_for_another_venture_is_refused(self):
        self.refused(script(), 'for another venture', use=use_yes(venture='fulltime'))

    def test_a_first_yes_without_his_words_is_refused(self):
        self.refused(script(), 'needs Krish\'s own words', use=use_yes(words='  '))

    def test_a_yes_to_the_release_is_not_a_first_yes(self):
        self.refused(script(), 'stage "use"', use=use_yes(stage='release'))

    def test_a_script_with_no_piece_is_refused(self):
        s = script()
        del s['piece']
        with self.assertRaises(A.Refused) as caught:
            A.roll(s, self.workspace, use=use_yes(), looks=LOOKS, today=TODAY)
        self.assertIn('the script needs piece', caught.exception.reasons)

    def test_the_look_names_its_piece(self):
        self.assertEqual(self.roll(script())['piece'], 'P001')


class EveryVenture(Temp):
    def test_every_venture_may_use_an_ai_person_with_the_first_yes(self):
        for venture in VENTURES:
            look = self.roll(script(venture=venture))
            self.assertEqual(look['venture'], venture)

    def test_no_venture_rules_file_gates_it_any_more(self):
        self.assertFalse((SKILL / 'references' / 'venture-rules.json').exists())


class NoLabel(Temp):
    def test_a_disclosure_in_the_script_is_refused(self):
        s = script()
        s['disclosure'] = 'This person is AI-generated.'
        self.refused(s, 'no AI label anywhere')

    def test_a_label_on_the_speaker_is_refused(self):
        self.refused(script(label='AI presenter'), 'no AI label anywhere')

    def test_no_label_is_needed_to_roll_or_run(self):
        look = self.roll(script())
        self.assertNotIn('disclosure', look)
        self.assertEqual(A.gate(look, QUOTE, use_yes(), reservation(), approval(), rule='approved'), [])

    def test_the_gate_refuses_a_look_that_carries_a_label(self):
        look = dict(self.roll(script()), disclosure='Made with AI.')
        self.assertTrue(any('no AI label anywhere' in r for r in A.gate(look, QUOTE, use_yes(), reservation(), approval(), rule='approved')))


class NeverACustomer(Temp):
    def test_a_customer_or_testimonial_role_is_refused(self):
        for role in ('a happy customer', 'someone unboxing the blanket', 'a verified buyer', 'a testimonial', 'a reviewer'):
            self.refused(script(role=role), 'never a customer')

    def test_a_testimonial_line_is_refused(self):
        s = script()
        s['lines'] = ['I bought the blanket for my lab and it is the best purchase of the year.']
        self.refused(s, 'never a customer')

    def test_a_credentialed_expert_is_refused(self):
        self.refused(script(role='a vet recommending the blanket'), 'credentialed expert')


class Likeness(Temp):
    def test_a_real_likeness_without_consent_is_refused(self):
        self.refused(script(likeness_of='a named person'), 'recorded consent')

    def test_a_real_likeness_with_a_consent_id_is_kept_on_the_look(self):
        look = self.roll(script(likeness_of='a named person', consent_id='consent-17'))
        self.assertEqual(look['consent_id'], 'consent-17')

    def test_an_unknown_setting_is_refused(self):
        self.refused(script(setting='a spaceship'), 'speaker setting must be one of')


class PaidStep(Temp):
    def setUp(self):
        super().setUp()
        self.look = self.roll(script())

    def reasons(self, res, app, quote=QUOTE, rule='approved', use='default'):
        use = use_yes() if use == 'default' else use
        return A.gate(self.look, quote, use, res, app, rule=rule)

    def test_everything_in_place_is_ready(self):
        self.assertEqual(self.reasons(reservation(), approval()), [])

    def test_no_first_yes_refuses_the_paid_step(self):
        self.assertTrue(any('no first yes from Krish' in r for r in self.reasons(reservation(), approval(), use=None)))

    def test_a_first_yes_for_another_piece_refuses_the_paid_step(self):
        self.assertTrue(any('a yes covers one piece' in r for r in self.reasons(reservation(), approval(), use=use_yes(piece='P009'))))

    def test_no_reservation_is_refused(self):
        self.assertIn('no credit reservation: reserve the quoted credits first', self.reasons(None, approval()))

    def test_a_reservation_for_another_quote_is_refused(self):
        other = dict(QUOTE, credits=40)
        self.assertIn('the reservation is for a different quote', self.reasons(reservation(other), approval()))

    def test_too_few_reserved_credits_are_refused(self):
        self.assertIn('the reservation holds fewer credits than the quote', self.reasons(reservation(credits=100), approval()))

    def test_a_reservation_with_no_id_is_refused(self):
        res = reservation()
        res['id'] = ''
        self.assertIn('the reservation has no id', self.reasons(res, approval()))

    def test_no_yes_on_the_quote_is_refused(self):
        self.assertIn('no yes from Krish on this quote', self.reasons(reservation(), None))

    def test_a_yes_on_another_quote_is_refused(self):
        other = dict(QUOTE, item='lip-sync render, 60 seconds')
        self.assertIn('Krish\'s yes is on a different quote', self.reasons(reservation(), approval(other)))

    def test_a_yes_from_someone_else_is_refused(self):
        self.assertIn('the approval is not Krish\'s', self.reasons(reservation(), approval(by='a session')))

    def test_a_yes_without_his_words_is_refused(self):
        self.assertIn('the approval needs Krish\'s own words', self.reasons(reservation(), approval(words='')))

    def test_a_quote_with_no_credits_is_refused(self):
        quote = dict(QUOTE, credits=0)
        self.assertTrue(any('credit amount above zero' in r for r in self.reasons(reservation(quote), approval(quote), quote=quote)))

    def test_a_rule_back_at_draft_holds_everything(self):
        self.assertIn('the approval and consent rule is draft, not approved by Krish',
                      self.reasons(reservation(), approval(), rule='draft'))

    def test_a_child_age_on_the_look_is_refused(self):
        self.look['age'] = 16
        self.assertIn('the look has no adult age; roll it again', self.reasons(reservation(), approval()))

    def test_the_digest_ignores_key_order(self):
        self.assertEqual(A.digest({'a': 1, 'b': 2}), A.digest({'b': 2, 'a': 1}))


class SecondYes(unittest.TestCase):
    def reasons(self, use='default', judged='default', yes='default', rule='approved', asset=ASSET):
        use = use_yes() if use == 'default' else use
        judged = verdict() if judged == 'default' else judged
        yes = release_yes() if yes == 'default' else yes
        return A.release(asset, 'P001', 'heartside', use, judged, yes, rule=rule)

    def test_both_yeses_and_the_judge_on_this_file_are_ready(self):
        self.assertEqual(self.reasons(), [])

    def test_no_second_yes_refuses(self):
        self.assertTrue(any('no second yes from Krish' in r for r in self.reasons(yes=None)))

    def test_no_first_yes_refuses_the_release(self):
        self.assertTrue(any('no first yes from Krish' in r for r in self.reasons(use=None)))

    def test_a_second_yes_on_another_file_refuses(self):
        other = sha256(b'an earlier cut').hexdigest()
        self.assertIn('Krish\'s second yes is on a different file; an edited file needs a new yes',
                      self.reasons(yes=release_yes(asset=other)))

    def test_a_second_yes_for_another_piece_refuses(self):
        self.assertIn('Krish\'s second yes is for another piece', self.reasons(yes=release_yes(piece='P002')))

    def test_a_first_yes_is_not_a_second_yes(self):
        self.assertTrue(any('stage "release"' in r for r in self.reasons(yes=release_yes(stage='use'))))

    def test_a_second_yes_from_someone_else_refuses(self):
        self.assertIn('the second yes is not Krish\'s', self.reasons(yes=release_yes(by='a session')))

    def test_a_second_yes_without_his_words_refuses(self):
        self.assertIn('the second yes needs Krish\'s own words', self.reasons(yes=release_yes(words='')))

    def test_no_verdict_refuses(self):
        self.assertIn('no verdict from the independent judge on this file', self.reasons(judged=None))

    def test_a_failed_verdict_refuses(self):
        self.assertTrue(any('did not pass this file' in r for r in self.reasons(judged=verdict(passed=False))))

    def test_a_verdict_on_another_file_refuses(self):
        self.assertIn('the judge\'s verdict is on a different file', self.reasons(judged=verdict(asset='0' * 64)))

    def test_the_maker_cannot_judge_its_own_file(self):
        self.assertIn('the judge must be someone other than the file\'s maker',
                      self.reasons(judged=verdict(reviewer='the making session')))


class Workspace(Temp):
    def test_the_history_is_kept_in_the_workspace(self):
        look = self.roll(script())
        lines = (self.workspace / A.HISTORY).read_text(encoding='utf-8').splitlines()
        self.assertEqual(json.loads(lines[0])['look_id'], look['look_id'])

    def test_a_persona_keeps_its_look_across_pieces(self):
        first = self.roll(script())
        s = script(piece='P002')
        s['script_id'] = 'S002'
        again = self.roll(s)
        self.assertTrue(again['reused'])
        self.assertEqual(again['look_id'], first['look_id'])
        self.assertEqual((again['script_id'], again['piece']), ('S002', 'P002'))

    def test_a_new_look_never_repeats_an_earlier_one(self):
        seen = set()
        for n in range(12):
            look = self.roll(script(), new=True)
            combo = A.combination(look['attributes'])
            self.assertNotIn(combo, seen)
            seen.add(combo)

    def test_a_workspace_git_would_commit_is_refused(self):
        subprocess.run(['git', 'init', '-q'], cwd=self.workspace, check=True)
        self.refused(script(), 'not ignored by git')
        (self.workspace / '.gitignore').write_text('ugc-avatar/\n', encoding='utf-8')
        self.assertFalse(self.roll(script())['reused'])

    def test_a_missing_workspace_is_refused(self):
        with self.assertRaises(A.Refused):
            A.roll(script(), self.tmp / 'nowhere', use=use_yes(), looks=LOOKS)


class CommandLine(Temp):
    def write(self, name, doc):
        path = self.tmp / name
        path.write_text(json.dumps(doc), encoding='utf-8')
        return str(path)

    def test_a_refused_roll_exits_one(self):
        args = ['roll', self.write('s.json', script(age_min=12)), '--workspace', str(self.workspace),
                '--approval', self.write('u.json', use_yes())]
        self.assertEqual(A.main(args), 1)

    def test_a_roll_without_the_first_yes_exits_one(self):
        self.assertEqual(A.main(['roll', self.write('s.json', script()), '--workspace', str(self.workspace)]), 1)

    def test_the_gate_is_ready_with_everything_in_place(self):
        look = self.roll(script())
        args = ['gate', self.write('l.json', look), self.write('q.json', QUOTE), '--use', self.write('u.json', use_yes()),
                '--reservation', self.write('r.json', reservation()), '--approval', self.write('a.json', approval())]
        self.assertEqual(A.main(args), 0)

    def test_the_gate_without_the_first_yes_exits_one(self):
        look = self.roll(script())
        args = ['gate', self.write('l.json', look), self.write('q.json', QUOTE),
                '--reservation', self.write('r.json', reservation()), '--approval', self.write('a.json', approval())]
        self.assertEqual(A.main(args), 1)

    def test_the_release_reads_the_file_itself(self):
        cut = self.tmp / 'cut.mp4'
        cut.write_bytes(b'the finished cut')
        base = ['release', str(cut), '--use', self.write('u.json', use_yes()), '--verdict', self.write('v.json', verdict())]
        self.assertEqual(A.main(base + ['--approval', self.write('y.json', release_yes())]), 0)
        self.assertEqual(A.main(base), 1)
        cut.write_bytes(b'the finished cut, trimmed after his yes')
        self.assertEqual(A.main(base + ['--approval', self.write('y.json', release_yes())]), 1)

    def test_the_digest_prints(self):
        self.assertEqual(A.main(['digest', self.write('q.json', QUOTE)]), 0)


class ShippedFiles(unittest.TestCase):
    def test_the_shipped_skill_passes(self):
        errors, notes = V.run()
        self.assertEqual(errors, [])
        self.assertIn('approval and consent rule: approved', notes)

    def test_the_shipped_rule_is_approved_and_cites_the_ruling(self):
        self.assertEqual(A.rule_status(), 'approved')
        self.assertIn('Ruling (Krish, 2026-11-15)', A.RULE.read_text(encoding='utf-8'))

    def test_the_denied_set_is_well_formed(self):
        self.assertTrue(A.DENIED_DIGESTS and all(len(d) == 64 and int(d, 16) >= 0 for d in A.DENIED_DIGESTS))

    def test_the_skill_names_no_word_it_guards_against(self):
        for path in SKILL.rglob('*'):
            if path.is_file() and '__pycache__' not in path.parts:
                self.assertEqual(A.denied_runs(path.read_text(encoding='utf-8')), [], path.name)


class Gate(unittest.TestCase):
    def setUp(self):
        self.tmp = pathlib.Path(mkdtemp())
        self.repo = self.tmp / 'repo'
        self.skill = self.repo / 'skills' / 'ugc-avatar'
        shutil.copytree(SKILL, self.skill, ignore=shutil.ignore_patterns('__pycache__', 'tests'))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def assert_fails(self, needle):
        errors, _ = V.run(skill=self.skill, repo=self.repo)
        self.assertTrue(any(needle in e for e in errors), f'expected {needle!r}, got {errors}')

    def edit_json(self, name, change):
        path = self.skill / 'references' / name
        doc = json.loads(path.read_text(encoding='utf-8'))
        change(doc)
        path.write_text(json.dumps(doc, indent=2) + '\n', encoding='utf-8')

    def edit_rule(self, old, new):
        path = self.skill / 'references' / 'approval-and-consent.md'
        path.write_text(path.read_text(encoding='utf-8').replace(old, new), encoding='utf-8')

    def test_a_clean_copy_passes(self):
        self.assertEqual(V.run(skill=self.skill, repo=self.repo)[0], [])

    def test_a_minimum_age_under_18_in_the_pools_fails(self):
        self.edit_json('looks.json', lambda d: d.update(minimum_age=16))
        self.assert_fails('minimum_age must be 18')

    def test_a_default_age_under_18_fails(self):
        self.edit_json('looks.json', lambda d: d.update(default_age=[16, 30]))
        self.assert_fails('default_age must be two ages, 18 or over')

    def test_a_pool_that_describes_a_child_fails(self):
        self.edit_json('looks.json', lambda d: d['pools']['hair'].append('pigtails like a schoolgirl'))
        self.assert_fails('which describes a child')

    def test_a_rule_without_a_status_fails(self):
        self.edit_rule('Status: approved', 'State: approved')
        self.assert_fails('needs a Status line')

    def test_an_approved_rule_without_the_ruling_fails(self):
        self.edit_rule('Ruling (Krish, 2026-11-15)', 'his ruling')
        self.assert_fails('cites no Ruling (Krish, YYYY-MM-DD)')

    def test_history_inside_the_skill_fails(self):
        (self.skill / 'references' / 'history.jsonl').write_text('{}\n', encoding='utf-8')
        self.assert_fails('roll history is never kept here')

    def test_an_active_candidate_record_fails(self):
        record = self.repo / 'state' / 'candidates' / 'ugc-avatar.yaml'
        record.parent.mkdir(parents=True)
        record.write_text('activation: true\nrelease_eligible: false\n', encoding='utf-8')
        self.assert_fails('must say activation: false')

    def test_an_em_dash_fails(self):
        path = self.skill / 'references' / 'pipeline.md'
        path.write_text(path.read_text(encoding='utf-8') + '\nA line ' + chr(0x2014) + ' with a dash.\n', encoding='utf-8')
        self.assert_fails('contains an em dash')

    def test_a_denied_name_fails(self):
        saved = A.DENIED_DIGESTS
        try:
            A.DENIED_DIGESTS = frozenset({sha256(b'zebrastripe').hexdigest()})
            path = self.skill / 'SKILL.md'
            path.write_text(path.read_text(encoding='utf-8') + '\nPer the Zebra Stripe method.\n', encoding='utf-8')
            self.assert_fails('names an outside source')
        finally:
            A.DENIED_DIGESTS = saved

    def test_a_case_copied_from_the_skill_fails(self):
        suite = self.repo / 'evals' / 'ugc-avatar-trigger-cases.jsonl'
        suite.parent.mkdir(parents=True)
        copied = 'Never share a voice between two personas, and never give one persona two voices.'
        suite.write_text(json.dumps({'id': 't1', 'category': 'positive', 'prompt': copied,
                                     'should_trigger': True, 'held_out': True}) + '\n', encoding='utf-8')
        self.assert_fails('cases not held out')


if __name__ == '__main__':
    unittest.main()
