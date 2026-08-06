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

    Write-Output 'INSTALLER SELF-TEST PASSED: portable root package, leaf preservation, plan-only, add, exact parity, replacement, backup preservation.'
}
finally {
    $testFull = [IO.Path]::GetFullPath($testRoot)
    $tempFull = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
    if ($testFull.StartsWith($tempFull, [StringComparison]::OrdinalIgnoreCase) -and
        [IO.Path]::GetFileName($testFull).StartsWith('ai-harness-installer-test-', [StringComparison]::Ordinal)) {
        if (Test-Path -LiteralPath $testFull) { Remove-Item -LiteralPath $testFull -Recurse -Force }
    }
}
