# One-line repair for the harness on Krish's PC. Paste this into any PowerShell
# window (Windows PowerShell or PowerShell 7) and press Enter:
#
#   irm https://raw.githubusercontent.com/krishanraja/ai-harness/main/scripts/Repair-HarnessPc.ps1 | iex
#
# It finds the ai-harness checkout (cloning it if there is none), brings it up
# to date, points the nightly sync task at it, runs the sync once, and ends with
# one line saying how that went. Safe to run again. It never deletes anything
# and never touches local edits; if it cannot do something it stops and says so.
#
# Why it exists: on 2026-10-15 the nightly task 'Mindmake AI Harness Sync' was
# found starting every day and dying with exit code 64, PowerShell's code for a
# script path that does not exist, so it had been silent since 2026-10-06.
#
# Written for Windows PowerShell 5.1 as well as 7: no ternaries, no `??`, no
# `&&`, no stderr redirection of native commands, and no `exit` (which would
# close the window when run through iex).
& {
    $ErrorActionPreference = 'Continue'
    $taskName = 'Mindmake AI Harness Sync'
    $legacyMinerTask = 'Krish Harness Session Miner'
    $preferred = Join-Path $env:USERPROFILE 'dev/mindmaker-os/ai-harness'

    # 1. PowerShell 7, which the sync needs.
    $pwshPath = $null
    $found = Get-Command pwsh.exe -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $pwshPath = $found.Source }
    if (-not $pwshPath) {
        Write-Host 'Installing PowerShell 7, which the nightly sync needs...'
        winget install --id Microsoft.PowerShell --source winget --silent --accept-package-agreements --accept-source-agreements | Out-Null
        $candidate = Join-Path $env:ProgramFiles 'PowerShell\7\pwsh.exe'
        if (Test-Path -LiteralPath $candidate) { $pwshPath = $candidate }
    }
    if (-not $pwshPath) {
        Write-Host 'HARNESS PC REPAIR STOPPED: PowerShell 7 is not installed and could not be installed automatically. Nothing else was changed.'
        return
    }

    # 2. The checkout: wherever the task pointed, then the usual places.
    $candidates = New-Object System.Collections.Generic.List[string]
    $task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($task) {
        $action = @($task.Actions)[0]
        if ($action.Arguments -match '-File\s+"([^"]+)"') { $candidates.Add((Split-Path -Parent (Split-Path -Parent $Matches[1]))) }
        if ($action.WorkingDirectory) { $candidates.Add([string]$action.WorkingDirectory) }
    }
    foreach ($path in @($preferred, (Join-Path $env:USERPROFILE 'dev/ai-harness'), (Join-Path $env:USERPROFILE 'ai-harness'))) { $candidates.Add($path) }
    $repo = $null
    foreach ($candidate in $candidates) {
        if (-not $candidate) { continue }
        # A path on a drive that no longer exists must not stop the search.
        try {
            if (-not (Test-Path -LiteralPath "$candidate/.git")) { continue }
            if (-not (Test-Path -LiteralPath "$candidate/scripts/Invoke-HarnessSync.ps1")) { continue }
        }
        catch { continue }
        $origin = git -C $candidate remote get-url origin
        if ($origin -match 'krishanraja/ai-harness') { $repo = $candidate; break }
    }
    if (-not $repo) {
        if ((Test-Path -LiteralPath $preferred) -and (Get-ChildItem -LiteralPath $preferred -Force | Select-Object -First 1)) {
            Write-Host "HARNESS PC REPAIR STOPPED: $preferred exists but is not an ai-harness checkout. Nothing was changed."
            return
        }
        Write-Host "No ai-harness checkout found; cloning it to $preferred ..."
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $preferred) | Out-Null
        git clone --quiet https://github.com/krishanraja/ai-harness.git $preferred
        if ($LASTEXITCODE -ne 0) {
            Write-Host 'HARNESS PC REPAIR STOPPED: git could not clone the repository. Nothing else was changed.'
            return
        }
        $repo = $preferred
    }
    Write-Host "Using the checkout at $repo"

    # 3. Up to date with main, without touching local edits.
    $edits = @(git -C $repo status --porcelain --untracked-files=no)
    if ($edits.Count -gt 0 -and $edits[0]) {
        Write-Host "HARNESS PC REPAIR STOPPED: $repo has $($edits.Count) locally edited file(s). Nothing was changed. Commit or discard those edits, then run this line again."
        return
    }
    git -C $repo fetch --quiet origin main --tags
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'HARNESS PC REPAIR STOPPED: git could not reach GitHub. Check the internet connection and run this line again.'
        return
    }
    $branch = git -C $repo rev-parse --abbrev-ref HEAD
    if ($branch -ne 'main') { git -C $repo switch --quiet main }
    git -C $repo merge --quiet --ff-only origin/main
    if ($LASTEXITCODE -ne 0) {
        Write-Host "HARNESS PC REPAIR STOPPED: $repo could not move to the latest main without losing local commits. Nothing was changed."
        return
    }

    # 4. Point the nightly task at this checkout. The miner needs no task of
    # its own any more: the sync runs it weekly.
    $sync = Join-Path $repo 'scripts/Invoke-HarnessSync.ps1'
    & $pwshPath -NoProfile -ExecutionPolicy Bypass -File $sync -RegisterScheduledTask | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'HARNESS PC REPAIR STOPPED: the nightly task could not be registered. The checkout is up to date.'
        return
    }
    if (Get-ScheduledTask -TaskName $legacyMinerTask -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $legacyMinerTask -Confirm:$false
    }

    # 5. Run it once now and wait for it.
    $started = Get-Date
    Start-ScheduledTask -TaskName $taskName
    Write-Host 'The nightly sync is running now. This usually takes a few minutes and can take up to 25...'
    $deadline = $started.AddMinutes(25)
    do {
        Start-Sleep -Seconds 15
        $state = [string](Get-ScheduledTask -TaskName $taskName).State
        $info = Get-ScheduledTaskInfo -TaskName $taskName
    } while ((Get-Date) -lt $deadline -and ($state -eq 'Running' -or $info.LastRunTime -lt $started))

    if ($state -eq 'Running') {
        Write-Host 'HARNESS PC REPAIR OK: the nightly sync points at the right place and is still running. It reports to GitHub by itself when it finishes; you can close this window.'
    }
    elseif ($info.LastTaskResult -eq 0) {
        Write-Host "HARNESS PC REPAIR OK: the nightly sync ran and reported in. Next run: $($info.NextRunTime)."
    }
    else {
        Write-Host "HARNESS PC REPAIR DONE: the task is fixed and ran, and finished with code $($info.LastTaskResult). It sent the details to GitHub; the weekly digest says if anything is needed from you."
    }
}
