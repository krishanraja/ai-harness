param(
    [string]$Root = (Split-Path -Parent $PSScriptRoot),
    [string]$OutputDirectory = (Join-Path (Split-Path -Parent $PSScriptRoot) 'dist'),
    [string]$ReleaseId = 'preview',
    [switch]$AllowDirtyPreview
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if ($ReleaseId -notmatch '^[A-Za-z0-9][A-Za-z0-9._-]*$') {
    throw 'ReleaseId must start with an alphanumeric character and contain only alphanumerics, dots, underscores, or hyphens.'
}

$commit = (& git -C $Root rev-parse HEAD 2>$null)
if ($LASTEXITCODE -ne 0 -or -not $commit) { throw 'Release builds require a Git commit.' }
$commit = $commit.Trim()

$workingTreeChanges = @(& git -C $Root status --porcelain --untracked-files=all 2>$null)
if ($LASTEXITCODE -ne 0) { throw 'Could not verify the Git working tree.' }
$treeState = $(if ($workingTreeChanges.Count -eq 0) { 'clean' } else { 'dirty-preview' })
if ($treeState -ne 'clean' -and -not $AllowDirtyPreview) {
    throw 'Release builds require a clean working tree. Commit or remove staged, modified, and untracked files; use -AllowDirtyPreview only for non-release tooling tests.'
}

$validator = Join-Path $PSScriptRoot 'Test-Harness.ps1'
& $validator -Root $Root
if (-not $?) { throw 'Harness validation failed; no release was built.' }

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

function New-DeterministicSkillArchive {
    param(
        [IO.DirectoryInfo]$SkillDirectory,
        [string]$Destination,
        [switch]$FilesAtArchiveRoot
    )

    $destinationFull = [IO.Path]::GetFullPath($Destination)
    $stream = [IO.File]::Open($destinationFull, [IO.FileMode]::Create, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    try {
        $archive = New-Object IO.Compression.ZipArchive($stream, [IO.Compression.ZipArchiveMode]::Create, $false)
        try {
            $files = @(Get-ChildItem -LiteralPath $SkillDirectory.FullName -Recurse -File | Sort-Object FullName)
            foreach ($file in $files) {
                $relative = $file.FullName.Substring($SkillDirectory.FullName.Length).TrimStart('\') -replace '\\', '/'
                $entryName = $(if ($FilesAtArchiveRoot) { $relative } else { $SkillDirectory.Name + '/' + $relative })
                $entry = $archive.CreateEntry($entryName, [IO.Compression.CompressionLevel]::Optimal)
                $entry.LastWriteTime = [DateTimeOffset]::new(1980, 1, 1, 0, 0, 0, [TimeSpan]::Zero)
                $entryStream = $entry.Open()
                $sourceStream = [IO.File]::OpenRead($file.FullName)
                try { $sourceStream.CopyTo($entryStream) }
                finally { $sourceStream.Dispose(); $entryStream.Dispose() }
            }
        }
        finally { $archive.Dispose() }
    }
    finally { $stream.Dispose() }
}

function Get-DirectoryArtifactSha256 {
    param([IO.DirectoryInfo]$Directory)

    $records = New-Object System.Collections.Generic.List[string]
    $files = @(Get-ChildItem -LiteralPath $Directory.FullName -Recurse -File -Force | Sort-Object FullName)
    foreach ($file in $files) {
        $relative = $file.FullName.Substring($Directory.FullName.Length).TrimStart('\') -replace '\\', '/'
        $fileHash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
        $records.Add("$relative`0$fileHash")
    }

    $payload = [Text.Encoding]::UTF8.GetBytes(($records -join "`n"))
    $hasher = [Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($hasher.ComputeHash($payload))).Replace('-', '') }
    finally { $hasher.Dispose() }
}

$records = New-Object System.Collections.Generic.List[object]
$skillsRoot = Join-Path $Root 'skills'
$skillDirectories = @(Get-ChildItem -LiteralPath $skillsRoot -Directory | Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') } | Sort-Object Name)

foreach ($skill in $skillDirectories) {
    $artifact = Join-Path $OutputDirectory ($skill.Name + '-' + $ReleaseId + '.skill')
    $perplexityArtifact = Join-Path $OutputDirectory ($skill.Name + '-' + $ReleaseId + '-perplexity.zip')
    New-DeterministicSkillArchive -SkillDirectory $skill -Destination $artifact
    New-DeterministicSkillArchive -SkillDirectory $skill -Destination $perplexityArtifact -FilesAtArchiveRoot
    $manifest = Join-Path $skill.FullName 'SKILL.md'
    $records.Add([pscustomobject]@{
        name = $skill.Name
        release_id = $ReleaseId
        source_commit = $commit
        source_skill_sha256 = Get-DirectoryArtifactSha256 -Directory $skill
        source_manifest_sha256 = (Get-FileHash -LiteralPath $manifest -Algorithm SHA256).Hash
        artifact = [IO.Path]::GetFileName($artifact)
        artifact_sha256 = (Get-FileHash -LiteralPath $artifact -Algorithm SHA256).Hash
        bytes = (Get-Item -LiteralPath $artifact).Length
        perplexity_artifact = [IO.Path]::GetFileName($perplexityArtifact)
        perplexity_artifact_sha256 = (Get-FileHash -LiteralPath $perplexityArtifact -Algorithm SHA256).Hash
        perplexity_bytes = (Get-Item -LiteralPath $perplexityArtifact).Length
    })
}

$release = [ordered]@{
    schema_version = 3
    release_id = $ReleaseId
    source_commit = $commit
    working_tree = $treeState
    built_at_utc = [DateTime]::UtcNow.ToString('o')
    validation = 'passed'
    skills = $records
}

$releasePath = Join-Path $OutputDirectory ('release-' + $ReleaseId + '.json')
$release | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $releasePath -Encoding UTF8
Write-Output "BUILT $($records.Count) skill records and $($records.Count * 2) deterministic transport artifacts"
Write-Output "SOURCE $commit ($treeState)"
Write-Output "MANIFEST $releasePath"
