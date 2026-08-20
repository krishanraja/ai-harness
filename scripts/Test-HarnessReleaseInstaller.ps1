param(
    [Parameter(Mandatory = $true)]
    [string]$ManifestPath,

    [string]$InstallerPath
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
if (-not $InstallerPath) { $InstallerPath = Join-Path $PSScriptRoot 'Install-HarnessRelease.ps1' }
$testId = [Guid]::NewGuid().ToString('N')
$testRoot = Join-Path ([IO.Path]::GetTempPath()) "ai-harness-installer-test-$testId"
$target = Join-Path $testRoot 'skills'
$selected = @('harness-maintainer', 'take-the-brief')

try {
    $release = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
    $ctrlIntake = @($release.skills | Where-Object name -eq 'ctrl-intake')
    if ($ctrlIntake.Count -ne 1) { throw 'Release manifest must contain exactly one ctrl-intake record.' }
    $perplexityPath = Join-Path (Split-Path -Parent $ManifestPath) $ctrlIntake[0].perplexity_artifact
    if (-not (Test-Path -LiteralPath $perplexityPath -PathType Leaf)) { throw 'Perplexity transport is missing.' }
    if ((Get-FileHash -LiteralPath $perplexityPath -Algorithm SHA256).Hash -ne $ctrlIntake[0].perplexity_artifact_sha256) {
        throw 'Perplexity transport hash does not match the release manifest.'
    }
    $perplexityArchive = [IO.Compression.ZipFile]::OpenRead($perplexityPath)
    try {
        $perplexityEntries = @($perplexityArchive.Entries | Where-Object Name | ForEach-Object FullName)
        if ('SKILL.md' -notin $perplexityEntries) { throw 'Perplexity transport does not place SKILL.md at the archive root.' }
        if ('leaves/voice.md' -notin $perplexityEntries) { throw 'Perplexity transport dropped the ctrl-intake voice leaf.' }
        if (@($perplexityEntries | Where-Object { $_ -like 'ctrl-intake/*' }).Count -ne 0) {
            throw 'Perplexity transport incorrectly wraps files in a skill directory.'
        }
    }
    finally { $perplexityArchive.Dispose() }

    $plan = @(& $InstallerPath -ManifestPath $ManifestPath -TargetSkillsDirectory $target -SurfaceId fixture -Skills $selected)
    if (Test-Path -LiteralPath $target) { throw 'Plan-only mode created the target directory.' }
    if (-not ($plan -match 'PLAN_ONLY .*add=2')) { throw 'Plan-only mode did not report two missing skills.' }

    $install = @(& $InstallerPath -ManifestPath $ManifestPath -TargetSkillsDirectory $target -SurfaceId fixture -Skills $selected -Apply)
    if (-not ($install -match 'DEPLOYED .*changed=2')) { throw 'Initial fixture deployment did not change two skills.' }
    $recordLine = @($install | Where-Object { $_ -like 'RECORD *' })
    if ($recordLine.Count -ne 1) { throw 'Initial fixture deployment did not return one deployment record.' }
    $deploymentRecord = $recordLine[0].Substring('RECORD '.Length)

    $exact = @(& $InstallerPath -ManifestPath $ManifestPath -TargetSkillsDirectory $target -SurfaceId fixture -Skills $selected)
    if (-not ($exact -match 'PLAN_ONLY .*exact=2')) { throw 'Post-install plan did not report exact parity.' }

    $driftFile = Join-Path $target 'harness-maintainer\DRIFT-TEST.txt'
    Set-Content -LiteralPath $driftFile -Value 'fixture drift' -Encoding utf8
    $driftPlan = @(& $InstallerPath -ManifestPath $ManifestPath -TargetSkillsDirectory $target -SurfaceId fixture -Skills $selected -ExpectedDeploymentRecordPath $deploymentRecord)
    if (-not ($driftPlan -match 'PLAN_ONLY .*unreconciled=1')) { throw 'Unknown local drift was not classified as unreconciled.' }

    $refused = $false
    try {
        & $InstallerPath -ManifestPath $ManifestPath -TargetSkillsDirectory $target -SurfaceId fixture -Skills $selected -ExpectedDeploymentRecordPath $deploymentRecord -Apply | Out-Null
    }
    catch {
        if ($_.Exception.Message -notlike '*Refusing to overwrite unreconciled drift*') { throw }
        $refused = $true
    }
    if (-not $refused) { throw 'Installer overwrote unknown local drift without reconciliation.' }
    if (-not (Test-Path -LiteralPath $driftFile)) { throw 'Refused installation changed the drifted live directory.' }

    $release = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
    $candidate = @($release.skills | Where-Object name -eq 'harness-maintainer')
    if ($candidate.Count -ne 1) { throw 'Release manifest must contain one harness-maintainer record.' }
    $hashRecords = New-Object System.Collections.Generic.List[string]
    $driftDirectory = Get-Item -LiteralPath (Join-Path $target 'harness-maintainer')
    foreach ($file in @(Get-ChildItem -LiteralPath $driftDirectory.FullName -Recurse -File -Force | Sort-Object FullName)) {
        $relative = $file.FullName.Substring($driftDirectory.FullName.Length).TrimStart('\') -replace '\\', '/'
        $hashRecords.Add("$relative`0$((Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash)")
    }
    $payload = [Text.Encoding]::UTF8.GetBytes(($hashRecords -join "`n"))
    $hasher = [Security.Cryptography.SHA256]::Create()
    try { $currentDriftHash = ([BitConverter]::ToString($hasher.ComputeHash($payload))).Replace('-', '') }
    finally { $hasher.Dispose() }

    $reconciliationPath = Join-Path $testRoot 'reconciliation.json'
    [ordered]@{
        schema_version = 1
        surface_id = 'fixture'
        target = [IO.Path]::GetFullPath($target).TrimEnd('\')
        candidate_release_id = $release.release_id
        candidate_source_commit = $release.source_commit
        approved_at_utc = [DateTime]::UtcNow.ToString('o')
        approved_by = 'installer-self-test'
        rationale = 'Prove that an exact, release-bound reconciliation permits only the named fixture replacement.'
        skills = @([ordered]@{
            name = 'harness-maintainer'
            current_sha256 = $currentDriftHash
            candidate_sha256 = $candidate[0].source_skill_sha256
            decision = 'replace-approved'
        })
    } | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $reconciliationPath -Encoding utf8

    $replacement = @(& $InstallerPath -ManifestPath $ManifestPath -TargetSkillsDirectory $target -SurfaceId fixture -Skills $selected -ExpectedDeploymentRecordPath $deploymentRecord -ReconciliationRecordPath $reconciliationPath -Apply)
    if (-not ($replacement -match 'DEPLOYED .*changed=1')) { throw 'Reconciled drift replacement did not change exactly one skill.' }
    if (Test-Path -LiteralPath $driftFile) { throw 'Explicitly reconciled drift was not replaced by the release.' }

    $backupRoot = Join-Path $testRoot 'skills.harness-backups\fixture'
    $preserved = @(Get-ChildItem -LiteralPath $backupRoot -Recurse -File -Filter 'DRIFT-TEST.txt')
    if ($preserved.Count -ne 1) { throw 'The replaced drift fixture was not preserved exactly once in backup.' }

    $final = @(& $InstallerPath -ManifestPath $ManifestPath -TargetSkillsDirectory $target -SurfaceId fixture -Skills $selected)
    if (-not ($final -match 'PLAN_ONLY .*exact=2')) { throw 'Replacement did not restore exact release parity.' }

    Write-Output 'INSTALLER SELF-TEST PASSED: portable root package, leaf preservation, plan-only, add, exact parity, unknown-drift refusal, release-bound reconciliation, replacement, backup preservation.'
}
finally {
    $testFull = [IO.Path]::GetFullPath($testRoot)
    $tempFull = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
    if ($testFull.StartsWith($tempFull, [StringComparison]::OrdinalIgnoreCase) -and
        [IO.Path]::GetFileName($testFull).StartsWith('ai-harness-installer-test-', [StringComparison]::Ordinal)) {
        if (Test-Path -LiteralPath $testFull) { Remove-Item -LiteralPath $testFull -Recurse -Force }
    }
}
