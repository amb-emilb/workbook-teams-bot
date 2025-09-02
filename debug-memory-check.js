import { createWorkbookAgent } from './src/agent/workbookAgent.js';
import dotenv from 'dotenv';

// Load environment
dotenv.config();

console.log('=== DEBUG: Memory State Investigation ===');

async function checkMemoryState() {
  try {
    // Force local dev environment (not test mode)
    delete process.env.TEST_MODE;
    delete process.env.MEMORY_DB_PATH;
    
    console.log('1. Creating agent with DEV database (same as Teams)...');
    const agent = await createWorkbookAgent();
    
    console.log('2. Testing with same query user reported...');
    const response = await agent.generate('Give me a complete overview of the database statistics', {
      threadId: 'teams-conversation-123', // Simulate Teams thread
      resourceId: 'teams-user-456'
    });
    
    console.log('3. Response from DEV database:');
    console.log('- Text:', response?.text);
    console.log('- Tool Calls:', response?.toolCalls?.length || 0);
    if (response?.toolCalls) {
      console.log('- Tools Used:', response.toolCalls.map(tc => tc.toolName));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkMemoryState();