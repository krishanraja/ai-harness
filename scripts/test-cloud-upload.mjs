#!/usr/bin/env node
/**
 * Regression suite for the supervised cloud upload.
 *
 * It cannot test claude.ai. Nothing here can: that page needs a signed-in
 * session on Krish's own machine, and this suite deliberately has no
 * credential and no way to get one. What it does test is everything that would
 * otherwise fail silently in front of a live catalogue.
 *
 *   - the catalogue reader against a real browser and a synthetic page
 *   - the refusal path, so a missing selector stops rather than guesses
 *   - the gate that stops an upload running on a selector map nobody checked
 *   - the canary report shape, held to the same four outcomes as every surface
 *
 * It needs a Chrome with a debugging port. Without one it says so and skips the
 * browser cases rather than passing them, because a skipped test that reports
 * success is the exact failure this whole harness keeps finding.
 *
 *   node scripts/test-cloud-upload.mjs [--port 9222]
 */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { listTargets, Page } from './lib/cdp.mjs'
import {
  SURFACES, readCatalogue, unmeasurable, uploadAllowed, canaryReport, checkPath,
} from './cloud-upload.mjs'

const args = process.argv.slice(2)
const port = Number((args.indexOf('--port') !== -1 && args[args.indexOf('--port') + 1]) || 9222)

let failures = 0
let skipped = 0
const results = []
const t = async (name, fn) => {
  try { await fn(); results.push(`ok    ${name}`) }
  catch (e) { failures++; results.push(`FAIL  ${name}\n      ${e.message}`) }
}
const assert = (c, m) => { if (!c) throw new Error(m) }

const cleanup = []
const tree = () => { const r = mkdtempSync(join(tmpdir(), 'cloud-upload-')); cleanup.push(r); return r }

function withCheck(surface, record) {
  const root = tree()
  mkdirSync(join(root, 'state/cloud-checks'), { recursive: true })
  if (record) writeFileSync(join(root, checkPath(surface)), JSON.stringify(record))
  return root
}

// ------------------------------------------------------------- the upload gate
await t('an upload is refused when no check has ever passed', () => {
  const g = uploadAllowed('claude-cloud', { root: withCheck('claude-cloud', null) })
  assert(!g.allowed, 'an unverified selector map must not be allowed to click anything')
  assert(/no check has ever passed/.test(g.why), g.why)
})

await t('an upload is refused when the last check did not pass', () => {
  const root = withCheck('claude-cloud', { surface: 'claude-cloud', status: 'unmeasurable', checked_at: new Date().toISOString() })
  const g = uploadAllowed('claude-cloud', { root })
  assert(!g.allowed, 'a failed check is not a licence to upload')
})

await t('an upload is refused when the last passing check is stale', () => {
  const old = new Date(Date.now() - 40 * 86400000).toISOString()
  const root = withCheck('claude-cloud', { surface: 'claude-cloud', status: 'ok', checked_at: old })
  const g = uploadAllowed('claude-cloud', { root })
  assert(!g.allowed, 'these pages change without notice, so a stale check must not authorise an upload')
  assert(/past the 14 day limit/.test(g.why), g.why)
})

await t('an upload is allowed after a recent passing check', () => {
  const root = withCheck('claude-cloud', { surface: 'claude-cloud', status: 'ok', checked_at: new Date().toISOString() })
  assert(uploadAllowed('claude-cloud', { root }).allowed, 'a fresh passing check is the whole point of the gate')
})

// ------------------------------------------------------------- the refusal shape
await t('a refusal names the page and the selector, and no image', () => {
  const r = unmeasurable('claude-cloud', 'https://example.invalid/skills', 'catalogue_item')
  assert(r.status === 'unmeasurable', 'a refusal is never a pass')
  assert(r.url && r.selector, 'a refusal that does not say what it could not find is not actionable')
  assert(!/screenshot|image|png/i.test(JSON.stringify(r).replace(/No screenshot was taken[^"]*/, '')),
    'no image path may appear in a refusal: a capture of a signed-in page carries the session')
})

// -------------------------------------------------------------- the canary shape
await t('a canary report holds to the same four outcomes', () => {
  const good = canaryReport({
    release: 'v2026.09.08.2', surface: 'claude-cloud',
    results: [{ id: 'brief-trigger-006', outcome: 'fired', note: 'loaded in a fresh chat' }],
  })
  assert(good.schema_version === 1 && good.surface === 'claude-cloud', 'the report must match the shape every other surface writes')
  let threw = false
  try {
    canaryReport({ release: 'x', surface: 'claude-cloud', results: [{ id: 'a', outcome: 'probably-fired' }] })
  } catch { threw = true }
  assert(threw, 'a fifth outcome must be refused; collapsing not-fired and unreachable is how a launcher that could not launch passed three canaries')
})

await t('every surface declares its selectors and starts unverified', () => {
  for (const [id, cfg] of Object.entries(SURFACES)) {
    for (const k of ['signed_in', 'catalogue_item', 'catalogue_item_name', 'upload_input']) {
      assert(cfg.selectors[k], `${id} has no ${k} selector`)
    }
    assert(cfg.verified === null, `${id} claims to be verified in the source. Verification is a run against the live page, not a value someone typed.`)
  }
})

// ------------------------------------------------------- against a real browser
let target = null
try { target = (await listTargets(port)).find((x) => x.type === 'page') } catch { /* no browser */ }

if (!target) {
  skipped += 2
  results.push(`skip  the catalogue reader (no Chrome on port ${port})`)
  results.push(`skip  the refusal path against a live page (no Chrome on port ${port})`)
} else {
  const cfg = {
    catalogue_url: 'data:text/html,' + encodeURIComponent(`
      <nav><a href="/settings">settings</a></nav>
      <div data-testid="skill-row"><span data-testid="skill-name">krish-principles</span></div>
      <div data-testid="skill-row"><span data-testid="skill-name">strategy-brief</span></div>
      <div data-testid="skill-row"><span data-testid="skill-name">verification-loop</span></div>`),
    selectors: { ...SURFACES['claude-cloud'].selectors },
  }

  await t('the catalogue reader parses a real page in a real browser', async () => {
    const page = await Page.open(target.webSocketDebuggerUrl)
    try {
      const r = await readCatalogue(page, cfg)
      assert(r.status === 'ok', `expected ok, got ${r.status}: ${r.detail || ''}`)
      assert(r.count === 3, `expected 3 entries, got ${r.count}`)
      assert(r.names.includes('krish-principles'), `names were ${JSON.stringify(r.names)}`)
    } finally { page.close() }
  })

  await t('a page with no catalogue refuses instead of reporting zero', async () => {
    const page = await Page.open(target.webSocketDebuggerUrl)
    try {
      const bare = { ...cfg, catalogue_url: 'data:text/html,' + encodeURIComponent('<nav><a href="/settings">settings</a></nav><p>nothing here</p>') }
      const r = await readCatalogue(page, { ...bare, selectors: { ...cfg.selectors } })
      assert(r.status === 'unmeasurable', `an empty catalogue and a changed page look identical, so this must refuse. Got ${r.status}`)
      assert(r.selector === 'catalogue_item', `it must name what it could not find, got ${r.selector}`)
    } finally { page.close() }
  })

  await t('a page with no signed-in session refuses before reading anything', async () => {
    const page = await Page.open(target.webSocketDebuggerUrl)
    try {
      const out = { ...cfg, catalogue_url: 'data:text/html,' + encodeURIComponent('<p>signed out</p>') }
      const r = await readCatalogue(page, { ...out, selectors: { ...cfg.selectors } })
      assert(r.status === 'unmeasurable' && r.selector === 'signed_in', `expected a signed_in refusal, got ${r.status}/${r.selector}`)
    } finally { page.close() }
  })
}

for (const d of cleanup) { try { rmSync(d, { recursive: true, force: true }) } catch {} }
for (const line of results) (line.startsWith('FAIL') ? console.error : console.log)(line)
if (failures) { console.error(`\n${failures} failing case(s).`); process.exit(1) }
console.log(`\nCLOUD UPLOAD OK${skipped ? ` (${skipped} skipped, no browser on port ${port})` : ''}`)
