import { 
  Application, 
  ActionPlanner,
  PromptManager,
  OpenAIModel,
  TurnState,
  DefaultConversationState,
  DefaultUserState,
  DefaultTempState,
  TeamsAdapter
} from '@microsoft/teams-ai';
import { MemoryStorage, TurnContext, ConfigurationServiceClientCredentialFactory, MessageFactory } from 'botbuilder';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { createWorkbookAgent } from '../agent/workbookAgent.js';
import { Agent } from '@mastra/core/agent';
import { keyVaultService } from '../services/keyVault.js';
import { sanitizeInput, detectPromptInjection, validateSearchQuery } from '../utils/inputValidation.js';

// Add detailed logging for Adaptive Cards import
console.log('[ADAPTIVE CARDS] Starting import of adaptiveCards.js...');
try {
  const adaptiveCardsModule = await import('./adaptiveCards.js');
  console.log('[ADAPTIVE CARDS] Successfully imported adaptiveCards.js');
  
  var { 
    ResponseParser, 
    createCompanyResultsCard, 
    createContactResultsCard, 
    createDataQualityCard,
    createDownloadCard,
    createStatusCard
  } = adaptiveCardsModule;
  
  console.log('[ADAPTIVE CARDS] Successfully destructured exports');
} catch (error) {
  console.error('[ADAPTIVE CARDS] FAILED to import adaptiveCards.js', { error: error.message, stack: error.stack });
  // Provide fallback null functions
  var ResponseParser = null;
  var createCompanyResultsCard = null;
  var createContactResultsCard = null;
  var createDataQualityCard = null;
  var createDownloadCard = null;
  var createStatusCard = null;
}

import dotenv from 'dotenv';

dotenv.config();

// Module-level logging to track if module is being reloaded
const moduleLoadTime = new Date();
console.log(`[${moduleLoadTime.toISOString()}] teamsBot.ts module loaded/reloaded`);

/**
 * Teams AI Application that bridges our Mastra agent with Microsoft Teams
 * 
 * This maintains our existing Mastra agent logic while providing Teams integration:
 * - All 12 Workbook tools remain unchanged
 * - WorkbookClient and caching continue to work
 * - DEV environment setup is preserved
 * - Teams-specific features (Adaptive Cards, etc.) are added on top
 */

// Initialize memory storage for conversation state
const storage = new MemoryStorage();

/**
 * Initialize Teams bot with Key Vault secrets
 */
async function initializeTeamsBot() {
  console.log('Initializing Teams bot with Key Vault secrets...');
    
  try {
    // Get OpenAI API key from Key Vault
    const openaiApiKey = await keyVaultService.getSecret('openai-api-key');
        
    // Create OpenAI model for Teams AI (using Teams AI SDK pattern)
    const model = new OpenAIModel({
      apiKey: openaiApiKey,
      defaultModel: 'gpt-4o-mini',
      logRequests: true
    });

    // Create prompt manager (we'll create prompts directory)
    const promptsPath = path.join(__dirname, 'prompts');
    if (!fs.existsSync(promptsPath)) {
      fs.mkdirSync(promptsPath, { recursive: true });
    }
    const promptManager = new PromptManager({ promptsFolder: promptsPath });

    // Create AI planner with prompt manager
    const configuredPlanner = new ActionPlanner({
      model,
      prompts: promptManager,
      defaultPrompt: 'workbook-assistant'
    });

    return configuredPlanner;
  } catch (error) {
    console.error('Failed to initialize Teams bot', { error });
    throw error;
  }
}

/**
 * Application Turn State
 * Simple turn state for our Workbook context
 */
interface WorkbookTurnState extends TurnState<DefaultConversationState, DefaultUserState, DefaultTempState> {
    workbookContext?: {
        lastQuery?: string;
        lastResults?: unknown;
        userPreferences?: Record<string, unknown>;
        // Add conversation history for persistent context
        conversationHistory?: Array<{role: 'user' | 'assistant', content: string, timestamp: Date}>;
    };
}

/**
 * Create and configure the Teams AI application
 */
export async function createTeamsApp(): Promise<Application<WorkbookTurnState>> {
  const planner = await initializeTeamsBot();
  
  // Create TeamsAdapter with ConfigurationServiceClientCredentialFactory (matching TeamsChefBot pattern)
  // Support both local development (BOT_*) and Azure production (MICROSOFT_APP_*) environment variables
  const adapter = new TeamsAdapter(
    {},
    new ConfigurationServiceClientCredentialFactory({
      MicrosoftAppType: process.env.BOT_TYPE || process.env.MICROSOFT_APP_TYPE || 'UserAssignedMSI',
      MicrosoftAppId: process.env.BOT_ID || process.env.MICROSOFT_APP_ID,
      MicrosoftAppTenantId: process.env.BOT_TENANT_ID || process.env.MICROSOFT_APP_TENANT_ID
      // NO MicrosoftAppPassword for UserAssignedMSI - MSI handles authentication automatically
    })
  );
    
  return new Application<WorkbookTurnState>({
    adapter,
    storage,
    ai: {
      planner
    },
    turnStateFactory: () => {
      const state = new TurnState<DefaultConversationState, DefaultUserState, DefaultTempState>();
      (state as WorkbookTurnState).workbookContext = {};
      return state as WorkbookTurnState;
    }
  });
}

// Store initialized agent globally to avoid recreating it
let cachedWorkbookAgent: Agent | null = null;
let agentInitializationCount = 0;
let agentFirstInitialized: Date | null = null;

// Add process and module diagnostics
const processStartTime = new Date();
const moduleId = Math.random().toString(36).substring(7);
const processId = process.pid;

console.log(`[AGENT CACHE DIAGNOSTIC] teamsBot.ts loaded - PID: ${processId}, ModuleID: ${moduleId}, ProcessStart: ${processStartTime.toISOString()}`);

/**
 * Enhance plain text responses with rich Adaptive Cards when appropriate
 */
async function enhanceResponseWithAdaptiveCards(responseText: string, context: TurnContext): Promise<void> {
  console.log('[ADAPTIVE CARDS] Starting response enhancement...', {
    responseLength: responseText.length,
    responsePreview: responseText.substring(0, 100),
    hasResponseParser: !!ResponseParser,
    hasCardFunctions: !!(createCompanyResultsCard && createContactResultsCard && createDataQualityCard && createDownloadCard && createStatusCard)
  });

  // Check if imports are available
  if (!ResponseParser) {
    console.log('[ADAPTIVE CARDS] ResponseParser not available, sending plain text');
    await context.sendActivity(responseText);
    return;
  }

  try {
    console.log('[ADAPTIVE CARDS] Starting card type detection...');
    
    // Try to parse and enhance with different card types
    
    // 1. Check for data quality analysis
    const dataQualityMetrics = ResponseParser.parseDataQuality(responseText);
    if (dataQualityMetrics) {
      console.log('[ADAPTIVE CARDS] Creating data quality card', dataQualityMetrics);
      const card = createDataQualityCard(dataQualityMetrics);
      await context.sendActivity(MessageFactory.attachment(card));
      return;
    }

    // 2. Check for download links
    const downloadResult = ResponseParser.parseDownloadLink(responseText);
    if (downloadResult) {
      console.log('[ADAPTIVE CARDS] Creating download card', downloadResult);
      const card = createDownloadCard(downloadResult);
      await context.sendActivity(MessageFactory.attachment(card));
      return;
    }

    // 3. Check for company results
    const companyResults = ResponseParser.parseCompanyResults(responseText);
    if (companyResults && companyResults.length > 1) {
      console.log('[ADAPTIVE CARDS] Creating company results card', { count: companyResults.length });
      const card = createCompanyResultsCard(companyResults);
      await context.sendActivity(MessageFactory.attachment(card));
      return;
    }

    // 4. Check for contact results
    const contactResults = ResponseParser.parseContactResults(responseText);
    if (contactResults && contactResults.length > 1) {
      console.log('[ADAPTIVE CARDS] Creating contact results card', { count: contactResults.length });
      const card = createContactResultsCard(contactResults);
      await context.sendActivity(MessageFactory.attachment(card));
      return;
    }

    // 5. For other responses, send as regular text but check if we should add a status card
    if (responseText.includes('successfully') || responseText.includes('completed')) {
      console.log('[ADAPTIVE CARDS] Adding success status card');
      const card = createStatusCard('Task Completed', responseText, 'success');
      await context.sendActivity(MessageFactory.attachment(card));
      return;
    }

    // If no specific card type matches, send the original response
    console.log('[ADAPTIVE CARDS] No card enhancement applied - sending original response');
    await context.sendActivity(responseText);

  } catch (error) {
    console.error('[ADAPTIVE CARDS] Error creating adaptive card, falling back to text', { error });
    // Fallback to original text response
    await context.sendActivity(responseText);
  }
}

/**
 * Bridge function to execute Mastra agent tools through Teams AI
 * This allows our existing 12 tools to work seamlessly with Teams
 * Now includes persistent conversation context via Mastra's native memory system
 */
async function executeMastraAgent(message: string, state: WorkbookTurnState, context: TurnContext) {
  const startTime = Date.now();
  try {
    console.log('[AGENT EXECUTION] Bridging Teams AI to Mastra Agent', { 
      message: message.substring(0, 100),
      agentCached: !!cachedWorkbookAgent,
      agentInitCount: agentInitializationCount,
      agentFirstInit: agentFirstInitialized?.toISOString(),
      processId: processId,
      moduleId: moduleId,
      processUptime: Math.floor(process.uptime()),
      memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    });

    // Initialize agent if not cached
    if (!cachedWorkbookAgent) {
      agentInitializationCount++;
      if (!agentFirstInitialized) {
        agentFirstInitialized = new Date();
      }
      console.warn('[AGENT CACHE MISS] Initializing agent', { 
        initCount: agentInitializationCount,
        timeSinceFirst: agentFirstInitialized ? Date.now() - agentFirstInitialized.getTime() : 0,
        processId: processId,
        moduleId: moduleId,
        processUptime: Math.floor(process.uptime())
      });
      cachedWorkbookAgent = await createWorkbookAgent();
      console.log('[AGENT CACHED] Agent successfully cached', { 
        initCount: agentInitializationCount,
        agentType: cachedWorkbookAgent?.constructor?.name,
        processId: processId,
        moduleId: moduleId,
        memoryAfterInit: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      });
    } else {
      console.log('[AGENT CACHE HIT] Reusing existing agent', { 
        initCount: agentInitializationCount,
        agentType: cachedWorkbookAgent?.constructor?.name,
        processId: processId,
        moduleId: moduleId,
        processUptime: Math.floor(process.uptime()),
        cacheAge: agentFirstInitialized ? Math.floor((Date.now() - agentFirstInitialized.getTime()) / 1000) : 0
      });
    }

    // SECURITY: Input validation and sanitization
    // Check for prompt injection attempts
    if (detectPromptInjection(message)) {
      console.warn('SECURITY: Potential prompt injection detected', { message });
      return 'Your request contains invalid patterns. Please rephrase your query.';
    }

    // Sanitize the input
    const sanitizedMessage = sanitizeInput(message);
        
    // Validate if it's a search query
    const queryValidation = validateSearchQuery(sanitizedMessage);
    if (!queryValidation.valid) {
      console.warn('Invalid query', { error: queryValidation.error });
      return `Invalid query: ${queryValidation.error}. Please try again with a valid search term.`;
    }

    console.log('Input validated and sanitized');

    // Get Teams context for Mastra memory system
    const threadId = context.activity.conversation?.id || 'default-thread';
    const resourceId = context.activity.from?.id || 'default-user';
    const userName = context.activity.from?.name || 'Unknown User';
    
    // Enhanced memory debugging
    console.log('[MEMORY DEBUG - DETAILED]', {
      threadId: threadId,
      resourceId: resourceId,
      conversationId: context.activity.conversation?.id,
      conversationName: context.activity.conversation?.name,
      userId: context.activity.from?.id,
      userName: context.activity.from?.name,
      userAadObjectId: context.activity.from?.aadObjectId,
      channelId: context.activity.channelId,
      timestamp: new Date().toISOString()
    });

    console.log('[MASTRA MEMORY] Using native Mastra memory system', {
      threadId: threadId.substring(0, 20) + '...',
      resourceId: resourceId.substring(0, 20) + '...',
      userName: userName,
      message: queryValidation.sanitized.substring(0, 50) + '...'
    });

    // Test memory persistence before executing
    console.log('[MEMORY TEST] Testing memory persistence...');
    
    // Execute our existing Mastra agent with native memory system
    // User context is maintained through threadId and resourceId, not in the message
    // The clean message allows the agent to properly parse and execute tool calls
    const response = await cachedWorkbookAgent.generate(queryValidation.sanitized, {
      threadId,
      resourceId
    });
    
    // Log memory state after generation
    console.log('[MEMORY STATE] After generation', {
      threadId: threadId,
      resourceId: resourceId,
      responseReceived: !!response
    });

    // Extract the response text
    let responseText = '';
    if (response && response.text) {
      responseText = response.text;
    } else {
      responseText = 'I completed the task successfully.';
    }

    const duration = Date.now() - startTime;
    console.log('[AGENT RESPONSE] Mastra agent response received with native memory', { 
      responseLength: responseText.length,
      duration: duration,
      threadId: threadId.substring(0, 20) + '...',
      resourceId: resourceId.substring(0, 20) + '...',
      userName: userName,
      preview: responseText.substring(0, 100) 
    });
    return responseText;

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Error bridging to Mastra agent', { error, duration });
    return 'I encountered an error while processing your request. Please try again.';
  }
}

/**
 * Configure Teams bot handlers
 */
export async function configureTeamsBotHandlers(app: Application<WorkbookTurnState>) {
  // Handle all messages by bridging to our Mastra agent
  app.message(/.*/, async (context: TurnContext, state: WorkbookTurnState) => {
    console.log('[MESSAGE HANDLER] Received message, starting processing...');
    
    const message = context.activity.text || '';
        
    if (!message.trim()) {
      console.log('[MESSAGE HANDLER] Empty message, sending greeting');
      await context.sendActivity('Hi! I\'m your Workbook assistant. Ask me about resources, companies, or data analysis.');
      return;
    }

    console.log('[MESSAGE HANDLER] Processing message:', message.substring(0, 50) + '...');

    // Show typing indicator while processing
    await context.sendActivity({ type: 'typing' });

    try {
      console.log('[MESSAGE HANDLER] Calling executeMastraAgent...');
      
      // Bridge to our existing Mastra agent with persistent conversation context
      const response = await executeMastraAgent(message, state, context);
      
      console.log('[MESSAGE HANDLER] Got response from agent, length:', response?.length || 0);
            
      // Store additional context for future turns (conversation history is managed in executeMastraAgent)
      if (!state.workbookContext) {
        state.workbookContext = {};
      }
      state.workbookContext.lastQuery = message;
      state.workbookContext.lastResults = response;
      
      // Log bot message exchange
      const userId = context.activity.from?.id || 'unknown';
      console.log('[BOT MESSAGE]', { userId, messageLength: message.length, responseLength: response.length });
            
      // Enhanced response with Adaptive Cards when appropriate
      await enhanceResponseWithAdaptiveCards(response, context);

    } catch (error) {
      console.error('Teams message handler error', { error });
      await context.sendActivity('I\'m experiencing technical difficulties. Please try again later.');
    }
  });

  // Handle adaptive card action submits
  app.adaptiveCards.actionSubmit('company_details', async (context, state, data) => {
    console.log('[ADAPTIVE CARDS] Company details action', { data });
    const companyName = data.companyName;
    if (companyName) {
      const response = await executeMastraAgent(`Show me detailed information about ${companyName}`, state, context);
      await enhanceResponseWithAdaptiveCards(response, context);
    } else {
      await context.sendActivity('Company information not available.');
    }
  });

  app.adaptiveCards.actionSubmit('view_all_companies', async (context, state) => {
    console.log('[ADAPTIVE CARDS] View all companies action');
    const response = await executeMastraAgent('Show me all companies with full details', state, context);
    await enhanceResponseWithAdaptiveCards(response, context);
  });

  app.adaptiveCards.actionSubmit('view_all_contacts', async (context, state) => {
    console.log('[ADAPTIVE CARDS] View all contacts action');
    const response = await executeMastraAgent('Show me all contacts with full details', state, context);
    await enhanceResponseWithAdaptiveCards(response, context);
  });

  app.adaptiveCards.actionSubmit('export_data_quality', async (context, state) => {
    console.log('[ADAPTIVE CARDS] Export data quality action');
    const response = await executeMastraAgent('Export comprehensive data quality report to CSV', state, context);
    await enhanceResponseWithAdaptiveCards(response, context);
  });

  app.adaptiveCards.actionSubmit('data_quality_recommendations', async (context, state) => {
    console.log('[ADAPTIVE CARDS] Data quality recommendations action');
    const response = await executeMastraAgent('Give me detailed recommendations to improve our CRM data quality', state, context);
    await enhanceResponseWithAdaptiveCards(response, context);
  });

  app.adaptiveCards.actionSubmit('export_options', async (context) => {
    console.log('[ADAPTIVE CARDS] Export options action');
    await context.sendActivity('Choose export format:\n• CSV - Comma-separated values\n• Excel - Microsoft Excel format\n• JSON - JavaScript Object Notation\n\nJust ask me to "export as [format]" for your preferred format.');
  });

  // Add logging for debugging - using conversationUpdate as a generic activity handler
  app.conversationUpdate('membersAdded', async (context: TurnContext) => {
    console.log('Processing activity', { 
      type: context.activity.type,
      text: context.activity.text 
    });
  });
}

/**
 * Create and configure the complete Teams bot application
 */
export async function createConfiguredTeamsBot(): Promise<Application<WorkbookTurnState>> {
  const app = await createTeamsApp();
  await configureTeamsBotHandlers(app);
  return app;
}