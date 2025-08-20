  CRITICAL UNDERSTANDING: Two Separate Authentication Flows

  We've been fundamentally confused because there are TWO COMPLETELY DIFFERENT
  authentication flows:

  1. Bot ↔ Bot Framework Service Authentication

  - MUST use App Registration credentials
  - REQUIRES Multitenant configuration (this is why our App Registration is correctly     
   set to "Multitenant")
  - Bot Framework Service operates from botframework.com tenant and needs to
  authenticate requests from our bot
  - Uses MICROSOFT_APP_ID, MICROSOFT_APP_PASSWORD, MICROSOFT_APP_TYPE

  2. App Service ↔ Azure Resources Authentication

  - CAN use Managed Identity for accessing Key Vault, SQL, etc.
  - This is separate from Bot Framework authentication
  - Managed Identity is for service-to-service calls within Azure

  Microsoft Entra ID Tenant & Multitenant Configuration

  Your App Registration showing "Accounts in any organizational directory (Any
  Microsoft Entra ID tenant - Multitenant)" is ESSENTIAL because:

  - Bot Framework Service runs in Microsoft's tenant (botframework.com)
  - When Bot Framework Service validates your bot's responses, it needs access across     
   tenants
  - Single tenant would BLOCK Bot Framework Service from validating your bot
  - This is why thousands of Teams bots work - they use Multitenant App Registrations     

  What We've Been Doing Wrong

  1. Wrong TeamsAdapter Construction

  Our Current (Wrong):
  const adapter = new TeamsAdapter(); // Empty constructor

  Correct (from working TeamsChefBot):
  const adapter = new TeamsAdapter(
      {},
      new ConfigurationServiceClientCredentialFactory({
          MicrosoftAppType: process.env.BOT_TYPE,
          MicrosoftAppId: process.env.BOT_ID,
          MicrosoftAppPassword: process.env.BOT_PASSWORD,
          MicrosoftAppTenantId: process.env.BOT_TENANT_ID
      })
  );

  2. Environment Variable Confusion

  - Local Development: Uses BOT_ID, BOT_PASSWORD (Teams Toolkit pattern)
  - Azure Production: Uses MICROSOFT_APP_ID, MICROSOFT_APP_PASSWORD (App Service
  pattern)
  - We need to support BOTH patterns in our code

  3. Managed Identity Misunderstanding

  - Azure Bot Service does NOT support Managed Identity for Bot Framework
  authentication
  - Managed Identity is only for App Service → Azure resources (Key Vault, SQL, etc.)     
  - Bot Framework authentication ALWAYS requires App Registration credentials

  The Correct Production Architecture

  Teams → Bot Framework Service → Azure App Service → Bot Code
                  |                      |
          (App Registration)    (Managed Identity)
                  |                      |
          Bot Framework Auth      Azure Resource Auth
          (MICROSOFT_APP_*)       (Key Vault, etc.)

  Why Thousands of Bots Work

  1. They use ConfigurationServiceClientCredentialFactory properly
  2. They maintain Multitenant App Registrations for Bot Framework compatibility
  3. They use correct environment variable patterns for their deployment target
  4. They don't try to use Managed Identity for Bot Framework authentication

  Next Steps

  1. Fix TeamsAdapter to use ConfigurationServiceClientCredentialFactory
  2. Support both environment variable patterns (BOT_* and MICROSOFT_APP_*)
  3. Keep Multitenant App Registration (it's correct!)
  4. Use Managed Identity only for App Service → Azure resource calls
  5. Revert Bot Service to use App Registration (not Managed Identity)

  This explains why we've been going in circles - we were conflating two completely       
  different authentication flows and trying to force Managed Identity where it
  doesn't belong.