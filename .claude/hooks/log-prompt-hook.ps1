param()

# Resolve the repo root from this script's location (.claude/hooks/ → .claude/ → repo root)
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$baseLogDir = Join-Path (Join-Path $repoRoot '.claude') 'logs'

$data = $input | Out-String | ConvertFrom-Json

$promptText = if ($data.prompt) {
    ($data.prompt -split "`r?`n" | ForEach-Object { "> $_" }) -join "`n"
} else {
    '> (prompt not captured)'
}

# Run git commands from the repo root so they always resolve
$author = (git -C $repoRoot config user.name 2>$null)
if (-not $author) { $author = (git -C $repoRoot config user.email 2>$null) }
if (-not $author) { $author = 'unknown' }

# Sanitize the author name so it is safe as a directory name
$sanitizedAuthor = ($author -replace '[\\/:*?"<>|\s]+', '-').Trim('-').Trim('.')
if ([string]::IsNullOrWhiteSpace($sanitizedAuthor)) { $sanitizedAuthor = 'unknown' }

$branch = (git -C $repoRoot branch --show-current 2>$null)
if (-not $branch) { $branch = 'N/A' }

# Determine the model used for this prompt.
# Resolution order:
#   1. Payload model field (if present)
#   2. OLLAMA_MODEL environment variable
#   3. Currently running Ollama model via /api/ps
#   4. Claude Code environment variables (cloud / non-Ollama models)
#   5. Fallback to 'unknown'
$model = if ($data.model) { $data.model } else { $null }
if (-not $model) { $model = $env:OLLAMA_MODEL }
if (-not $model) {
    $ollamaHost = if ($env:OLLAMA_HOST) { $env:OLLAMA_HOST } else { 'http://localhost:11434' }
    try {
        $psResponse = Invoke-RestMethod -Uri "$ollamaHost/api/ps" -TimeoutSec 1 -ErrorAction Stop
        if ($psResponse.models -and $psResponse.models.Count -gt 0) {
            $model = $psResponse.models[0].name
        }
    } catch {
        $model = $null
    }
}
if (-not $model) { $model = $env:ANTHROPIC_MODEL }
if (-not $model) { $model = $env:CLAUDE_CODE_SUBAGENT_MODEL }
if (-not $model) { $model = $env:ANTHROPIC_DEFAULT_SONNET_MODEL }
if (-not $model) { $model = $env:ANTHROPIC_DEFAULT_OPUS_MODEL }
if (-not $model) { $model = $env:ANTHROPIC_DEFAULT_HAIKU_MODEL }
if (-not $model) { $model = 'unknown' }

$now     = Get-Date
$date    = $now.ToString('yyyy-MM-dd')
$time    = $now.ToString('HH:mm')

# One log file per person to avoid merge conflicts in shared repos
$logDir  = Join-Path $baseLogDir $sanitizedAuthor
$logFile = Join-Path $logDir "$date.md"

if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

if (-not (Test-Path $logFile)) {
    Set-Content -Path $logFile -Encoding utf8 -Value @"
# Prompt Log - $date - $author

---
"@
}

$entry = @"

**Prompt:**
$promptText

| Field  | Value       |
|--------|-------------|
| Time   | $time       |
| Author | $author     |
| Branch | $branch     |
| Model  | $model |

---
"@

Add-Content -Path $logFile -Encoding utf8 -Value $entry
