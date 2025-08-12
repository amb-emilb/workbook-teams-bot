# Workbook Teams App Package

This directory contains the Microsoft Teams app manifest and assets for the Workbook Assistant bot.

## Files Required

- `manifest.json` - Teams app manifest ✅
- `icon-outline.png` - 32x32px outline icon (monochrome) ❌ 
- `icon-color.png` - 192x192px color icon ❌

## Current Status

✅ **Manifest Created**: App manifest with ngrok URL configured  
❌ **Icons Missing**: Need to create PNG icons from SVG files  
🔄 **Bot Registration**: Need to register bot in Azure Bot Framework  

## Next Steps

### 1. Create Icon Files (MANUAL STEP NEEDED)

You'll need to convert the SVG files to PNG:

**Option A: Use online converter**
1. Go to https://convertio.co/svg-png/
2. Upload `icon-outline.svg` → Convert to 32x32px PNG
3. Upload `icon-color.svg` → Convert to 192x192px PNG
4. Save as `icon-outline.png` and `icon-color.png`

**Option B: Use Photoshop/GIMP**
1. Open the SVG files
2. Resize to required dimensions
3. Export as PNG

### 2. Register Bot in Azure (WILL DO PROGRAMMATICALLY)

The manifest currently uses placeholder IDs:
- `botId`: `00000000-0000-0000-0000-000000000000`
- `webApplicationInfo.id`: Same placeholder

These need to be updated with real Azure App Registration IDs.

### 3. Package and Deploy

Once icons are ready:
1. Zip `manifest.json`, `icon-outline.png`, `icon-color.png` 
2. Upload to Teams via App Studio or Developer Portal
3. Test in mock Teams environment

## Current Ngrok Configuration

**Tunnel URL**: `https://41b50d323059.ngrok-free.app`  
**Bot Endpoint**: `https://41b50d323059.ngrok-free.app/api/messages`  
**Health Check**: `https://41b50d323059.ngrok-free.app/health`

## Teams App Features

- **Personal Chat**: Direct 1:1 conversations with the bot
- **Team Chat**: Bot can participate in team conversations  
- **Group Chat**: Works in group chats
- **File Support**: Can handle file uploads/downloads
- **Rich Cards**: Support for Adaptive Cards and rich responses

## Workbook Integration

The bot provides access to all 12 Workbook tools:
- Universal Search & Advanced Filtering
- Geographic Analysis & Territory Planning  
- Data Quality Assessment & Bulk Operations
- Enhanced Export & Performance Monitoring
- Portfolio Analysis & Relationship Mapping
- Real-time Business Intelligence