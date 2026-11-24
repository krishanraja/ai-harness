"""Offline tests for the revenue sheet validator. Standard library only; every fixture is synthetic."""
import copy
import json
import pathlib
import subprocess
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
HERE = pathlib.Path(__file__).resolve().parent
SCRIPTS = HERE.parent
sys.path.insert(0, str(SCRIPTS))
import validate_sheet as S  # noqa: E402

SAMPLE = json.loads((HERE / 'fixtures' / 'sample-sheet.json').read_text(encoding='utf-8'))


def resealed(sheet):
    sheet['sheet_sha256'] = S.sheet_sha(sheet)
    return sheet


def errors_after(change):
    sheet = copy.deepcopy(SAMPLE)
    change(sheet)
    return S.validate(resealed(sheet))


def measure_first(s):
    for r in s['readings']:
        r.update(value=None, source=None, as_of=None, sight='blind', blind_reason='never measured')
    s['stage'] = {'verdict': 'measure-first', 'buyer_seen': False, 'reason': 'Nothing is counted yet.',
                  'reading_plan': ['read sends from the engine record each day']}
    s['constraint'] = s['reach'] = s['test_card'] = None
    s['ask']['raise'] = False
    s['ask']['trigger'] = 'none'


class SheetTests(unittest.TestCase):
    def assertHeld(self, change, fragment):
        errors = errors_after(change)
        self.assertTrue(any(fragment in e for e in errors), f'expected {fragment!r} in {errors}')

    def assertPasses(self, change):
        self.assertEqual(errors_after(change), [])

    def test_sample_passes(self):
        self.assertEqual(S.validate(SAMPLE), [])

    def test_hash_must_match(self):
        sheet = copy.deepcopy(SAMPLE)
        sheet['venture'] = 'another'
        self.assertTrue(any('sheet_sha256' in e for e in S.validate(sheet)))

    # R01, R02
    def test_blind_reading_as_zero_is_held(self):
        self.assertHeld(lambda s: s['readings'][3].update(value=0), 'blind is never zero')

    def test_stale_fresh_reading_is_held(self):
        self.assertHeld(lambda s: s['readings'][0].update(as_of='2026-11-10'), 'so it is blind, not fresh')

    def test_blind_venture_never_on_track(self):
        self.assertHeld(lambda s: s.update(standing='on track'), 'never on track')

    def test_blind_needs_reason(self):
        self.assertHeld(lambda s: s['readings'][3].update(blind_reason=''), 'needs its reason')

    # R03, R07
    def test_constraint_on_blind_step_is_held(self):
        self.assertHeld(lambda s: s['constraint'].update(step='sale'), 'a blind step is a reading problem')

    def test_test_card_on_blind_step_is_held(self):
        self.assertHeld(lambda s: s['test_card'].update(step='sale'), "owner's job, not a test")

    # R04
    def test_measure_first_passes_alone(self):
        def change(s):
            measure_first(s)
            s['standing'] = 'blind'
        self.assertPasses(change)

    def test_measure_first_with_a_test_is_held(self):
        def change(s):
            card = s['test_card']
            measure_first(s)
            s['test_card'] = card
        self.assertHeld(change, 'measure-first sheet carries no test_card')

    def test_run_with_no_buyer_is_held(self):
        self.assertHeld(lambda s: s['stage'].update(buyer_seen=False), 'the stage is measure-first')

    # R05
    def test_ungrounded_prose_figure_is_held(self):
        self.assertHeld(lambda s: s['test_card'].update(hypothesis='This lifts replies by 37 percent.'), '37 is not a figure')

    def test_durations_and_dates_are_not_figures(self):
        self.assertPasses(lambda s: s['test_card'].update(stop_rule='Stop after 3 days if nothing moves by 2026-11-27.'))

    def test_figure_without_source_is_held(self):
        self.assertHeld(lambda s: s['figures'][0].update(source=None), 'no source, so it is held')

    def test_fresh_reading_without_date_is_held(self):
        self.assertHeld(lambda s: s['readings'][1].update(as_of=None), 'no date is ungrounded')

    # R06
    def test_private_money_written_out_is_held(self):
        def change(s):
            s['repo'] = 'krishanraja/mindmake'
            s['readings'][3].update(value=4000, source='a record', as_of='2026-11-23', sight='fresh', blind_reason=None)
            s['standing'] = 'behind'
        self.assertHeld(change, 'keeps its money private')

    def test_private_word_with_share_passes(self):
        def change(s):
            s['repo'] = 'krishanraja/mindmake'
            s['readings'][3].update(value='private', share=0.2, source='a record', as_of='2026-11-23', sight='fresh', blind_reason=None)
            s['standing'] = 'behind'
        self.assertPasses(change)

    # R08, R09, R10
    def test_missing_assumption_block_is_held(self):
        self.assertHeld(lambda s: s['reach'].pop('assumptions'), 'no assumption block')

    def test_missing_trust_band_is_held(self):
        self.assertHeld(lambda s: s['reach']['assumptions'].pop('trust_band'), 'trust_band')

    def test_wrong_arithmetic_is_held(self):
        self.assertHeld(lambda s: s['reach'].update(expected=20), 'reach.expected')

    def test_wrong_verdict_is_held(self):
        self.assertHeld(lambda s: s['reach'].update(verdict='reachable'), 'the arithmetic says gap')

    def test_cannot_be_true_needs_recalibration(self):
        def change(s):
            s['reach'].update(target=100, verdict='cannot-be-true')
        self.assertHeld(change, 'recalibration proposal')

    def test_cannot_be_true_with_recalibration_passes(self):
        def change(s):
            s['reach'].update(target=100, verdict='cannot-be-true')
            s['recalibration'] = {'proposed_to': 'Krish', 'reason': 'Even the stretch misses this week\'s rung.'}
            s['figures'].append({'label': 'rung', 'value': 100, 'unit': 'count', 'source': 'NOW.md', 'as_of': '2026-11-24'})
        self.assertPasses(change)

    # R11
    def test_missing_kill_rule_is_held(self):
        self.assertHeld(lambda s: s['test_card'].update(kill_rule=''), 'kill_rule is missing')

    def test_missing_stop_rule_is_held(self):
        self.assertHeld(lambda s: s['test_card'].pop('stop_rule'), 'stop_rule is missing')

    def test_two_variables_are_held(self):
        self.assertHeld(lambda s: s['test_card'].update(variable='the subject line and the send time'), 'one variable')

    def test_review_date_too_far_is_held(self):
        self.assertHeld(lambda s: s['test_card'].update(review_date='2027-01-30'), 'not 1 to 14')

    def test_prediction_out_of_order_is_held(self):
        self.assertHeld(lambda s: s['test_card']['prediction'].update(floor=90), 'floor <= expected <= stretch')

    def test_behind_without_a_test_is_held(self):
        def change(s):
            s['readings'][3].update(value=5, unit='count', source='a record', as_of='2026-11-23', sight='fresh', blind_reason=None)
            s['standing'] = 'behind'
            s['test_card'] = None
        self.assertHeld(change, 'one test card')

    # R12
    def test_offer_test_needs_terms_pass(self):
        def change(s):
            s['test_card']['touches_offer'] = True
            s['offer_terms']['result'] = 'unavailable'
            s['dissent'] = {'seat': 'Offer', 'words': 'A discount here teaches buyers to wait.'}
        self.assertHeld(change, 'not pass')

    def test_offer_test_needs_dissent(self):
        def change(s):
            s['test_card']['touches_offer'] = True
            s['offer_terms']['result'] = 'pass'
        self.assertHeld(change, "the day's dissent")

    def test_offer_test_with_terms_and_dissent_passes(self):
        def change(s):
            s['test_card']['touches_offer'] = True
            s['offer_terms']['result'] = 'pass'
            s['dissent'] = {'seat': 'Offer', 'words': 'A discount here teaches buyers to wait.'}
        self.assertPasses(change)

    # R13
    def test_second_ask_in_a_week_is_held(self):
        self.assertHeld(lambda s: s['ask'].update(venture_asks_this_week=1), 'its one ask this week')

    def test_fourth_fleet_ask_is_held(self):
        self.assertHeld(lambda s: s['ask'].update(fleet_asks_this_week=3), 'three asks this week')

    def test_open_ask_blocks_a_new_one(self):
        self.assertHeld(lambda s: s['ask'].update(open_ask=True), 'still open')

    def test_held_engine_raises_no_ask(self):
        self.assertHeld(lambda s: s['adapter'].update(held=True), 'raises no ask')

    def test_ask_behind_another_wall_is_held(self):
        self.assertHeld(lambda s: s['ask'].update(wall='send'), 'stage plan behind strategy')

    # R14
    def test_score_key_is_held(self):
        self.assertHeld(lambda s: s['constraint'].update(score=0.8), 'no scores')

    def test_score_in_words_is_held(self):
        self.assertHeld(lambda s: s['constraint'].update(reason='Scored 12 on the queue.'), 'no scores in words')

    # R15
    def test_outcome_bias_recomputed(self):
        def change(s):
            s['outcome'] = {'actual': 60, 'source': 'the engine record', 'as_of': '2026-12-01', 'bias': -20, 'landed': 'between'}
        self.assertPasses(change)

    def test_outcome_wrong_bias_is_held(self):
        def change(s):
            s['outcome'] = {'actual': 60, 'source': 'the engine record', 'as_of': '2026-12-01', 'bias': 5, 'landed': 'between'}
        self.assertHeld(change, 'actual minus expected')

    def test_outcome_before_review_is_held(self):
        def change(s):
            s['outcome'] = {'actual': 60, 'source': 'the engine record', 'as_of': '2026-11-26', 'bias': -20, 'landed': 'between'}
        self.assertHeld(change, 'before its review date')

    def test_voice_in_prose(self):
        self.assertHeld(lambda s: s['ask'].update(why='Send them now!'), 'exclamation')


class ExitTests(unittest.TestCase):
    def run_cli(self, text):
        with tempfile.TemporaryDirectory() as d:
            path = pathlib.Path(d) / 'sheet.json'
            path.write_text(text, encoding='utf-8')
            return subprocess.run([sys.executable, '-B', str(SCRIPTS / 'validate_sheet.py'), str(path)],
                                  capture_output=True, text=True).returncode

    def test_exit_zero_on_pass(self):
        self.assertEqual(self.run_cli(json.dumps(SAMPLE)), 0)

    def test_exit_one_on_held(self):
        sheet = copy.deepcopy(SAMPLE)
        sheet['standing'] = 'clear'
        self.assertEqual(self.run_cli(json.dumps(resealed(sheet))), 1)

    def test_exit_two_when_unreadable(self):
        self.assertEqual(self.run_cli('{not json'), 2)

    def test_exit_two_when_not_a_sheet(self):
        self.assertEqual(self.run_cli(json.dumps({'schema': 'insight-sheet/1'})), 2)


if __name__ == '__main__':
    unittest.main()
