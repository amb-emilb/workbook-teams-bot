# PowerShell script to configure GitHub secrets for CI/CD
# Prerequisites: GitHub CLI (gh) installed and authenticated

param(
    [Parameter(Mandatory=$true)]
    [string]$RepositoryName,
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "workbook-teams-westeurope",
    
    [Parameter(Mandatory=$true)]
    [string]$BotAppId,
    
    [Parameter(Mandatory=$true)]
    [SecureString]$BotAppPassword
)

Write-Host "Setting up GitHub Secrets for CI/CD" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if GitHub CLI is installed
try {
    gh --version | Out-Null
    Write-Host "GitHub CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "GitHub CLI is not installed. Please install it first." -ForegroundColor Red
    Write-Host "Visit: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to GitHub
$ghAuth = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to GitHub. Running 'gh auth login'..." -ForegroundColor Yellow
    gh auth login
}

Write-Host "Creating Azure Service Principal for GitHub Actions..." -ForegroundColor Yellow

# Create service principal for GitHub Actions
$subscriptionId = az account show --query id -o tsv
$appName = "GitHub-Actions-WorkbookBot"

# Create service principal with contributor role at subscription level
# (needed because resource group doesn't exist yet - will be created by GitHub Actions)
$spCredentials = az ad sp create-for-rbac `
    --name $appName `
    --role contributor `
    --scopes /subscriptions/$subscriptionId `
    --sdk-auth `
    --output json

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create service principal" -ForegroundColor Red
    exit 1
}

Write-Host "Service principal created" -ForegroundColor Green

# Set GitHub secrets
Write-Host "Setting GitHub secrets..." -ForegroundColor Yellow

# Set AZURE_CREDENTIALS secret
gh secret set AZURE_CREDENTIALS --body $spCredentials --repo $RepositoryName

if ($LASTEXITCODE -eq 0) {
    Write-Host "AZURE_CREDENTIALS secret set" -ForegroundColor Green
} else {
    Write-Host "Failed to set AZURE_CREDENTIALS secret" -ForegroundColor Red
}

# Set bot credentials as GitHub secrets
Write-Host "Setting bot credentials as GitHub secrets..." -ForegroundColor Yellow

# Set Microsoft App ID
gh secret set MICROSOFT_APP_ID --body $BotAppId --repo $RepositoryName
if ($LASTEXITCODE -eq 0) {
    Write-Host "MICROSOFT_APP_ID secret set" -ForegroundColor Green
} else {
    Write-Host "Failed to set MICROSOFT_APP_ID secret" -ForegroundColor Red
}

# Convert SecureString to plain text for GitHub CLI
$BotAppPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($BotAppPassword))

# Set Microsoft App Password
gh secret set MICROSOFT_APP_PASSWORD --body $BotAppPasswordPlain --repo $RepositoryName
if ($LASTEXITCODE -eq 0) {
    Write-Host "MICROSOFT_APP_PASSWORD secret set" -ForegroundColor Green
} else {
    Write-Host "Failed to set MICROSOFT_APP_PASSWORD secret" -ForegroundColor Red
}

# Clear the plain text password from memory immediately
$BotAppPasswordPlain = $null

# Set OpenAI API key from .env file
Write-Host "🤖 Setting OpenAI API key..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -ErrorAction SilentlyContinue
$openaiKey = ($envContent | Where-Object { $_ -match "OPENAI_API_KEY=" }) -replace "OPENAI_API_KEY=", ""

if ($openaiKey) {
    gh secret set OPENAI_API_KEY --body $openaiKey --repo $RepositoryName
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OPENAI_API_KEY secret set" -ForegroundColor Green
    } else {
        Write-Host "Failed to set OPENAI_API_KEY secret" -ForegroundColor Red
    }
} else {
    Write-Host "OPENAI_API_KEY not found in .env file" -ForegroundColor Yellow
}

Write-Host "All credentials are now available to GitHub Actions" -ForegroundColor Yellow

# Set environment-specific variables
Write-Host "Setting environment variables..." -ForegroundColor Yellow

gh variable set AZURE_WEBAPP_NAME --body "workbook-teams-bot" --repo $RepositoryName
gh variable set RESOURCE_GROUP --body $ResourceGroupName --repo $RepositoryName
$keyVaultName = "workbook-bot-kv-3821"
gh variable set KEY_VAULT_NAME --body $keyVaultName --repo $RepositoryName

Write-Host "Environment variables set" -ForegroundColor Green

# Create environments in GitHub
Write-Host "Creating deployment environments..." -ForegroundColor Yellow

# Create staging environment
gh api repos/$RepositoryName/environments/staging -X PUT 2>$null
Write-Host "Staging environment created" -ForegroundColor Green

# Create production environment with protection rules
$productionEnv = @{
    deployment_branch_policy = @{
        protected_branches = $true
        custom_branch_policies = $false
    }
    reviewers = @()
    wait_timer = 0
} | ConvertTo-Json

$productionEnv | gh api repos/$RepositoryName/environments/production -X PUT --input - 2>$null
Write-Host "Production environment created with protection rules" -ForegroundColor Green

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "GitHub Secrets Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Secrets configured:" -ForegroundColor Cyan
Write-Host "• AZURE_CREDENTIALS - Service principal for deployment" -ForegroundColor White
Write-Host ""
Write-Host "Variables configured:" -ForegroundColor Cyan
Write-Host "• AZURE_WEBAPP_NAME - workbook-teams-bot" -ForegroundColor White
Write-Host "• RESOURCE_GROUP - $ResourceGroupName" -ForegroundColor White
Write-Host "• KEY_VAULT_NAME - $keyVaultName" -ForegroundColor White
Write-Host ""
Write-Host "Environments created:" -ForegroundColor Cyan
Write-Host "• staging - For pull request deployments" -ForegroundColor White
Write-Host "• production - For main branch deployments (with protection)" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Push code to trigger the CI/CD pipeline" -ForegroundColor White
Write-Host "2. Monitor deployments in GitHub Actions tab" -ForegroundColor White
Write-Host "3. Configure branch protection rules if needed" -ForegroundColor White