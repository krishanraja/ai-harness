#!/usr/bin/env node

import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { validateExperienceProjectWiring } from './validate-experience-quality-profile.mjs'
import { validateReleaseCoherence } from './validate-release-coherence.mjs'
import { fleetFreshness } from './report-fleet-freshness.mjs'
import { validateProjectDeliveryState } from './validate-project-delivery-state.mjs'
import { createHash } from 'node:crypto'

const profile = {
  stateRoute: 'project/state.md',
  feedbackReconciliation: { ledger: 'project/feedback.json' },
  commands: { definitions: 'npm run qa:definitions', status: 'npm run qa:status' },
}
const root = await mkdtemp(join(tmpdir(), 'harness-control-plane-'))
await mkdir(join(root, 'project'))
await writeFile(join(root, 'project/state.md'), 'state')
await writeFile(join(root, 'project/feedback.json'), '{}')
await writeFile(join(root, 'package.json'), JSON.stringify({ scripts: { 'qa:definitions': 'node -e "process.exit(0)"', 'qa:status': 'node -e "process.exit(0)"' } }))
assert.deepEqual(await validateExperienceProjectWiring(profile, root), [])

const missing = structuredClone(profile)
missing.commands.status = 'npm run qa:missing'
assert((await validateExperienceProjectWiring(missing, root)).some((failure) => failure.includes('qa:missing')))

const opaque = structuredClone(profile)
opaque.commands.status = 'echo trust-me'
assert((await validateExperienceProjectWiring(opaque, root)).some((failure) => failure.includes('opaque shell command')))

const registry = {
  latest_approved_release: { release_id: 'v2' },
  candidate_quality: { release: 'v3', status: 'installed-provisional-on-codex' },
  provisional_overlays: [{ release_id: 'v3', surface: 'codex', status: 'provisional-not-durable', evidence: ['deploy.json', 'canary.json'], next_gate: 'merge-publish-install-canary' }],
  surface_deployments: {
    codex: { release_id: 'v2', status: 'current' },
    claude: { release_id: 'v1', status: 'stale-awaiting-release' },
  },
}
assert.deepEqual(validateReleaseCoherence(registry), [])
const undeclared = structuredClone(registry)
undeclared.provisional_overlays = []
assert(validateReleaseCoherence(undeclared).some((failure) => failure.includes('no provisional_overlays record')))
const dishonest = structuredClone(registry)
dishonest.surface_deployments.claude.status = 'healthy'
assert(validateReleaseCoherence(dishonest).some((failure) => failure.includes('does not disclose')))

const freshness = fleetFreshness(registry, new Date('2026-09-24T12:00:00Z'))
assert.deepEqual(freshness.staleSurfaces, ['claude'])

const artifactBytes = Buffer.from('locked candidate')
const artifactSha = createHash('sha256').update(artifactBytes).digest('hex')
await writeFile(join(root, 'project/candidate.html'), artifactBytes)
const delivery = {
  schemaVersion: 1,
  projectId: 'fixture',
  stage: 'review_ready',
  candidate: { id: 'candidate-1', digest: artifactSha, artifact: { path: 'project/candidate.html', sha256: artifactSha } },
  acceptedDecisions: [{ id: 'align-1', scope: 'masthead', source: 'owner review', requiredOutcome: 'logo and hero share a left edge', status: 'verified', evidence: [{ path: 'project/candidate.html', sha256: artifactSha }] }],
  unresolvedBlockingFeedback: 0,
  presentationReceipt: { candidateDigest: artifactSha },
  continuation: { nextAction: 'request material approval' },
}
assert.deepEqual(await validateProjectDeliveryState(delivery, root), [])
const regressed = structuredClone(delivery)
regressed.acceptedDecisions[0].status = 'implemented'
regressed.unresolvedBlockingFeedback = 1
regressed.presentationReceipt.candidateDigest = '0'.repeat(64)
const deliveryFailures = await validateProjectDeliveryState(regressed, root)
assert(deliveryFailures.some((failure) => failure.includes('not verified or accepted')))
assert(deliveryFailures.some((failure) => failure.includes('unresolved blocking feedback')))
assert(deliveryFailures.some((failure) => failure.includes('another candidate')))

console.log('HARNESS CONTROL-PLANE TESTS PASSED: executable wiring, accepted-decision closure, provisional overlays, stale disclosure, fleet freshness')
