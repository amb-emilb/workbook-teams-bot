# Azure Bot Service Registration Guide

## Overview

The Workbook Teams Bot is already deployed to Azure with complete Bot Framework integration. This guide documents the Azure-based architecture and configuration.

## Current Azure Deployment

### Azure Resources
- **App Service**: `workbook-teams-bot.azurewebsites.net`
- **Bot Service**: Bot Framework registration complete
- **Key Vault**: `workbook-bot-kv-3821.vault.azure.net`
- **Application Insights**: `workbook-bot-insights`
- **Resource Group**: `workbook-teams-westeurope`

### Bot Configuration
- **Bot ID**: `f076c31d-88e0-4d99-9b3f-e91016e1972c`
- **Messaging Endpoint**: `https://workbook-teams-bot.azurewebsites.net/api/messages`
- **Authentication**: Microsoft App ID and Password configured via Key Vault

## Key Vault Integration

All bot credentials are securely stored in Azure Key Vault:

```
Required Secrets:
- microsoft-app-id: Bot Framework App ID
- microsoft-app-password: Bot Framework App Password  
- openai-api-key: OpenAI GPT-4 API key
- workbook-api-key-dev: Workbook API key for development
- workbook-api-key-prod: Workbook API key for production
- workbook-password-dev: Workbook password for development
- workbook-password-prod: Workbook password for production
```

## Production Architecture

### Security Features
- **Managed Identity**: App Service uses managed identity for Key Vault access
- **HTTPS Enforcement**: All communication secured with TLS
- **Bot Framework Authentication**: Messages authenticated via Bot Framework
- **Input Validation**: Comprehensive validation and sanitization

### Monitoring & Logging
- **Application Insights**: Telemetry and performance monitoring
- **Structured Logging**: JSON-formatted logs for Azure Log Analytics
- **Health Checks**: `/health` endpoint for service monitoring

## Teams Channel Configuration

The bot is configured for Microsoft Teams with the following capabilities:
- **Personal Chat**: 1:1 conversations
- **Team Chat**: Group conversations in Teams channels
- **Group Chat**: Multi-user group conversations
- **File Handling**: Upload/download support
- **Rich Cards**: Adaptive Cards and interactive elements

## Testing and Verification

### Health Check
```bash
curl https://workbook-teams-bot.azurewebsites.net/health
# Expected: {"status": "healthy", "timestamp": "..."}
```

### Bot Framework Endpoint
```bash
curl https://workbook-teams-bot.azurewebsites.net/api/messages
# Expected: HTTP 405 Method Not Allowed (correct for GET requests)
```

### Key Vault Access
- All 7 required secrets are accessible from the application
- No environment variable fallbacks needed
- Managed identity authentication working

## Deployment Pipeline

The bot is deployed via GitHub Actions with the following process:

1. **Build**: TypeScript compilation, tests, security audit
2. **Infrastructure**: ARM template deployment to Azure
3. **Secrets**: Key Vault population from GitHub secrets
4. **Application**: Code deployment to App Service
5. **Verification**: Health checks and endpoint testing

## Teams App Package

### Manifests
- `manifest.json`: Development configuration
- `manifest.production.json`: Production configuration with enhanced features

### Icons
- `icon-color.png`: 192x192px color icon
- `icon-outline.png`: 32x32px outline icon

Both manifests now use the correct bot ID: `f076c31d-88e0-4d99-9b3f-e91016e1972c`

## Production Support

### Monitoring
- Application Insights dashboard in Azure Portal
- Real-time performance metrics and error tracking
- Automated alerts for critical issues

### Troubleshooting
- Structured logging available in Log Analytics
- Health endpoint for service status verification
- Key Vault access logs for authentication issues

### Updates and Maintenance
- GitHub Actions CI/CD for automated deployments
- Infrastructure as Code via ARM templates
- Secure secret rotation via Key Vault

## Security Compliance

- **Data Protection**: No sensitive data logged or stored inappropriately
- **Authentication**: Multi-layer authentication via Bot Framework and Azure
- **Authorization**: Managed identity and role-based access control
- **Monitoring**: Comprehensive audit logging and monitoring
- **Secrets Management**: Secure storage in Azure Key Vault with proper access policies