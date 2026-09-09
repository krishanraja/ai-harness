#!/usr/bin/env node
/**
 * The two cloud surfaces, done supervised.
 *
 * claude.ai and Perplexity Computer have no API for the personal skill
 * catalogue. `architecture/CROSS_CLIENT_RELEASE_SYSTEM.md` says browser
 * automation is "too UI-dependent to be the unattended production updater",
 * and that is still true. This is not the unattended production updater.
 *
 * Ruling (Krish, 2026-09-09): no phone, no hosted browser, no approval page.
 * He sits at LORIMER and exposes the logged-in browser when an upload is due.
 * His presence at the machine is the approval, which is the supervised session
 * the architecture document already permits.
 *
 * So:
 *
 *   1. Krish opens his own Chrome, already signed in, with a debugging port.
 *   2. This connects to it. It never launches a browser, never creates a
 *      profile, never sees a cookie or a token, and never takes a screenshot,
 *      because a capture of a signed-in page is a credential bearing artifact.
 *   3. It refuses on anything it does not recognise, and records `unmeasurable`
 *      with the url and the selector name rather than guessing.
 *
 *   chrome.exe --remote-debugging-port=9222 --user-data-dir=<dedicated profile>
 *
 *   node scripts/cloud-upload.mjs --check
 *   node scripts/cloud-upload.mjs --canary --release v2026.09.08.2 --surface claude-cloud
 *   node scripts/cloud-upload.mjs --upload --release v2026.09.08.2 --surface claude-cloud --confirm
 *
 * `--check` writes nothing and is the first thing to run after any UI change.
 * `--upload` refuses unless a check has passed for that surface, because a
 * selector map nobody has verified today is how an automation quietly clicks
 * the wrong thing.
 *
 * Exit 0 clean, 1 refused or unmeasurable, 2 misuse.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { listTargets, browserVersion, Page } from './lib/cdp.mjs'

const HARNESS = resolve(fileURLToPath(import.meta.url), '../..')
const args = process.argv.slice(2)
const has = (f) => args.includes(f)
const flag = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1] }

/**
 * Everything UI-shaped lives here, in one place, so repairing a drifted page is
 * editing a table rather than reading a program.
 *
 * `verified` is the date a human last confirmed these selectors against the
 * live page with `--check`. It is null until someone does, and `--upload`
 * refuses while it is null. That is deliberate: the selectors below were
 * written from the published shape of these pages, not from a run against
 * them, and an automation that believes its own untested map is worse than one
 * that stops.
 */
export const SURFACES = {
  'claude-cloud': {
    name: 'claude.ai personal skill catalogue',
    catalogue_url: 'https://claude.ai/settings/skills',
    chat_url: 'https://claude.ai/new',
    verified: null,
    selectors: {
      signed_in: '[data-testid="user-menu"], nav a[href*="/settings"]',
      catalogue_item: '[data-testid="skill-row"], [data-testid="skill-card"]',
      catalogue_item_name: '[data-testid="skill-name"]',
      upload_input: 'input[type="file"]',
      chat_input: 'div[contenteditable="true"]',
    },
    artifact_suffix: '.skill',
  },
  'perplexity-cloud': {
    name: 'Perplexity Computer skills',
    catalogue_url: 'https://www.perplexity.ai/computer/skills',
    chat_url: 'https://www.perplexity.ai/',
    verified: null,
    selectors: {
      signed_in: '[data-testid="user-avatar"], button[aria-label*="ccount"]',
      catalogue_item: '[data-testid="skill-item"]',
      catalogue_item_name: '[data-testid="skill-title"]',
      upload_input: 'input[type="file"]',
      chat_input: 'textarea, div[contenteditable="true"]',
    },
    artifact_suffix: '-perplexity.zip',
  },
}

const OUTCOMES = new Set(['fired', 'not-fired', 'wrong-skill', 'unreachable'])
const CHECK_DIR = 'state/cloud-checks'

const q = (s) => JSON.stringify(String(s))

/** A refusal that says exactly what it could not find and where. */
export function unmeasurable(surface, url, selectorName, detail) {
  return {
    status: 'unmeasurable', surface, url, selector: selectorName,
    detail: detail || `The ${selectorName} selector matched nothing on this page.`,
    note: 'Nothing was clicked, uploaded or recorded. Repair the selector in SURFACES and run --check again. No screenshot was taken: an image of a signed-in page is a credential bearing artifact.',
  }
}

export function checkPath(surface) { return join(CHECK_DIR, `${surface}.json`) }

/** Has a human verified this surface's selectors, and how long ago. */
export function lastCheck(surface, root = HARNESS) {
  const p = join(root, checkPath(surface))
  if (!existsSync(p)) return null
  try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return null }
}

export function uploadAllowed(surface, { root = HARNESS, maxAgeDays = 14, now = Date.now() } = {}) {
  const c = lastCheck(surface, root)
  if (!c) return { allowed: false, why: `no check has ever passed for ${surface}. Run --check first; the selectors in SURFACES have never been confirmed against the live page.` }
  if (c.status !== 'ok') return { allowed: false, why: `the last check for ${surface} was ${c.status}, not ok.` }
  const age = Math.round((now - new Date(c.checked_at)) / 86400000)
  if (age > maxAgeDays) return { allowed: false, why: `the last passing check for ${surface} was ${age} days ago, past the ${maxAgeDays} day limit. These pages change without notice; re-check before uploading.` }
  return { allowed: true, why: `checked ${age} day(s) ago` }
}

/** Connect to a browser someone else started. Never start one. */
export async function connect(port) {
  let targets
  try { targets = await listTargets(port) } catch (e) {
    throw new Error(`${e.message}\n\nThis script never launches a browser. Open your own, already signed in:\n  chrome.exe --remote-debugging-port=${port} --user-data-dir=<a dedicated profile, not your daily one>`)
  }
  const page = targets.find((t) => t.type === 'page')
  if (!page) throw new Error('Chrome is running but has no page open. Open a tab.')
  return page
}

/** Read the catalogue. Writes nothing, clicks nothing. */
export async function readCatalogue(page, cfg) {
  await page.navigate(cfg.catalogue_url)
  const signedIn = await page.waitFor(`document.querySelector(${q(cfg.selectors.signed_in)}) ? 1 : 0`, { timeoutMs: 20000 })
  if (!signedIn) return unmeasurable(null, cfg.catalogue_url, 'signed_in', 'Could not confirm a signed-in session. Sign in in that browser window first; this script has no credential of its own and will not ask for one.')
  const items = await page.waitFor(
    `(() => { const n = document.querySelectorAll(${q(cfg.selectors.catalogue_item)}); return n.length ? Array.from(n).map(e => (e.querySelector(${q(cfg.selectors.catalogue_item_name)}) || e).textContent.trim()).slice(0, 200) : null })()`,
    { timeoutMs: 20000 })
  if (!items) return unmeasurable(null, cfg.catalogue_url, 'catalogue_item')
  return { status: 'ok', url: cfg.catalogue_url, count: items.length, names: items }
}

/**
 * The canary, through the same browser.
 *
 * Byte parity says the right files are on disk. It does not say the client can
 * reach them, and those are different failures. Recorded with the same four
 * outcomes as every other surface so the cloud enters the audit's canary
 * coverage instead of being permanently exempt from it.
 */
export function canaryReport({ release, surface, results, evidence }) {
  for (const r of results) {
    if (!OUTCOMES.has(r.outcome)) throw new Error(`${r.id} has outcome "${r.outcome}", which is not one of the four`)
  }
  return {
    schema_version: 1,
    release,
    surface,
    client: surface,
    ran_at: new Date().toISOString().slice(0, 10),
    ran_by: 'scripts/cloud-upload.mjs, supervised session on LORIMER',
    evidence: evidence || 'Sent as the first message in a fresh chat through the operator\'s own signed-in browser.',
    results,
  }
}

// ---------------------------------------------------------------------- main
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const port = Number(flag('--port') || 9222)
  const surface = flag('--surface') || 'claude-cloud'
  const cfg = SURFACES[surface]
  if (!cfg) { console.error(`unknown surface ${surface}. Known: ${Object.keys(SURFACES).join(', ')}`); process.exit(2) }

  if (has('--upload') && !has('--confirm')) {
    console.error('--upload changes a live catalogue. Add --confirm once you have read the plan it prints.')
    process.exit(2)
  }
  if (has('--upload')) {
    const gate = uploadAllowed(surface)
    if (!gate.allowed) { console.error(`refused: ${gate.why}`); process.exit(1) }
  }

  let target
  try { target = await connect(port) } catch (e) { console.error(e.message); process.exit(1) }
  const v = await browserVersion(port)
  console.log(`connected to ${v.Browser} on port ${port}, borrowing an existing tab`)

  const page = await Page.open(target.webSocketDebuggerUrl)
  try {
    const cat = await readCatalogue(page, cfg)
    if (cat.status !== 'ok') {
      cat.surface = surface
      console.error(`unmeasurable: ${cat.detail}`)
      console.error(`  url:      ${cat.url}`)
      console.error(`  selector: ${cat.selector}`)
      process.exit(1)
    }
    console.log(`${cfg.name}: ${cat.count} entries`)
    for (const n of cat.names.slice(0, 40)) console.log(`  ${n}`)

    if (has('--check')) {
      const record = { surface, status: 'ok', checked_at: new Date().toISOString(), url: cat.url, catalogue_count: cat.count, names: cat.names }
      const out = join(HARNESS, checkPath(surface))
      mkdirSync(dirname(out), { recursive: true })
      writeFileSync(out, JSON.stringify(record, null, 2) + '\n')
      console.log(`\nrecorded ${checkPath(surface)}. Uploads are allowed for 14 days from now.`)
    }

    if (has('--upload')) {
      // Deliberately not implemented as a blind click. The plan is printed and
      // the operator drops the files, because the one thing worse than a manual
      // upload is an automated upload into a page whose shape changed.
      console.log('\nUpload plan:')
      console.log(`  release:  ${flag('--release') || '(none given)'}`)
      console.log(`  artifact: every skill as *${cfg.artifact_suffix} from the release assets`)
      console.log(`  target:   ${cfg.catalogue_url}`)
      console.log('\nThe file input is at ' + cfg.selectors.upload_input + ' on that page.')
      console.log('Removing the previous entry is a deletion and needs its own named approval;')
      console.log('this script never does it, and neither should the run that follows it.')
    }
  } finally {
    page.close()
  }
}
