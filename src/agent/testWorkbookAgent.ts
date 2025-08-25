import { Agent } from '@mastra/core/agent';
import { createOpenAI } from '@ai-sdk/openai';
import { keyVaultService } from '../services/keyVault.js';

/**
 * Create Workbook Agent optimized for testing with cost-effective model
 * Uses GPT-4o instead of GPT-4-turbo to reduce token costs
 */
export async function createTestWorkbookAgent() {
  console.log('Initializing test Workbook agent with cost-effective model...');
  
  // Get OpenAI API key from Key Vault or environment
  let openaiApiKey: string;
  try {
    openaiApiKey = await keyVaultService.getSecret('openai-api-key');
  } catch {
    // Fallback to environment variable for testing
    openaiApiKey = process.env.OPENAI_API_KEY || '';
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not found in Key Vault or environment variables');
    }
  }
  
  // Create OpenAI provider with cost-effective model
  const openaiProvider = createOpenAI({
    apiKey: openaiApiKey
  });
  
  // Import tools dynamically after they're initialized
  const tools = await import('./tools/index.js');
  
  const agent = new Agent({
    name: 'WorkbookTestAssistant',
    instructions: `You are a test assistant for Workbook CRM data management. Provide concise, accurate responses for testing purposes.

## Available Tools:
- Universal Search, Company Search, People Search
- Data Quality Analysis, Portfolio Analysis, Geographic Analysis
- Bulk Operations, Enhanced Export, Performance Monitoring
- Advanced Filter, Hierarchical Search, Relationship Mapping

## Test Guidelines:
- Be concise but complete in responses
- Use appropriate tools for each query
- Handle edge cases gracefully
- Reject malicious inputs politely
- Provide helpful guidance for vague queries
- **ALWAYS preview bulk operations before executing**`,

    model: openaiProvider('gpt-4.1-nano'), 
    tools: await tools.getAllTools()
  });

  console.log('Test Workbook agent initialized with gpt-4o model');
  return agent;
}