import { agent } from './agent/workbookAgent.js';

async function testAgent() {
  try {
    console.log('🤖 Testing Mastra agent...');
    
    // Correct Mastra agent.generate() usage
    const response = await agent.generate('Hello! Can you introduce yourself?');
    
    console.log('✅ Agent Response:');
    console.log(response.text || response.content || response);
    
  } catch (error) {
    console.error('❌ Agent Error:', error.message);
    console.error('Full error:', error);
  }
}

testAgent();