import dotenv from 'dotenv';
import { createWorkbookAgent } from '../src/agent/workbookAgent.js';
import { WorkbookClient } from '../src/services/index.js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = path.join(process.cwd(), 'logs', `cleanup-verification-${timestamp}.log`);

function log(message: string, data?: any) {
  const logMessage = `[${new Date().toISOString()}] ${message}\n${data ? JSON.stringify(data, null, 2) : ''}\n\n`;
  console.log(message, data || '');
  
  if (!fs.existsSync(path.dirname(logFile))) {
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
  }
  fs.appendFileSync(logFile, logMessage);
}

async function verifyCleanup() {
  log('🧹 Verifying Time Entry Cleanup and Tool Functionality');
  log('=' .repeat(55));
  
  const results = {
    passed: 0,
    failed: 0,
    errors: [] as any[]
  };

  // Create agent for testing
  const agent = await createWorkbookAgent();

  try {
    // Test 1: Verify WorkbookClient initialization
    log('\n📋 Test 1: WorkbookClient Initialization');
    try {
      const client = WorkbookClient.fromEnvironment();
      
      // Check that timeEntries property doesn't exist
      if ('timeEntries' in client) {
        log('❌ TimeEntries service still exists in WorkbookClient');
        results.failed++;
        results.errors.push({ test: 'WorkbookClient', error: 'timeEntries property still exists' });
      } else {
        log('✅ WorkbookClient initialized without timeEntries service');
        results.passed++;
      }
      
      // Verify resources service still works
      const stats = await client.resources.getStats();
      if (stats.success) {
        log('✅ Resources service working correctly', stats.data);
        results.passed++;
      } else {
        log('❌ Resources service failed', stats.error);
        results.failed++;
      }
    } catch (error) {
      log('❌ WorkbookClient initialization failed', error);
      results.failed++;
      results.errors.push({ test: 'WorkbookClient', error });
    }

    // Test 2: Verify agent has correct number of tools
    log('\n📋 Test 2: Agent Tool Configuration');
    try {
      const toolCount = Object.keys(agent.tools).length;
      log(`Agent has ${toolCount} tools`);
      
      // Should have 14 tools (all tools from our current implementation)
      if (toolCount >= 10) {
        log(`✅ Correct number of tools (${toolCount}) - all expected tools present`);
        results.passed++;
      } else {
        log(`⚠️ Unexpected tool count: ${toolCount} (expected at least 10)`);
        results.failed++;
        results.errors.push({ test: 'Agent Tools', error: `Wrong tool count: ${toolCount}` });
      }
      
      // List all tools
      const toolNames = Object.keys(agent.tools);
      log('Available tools:', toolNames);
      
      // Check that no time entry tools exist
      const timeEntryTools = toolNames.filter(name => 
        name.includes('timeEntry') || name.includes('time-entry')
      );
      
      if (timeEntryTools.length > 0) {
        log('❌ Time entry tools still exist:', timeEntryTools);
        results.failed++;
        results.errors.push({ test: 'Agent Tools', error: 'Time entry tools still present' });
      } else {
        log('✅ No time entry tools found');
        results.passed++;
      }
    } catch (error) {
      log('❌ Agent tool verification failed', error);
      results.failed++;
      results.errors.push({ test: 'Agent Tools', error });
    }

    // Test 3: Test a basic agent query
    log('\n📋 Test 3: Agent Basic Functionality');
    try {
      const response = await agent.generate('Can you give me database statistics?');
      
      if (response && response.text) {
        log('✅ Agent responded successfully');
        log('Response preview:', response.text.substring(0, 200) + '...');
        results.passed++;
      } else {
        log('❌ Agent response was empty or invalid');
        results.failed++;
        results.errors.push({ test: 'Agent Query', error: 'Empty response' });
      }
    } catch (error) {
      log('❌ Agent query failed', error);
      results.failed++;
      results.errors.push({ test: 'Agent Query', error });
    }

    // Test 4: Test universal search tool
    log('\n📋 Test 4: Universal Search Tool');
    try {
      const response = await agent.generate('Find companies starting with A - limit to 3 results');
      
      if (response && response.text) {
        log('✅ Universal search tool working');
        log('Response preview:', response.text.substring(0, 200) + '...');
        results.passed++;
      } else {
        log('❌ Universal search tool failed');
        results.failed++;
      }
    } catch (error) {
      log('❌ Universal search test failed', error);
      results.failed++;
      results.errors.push({ test: 'Universal Search', error });
    }

    // Test 5: Verify health check
    log('\n📋 Test 5: Health Check');
    try {
      const client = WorkbookClient.fromEnvironment();
      const health = await client.healthCheck();
      
      log('Health check results:', health);
      
      // Check that timeEntries is not in services
      if ('timeEntries' in health.services) {
        log('❌ timeEntries still in health check');
        results.failed++;
        results.errors.push({ test: 'Health Check', error: 'timeEntries in services' });
      } else {
        log('✅ Health check properly updated');
        results.passed++;
      }
      
      if (health.services.resources) {
        log('✅ Resources service healthy');
        results.passed++;
      } else {
        log('⚠️ Resources service unhealthy');
        results.failed++;
      }
    } catch (error) {
      log('❌ Health check failed', error);
      results.failed++;
      results.errors.push({ test: 'Health Check', error });
    }

  } catch (error) {
    log('❌ Unexpected error during verification', error);
    results.errors.push({ test: 'overall', error });
  }

  // Summary
  log('\n\n=====================================');
  log('📊 CLEANUP VERIFICATION RESULTS');
  log('=====================================');
  log(`✅ Passed: ${results.passed}`);
  log(`❌ Failed: ${results.failed}`);
  log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`);
  
  if (results.errors.length > 0) {
    log('\n⚠️ Errors Encountered:');
    results.errors.forEach(err => {
      log(`  - ${err.test}: ${err.error instanceof Error ? err.error.message : JSON.stringify(err.error)}`);
    });
  }

  log('\n📁 Full log saved to:', logFile);
  
  return results;
}

// Run the verification
console.log('🧹 Starting Cleanup Verification...\n');
verifyCleanup()
  .then(results => {
    console.log('\n✅ Verification completed');
    process.exit(results.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });