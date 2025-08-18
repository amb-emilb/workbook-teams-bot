# SECURITY NOTICE: This file contains sensitive credentials and should NOT be committed to version control
# TODO: Move these credentials to a secure location (e.g., environment variables or Azure Key Vault)

# Bot credentials - these should be sourced from secure storage
$BOT_APP_ID = "f076c31d-88e0-4d99-9b3f-e91016e1972c"
$BOT_APP_PASSWORD = "h.Y8Q~GZJ2GBD_cCBdlx9qD9~77t0WpIyawMPdzs"

# Repository configuration
$REPOSITORY_NAME = "amb-emilb/workbook-teams-bot"

Write-Host "⚠️  WARNING: This script contains hardcoded secrets!" -ForegroundColor Red
Write-Host "For production use, please:" -ForegroundColor Yellow
Write-Host "1. Store secrets in Azure Key Vault or environment variables" -ForegroundColor Yellow
Write-Host "2. Never commit this file with actual secrets to version control" -ForegroundColor Yellow
Write-Host "3. Use secure credential management practices" -ForegroundColor Yellow
Write-Host ""

# Convert to secure string
$securePassword = ConvertTo-SecureString $BOT_APP_PASSWORD -AsPlainText -Force

# Clear the plain text password from memory
$BOT_APP_PASSWORD = $null

# Run the setup script with secure parameters
.\setup-github-secrets.ps1 -RepositoryName $REPOSITORY_NAME -BotAppId $BOT_APP_ID -BotAppPassword $securePassword

Write-Host ""
Write-Host "✅ Setup completed" -ForegroundColor Green
Write-Host "⚠️  Remember to remove or secure this file!" -ForegroundColor Yellow