#Requires -Version 7
<#
.SYNOPSIS
The private weekly session miner on this machine.

.DESCRIPTION
Krish ruled on 2026-10-14 that his Claude Code and Codex session logs may be
mined privately, so the harness learns how he works and not only what he writes
down. This wrapper runs scripts/mine-sessions.mjs over both, then reports a
heartbeat (clock session-miner-lorimer).

There is nothing to install. The nightly harness sync (scripts/Invoke-HarnessSync.ps1)
runs this once a week on LORIMER. Where the lessons go is chosen in
contract/learning-policy.yaml (miner.submit); until a route is chosen a run reads
nothing and reports itself degraded. The miner redacts every excerpt before any
model sees it, and its cursor lives in %LOCALAPPDATA%\krish-harness\session-miner,
never in the repository. A names.txt in that folder (one name per line, never
committed) adds names to redact.

.EXAMPLE
pwsh scripts/Invoke-SessionMiner.ps1 -SelfTest
pwsh scripts/Invoke-SessionMiner.ps1 -DryRun
pwsh scripts/Invoke-SessionMiner.ps1 -Unregister
#>
param(
    [string]$RepositoryRoot = (Split-Path -Parent $PSScriptRoot),
    [switch]$Unregister,
    [switch]$DryRun,
    [switch]$SelfTest,
    [switch]$NoHeartbeat,
    [ValidateSet('legacy', 'api')]
    [string]$Extractor = 'legacy',
    [string]$SourceAccountSha256
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# The separate task an earlier version asked Krish to install by hand.
$LegacyTaskName = 'Krish Harness Session Miner'
$Repository = 'krishanraja/ai-harness'
$Clock = 'session-miner-lorimer'
$Node = (Get-Command node -ErrorAction Stop).Source
$Miner = Join-Path $RepositoryRoot 'scripts\mine-sessions.mjs'
$StateDir = Join-Path $env:LOCALAPPDATA 'krish-harness\session-miner'
$WorkDir = Join-Path $env:LOCALAPPDATA 'krish-harness\session-miner-work'
$NamesFile = Join-Path $StateDir 'names.txt'

if (-not (Test-Path -LiteralPath $Miner -PathType Leaf)) { throw "Miner not found: $Miner" }

if ($Unregister) {
    if (Get-ScheduledTask -TaskName $LegacyTaskName -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $LegacyTaskName -Confirm:$false
        Write-Output "Removed the separate task '$LegacyTaskName'; the nightly harness sync runs the miner weekly."
    }
    else {
        Write-Output "There is no separate task to remove; the nightly harness sync runs the miner weekly."
    }
    return
}

if ($SelfTest) {
    & $Node $Miner --self-test
    exit $LASTEXITCODE
}

# Only an explicitly selected legacy route discovers a Claude executable. The miner
# uses a shell for a Windows npm shim. The API route never falls back to it.
if ($Extractor -eq 'legacy' -and -not $env:HARNESS_CLAUDE_CLI) {
    $native = Get-Command claude.exe -ErrorAction SilentlyContinue | Select-Object -First 1
    $legacy = Join-Path $env:APPDATA 'npm\node_modules\@anthropic-ai\claude-code\bin\claude.exe'
    if ($native) { $env:HARNESS_CLAUDE_CLI = $native.Source }
    elseif (Test-Path -LiteralPath $legacy -PathType Leaf) { $env:HARNESS_CLAUDE_CLI = $legacy }
}

New-Item -ItemType Directory -Force -Path $StateDir, $WorkDir | Out-Null
$common = @('--state', $StateDir, '--exclude-cwd', $WorkDir, '--extractor', $Extractor)
if ($SourceAccountSha256) { $common += @('--source-account-sha256', $SourceAccountSha256) }
if (Test-Path -LiteralPath $NamesFile -PathType Leaf) { $common += @('--names', $NamesFile) }
if ($DryRun) { $common += '--dry-run' }

$status = 'ok'
foreach ($source in @('claude-code', 'codex')) {
    & $Node $Miner --source $source @common
    if ($LASTEXITCODE -eq 3) { $status = 'degraded'; break }
    if ($LASTEXITCODE -ne 0) { $status = 'blocked' }
}

if (-not $DryRun -and -not $NoHeartbeat) {
    & gh api --method POST -H 'Accept: application/vnd.github+json' "repos/$Repository/dispatches" `
        -f 'event_type=harness-machine-heartbeat' `
        -f "client_payload[clock]=$Clock" `
        -f "client_payload[status]=$status" | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Warning 'The heartbeat dispatch failed; the audit will report the clock as silent.' }
}

if ($status -eq 'blocked') { exit 1 }
