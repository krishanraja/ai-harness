#!/usr/bin/env node
/**
 * The registry checker and the neighbours table must be able to fail: each case
 * breaks a fixture registry the way a careless edit would and asserts it is caught.
 *
 *   node scripts/test-render-capabilities.mjs
 */
import assert from 'node:assert/strict'
import { registryProblems, renderCapabilities, renderVentures } from './render-capabilities.mjs'

const row = (over = {}) => ({ name: 'demo', scope: 'in', layer: 'specialist', capability: 'Does a thing.', call: 'An issue.', when: 'You need the thing.', ...over })
const fleet = (registry, repos = [{ name: 'demo' }]) => ({ registry, repos })
let n = 0
const ok = (name, fn) => { fn(); n++; console.log(`ok    ${name}`) }

ok('a clean registry passes', () => assert.deepEqual(registryProblems(fleet([row()])), { errors: [], warnings: [] }))
ok('no registry fails', () => assert.match(registryProblems({ repos: [] }).errors[0], /no registry/))
ok('a canon surface with no row fails', () => assert.match(registryProblems(fleet([row({ name: 'other' })])).errors.join(), /demo is a canon surface with no registry row/))
ok('a surface found by alias passes', () => assert.deepEqual(registryProblems(fleet([row({ name: 'real', aliases: ['demo'] })])).errors, []))
ok('a duplicate name fails', () => assert.match(registryProblems(fleet([row(), row()])).errors.join(), /twice/))
ok('an unknown scope fails', () => assert.match(registryProblems(fleet([row({ scope: 'maybe' })])).errors.join(), /scope "maybe"/))
ok('an in-scope row without a layer fails', () => assert.match(registryProblems(fleet([row({ layer: undefined })])).errors.join(), /needs a layer/))
for (const f of ['capability', 'call', 'when']) ok(`an in-scope row without ${f} fails`, () => assert.match(registryProblems(fleet([row({ [f]: '' })])).errors.join(), new RegExp(`needs ${f}`)))
ok('an excluded or dormant surface warns, never passes silently', () => {
  assert.match(registryProblems(fleet([row({ name: 'old', scope: 'excluded', aliases: ['demo'] })])).warnings[0], /resolves to old, which Krish excluded/)
  assert.match(registryProblems(fleet([row({ scope: 'dormant' })])).warnings[0], /dormant/)
})
ok('a retired surface (canon_sync false) for an excluded or dormant repository is quiet; a live one still warns', () => {
  assert.deepEqual(registryProblems(fleet([row({ scope: 'excluded' })], [{ name: 'demo', canon_sync: false }])), { errors: [], warnings: [] })
  assert.deepEqual(registryProblems(fleet([row({ scope: 'dormant' })], [{ name: 'demo', canon_sync: false }])).warnings, [])
  assert.equal(registryProblems(fleet([row({ scope: 'excluded' })], [{ name: 'demo' }])).warnings.length, 1)
})
ok('the venture map carries every name and alias with a venture, lowercased and sorted, and nothing else', () => {
  const v = JSON.parse(renderVentures([row({ name: 'Zed', venture: 'z', aliases: ['Old-Zed'] }), row({ name: 'alpha', venture: 'a' }), row({ name: 'hub' })])).ventures
  assert.deepEqual(Object.keys(v), ['alpha', 'old-zed', 'zed'])
  assert.deepEqual([v.zed, v['old-zed'], v.alpha], ['z', 'z', 'a'])
  assert.equal('hub' in v, false)
})
ok('the table lists in-scope rows by layer and names the rest as outside', () => {
  const t = renderCapabilities([row(), row({ name: 'hub-x', layer: 'hub' }), row({ name: 'mine', scope: 'personal' }), row({ name: 'p|ipe', capability: 'a | b' })])
  assert.ok(t.indexOf('## The hub') < t.indexOf('## Specialists'))
  assert.match(t, /\| demo \| Does a thing\. \| An issue\. \| You need the thing\. \|/)
  assert.match(t, /\| p\/ipe \| a \/ b \|/)
  assert.match(t, /Outside the OS[\s\S]*mine/)
  assert.doesNotMatch(t.split('## Outside the OS')[0], /\| mine \|/)
})
console.log(`\n${n} registry checks passed`)
