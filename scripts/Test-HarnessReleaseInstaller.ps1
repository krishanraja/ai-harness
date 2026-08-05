param(
    [Parameter(Mandatory = $true)]
    [string]$ManifestPath,

    [string]$InstallerPath
)

$ErrorActionPreference = 'Stop'
if (-not $InstallerPath) { $InstallerPath = Join-Path $PSScriptRoot 'Install-HarnessRelease.ps1' }
$testId = [Guid]::NewGuid().ToString('N')
$testRoot = Join-Path ([IO.Path]::GetTempPath()) "ai-harness-installer-test-$testId"
$target = Join-Path $testRoot 'skills'
$selected = @('harness-maintainer', 'take-the-brief')

try {
    $plan = @(& $InstallerPath -ManifestPath $ManifestPath -TargetSkillsDirectory $target -SurfaceId fixture -Skills $selected)
    if (Test-Path -LiteralPath $target) { throw 'Plan-only mode created the target directory.' }
    if (-not ($plan -match 'PLAN_ONLY .*add=2')) { throw 'Plan-only mode did not report two missing skills.' }

    $install = @(& $InstallerPath -ManifestPath $ManifestPath -TargetSkillsDirectory $target -SurfaceId fixture -Skills $selected -Apply)
    if (-not ($install -match 'DEPLOYED .*changed=2')) { throw 'Initial fixture deployment did not change two skills.' }

    $exact = @(& $InstallerPath -ManifestPath $ManifestPath -TargetSkillsDirectory $target -SurfaceId fixture -Skills $selected)
    if (-not ($exact -match 'PLAN_ONLY .*exact=2')) { throw 'Post-install plan did not report exact parity.' }

    $driftFile = Join-Path $target 'harness-maintainer\DRIFT-TEST.txt'
    Set-Content -LiteralPath $driftFile -Value 'fixture drift' -Encoding utf8
    $replacement = @(& $InstallerPath -ManifestPath $ManifestPath -TargetSkillsDirectory $target -SurfaceId fixture -Skills $selected -Apply)
    if (-not ($replacement -match 'DEPLOYED .*changed=1')) { throw 'Drift replacement did not change exactly one skill.' }
    if (Test-Path -LiteralPath $driftFile) { throw 'Drifted live directory was not replaced by the release.' }

    $backupRoot = Join-Path $testRoot 'skills.harness-backups\fixture'
    $preserved = @(Get-ChildItem -LiteralPath $backupRoot -Recurse -File -Filter 'DRIFT-TEST.txt')
    if ($preserved.Count -ne 1) { throw 'The replaced drift fixture was not preserved exactly once in backup.' }

    $final = @(& $InstallerPath -ManifestPath $ManifestPath -TargetSkillsDirectory $target -SurfaceId fixture -Skills $selected)
    if (-not ($final -match 'PLAN_ONLY .*exact=2')) { throw 'Replacement did not restore exact release parity.' }

    Write-Output 'INSTALLER SELF-TEST PASSED: plan-only, add, exact parity, replacement, backup preservation.'
}
finally {
    $testFull = [IO.Path]::GetFullPath($testRoot)
    $tempFull = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
    if ($testFull.StartsWith($tempFull, [StringComparison]::OrdinalIgnoreCase) -and
        [IO.Path]::GetFileName($testFull).StartsWith('ai-harness-installer-test-', [StringComparison]::Ordinal)) {
        if (Test-Path -LiteralPath $testFull) { Remove-Item -LiteralPath $testFull -Recurse -Force }
    }
}
