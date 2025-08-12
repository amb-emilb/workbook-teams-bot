import { agent } from '../src/agent/workbookAgent.js';

async function testAgent() {
  try {
    console.log('🤖 Testing Mastra agent...');
    
    // Correct Mastra agent.generate() usage
    const response = await agent.generate('Hello! Can you introduce yourself?');
    
    console.log('✅ Agent Response:');
    console.log(response.text);
    
  } catch (error) {
    console.error('❌ Agent Error:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error:', error);
  }
}

testAgent();