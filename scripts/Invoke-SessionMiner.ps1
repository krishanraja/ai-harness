#Requires -Version 7
<#
.SYNOPSIS
The private weekly session miner on this machine.

.DESCRIPTION
Krish ruled on 2026-10-14 that his Claude Code and Codex session logs may be
mined privately, so the harness learns how he works and not only what he writes
down. This wrapper runs scripts/mine-sessions.mjs over both, then reports a
heartbeat (clock session-miner-lorimer).

It is opt-in and separately removable: it never runs until -RegisterScheduledTask,
and -Unregister removes it. The miner redacts every excerpt before any model sees
it and submits only small envelope events; its cursor lives in
%LOCALAPPDATA%\krish-harness\session-miner, never in the repository. A names.txt
in that folder (one name per line, never committed) adds names to redact.

Submitting needs HARNESS_EVENT_INGEST_URL and HARNESS_EVENT_INGEST_TOKEN as user
environment variables; the heartbeat needs an authenticated gh.

.EXAMPLE
pwsh scripts/Invoke-SessionMiner.ps1 -SelfTest
pwsh scripts/Invoke-SessionMiner.ps1 -DryRun
pwsh scripts/Invoke-SessionMiner.ps1 -RegisterScheduledTask
pwsh scripts/Invoke-SessionMiner.ps1 -Unregister
#>
param(
    [string]$RepositoryRoot = (Split-Path -Parent $PSScriptRoot),
    [switch]$RegisterScheduledTask,
    [switch]$Unregister,
    [switch]$DryRun,
    [switch]$SelfTest,
    [switch]$NoHeartbeat
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$TaskName = 'Krish Harness Session Miner'
$TaskDay = 'Sunday'
$TaskTime = '18:00'
$Repository = 'krishanraja/ai-harness'
$Clock = 'session-miner-lorimer'
$Node = (Get-Command node -ErrorAction Stop).Source
$Miner = Join-Path $RepositoryRoot 'scripts\mine-sessions.mjs'
$StateDir = Join-Path $env:LOCALAPPDATA 'krish-harness\session-miner'
$WorkDir = Join-Path $env:LOCALAPPDATA 'krish-harness\session-miner-work'
$NamesFile = Join-Path $StateDir 'names.txt'

if (-not (Test-Path -LiteralPath $Miner -PathType Leaf)) { throw "Miner not found: $Miner" }

if ($Unregister) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Output "Removed the scheduled task '$TaskName'. The cursor in $StateDir is kept; delete that folder for a clean slate."
    return
}

if ($SelfTest) {
    & $Node $Miner --self-test
    exit $LASTEXITCODE
}

if ($RegisterScheduledTask) {
    $pwsh = (Get-Command pwsh.exe -ErrorAction Stop).Source
    $scriptPath = Join-Path $RepositoryRoot 'scripts\Invoke-SessionMiner.ps1'
    $action = New-ScheduledTaskAction `
        -Execute $pwsh `
        -Argument "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$scriptPath`"" `
        -WorkingDirectory $RepositoryRoot
    $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $TaskDay -At $TaskTime
    $settings = New-ScheduledTaskSettingsSet `
        -StartWhenAvailable `
        -RunOnlyIfNetworkAvailable `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -MultipleInstances IgnoreNew `
        -ExecutionTimeLimit (New-TimeSpan -Hours 2)
    $principal = New-ScheduledTaskPrincipal `
        -UserId "$env:USERDOMAIN\$env:USERNAME" `
        -LogonType Interactive `
        -RunLevel Limited
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Principal $principal `
        -Description 'Weekly private session miner for the Krish harness: redacted lessons from Claude Code and Codex sessions, nothing raw leaves the machine.' `
        -Force | Out-Null
    Write-Output "Registered '$TaskName': weekly on $TaskDay at $TaskTime. Remove it with -Unregister."
    return
}

New-Item -ItemType Directory -Force -Path $StateDir, $WorkDir | Out-Null
$common = @('--state', $StateDir, '--exclude-cwd', $WorkDir)
if (Test-Path -LiteralPath $NamesFile -PathType Leaf) { $common += @('--names', $NamesFile) }
if ($DryRun) { $common += '--dry-run' }

$status = 'ok'
foreach ($source in @('claude-code', 'codex')) {
    & $Node $Miner --source $source @common
    if ($LASTEXITCODE -ne 0) { $status = 'blocked' }
}

if (-not $DryRun -and -not $NoHeartbeat) {
    & gh api --method POST -H 'Accept: application/vnd.github+json' "repos/$Repository/dispatches" `
        -f 'event_type=harness-machine-heartbeat' `
        -f "client_payload[clock]=$Clock" `
        -f "client_payload[status]=$status" | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Warning 'The heartbeat dispatch failed; the audit will report the clock as silent.' }
}

if ($status -ne 'ok') { exit 1 }
