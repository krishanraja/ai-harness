param(
    [string]$Root = (Split-Path -Parent $PSScriptRoot),
    [string]$OutputDirectory = (Join-Path (Split-Path -Parent $PSScriptRoot) 'dist'),
    [string]$ReleaseId = 'preview',
    [switch]$AllowDirtyPreview
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$script:ArtifactHashAlgorithm = 'sha256-path-nul-file-sha256-ordinal-v1'

function Get-OrdinalSortedStrings {
    param([string[]]$Values)

    $copy = [string[]]@($Values)
    [Array]::Sort($copy, [StringComparer]::Ordinal)
    return $copy
}

function Get-OrdinalSortedFiles {
    param(
        [string]$DirectoryPath,
        [switch]$Force
    )

    $items = $(if ($Force) {
        Get-ChildItem -LiteralPath $DirectoryPath -Recurse -File -Force
    } else {
        Get-ChildItem -LiteralPath $DirectoryPath -Recurse -File
    })
    $paths = [string[]]@($items | ForEach-Object FullName)
    [Array]::Sort($paths, [StringComparer]::Ordinal)
    return @($paths | ForEach-Object { Get-Item -LiteralPath $_ -Force })
}

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
            $files = @(Get-OrdinalSortedFiles -DirectoryPath $SkillDirectory.FullName)
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
    $files = @(Get-OrdinalSortedFiles -DirectoryPath $Directory.FullName -Force)
    foreach ($file in $files) {
        $relative = $file.FullName.Substring($Directory.FullName.Length).TrimStart('\') -replace '\\', '/'
        $fileHash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
        $records.Add("$relative`0$fileHash")
    }

    $payload = [Text.Encoding]::UTF8.GetBytes(((Get-OrdinalSortedStrings -Values $records.ToArray()) -join "`n"))
    $hasher = [Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($hasher.ComputeHash($payload))).Replace('-', '') }
    finally { $hasher.Dispose() }
}

$records = New-Object System.Collections.Generic.List[object]
$skillsRoot = Join-Path $Root 'skills'
$skillDirectoryByName = @{}
foreach ($directory in @(Get-ChildItem -LiteralPath $skillsRoot -Directory | Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') })) {
    $skillDirectoryByName[$directory.Name] = $directory
}
$skillDirectories = @((Get-OrdinalSortedStrings -Values ([string[]]@($skillDirectoryByName.Keys))) | ForEach-Object { $skillDirectoryByName[$_] })

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
        artifact_hash_algorithm = $ArtifactHashAlgorithm
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
    schema_version = 4
    release_id = $ReleaseId
    artifact_hash_algorithm = $ArtifactHashAlgorithm
    source_commit = $commit
    working_tree = $treeState
    built_at_utc = [DateTime]::UtcNow.ToString('o')
    validation = 'passed'
    skills = $records
}

$releasePath = Join-Path $OutputDirectory ('release-' + $ReleaseId + '.json')
$releaseJson = $release | ConvertTo-Json -Depth 5
[IO.File]::WriteAllText($releasePath, $releaseJson + "`n", [Text.UTF8Encoding]::new($false))
Write-Output "BUILT $($records.Count) skill records and $($records.Count * 2) deterministic transport artifacts"
Write-Output "SOURCE $commit ($treeState)"
Write-Output "MANIFEST $releasePath"
