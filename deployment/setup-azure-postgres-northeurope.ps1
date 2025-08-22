# PowerShell script to set up Azure Database for PostgreSQL for Mastra Memory

# Variables
$resourceGroup = "workbook-teams-westeurope"
$serverName = "workbook-postgres-memory"
$location = "northeurope"  # Changed from westeurope
$adminUser = "mastraadmin"
$adminPassword = "Ambition1994!" # Change this!
$dbName = "mastra_memory"

Write-Host "Creating Azure Database for PostgreSQL in North Europe..." -ForegroundColor Green

# Create PostgreSQL Flexible Server
az postgres flexible-server create `
  --resource-group $resourceGroup `
  --name $serverName `
  --location $location `
  --admin-user $adminUser `
  --admin-password $adminPassword `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --storage-size 32 `
  --version 15 `
  --public-access 0.0.0.0

Write-Host "Creating database..." -ForegroundColor Green

# Create database
az postgres flexible-server db create `
  --resource-group $resourceGroup `
  --server-name $serverName `
  --database-name $dbName

Write-Host "Configuring firewall for Azure services..." -ForegroundColor Green

# Allow Azure services
az postgres flexible-server firewall-rule create `
  --resource-group $resourceGroup `
  --name $serverName `
  --rule-name AllowAzureServices `
  --start-ip-address 0.0.0.0 `
  --end-ip-address 0.0.0.0

Write-Host "Enabling pgvector extension..." -ForegroundColor Green

# Enable extensions
az postgres flexible-server parameter set `
  --resource-group $resourceGroup `
  --server-name $serverName `
  --name azure.extensions `
  --value vector

# Get connection string
$connectionString = "postgresql://${adminUser}:${adminPassword}@${serverName}.postgres.database.azure.com/${dbName}?sslmode=require"

Write-Host "Connection string:" -ForegroundColor Yellow
Write-Host $connectionString

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Add this connection string to Key Vault as 'postgres-connection-string'"
Write-Host "2. Update workbookAgent.ts to use PostgreSQL adapter"
Write-Host "3. Install @mastra/pg package"
Write-Host "4. Deploy to Azure"