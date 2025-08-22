import { createWorkbookAgent } from './src/agent/workbookAgent.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing Mastra Memory Persistence...\n');

async function testMemory() {
  try {
    // Create agent
    console.log('1️⃣ Creating Workbook Agent...');
    const agent = await createWorkbookAgent();
    console.log('✅ Agent created successfully\n');

    // Define test context
    const threadId = 'test-thread-001';
    const resourceId = 'test-user-001';

    // Test 1: Store information
    console.log('2️⃣ Testing memory storage...');
    console.log('   Sending: "My name is John and I work at Acme Corp"');
    const response1 = await agent.generate('My name is John and I work at Acme Corp', {
      threadId,
      resourceId
    });
    console.log(`   Response: ${response1.text}\n`);

    // Test 2: Recall information
    console.log('3️⃣ Testing memory recall...');
    console.log('   Sending: "What is my name?"');
    const response2 = await agent.generate('What is my name?', {
      threadId,
      resourceId
    });
    console.log(`   Response: ${response2.text}`);
    
    // Check if memory worked
    if (response2.text.toLowerCase().includes('john')) {
      console.log('✅ MEMORY WORKING: Bot remembered the name!\n');
    } else {
      console.log('❌ MEMORY FAILED: Bot did not remember the name\n');
    }

    // Test 3: Different user context
    console.log('4️⃣ Testing user isolation...');
    const differentUserId = 'test-user-002';
    console.log('   Sending as different user: "What is my name?"');
    const response3 = await agent.generate('What is my name?', {
      threadId: 'test-thread-002',
      resourceId: differentUserId
    });
    console.log(`   Response: ${response3.text}`);
    
    if (!response3.text.toLowerCase().includes('john')) {
      console.log('✅ USER ISOLATION WORKING: Different user has separate memory\n');
    } else {
      console.log('❌ USER ISOLATION FAILED: Memory leaked between users\n');
    }

    // Test 4: Semantic recall
    console.log('5️⃣ Testing semantic recall...');
    console.log('   Sending: "Where do I work?"');
    const response4 = await agent.generate('Where do I work?', {
      threadId,
      resourceId
    });
    console.log(`   Response: ${response4.text}`);
    
    if (response4.text.toLowerCase().includes('acme')) {
      console.log('✅ SEMANTIC RECALL WORKING: Bot recalled workplace!\n');
    } else {
      console.log('⚠️  SEMANTIC RECALL UNCLEAR: Bot may not have recalled workplace\n');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testMemory().then(() => {
  console.log('🏁 Memory test completed');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});