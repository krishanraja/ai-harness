param(
    [string]$Root = (Split-Path -Parent $PSScriptRoot),
    [string]$OutputDirectory = (Join-Path (Split-Path -Parent $PSScriptRoot) 'dist'),
    [string]$ReleaseId = 'preview'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$validator = Join-Path $PSScriptRoot 'Test-Harness.ps1'
& $validator -Root $Root
if (-not $?) { throw 'Harness validation failed; no release was built.' }

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

function New-DeterministicSkillArchive {
    param(
        [IO.DirectoryInfo]$SkillDirectory,
        [string]$Destination
    )

    $destinationFull = [IO.Path]::GetFullPath($Destination)
    $stream = [IO.File]::Open($destinationFull, [IO.FileMode]::Create, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    try {
        $archive = New-Object IO.Compression.ZipArchive($stream, [IO.Compression.ZipArchiveMode]::Create, $false)
        try {
            $files = @(Get-ChildItem -LiteralPath $SkillDirectory.FullName -Recurse -File | Sort-Object FullName)
            foreach ($file in $files) {
                $relative = $file.FullName.Substring($SkillDirectory.FullName.Length).TrimStart('\') -replace '\\', '/'
                $entryName = $SkillDirectory.Name + '/' + $relative
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

$commit = 'UNCOMMITTED'
try {
    $candidate = (& git -C $Root rev-parse HEAD 2>$null)
    if ($LASTEXITCODE -eq 0 -and $candidate) { $commit = $candidate.Trim() }
} catch {}

$records = New-Object System.Collections.Generic.List[object]
$skillsRoot = Join-Path $Root 'skills'
$skillDirectories = @(Get-ChildItem -LiteralPath $skillsRoot -Directory | Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') } | Sort-Object Name)

foreach ($skill in $skillDirectories) {
    $artifact = Join-Path $OutputDirectory ($skill.Name + '-' + $ReleaseId + '.skill')
    New-DeterministicSkillArchive -SkillDirectory $skill -Destination $artifact
    $manifest = Join-Path $skill.FullName 'SKILL.md'
    $records.Add([pscustomobject]@{
        name = $skill.Name
        release_id = $ReleaseId
        source_commit = $commit
        source_skill_sha256 = (Get-FileHash -LiteralPath $manifest -Algorithm SHA256).Hash
        artifact = [IO.Path]::GetFileName($artifact)
        artifact_sha256 = (Get-FileHash -LiteralPath $artifact -Algorithm SHA256).Hash
        bytes = (Get-Item -LiteralPath $artifact).Length
    })
}

$release = [ordered]@{
    schema_version = 1
    release_id = $ReleaseId
    source_commit = $commit
    built_at_utc = [DateTime]::UtcNow.ToString('o')
    validation = 'passed'
    skills = $records
}

$releasePath = Join-Path $OutputDirectory ('release-' + $ReleaseId + '.json')
$release | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $releasePath -Encoding UTF8
Write-Output "BUILT $($records.Count) deterministic skill artifacts"
Write-Output "MANIFEST $releasePath"
