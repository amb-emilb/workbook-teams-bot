# Simple Teams app package creation script
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "production")]
    [string]$Environment = "production"
)

Write-Host "Creating Teams App Package for $Environment" -ForegroundColor Green

# Set paths
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$manifestFile = if ($Environment -eq "production") { "manifest.production.json" } else { "manifest.json" }
$manifestPath = Join-Path $scriptPath $manifestFile
$outputFile = "workbook-teams-app-$Environment.zip"
$outputPath = Join-Path $scriptPath $outputFile

# Check if manifest exists
if (-not (Test-Path $manifestPath)) {
    Write-Host "ERROR: Manifest file not found: $manifestPath" -ForegroundColor Red
    exit 1
}

# Check required files
$requiredFiles = @("icon-color.png", "icon-outline.png")
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $scriptPath $file
    if (-not (Test-Path $filePath)) {
        Write-Host "ERROR: Required file missing: $file" -ForegroundColor Red
        exit 1
    }
}

Write-Host "All required files found" -ForegroundColor Green

# Remove old package if exists
if (Test-Path $outputPath) {
    Remove-Item $outputPath
    Write-Host "Removed old package" -ForegroundColor Yellow
}

# Create the zip package
Write-Host "Creating Teams app package..." -ForegroundColor Yellow

# Create zip file
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($outputPath, "Create")

# Add manifest as manifest.json (Teams expects this name)
$manifestEntry = $zip.CreateEntry("manifest.json")
$manifestStream = $manifestEntry.Open()
$manifestBytes = [System.IO.File]::ReadAllBytes($manifestPath)
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

# Get file size
$fileInfo = Get-Item $outputPath
$sizeMB = [math]::Round($fileInfo.Length / 1MB, 2)

Write-Host "Teams app package created successfully!" -ForegroundColor Green
Write-Host "File: $outputFile" -ForegroundColor White
Write-Host "Size: $sizeMB MB" -ForegroundColor White

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Upload to Teams Admin Center" -ForegroundColor White
Write-Host "   https://admin.teams.microsoft.com/policies/manage-apps" -ForegroundColor Yellow
Write-Host "2. Or sideload for testing in Teams client" -ForegroundColor White