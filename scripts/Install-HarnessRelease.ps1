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
    [string]$ExpectedDeploymentRecordPath,
    [string]$ReconciliationRecordPath,
    [string[]]$Skills = @(),
    [switch]$Apply
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
    param([string]$DirectoryPath)

    $paths = [string[]]@(Get-ChildItem -LiteralPath $DirectoryPath -Recurse -File -Force | ForEach-Object FullName)
    [Array]::Sort($paths, [StringComparer]::Ordinal)
    return @($paths | ForEach-Object { Get-Item -LiteralPath $_ -Force })
}

function Get-DirectoryArtifactSha256 {
    param([IO.DirectoryInfo]$Directory)

    $records = New-Object System.Collections.Generic.List[string]
    $files = @(Get-OrdinalSortedFiles -DirectoryPath $Directory.FullName)
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
if ($release.artifact_hash_algorithm -ne $ArtifactHashAlgorithm) {
    throw "Unsupported or missing release artifact hash algorithm: $($release.artifact_hash_algorithm)"
}
foreach ($skill in @($release.skills)) {
    if ($skill.artifact_hash_algorithm -ne $ArtifactHashAlgorithm) {
        throw "Skill $($skill.name) does not name the required artifact hash algorithm."
    }
}

if (-not $ArtifactsDirectory) { $ArtifactsDirectory = Split-Path -Parent $manifestFull }
$artifactsFull = [IO.Path]::GetFullPath($ArtifactsDirectory)
$targetFull = [IO.Path]::GetFullPath($TargetSkillsDirectory).TrimEnd('\')
if ([IO.Path]::GetFileName($targetFull) -ne 'skills') { throw 'TargetSkillsDirectory must resolve to a directory named skills.' }
if (-not $BackupRoot) { $BackupRoot = Join-Path (Split-Path -Parent $targetFull) 'skills.harness-backups' }
$backupFull = [IO.Path]::GetFullPath($BackupRoot)

$baselineHashes = @{}
if ($ExpectedDeploymentRecordPath) {
    $expectedRecordFull = [IO.Path]::GetFullPath($ExpectedDeploymentRecordPath)
    if (-not (Test-Path -LiteralPath $expectedRecordFull -PathType Leaf)) {
        throw "Expected deployment record not found: $expectedRecordFull"
    }
    $expectedRecord = Get-Content -LiteralPath $expectedRecordFull -Raw | ConvertFrom-Json
    if ($expectedRecord.artifact_hash_algorithm -and $expectedRecord.artifact_hash_algorithm -ne $ArtifactHashAlgorithm) {
        throw 'Expected deployment record uses a different artifact hash algorithm.'
    }
    if ($expectedRecord.surface_id -ne $SurfaceId) {
        throw "Expected deployment record surface '$($expectedRecord.surface_id)' does not match '$SurfaceId'."
    }
    if ([IO.Path]::GetFullPath([string]$expectedRecord.target).TrimEnd('\') -ne $targetFull) {
        throw 'Expected deployment record target does not match TargetSkillsDirectory.'
    }
    foreach ($entry in @($expectedRecord.skills)) {
        if (-not $entry.name -or [string]$entry.installed_sha256 -notmatch '^[A-Fa-f0-9]{64}$') {
            throw 'Expected deployment record contains an invalid skill hash entry.'
        }
        if ($baselineHashes.ContainsKey([string]$entry.name)) {
            throw "Expected deployment record contains duplicate skill '$($entry.name)'."
        }
        $baselineHashes[[string]$entry.name] = ([string]$entry.installed_sha256).ToUpperInvariant()
    }
}

$reconciledDrift = @{}
if ($ReconciliationRecordPath) {
    $reconciliationFull = [IO.Path]::GetFullPath($ReconciliationRecordPath)
    if (-not (Test-Path -LiteralPath $reconciliationFull -PathType Leaf)) {
        throw "Reconciliation record not found: $reconciliationFull"
    }
    $reconciliation = Get-Content -LiteralPath $reconciliationFull -Raw | ConvertFrom-Json
    if ($reconciliation.artifact_hash_algorithm -and $reconciliation.artifact_hash_algorithm -ne $ArtifactHashAlgorithm) {
        throw 'Reconciliation record uses a different artifact hash algorithm.'
    }
    if ($reconciliation.schema_version -ne 1 -or $reconciliation.surface_id -ne $SurfaceId) {
        throw 'Reconciliation record schema or surface does not match this installation.'
    }
    if ([IO.Path]::GetFullPath([string]$reconciliation.target).TrimEnd('\') -ne $targetFull) {
        throw 'Reconciliation record target does not match TargetSkillsDirectory.'
    }
    if ($reconciliation.candidate_release_id -ne $release.release_id -or
        $reconciliation.candidate_source_commit -ne $release.source_commit) {
        throw 'Reconciliation record is not bound to this candidate release and source commit.'
    }
    $approvalTime = [DateTime]::MinValue
    if ([string]::IsNullOrWhiteSpace([string]$reconciliation.approved_by) -or
        [string]::IsNullOrWhiteSpace([string]$reconciliation.rationale) -or
        -not [DateTime]::TryParse([string]$reconciliation.approved_at_utc, [ref]$approvalTime)) {
        throw 'Reconciliation record must name the approver, rationale, and a valid approval timestamp.'
    }
    foreach ($entry in @($reconciliation.skills)) {
        if (-not $entry.name -or
            [string]$entry.current_sha256 -notmatch '^[A-Fa-f0-9]{64}$' -or
            [string]$entry.candidate_sha256 -notmatch '^[A-Fa-f0-9]{64}$' -or
            [string]$entry.decision -notin @('promote-to-canonical', 'merge-into-canonical', 'retire-local-drift', 'replace-approved')) {
            throw 'Reconciliation record contains an invalid skill decision.'
        }
        if ($reconciledDrift.ContainsKey([string]$entry.name)) {
            throw "Reconciliation record contains duplicate skill '$($entry.name)'."
        }
        $reconciledDrift[[string]$entry.name] = $entry
    }
}

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
            if ($installedHash -eq $skill.source_skill_sha256) {
                $relation = 'exact'
            }
            elseif ($baselineHashes.ContainsKey([string]$skill.name) -and
                $installedHash -eq $baselineHashes[[string]$skill.name]) {
                $relation = 'replace-known-baseline'
            }
            elseif ($reconciledDrift.ContainsKey([string]$skill.name)) {
                $decision = $reconciledDrift[[string]$skill.name]
                if ($installedHash -eq ([string]$decision.current_sha256).ToUpperInvariant() -and
                    [string]$skill.source_skill_sha256 -eq ([string]$decision.candidate_sha256).ToUpperInvariant()) {
                    $relation = 'replace-reconciled'
                }
                else {
                    $relation = 'unreconciled-drift'
                }
            }
            else {
                $relation = 'unreconciled-drift'
            }
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
        Write-Output "PLAN_ONLY surface=$SurfaceId release=$($release.release_id) exact=$(@($plan | Where-Object relation -eq 'exact').Count) replace_known=$(@($plan | Where-Object relation -eq 'replace-known-baseline').Count) replace_reconciled=$(@($plan | Where-Object relation -eq 'replace-reconciled').Count) unreconciled=$(@($plan | Where-Object relation -eq 'unreconciled-drift').Count) add=$(@($plan | Where-Object relation -eq 'missing').Count)"
        return
    }

    $unreconciled = @($plan | Where-Object relation -eq 'unreconciled-drift')
    if ($unreconciled.Count -gt 0) {
        throw "Refusing to overwrite unreconciled drift on surface '$SurfaceId': $($unreconciled.name -join ', '). Promote, merge, or retire each source explicitly and supply a release-bound reconciliation record."
    }

    New-Item -ItemType Directory -Force -Path $targetFull | Out-Null
    $releaseBackup = Join-Path (Join-Path $backupFull $SurfaceId) ("$($release.release_id)-$sessionId")
    New-Item -ItemType Directory -Force -Path $releaseBackup | Out-Null

    foreach ($item in ($plan | Where-Object relation -ne 'exact')) {
        $backup = $null
        if ($item.relation -like 'replace-*') {
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
        artifact_hash_algorithm = $ArtifactHashAlgorithm
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
