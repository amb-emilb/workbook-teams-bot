# Workbook Teams Bot - Deployment Guide

## Package Ready ✅

**File**: `workbook-teams-app-production.zip` (9.35 KB)  
**Contents**: 
- `manifest.json` (3,836 bytes) - Production manifest with correct bot ID
- `icon-color.png` (7,601 bytes) - 192x192px color icon
- `icon-outline.png` (525 bytes) - 32x32px outline icon

**Validation**: All required files present and correctly sized ✅

## Deployment Options

### Option 1: Teams Admin Center (Recommended for Organization Deployment)

**Prerequisites:**
- Microsoft 365 admin or Teams admin permissions
- Access to Teams Admin Center

**Steps:**
1. **Login to Teams Admin Center**
   - Go to: https://admin.teams.microsoft.com/
   - Sign in with admin credentials

2. **Navigate to App Management**
   - Left sidebar → Teams apps → Manage apps
   - Click "Upload new app"

3. **Upload Package**
   - Click "Upload" button
   - Select `workbook-teams-app-production.zip`
   - Wait for validation and upload completion

4. **Configure App Policies**
   - After upload, find "Workbook Assistant" in the app list
   - Click on the app to configure:
     - **Status**: Set to "Allowed" 
     - **Availability**: Choose organization-wide or specific groups
     - **Permissions**: Review and approve requested permissions

5. **Set Permission Policies**
   - Go to Teams apps → Permission policies
   - Edit or create policy to include "Workbook Assistant"
   - Assign policy to appropriate user groups

### Option 2: App Store Submission (For Broader Distribution)

**Prerequisites:**
- Microsoft Partner Center account
- App store approval process (2-3 weeks)

**Steps:**
1. **Partner Center Setup**
   - Go to: https://partner.microsoft.com/dashboard
   - Create or use existing Microsoft Partner account

2. **Submit App**
   - Create new Office Store submission
   - Upload `workbook-teams-app-production.zip`
   - Complete store listing information
   - Submit for Microsoft review

### Option 3: Sideloading (For Testing)

**Prerequisites:**
- Sideloading enabled in Teams admin policies
- Individual user testing

**Steps:**
1. **Enable Sideloading** (Admin)
   - Teams Admin Center → Teams apps → Setup policies
   - Turn on "Upload custom apps"

2. **Sideload App** (User)
   - Open Microsoft Teams client
   - Left sidebar → Apps
   - "Upload a custom app" → "Upload for [your organization]"
   - Select `workbook-teams-app-production.zip`

## Bot Configuration Verification

Before deployment, verify the bot backend is operational:

### Health Check
```bash
curl https://workbook-teams-bot.azurewebsites.net/health
# Expected: {"status":"healthy","timestamp":"..."}
```

### Bot Framework Endpoint
```bash
curl -X POST https://workbook-teams-bot.azurewebsites.net/api/messages
# Expected: HTTP 401 (authentication required - correct behavior)
```

## Azure Resources Status

**Current Production Environment:**
- **App Service**: `workbook-teams-bot.azurewebsites.net` ✅ Running
- **Bot Service**: Registered with ID `f076c31d-88e0-4d99-9b3f-e91016e1972c` ✅
- **Key Vault**: All 7 secrets configured ✅
- **Application Insights**: Monitoring active ✅
- **Workbook Integration**: Connected to DEV environment ✅

## User Experience

Once deployed, users can:

1. **Find the Bot**
   - Teams → Apps → Search "Workbook Assistant"
   - Or browse internal organization apps

2. **Start Conversations**
   - Personal chat: Direct 1:1 messages
   - Team channels: @mention the bot
   - Group chats: Add bot to group conversations

3. **Use Commands**
   - `search [query]` - Search Workbook resources
   - `analyze [type]` - Data analysis operations  
   - `export [format]` - Export data
   - `help` - Get command assistance

## Monitoring and Support

### Application Insights Dashboard
- Azure Portal → Application Insights → `workbook-bot-insights`
- Monitor usage, performance, and errors
- Set up alerts for critical issues

### Health Monitoring
- Automated health checks via `/health` endpoint
- Application logs in Azure Log Analytics
- Key Vault access monitoring

### User Support
- Bot provides contextual help via `help` command
- Error messages guide users to correct usage
- Admin can monitor usage patterns in Application Insights

## Security and Compliance

### Data Protection
- Bot uses DEV Workbook environment (safe for testing)
- No sensitive data cached or logged
- HTTPS-only communication

### Authentication
- Bot Framework handles message authentication
- Azure Key Vault secures API credentials
- Managed identity for Azure resource access

### Permissions
The bot requests minimal Teams permissions:
- `identity` - Read user profile information
- `messageTeamMembers` - Send messages in Teams context

## Troubleshooting

### Common Issues

**App Upload Fails**
- Check package size (< 30MB) ✅ Current: 9.35 KB
- Verify all required files present ✅ Validated
- Check manifest.json syntax ✅ Valid JSON

**Bot Not Responding**
- Verify health endpoint: https://workbook-teams-bot.azurewebsites.net/health
- Check Application Insights for errors
- Confirm Key Vault secrets accessible

**Permission Errors**  
- Ensure Teams admin has uploaded app with proper policies
- Check user has access to the bot via permission policies
- Verify bot permissions approved in admin center

## Next Steps After Deployment

1. **Pilot Testing**
   - Deploy to small group of test users
   - Gather feedback on functionality
   - Monitor performance and usage

2. **Training and Documentation**
   - Provide user training on bot commands
   - Create internal documentation for common use cases
   - Set up support channels for user questions

3. **Production Transition**
   - When ready, update Key Vault secrets to use production Workbook environment
   - Update monitoring and alerting for production usage
   - Implement user onboarding process

## Support Contacts

- **Technical Issues**: Azure Application Insights monitoring
- **Bot Functionality**: Check health endpoint and logs  
- **Teams Administration**: Teams Admin Center management
- **Workbook Integration**: Verify API credentials in Key Vault