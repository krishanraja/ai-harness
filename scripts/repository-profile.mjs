#!/usr/bin/env node
/** Inventory repository-owned sources; no application commands or model calls are executed. */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { parseYaml } from './lib/yaml.mjs'
import { digest } from './lib/learning-episode.mjs'
import { bootstrapMeasure } from './repository-admin.mjs'
import { policyAt, ROOT } from './repository-brain.mjs'

export function inventoryProfile(repo, read, source_revision, policy = policyAt()) {
  if (!policy.targets.includes(repo.name) || repo.canon_sync === false) throw new Error('repository_not_admitted')
  const bootstrap = bootstrapMeasure(read)
  const paths = ['README.md', 'NOW.md', ...(repo.rules_files || []).filter((p) => !['AGENTS.md', 'CLAUDE.md'].includes(p)), ...bootstrap.files.filter((p) => !['AGENTS.md', 'CLAUDE.md'].includes(p))]
  if (repo.name === 'ai-harness') paths.push('CURRENT.md')
  if (repo.name === 'content-engine') paths.push('docs/NORTH_STAR.md', 'WORKBENCH.md', 'docs/CONTENT_ENGINE.md', 'docs/STUDIO.md', 'docs/ENGINE_SESSION.md', 'docs/SYSTEM_MAP.md', '.agents/skills/make-piece/SKILL.md', '.agents/skills/produce-video/SKILL.md', '.agents/skills/plan-week/SKILL.md', 'config/title-verdicts.json', 'config/failures.json', 'config/boards.json', 'scripts/check_failures.py')
  if (repo.name === 'AEO-Engine') paths.push('docs/NEVER-PUBLISH.md', 'src/index.ts', 'src/pipeline/run.ts')
  if (read('package.json')) paths.push('package.json')
  const sources = [...new Set(paths)].filter((p) => read(p) != null).map((path) => ({
    path, role: /NOW|STATE|CURRENT|RESUME|WORKBENCH/i.test(path) ? 'state' : /skill|ENGINE_SESSION/.test(path) ? 'workflow' : /failures|verdicts/.test(path) ? 'learning' : /NEVER|privacy/i.test(path) ? 'privacy' : /package|check_/.test(path) ? 'verification' : 'orientation',
    label: path === 'README.md' ? 'Purpose and system boundaries' : path === 'NOW.md' ? 'Current repository state' : path === 'package.json' ? 'Repository commands' : path.split('/').at(-1).replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '),
  }))
  const pkg = read('package.json') ? JSON.parse(read('package.json')) : null
  const verify = pkg?.scripts?.verify ? 'npm run verify' : pkg?.scripts?.['docs:check'] ? 'npm run docs:check' : pkg?.scripts?.test ? 'npm test' : null
  let workflows = [{ id: 'administration', label: 'Orient, diagnose and verify the system', read: sources.filter((s) => s.role === 'state' || s.path === 'README.md').map((s) => s.path), checks: verify ? [verify] : [] }]
  if (repo.name === 'content-engine') workflows = [
    { id: 'content', label: 'Ideation, drafting, iteration and publication preparation', read: ['docs/NORTH_STAR.md', 'docs/CONTENT_ENGINE.md', '.agents/skills/make-piece/SKILL.md', 'config/title-verdicts.json', 'config/failures.json', 'WORKBENCH.md'], checks: ['python3 scripts/check_failures.py', 'npm run verify'] },
    { id: 'production', label: 'Tracked Studio and media production', read: ['docs/STUDIO.md', 'docs/ENGINE_SESSION.md', '.agents/skills/produce-video/SKILL.md'], checks: ['npm run verify'] },
    { id: 'board', label: 'Weekly decisions, all account links and feedback continuity', read: ['.agents/skills/plan-week/SKILL.md', 'config/boards.json', 'WORKBENCH.md'], checks: ['python3 scripts/check_failures.py'] },
  ]
  if (repo.name === 'AEO-Engine') workflows = [
    { id: 'research', label: 'Question selection, probes, evidence and packet handoffs', read: ['README.md', 'docs/PACKET.md', 'docs/STATE.md', 'src/pipeline/run.ts', 'docs/NEVER-PUBLISH.md'], checks: ['npm test', 'npm run typecheck', 'npm run check:config'] },
    { id: 'experiment', label: 'Compare conditional findings and choose the next bounded test', read: ['README.md', 'docs/PACKET.md', 'docs/STATE.md'], checks: ['npm run run -- --offline --dry --subject ctrl'] },
  ]
  const profile = { schema_version: 1, repository: repo.name, enabled: true, families: ['repository-administration', ...(repo.name === 'content-engine' ? ['content'] : repo.name === 'AEO-Engine' ? ['growth'] : [])], source_revision, context_path: 'docs/HARNESS_CONTEXT.md', entrypoints: { agents: 'AGENTS.md', claude: 'CLAUDE.md' }, bootstrap_limit_chars: bootstrap.chars, sources, workflows }
  if (repo.name === 'content-engine') profile.bootstrap_notes = ['Before any work run `python3 scripts/check_failures.py`. At session start read comments on EVERY board link in `config/boards.json`; each board publish updates every link from the same engine-built file. Studio work requires `docs/ENGINE_SESSION.md`, `studio.session.open` and its tracked capability set; cloud Studio sessions stay read-only. Preserve observer attribution and Krish\'s actual decisions, keep exact feedback excerpts and never whole transcripts. `Video engine` remains the exact external launcher.']
  return profile
}

export function initialMigration(repo, read, policy = policyAt()) {
  const migration = { acceptance: policy.approval, files: {}, retained_clauses: [] }
  if (repo.name === 'content-engine') {
    migration.files['CLAUDE.md'] = { before_sha256: digest(read('CLAUDE.md') || ''), after: '@AGENTS.md\n' }
    migration.retained_clauses = ['System boundaries and authority remain in AGENTS.md and docs/SYSTEM_MAP.md.', 'Failure checks, both-account comments/publication, tracked Studio, observer attribution, transcript exclusion and exact launcher move into the managed bootstrap note.', 'Weekly board and account/editor mechanics remain in the board workflow sources, including plan-week.', 'Session orientation and handoff remain in AGENTS.md and WORKBENCH.md.']
  } else if ((read('AGENTS.md') || '').startsWith('# AGENTS.md\n\nEntry file for coding agents')) {
    const source = read('AGENTS.md'), at = source.indexOf('<!-- krish-canon:start')
    const own = source.slice(0, at)
    let extra = own.includes('\n## ') ? own.slice(own.indexOf('\n## ')) : ''
    if (repo.name === 'contentarchives') extra = own.slice(own.indexOf('The code is a conveyor'))
    let header = `# AGENTS.md\n\nRead \`NOW.md\` first.\n\nRules: ${(repo.rules_files || []).filter((p) => p !== 'AGENTS.md').map((p) => `\`${p}\``).join(', ')}.\n\n`
    if (repo.name === 'ai-harness') header = '# AGENTS.md\n\nRead `CURRENT.md` first, then read `NOW.md`.\n\nContracts: `contract/krish-operating-contract.md`, `contract/skill-routing-contract.md`.\n\n'
    if (at !== -1) migration.files['AGENTS.md'] = { before_sha256: digest(source), after: header + (extra ? extra.trim() + '\n\n' : '') + source.slice(at) }
    migration.retained_clauses = ['Read current state first; retain repository-specific rule links and precedence in the unchanged canon.', 'Remove repeated seeder explanation; freshness evidence remains with NOW.md and its steward.', 'Preserve specific sections and the complete canon block byte-for-byte.']
    if (repo.name === 'ai-harness' && read('CLAUDE.md')) migration.files['CLAUDE.md'] = { before_sha256: digest(read('CLAUDE.md')), after: '@AGENTS.md\n' }
  }
  return migration
}

const main = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (main) {
  const args = process.argv.slice(2), flag = (f) => args[args.indexOf(f) + 1]
  if (!args.includes('--initialize')) throw new Error('Profile initialization is explicit; scheduled runs never replace curated profiles.')
  const root = resolve(flag('--checkouts') || '..')
  const fleet = parseYaml(readFileSync(join(ROOT, 'state/fleet.yaml'), 'utf8'))
  for (const repo of fleet.repos) {
    if (!policyAt().targets.includes(repo.name)) continue
    const dir = repo.name === 'ai-harness' ? ROOT : join(root, repo.checkout || repo.name)
    if (existsSync(join(ROOT, 'brain/repositories', `${repo.name}.json`))) throw new Error(`profile_already_exists:${repo.name}`)
    const read = (p) => existsSync(join(dir, p)) ? readFileSync(join(dir, p), 'utf8') : null
    const source = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim()
    const p = inventoryProfile(repo, read, source), m = initialMigration(repo, read)
    mkdirSync(join(ROOT, 'brain/repositories'), { recursive: true }); mkdirSync(join(ROOT, 'state/repository-administration/migrations'), { recursive: true })
    writeFileSync(join(ROOT, 'brain/repositories', `${repo.name}.json`), JSON.stringify(p, null, 2) + '\n')
    if (Object.keys(m.files).length) writeFileSync(join(ROOT, 'state/repository-administration/migrations', `${repo.name}.json`), JSON.stringify(m, null, 2) + '\n')
    console.log(JSON.stringify({ repository: repo.name, source_count: p.sources.length, bootstrap: p.bootstrap_limit_chars, migration: Object.keys(m.files) }))
  }
}
