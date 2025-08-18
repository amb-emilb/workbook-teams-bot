# Workbook Teams App Package

This directory contains the Microsoft Teams app manifest and assets for the Workbook Assistant bot.

## Files Required

- `manifest.json` - Teams app manifest for development ✅
- `manifest.production.json` - Teams app manifest for production ✅
- `icon-outline.png` - 32x32px outline icon (monochrome) ✅
- `icon-color.png` - 192x192px color icon ✅

## Current Status

✅ **Bot Deployed**: Workbook Teams Bot deployed to Azure App Service  
✅ **Manifests Ready**: Both development and production manifests configured with correct bot IDs  
✅ **Icons Available**: PNG icons ready for packaging  
✅ **Azure Integration**: Bot connected to production Azure infrastructure  

## Production Configuration

**Bot Service**: `workbook-teams-bot.azurewebsites.net`  
**Bot ID**: `f076c31d-88e0-4d99-9b3f-e91016e1972c`  
**Health Endpoint**: `https://workbook-teams-bot.azurewebsites.net/health`  
**Message Endpoint**: `https://workbook-teams-bot.azurewebsites.net/api/messages`

## Teams App Features

- **Personal Chat**: Direct 1:1 conversations with the bot
- **Team Chat**: Bot can participate in team conversations  
- **Group Chat**: Works in group chats
- **File Support**: Can handle file uploads/downloads
- **Rich Cards**: Support for Adaptive Cards and rich responses
- **Commands**: Predefined commands for search, analyze, export, and help

## Workbook Integration

The bot provides access to all 12 Workbook tools:
- Universal Search & Advanced Filtering
- Geographic Analysis & Territory Planning  
- Data Quality Assessment & Bulk Operations
- Enhanced Export & Performance Monitoring
- Portfolio Analysis & Relationship Mapping
- Real-time Business Intelligence

## Next Steps for Teams Deployment

### 1. Package Creation
```bash
# Create Teams app package
zip workbook-teams-app.zip manifest.production.json icon-color.png icon-outline.png
```

### 2. Teams Admin Center Deployment
1. Go to Teams Admin Center
2. Navigate to Teams apps → Manage apps
3. Upload the app package ZIP file
4. Configure permissions and availability

### 3. User Access
- Configure which users/groups can install the app
- Set up organizational policies for bot usage
- Provide user documentation and training

## Security & Compliance

- Bot uses managed identity for Azure resource access
- All secrets stored securely in Azure Key Vault
- HTTPS-only communication
- Bot Framework authentication for message security
- Application Insights for monitoring and compliance