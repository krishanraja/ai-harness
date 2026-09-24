#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'

const ROOT = resolve(fileURLToPath(import.meta.url), '../..')
const DAY = 86_400_000

export function fleetFreshness(registry, now = new Date()) {
  const latest = registry.latest_approved_release?.release_id ?? null
  const surfaces = Object.entries(registry.surface_deployments ?? {}).map(([surface, deployment]) => {
    const deployed = deployment.deployed_at ? new Date(`${deployment.deployed_at}T00:00:00Z`) : null
    const ageDays = deployed && !Number.isNaN(deployed.valueOf()) ? Math.floor((now - deployed) / DAY) : null
    return {
      surface,
      release: deployment.release_id ?? null,
      current: deployment.release_id === latest,
      ageDays,
      status: deployment.status ?? 'unknown',
    }
  })
  return { generatedAt: now.toISOString(), latestApprovedRelease: latest, surfaces, staleSurfaces: surfaces.filter((surface) => !surface.current).map((surface) => surface.surface) }
}

async function main() {
  const registry = parseYaml(await readFile(process.argv[2] ?? resolve(ROOT, 'state/skill-registry.yaml'), 'utf8'))
  const report = fleetFreshness(registry)
  console.log(JSON.stringify(report, null, 2))
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
