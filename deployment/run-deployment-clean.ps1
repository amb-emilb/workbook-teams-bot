# Clean deployment runner script
$BotAppId = "f076c31d-88e0-4d99-9b3f-e91016e1972c"
$BotAppPassword = ConvertTo-SecureString "h.Y8Q~GZJ2GBD_cCBdlx9qD9~77t0WpIyawMPdzs" -AsPlainText -Force
$WorkbookApiKeyDev = ConvertTo-SecureString "3lT8CVMSyM37ah0j0U1wHBT6VxCraBJe" -AsPlainText -Force  
$WorkbookPasswordDev = ConvertTo-SecureString "Demo123" -AsPlainText -Force

# Change to project root directory
Set-Location "C:\Users\EmilOtteBrok\Kode\Klaviyodb\workbook-teams-agent"

# Run the clean deployment script
.\deployment\deploy-to-azure-clean.ps1 `
  -BotAppId $BotAppId `
  -BotAppPassword $BotAppPassword `
  -WorkbookApiKeyDev $WorkbookApiKeyDev `
  -WorkbookPasswordDev $WorkbookPasswordDev