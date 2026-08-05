[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ManifestPath,

    [Parameter(Mandatory = $true)]
    [string]$TargetSkillsDirectory,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z0-9][a-z0-9-]*$')]
    [string]$SurfaceId,

    [string]$ArtifactsDirectory,
    [string]$BackupRoot,
    [string[]]$Skills = @(),
    [switch]$Apply
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

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

function Expand-VerifiedSkillArchive {
    param(
        [IO.FileInfo]$ArchiveFile,
        [string]$SkillName,
        [string]$DestinationRoot
    )

    $archive = [IO.Compression.ZipFile]::OpenRead($ArchiveFile.FullName)
    try {
        $seen = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
        foreach ($entry in $archive.Entries) {
            if (-not $entry.Name) { continue }
            $path = $entry.FullName.Replace('\', '/').TrimStart('/')
            $parts = @($path.Split('/'))
            if ($entry.FullName.StartsWith('/') -or
                $entry.FullName.StartsWith('\') -or
                $path -match '^[A-Za-z]:' -or
                $parts -contains '..' -or
                $parts -contains '' -or
                -not $path.StartsWith("$SkillName/", [StringComparison]::Ordinal)) {
                throw "Unsafe or unexpected archive path '$($entry.FullName)' in $($ArchiveFile.Name)."
            }
            if (-not $seen.Add($path)) { throw "Duplicate archive path '$path' in $($ArchiveFile.Name)." }

            $relative = $path.Substring($SkillName.Length + 1).Replace('/', [IO.Path]::DirectorySeparatorChar)
            $destination = Join-Path (Join-Path $DestinationRoot $SkillName) $relative
            $destinationFull = [IO.Path]::GetFullPath($destination)
            $skillRootFull = [IO.Path]::GetFullPath((Join-Path $DestinationRoot $SkillName)) + [IO.Path]::DirectorySeparatorChar
            if (-not $destinationFull.StartsWith($skillRootFull, [StringComparison]::OrdinalIgnoreCase)) {
                throw "Archive path escaped the staging directory: $path"
            }

            $parent = Split-Path -Parent $destinationFull
            New-Item -ItemType Directory -Force -Path $parent | Out-Null
            $input = $entry.Open()
            $output = [IO.File]::Open($destinationFull, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
            try { $input.CopyTo($output) }
            finally { $input.Dispose(); $output.Dispose() }
        }
    }
    finally { $archive.Dispose() }

    $skillDirectory = Get-Item -LiteralPath (Join-Path $DestinationRoot $SkillName)
    if (-not (Test-Path -LiteralPath (Join-Path $skillDirectory.FullName 'SKILL.md') -PathType Leaf)) {
        throw "$($ArchiveFile.Name) does not contain $SkillName/SKILL.md."
    }
    return $skillDirectory
}

$manifestFull = [IO.Path]::GetFullPath($ManifestPath)
if (-not (Test-Path -LiteralPath $manifestFull -PathType Leaf)) { throw "Manifest not found: $manifestFull" }
$release = Get-Content -LiteralPath $manifestFull -Raw | ConvertFrom-Json
if ($release.validation -ne 'passed' -or $release.working_tree -ne 'clean') {
    throw 'Only a validated release built from a clean working tree may be installed.'
}
if (-not $release.release_id -or -not $release.source_commit -or -not $release.skills) {
    throw 'Release manifest is missing required identity fields.'
}

if (-not $ArtifactsDirectory) { $ArtifactsDirectory = Split-Path -Parent $manifestFull }
$artifactsFull = [IO.Path]::GetFullPath($ArtifactsDirectory)
$targetFull = [IO.Path]::GetFullPath($TargetSkillsDirectory).TrimEnd('\')
if ([IO.Path]::GetFileName($targetFull) -ne 'skills') { throw 'TargetSkillsDirectory must resolve to a directory named skills.' }
if (-not $BackupRoot) { $BackupRoot = Join-Path (Split-Path -Parent $targetFull) 'skills.harness-backups' }
$backupFull = [IO.Path]::GetFullPath($BackupRoot)

$manifestSkills = @($release.skills)
if ($Skills.Count -gt 0) {
    $unknown = @($Skills | Where-Object { $_ -notin $manifestSkills.name })
    if ($unknown.Count -gt 0) { throw "Skills absent from release manifest: $($unknown -join ', ')" }
    $manifestSkills = @($manifestSkills | Where-Object name -in $Skills)
}
if ($manifestSkills.Count -eq 0) { throw 'No skills selected.' }

$sessionId = ([DateTime]::UtcNow.ToString('yyyyMMddTHHmmssZ') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 8))
$stagingRoot = Join-Path ([IO.Path]::GetTempPath()) "ai-harness-stage-$sessionId"
New-Item -ItemType Directory -Path $stagingRoot | Out-Null
$plan = New-Object System.Collections.Generic.List[object]
$deployed = New-Object System.Collections.Generic.List[object]

try {
    foreach ($skill in ($manifestSkills | Sort-Object name)) {
        if ($skill.name -notmatch '^[a-z0-9][a-z0-9-]*$') { throw "Unsafe skill name in manifest: $($skill.name)" }
        $archivePath = Join-Path $artifactsFull $skill.artifact
        if (-not (Test-Path -LiteralPath $archivePath -PathType Leaf)) { throw "Artifact not found: $archivePath" }
        $archiveFile = Get-Item -LiteralPath $archivePath
        $packageHash = (Get-FileHash -LiteralPath $archiveFile.FullName -Algorithm SHA256).Hash
        if ($packageHash -ne $skill.artifact_sha256) { throw "Package hash mismatch for $($skill.name)." }

        $stagedDirectory = Expand-VerifiedSkillArchive -ArchiveFile $archiveFile -SkillName $skill.name -DestinationRoot $stagingRoot
        $stagedHash = Get-DirectoryArtifactSha256 -Directory $stagedDirectory
        if ($stagedHash -ne $skill.source_skill_sha256) { throw "Extracted source hash mismatch for $($skill.name)." }

        $target = Join-Path $targetFull $skill.name
        $relation = 'missing'
        $installedHash = $null
        if (Test-Path -LiteralPath $target) {
            $targetItem = Get-Item -LiteralPath $target -Force
            if (-not $targetItem.PSIsContainer) { throw "Target exists but is not a directory: $target" }
            if ($targetItem.Attributes -band [IO.FileAttributes]::ReparsePoint) {
                throw "Refusing to replace reparse-point target without a separate migration: $target"
            }
            $installedHash = Get-DirectoryArtifactSha256 -Directory $targetItem
            $relation = $(if ($installedHash -eq $skill.source_skill_sha256) { 'exact' } else { 'replace' })
        }

        $plan.Add([pscustomobject][ordered]@{
            name = $skill.name
            relation = $relation
            target = $target
            installed_sha256 = $installedHash
            release_sha256 = $skill.source_skill_sha256
            package_sha256 = $skill.artifact_sha256
            staged_path = $stagedDirectory.FullName
        })
    }

    foreach ($item in $plan) {
        Write-Output ("PLAN {0}: {1}" -f $item.name, $item.relation)
    }

    if (-not $Apply) {
        Write-Output "PLAN_ONLY surface=$SurfaceId release=$($release.release_id) exact=$(@($plan | Where-Object relation -eq 'exact').Count) replace=$(@($plan | Where-Object relation -eq 'replace').Count) add=$(@($plan | Where-Object relation -eq 'missing').Count)"
        return
    }

    New-Item -ItemType Directory -Force -Path $targetFull | Out-Null
    $releaseBackup = Join-Path (Join-Path $backupFull $SurfaceId) ("$($release.release_id)-$sessionId")
    New-Item -ItemType Directory -Force -Path $releaseBackup | Out-Null

    foreach ($item in ($plan | Where-Object relation -ne 'exact')) {
        $backup = $null
        if ($item.relation -eq 'replace') {
            $backup = Join-Path $releaseBackup $item.name
            Move-Item -LiteralPath $item.target -Destination $backup
        }

        try {
            Move-Item -LiteralPath $item.staged_path -Destination $item.target
            $verified = Get-DirectoryArtifactSha256 -Directory (Get-Item -LiteralPath $item.target)
            if ($verified -ne $item.release_sha256) { throw "Post-install hash mismatch for $($item.name)." }
            $deployed.Add([pscustomobject]@{ name = $item.name; target = $item.target; backup = $backup; sha256 = $verified })
            Write-Output "INSTALLED $($item.name) $verified"
        }
        catch {
            if (Test-Path -LiteralPath $item.target) { Remove-Item -LiteralPath $item.target -Recurse -Force }
            if ($backup -and (Test-Path -LiteralPath $backup)) { Move-Item -LiteralPath $backup -Destination $item.target }
            throw
        }
    }

    $record = [ordered]@{
        schema_version = 1
        surface_id = $SurfaceId
        target = $targetFull
        release_id = $release.release_id
        source_commit = $release.source_commit
        deployed_at_utc = [DateTime]::UtcNow.ToString('o')
        backup_directory = $releaseBackup
        result = 'installed-and-hash-verified'
        skills = @($plan | ForEach-Object {
            [ordered]@{
                name = $_.name
                action = $_.relation
                installed_sha256 = $_.release_sha256
                package_sha256 = $_.package_sha256
            }
        })
    }
    $recordPath = Join-Path $releaseBackup 'deployment-record.json'
    $record | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $recordPath -Encoding utf8
    Write-Output "DEPLOYED surface=$SurfaceId release=$($release.release_id) changed=$($deployed.Count) exact=$(@($plan | Where-Object relation -eq 'exact').Count)"
    Write-Output "RECORD $recordPath"
}
catch {
    if ($Apply -and $deployed.Count -gt 0) {
        $rollbackItems = @($deployed.ToArray())
        [array]::Reverse($rollbackItems)
        foreach ($item in $rollbackItems) {
            if (Test-Path -LiteralPath $item.target) { Remove-Item -LiteralPath $item.target -Recurse -Force }
            if ($item.backup -and (Test-Path -LiteralPath $item.backup)) { Move-Item -LiteralPath $item.backup -Destination $item.target }
        }
    }
    throw
}
finally {
    $stagingFull = [IO.Path]::GetFullPath($stagingRoot)
    $tempFull = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
    if ($stagingFull.StartsWith($tempFull, [StringComparison]::OrdinalIgnoreCase) -and
        [IO.Path]::GetFileName($stagingFull).StartsWith('ai-harness-stage-', [StringComparison]::Ordinal)) {
        if (Test-Path -LiteralPath $stagingFull) { Remove-Item -LiteralPath $stagingFull -Recurse -Force }
    }
}
