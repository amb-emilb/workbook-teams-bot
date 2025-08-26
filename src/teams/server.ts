import * as restify from 'restify';
import { createConfiguredTeamsBot } from './teamsBot.js';
import { keyVaultService } from '../services/keyVault.js';
import { initializeTelemetry, trackException } from '../utils/telemetry.js';
import { TurnContext, CloudAdapter } from 'botbuilder';
// PHASE 18: Re-enabling file routes for CSV export functionality
import { initializeFileRoutes, handleFileDownload, handleFileList, cleanupExpiredFiles } from '../routes/fileRoutes.js';
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
  console.log('[SERVER INIT] Starting Teams AI server initialization with fixed Key Vault permissions...');
  console.log('[SERVER INIT] Environment check:', {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    hasAppId: !!process.env.MICROSOFT_APP_ID,
    appType: process.env.MICROSOFT_APP_TYPE,
    hasPostgresConn: !!process.env.POSTGRES_CONNECTION_STRING,
    timestamp: new Date().toISOString()
  });
    
  try {
    console.log('[SERVER INIT] Setting up authentication...');
    
    // For User-Assigned Managed Identity, Teams AI SDK reads MICROSOFT_APP_ID and MICROSOFT_APP_TYPE from environment
    // App Service already has these configured: MICROSOFT_APP_ID=1a915ea6... and MICROSOFT_APP_TYPE=UserAssignedMSI
    // No password needed - Azure handles authentication automatically
    console.log('[SERVER INIT] Using User-Assigned Managed Identity authentication', {
      appType: process.env.MICROSOFT_APP_TYPE || 'UserAssignedMSI',
      appId: process.env.MICROSOFT_APP_ID?.substring(0, 8) + '...'
    });

    console.log('[SERVER INIT] Creating Teams bot application...');
    const startTeamsInit = Date.now();
    
    // Initialize Teams AI application (includes TeamsAdapter)
    const teamsApp = await createConfiguredTeamsBot();
    
    const teamsInitDuration = Date.now() - startTeamsInit;
    console.log(`[SERVER INIT] Teams bot created successfully in ${teamsInitDuration}ms`);

    // PHASE 18: Re-enabling file storage for CSV exports with extensive logging
    console.log('[SERVER INIT] PHASE 18: Initializing PostgreSQL file storage for CSV exports...');
    try {
      const fileInitStart = Date.now();
      await initializeFileRoutes();
      const fileInitDuration = Date.now() - fileInitStart;
      console.log(`[SERVER INIT] PHASE 18: File storage initialized successfully in ${fileInitDuration}ms`);
    } catch (error) {
      console.error('[SERVER INIT] PHASE 18: File storage initialization failed:', error);
      console.log('[SERVER INIT] PHASE 18: Continuing without file storage - CSV exports will use fallback');
    }

    console.log('[SERVER INIT] Server initialization completed successfully');
    return { teamsApp };
  } catch (error) {
    console.error('[SERVER INIT] CRITICAL: Failed to initialize server', { 
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : 'No stack trace',
      timestamp: new Date().toISOString()
    });
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
            console.warn('SECURITY: Rate limit exceeded', { ip: clientIp });
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
            console.error('Key Vault health check failed', { error });
            return null;
          });
          
          if (keyVaultTest) {
            healthCheck.checks.keyVault = { status: 'healthy', message: 'Key Vault accessible' };
          } else {
            healthCheck.checks.keyVault = { status: 'error', message: 'Cannot access Key Vault secrets' };
            healthCheck.status = 'degraded';
          }

          // Test bot authentication configuration (User-Assigned Managed Identity)
          try {
            const appId = process.env.MICROSOFT_APP_ID;
            const appType = process.env.MICROSOFT_APP_TYPE;
            
            if (appId && appType === 'UserAssignedMSI') {
              healthCheck.checks.botCredentials = { status: 'healthy', message: 'User-Assigned Managed Identity configured' };
            } else {
              healthCheck.checks.botCredentials = { status: 'error', message: 'Missing Managed Identity configuration' };
              healthCheck.status = 'degraded';
            }
          } catch {
            healthCheck.checks.botCredentials = { status: 'error', message: 'Cannot check bot authentication' };
            healthCheck.status = 'degraded';
          }

          // Test OpenAI API key availability
          if (keyVaultTest) {
            healthCheck.checks.openai = { status: 'healthy', message: 'OpenAI API key available' };
          } else {
            healthCheck.checks.openai = { status: 'error', message: 'OpenAI API key not available' };
            healthCheck.status = 'degraded';
          }

          console.log('Health check completed', { status: healthCheck.status, checks: healthCheck.checks });
          
        } catch (error) {
          console.error('Health check error', { error });
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
      console.log('[MESSAGE ENDPOINT] Received POST to /api/messages');
      console.log('[MESSAGE ENDPOINT] Request details:', {
        hasBody: !!req.body,
        bodyType: req.body?.type,
        hasAuthHeader: !!req.headers.authorization,
        userAgent: req.headers['user-agent'],
        source: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        timestamp: new Date().toISOString()
      });

      try {
        console.log('[MESSAGE ENDPOINT] Starting Teams AI processing...');
        
        // Log incoming request details for security monitoring
        const requestInfo = {
          hasAuthHeader: !!req.headers.authorization,
          activityType: req.body?.type || 'unknown',
          source: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        };
        console.log('[MESSAGE ENDPOINT] Teams message details:', requestInfo);

        console.log('[MESSAGE ENDPOINT] Getting adapter from teamsApp...');
        // Teams AI SDK handles authentication internally via TeamsAdapter
        // Process the request through Teams AI application
        const adapter = teamsApp.adapter as CloudAdapter;
        console.log('[MESSAGE ENDPOINT] Adapter obtained, calling adapter.process...');
        
        await adapter.process(req, res, async (context: TurnContext) => {
          console.log('[MESSAGE ENDPOINT] Inside adapter.process callback');
          console.log('[MESSAGE ENDPOINT] Context activity type:', context.activity?.type);
          console.log('[MESSAGE ENDPOINT] Context activity text:', context.activity?.text?.substring(0, 50));
          
          // Teams AI application will handle the request
          console.log('[MESSAGE ENDPOINT] Calling teamsApp.run...');
          await teamsApp.run(context);
          console.log('[MESSAGE ENDPOINT] teamsApp.run completed successfully');
        });
        
        console.log('[MESSAGE ENDPOINT] adapter.process completed successfully');
        
      } catch (error) {
        console.error('[MESSAGE ENDPOINT] CRITICAL ERROR processing bot message', { 
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : 'No stack trace',
          timestamp: new Date().toISOString()
        });
        
        // Track exception in Application Insights
        trackException(error as Error, {
          endpoint: '/api/messages',
          source: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        });
        
        // Don't leak internal errors to potential attackers
        if (!res.headersSent) {
          console.log('[MESSAGE ENDPOINT] Sending 500 error response');
          res.status(500);
          res.json({ error: 'Internal server error' });
        }
      }
    });

    // TEMPORARILY DISABLED: File download endpoints during debugging
    console.log('[SERVER INIT] File download endpoints DISABLED during debugging');
    
    // server.get('/api/files/:fileId', async (req, res, next) => {
    //   await handleFileDownload(req, res);
    //   return next();
    // });

    // server.get('/api/files', async (req, res, next) => {
    //   await handleFileList(req, res);
    //   return next();
    // });

    // TEMPORARILY DISABLED: Cleanup endpoint during debugging
    // server.post('/api/maintenance/cleanup', async (req, res, next) => {
    //   try {
    //     const deletedCount = await cleanupExpiredFiles();
    //     res.json({ success: true, deletedFiles: deletedCount });
    //   } catch (error) {
    //     console.error('Error during cleanup:', error);
    //     res.status(500);
    //     res.json({ error: 'Cleanup failed' });
    //   }
    //   return next();
    // });

    // Static file serving for auth flows
    server.get('/static/*', restify.plugins.serveStatic({
      directory: __dirname,
      default: 'index.html'
    }));
    
    const port = process.env.PORT || 3978;

    console.log('[SERVER START] Starting server on port', port);
    
    server.listen(port, () => {
      console.log('[SERVER START] SUCCESS: Workbook Teams Bot Server Started', {
        port,
        healthCheck: `http://localhost:${port}/health`,
        botEndpoint: `http://localhost:${port}/api/messages`,
        productionUrl: 'https://workbook-teams-bot.azurewebsites.net',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        processId: process.pid,
        uptime: process.uptime()
      });
      console.log('[SERVER START] Routes registered:');
      console.log('[SERVER START] - GET /health (health check)');
      console.log('[SERVER START] - POST /api/messages (Teams bot endpoint)');  
      console.log('[SERVER START] - GET /api/files/:fileId (file downloads - DISABLED)');
      console.log('[SERVER START] - GET /api/files (file list - DISABLED)');
      console.log('[SERVER START] Server ready to receive Teams messages');
      console.log('='.repeat(80));
    });

    return server;
  } catch (error) {
    console.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Start the server
startServer().catch(error => {
  console.error('Fatal server error', { error });
  process.exit(1);
});