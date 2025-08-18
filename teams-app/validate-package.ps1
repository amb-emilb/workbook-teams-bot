Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipPath = "workbook-teams-app-production.zip"
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)

Write-Host "Teams App Package Contents:" -ForegroundColor Green
$foundFiles = @()
foreach ($entry in $zip.Entries) {
    Write-Host "- $($entry.Name) ($($entry.Length) bytes)" -ForegroundColor White
    $foundFiles += $entry.Name
}

$zip.Dispose()

# Check for required files
$requiredFiles = @("manifest.json", "icon-color.png", "icon-outline.png")

Write-Host ""
Write-Host "Validation Results:" -ForegroundColor Cyan
$allFound = $true
foreach ($required in $requiredFiles) {
    if ($foundFiles -contains $required) {
        Write-Host "checkmark $required found" -ForegroundColor Green
    } else {
        Write-Host "cross $required MISSING" -ForegroundColor Red  
        $allFound = $false
    }
}

if ($allFound) {
    Write-Host ""
    Write-Host "checkmark Package validation PASSED" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "cross Package validation FAILED" -ForegroundColor Red
}