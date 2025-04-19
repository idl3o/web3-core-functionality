# PowerShell script to download Web3 project assets
# This script downloads various assets needed for the project

# Configuration
$assetsConfig = @{
    # Main project assets
    "images" = @{
        "directory" = "..\assets\images\"
        "files" = @(
            @{
                "url" = "https://cdn.example.com/web3/education/blockchain-basics.jpg"
                "filename" = "education\blockchain-basics.jpg"
            },
            @{
                "url" = "https://cdn.example.com/web3/education/game-theory.jpg" 
                "filename" = "education\game-theory.jpg"
            },
            @{
                "url" = "https://cdn.example.com/web3/education/web3-intro.jpg"
                "filename" = "education\web3-intro.jpg"
            },
            @{
                "url" = "https://cdn.example.com/web3/education/blockchain-structure.png"
                "filename" = "education\blockchain-structure.png"
            },
            @{
                "url" = "https://cdn.example.com/web3/education/game-theory-matrix.png"
                "filename" = "education\game-theory-matrix.png"
            },
            @{
                "url" = "https://cdn.example.com/web3/education/blockchain-fork.png"
                "filename" = "education\blockchain-fork.png"
            },
            @{
                "url" = "https://cdn.example.com/web3/education/prisoners-dilemma.png"
                "filename" = "education\prisoners-dilemma.png"
            },
            @{
                "url" = "https://cdn.example.com/web3/favicon.ico"
                "filename" = "favicon.ico"
            }
        )
    }
    
    # Icon sets
    "icons" = @{
        "directory" = "..\assets\images\icons\"
        "files" = @(
            @{
                "url" = "https://cdn.example.com/web3/icons/ethereum.svg"
                "filename" = "ethereum.svg"
            },
            @{
                "url" = "https://cdn.example.com/web3/icons/wallet.svg"
                "filename" = "wallet.svg"
            },
            @{
                "url" = "https://cdn.example.com/web3/icons/token.svg"
                "filename" = "token.svg"
            }
        )
    }
    
    # Video placeholders
    "videos" = @{
        "directory" = "..\assets\videos\"
        "files" = @(
            @{
                "url" = "https://cdn.example.com/web3/videos/consensus-mechanisms.mp4"
                "filename" = "consensus-mechanisms.mp4"
            }
        )
    }
    
    # Sample data files
    "data" = @{
        "directory" = "..\assets\data\"
        "files" = @(
            @{
                "url" = "https://cdn.example.com/web3/data/token-economics.json"
                "filename" = "token-economics.json"
            },
            @{
                "url" = "https://cdn.example.com/web3/data/network-stats.json"
                "filename" = "network-stats.json"
            }
        )
    }
}

function DownloadFile($url, $filePath) {
    try {
        # Create directory if it doesn't exist
        $directory = [System.IO.Path]::GetDirectoryName($filePath)
        if (-not (Test-Path -Path $directory)) {
            New-Item -Path $directory -ItemType Directory -Force | Out-Null
        }
        
        # Message the download attempt
        Write-Host "Downloading $url to $filePath" -ForegroundColor Cyan
        
        # Check if we're using a placeholder URL from example.com
        if ($url -match "example\.com") {
            # Create a placeholder file instead of downloading
            Write-Host "  Using placeholder file (example.com URL detected)" -ForegroundColor Yellow
            
            # Determine file type from extension
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            
            switch ($extension) {
                ".jpg" {
                    Write-Host "  Creating placeholder JPG image..." -ForegroundColor Yellow
                    # Instead of downloading, we'll create a text file explaining this is a placeholder
                    Set-Content -Path $filePath -Value "This is a placeholder JPG file. Replace with actual content."
                }
                ".png" {
                    Write-Host "  Creating placeholder PNG image..." -ForegroundColor Yellow
                    Set-Content -Path $filePath -Value "This is a placeholder PNG file. Replace with actual content."
                }
                ".svg" {
                    Write-Host "  Creating placeholder SVG image..." -ForegroundColor Yellow
                    Set-Content -Path $filePath -Value "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='#ccc'/><text x='50%' y='50%' text-anchor='middle' fill='#333'>Placeholder</text></svg>"
                }
                ".json" {
                    Write-Host "  Creating placeholder JSON file..." -ForegroundColor Yellow
                    Set-Content -Path $filePath -Value "{ `"note`": `"This is a placeholder JSON file. Replace with actual content.`" }"
                }
                ".mp4" {
                    Write-Host "  Creating placeholder MP4 file note..." -ForegroundColor Yellow
                    Set-Content -Path $filePath -Value "This is a placeholder MP4 file. Replace with actual video content."
                }
                default {
                    Write-Host "  Creating generic placeholder file..." -ForegroundColor Yellow
                    Set-Content -Path $filePath -Value "This is a placeholder file. Replace with actual content."
                }
            }
        }
        else {
            # Actually download the file
            Invoke-WebRequest -Uri $url -OutFile $filePath
            Write-Host "  Downloaded successfully" -ForegroundColor Green
        }
        
        return $true
    }
    catch {
        Write-Host "  Failed to download: $_" -ForegroundColor Red
        return $false
    }
}

function DownloadAssetGroup($group) {
    $basePath = Join-Path $PSScriptRoot $group.directory
    
    # Create base directory if it doesn't exist
    if (-not (Test-Path -Path $basePath)) {
        New-Item -Path $basePath -ItemType Directory -Force | Out-Null
        Write-Host "Created directory: $basePath" -ForegroundColor Yellow
    }
    
    $successCount = 0
    $failCount = 0
    
    foreach ($file in $group.files) {
        $filePath = Join-Path $basePath $file.filename
        $result = DownloadFile $file.url $filePath
        
        if ($result) {
            $successCount++
        }
        else {
            $failCount++
        }
    }
    
    return @{
        "success" = $successCount
        "fail" = $failCount
    }
}

# Main execution
Write-Host "Starting asset downloads for Web3 Core Functionality project..." -ForegroundColor Cyan
Write-Host "Script location: $PSScriptRoot" -ForegroundColor Gray

$totalSuccess = 0
$totalFail = 0

foreach ($category in $assetsConfig.Keys) {
    Write-Host "`nDownloading $category..." -ForegroundColor Magenta
    $result = DownloadAssetGroup $assetsConfig[$category]
    
    $totalSuccess += $result.success
    $totalFail += $result.fail
    
    Write-Host "Completed $($category): $($result.success) successful, $($result.fail) failed" -ForegroundColor Magenta
}

Write-Host "`n=== Asset Download Summary ===" -ForegroundColor Cyan
Write-Host "Total files processed: $($totalSuccess + $totalFail)" -ForegroundColor Cyan
Write-Host "Successfully downloaded/created: $totalSuccess" -ForegroundColor Green
if ($totalFail -gt 0) {
    Write-Host "Failed downloads: $totalFail" -ForegroundColor Red
}

Write-Host "`nNOTE: Files with example.com URLs were created as placeholders." -ForegroundColor Yellow
Write-Host "      Replace them with actual content when available." -ForegroundColor Yellow
Write-Host "`nAsset download process completed!" -ForegroundColor Cyan