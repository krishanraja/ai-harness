#!/usr/bin/env node

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { validateExperienceQualityProfile } from './validate-experience-quality-profile.mjs'

const fixturePath = resolve('evals/fixtures/experience-quality/valid.profile.json')
const baseline = JSON.parse(await readFile(fixturePath, 'utf8'))
const clone = () => structuredClone(baseline)

assert.deepEqual(validateExperienceQualityProfile(baseline), [], 'valid profile must pass')

const cases = [
  ['missing narrative coverage', (p) => { p.requiredCoverage = p.requiredCoverage.filter((x) => x !== 'storyboard_narrative') }, 'requiredCoverage is missing storyboard_narrative'],
  ['owner direction is not a hard gate', (p) => { p.briefFidelity.ownerDirectionIsHardGate = false }, 'briefFidelity.ownerDirectionIsHardGate must be true'],
  ['candidate trace is optional', (p) => { p.briefFidelity.candidateTraceRequired = false }, 'briefFidelity.candidateTraceRequired must be true'],
  ['brief fidelity can be outvoted', (p) => { p.briefFidelity.scoresCannotOverride = false }, 'briefFidelity.scoresCannotOverride must be true'],
  ['brief omissions are not blocking', (p) => { p.briefFidelity.blockOnUnresolved = false }, 'briefFidelity.blockOnUnresolved must be true'],
  ['brief omits contradictions', (p) => { p.briefFidelity.requiredFields = p.briefFidelity.requiredFields.filter((x) => x !== 'contradictions') }, 'briefFidelity.requiredFields is missing contradictions'],
  ['feedback ledger missing', (p) => { delete p.feedbackReconciliation.ledger }, 'feedbackReconciliation.ledger is required'],
  ['feedback may be summarised', (p) => { p.feedbackReconciliation.verbatimRequired = false }, 'feedbackReconciliation.verbatimRequired must be true'],
  ['decision notes may be dropped', (p) => { p.feedbackReconciliation.decisionNotesRequired = false }, 'feedbackReconciliation.decisionNotesRequired must be true'],
  ['overall note may be dropped', (p) => { p.feedbackReconciliation.overallNoteRequired = false }, 'feedbackReconciliation.overallNoteRequired must be true'],
  ['submission treated as approval', (p) => { p.feedbackReconciliation.submissionIsApproval = true }, 'feedbackReconciliation.submissionIsApproval must be false'],
  ['unresolved feedback does not block', (p) => { p.feedbackReconciliation.blockOnUnresolved = false }, 'feedbackReconciliation.blockOnUnresolved must be true'],
  ['judges ignore feedback requirements', (p) => { p.feedbackReconciliation.judgesReceiveRequirements = false }, 'feedbackReconciliation.judgesReceiveRequirements must be true'],
  ['feedback field missing', (p) => { p.feedbackReconciliation.requiredFields = p.feedbackReconciliation.requiredFields.filter((x) => x !== 'exactFeedback') }, 'feedbackReconciliation.requiredFields is missing exactFeedback'],
  ['single device surface', (p) => { p.surfaces = ['desktop']; p.blindPanel.roles.forEach((r) => { r.surface = 'desktop' }) }, 'surfaces must contain at least two'],
  ['not_run is not blocking', (p) => { p.reviewReadiness.blockingStatuses = ['fail', 'inconclusive'] }, 'reviewReadiness.blockingStatuses is missing not_run'],
  ['ambient runtime accepted', (p) => { p.reviewReadiness.selfOwnedRuntime = false }, 'reviewReadiness.selfOwnedRuntime must be true'],
  ['missing alignment preflight', (p) => { p.reviewReadiness.requiredChecks = p.reviewReadiness.requiredChecks.filter((x) => x !== 'layout_alignment') }, 'reviewReadiness.requiredChecks is missing layout_alignment'],
  ['presentation firewall missing', (p) => { delete p.presentationFirewall }, 'presentationFirewall is required'],
  ['presentation firewall may pass open', (p) => { p.presentationFirewall.failClosed = false }, 'presentationFirewall.failClosed must be true'],
  ['embedded integration is allowed', (p) => { p.presentationFirewall.embeddedFrameIntegrationAllowed = true }, 'presentationFirewall.embeddedFrameIntegrationAllowed must be false'],
  ['single scroll context is optional', (p) => { p.presentationFirewall.singleDomScrollContextRequired = false }, 'presentationFirewall.singleDomScrollContextRequired must be true'],
  ['receipt may be stale', (p) => { p.presentationFirewall.candidateBoundReceiptRequired = false }, 'presentationFirewall.candidateBoundReceiptRequired must be true'],
  ['missing mismatch blocker', (p) => { p.presentationFirewall.blockingStatuses = p.presentationFirewall.blockingStatuses.filter((x) => x !== 'mismatch') }, 'presentationFirewall.blockingStatuses is missing mismatch'],
  ['presentation command missing', (p) => { delete p.commands.presentation }, 'commands.presentation is required'],
  ['history contaminates panel', (p) => { p.blindPanel.ownerHistoryVisible = true }, 'blindPanel.ownerHistoryVisible must be false'],
  ['too few jurors', (p) => { p.blindPanel.minimumIndependentJurors = 5 }, 'minimumIndependentJurors must be at least 6'],
  ['role coverage gap', (p) => { p.blindPanel.roles.forEach((r) => { r.coverage = r.coverage.filter((x) => x !== 'conversion_trust') }) }, 'blindPanel role coverage is missing conversion_trust'],
  ['score overrides hard gate', (p) => { p.blindPanel.scoresCannotOverrideHardGates = false }, 'scoresCannotOverrideHardGates must be true'],
  ['missing browser engine', (p) => { p.releaseEvidence.automatedBrowsers = ['Chromium', 'WebKit'] }, 'releaseEvidence.automatedBrowsers is missing Firefox'],
  ['missing physical assistive device', (p) => { p.releaseEvidence.physicalDevices = ['iPhone Safari + VoiceOver'] }, 'releaseEvidence.physicalDevices is missing Android Chrome + TalkBack'],
  ['material approval delegated to a model', (p) => { p.owners.materialApproval = 'panel' }, 'owners.materialApproval must equal Krish'],
]

for (const [label, mutate, expected] of cases) {
  const profile = clone()
  mutate(profile)
  const failures = validateExperienceQualityProfile(profile)
  assert(failures.some((failure) => failure.includes(expected)), `${label}: expected failure containing ${expected}; got ${failures.join(' | ')}`)
}

console.log(`EXPERIENCE QUALITY PROFILE TESTS PASSED: ${cases.length + 1} cases`)
