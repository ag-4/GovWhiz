# UK Parliament News Scraper PowerShell Script
# Enhanced version with better error handling and features

param(
    [string]$Action = "",
    [string]$Source = ""
)

function Show-Header {
    Write-Host "======================================================" -ForegroundColor Cyan
    Write-Host "🚀 UK Parliament News Scraper" -ForegroundColor Yellow
    Write-Host "======================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Menu {
    Write-Host "Choose an option:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. Quick Test (BBC Politics only, no AI)" -ForegroundColor White
    Write-Host "2. Full Scraper (All sources with AI)" -ForegroundColor White
    Write-Host "3. Test Single Source" -ForegroundColor White
    Write-Host "4. List Available Sources" -ForegroundColor White
    Write-Host "5. Show Help" -ForegroundColor White
    Write-Host "6. Open Demo Website" -ForegroundColor White
    Write-Host "7. Exit" -ForegroundColor White
    Write-Host ""
}

function Test-PythonInstallation {
    try {
        $pythonVersion = python --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "❌ Python not found. Please install Python first." -ForegroundColor Red
        Write-Host "Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
        return $false
    }
    return $false
}

function Install-Dependencies {
    Write-Host "🔧 Checking and installing required dependencies..." -ForegroundColor Yellow
    
    $packages = @("feedparser", "requests")
    
    foreach ($package in $packages) {
        Write-Host "Installing $package..." -ForegroundColor Cyan
        python -m pip install $package --quiet
    }
    
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
}

function Run-QuickTest {
    Write-Host ""
    Write-Host "🚀 Running Quick Test..." -ForegroundColor Yellow
    Write-Host ""
    
    python fetch_news.py --quick
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Quick test completed successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Quick test failed. Check the error messages above." -ForegroundColor Red
    }
}

function Run-FullScraper {
    Write-Host ""
    Write-Host "🚀 Running Full Scraper with AI..." -ForegroundColor Yellow
    Write-Host "This may take several minutes on first run to download AI models." -ForegroundColor Cyan
    Write-Host ""
    
    python fetch_news.py
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Full scraper completed successfully!" -ForegroundColor Green
        Write-Host "📁 Check data/latest_news.json for results" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Full scraper failed. Check the error messages above." -ForegroundColor Red
    }
}

function Test-SingleSource {
    Write-Host ""
    Write-Host "Available sources: bbc_politics, parliament_news, gov_uk" -ForegroundColor Cyan
    
    if (-not $Source) {
        $Source = Read-Host "Enter source key"
    }
    
    Write-Host ""
    Write-Host "🚀 Testing source: $Source" -ForegroundColor Yellow
    Write-Host ""
    
    python fetch_news.py --source $Source
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Source test completed successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Source test failed. Check the error messages above." -ForegroundColor Red
    }
}

function Show-Sources {
    Write-Host ""
    Write-Host "📰 Listing Available Sources..." -ForegroundColor Yellow
    Write-Host ""
    
    python fetch_news.py --list-sources
}

function Show-Help {
    Write-Host ""
    Write-Host "📖 Showing Help..." -ForegroundColor Yellow
    Write-Host ""
    
    python fetch_news.py --help
}

function Open-Demo {
    Write-Host ""
    Write-Host "🌐 Opening Demo Website..." -ForegroundColor Yellow
    
    if (Test-Path "news-scraper-demo.html") {
        Start-Process "news-scraper-demo.html"
        Write-Host "✅ Demo website opened in your default browser!" -ForegroundColor Green
    } else {
        Write-Host "❌ Demo file not found: news-scraper-demo.html" -ForegroundColor Red
    }
}

# Main script execution
Show-Header

# Check if Python is installed
if (-not (Test-PythonInstallation)) {
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies
Install-Dependencies

# Handle command line parameters
if ($Action) {
    switch ($Action.ToLower()) {
        "quick" { Run-QuickTest; exit }
        "full" { Run-FullScraper; exit }
        "source" { Test-SingleSource; exit }
        "list" { Show-Sources; exit }
        "help" { Show-Help; exit }
        "demo" { Open-Demo; exit }
        default { 
            Write-Host "❌ Unknown action: $Action" -ForegroundColor Red
            Show-Help
            exit 1
        }
    }
}

# Interactive menu
do {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-7)"
    
    switch ($choice) {
        "1" { Run-QuickTest }
        "2" { Run-FullScraper }
        "3" { Test-SingleSource }
        "4" { Show-Sources }
        "5" { Show-Help }
        "6" { Open-Demo }
        "7" { 
            Write-Host ""
            Write-Host "👋 Goodbye!" -ForegroundColor Yellow
            Write-Host ""
            exit 
        }
        default { 
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
            Write-Host ""
        }
    }
    
    if ($choice -ne "7") {
        Write-Host ""
        Read-Host "Press Enter to continue"
        Clear-Host
        Show-Header
    }
} while ($true)
