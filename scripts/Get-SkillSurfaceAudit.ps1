param(
    [string]$Root = (Split-Path -Parent $PSScriptRoot),
    [string]$OutputPath = (Join-Path (Split-Path -Parent $PSScriptRoot) 'state\surface-audit-2026-08-05.json')
)

$ErrorActionPreference = 'Stop'
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

$surfaceDefinitions = @(
    [ordered]@{ id = 'cursor-primary'; client = 'cursor'; path = 'C:\Users\krish\.cursor\skills'; ownership = 'user-managed' },
    [ordered]@{ id = 'cursor-secondary'; client = 'cursor'; path = 'C:\Users\krish\.cursor\skills-cursor'; ownership = 'user-managed' },
    [ordered]@{ id = 'claude-user'; client = 'claude-desktop-code'; path = 'C:\Users\krish\.claude\skills'; ownership = 'mixed-local-and-junctions' },
    [ordered]@{ id = 'codex-user'; client = 'codex'; path = 'C:\Users\krish\.codex\skills'; ownership = 'user-managed' },
    [ordered]@{ id = 'agents-shared'; client = 'shared'; path = 'C:\Users\krish\.agents\skills'; ownership = 'shared-user-library' }
)

function Get-Sha256ForBytes {
    param([byte[]]$Bytes)

    $hasher = [Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($hasher.ComputeHash($Bytes))).Replace('-', '') }
    finally { $hasher.Dispose() }
}

function Get-ArtifactSha256FromRecords {
    param([string[]]$Records)

    $payload = [Text.Encoding]::UTF8.GetBytes(((Get-OrdinalSortedStrings -Values $Records) -join "`n"))
    return Get-Sha256ForBytes -Bytes $payload
}

function Get-ManifestSkillName {
    param([string]$ManifestText)

    $match = [regex]::Match($ManifestText, '(?m)^name:\s*(.+?)\s*$')
    if (-not $match.Success) { return $null }
    return $match.Groups[1].Value.Trim().Trim([char[]]@('"', "'"))
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

    return Get-ArtifactSha256FromRecords -Records $records.ToArray()
}

function Get-ActiveSkillRecords {
    param(
        [string]$DirectoryPath,
        [string]$LocalStorage = 'active-local',
        [string]$JunctionStorage = 'active-junction'
    )

    if (-not (Test-Path -LiteralPath $DirectoryPath -PathType Container)) { return @() }

    $records = New-Object System.Collections.Generic.List[object]
    $directories = @(Get-ChildItem -LiteralPath $DirectoryPath -Directory -Force |
        Where-Object { $_.Name -ne '.system' -and (Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') -PathType Leaf) } |
        Sort-Object Name)

    foreach ($directory in $directories) {
        $manifest = Join-Path $directory.FullName 'SKILL.md'
        $manifestText = [IO.File]::ReadAllText($manifest)
        $isJunction = [bool]($directory.Attributes -band [IO.FileAttributes]::ReparsePoint)
        $skillName = Get-ManifestSkillName -ManifestText $manifestText
        $records.Add([ordered]@{
            artifact_id = "directory:$($directory.FullName)"
            name = $skillName
            folder_name = $directory.Name
            manifest_sha256 = (Get-FileHash -LiteralPath $manifest -Algorithm SHA256).Hash
            artifact_hash_algorithm = $ArtifactHashAlgorithm
            artifact_sha256 = Get-DirectoryArtifactSha256 -Directory $directory
            last_write_utc = $directory.LastWriteTimeUtc.ToString('o')
            storage = $(if ($isJunction) { $JunctionStorage } else { $LocalStorage })
            valid = [bool]$skillName
            error = $(if ($skillName) { $null } else { 'SKILL.md has no parseable name field.' })
        })
    }
    return $records.ToArray()
}

function Get-ArchiveSkillRecord {
    param(
        [IO.FileInfo]$ArchiveFile,
        [string]$Storage
    )

    $base = [ordered]@{
        artifact_id = "archive:$($ArchiveFile.FullName)"
        name = $null
        folder_name = $null
        manifest_sha256 = $null
        artifact_hash_algorithm = $ArtifactHashAlgorithm
        artifact_sha256 = $null
        last_write_utc = $ArchiveFile.LastWriteTimeUtc.ToString('o')
        storage = $Storage
        valid = $false
        error = $null
        archive_path = $ArchiveFile.FullName
        package_root_stripped = $null
    }

    $archive = $null
    try {
        $archive = [IO.Compression.ZipFile]::OpenRead($ArchiveFile.FullName)
        $entries = @($archive.Entries |
            Where-Object { $_.Name -and -not $_.FullName.EndsWith('/') } |
            ForEach-Object {
                [pscustomobject][ordered]@{
                    entry = $_
                    path = $_.FullName.Replace('\', '/').TrimStart('/')
                }
            })

        if ($entries.Count -eq 0) { throw 'Archive contains no files.' }

        $entryPaths = @($entries | ForEach-Object { $_.path })
        $firstSegments = @($entryPaths | ForEach-Object { ($_ -split '/', 2)[0] } | Sort-Object -Unique)
        $stripRoot = $firstSegments.Count -eq 1 -and @($entryPaths | Where-Object { ($_ -split '/').Count -lt 2 }).Count -eq 0
        if ($stripRoot) { $base.package_root_stripped = $firstSegments[0] }

        $files = New-Object System.Collections.Generic.List[object]
        foreach ($item in $entries) {
            $normalizedPath = $item.path
            if ($stripRoot) { $normalizedPath = ($normalizedPath -split '/', 2)[1] }

            $stream = $item.entry.Open()
            $memory = New-Object IO.MemoryStream
            try {
                $stream.CopyTo($memory)
                $bytes = $memory.ToArray()
            }
            finally {
                $memory.Dispose()
                $stream.Dispose()
            }

            $files.Add([pscustomobject][ordered]@{
                path = $normalizedPath
                bytes = $bytes
                sha256 = Get-Sha256ForBytes -Bytes $bytes
            })
        }

        $duplicatePaths = @($files | Group-Object path | Where-Object Count -gt 1)
        if ($duplicatePaths.Count -gt 0) {
            throw "Archive normalizes to duplicate paths: $(@($duplicatePaths.Name) -join ', ')"
        }

        $manifest = @($files | Where-Object { $_.path -ceq 'SKILL.md' })
        if ($manifest.Count -ne 1) { throw 'Archive does not normalize to exactly one root SKILL.md.' }

        $manifestText = [Text.Encoding]::UTF8.GetString($manifest[0].bytes)
        $skillName = Get-ManifestSkillName -ManifestText $manifestText
        if (-not $skillName) { throw 'SKILL.md has no parseable name field.' }

        $artifactRecords = @($files | ForEach-Object { "$($_.path)`0$($_.sha256)" })
        $base.name = $skillName
        $base.manifest_sha256 = $manifest[0].sha256
        $base.artifact_sha256 = Get-ArtifactSha256FromRecords -Records $artifactRecords
        $base.valid = $true
        return $base
    }
    catch {
        $base.error = $_.Exception.Message
        return $base
    }
    finally {
        if ($archive) { $archive.Dispose() }
    }
}

function Get-SurfaceSkillRecords {
    param([string]$DirectoryPath)

    if (-not (Test-Path -LiteralPath $DirectoryPath -PathType Container)) { return @() }

    $records = New-Object System.Collections.Generic.List[object]
    foreach ($record in @(Get-ActiveSkillRecords -DirectoryPath $DirectoryPath)) { $records.Add($record) }

    $rootArchives = @(Get-ChildItem -LiteralPath $DirectoryPath -File -Force -Filter '*.skill' | Sort-Object Name)
    foreach ($archive in $rootArchives) {
        $records.Add((Get-ArchiveSkillRecord -ArchiveFile $archive -Storage 'staged-archive'))
    }

    $packageOnlyDirectories = @(Get-ChildItem -LiteralPath $DirectoryPath -Directory -Force |
        Where-Object { -not (Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') -PathType Leaf) } |
        Sort-Object Name)
    foreach ($directory in $packageOnlyDirectories) {
        $nestedArchives = @(Get-ChildItem -LiteralPath $directory.FullName -File -Force -Filter '*.skill' | Sort-Object Name)
        foreach ($archive in $nestedArchives) {
            $records.Add((Get-ArchiveSkillRecord -ArchiveFile $archive -Storage 'nested-staged-archive'))
        }
    }

    return $records.ToArray()
}

$canonicalRoot = Join-Path $Root 'skills'
$canonicalRecords = @(Get-ActiveSkillRecords -DirectoryPath $canonicalRoot -LocalStorage 'canonical-local' -JunctionStorage 'canonical-junction')
$canonicalByName = @{}
foreach ($record in $canonicalRecords) {
    if (-not $record.valid) { throw "Invalid canonical skill at $($record.artifact_id): $($record.error)" }
    if ($canonicalByName.ContainsKey($record.name)) { throw "Duplicate canonical skill name: $($record.name)" }
    $canonicalByName[$record.name] = $record
}

$surfaceResults = New-Object System.Collections.Generic.List[object]
foreach ($definition in $surfaceDefinitions) {
    $artifacts = @(Get-SurfaceSkillRecords -DirectoryPath $definition.path)
    $comparedArtifacts = New-Object System.Collections.Generic.List[object]

    foreach ($artifact in $artifacts) {
        $relation = 'invalid'
        if ($artifact.valid) {
            if (-not $canonicalByName.ContainsKey($artifact.name)) { $relation = 'extra' }
            elseif ($artifact.artifact_sha256 -eq $canonicalByName[$artifact.name].artifact_sha256) { $relation = 'exact' }
            else { $relation = 'drift' }
        }

        $comparedArtifacts.Add([ordered]@{
            artifact_id = $artifact.artifact_id
            name = $artifact.name
            folder_name = $artifact.folder_name
            relation = $relation
            storage = $artifact.storage
            valid = $artifact.valid
            error = $artifact.error
            manifest_sha256 = $artifact.manifest_sha256
            artifact_hash_algorithm = $artifact.artifact_hash_algorithm
            artifact_sha256 = $artifact.artifact_sha256
            last_write_utc = $artifact.last_write_utc
            archive_path = $artifact.archive_path
            package_root_stripped = $artifact.package_root_stripped
        })
    }

    $validNames = @($comparedArtifacts | Where-Object valid | ForEach-Object name | Sort-Object -Unique)
    $duplicateNames = @($comparedArtifacts |
        Where-Object valid |
        Group-Object -Property { $_.name } |
        Where-Object Count -gt 1 |
        ForEach-Object { $_.Name } |
        Sort-Object)
    $exactArtifacts = @($comparedArtifacts | Where-Object relation -eq 'exact')
    $driftArtifacts = @($comparedArtifacts | Where-Object relation -eq 'drift')
    $extraArtifacts = @($comparedArtifacts | Where-Object relation -eq 'extra')
    $invalidArtifacts = @($comparedArtifacts | Where-Object relation -eq 'invalid')
    $exactNames = @($exactArtifacts | ForEach-Object name | Sort-Object -Unique)
    $driftNames = @($driftArtifacts | ForEach-Object name | Sort-Object -Unique)
    $extraNames = @($extraArtifacts | ForEach-Object name | Sort-Object -Unique)
    $missingExact = @($canonicalRecords | Where-Object { $_.name -notin $exactNames } | ForEach-Object name | Sort-Object)
    $missingByName = @($canonicalRecords | Where-Object { $_.name -notin $validNames } | ForEach-Object name | Sort-Object)
    $junctions = @($comparedArtifacts | Where-Object storage -eq 'active-junction')
    $stagedArchives = @($comparedArtifacts | Where-Object { $_.storage -in @('staged-archive', 'nested-staged-archive') })

    $surfaceResults.Add([ordered]@{
        id = $definition.id
        client = $definition.client
        path = $definition.path
        ownership = $definition.ownership
        exists = (Test-Path -LiteralPath $definition.path -PathType Container)
        counts = [ordered]@{
            artifacts_total = $comparedArtifacts.Count
            unique_names = $validNames.Count
            duplicate_names = $duplicateNames.Count
            exact_canonical_artifacts = $exactArtifacts.Count
            exact_canonical_names = $exactNames.Count
            drifted_canonical_artifacts = $driftArtifacts.Count
            drifted_canonical_names = $driftNames.Count
            extra_artifacts = $extraArtifacts.Count
            extra_names = $extraNames.Count
            invalid_artifacts = $invalidArtifacts.Count
            missing_exact_canonical = $missingExact.Count
            missing_canonical_by_name = $missingByName.Count
            active_local = @($comparedArtifacts | Where-Object storage -eq 'active-local').Count
            active_junction = $junctions.Count
            staged_archives = $stagedArchives.Count
        }
        exact_canonical_names = $exactNames
        drifted_canonical_names = $driftNames
        extra_names = $extraNames
        missing_exact_canonical = $missingExact
        missing_canonical_by_name = $missingByName
        duplicate_names = $duplicateNames
        active_junction_artifact_ids = @($junctions | ForEach-Object artifact_id | Sort-Object)
        staged_archive_artifact_ids = @($stagedArchives | ForEach-Object artifact_id | Sort-Object)
        artifacts = @($comparedArtifacts | Sort-Object name, storage, artifact_id)
    })
}

$commit = 'UNCOMMITTED'
try {
    $candidate = (& git -C $Root rev-parse HEAD 2>$null)
    if ($LASTEXITCODE -eq 0 -and $candidate) { $commit = $candidate.Trim() }
} catch {}

$audit = [ordered]@{
    schema_version = 3
    generated_at_utc = [DateTime]::UtcNow.ToString('o')
    canonical = [ordered]@{
        repository = 'krishanraja/ai-harness'
        source_commit = $commit
        artifact_hash_algorithm = $ArtifactHashAlgorithm
        path = $canonicalRoot
        skill_count = $canonicalRecords.Count
        skills = $canonicalRecords
    }
    runtime = [ordered]@{
        powershell = $PSVersionTable.PSVersion.ToString()
        dotnet = [Environment]::Version.ToString()
        locale = [Globalization.CultureInfo]::CurrentCulture.Name
        collation = 'StringComparer.Ordinal'
    }
    definitions = [ordered]@{
        active = 'A directory with a root SKILL.md; junctions are reported separately from local directories.'
        staged_archive = 'A .skill zip package stored at the surface root or one level beneath it; presence does not imply activation.'
        exact = 'The normalized relative paths and every file SHA-256 match the canonical artifact.'
        drift = 'The manifest name matches a canonical skill, but the normalized full artifact does not.'
        missing_exact = 'No artifact on the surface exactly matches the canonical skill, even when a same-name drifted copy exists.'
    }
    exclusions = @(
        'Provider-managed plugin caches are excluded from personalized-surface duplicate findings.',
        'Claude Cloud is audited separately through its authenticated UI.',
        'A matching folder name or timestamp never establishes parity; full deterministic artifact hashes do.',
        'Archive discovery is deliberately bounded to the surface root and immediate package-only child directories.'
    )
    surfaces = $surfaceResults
}

$parent = Split-Path -Parent $OutputPath
if (-not (Test-Path -LiteralPath $parent -PathType Container)) {
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
}
$json = $audit | ConvertTo-Json -Depth 10
[IO.File]::WriteAllText($OutputPath, $json + "`n", [Text.UTF8Encoding]::new($false))
Write-Output "AUDITED $($surfaceResults.Count) surfaces against $($canonicalRecords.Count) canonical skills"
foreach ($surface in $surfaceResults) {
    Write-Output "$($surface.id): artifacts=$($surface.counts.artifacts_total) names=$($surface.counts.unique_names) exact_names=$($surface.counts.exact_canonical_names) drift_names=$($surface.counts.drifted_canonical_names) staged=$($surface.counts.staged_archives) invalid=$($surface.counts.invalid_artifacts)"
}
Write-Output "REPORT $OutputPath"
