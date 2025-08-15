# PowerShell script to package Teams app for deployment
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "production"
)

Write-Host "📦 Packaging Teams App for $Environment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Set paths
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$manifestFile = switch ($Environment) {
    "development" { "manifest.json" }
    "staging" { "manifest.staging.json" }
    "production" { "manifest.production.json" }
}

$manifestPath = Join-Path $scriptPath $manifestFile
$outputFile = "workbook-teams-app-$Environment.zip"
$outputPath = Join-Path $scriptPath $outputFile

# Check if manifest exists
if (-not (Test-Path $manifestPath)) {
    if ($Environment -ne "development") {
        Write-Host "⚠️ $manifestFile not found, using default manifest.json" -ForegroundColor Yellow
        $manifestPath = Join-Path $scriptPath "manifest.json"
    } else {
        Write-Host "❌ Manifest file not found: $manifestPath" -ForegroundColor Red
        exit 1
    }
}

# Validate required files
$requiredFiles = @(
    "icon-color.png",
    "icon-outline.png"
)

foreach ($file in $requiredFiles) {
    $filePath = Join-Path $scriptPath $file
    if (-not (Test-Path $filePath)) {
        Write-Host "❌ Required file missing: $file" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ All required files found" -ForegroundColor Green

# Remove old package if exists
if (Test-Path $outputPath) {
    Remove-Item $outputPath
    Write-Host "🗑️ Removed old package" -ForegroundColor Yellow
}

# Create the zip package
Write-Host "📦 Creating Teams app package..." -ForegroundColor Yellow

# Load manifest to update endpoint
$manifest = Get-Content $manifestPath | ConvertFrom-Json

# Update bot messaging endpoint based on environment
$botEndpoint = switch ($Environment) {
    "development" { "https://localhost:8000/api/messages" }
    "staging" { "https://workbook-teams-bot-staging.azurewebsites.net/api/messages" }
    "production" { "https://workbook-teams-bot.azurewebsites.net/api/messages" }
}

# Add messaging endpoint to bot configuration
if ($manifest.bots -and $manifest.bots.Count -gt 0) {
    # Ensure messagingEndpoint property exists
    if (-not $manifest.bots[0].PSObject.Properties["messagingEndpoint"]) {
        $manifest.bots[0] | Add-Member -NotePropertyName "messagingEndpoint" -NotePropertyValue $botEndpoint
    } else {
        $manifest.bots[0].messagingEndpoint = $botEndpoint
    }
}

# Save updated manifest temporarily
$tempManifest = Join-Path $scriptPath "manifest.temp.json"
$manifest | ConvertTo-Json -Depth 10 | Set-Content $tempManifest

# Create zip file
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open($outputPath, 'Create')

# Add manifest
$manifestEntry = $zip.CreateEntry("manifest.json")
$manifestStream = $manifestEntry.Open()
$manifestBytes = [System.IO.File]::ReadAllBytes($tempManifest)
$manifestStream.Write($manifestBytes, 0, $manifestBytes.Length)
$manifestStream.Close()

# Add icons
foreach ($iconFile in @("icon-color.png", "icon-outline.png")) {
    $iconPath = Join-Path $scriptPath $iconFile
    $iconEntry = $zip.CreateEntry($iconFile)
    $iconStream = $iconEntry.Open()
    $iconBytes = [System.IO.File]::ReadAllBytes($iconPath)
    $iconStream.Write($iconBytes, 0, $iconBytes.Length)
    $iconStream.Close()
}

# Close zip file
$zip.Dispose()

# Clean up temp manifest
Remove-Item $tempManifest

Write-Host "✅ Teams app package created: $outputFile" -ForegroundColor Green

# Validate the package
Write-Host "🔍 Validating package structure..." -ForegroundColor Yellow

$validation = @{
    Valid = $true
    Issues = @()
}

# Check file size (must be less than 30MB)
$fileInfo = Get-Item $outputPath
$sizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
if ($sizeMB -gt 30) {
    $validation.Valid = $false
    $validation.Issues += "Package size ($sizeMB MB) exceeds 30MB limit"
}

# Verify zip contents
$zipContents = [System.IO.Compression.ZipFile]::OpenRead($outputPath)
$entries = $zipContents.Entries | ForEach-Object { $_.Name }
$zipContents.Dispose()

$requiredEntries = @("manifest.json", "icon-color.png", "icon-outline.png")
foreach ($required in $requiredEntries) {
    if ($entries -notcontains $required) {
        $validation.Valid = $false
        $validation.Issues += "Missing required file: $required"
    }
}

if ($validation.Valid) {
    Write-Host "✅ Package validation passed" -ForegroundColor Green
} else {
    Write-Host "❌ Package validation failed:" -ForegroundColor Red
    foreach ($issue in $validation.Issues) {
        Write-Host "   - $issue" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "📦 Teams App Package Ready!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Package details:" -ForegroundColor Cyan
Write-Host "• Environment: $Environment" -ForegroundColor White
Write-Host "• File: $outputFile" -ForegroundColor White
Write-Host "• Size: $sizeMB MB" -ForegroundColor White
Write-Host "• Bot endpoint: $botEndpoint" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Upload package to Teams Admin Center:" -ForegroundColor White
Write-Host "   https://admin.teams.microsoft.com/policies/manage-apps" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Or sideload for testing:" -ForegroundColor White
Write-Host "   Teams > Apps > Upload a custom app" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Configure app policies for organization-wide deployment" -ForegroundColor White