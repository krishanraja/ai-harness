/**
 * Why a machine sync did not finish: the one word its heartbeat may carry, and
 * how the digest says it to Krish. One list for both, so they cannot drift.
 *
 * Never the error text: state/heartbeats.json is public, and a raw error can
 * carry a path, a folder name or a remote's output. scripts/Invoke-HarnessSync.ps1
 * maps its errors onto these words (Get-FailureReason), the recorder stores any
 * other word as `unrecognised`, and scripts/test-machine-heartbeat.mjs fails if
 * the sync can send a word that is not here. Added 2026-10-16, when LORIMER
 * reported `blocked` on v2026.10.15.2 and nothing off the PC could say why.
 */
export const REASONS = Object.freeze({
  'checkout-edited': 'files the harness tracks were edited on your PC and never committed, so it will not install over them',
  'checkout-untracked': 'the harness folder on your PC holds files git does not track, so it will not install beside them',
  'checkout-git-output': 'git printed a warning about the harness folder on your PC, so it would not install',
  'checkout-dirty': 'the harness folder on your PC has changes nobody committed, so it will not install over them',
  'checkout-update': 'it could not update its copy of the harness from GitHub',
  'sync-script-not-on-main': 'it is running a copy of the sync that main does not hold',
  'release-not-registered': 'its copy of the registry does not yet approve the release',
  'release-assets': 'the release files would not download or did not match their checksums',
  'deployment-record-missing': 'it has no record of an earlier install on one of your tools',
  'unclassified-skill-directory': 'a folder the harness does not recognise sits in one of your skills folders, so it will not install beside it',
  'install-plan-failed': 'the installer could not plan the update',
  'install-failed': 'the installer stopped part way',
  'install-halted': 'a skill on your PC was changed by hand, so it stopped rather than overwrite it',
  'parity-drift': 'an installed skill no longer matches its release',
  'canary-failed': 'a skill did not load as expected in the check after installing',
  'canary-error': 'the check after installing could not run',
  'evidence-pull-request': 'it installed but could not send its evidence to GitHub',
  other: 'it stopped for a reason it could not name',
  unrecognised: 'it sent a reason this version of the harness does not know',
})
