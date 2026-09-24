#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { isAbsolute, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const REVIEW_STAGES = new Set(['review_ready', 'release_ready', 'live_verified'])
const CLOSED_DECISIONS = new Set(['verified', 'accepted'])

const digest = (bytes) => createHash('sha256').update(bytes).digest('hex')
const within = (root, target) => {
  const rel = relative(root, target)
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))
}

async function checkEvidence(root, evidence, label, failures) {
  if (!evidence || typeof evidence.path !== 'string' || !/^[a-f0-9]{64}$/i.test(evidence.sha256 ?? '')) {
    failures.push(`${label} must contain path and sha256`)
    return
  }
  const target = resolve(root, evidence.path)
  if (!within(root, target)) {
    failures.push(`${label}.path escapes the project root`)
    return
  }
  try {
    if (!(await stat(target)).isFile()) throw new Error('not a file')
    const actual = digest(await readFile(target))
    if (actual.toLowerCase() !== evidence.sha256.toLowerCase()) failures.push(`${label} digest mismatch`)
  } catch {
    failures.push(`${label} file is missing: ${evidence.path}`)
  }
}

export async function validateProjectDeliveryState(state, projectRoot) {
  const failures = []
  const root = resolve(projectRoot)
  if (state?.schemaVersion !== 1) failures.push('schemaVersion must equal 1')
  if (!state?.projectId) failures.push('projectId is required')
  if (!state?.candidate?.id) failures.push('candidate.id is required')
  if (!/^[a-f0-9]{64}$/i.test(state?.candidate?.digest ?? '')) failures.push('candidate.digest must be a SHA-256')
  if (!['design_locked', 'implementation', 'review_ready', 'release_ready', 'live_verified'].includes(state?.stage)) failures.push('stage is invalid')
  if (!Array.isArray(state?.acceptedDecisions) || state.acceptedDecisions.length === 0) failures.push('acceptedDecisions must not be empty')
  else {
    const ids = new Set()
    for (const [index, decision] of state.acceptedDecisions.entries()) {
      const label = `acceptedDecisions[${index}]`
      if (!decision?.id) failures.push(`${label}.id is required`)
      else if (ids.has(decision.id)) failures.push(`acceptedDecisions contains duplicate id ${decision.id}`)
      else ids.add(decision.id)
      for (const field of ['scope', 'source', 'requiredOutcome', 'status']) if (!decision?.[field]) failures.push(`${label}.${field} is required`)
      if (REVIEW_STAGES.has(state.stage) && !CLOSED_DECISIONS.has(decision?.status)) failures.push(`${label} is not verified or accepted at stage ${state.stage}`)
      if (!Array.isArray(decision?.evidence) || decision.evidence.length === 0) failures.push(`${label}.evidence must not be empty`)
      else for (const [evidenceIndex, evidence] of decision.evidence.entries()) await checkEvidence(root, evidence, `${label}.evidence[${evidenceIndex}]`, failures)
    }
  }
  if (!Number.isInteger(state?.unresolvedBlockingFeedback) || state.unresolvedBlockingFeedback < 0) failures.push('unresolvedBlockingFeedback must be a non-negative integer')
  if (REVIEW_STAGES.has(state?.stage) && state.unresolvedBlockingFeedback !== 0) failures.push(`unresolved blocking feedback forbids stage ${state.stage}`)
  if (!state?.presentationReceipt?.candidateDigest) failures.push('presentationReceipt.candidateDigest is required')
  else if (state.presentationReceipt.candidateDigest !== state?.candidate?.digest) failures.push('presentation receipt is bound to another candidate')
  if (!state?.continuation?.nextAction || typeof state.continuation.nextAction !== 'string') failures.push('continuation.nextAction is required')
  if (Array.isArray(state?.continuation?.nextActions) && state.continuation.nextActions.length > 1) failures.push('continuation may name exactly one next action')
  if (state?.candidate?.artifact) await checkEvidence(root, state.candidate.artifact, 'candidate.artifact', failures)
  else failures.push('candidate.artifact is required')
  return failures
}

async function main() {
  const statePath = process.argv[2]
  const projectIndex = process.argv.indexOf('--project-root')
  const projectRoot = projectIndex >= 0 ? process.argv[projectIndex + 1] : null
  if (!statePath || !projectRoot) throw new Error('Usage: node scripts/validate-project-delivery-state.mjs <state.json> --project-root <path>')
  const state = JSON.parse(await readFile(statePath, 'utf8'))
  const failures = await validateProjectDeliveryState(state, projectRoot)
  console.log(JSON.stringify({ projectId: state.projectId ?? null, candidateId: state.candidate?.id ?? null, stage: state.stage ?? null, failures }, null, 2))
  if (failures.length) process.exitCode = 1
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
