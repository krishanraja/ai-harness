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

$scanExtensions = @('.md', '.mdc', '.yaml', '.yml', '.json', '.jsonl', '.ps1', '.sql')
$scanFiles = @(Get-ChildItem -LiteralPath $Root -Recurse -File | Where-Object {
    $_.Extension.ToLowerInvariant() -in $scanExtensions -and
    $_.FullName -notmatch '[\\/](?:\.git|dist)[\\/]'
})
foreach ($file in $scanFiles) {
    $relative = $file.FullName.Substring($rootItem.FullName.Length).TrimStart('\')
    $raw = [IO.File]::ReadAllText($file.FullName)
    foreach ($entry in $secretPatterns.GetEnumerator()) {
        if ([regex]::IsMatch($raw, $entry.Value)) {
            Add-Failure "$relative contains a high-confidence $($entry.Key) pattern."
        }
    }
}

$decisionConfig = Join-Path $Root 'state\decision-ledger-config.yaml'
$decisionStorageReference = Join-Path $Root 'skills\decision-ledger\references\supabase-storage.md'
$snapshotExporter = Join-Path $Root 'scripts\Export-DecisionLedgerSnapshot.ps1'
$snapshotFixture = Join-Path $Root 'evals\fixtures\decision-ledger-snapshot-input.json'
$snapshotExpected = Join-Path $Root 'evals\fixtures\decision-ledger-snapshot-expected.json'
$appTriggerCases = Join-Path $Root 'evals\build-apps-with-krish-trigger-cases.jsonl'
$appBehaviorCases = Join-Path $Root 'evals\build-apps-with-krish-behavior-cases.jsonl'

foreach ($required in @($decisionConfig, $decisionStorageReference, $snapshotExporter, $snapshotFixture, $snapshotExpected)) {
    if (-not (Test-Path -LiteralPath $required -PathType Leaf)) {
        Add-Failure "Missing decision-ledger storage artifact: $required"
    }
}

function Read-JsonLines {
    param([string]$Path)

    $records = New-Object System.Collections.Generic.List[object]
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        Add-Failure "Missing JSONL evaluation file: $Path"
        return @()
    }

    $lineNumber = 0
    foreach ($line in [IO.File]::ReadAllLines($Path)) {
        $lineNumber++
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        try {
            $records.Add(($line | ConvertFrom-Json))
        }
        catch {
            Add-Failure "Invalid JSONL at $Path line $lineNumber."
        }
    }
    return $records.ToArray()
}

function Test-EvalCategoryMinimums {
    param(
        [object[]]$Records,
        [hashtable]$Minimums,
        [string]$Label
    )

    $ids = @($Records | ForEach-Object { $_.id })
    if (@($ids | Where-Object { [string]::IsNullOrWhiteSpace($_) }).Count -gt 0) {
        Add-Failure "$Label contains a case without an id."
    }
    $duplicates = @($ids | Group-Object | Where-Object { $_.Count -gt 1 })
    if ($duplicates.Count -gt 0) {
        Add-Failure "$Label contains duplicate ids: $($duplicates.Name -join ', ')."
    }

    foreach ($category in $Minimums.Keys) {
        $count = @($Records | Where-Object { $_.category -eq $category }).Count
        if ($count -lt $Minimums[$category]) {
            Add-Failure "$Label needs at least $($Minimums[$category]) '$category' cases; found $count."
        }
    }
}

$appTriggers = @(Read-JsonLines -Path $appTriggerCases)
$appBehaviors = @(Read-JsonLines -Path $appBehaviorCases)
Test-EvalCategoryMinimums -Records $appTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'build-apps-with-krish trigger suite'
Test-EvalCategoryMinimums -Records $appBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'build-apps-with-krish behavior suite'

if (Test-Path -LiteralPath $decisionConfig -PathType Leaf) {
    $decisionConfigRaw = [IO.File]::ReadAllText($decisionConfig)
    if ($decisionConfigRaw -notmatch '(?m)^\s*type:\s*supabase-postgres\s*$') {
        Add-Failure 'Decision ledger is not configured for the selected Supabase canonical store.'
    }
    if ($decisionConfigRaw -notmatch '(?m)^\s*live_status:\s*not-applied\s*$') {
        $warnings.Add('Decision-ledger migration status changed; require live readback evidence before treating the store as available.')
    }
}

if ((Test-Path -LiteralPath $snapshotExporter -PathType Leaf) -and
    (Test-Path -LiteralPath $snapshotFixture -PathType Leaf) -and
    (Test-Path -LiteralPath $snapshotExpected -PathType Leaf)) {
    $tempSnapshot = Join-Path ([IO.Path]::GetTempPath()) ("decision-ledger-snapshot-$([guid]::NewGuid().ToString('N')).json")
    $tempUnsafeInput = Join-Path ([IO.Path]::GetTempPath()) ("decision-ledger-unsafe-$([guid]::NewGuid().ToString('N')).json")
    try {
        & $snapshotExporter -InputJsonPath $snapshotFixture -OutputPath $tempSnapshot | Out-Null
        if (-not (Test-Path -LiteralPath $tempSnapshot -PathType Leaf)) {
            Add-Failure 'Decision-ledger snapshot exporter did not write its deterministic fixture output.'
        }
        elseif ([IO.File]::ReadAllText($tempSnapshot) -ne [IO.File]::ReadAllText($snapshotExpected)) {
            Add-Failure 'Decision-ledger snapshot output differs from the reviewed deterministic fixture.'
        }

        $secondRun = @(& $snapshotExporter -InputJsonPath $snapshotFixture -OutputPath $tempSnapshot)
        if (($secondRun -join "`n") -notmatch '^UNCHANGED ') {
            Add-Failure 'Decision-ledger snapshot exporter rewrote byte-identical output.'
        }

        $unsafeParsed = ConvertFrom-Json -InputObject ([IO.File]::ReadAllText($snapshotFixture))
        $unsafeRows = @($unsafeParsed | ForEach-Object { $_ })
        $unsafeRows[0].summary = 'prefix-' + 'sk_' + 'user_' + ('A' * 24)
        [IO.File]::WriteAllText($tempUnsafeInput, ($unsafeRows | ConvertTo-Json -Depth 6), [Text.UTF8Encoding]::new($false))
        $unsafeRejected = $false
        try {
            & $snapshotExporter -InputJsonPath $tempUnsafeInput -OutputPath $tempSnapshot | Out-Null
        }
        catch {
            $unsafeRejected = $_.Exception.Message -match 'high-confidence GenericSecretKey'
        }
        if (-not $unsafeRejected) {
            Add-Failure 'Decision-ledger snapshot exporter did not reject a high-confidence secret pattern.'
        }
    }
    finally {
        if (Test-Path -LiteralPath $tempSnapshot) { Remove-Item -LiteralPath $tempSnapshot -Force }
        if (Test-Path -LiteralPath $tempUnsafeInput) { Remove-Item -LiteralPath $tempUnsafeInput -Force }
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
