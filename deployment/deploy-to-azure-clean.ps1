# PowerShell script to deploy Workbook Teams Bot to Azure
# Prerequisites: Azure CLI installed and logged in
#
# Usage: .\deployment\deploy-to-azure-clean.ps1 `
#          -BotAppId "your-app-id" `
#          -BotAppPassword (Read-Host -AsSecureString "Bot App Password") `
#          -WorkbookApiKeyDev (Read-Host -AsSecureString "Workbook API Key (Dev)") `
#          -WorkbookPasswordDev (Read-Host -AsSecureString "Workbook Password (Dev)")

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "workbook-teams-westeurope",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "westeurope",
    
    [Parameter(Mandatory=$false)]
    [string]$AppServiceName = "workbook-teams-bot",
    
    [Parameter(Mandatory=$true)]
    [string]$BotAppId,
    
    [Parameter(Mandatory=$true)]
    [SecureString]$BotAppPassword,
    
    [Parameter(Mandatory=$true)]
    [SecureString]$WorkbookApiKeyDev,
    
    [Parameter(Mandatory=$true)]
    [SecureString]$WorkbookPasswordDev,
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "development"
)

Write-Host "[DEPLOY] Deploying Workbook Teams Bot to Azure" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if Azure CLI is installed
try {
    az version | Out-Null
    Write-Host "[OK] Azure CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Azure CLI is not installed. Please install it first." -ForegroundColor Red
    Write-Host "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Azure
$account = az account show 2>$null
if (-not $account) {
    Write-Host "[WARNING] Not logged in to Azure. Running 'az login'..." -ForegroundColor Yellow
    az login
}

Write-Host "[BUILD] Building application..." -ForegroundColor Yellow

# Build the TypeScript application
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Build completed" -ForegroundColor Green

# Create resource group if it doesn't exist
Write-Host "[SETUP] Creating resource group '$ResourceGroupName' in '$Location'..." -ForegroundColor Yellow
az group create --name $ResourceGroupName --location $Location --output none

# Use fixed Key Vault name to prevent duplicates
$keyVaultName = "workbook-bot-kv-3821"
Write-Host "[INFO] Using Key Vault name: $keyVaultName" -ForegroundColor Cyan

# Deploy ARM template (uses incremental mode - updates existing resources)
Write-Host "[AZURE] Deploying/updating Azure resources..." -ForegroundColor Yellow
$deploymentResult = az deployment group create `
    --resource-group $ResourceGroupName `
    --template-file deployment/azure-deploy.json `
    --parameters appServiceName=$AppServiceName botAppId=$BotAppId keyVaultName=$keyVaultName `
    --mode Incremental `
    --query "properties.outputs" `
    --output json | ConvertFrom-Json

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] ARM template deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Azure resources created successfully" -ForegroundColor Green
Write-Host "   App Service URL: $($deploymentResult.appServiceUrl.value)" -ForegroundColor Cyan
Write-Host "   App Insights Key: $($deploymentResult.appInsightsInstrumentationKey.value)" -ForegroundColor Cyan

# Store bot credentials in Key Vault
Write-Host "[SECRETS] Storing bot credentials in Key Vault..." -ForegroundColor Yellow

# Get current user object ID and add access policy
Write-Host "[PERMISSIONS] Setting Key Vault access permissions..." -ForegroundColor Yellow
$currentUser = az ad signed-in-user show --query id -o tsv
Write-Host "[INFO] Current user ID: $currentUser" -ForegroundColor Cyan
az keyvault set-policy `
    --name $keyVaultName `
    --object-id $currentUser `
    --secret-permissions get list set delete `
    --output none

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to set Key Vault access permissions" -ForegroundColor Red
    exit 1
}

# Store/update Bot App ID
Write-Host "[SECRETS] Storing/updating Bot App ID..." -ForegroundColor Yellow
az keyvault secret set `
    --vault-name $keyVaultName `
    --name "microsoft-app-id" `
    --value $BotAppId `
    --output none

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to store Bot App ID in Key Vault" -ForegroundColor Red
    exit 1
}

# Convert SecureStrings to plain text for Azure CLI
$BotAppPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($BotAppPassword))
$WorkbookApiKeyDevPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($WorkbookApiKeyDev))
$WorkbookPasswordDevPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($WorkbookPasswordDev))

Write-Host "[SECRETS] Storing/updating Bot App Password..." -ForegroundColor Yellow
az keyvault secret set `
    --vault-name $keyVaultName `
    --name "microsoft-app-password" `
    --value $BotAppPasswordPlain `
    --output none

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to store Bot App Password in Key Vault" -ForegroundColor Red
    exit 1
}

Write-Host "[SECRETS] Storing/updating Workbook API Key (Dev)..." -ForegroundColor Yellow
az keyvault secret set `
    --vault-name $keyVaultName `
    --name "workbook-api-key-dev" `
    --value $WorkbookApiKeyDevPlain `
    --output none

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to store Workbook API Key (Dev) in Key Vault" -ForegroundColor Red
    exit 1
}

Write-Host "[SECRETS] Storing/updating Workbook Password (Dev)..." -ForegroundColor Yellow
az keyvault secret set `
    --vault-name $keyVaultName `
    --name "workbook-password-dev" `
    --value $WorkbookPasswordDevPlain `
    --output none

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to store Workbook Password (Dev) in Key Vault" -ForegroundColor Red
    exit 1
}

# Clear all plain text credentials from memory immediately
$BotAppPasswordPlain = $null
$WorkbookApiKeyDevPlain = $null
$WorkbookPasswordDevPlain = $null

Write-Host "[OK] All credentials stored/updated in Key Vault" -ForegroundColor Green

# Create deployment package
Write-Host "[PACKAGE] Creating deployment package..." -ForegroundColor Yellow
$zipFile = "deploy.zip"

# Backup original package.json
Write-Host "[BACKUP] Backing up package.json..." -ForegroundColor Yellow
if (Test-Path "package.json.backup") {
    Remove-Item "package.json.backup"
}
Copy-Item "package.json" "package.json.backup"

try {
    # Create a deployment-specific package.json
    $packageJson = Get-Content package.json | ConvertFrom-Json
    $packageJson.scripts.start = "node dist/src/teams/index.js"
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content package.json
    Write-Host "[OK] Package.json updated for deployment" -ForegroundColor Green

    # Create zip file with necessary files
    if (Test-Path $zipFile) {
        Remove-Item $zipFile
    }

    Compress-Archive -Path @(
        "src/*",
        "tsconfig.json",
        "package.json",
        "package-lock.json",
        "teams-app/*"
    ) -DestinationPath $zipFile

    Write-Host "[OK] Deployment package created" -ForegroundColor Green

    # Deploy to App Service
    Write-Host "[DEPLOY] Deploying code to Azure App Service..." -ForegroundColor Yellow
    az webapp deployment source config-zip `
        --resource-group $ResourceGroupName `
        --name $AppServiceName `
        --src $zipFile `
        --output none

    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Code deployment failed" -ForegroundColor Red
        throw "Deployment failed"
    }

    # Clean up deployment package
    Remove-Item $zipFile

    Write-Host "[OK] Code deployed successfully" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Deployment process failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "[RESTORE] Restoring original package.json..." -ForegroundColor Yellow
    
    if (Test-Path "package.json.backup") {
        Move-Item "package.json.backup" "package.json" -Force
        Write-Host "[OK] Original package.json restored" -ForegroundColor Green
    }
    
    # Clean up deployment package if it exists
    if (Test-Path $zipFile) {
        Remove-Item $zipFile
    }
    
    exit 1
}
finally {
    # Always restore original package.json after successful deployment
    if (Test-Path "package.json.backup") {
        Move-Item "package.json.backup" "package.json" -Force
        Write-Host "[RESTORE] Original package.json restored" -ForegroundColor Cyan
    }
}

# Test the health endpoint
Write-Host "[TEST] Testing bot health endpoint..." -ForegroundColor Yellow
Start-Sleep -Seconds 10  # Give the app time to start

$healthUrl = "$($deploymentResult.appServiceUrl.value)/health"
try {
    $response = Invoke-WebRequest -Uri $healthUrl -Method Get -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] Bot is healthy and running!" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Bot returned status code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[WARNING] Could not reach health endpoint. The bot may still be starting up." -ForegroundColor Yellow
    Write-Host "   Check: $healthUrl" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "[SUCCESS] Development Environment Deployment Complete!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""
Write-Host "[ENV] Environment: DEVELOPMENT (NODE_ENV=dev)" -ForegroundColor Cyan
Write-Host "[API] Workbook API: ambitiondemo.workbook.net" -ForegroundColor Cyan
Write-Host "[USER] Workbook User: tg (development account)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update Teams manifest.json with the bot endpoint:" -ForegroundColor White  
Write-Host "   $($deploymentResult.botServiceEndpoint.value)" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Configure the bot channels in Azure Portal:" -ForegroundColor White
Write-Host "   - Bot Service: $($deploymentResult.appServiceUrl.value)" -ForegroundColor Yellow
Write-Host "   - Enable Microsoft Teams channel" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Upload the Teams app package to Teams Admin Center" -ForegroundColor White
Write-Host ""
Write-Host "4. Test the bot in Microsoft Teams (connects to Workbook DEV)" -ForegroundColor White
Write-Host ""
Write-Host "Monitoring:" -ForegroundColor Cyan
Write-Host "- App Service: https://portal.azure.com/#resource/subscriptions/{subscriptionId}/resourceGroups/$ResourceGroupName/providers/Microsoft.Web/sites/$AppServiceName" -ForegroundColor White
Write-Host "- Application Insights: View logs and metrics in Azure Portal" -ForegroundColor White
Write-Host "- Bot Health: $healthUrl" -ForegroundColor White