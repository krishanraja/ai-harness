#!/usr/bin/env node
/**
 * The context budget measures what it claims to. Fixture trees only; the live
 * repository is read, never written.
 */

import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { description, measure, delta, justified, reader, loadBudget } from './context-budget.mjs'

let passed = 0
let failed = 0
const test = (name, condition) => {
  if (condition) passed += 1
  else failed += 1
  console.log(`${condition ? 'ok  ' : 'FAIL'}  ${name}`)
}

test('a quoted description is read without its quotes', description('---\nname: x\ndescription: "Use for y."\n---\n# X') === 'Use for y.')
test('a file with no front matter has no description', description('# nothing') === '')

const root = mkdtempSync(join(tmpdir(), 'context-budget-'))
mkdirSync(join(root, 'skills/a'), { recursive: true })
writeFileSync(join(root, 'skills/a/SKILL.md'), '---\nname: a\ndescription: "12345"\n---\nbody')
writeFileSync(join(root, 'always.md'), 'x'.repeat(100))
const budget = { files: ['always.md', 'missing.md'], policy: 'net-zero' }
const before = measure(budget, reader(null, root))
test('files and descriptions are both counted, a missing file reads as zero', before.total === 105 && before.files['missing.md'] === 0)
writeFileSync(join(root, 'always.md'), 'x'.repeat(90))
const after = measure(budget, reader(null, root))
const d = delta(before, after)
test('a shrinking file shows as a negative delta', d.total === -10 && d.files['always.md'] === -10)
test('growth needs a Growth justified line', !justified('feat: add\n\nbody') && justified('feat: add\n\nGrowth justified: the only write path for chat.'))
test('the live budget names the always-on adapters and skills', loadBudget().files.includes('skills/krish-principles/SKILL.md') && loadBudget().files.includes('adapters/claude/CLAUDE.md'))

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) process.exit(1)
console.log('CONTEXT BUDGET OK')
