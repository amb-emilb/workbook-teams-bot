import * as restify from 'restify';
import { createConfiguredTeamsBot } from './teamsBot.js';
import { keyVaultService } from '../services/keyVault.js';
import { initializeTelemetry, trackException } from '../utils/telemetry.js';
import { TurnContext, CloudAdapter } from 'botbuilder';
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
 * Initialize server with environment variables for Teams AI
 */
async function initializeServer() {
  console.log('Initializing Teams AI server...');
    
  try {
    // Set environment variables from Key Vault for Teams AI SDK
    const [appId, appPassword] = await Promise.all([
      keyVaultService.getSecret('microsoft-app-id'),
      keyVaultService.getSecret('microsoft-app-password')
    ]);

    // Set environment variables that Teams AI SDK will automatically read
    process.env.MICROSOFT_APP_ID = appId;
    process.env.MICROSOFT_APP_PASSWORD = appPassword;
    
    console.log('✅ Environment variables set for Teams AI SDK');

    // Initialize Teams AI application (includes TeamsAdapter)
    const teamsApp = await createConfiguredTeamsBot();

    return { teamsApp };
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
    // Initialize server with Teams AI
    const { teamsApp } = await initializeServer();

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

    // Teams AI messages endpoint - uses integrated TeamsAdapter
    server.post('/api/messages', async (req, res) => {
      try {
        // Log incoming request details for security monitoring
        console.log('Incoming request to /api/messages:', {
          hasAuthHeader: !!req.headers.authorization,
          activityType: req.body?.type || 'unknown',
          source: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        });

        // Teams AI SDK handles authentication internally via TeamsAdapter
        // Process the request through Teams AI application
        const adapter = teamsApp.adapter as CloudAdapter;
        await adapter.process(req, res, async (context: TurnContext) => {
          // Teams AI application will handle the request
          await teamsApp.run(context);
        });
      } catch (error) {
        console.error('Error processing bot message:', error);
        
        // Track exception in Application Insights
        trackException(error as Error, {
          endpoint: '/api/messages',
          source: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        });
        
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
      console.log('Authentication: Teams AI SDK with environment variables');
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