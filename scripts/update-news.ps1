# Update BBC Politics news feed
$ErrorActionPreference = "Stop"

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Split-Path -Parent $scriptPath

# Run the news fetcher
Write-Host "Starting news update at $(Get-Date)"
try {
    & python "$projectRoot\scripts\news-fetcher.py"
    Write-Host "News update completed successfully"
} catch {
    Write-Error "Failed to update news: $_"
    exit 1
}
