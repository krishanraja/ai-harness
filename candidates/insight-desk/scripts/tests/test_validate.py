"""Offline tests for the insight sheet validator. Standard library only."""
import copy
import json
import pathlib
import sys
import unittest

sys.dont_write_bytecode = True
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import validate_sheet as S  # noqa: E402

SAMPLE = json.loads((HERE / 'fixtures' / 'sample-sheet.json').read_text(encoding='utf-8'))


def resealed(sheet):
    sheet['sheet_sha256'] = S.sheet_sha(sheet)
    return sheet


def errors_after(change):
    sheet = copy.deepcopy(SAMPLE)
    change(sheet)
    return S.validate(resealed(sheet))


class SheetTests(unittest.TestCase):
    def assertFails(self, change, fragment):
        errors = errors_after(change)
        self.assertTrue(any(fragment in e for e in errors), f'expected {fragment!r} in {errors}')

    def test_sample_is_valid(self):
        self.assertEqual(S.validate(SAMPLE), [])

    def test_hash_must_match(self):
        sheet = copy.deepcopy(SAMPLE)
        sheet['venture'] = 'another-venture'
        self.assertTrue(any('sheet_sha256' in e for e in S.validate(sheet)))

    def test_stall_not_the_idea_stops(self):
        self.assertFails(lambda s: s['stall_check'].update(diagnosis='distribution'), 'desk stops')

    def test_unmeasured_u4_takes_measurement_ideas_only(self):
        def change(s):
            s['north_star'].update(urgency=4, current=None)
        self.assertFails(change, 'measurement idea')

    def test_missing_conversion_path_is_held(self):
        self.assertFails(lambda s: s['ideas'][0]['conversion_path'].update(link=''), 'held off the sheet')

    def test_numeric_score_refused(self):
        self.assertFails(lambda s: s['ideas'][0]['tests']['share'].update(score=8), 'unexpected fields')
        self.assertFails(lambda s: s['ideas'][0].update(score=9), 'no scores')

    def test_lead_needs_every_test_passed(self):
        self.assertFails(lambda s: s['ideas'][0]['tests']['floor'].update(result='unavailable'), 'every test passed')

    def test_lead_without_analogue_cannot_lead(self):
        def change(s):
            s['lead'] = 'name-the-rush'
            for p in s['blind_passes']:
                p['lead'] = 'name-the-rush'
        self.assertFails(change, 'analogue is unavailable')

    def test_blind_passes_must_agree(self):
        self.assertFails(lambda s: s['blind_passes'][1].update(lead='name-the-rush'), 'same lead')

    def test_blind_orders_must_differ(self):
        self.assertFails(lambda s: s['blind_passes'][1].update(order=list(s['blind_passes'][0]['order'])), 'shuffled')

    def test_disagreement_means_no_lead(self):
        def change(s):
            s['blind_passes'][1]['lead'] = 'name-the-rush'
            s['lead'] = None
        self.assertEqual(errors_after(change), [])

    def test_unavailable_engine_is_never_pass(self):
        self.assertFails(lambda s: s['consults'][0].update(result='passed'), 'never pass')

    def test_insight_needs_source_or_assumption(self):
        self.assertFails(lambda s: s['insights'][0].pop('read_at'), 'needs a source')

    def test_unknown_method_refused(self):
        self.assertFails(lambda s: s['ideas'][0].update(method='brainstorm'), 'not in references')

    def test_obvious_idea_restated_refused(self):
        self.assertFails(lambda s: s['ideas'][0].update(claim='A discount code for early orders'), 'discarded obvious')

    def test_three_obvious_ideas_required(self):
        self.assertFails(lambda s: s['discarded_obvious'].pop(), 'exactly three')

    def test_score_in_words_refused(self):
        def change(s):
            s['ideas'][0]['tests']['share']['reason'] = 'Scored 9/10 by the panel, ranked first of 10.'
        self.assertFails(change, 'reads as a score')
        for words in ('rated 8 by the reader', 'it earns 40 points', 'ranked first on the board', '7 out of 10'):
            self.assertFails(lambda s, w=words: s['ideas'][0].update(mechanic=w), 'reads as a score')

    def test_reader_named_as_writer_refused(self):
        for name in ('the same session that wrote them', 'same', 'the author', 'myself'):
            self.assertFails(lambda s, n=name: s['blind_passes'][0].update(reader=n), 'never the writer')

    def test_methods_used_span_three_categories(self):
        self.assertFails(lambda s: s.pop('methods_used'), 'missing methods_used')
        def one_category(s):
            s['methods_used'] = ['invert-the-default', 'change-the-hero', 'rename-the-problem']
            for idea in s['ideas']:
                idea['method'] = 'rename-the-problem'
        self.assertFails(one_category, 'three different categories')
        self.assertFails(lambda s: s['methods_used'].remove('ritual-hijack'), 'three to five')

    def test_idea_method_must_be_in_methods_used(self):
        self.assertFails(lambda s: s['ideas'][0].update(method='make-it-a-tool'), 'not in methods_used')

    def test_analogue_read_the_day_the_sheet_is_made(self):
        def change(s):
            s['ideas'][0]['tests']['analogue']['read_at'] = '2026-10-01'
        self.assertFails(change, 'read the day the sheet is made')

    def test_close_paraphrase_of_obvious_idea_refused(self):
        self.assertFails(lambda s: s['ideas'][0].update(claim='A discount code for the early orders.'), 'discarded obvious')
        self.assertFails(lambda s: s['ideas'][0].update(claim='Discount codes for early orders'), 'discarded obvious')

    def test_plain_numbers_and_dates_still_pass(self):
        def change(s):
            s['ideas'][0]['mechanic'] = 'Buyers pick their own date in 2026 and get 1 nudge on it, 10 seconds to set.'
        self.assertEqual(errors_after(change), [])


if __name__ == '__main__':
    unittest.main()
