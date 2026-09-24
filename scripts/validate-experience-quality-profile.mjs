#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

export const REQUIRED_COVERAGE = [
  'product_truth',
  'storyboard_narrative',
  'information_architecture_guidance',
  'conversion_trust',
  'visual_craft',
  'design_system_integrity',
  'device_specific_interaction',
  'motion_scroll_causality',
  'accessibility_assistive_technology',
  'content_clarity_voice',
  'functional_state_recovery',
  'responsive_layout',
  'performance_technical',
  'originality_brand',
  'evidence_provenance',
]

export const REQUIRED_REVIEW_CHECKS = [
  'artifact_identity',
  'runtime_identity',
  'fresh_self_owned_capture',
  'broken_links_controls_assets',
  'overflow_overlap_clipping',
  'layout_alignment',
  'text_wrap_orphans_content_range',
  'contrast',
  'keyboard_focus_semantics',
  'touch_targets',
  'viewport_safe_areas_fixed_chrome',
  'reduced_motion',
  'section_fit_scroll_contract',
  'duplicate_components_claims',
  'placeholder_debug_backup_singer_copy',
  'console_network_user_impact',
  'single_dom_scroll_context',
  'continuous_forward_reverse_journey',
  'section_seam_collision',
  'judge_evidence_identity',
]

const REQUIRED_CONTINUITY_FIELDS = ['route', 'viewport', 'action', 'expected', 'observed', 'evidence']
const REQUIRED_BRIEF_FIELDS = ['accepted_outcomes', 'accepted_experience', 'authoritative_evidence', 'rejected_patterns', 'candidate_mapping', 'omissions', 'contradictions']
const REQUIRED_FEEDBACK_FIELDS = ['id', 'exactFeedback', 'source', 'surface', 'section', 'device', 'element', 'classification', 'requiredOutcome', 'acceptanceTest', 'status', 'resolution', 'evidence']
const REQUIRED_OWNERS = {
  orchestration: 'build-apps-with-krish',
  taste: 'krish-design',
  implementation: 'krish-build',
  taskValidation: 'ux-testing-agent',
  completion: 'verification-loop',
  materialApproval: 'Krish',
  exceptions: 'Krish',
  release: 'explicit-action-time-approval',
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function uniqueStrings(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.length > 0) && new Set(value).size === value.length
}

function requireSubset(actual, required, label, failures) {
  if (!uniqueStrings(actual)) {
    failures.push(`${label} must be a unique non-empty string array`)
    return
  }
  for (const item of required) if (!actual.includes(item)) failures.push(`${label} is missing ${item}`)
}

export function validateExperienceQualityProfile(profile) {
  const failures = []
  if (!isObject(profile)) return ['profile must be an object']
  if (profile.schemaVersion !== 1) failures.push('schemaVersion must equal 1')
  if (profile.contractVersion !== '1.3.0') failures.push('contractVersion must equal 1.3.0')
  if (typeof profile.projectId !== 'string' || !profile.projectId.trim()) failures.push('projectId is required')
  if (typeof profile.stateRoute !== 'string' || !profile.stateRoute.trim()) failures.push('stateRoute is required')

  if (!isObject(profile.owners)) failures.push('owners is required')
  else for (const [key, expected] of Object.entries(REQUIRED_OWNERS)) {
    if (profile.owners[key] !== expected) failures.push(`owners.${key} must equal ${expected}`)
  }

  if (!uniqueStrings(profile.surfaces) || profile.surfaces.length < 2) failures.push('surfaces must contain at least two unique device or interaction classes')
  requireSubset(profile.requiredCoverage, REQUIRED_COVERAGE, 'requiredCoverage', failures)

  const fidelity = profile.briefFidelity
  if (!isObject(fidelity)) failures.push('briefFidelity is required')
  else {
    if (fidelity.required !== true) failures.push('briefFidelity.required must be true')
    if (fidelity.ownerDirectionIsHardGate !== true) failures.push('briefFidelity.ownerDirectionIsHardGate must be true')
    if (fidelity.candidateTraceRequired !== true) failures.push('briefFidelity.candidateTraceRequired must be true')
    if (fidelity.scoresCannotOverride !== true) failures.push('briefFidelity.scoresCannotOverride must be true')
    if (fidelity.blockOnUnresolved !== true) failures.push('briefFidelity.blockOnUnresolved must be true')
    requireSubset(fidelity.requiredFields, REQUIRED_BRIEF_FIELDS, 'briefFidelity.requiredFields', failures)
    if (!uniqueStrings(fidelity.authoritativeSources) || fidelity.authoritativeSources.length < 1) failures.push('briefFidelity.authoritativeSources must contain at least one source')
  }

  const readiness = profile.reviewReadiness

  const feedback = profile.feedbackReconciliation
  if (!isObject(feedback)) failures.push('feedbackReconciliation is required')
  else {
    if (feedback.required !== true) failures.push('feedbackReconciliation.required must be true')
    if (typeof feedback.ledger !== 'string' || !feedback.ledger.trim()) failures.push('feedbackReconciliation.ledger is required')
    if (feedback.verbatimRequired !== true) failures.push('feedbackReconciliation.verbatimRequired must be true')
    if (feedback.decisionNotesRequired !== true) failures.push('feedbackReconciliation.decisionNotesRequired must be true')
    if (feedback.overallNoteRequired !== true) failures.push('feedbackReconciliation.overallNoteRequired must be true')
    if (feedback.submissionIsApproval !== false) failures.push('feedbackReconciliation.submissionIsApproval must be false')
    if (feedback.blockOnUnresolved !== true) failures.push('feedbackReconciliation.blockOnUnresolved must be true')
    if (feedback.judgesReceiveRequirements !== true) failures.push('feedbackReconciliation.judgesReceiveRequirements must be true')
    requireSubset(feedback.blockingStatuses, ['open', 'implemented-awaiting-review'], 'feedbackReconciliation.blockingStatuses', failures)
    requireSubset(feedback.requiredFields, REQUIRED_FEEDBACK_FIELDS, 'feedbackReconciliation.requiredFields', failures)
  }

  if (!isObject(readiness)) failures.push('reviewReadiness is required')
  else {
    requireSubset(readiness.blockingStatuses, ['fail', 'inconclusive', 'not_run'], 'reviewReadiness.blockingStatuses', failures)
    requireSubset(readiness.requiredChecks, REQUIRED_REVIEW_CHECKS, 'reviewReadiness.requiredChecks', failures)
    if (readiness.selfOwnedRuntime !== true) failures.push('reviewReadiness.selfOwnedRuntime must be true')
    if (readiness.candidateBoundEvidence !== true) failures.push('reviewReadiness.candidateBoundEvidence must be true')
  }

  const firewall = profile.presentationFirewall
  if (!isObject(firewall)) failures.push('presentationFirewall is required')
  else {
    if (firewall.required !== true) failures.push('presentationFirewall.required must be true')
    if (firewall.failClosed !== true) failures.push('presentationFirewall.failClosed must be true')
    if (firewall.candidateManifestRequired !== true) failures.push('presentationFirewall.candidateManifestRequired must be true')
    if (firewall.singleDomScrollContextRequired !== true) failures.push('presentationFirewall.singleDomScrollContextRequired must be true')
    if (firewall.embeddedFrameIntegrationAllowed !== false) failures.push('presentationFirewall.embeddedFrameIntegrationAllowed must be false')
    if (firewall.candidateBoundReceiptRequired !== true) failures.push('presentationFirewall.candidateBoundReceiptRequired must be true')
    if (firewall.directReviewCommandRequired !== true) failures.push('presentationFirewall.directReviewCommandRequired must be true')
    if (firewall.adversarialSelfTestRequired !== true) failures.push('presentationFirewall.adversarialSelfTestRequired must be true')
    requireSubset(firewall.blockingStatuses, ['fail', 'inconclusive', 'not_run', 'stale', 'mismatch', 'missing'], 'presentationFirewall.blockingStatuses', failures)
  }

  const continuity = profile.continuity
  if (!isObject(continuity)) failures.push('continuity is required')
  else {
    if (continuity.required !== true) failures.push('continuity.required must be true')
    requireSubset(continuity.requiredFields, REQUIRED_CONTINUITY_FIELDS, 'continuity.requiredFields', failures)
    if (continuity.blockOnAnyUnresolved !== true) failures.push('continuity.blockOnAnyUnresolved must be true')
  }

  const panel = profile.blindPanel
  if (!isObject(panel)) failures.push('blindPanel is required')
  else {
    if (panel.required !== true) failures.push('blindPanel.required must be true')
    if (panel.ownerHistoryVisible !== false) failures.push('blindPanel.ownerHistoryVisible must be false')
    if (!Number.isInteger(panel.minimumIndependentJurors) || panel.minimumIndependentJurors < 6) failures.push('blindPanel.minimumIndependentJurors must be at least 6')
    if (panel.scoresCannotOverrideHardGates !== true) failures.push('blindPanel.scoresCannotOverrideHardGates must be true')
    if (!Array.isArray(panel.roles) || panel.roles.length < 6) failures.push('blindPanel.roles must contain at least six specialist roles')
    else {
      const roleIds = new Set()
      const covered = new Set()
      for (const [index, role] of panel.roles.entries()) {
        if (!isObject(role)) { failures.push(`blindPanel.roles[${index}] must be an object`); continue }
        if (typeof role.id !== 'string' || !role.id) failures.push(`blindPanel.roles[${index}].id is required`)
        else if (roleIds.has(role.id)) failures.push(`blindPanel.roles contains duplicate id ${role.id}`)
        else roleIds.add(role.id)
        if (typeof role.surface !== 'string' || !profile.surfaces?.includes(role.surface)) failures.push(`blindPanel.roles[${index}].surface must name a declared surface`)
        if (!uniqueStrings(role.coverage)) failures.push(`blindPanel.roles[${index}].coverage must be a unique non-empty string array`)
        else role.coverage.forEach((item) => covered.add(item))
      }
      for (const item of REQUIRED_COVERAGE) if (!covered.has(item)) failures.push(`blindPanel role coverage is missing ${item}`)
    }
  }

  const release = profile.releaseEvidence
  if (!isObject(release)) failures.push('releaseEvidence is required')
  else {
    requireSubset(release.automatedBrowsers, ['Chromium', 'WebKit', 'Firefox'], 'releaseEvidence.automatedBrowsers', failures)
    requireSubset(release.physicalDevices, ['iPhone Safari + VoiceOver', 'Android Chrome + TalkBack'], 'releaseEvidence.physicalDevices', failures)
    if (release.physicalCannotBeInferred !== true) failures.push('releaseEvidence.physicalCannotBeInferred must be true')
  }

  const commands = profile.commands
  if (!isObject(commands)) failures.push('commands is required')
  else for (const name of ['definitions', 'reviewReadiness', 'presentation', 'continuity', 'blindPanel', 'status']) {
    if (typeof commands[name] !== 'string' || !commands[name].trim()) failures.push(`commands.${name} is required`)
  }

  return failures
}

export async function readAndValidateProfile(path) {
  const profile = JSON.parse(await readFile(path, 'utf8'))
  return { profile, failures: validateExperienceQualityProfile(profile) }
}

async function main() {
  const profilePath = process.argv[2]
  if (!profilePath) throw new Error('Usage: node scripts/validate-experience-quality-profile.mjs <profile.json>')
  const { profile, failures } = await readAndValidateProfile(profilePath)
  console.log(JSON.stringify({ projectId: profile.projectId ?? null, contractVersion: profile.contractVersion ?? null, failures }, null, 2))
  if (failures.length) process.exitCode = 1
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
