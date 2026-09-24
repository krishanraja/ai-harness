#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'

const ROOT = resolve(fileURLToPath(import.meta.url), '../..')

export function validateReleaseCoherence(registry) {
  const failures = []
  const latest = registry.latest_approved_release?.release_id
  if (!latest) failures.push('latest_approved_release.release_id is missing')

  const overlays = Array.isArray(registry.provisional_overlays) ? registry.provisional_overlays : []
  const overlayByRelease = new Map(overlays.map((overlay) => [overlay.release_id, overlay]))
  for (const [key, candidate] of Object.entries(registry)) {
    if (!key.startsWith('candidate_') || !candidate || typeof candidate !== 'object') continue
    const status = String(candidate.status ?? '')
    if (!status.includes('installed')) continue
    if (candidate.release === latest) continue
    const overlay = overlayByRelease.get(candidate.release)
    if (!overlay) failures.push(`${key} is installed outside the latest approved release but has no provisional_overlays record`)
    else {
      if (overlay.status !== 'provisional-not-durable') failures.push(`provisional overlay ${candidate.release} must have status provisional-not-durable`)
      if (!overlay.surface) failures.push(`provisional overlay ${candidate.release} is missing surface`)
      if (!Array.isArray(overlay.evidence) || overlay.evidence.length < 2) failures.push(`provisional overlay ${candidate.release} needs deployment and behavioral evidence`)
      if (overlay.next_gate !== 'merge-publish-install-canary') failures.push(`provisional overlay ${candidate.release} must name the merge-publish-install-canary next gate`)
    }
    if (!status.includes('provisional')) failures.push(`${key}.status must say provisional while it is outside the latest approved release`)
  }

  for (const overlay of overlays) {
    if (overlay.release_id === latest) failures.push(`latest approved release ${latest} cannot also be a provisional overlay`)
  }

  const deployments = registry.surface_deployments ?? {}
  for (const [surface, deployment] of Object.entries(deployments)) {
    if (!deployment?.release_id || deployment.release_id === latest) continue
    const status = String(deployment.status ?? '')
    if (!/(stale|awaiting|manual|required|blocked|superseded|provisional)/i.test(status)) {
      failures.push(`${surface} is behind ${latest} but its status does not disclose the stale or blocked state`)
    }
  }
  return failures
}

async function main() {
  const registryPath = process.argv[2] ?? resolve(ROOT, 'state/skill-registry.yaml')
  const registry = parseYaml(await readFile(registryPath, 'utf8'))
  const failures = validateReleaseCoherence(registry)
  console.log(JSON.stringify({ latestApprovedRelease: registry.latest_approved_release?.release_id ?? null, provisionalOverlays: registry.provisional_overlays?.length ?? 0, failures }, null, 2))
  if (failures.length) process.exitCode = 1
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
