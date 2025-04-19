# PowerShell script to run multiple commands in sequence
# Use this instead of concatenating commands with &&

param (
    [string[]]$Commands
)

# Set error action preference
$ErrorActionPreference = 'Stop'

Write-Host "Running commands in sequence..." -ForegroundColor Cyan

foreach ($cmd in $Commands) {
    Write-Host "`n>> Executing: $cmd" -ForegroundColor Green
    
    try {
        # Execute the command
        Invoke-Expression $cmd
        
        if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) {
            Write-Host "Command failed with exit code: $LASTEXITCODE" -ForegroundColor Red
            exit $LASTEXITCODE
        }
    }
    catch {
        Write-Host "Error executing command: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nAll commands completed successfully!" -ForegroundColor Cyan