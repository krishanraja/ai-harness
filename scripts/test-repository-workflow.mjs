#!/usr/bin/env node
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const yml=readFileSync('.github/workflows/repository-administration.yml','utf8')
const events=yml.slice(yml.indexOf('on:'),yml.indexOf('permissions:'))
assert.match(events,/workflows: \["Harness observation intake"\]/)
assert.doesNotMatch(events,/Harness steward/,'A reporting commit starts the steward; listening for its completion would create an infinite loop')
const paths=events.match(/paths: \[([^\n]+)\]/)[1]
assert.match(paths,/state\/observations\/\*\.jsonl/,'New real observations must still trigger consolidation')
assert.doesNotMatch(paths,/repository-administration\/(?:latest|health|deployments)|"state\/\*\*/,'Derived reporting must not retrigger the publisher')
assert.match(yml,/ref: main/)
assert.match(yml,/persist-credentials: false/)
assert.match(yml,/if: github.event_name == 'pull_request' \|\| github.event_name == 'push'/)
assert.match(yml,/HISTORY_BASE:.*github.event.before/,'Direct pushes must preserve the preceding main history')
const persist=yml.slice(yml.indexOf('- name: Record coverage and persist append-only knowledge'),yml.indexOf('  fresh-context:'))
const guard=persist.indexOf('validate-knowledge-history.mjs --base "$(git rev-parse HEAD)"')
assert.ok(guard>=0&&guard<persist.indexOf('git commit -m'),'Automatic commits must preserve their checked-out history')
assert.match(persist,/git pull --rebase[^\n]+\n\s+node scripts\/validate-knowledge-history\.mjs --base "\$\(git rev-parse origin\/main\)"\n\s+if git push/,'Every rebased push must preserve the fetched main history')
console.log('REPOSITORY WORKFLOW OK: intake and source events retained; reporting cannot cycle through the steward')
