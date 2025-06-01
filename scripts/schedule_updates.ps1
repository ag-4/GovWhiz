# Schedule the MP database update to run daily
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$parentPath = Split-Path -Parent $scriptPath
$pythonScript = Join-Path $scriptPath "update_mp_cron.py"
$logPath = Join-Path $parentPath "logs"
$dbPath = Join-Path $parentPath "data/mp_database.json"

# Create required directories
New-Item -ItemType Directory -Force -Path $logPath
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $dbPath)

# Create the scheduled task
$taskName = "GovWhiz MP Database Update"
$taskDescription = "Updates the MP database with latest information daily"
$action = New-ScheduledTaskAction -Execute "python" -Argument "`"$pythonScript`" --database `"$dbPath`" --log-file `"$logPath/mp_updater.log`""
$trigger = New-ScheduledTaskTrigger -Daily -At 3AM
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType S4U -RunLevel Highest

# Register the task
Register-ScheduledTask -TaskName $taskName -Description $taskDescription -Action $action -Trigger $trigger -Principal $principal -Force

Write-Host "✓ MP Database Update task scheduled successfully"
Write-Host "  - Task Name: $taskName"
Write-Host "  - Runs at: 3 AM daily"
Write-Host "  - Script: $pythonScript"
Write-Host "  - Database: $dbPath"
Write-Host "  - Logs: $logPath/mp_updater.log"
