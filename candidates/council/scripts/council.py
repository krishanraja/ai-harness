#!/usr/bin/env python3
"""The council's shared data: where its words live, how they are read and drawn.

The five seats and the eight idea tests are one wording in two places. Their
home is control-center (`src/lib/councilSeats.ts`, `COUNCIL_SEATS`, and
`api/_councilRead.ts`, `IDEA_TESTS`); `references/seats.json` and
`references/idea-tests.json` hold the same text, and the two Markdown files are
drawn from those JSON files. `validate.py` holds all of it together.

  python scripts/council.py render              redraw the two Markdown files from the JSON
  python scripts/council.py dissenter [DATE]    the seat that dissents on DATE (YYYY-MM-DD, UTC today by default)

`render` is a maintenance step for whoever updates the copy. A council read
never runs it: the council judges and never writes.
"""
import datetime
import hashlib
import json
import pathlib
import re
import sys

SCRIPTS = pathlib.Path(__file__).resolve().parent
SKILL = SCRIPTS.parent
REFS = SKILL / 'references'
REPO = SKILL.parent.parent
SEATS_JSON = REFS / 'seats.json'
SEATS_MD = REFS / 'seats.md'
TESTS_JSON = REFS / 'idea-tests.json'
TESTS_MD = REFS / 'idea-tests.md'

HOME_REPOSITORY = 'krishanraja/control-center'
SEATS_HOME = ('src/lib/councilSeats.ts', 'COUNCIL_SEATS')
TESTS_HOME = ('api/_councilRead.ts', 'IDEA_TESTS')

SEAT_FIELDS = ('key', 'name', 'brief', 'agrees', 'clashes', 'asks', 'default_action')
SEAT_LISTS = ('agrees', 'clashes', 'asks')
SEAT_NAMES = ('Offer', 'Attention', 'Experience', 'Scale', 'Distribution')
SEAT_KEYS = ('offer', 'attention', 'experience', 'scale', 'distribution')
TEST_FIELDS = ('id', 'label', 'brief')
TEST_IDS = ('pain_frequency', 'money_moves', 'hard_to_copy', 'better_models',
            'agent_fit', 'heard_it', 'by_hand', 'why_now')

EM_DASH = '\u2014'

# Names and credit phrases Krish ruled out of the OS on 2026-11-15, kept only
# as SHA-256 digests of the phrase lowercased with everything but letters and
# digits removed, so this gate names nothing it guards against. A file fails
# when any run of one to WINDOW consecutive words, joined the same way, has a
# digest in this set.
WINDOW = 5
DENIED_DIGESTS = frozenset({
    '9b6e83594613cf9d47fd5bc3445ca5290f778ccb8ea7c6f0f38ff6bf8b026e41',
    '48da3f3b2315292f1f7d1e9efd6afa189c65027c1bb8a8dd301e88af17dfa6d5',
    '12217cbbcf47937981047f88ee5d49a033e9a5ac7d7b2fa7db37d03c937d21c1',
    'b79cecf51da5a2f2dedb509a2648c660663bbd0b86112e40681b22a3182ca701',
    '9391c346ab00531d2471dba8b74a43be5d5c9cc099ef0a070cc7f295733302a8',
    '254b6b11ed72c966b776f2ea142b157152cafa9837948619fb6f638f97bc2ffa',
    'c546b02ff7bd600aaaa4593114afc33b0a5b438924a8a49be6354ff61c9cef25',
    'bbbf7a6412d6d3e8244ac1fda5e35a20037acee661288cb95b7b18cf469980aa',
    '75e18b82feb151243ec83d744d3c75ea1db40a8e527df20d49a96daec7cbe460',
    '92031939e472080381e4cf855eaf1356590ac80ccd1dee6eff4dcf8d6f95abad',
    'f275bd78de35dc72080498f3138cf8503f06734ad8ad61f51105150ccf544943',
    '705f6783ae7662cc73010d2e5089cc8bafa19209195631d8c335be5cc7541e64',
    '1395c6b72ec82140d56b22074c96b66efe8602ddee7890658c23c03fa155bcb2',
    '21dfc18dd04cd6a356e2f1e36e8285bc060a5d589d3ac707e56ac9654903b589',
    'c3ed699683e7e7043cebc5f665f1c4ff6a87df4ee1e21ec52e94c68bf4f6789b',
    '933fd3153f8efe53f4982ca23f4a660336b2a8f8127b0203a84991730e37750a',
    '2d6c1f3fa3c69d96c4b1ce5dbccaf4456ad87bf9462fa774763d1a6fc8fd6304',
    '6dcbac4eaa4198c57e121bf2eca0224a3ecae781430075262a098d5b4bf0e1ef',
    '18379790e161d3e51b837cbaa1d96bf8686eca64d40b9270809a976dec2f93b6',
    'c97708b4e7f8ee1daa26c486ba8d001d8942949309ebc96b1ceb1d75e93ad323',
    '326f5b47c73922d70eb358f519468e1f70a3c0ebfd41e469b5291ac59d9bbb99',
    'a09f4aa06a1e87e1b0e1e04eaad896152f052eee60b60ad95531c8c032df1eec',
    '4862f447f2c7f272fa2f4aaf89dadb3b1ac09105bd5864f8d1a0c9452bb0a226',
    '96d815328a42cb4ef89d5e0b7a1df6be43b484832c83a7b4596d8402c7c0b12b',
    'c1ca06d960d41cd51115898cbefd244c6962562876c2ef09cd8ab6131814cf8c',
    '77c7c1e28410482d448a752d4db26087fe39fae864814bd45ef4b3f946f5acd9',
    '1ad5295183fbcf12851e51bc33ec7bbf229119f38727a4fc09c4d21b9356d643',
    'a44fe9e581135fcf3de452d5526cbf788d93a606329de04ebe2427adcdb32a18',
    'f76e7ae59560f98c234d2326e0c6906374e314a1a993d347543fd6ad03ab5e8c',
})


# ---------------------------------------------------------------- reading


def load(path):
    return json.loads(path.read_text(encoding='utf-8'))


def canonical(obj):
    return json.dumps(obj, indent=2, ensure_ascii=False) + '\n'


def words(text):
    return re.findall(r'[0-9a-z]+', text.lower())


def digest(phrase):
    joined = re.sub(r'[^0-9a-z]+', '', phrase.lower())
    return hashlib.sha256(joined.encode('utf-8')).hexdigest()


def denied_runs(text, denied=None):
    """Every run of one to WINDOW words in text whose digest is denied."""
    denied = DENIED_DIGESTS if denied is None else denied
    tokens = words(text)
    found = []
    for start in range(len(tokens)):
        for size in range(1, WINDOW + 1):
            run = tokens[start:start + size]
            if len(run) < size:
                break
            if hashlib.sha256(''.join(run).encode('utf-8')).hexdigest() in denied:
                found.append(' '.join(run))
    return found


def grams(text, n=8):
    tokens = words(text)
    return {tuple(tokens[start:start + n]) for start in range(len(tokens) - n + 1)}


def dissenter(day):
    """Control Center's rule: whole days since 1970-01-01 (UTC), modulo five."""
    return SEAT_NAMES[(day - datetime.date(1970, 1, 1)).days % len(SEAT_NAMES)]


# ---------------------------------------------------------------- drawing


def render_seats(doc):
    out = [
        '# The five seats',
        '',
        'Drawn by `python scripts/council.py render` from `seats.json`. The text is the same text '
        f'control-center gives its own council (`{SEATS_HOME[0]}`, `{SEATS_HOME[1]}`), and '
        '`scripts/validate.py` holds the two together. Never reword a seat here: a change starts in '
        'control-center and is copied back.',
        '',
        'Each seat is a lane of judgment, never a person. Its brief says how the lane thinks, what it '
        'checks and what it refuses. Agrees and clashes say where it tends to sit against the other '
        'seats. Asks are the questions it puts to Krish, and the default action is what it pushes for '
        'when nothing else is clear.',
    ]
    for number, seat in enumerate(doc['seats'], 1):
        out += ['', f'## {number}. {seat["name"]} (`{seat["key"]}`)', '', '**Brief**', '']
        out += [f'- {line}' for line in seat['brief'].split('\n')]
        for title, field in (('Agrees', 'agrees'), ('Clashes', 'clashes'), ('Asks', 'asks')):
            out += ['', f'**{title}**', '']
            out += [f'- {item}' for item in seat[field]]
        out += ['', '**Default action**', '', seat['default_action']]
    return '\n'.join(out) + '\n'


def render_tests(doc):
    out = [
        '# The eight idea tests',
        '',
        'Drawn by `python scripts/council.py render` from `idea-tests.json`. The text is the same text '
        f'control-center scores an idea with (`{TESTS_HOME[0]}`, `{TESTS_HOME[1]}`), and '
        '`scripts/validate.py` holds the two together. Never reword a test here: a change starts in '
        'control-center and is copied back.',
        '',
        'Score every test before any seat speaks. A result is pass, mixed, fail, unknown or n/a, and '
        'each carries its evidence and the kind of evidence it is (`references/protocol.md`).',
    ]
    for number, test in enumerate(doc['tests'], 1):
        out += ['', f'## {number}. {test["label"]} (`{test["id"]}`)', '', test['brief']]
    return '\n'.join(out) + '\n'


# ---------------------------------------------------------------- the home's source


class SourceError(ValueError):
    pass


class _Reader:
    """Reads the small piece of TypeScript the home's two exports are written in:
    arrays, objects with plain keys, quoted strings and an array's .join(string)."""

    def __init__(self, text, pos):
        self.text, self.pos = text, pos

    def fail(self, what):
        line = self.text.count('\n', 0, self.pos) + 1
        raise SourceError(f'{what} at line {line}')

    def skip(self):
        text = self.text
        while self.pos < len(text):
            if text[self.pos].isspace():
                self.pos += 1
            elif text.startswith('//', self.pos):
                end = text.find('\n', self.pos)
                self.pos = len(text) if end < 0 else end + 1
            elif text.startswith('/*', self.pos):
                end = text.find('*/', self.pos + 2)
                if end < 0:
                    self.fail('unclosed comment')
                self.pos = end + 2
            else:
                break

    def peek(self):
        self.skip()
        return self.text[self.pos] if self.pos < len(self.text) else ''

    def expect(self, char):
        if self.peek() != char:
            self.fail(f'expected {char!r}')
        self.pos += 1

    def value(self):
        char = self.peek()
        if char == '[':
            result = self.array()
        elif char == '{':
            result = self.obj()
        elif char in '\'"':
            result = self.string()
        else:
            self.fail('unsupported value')
        while True:
            self.skip()
            if not self.text.startswith('.join', self.pos):
                break
            if not isinstance(result, list) or not all(isinstance(x, str) for x in result):
                self.fail('.join on something that is not a list of strings')
            self.pos += len('.join')
            self.expect('(')
            separator = self.string()
            self.expect(')')
            result = separator.join(result)
        return result

    def array(self):
        self.expect('[')
        items = []
        while self.peek() != ']':
            items.append(self.value())
            if self.peek() == ',':
                self.pos += 1
            elif self.peek() != ']':
                self.fail('expected , or ]')
        self.pos += 1
        return items

    def obj(self):
        self.expect('{')
        result = {}
        while self.peek() != '}':
            if self.peek() in '\'"':
                key = self.string()
            else:
                match = re.compile(r'[A-Za-z_$][\w$]*').match(self.text, self.pos)
                if not match:
                    self.fail('expected a key')
                key, self.pos = match.group(0), match.end()
            self.expect(':')
            result[key] = self.value()
            if self.peek() == ',':
                self.pos += 1
            elif self.peek() != '}':
                self.fail('expected , or }')
        self.pos += 1
        return result

    def string(self):
        quote = self.peek()
        if quote not in '\'"':
            self.fail('expected a string')
        self.pos += 1
        out, text = [], self.text
        simple = {'n': '\n', 't': '\t', 'r': '\r', 'b': '\b', 'f': '\f', 'v': '\v', '0': '\0'}
        while True:
            if self.pos >= len(text) or text[self.pos] == '\n':
                self.fail('unterminated string')
            char = text[self.pos]
            if char == quote:
                self.pos += 1
                return ''.join(out)
            if char != '\\':
                out.append(char)
                self.pos += 1
                continue
            nxt = text[self.pos + 1:self.pos + 2]
            if nxt in simple:
                out.append(simple[nxt])
                self.pos += 2
            elif nxt == 'u' and text[self.pos + 2:self.pos + 3] == '{':
                end = text.find('}', self.pos)
                out.append(chr(int(text[self.pos + 3:end], 16)))
                self.pos = end + 1
            elif nxt == 'u':
                out.append(chr(int(text[self.pos + 2:self.pos + 6], 16)))
                self.pos += 6
            elif nxt == 'x':
                out.append(chr(int(text[self.pos + 2:self.pos + 4], 16)))
                self.pos += 4
            elif nxt == '\n':
                self.pos += 2
            else:
                out.append(nxt)
                self.pos += 2


def read_export(source, name):
    """The value of `export const <name> ... = <value>` in a TypeScript file."""
    match = re.search(r'export\s+const\s+' + re.escape(name) + r'\b[^=]*=', source)
    if not match:
        raise SourceError(f'no export named {name}')
    return _Reader(source, match.end()).value()


# ---------------------------------------------------------------- command line


def main(argv=None):
    args = list(sys.argv[1:] if argv is None else argv)
    if args[:1] == ['render']:
        SEATS_MD.write_text(render_seats(load(SEATS_JSON)), encoding='utf-8', newline='\n')
        TESTS_MD.write_text(render_tests(load(TESTS_JSON)), encoding='utf-8', newline='\n')
        print(f'drew {SEATS_MD.name} and {TESTS_MD.name}')
        return 0
    if args[:1] == ['dissenter'] and len(args) <= 2:
        try:
            day = datetime.date.fromisoformat(args[1]) if len(args) == 2 else datetime.datetime.now(datetime.timezone.utc).date()
        except ValueError:
            print('dissenter takes a date as YYYY-MM-DD', file=sys.stderr)
            return 2
        print(dissenter(day))
        return 0
    print(__doc__.strip(), file=sys.stderr)
    return 2


if __name__ == '__main__':
    sys.exit(main())
