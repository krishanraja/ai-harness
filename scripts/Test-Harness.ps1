param(
    [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$failures = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

function Add-Failure([string]$Message) {
    $script:failures.Add($Message)
}

function Get-FrontmatterValue {
    param(
        [string[]]$Lines,
        [int]$ClosingIndex,
        [string]$Key
    )

    $pattern = '^' + [regex]::Escape($Key) + ':\s*(.*)$'
    for ($i = 1; $i -lt $ClosingIndex; $i++) {
        if ($Lines[$i] -match $pattern) {
            return $Matches[1].Trim().Trim('"', "'")
        }
    }
    return ''
}

$contract = Join-Path $Root 'contract\krish-operating-contract.md'
$router = Join-Path $Root 'contract\skill-routing-contract.md'
$qualityStandard = Join-Path $Root 'contract\active-skill-quality-standard.md'
if (-not (Test-Path -LiteralPath $contract -PathType Leaf)) { Add-Failure 'Missing canonical operating contract.' }
if (-not (Test-Path -LiteralPath $router -PathType Leaf)) { Add-Failure 'Missing deterministic skill routing contract.' }
if (-not (Test-Path -LiteralPath $qualityStandard -PathType Leaf)) { Add-Failure 'Missing active skill quality standard.' }

$adapterPaths = @(
    (Join-Path $Root 'adapters\claude\CLAUDE.md'),
    (Join-Path $Root 'adapters\cursor\krish-core.mdc'),
    (Join-Path $Root 'adapters\codex\AGENTS.md')
)

foreach ($adapter in $adapterPaths) {
    if (-not (Test-Path -LiteralPath $adapter -PathType Leaf)) {
        Add-Failure "Missing adapter: $adapter"
        continue
    }
    $adapterRaw = [IO.File]::ReadAllText($adapter)
    if ($adapterRaw -notmatch 'krish-operating-contract\.md') { Add-Failure "Adapter does not load the operating contract: $adapter" }
    if ($adapterRaw -notmatch 'skill-routing-contract\.md') { Add-Failure "Adapter does not load the routing contract: $adapter" }
    if ($adapterRaw -notmatch 'krish-principles') { Add-Failure "Adapter does not make krish-principles always-on: $adapter" }
    if ($adapterRaw -notmatch 'strategy-brief') { Add-Failure "Adapter does not require pre-execution strategy: $adapter" }
    if ($adapterRaw -notmatch 'verification-loop') { Add-Failure "Adapter does not require post-execution verification: $adapter" }
}

$skillsRoot = Join-Path $Root 'skills'
$rootItem = Get-Item -LiteralPath $Root
$manifests = @(Get-ChildItem -LiteralPath $skillsRoot -Recurse -File -Filter 'SKILL.md')
if ($manifests.Count -eq 0) { Add-Failure 'No skill manifests found.' }

$secretPatterns = [ordered]@{
    GitHubToken = '(?i)\bgh(?:p|o|u|s|r)_[A-Za-z0-9]{20,}\b'
    VercelToken = '(?i)\bvcp_[A-Za-z0-9_-]{20,}\b'
    SupabaseToken = '(?i)\bsbp_[A-Za-z0-9_-]{20,}\b'
    GenericSecretKey = '(?i)\bsk_(?:user_)?[A-Za-z0-9_-]{20,}\b'
    Jwt = '(?i)\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b'
}

$hashes = @{}
foreach ($manifest in $manifests) {
    $relative = $manifest.FullName.Substring($rootItem.FullName.Length).TrimStart('\')
    $raw = [IO.File]::ReadAllText($manifest.FullName)
    $lines = $raw -split "`r?`n"

    if ($lines.Count -gt 500) { Add-Failure "$relative exceeds 500 lines ($($lines.Count))." }
    if ($lines.Count -lt 3 -or $lines[0].Trim() -ne '---') {
        Add-Failure "$relative is missing YAML frontmatter."
        continue
    }

    $closing = -1
    for ($i = 1; $i -lt $lines.Count; $i++) {
        if ($lines[$i].Trim() -eq '---') { $closing = $i; break }
    }
    if ($closing -lt 2) {
        Add-Failure "$relative has malformed YAML frontmatter."
        continue
    }

    $name = Get-FrontmatterValue -Lines $lines -ClosingIndex $closing -Key 'name'
    $description = Get-FrontmatterValue -Lines $lines -ClosingIndex $closing -Key 'description'
    if ($name -notmatch '^[a-z0-9-]{1,64}$') { Add-Failure "$relative has an invalid or missing name." }
    if ($description.Length -eq 0 -or $description.Length -gt 1024) { Add-Failure "$relative description length is invalid ($($description.Length))." }
    if ($manifest.Directory.Name -cne $name) { Add-Failure "$relative folder name does not match skill name '$name'." }
    if ($description -notmatch '(?i)\b(use|trigger|invoke|when|asks?|request|for)\b') { $warnings.Add("$relative description may lack trigger language.") }

    foreach ($entry in $secretPatterns.GetEnumerator()) {
        if ([regex]::IsMatch($raw, $entry.Value)) {
            Add-Failure "$relative contains a high-confidence $($entry.Key) pattern."
        }
    }

    $referenceMatches = [regex]::Matches($raw, '(?i)`((?:references?|leaves)/[^`#\s]+\.md)(?:#[^`]*)?`')
    foreach ($match in $referenceMatches) {
        $target = Join-Path $manifest.Directory.FullName ($match.Groups[1].Value -replace '/', '\')
        if (-not (Test-Path -LiteralPath $target -PathType Leaf)) {
            Add-Failure "$relative references missing file $($match.Groups[1].Value)."
        }
    }

    $hash = (Get-FileHash -LiteralPath $manifest.FullName -Algorithm SHA256).Hash
    if (-not $hashes.ContainsKey($hash)) { $hashes[$hash] = New-Object System.Collections.Generic.List[string] }
    $hashes[$hash].Add($relative)
}

foreach ($entry in $hashes.GetEnumerator()) {
    if ($entry.Value.Count -gt 1) {
        Add-Failure "Exact duplicate skill manifests: $($entry.Value -join ', ')."
    }
}

$capturePath = Join-Path $skillsRoot 'ctrl-capture\SKILL.md'
if (Test-Path -LiteralPath $capturePath -PathType Leaf) {
    $capture = [IO.File]::ReadAllText($capturePath)
    if ($capture -notmatch '(?m)^Stage 9\.') { Add-Failure 'ctrl-capture is not identified as stage 9.' }
    if ($capture -match '(?m)^Stage 8\.') { Add-Failure 'ctrl-capture still contains the obsolete stage 8 label.' }
}

if ($warnings.Count -gt 0) {
    Write-Output 'WARNINGS'
    $warnings | Sort-Object | ForEach-Object { Write-Output "- $_" }
}

if ($failures.Count -gt 0) {
    Write-Output 'HARNESS VALIDATION FAILED'
    $failures | Sort-Object | ForEach-Object { Write-Output "- $_" }
    exit 1
}

Write-Output "HARNESS VALIDATION PASSED: $($manifests.Count) skills, $($adapterPaths.Count) adapters, no high-confidence secrets."
