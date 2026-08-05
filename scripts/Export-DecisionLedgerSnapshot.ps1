[CmdletBinding()]
param(
    [string]$InputJsonPath,
    [string]$OutputPath = (Join-Path (Split-Path -Parent $PSScriptRoot) 'state\decision-ledger-snapshot.json'),
    [string]$SupabaseUrlEnvironmentVariable = 'SUPABASE_URL',
    [string]$ServiceRoleKeyEnvironmentVariable = 'SUPABASE_SERVICE_ROLE_KEY'
)

$ErrorActionPreference = 'Stop'

$allowedFields = @(
    'decision_key',
    'status',
    'scope',
    'title',
    'summary',
    'revisit',
    'canonical_sha256'
)
$allowedStatus = @('active', 'conditional', 'review_due', 'superseded', 'reversed', 'expired')
$allowedScope = @('cross_venture', 'venture', 'system', 'harness', 'other')
$secretPatterns = [ordered]@{
    GitHubToken = '(?i)\bgh(?:p|o|u|s|r)_[A-Za-z0-9]{20,}\b'
    VercelToken = '(?i)\bvcp_[A-Za-z0-9_-]{20,}\b'
    SupabaseToken = '(?i)\bsbp_[A-Za-z0-9_-]{20,}\b'
    GenericSecretKey = '(?i)\bsk_(?:user_)?[A-Za-z0-9_-]{20,}\b'
    Jwt = '(?i)\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b'
}

function ConvertTo-CanonicalJsonString {
    param([AllowNull()][object]$Value)

    if ($null -eq $Value) { return 'null' }
    $Value = [string]$Value
    $builder = New-Object Text.StringBuilder
    [void]$builder.Append('"')
    foreach ($character in $Value.ToCharArray()) {
        switch ([int]$character) {
            8 { [void]$builder.Append('\b'); continue }
            9 { [void]$builder.Append('\t'); continue }
            10 { [void]$builder.Append('\n'); continue }
            12 { [void]$builder.Append('\f'); continue }
            13 { [void]$builder.Append('\r'); continue }
            34 { [void]$builder.Append('\"'); continue }
            92 { [void]$builder.Append('\\'); continue }
            default {
                $codePoint = [int]$character
                if ($codePoint -lt 32) { [void]$builder.Append(('\u{0:x4}' -f $codePoint)) }
                else { [void]$builder.Append($character) }
            }
        }
    }
    [void]$builder.Append('"')
    return $builder.ToString()
}

if ($InputJsonPath) {
    if (-not (Test-Path -LiteralPath $InputJsonPath -PathType Leaf)) {
        throw "Snapshot input does not exist: $InputJsonPath"
    }
    $parsed = ConvertFrom-Json -InputObject ([IO.File]::ReadAllText((Resolve-Path -LiteralPath $InputJsonPath)))
    $rows = @($parsed | ForEach-Object { $_ })
}
else {
    $supabaseUrl = [Environment]::GetEnvironmentVariable($SupabaseUrlEnvironmentVariable)
    $serviceRoleKey = [Environment]::GetEnvironmentVariable($ServiceRoleKeyEnvironmentVariable)
    if ([string]::IsNullOrWhiteSpace($supabaseUrl) -or [string]::IsNullOrWhiteSpace($serviceRoleKey)) {
        throw "Live export requires environment variables $SupabaseUrlEnvironmentVariable and $ServiceRoleKeyEnvironmentVariable."
    }

    $baseUrl = $supabaseUrl.TrimEnd('/')
    $select = 'decision_key,status,scope,title,summary,revisit,canonical_sha256'
    $uri = "$baseUrl/rest/v1/decision_ledger_git_snapshot_v1?select=$select&order=decision_key.asc"
    $headers = @{
        apikey = $serviceRoleKey
        Authorization = "Bearer $serviceRoleKey"
        Accept = 'application/json'
    }
    $response = Invoke-RestMethod -Method Get -Uri $uri -Headers $headers
    $rows = @($response | ForEach-Object { $_ })
}

$normalized = New-Object System.Collections.Generic.List[object]
foreach ($row in $rows) {
    $propertyNames = @($row.PSObject.Properties.Name)
    $unexpected = @($propertyNames | Where-Object { $_ -notin $allowedFields })
    $missing = @($allowedFields | Where-Object { $_ -notin $propertyNames })
    if ($unexpected.Count -gt 0) {
        throw "Snapshot row $($row.decision_key) contains forbidden fields: $($unexpected -join ', ')."
    }
    if ($missing.Count -gt 0) {
        throw "Snapshot row $($row.decision_key) is missing required fields: $($missing -join ', ')."
    }
    if ($row.decision_key -notmatch '^DEC-[0-9]{8}-[a-z0-9]+(?:-[a-z0-9]+)*$') {
        throw "Snapshot contains an invalid decision key."
    }
    if ($row.status -notin $allowedStatus) {
        throw "Snapshot row $($row.decision_key) has invalid status."
    }
    if ($row.scope -notin $allowedScope) {
        throw "Snapshot row $($row.decision_key) has invalid or non-exportable scope."
    }
    if ($row.canonical_sha256 -notmatch '^[0-9a-f]{64}$') {
        throw "Snapshot row $($row.decision_key) has invalid canonical_sha256."
    }

    foreach ($field in @('title', 'summary', 'revisit')) {
        $value = $row.$field
        if ($null -ne $value -and $value -isnot [string]) {
            throw "Snapshot row $($row.decision_key) has a non-text $field value."
        }
        if ($null -ne $value) {
            foreach ($entry in $secretPatterns.GetEnumerator()) {
                if ([regex]::IsMatch($value, $entry.Value)) {
                    throw "Snapshot row $($row.decision_key) contains a high-confidence $($entry.Key) pattern in $field."
                }
            }
        }
    }

    $normalized.Add([ordered]@{
        decision_key = [string]$row.decision_key
        status = [string]$row.status
        scope = [string]$row.scope
        title = if ($null -eq $row.title) { $null } else { [string]$row.title }
        summary = if ($null -eq $row.summary) { $null } else { [string]$row.summary }
        revisit = if ($null -eq $row.revisit) { $null } else { [string]$row.revisit }
        canonical_sha256 = [string]$row.canonical_sha256
    })
}

$recordJson = New-Object System.Collections.Generic.List[string]
foreach ($row in @($normalized | Sort-Object { $_.decision_key })) {
    $recordJson.Add(('{' +
        '"decision_key":' + (ConvertTo-CanonicalJsonString $row.decision_key) + ',' +
        '"status":' + (ConvertTo-CanonicalJsonString $row.status) + ',' +
        '"scope":' + (ConvertTo-CanonicalJsonString $row.scope) + ',' +
        '"title":' + (ConvertTo-CanonicalJsonString $row.title) + ',' +
        '"summary":' + (ConvertTo-CanonicalJsonString $row.summary) + ',' +
        '"revisit":' + (ConvertTo-CanonicalJsonString $row.revisit) + ',' +
        '"canonical_sha256":' + (ConvertTo-CanonicalJsonString $row.canonical_sha256) +
        '}'))
}
$json = ('{"schema_version":1,' +
    '"source":"public.decision_ledger_git_snapshot_v1",' +
    '"authoritative":false,' +
    '"records":[' + ($recordJson -join ',') + ']}' + "`n")
$outputFull = [IO.Path]::GetFullPath($OutputPath)
$parent = Split-Path -Parent $outputFull
if (-not (Test-Path -LiteralPath $parent -PathType Container)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
}

if (Test-Path -LiteralPath $outputFull -PathType Leaf) {
    $existing = [IO.File]::ReadAllText($outputFull)
    if ($existing -eq $json) {
        Write-Output "UNCHANGED $outputFull"
        return
    }
}

[IO.File]::WriteAllText($outputFull, $json, [Text.UTF8Encoding]::new($false))
Write-Output "WROTE $outputFull"
