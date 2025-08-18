import * as restify from 'restify';
import { BotFrameworkAdapter } from 'botbuilder';
import { createConfiguredTeamsBot } from './teamsBot.js';
import { keyVaultService } from '../services/keyVault.js';
import { initializeTelemetry, trackException } from '../utils/telemetry.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as path from 'path';

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize Application Insights
initializeTelemetry();

/**
 * Teams Bot Server
 * 
 * Hosts our Teams AI application with proper Microsoft Bot Framework integration
 * Maintains our DEV environment settings while providing Teams connectivity
 */

/**
 * Initialize server with Key Vault secrets
 */
async function initializeServer() {
  console.log('Initializing server with Key Vault secrets...');
    
  try {
    // Get Microsoft Bot credentials from Key Vault
    const [appId, appPassword] = await Promise.all([
      keyVaultService.getSecret('microsoft-app-id'),
      keyVaultService.getSecret('microsoft-app-password')
    ]);

    // Create Bot Framework Adapter with Key Vault credentials
    const adapter = new BotFrameworkAdapter({
      appId,
      appPassword
    });

    // Error handler for the adapter
    adapter.onTurnError = async (context, error) => {
      console.error('Bot Framework Adapter Error:', error);
            
      // Track exception in Application Insights
      trackException(error as Error, {
        activityType: context.activity?.type,
        userId: context.activity?.from?.id,
        conversationId: context.activity?.conversation?.id
      });
            
      // Send a message to the user
      await context.sendActivity('Sorry, I encountered an error processing your request.');
            
      // Log the error details
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        activity: context.activity
      });
    };

    // Initialize Teams bot
    const teamsApp = await createConfiguredTeamsBot();

    return { adapter, teamsApp };
  } catch (error) {
    console.error('Failed to initialize server:', error);
    throw error;
  }
}

/**
 * Start the Teams bot server
 */
async function startServer() {
  try {
    // Initialize server with Key Vault secrets
    const { adapter, teamsApp } = await initializeServer();

    // Create Restify server
    const server = restify.createServer({
      name: 'Workbook Teams Bot',
      version: '1.0.0'
    });

    // Add middleware
    server.use(restify.plugins.bodyParser());
    server.use(restify.plugins.queryParser());

    // Health check endpoint with Key Vault connectivity test
    server.get('/health', (req, res, next) => {
      (async () => {
        const healthCheck = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'Workbook Teams Bot',
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          checks: {
            keyVault: { status: 'unknown', message: '' },
            botCredentials: { status: 'unknown', message: '' },
            openai: { status: 'unknown', message: '' }
          }
        };

        try {
          // Test Key Vault connectivity
          console.log('Health check: Testing Key Vault connectivity...');
          
          // Test if we can access Key Vault secrets
          const keyVaultTest = await keyVaultService.getSecret('openai-api-key').catch(error => {
            console.error('Key Vault health check failed:', error);
            return null;
          });
          
          if (keyVaultTest) {
            healthCheck.checks.keyVault = { status: 'healthy', message: 'Key Vault accessible' };
          } else {
            healthCheck.checks.keyVault = { status: 'error', message: 'Cannot access Key Vault secrets' };
            healthCheck.status = 'degraded';
          }

          // Test bot credentials availability
          try {
            const botCredentialsTest = await Promise.all([
              keyVaultService.getSecret('microsoft-app-id').catch(() => null),
              keyVaultService.getSecret('microsoft-app-password').catch(() => null)
            ]);
            
            if (botCredentialsTest[0] && botCredentialsTest[1]) {
              healthCheck.checks.botCredentials = { status: 'healthy', message: 'Bot credentials available' };
            } else {
              healthCheck.checks.botCredentials = { status: 'error', message: 'Missing bot credentials' };
              healthCheck.status = 'degraded';
            }
          } catch {
            healthCheck.checks.botCredentials = { status: 'error', message: 'Cannot access bot credentials' };
            healthCheck.status = 'degraded';
          }

          // Test OpenAI API key availability
          if (keyVaultTest) {
            healthCheck.checks.openai = { status: 'healthy', message: 'OpenAI API key available' };
          } else {
            healthCheck.checks.openai = { status: 'error', message: 'OpenAI API key not available' };
            healthCheck.status = 'degraded';
          }

          console.log('Health check completed:', healthCheck.status);
          
        } catch (error) {
          console.error('Health check error:', error);
          healthCheck.status = 'error';
          healthCheck.checks.keyVault = { status: 'error', message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
        }

        // Set appropriate HTTP status code
        const statusCode = healthCheck.status === 'healthy' ? 200 : 
          healthCheck.status === 'degraded' ? 200 : 503;
        
        res.status(statusCode);
        res.json(healthCheck);
        return next();
      })();
    });

    // Bot Framework messages endpoint
    server.post('/api/messages', async (req, res) => {
      console.log('Incoming bot message:', req.body?.type || 'unknown');
            
      await adapter.process(req, res, async (context) => {
        // Route the request to our Teams AI application
        await teamsApp.run(context);
      });
    });

    // Static file serving for auth flows (if needed later)
    server.get('/static/*', restify.plugins.serveStatic({
      directory: __dirname,
      default: 'index.html'
    }));

    // Start the server
    const port = process.env.PORT || 3978;

    server.listen(port, () => {
      console.log('Workbook Teams Bot Server Started');
      console.log('='.repeat(50));
      console.log(`Server listening on port: ${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
      console.log(`Bot endpoint: http://localhost:${port}/api/messages`);
      console.log('Production URL: https://workbook-teams-bot.azurewebsites.net');
      console.log('='.repeat(50));
      console.log('Environment:', process.env.NODE_ENV || 'development');
      console.log('Credentials: Loaded from Azure Key Vault');
      console.log('='.repeat(50));
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch(console.error);