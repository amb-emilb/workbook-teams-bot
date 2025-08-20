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
import dotenv from 'dotenv';

dotenv.config();

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
  console.log('🔐 Initializing Teams bot with Key Vault secrets...');
    
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
    console.error('❌ Failed to initialize Teams bot:', error);
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

/**
 * Bridge function to execute Mastra agent tools through Teams AI
 * This allows our existing 12 tools to work seamlessly with Teams
 */
async function executeMastraAgent(message: string) {
  try {
    console.log('🔄 Bridging Teams AI → Mastra Agent');
    console.log('📝 User message:', message);

    // Initialize agent if not cached
    if (!cachedWorkbookAgent) {
      console.log('🔧 Initializing Workbook agent...');
      cachedWorkbookAgent = await createWorkbookAgent();
    }

    // SECURITY: Input validation and sanitization
    // Check for prompt injection attempts
    if (detectPromptInjection(message)) {
      console.warn('⚠️ Potential prompt injection detected:', message);
      return 'Your request contains invalid patterns. Please rephrase your query.';
    }

    // Sanitize the input
    const sanitizedMessage = sanitizeInput(message);
        
    // Validate if it's a search query
    const queryValidation = validateSearchQuery(sanitizedMessage);
    if (!queryValidation.valid) {
      console.warn('❌ Invalid query:', queryValidation.error);
      return `Invalid query: ${queryValidation.error}. Please try again with a valid search term.`;
    }

    console.log('✅ Input validated and sanitized');

    // Execute our existing Mastra agent with sanitized input
    const response = await cachedWorkbookAgent.generate([
      { role: 'user', content: queryValidation.sanitized }
    ]);

    // Extract the response text
    let responseText = '';
    if (response && response.text) {
      responseText = response.text;
    } else {
      responseText = 'I completed the task successfully.';
    }

    console.log('✅ Mastra agent response:', responseText.substring(0, 200) + '...');
    return responseText;

  } catch (error) {
    console.error('❌ Error bridging to Mastra agent:', error);
    return 'I encountered an error while processing your request. Please try again.';
  }
}

/**
 * Configure Teams bot handlers
 */
export async function configureTeamsBotHandlers(app: Application<WorkbookTurnState>) {
  // Handle all messages by bridging to our Mastra agent
  app.message(/.*/, async (context: TurnContext, state: WorkbookTurnState) => {
    const message = context.activity.text || '';
        
    if (!message.trim()) {
      await context.sendActivity('Hi! I\'m your Workbook assistant. Ask me about resources, companies, or data analysis.');
      return;
    }

    // Show typing indicator while processing
    await context.sendActivity({ type: 'typing' });

    try {
      // Bridge to our existing Mastra agent
      const response = await executeMastraAgent(message);
            
      // Store context for future turns
      if (state.workbookContext) {
        state.workbookContext.lastQuery = message;
        state.workbookContext.lastResults = response;
      }
            
      // Send the response back to Teams
      await context.sendActivity(response);

    } catch (error) {
      console.error('❌ Teams message handler error:', error);
      await context.sendActivity('I\'m experiencing technical difficulties. Please try again later.');
    }
  });

  // Handle adaptive card submits (for future interactive features)
  app.adaptiveCards.actionSubmit('workbook_action', async (context, state, data) => {
    console.log('📋 Adaptive card action received:', data);
    await context.sendActivity('Action received and processed.');
  });

  // Add logging for debugging - using conversationUpdate as a generic activity handler
  app.conversationUpdate('membersAdded', async (context: TurnContext) => {
    console.log(`🔄 Processing activity: ${context.activity.type}`);
    if (context.activity.text) {
      console.log(`📝 Message: "${context.activity.text}"`);
    }
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