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
$releaseBuilder = Join-Path $Root 'scripts\Build-HarnessRelease.ps1'
$syncScript = Join-Path $Root 'scripts\Invoke-HarnessSync.ps1'
if (-not (Test-Path -LiteralPath $contract -PathType Leaf)) { Add-Failure 'Missing canonical operating contract.' }
else {
    $contractRaw = [IO.File]::ReadAllText($contract)
    if ($contractRaw -notmatch '(?m)^## Observation capture$') { Add-Failure 'Operating contract is missing the Observation capture boundary.' }
    if ($contractRaw -notmatch 'record_harness_observation') { Add-Failure 'Observation capture does not name the hosted MCP tool.' }
    if ($contractRaw -notmatch '`ctrl-capture`\s+alone clusters and interprets evidence') { Add-Failure 'Observation capture does not preserve the ctrl-capture ownership boundary.' }
    if ($contractRaw -notmatch 'never simulate persistence or create\s+a local shadow ledger') { Add-Failure 'Observation capture does not fail honestly without a local collector.' }
}
if (-not (Test-Path -LiteralPath $syncScript -PathType Leaf)) {
    Add-Failure 'Missing machine sync orchestrator.'
}
else {
    $syncScriptRaw = [IO.File]::ReadAllText($syncScript)
    if ($syncScriptRaw -notmatch 'unmeasured_surfaces\s*=\s*@\(\$unmeasured\s*\|\s*ForEach-Object\s*\{\s*\$_\.surface\s*\}\)') {
        Add-Failure 'Machine sync does not record unmeasured surfaces by the surface field.'
    }
}
if (-not (Test-Path -LiteralPath $router -PathType Leaf)) { Add-Failure 'Missing deterministic skill routing contract.' }
if (-not (Test-Path -LiteralPath $qualityStandard -PathType Leaf)) { Add-Failure 'Missing active skill quality standard.' }
if (-not (Test-Path -LiteralPath $releaseBuilder -PathType Leaf)) {
    Add-Failure 'Missing deterministic release builder.'
}
else {
    $releaseBuilderRaw = [IO.File]::ReadAllText($releaseBuilder)
    if ($releaseBuilderRaw -notmatch 'status\s+--porcelain\s+--untracked-files=all') { Add-Failure 'Release builder does not enforce or record clean-tree state.' }
    if ($releaseBuilderRaw -notmatch 'Get-DirectoryArtifactSha256') { Add-Failure 'Release builder does not hash the complete source skill artifact.' }
    if ($releaseBuilderRaw -notmatch 'source_manifest_sha256') { Add-Failure 'Release builder does not distinguish manifest hash from full source-skill hash.' }
    if ($releaseBuilderRaw -notmatch 'FilesAtArchiveRoot') { Add-Failure 'Release builder does not produce a root-level portable cloud package.' }
    if ($releaseBuilderRaw -notmatch 'perplexity_artifact_sha256') { Add-Failure 'Release builder does not record the Perplexity transport hash.' }
    if ($releaseBuilderRaw -notmatch 'ReleaseId\s+-notmatch') { Add-Failure 'Release builder does not constrain release identifiers.' }
    if ($releaseBuilderRaw -notmatch 'sha256-path-nul-file-sha256-ordinal-v1') { Add-Failure 'Release builder does not version the runtime-independent artifact hash.' }
    if ($releaseBuilderRaw -notmatch 'StringComparer]::Ordinal') { Add-Failure 'Release builder does not use explicit ordinal collation.' }
}

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
    if ($adapterRaw -notmatch 'record_harness_observation') { Add-Failure "Adapter does not route hosted observation capture: $adapter" }
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
    $frontmatterKeys = @($lines[1..($closing - 1)] |
        ForEach-Object { if ($_ -match '^\s*([A-Za-z0-9_-]+)\s*:') { $Matches[1] } } |
        Where-Object { $_ } |
        Sort-Object -Unique)
    $unexpectedFrontmatterKeys = @($frontmatterKeys | Where-Object { $_ -notin @('name', 'description', 'disable-model-invocation') })
    if ($unexpectedFrontmatterKeys.Count -gt 0) {
        Add-Failure "$relative has unsupported frontmatter fields: $($unexpectedFrontmatterKeys -join ', ')."
    }
    $disableModelInvocation = Get-FrontmatterValue -Lines $lines -ClosingIndex $closing -Key 'disable-model-invocation'
    if ($disableModelInvocation -and $disableModelInvocation -notin @('true', 'false')) {
        Add-Failure "$relative has invalid disable-model-invocation value: $disableModelInvocation."
    }
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

    $openAiMetadata = Join-Path $manifest.Directory.FullName 'agents\openai.yaml'
    if (Test-Path -LiteralPath $openAiMetadata -PathType Leaf) {
        $openAiRaw = [IO.File]::ReadAllText($openAiMetadata)
        if ($openAiRaw -notmatch '(?m)^\s*display_name:\s*"[^"]+"\s*$') { Add-Failure "$relative has invalid agents/openai.yaml display_name metadata." }
        if ($openAiRaw -notmatch '(?m)^\s*short_description:\s*"[^"]{25,64}"\s*$') { Add-Failure "$relative has invalid agents/openai.yaml short_description metadata." }
        if ($name -eq 'video-engine') {
            # The one documented exception, added 2026-09-08 with the trigger
            # narrowing. Every other skill's default prompt should invoke it by
            # name, but this skill's contract explicitly forbids $video-engine as
            # a trigger: krishanraja/mindmake-video-studio main, which this skill
            # names as its only authority, accepts nothing but the exact first
            # message. A default prompt saying $video-engine would tell the
            # client to send something the contract rejects. So assert the
            # opposite: it must be the exact launch phrase and must not carry the
            # dollar form.
            if ($openAiRaw -notmatch '(?m)^\s*default_prompt:\s*"Video engine"\s*$') {
                Add-Failure ($relative + ' agents/openai.yaml default_prompt must be exactly "Video engine", the only string its trigger contract accepts.')
            }
            if ($openAiRaw -match '\$video-engine') {
                Add-Failure ($relative + ' agents/openai.yaml still names $video-engine, which the trigger contract rejects.')
            }
            # This assertion demanded `false` for one day and was wrong for all
            # of it. Implicit invocation is not the collision; it is the on
            # switch. Turning it off does not narrow which message starts the
            # engine, it stops any message starting it, and on Codex it also
            # drops the skill from the discoverable catalog. SURFACE proved it
            # on 2026-09-09: the exact phrase in a fresh task started nothing
            # twice. Narrowness belongs to the description, which names the
            # exact match and every excluded form; this flag cannot tell them
            # apart. So assert the launcher can launch.
            if ($openAiRaw -notmatch '(?m)^\s*allow_implicit_invocation:\s*true\s*$') {
                Add-Failure ($relative + ' agents/openai.yaml must set allow_implicit_invocation: true. Its description declares a positive trigger, and false removes the skill from the catalog, so the exact phrase cannot fire it either.')
            }
        }
        elseif ($openAiRaw -notmatch ('(?m)^\s*default_prompt:\s*"[^"\r\n]*\$' + [regex]::Escape($name) + '\b[^"\r\n]*"\s*$')) {
            Add-Failure ($relative + ' agents/openai.yaml default_prompt does not explicitly invoke $' + $name + '.')
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

$skillMarkdownFiles = @(Get-ChildItem -LiteralPath $skillsRoot -Recurse -File -Filter '*.md')
foreach ($markdownFile in $skillMarkdownFiles) {
    $relative = $markdownFile.FullName.Substring($rootItem.FullName.Length).TrimStart('\')
    $raw = [IO.File]::ReadAllText($markdownFile.FullName)
    if ($raw -match '(?i)`(?:\.\./|\.\.\\|[^`/\\]+[/\\]\.\.[/\\])[^`]*`' -or $raw -match '(?i)\]\((?:\.\./|\.\.\\)') {
        Add-Failure "$relative references a path outside its standalone skill package."
    }
    if ($raw -match '(?i)`(?:references?|leaves|scripts|assets)\\[^`]+`' -or $raw -match '(?i)\]\((?:references?|leaves|scripts|assets)\\') {
        Add-Failure "$relative uses a Windows-style bundled-resource path; use forward slashes."
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
$maintainerTriggerCases = Join-Path $Root 'evals\harness-maintainer-trigger-cases.jsonl'
$maintainerBehaviorCases = Join-Path $Root 'evals\harness-maintainer-behavior-cases.jsonl'
$maintainerRegressionCases = Join-Path $Root 'evals\harness-maintainer-regression-cases.jsonl'
$briefTriggerCases = Join-Path $Root 'evals\take-the-brief-trigger-cases.jsonl'
$briefBehaviorCases = Join-Path $Root 'evals\take-the-brief-behavior-cases.jsonl'
$coreTriggerCases = Join-Path $Root 'evals\core-trigger-cases.jsonl'
$coreBehaviorCases = Join-Path $Root 'evals\core-behavior-cases.jsonl'
$globalChainCases = Join-Path $Root 'evals\global-chain-cases.jsonl'
$skillRoutingCases = Join-Path $Root 'evals\skill-routing-cases.jsonl'
$mindmakeTriggerCases = Join-Path $Root 'evals\mindmake-trigger-cases.jsonl'
$mindmakeBehaviorCases = Join-Path $Root 'evals\mindmake-behavior-cases.jsonl'
$contentCorpusTriggerCases = Join-Path $Root 'evals\content-corpus-trigger-cases.jsonl'
$contentCorpusBehaviorCases = Join-Path $Root 'evals\content-corpus-behavior-cases.jsonl'
$contentMarketerTriggerCases = Join-Path $Root 'evals\krish-content-marketer-trigger-cases.jsonl'
$contentMarketerBehaviorCases = Join-Path $Root 'evals\krish-content-marketer-behavior-cases.jsonl'
$designTriggerCases = Join-Path $Root 'evals\krish-design-trigger-cases.jsonl'
$designBehaviorCases = Join-Path $Root 'evals\krish-design-behavior-cases.jsonl'
$buildTriggerCases = Join-Path $Root 'evals\krish-build-trigger-cases.jsonl'
$buildBehaviorCases = Join-Path $Root 'evals\krish-build-behavior-cases.jsonl'
$researchTriggerCases = Join-Path $Root 'evals\evidence-research-trigger-cases.jsonl'
$researchBehaviorCases = Join-Path $Root 'evals\evidence-research-behavior-cases.jsonl'
$voiceTriggerCases = Join-Path $Root 'evals\krish-voice-trigger-cases.jsonl'
$voiceBehaviorCases = Join-Path $Root 'evals\krish-voice-behavior-cases.jsonl'
$uxQaTriggerCases = Join-Path $Root 'evals\ux-testing-agent-trigger-cases.jsonl'
$uxQaBehaviorCases = Join-Path $Root 'evals\ux-testing-agent-behavior-cases.jsonl'
$toolsAccessTriggerCases = Join-Path $Root 'evals\tools-access-trigger-cases.jsonl'
$toolsAccessBehaviorCases = Join-Path $Root 'evals\tools-access-behavior-cases.jsonl'
$mindmakeOsTriggerCases = Join-Path $Root 'evals\mindmake-os-trigger-cases.jsonl'
$mindmakeOsBehaviorCases = Join-Path $Root 'evals\mindmake-os-behavior-cases.jsonl'
$ctrlIntakeTriggerCases = Join-Path $Root 'evals\ctrl-intake-trigger-cases.jsonl'
$ctrlIntakeBehaviorCases = Join-Path $Root 'evals\ctrl-intake-behavior-cases.jsonl'
$ctrlCompileTriggerCases = Join-Path $Root 'evals\ctrl-compile-trigger-cases.jsonl'
$ctrlCompileBehaviorCases = Join-Path $Root 'evals\ctrl-compile-behavior-cases.jsonl'
$ctrlBuildTriggerCases = Join-Path $Root 'evals\ctrl-build-trigger-cases.jsonl'
$ctrlBuildBehaviorCases = Join-Path $Root 'evals\ctrl-build-behavior-cases.jsonl'
$ctrlCheckTriggerCases = Join-Path $Root 'evals\ctrl-check-trigger-cases.jsonl'
$ctrlCheckBehaviorCases = Join-Path $Root 'evals\ctrl-check-behavior-cases.jsonl'
$ctrlCaptureTriggerCases = Join-Path $Root 'evals\ctrl-capture-trigger-cases.jsonl'
$ctrlCaptureBehaviorCases = Join-Path $Root 'evals\ctrl-capture-behavior-cases.jsonl'
$decisionLedgerTriggerCases = Join-Path $Root 'evals\decision-ledger-trigger-cases.jsonl'
$decisionLedgerBehaviorCases = Join-Path $Root 'evals\decision-ledger-behavior-cases.jsonl'
$uxFoundationsTriggerCases = Join-Path $Root 'evals\ux-foundations-trigger-cases.jsonl'
$uxFoundationsBehaviorCases = Join-Path $Root 'evals\ux-foundations-behavior-cases.jsonl'
$apifyTriggerCases = Join-Path $Root 'evals\apify-trigger-cases.jsonl'
$apifyBehaviorCases = Join-Path $Root 'evals\apify-behavior-cases.jsonl'
$n8nOperatorTriggerCases = Join-Path $Root 'evals\n8n-operator-trigger-cases.jsonl'
$n8nOperatorBehaviorCases = Join-Path $Root 'evals\n8n-operator-behavior-cases.jsonl'
$instantlyOperatorTriggerCases = Join-Path $Root 'evals\instantly-operator-trigger-cases.jsonl'
$instantlyOperatorBehaviorCases = Join-Path $Root 'evals\instantly-operator-behavior-cases.jsonl'
$designIntelligenceTriggerCases = Join-Path $Root 'evals\design-intelligence-search-trigger-cases.jsonl'
$designIntelligenceBehaviorCases = Join-Path $Root 'evals\design-intelligence-search-behavior-cases.jsonl'
$lockedRevisionTriggerCases = Join-Path $Root 'evals\locked-revision-trigger-cases.jsonl'
$lockedRevisionBehaviorCases = Join-Path $Root 'evals\locked-revision-behavior-cases.jsonl'
$videoEngineTriggerCases = Join-Path $Root 'evals\video-engine-trigger-cases.jsonl'
$videoEngineBehaviorCases = Join-Path $Root 'evals\video-engine-behavior-cases.jsonl'
$designIntelligenceTests = Join-Path $Root 'skills\design-intelligence-search\scripts\tests'
$designIntelligenceVendorRoot = Join-Path $Root 'skills\design-intelligence-search\scripts\vendor\ui-ux-pro-max'
$designIntelligenceMetadata = Join-Path $Root 'skills\design-intelligence-search\agents\openai.yaml'
$apifyHelperTests = Join-Path $Root 'skills\apify\tests'
$lockedRevisionTests = Join-Path $Root 'skills\locked-revision\tests'

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

$maintainerTriggers = @(Read-JsonLines -Path $maintainerTriggerCases)
$maintainerBehaviors = @(Read-JsonLines -Path $maintainerBehaviorCases)
$maintainerRegressions = @(Read-JsonLines -Path $maintainerRegressionCases)
Test-EvalCategoryMinimums -Records $maintainerTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'harness-maintainer trigger suite'
Test-EvalCategoryMinimums -Records $maintainerBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'harness-maintainer behavior suite'
Test-EvalCategoryMinimums -Records $maintainerRegressions -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'harness-maintainer fresh regression suite'

$briefTriggers = @(Read-JsonLines -Path $briefTriggerCases)
$briefBehaviors = @(Read-JsonLines -Path $briefBehaviorCases)
Test-EvalCategoryMinimums -Records $briefTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'take-the-brief trigger suite'
Test-EvalCategoryMinimums -Records $briefBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'take-the-brief behavior suite'

$coreTriggers = @(Read-JsonLines -Path $coreTriggerCases)
foreach ($coreSkill in @('krish-principles', 'strategy-brief', 'verification-loop')) {
    $coreSkillTriggers = @($coreTriggers | Where-Object skill -eq $coreSkill)
    Test-EvalCategoryMinimums -Records $coreSkillTriggers -Minimums @{ positive = 12; negative = 12; adversarial_collision = 8 } -Label "$coreSkill core trigger suite"
}

$coreBehaviors = @(Read-JsonLines -Path $coreBehaviorCases)
foreach ($coreSkill in @('krish-principles', 'strategy-brief', 'verification-loop')) {
    $coreSkillBehaviors = @($coreBehaviors | Where-Object skill -eq $coreSkill)
    Test-EvalCategoryMinimums -Records $coreSkillBehaviors -Minimums @{ nominal = 10; failure_edge = 10; authority_security = 8; handoff_collision = 6 } -Label "$coreSkill core behavior suite"
}

$commercialEvalSpecs = @(
    @{
        Name = 'mindmake'
        TriggerPath = $mindmakeTriggerCases
        BehaviorPath = $mindmakeBehaviorCases
    },
    @{
        Name = 'content-corpus'
        TriggerPath = $contentCorpusTriggerCases
        BehaviorPath = $contentCorpusBehaviorCases
    },
    @{
        Name = 'krish-content-marketer'
        TriggerPath = $contentMarketerTriggerCases
        BehaviorPath = $contentMarketerBehaviorCases
    }
)
foreach ($spec in $commercialEvalSpecs) {
    $commercialTriggers = @(Read-JsonLines -Path $spec.TriggerPath)
    $commercialBehaviors = @(Read-JsonLines -Path $spec.BehaviorPath)
    Test-EvalCategoryMinimums -Records $commercialTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label "$($spec.Name) trigger suite"
    Test-EvalCategoryMinimums -Records $commercialBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label "$($spec.Name) behavior suite"
}

$designTriggers = @(Read-JsonLines -Path $designTriggerCases)
$designBehaviors = @(Read-JsonLines -Path $designBehaviorCases)
Test-EvalCategoryMinimums -Records $designTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'krish-design trigger suite'
Test-EvalCategoryMinimums -Records $designBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'krish-design behavior suite'

$buildTriggers = @(Read-JsonLines -Path $buildTriggerCases)
$buildBehaviors = @(Read-JsonLines -Path $buildBehaviorCases)
Test-EvalCategoryMinimums -Records $buildTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'krish-build trigger suite'
Test-EvalCategoryMinimums -Records $buildBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'krish-build behavior suite'

$researchTriggers = @(Read-JsonLines -Path $researchTriggerCases)
$researchBehaviors = @(Read-JsonLines -Path $researchBehaviorCases)
Test-EvalCategoryMinimums -Records $researchTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'evidence-research trigger suite'
Test-EvalCategoryMinimums -Records $researchBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'evidence-research behavior suite'

$voiceTriggers = @(Read-JsonLines -Path $voiceTriggerCases)
$voiceBehaviors = @(Read-JsonLines -Path $voiceBehaviorCases)
Test-EvalCategoryMinimums -Records $voiceTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'krish-voice trigger suite'
Test-EvalCategoryMinimums -Records $voiceBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'krish-voice behavior suite'

$uxQaTriggers = @(Read-JsonLines -Path $uxQaTriggerCases)
$uxQaBehaviors = @(Read-JsonLines -Path $uxQaBehaviorCases)
Test-EvalCategoryMinimums -Records $uxQaTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'ux-testing-agent trigger suite'
Test-EvalCategoryMinimums -Records $uxQaBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'ux-testing-agent behavior suite'

$toolsAccessTriggers = @(Read-JsonLines -Path $toolsAccessTriggerCases)
$toolsAccessBehaviors = @(Read-JsonLines -Path $toolsAccessBehaviorCases)
Test-EvalCategoryMinimums -Records $toolsAccessTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'tools-access trigger suite'
Test-EvalCategoryMinimums -Records $toolsAccessBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'tools-access behavior suite'

$mindmakeOsTriggers = @(Read-JsonLines -Path $mindmakeOsTriggerCases)
$mindmakeOsBehaviors = @(Read-JsonLines -Path $mindmakeOsBehaviorCases)
Test-EvalCategoryMinimums -Records $mindmakeOsTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'mindmake-os trigger suite'
Test-EvalCategoryMinimums -Records $mindmakeOsBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'mindmake-os behavior suite'

$ctrlIntakeTriggers = @(Read-JsonLines -Path $ctrlIntakeTriggerCases)
$ctrlIntakeBehaviors = @(Read-JsonLines -Path $ctrlIntakeBehaviorCases)
Test-EvalCategoryMinimums -Records $ctrlIntakeTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'ctrl-intake trigger suite'
Test-EvalCategoryMinimums -Records $ctrlIntakeBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'ctrl-intake behavior suite'

$ctrlCompileTriggers = @(Read-JsonLines -Path $ctrlCompileTriggerCases)
$ctrlCompileBehaviors = @(Read-JsonLines -Path $ctrlCompileBehaviorCases)
Test-EvalCategoryMinimums -Records $ctrlCompileTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'ctrl-compile trigger suite'
Test-EvalCategoryMinimums -Records $ctrlCompileBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'ctrl-compile behavior suite'

$ctrlBuildTriggers = @(Read-JsonLines -Path $ctrlBuildTriggerCases)
$ctrlBuildBehaviors = @(Read-JsonLines -Path $ctrlBuildBehaviorCases)
Test-EvalCategoryMinimums -Records $ctrlBuildTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'ctrl-build trigger suite'
Test-EvalCategoryMinimums -Records $ctrlBuildBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'ctrl-build behavior suite'

$ctrlCheckTriggers = @(Read-JsonLines -Path $ctrlCheckTriggerCases)
$ctrlCheckBehaviors = @(Read-JsonLines -Path $ctrlCheckBehaviorCases)
Test-EvalCategoryMinimums -Records $ctrlCheckTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'ctrl-check trigger suite'
Test-EvalCategoryMinimums -Records $ctrlCheckBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'ctrl-check behavior suite'

$ctrlCaptureTriggers = @(Read-JsonLines -Path $ctrlCaptureTriggerCases)
$ctrlCaptureBehaviors = @(Read-JsonLines -Path $ctrlCaptureBehaviorCases)
Test-EvalCategoryMinimums -Records $ctrlCaptureTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'ctrl-capture trigger suite'
Test-EvalCategoryMinimums -Records $ctrlCaptureBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'ctrl-capture behavior suite'

$decisionLedgerTriggers = @(Read-JsonLines -Path $decisionLedgerTriggerCases)
$decisionLedgerBehaviors = @(Read-JsonLines -Path $decisionLedgerBehaviorCases)
Test-EvalCategoryMinimums -Records $decisionLedgerTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'decision-ledger trigger suite'
Test-EvalCategoryMinimums -Records $decisionLedgerBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'decision-ledger behavior suite'

$uxFoundationsTriggers = @(Read-JsonLines -Path $uxFoundationsTriggerCases)
$uxFoundationsBehaviors = @(Read-JsonLines -Path $uxFoundationsBehaviorCases)
Test-EvalCategoryMinimums -Records $uxFoundationsTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'ux-foundations trigger suite'
Test-EvalCategoryMinimums -Records $uxFoundationsBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'ux-foundations behavior suite'

$apifyTriggers = @(Read-JsonLines -Path $apifyTriggerCases)
$apifyBehaviors = @(Read-JsonLines -Path $apifyBehaviorCases)
Test-EvalCategoryMinimums -Records $apifyTriggers -Minimums @{ positive = 8; negative = 8; adversarial_collision = 5 } -Label 'apify trigger suite'
Test-EvalCategoryMinimums -Records $apifyBehaviors -Minimums @{ nominal = 6; failure_edge = 8; authority_security = 5; handoff_collision = 4 } -Label 'apify behavior suite'

$narrowOperatorSpecs = @(
    @{ Name = 'n8n-operator'; TriggerPath = $n8nOperatorTriggerCases; BehaviorPath = $n8nOperatorBehaviorCases },
    @{ Name = 'instantly-operator'; TriggerPath = $instantlyOperatorTriggerCases; BehaviorPath = $instantlyOperatorBehaviorCases },
    @{ Name = 'design-intelligence-search'; TriggerPath = $designIntelligenceTriggerCases; BehaviorPath = $designIntelligenceBehaviorCases },
    @{ Name = 'locked-revision'; TriggerPath = $lockedRevisionTriggerCases; BehaviorPath = $lockedRevisionBehaviorCases },
    @{ Name = 'video-engine'; TriggerPath = $videoEngineTriggerCases; BehaviorPath = $videoEngineBehaviorCases }
)
foreach ($spec in $narrowOperatorSpecs) {
    $operatorTriggers = @(Read-JsonLines -Path $spec.TriggerPath)
    $operatorBehaviors = @(Read-JsonLines -Path $spec.BehaviorPath)
    Test-EvalCategoryMinimums -Records $operatorTriggers -Minimums @{ positive = 5; negative = 5; adversarial_collision = 3 } -Label "$($spec.Name) trigger suite"
    Test-EvalCategoryMinimums -Records $operatorBehaviors -Minimums @{ nominal = 4; failure_edge = 5; authority_security = 4; handoff_collision = 3 } -Label "$($spec.Name) behavior suite"
}

$pythonCommand = Get-Command python -ErrorAction SilentlyContinue

if (-not (Test-Path -LiteralPath $designIntelligenceMetadata -PathType Leaf)) {
    Add-Failure 'Missing design-intelligence-search OpenAI metadata.'
}
elseif ([IO.File]::ReadAllText($designIntelligenceMetadata) -notmatch '(?m)^\s*allow_implicit_invocation:\s*false\s*$') {
    Add-Failure 'design-intelligence-search is not explicitly manual-only in agents/openai.yaml.'
}

if ($null -eq $pythonCommand) {
    Add-Failure 'Python is unavailable for the design-intelligence-search offline regression suite.'
}
elseif (-not (Test-Path -LiteralPath $designIntelligenceTests -PathType Container)) {
    Add-Failure "Missing design-intelligence-search test directory: $designIntelligenceTests"
}
elseif (-not (Test-Path -LiteralPath (Join-Path $designIntelligenceVendorRoot 'scripts\validate_data.py') -PathType Leaf)) {
    Add-Failure 'Missing pinned UI/UX Pro Max data validator.'
}
else {
    $priorErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $designIntelligenceTestOutput = @(& $pythonCommand.Source -B -m unittest discover -s $designIntelligenceTests -p 'test_*.py' 2>&1)
        $designIntelligenceTestExitCode = $LASTEXITCODE
        Push-Location $designIntelligenceVendorRoot
        try {
            $designIntelligenceVendorTestOutput = @(& $pythonCommand.Source -B -m unittest discover -s 'scripts\tests' -p 'test_*.py' 2>&1)
            $designIntelligenceVendorTestExitCode = $LASTEXITCODE
            $designIntelligenceValidationOutput = @(& $pythonCommand.Source -B 'scripts\validate_data.py' 2>&1)
            $designIntelligenceValidationExitCode = $LASTEXITCODE
        }
        finally { Pop-Location }
    }
    finally {
        $ErrorActionPreference = $priorErrorActionPreference
    }
    if ($designIntelligenceTestExitCode -ne 0) {
        Add-Failure "design-intelligence-search adapter tests failed: $($designIntelligenceTestOutput -join ' | ')"
    }
    if ($designIntelligenceVendorTestExitCode -ne 0) {
        Add-Failure "Pinned UI/UX Pro Max tests failed: $($designIntelligenceVendorTestOutput -join ' | ')"
    }
    if ($designIntelligenceValidationExitCode -ne 0) {
        Add-Failure "Pinned UI/UX Pro Max data validation failed: $($designIntelligenceValidationOutput -join ' | ')"
    }
}

if ($null -eq $pythonCommand) {
    Add-Failure 'Python is unavailable for the Apify helper offline regression suite.'
}
elseif (-not (Test-Path -LiteralPath $apifyHelperTests -PathType Container)) {
    Add-Failure "Missing Apify helper test directory: $apifyHelperTests"
}
else {
    $priorErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $apifyTestOutput = @(& $pythonCommand.Source -B -m unittest discover -s $apifyHelperTests -p 'test_*.py' 2>&1)
        $apifyTestExitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $priorErrorActionPreference
    }
    if ($apifyTestExitCode -ne 0) {
        Add-Failure "Apify helper offline tests failed: $($apifyTestOutput -join ' | ')"
    }
}

if ($null -eq $pythonCommand) {
    Add-Failure 'Python is unavailable for the locked-revision offline regression suite.'
}
elseif (-not (Test-Path -LiteralPath $lockedRevisionTests -PathType Container)) {
    Add-Failure "Missing locked-revision test directory: $lockedRevisionTests"
}
else {
    $priorErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $lockedRevisionTestOutput = @(& $pythonCommand.Source -B -m unittest discover -s $lockedRevisionTests -p 'test_*.py' 2>&1)
        $lockedRevisionTestExitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $priorErrorActionPreference
    }
    if ($lockedRevisionTestExitCode -ne 0) {
        Add-Failure "locked-revision offline tests failed: $($lockedRevisionTestOutput -join ' | ')"
    }
}

$globalChains = @(Read-JsonLines -Path $globalChainCases)
$skillRoutes = @(Read-JsonLines -Path $skillRoutingCases)
Test-EvalCategoryMinimums -Records $globalChains -Minimums @{} -Label 'global chain suite'
Test-EvalCategoryMinimums -Records $skillRoutes -Minimums @{} -Label 'skill routing suite'

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
