# Bot Framework Registration Guide

## Overview

To connect our Teams bot to Microsoft Teams, we need to register it with Azure Bot Framework. This gives us the required IDs and credentials.

## Step-by-Step Registration

### 1. Azure Bot Framework Registration

**Go to**: https://dev.botframework.com/

**Create new bot registration:**
1. Click "Create a Bot"
2. Choose "Register an existing bot built using Bot Framework SDK v4"

**Fill out the form:**
- **Display name**: `Workbook Assistant`
- **Bot handle**: `workbook-assistant-bot` (must be unique)
- **Description**: `AI assistant for Workbook CRM with advanced analytics`
- **Messaging endpoint**: `https://41b50d323059.ngrok-free.app/api/messages`
- **Microsoft App ID**: Leave blank (will be auto-generated)

### 2. Configure App Registration

After creating the bot, you'll get:
- **Microsoft App ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Microsoft App Password**: Auto-generated secret

**Important**: Copy these values immediately and securely!

### 3. Update Environment Variables

Add to your `.env` file:
```env
MICROSOFT_APP_ID=your-app-id-here
MICROSOFT_APP_PASSWORD=your-app-password-here
```

### 4. Update Teams Manifest

Replace the placeholder IDs in `manifest.json`:
```json
{
  "id": "your-app-id-here",
  "bots": [
    {
      "botId": "your-app-id-here"
    }
  ],
  "webApplicationInfo": {
    "id": "your-app-id-here"
  }
}
```

### 5. Configure Channels

In the Bot Framework portal:
1. Go to your bot's "Channels" section
2. Click "Microsoft Teams"
3. Configure settings:
   - **Calling**: Disabled
   - **Groups and Teams**: Enabled
   - **1 on 1 chat**: Enabled

### 6. Test Connection

1. **Start the bot**: `npm run teams`
2. **Keep ngrok running**: The tunnel must be active
3. **Test endpoint**: Visit `https://41b50d323059.ngrok-free.app/health`
4. **Check Bot Framework**: Test in the portal's Web Chat

## Troubleshooting

### Common Issues

**❌ Bot not responding**
- Check ngrok is running and tunneling to port 3978
- Verify messaging endpoint URL is correct
- Check app ID and password in .env file

**❌ Authentication errors**
- Regenerate app password in Azure
- Check for typos in .env file
- Ensure app ID matches in manifest and .env

**❌ Teams integration not working**
- Verify Teams channel is enabled
- Check manifest.json has correct app ID
- Ensure icons are properly sized PNG files

### Log Analysis

Check bot server logs for errors:
```bash
npm run teams
# Look for authentication and routing errors
```

## Security Notes

- **Never commit** app passwords to git
- **Use Azure Key Vault** for production secrets
- **Rotate passwords** regularly
- **Monitor usage** in Azure portal

## Production Deployment

For production:
1. **Deploy to Azure App Service** or similar
2. **Use HTTPS domain** instead of ngrok
3. **Configure proper authentication**
4. **Set up monitoring and logging**
5. **Update manifest** with production URLs

## Support Resources

- **Bot Framework Docs**: https://docs.microsoft.com/en-us/azure/bot-service/
- **Teams App Development**: https://docs.microsoft.com/en-us/microsoftteams/platform/
- **Teams AI Library**: https://github.com/microsoft/teams-ai