import { 
    Application, 
    ActionPlanner,
    PromptManager,
    OpenAIModel
} from '@microsoft/teams-ai';
import { MemoryStorage, TurnContext } from 'botbuilder';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { createWorkbookAgent } from '../agent/workbookAgent.js';
import { keyVaultService } from '../services/keyVault.js';
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
        
        // Create OpenAI model for Teams AI
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
        const promptManager = new PromptManager(promptsPath);

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
interface WorkbookTurnState {
    conversation: any;
    user: any;
    temp: any;
    workbookContext?: {
        lastQuery?: string;
        lastResults?: any;
        userPreferences?: Record<string, any>;
    };
}

/**
 * Create and configure the Teams AI application
 */
export async function createTeamsApp(): Promise<Application<WorkbookTurnState>> {
    const planner = await initializeTeamsBot();
    
    return new Application<WorkbookTurnState>({
        storage,
        ai: {
            planner
        },
        turnStateFactory: () => ({
            conversation: {},
            user: {},
            temp: {},
            workbookContext: {}
        })
    });
}

// Store initialized agent globally to avoid recreating it
let cachedWorkbookAgent: any = null;

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

        // Execute our existing Mastra agent
        const response = await cachedWorkbookAgent.run({
            messages: [{ role: 'user', content: message }]
        });

        // Extract the response text
        let responseText = '';
        if (response && response.messages && response.messages.length > 0) {
            const lastMessage = response.messages[response.messages.length - 1];
            responseText = lastMessage.content || 'I processed your request.';
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
    app.message(async (context, state) => {
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

    // Add logging for debugging
    app.turn(async (context, next) => {
        console.log(`🔄 Processing activity: ${context.activity.type}`);
        if (context.activity.text) {
            console.log(`📝 Message: "${context.activity.text}"`);
        }
        await next();
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