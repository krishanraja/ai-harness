import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { validateStageConveyor } from '../skills/krish-build/scripts/check-stage-conveyor.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../evals/fixtures/stage-conveyor')
const baseline = JSON.parse(readFileSync(resolve(root, 'stage-conveyor.json'), 'utf8'))
const clone = () => structuredClone(baseline)

function expectPass(name, manifest) {
  const errors = validateStageConveyor(manifest, root)
  if (errors.length) throw new Error(`${name} unexpectedly failed: ${errors.join(' | ')}`)
}

function expectFailure(name, mutate, pattern) {
  const manifest = clone()
  mutate(manifest)
  const errors = validateStageConveyor(manifest, root)
  if (!errors.some(error => pattern.test(error))) throw new Error(`${name} did not produce ${pattern}; got ${errors.join(' | ')}`)
}

expectPass('valid stage conveyor', clone())
expectFailure('unowned executable', manifest => { manifest.stages[1].owned_paths = ['pipeline/other.mjs'] }, /exactly one responsibility owner/u)
expectFailure('duplicate executable owner', manifest => { manifest.stages[1].owned_paths = ['pipeline/capture.mjs', 'pipeline/build.mjs'] }, /exactly one responsibility owner/u)
expectFailure('guard bypass', manifest => { manifest.stages[1].consumed_guards = ['other'] }, /required guard scope is bypassed/u)
expectFailure('broken artifact join', manifest => { manifest.edges[0].artifact = 'other' }, /is not output by capture/u)
expectFailure('progress completion', manifest => { manifest.stages[2].completion.source = 'progress_marker' }, /must be one of authoritative_output/u)
expectFailure('missing recovery route', manifest => { delete manifest.stages[1].retry.recovery_entrypoint }, /missing property: recovery_entrypoint/u)
expectFailure('ownerless learning', manifest => { manifest.learnings[0].owner_stage = 'unknown' }, /requires one owner_stage/u)
expectFailure('missing enforcement', manifest => { manifest.learnings[0].enforced_by = ['tests/missing.test.mjs'] }, /does not exist/u)
expectFailure('unreachable stage', manifest => { manifest.edges.splice(1, 1); manifest.stages[2].inputs = ['external_verify']; manifest.external_inputs.push('external_verify'); manifest.stages[1].outputs = ['built_terminal']; manifest.terminal_outputs.push('built_terminal') }, /unreachable from a primary entrypoint/u)
expectFailure('unknown manifest property', manifest => { manifest.undeclared = true }, /unknown property/u)
expectFailure('duplicate artifact producer', manifest => { manifest.stages[2].outputs.push('captured_source') }, /exactly one producer/u)
expectFailure('cycle', manifest => { manifest.stages[0].inputs.push('verified_delivery'); manifest.edges.push({ from: 'verify', to: 'capture', artifact: 'verified_delivery' }) }, /must be acyclic/u)
expectFailure('empty stage set', manifest => { manifest.stages = []; manifest.edges = []; manifest.entrypoints = [] }, /requires at least 1 item/u)
expectFailure('inventory root is a file', manifest => { manifest.inventory.roots = ['stage-conveyor.json'] }, /is not a directory/u)
expectFailure('enforcement path is a directory', manifest => { manifest.learnings[0].enforced_by = ['tests'] }, /must be a regular in-repository file/u)

const fixtureRun = spawnSync(process.execPath, ['--test', resolve(root, 'tests/stage-conveyor.test.mjs')], { encoding: 'utf8', windowsHide: true })
if (fixtureRun.status !== 0) throw new Error(`executable stage fixture failed: ${fixtureRun.stdout} ${fixtureRun.stderr}`)

console.log('STAGE CONVEYOR TESTS PASSED: executable fixture plus 15 structural defect cases')
