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

    // Create Bot Framework Adapter with Key Vault credentials and strict authentication
    const adapter = new BotFrameworkAdapter({
      appId,
      appPassword,
      // Enable strict authentication - only accept requests from Microsoft Bot Connector
      channelService: process.env.ChannelService || undefined
      // The adapter will automatically validate JWT tokens from Microsoft
      // Additional validation is handled in the /api/messages endpoint
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

    // Add security headers middleware
    server.use((req, res, next) => {
      // Security headers to prevent various attacks
      res.header('X-Content-Type-Options', 'nosniff');
      res.header('X-Frame-Options', 'DENY');
      res.header('X-XSS-Protection', '1; mode=block');
      res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      
      // Remove server identification
      res.header('Server', 'Workbook Teams Bot');
      
      return next();
    });

    // Simple rate limiting for the bot endpoint (in-memory, resets on restart)
    const requestCounts = new Map();
    const RATE_LIMIT_WINDOW = 60000; // 1 minute
    const MAX_REQUESTS_PER_WINDOW = 100; // Max 100 requests per minute per IP

    server.use((req, res, next) => {
      // Only apply rate limiting to /api/messages endpoint
      if (req.url !== '/api/messages') {
        return next();
      }

      const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const now = Date.now();
      
      if (!requestCounts.has(clientIp)) {
        requestCounts.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      } else {
        const clientData = requestCounts.get(clientIp);
        
        if (now > clientData.resetTime) {
          // Reset the window
          clientData.count = 1;
          clientData.resetTime = now + RATE_LIMIT_WINDOW;
        } else {
          clientData.count++;
          
          if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
            console.warn(`SECURITY: Rate limit exceeded for IP: ${clientIp}`);
            res.status(429);
            res.json({ 
              error: 'Too Many Requests',
              message: 'Rate limit exceeded. Please try again later.'
            });
            return;
          }
        }
      }
      
      return next();
    });

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

    // Bot Framework messages endpoint with authentication validation
    server.post('/api/messages', async (req, res) => {
      try {
        // Log incoming request details for security monitoring
        console.log('Incoming request to /api/messages:', {
          hasAuthHeader: !!req.headers.authorization,
          activityType: req.body?.type || 'unknown',
          source: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        });

        // SECURITY: Validate that request has proper Bot Framework authentication
        // The BotFrameworkAdapter will validate the JWT token, but we add extra checks
        if (!req.headers.authorization) {
          console.warn('SECURITY: Rejected request without Authorization header');
          res.status(401);
          res.json({ 
            error: 'Unauthorized Access. Request is not authorized',
            message: 'This endpoint only accepts requests from Microsoft Bot Connector'
          });
          return;
        }

        // Additional validation: Check for Bot Framework specific headers
        const userAgent = req.headers['user-agent'] || '';
        const hasValidUserAgent = userAgent.includes('Microsoft-BotFramework') || 
                                   userAgent.includes('Microsoft-SkypeBotApi') ||
                                   userAgent.includes('Microsoft-Teams');
        
        if (!hasValidUserAgent && process.env.NODE_ENV === 'production') {
          console.warn('SECURITY: Suspicious User-Agent detected:', userAgent);
          // In production, we might want to reject these requests
          // For now, log but allow the adapter to handle validation
        }

        // Process the request through Bot Framework Adapter
        // The adapter will perform JWT validation and reject invalid tokens
        await adapter.process(req, res, async (context) => {
          // Only run the bot if we get here (authentication passed)
          await teamsApp.run(context);
        });
      } catch (error) {
        console.error('Error processing bot message:', error);
        
        // Don't leak internal errors to potential attackers
        if (!res.headersSent) {
          res.status(500);
          res.json({ error: 'Internal server error' });
        }
      }
    });

    // Static file serving for auth flows
    server.get('/static/*', restify.plugins.serveStatic({
      directory: __dirname,
      default: 'index.html'
    }));
    
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