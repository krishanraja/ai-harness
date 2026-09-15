import assert from 'node:assert/strict'
import test from 'node:test'
import { build, resume } from '../pipeline/build.mjs'
import { capture } from '../pipeline/capture.mjs'
import { verify } from '../pipeline/verify.mjs'

test('all three stages consume the scope guard', () => {
  assert.throws(() => capture(undefined), /scope guard/u)
  assert.throws(() => build(undefined), /scope guard/u)
  assert.throws(() => verify(undefined), /scope guard/u)
})

test('the declared artifact chain reaches the consumed verified output', () => {
  const source = { request: 'bounded fixture' }
  const captured = capture(source)
  const built = build(captured)
  assert.deepEqual(verify(built), { verified: { built: { captured: source } } })
})

test('recovery uses the same build contract and absence does not become a verdict', () => {
  assert.deepEqual(resume({ captured: 'checkpoint' }), { built: { captured: 'checkpoint' } })
  assert.throws(() => resume(undefined), /scope guard/u)
})
