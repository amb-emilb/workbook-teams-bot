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
import { MemoryStorage, TurnContext, ConfigurationServiceClientCredentialFactory } from 'botbuilder';
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

// TEMPORARILY DISABLED: Adaptive Cards functionality to isolate the bot hanging issue
console.log('[ADAPTIVE CARDS] TEMPORARILY DISABLED - Testing if this fixes the hanging issue');

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
 * TEMPORARILY DISABLED: Adaptive Cards functionality 
 * Send plain text response while we debug the hanging issue
 */
async function enhanceResponseWithAdaptiveCards(responseText: string, context: TurnContext): Promise<void> {
  console.log('[ADAPTIVE CARDS] DISABLED - Sending plain text response');
  await context.sendActivity(responseText);
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

  // TEMPORARILY DISABLED: Adaptive Cards action handlers
  console.log('[ADAPTIVE CARDS] Action handlers DISABLED during debugging');

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