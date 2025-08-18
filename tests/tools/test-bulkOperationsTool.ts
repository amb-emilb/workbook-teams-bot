/**
 * Real Integration Test Suite for Bulk Operations Tool (bulkOperationsTool.ts)
 * Tests against actual Workbook API in dev environment
 */
import dotenv from 'dotenv';
import { RealToolTester, createTestWorkbookClient } from '../utils/testHelpers.js';
import { createBulkOperationsTool } from '../../src/agent/tools/bulkOperationsTool.js';
import { RuntimeContext } from '@mastra/core/runtime-context';

dotenv.config();

async function testBulkOperationsToolReal() {
  // Initialize real WorkbookClient
  const workbookClient = await createTestWorkbookClient();
  const tester = new RealToolTester('bulkOperationsTool', workbookClient);

  try {
    console.log('🔄 Initializing real WorkbookClient for integration testing...');
    
    // Test basic API connectivity first
    console.log('🔌 Testing API connectivity...');
    const statsResponse = await workbookClient.resources.getStats();
    if (!statsResponse.success) {
      throw new Error(`API connectivity test failed: ${statsResponse.error}`);
    }
    console.log('✅ API connectivity confirmed');

    // Real integration test scenarios
    const realScenarios = [
      {
        name: 'Preview Bulk Activation',
        description: 'Preview activation of multiple resources',
        input: { 
          operation: 'preview' as const, 
          resourceIds: [1, 2, 3], 
          newValues: { active: true },
          confirmationRequired: true 
        },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Preview Bulk Deactivation',
        description: 'Preview deactivation of resources',
        input: { 
          operation: 'preview' as const, 
          resourceIds: [4, 5], 
          newValues: { active: false },
          confirmationRequired: true 
        },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Preview Email Update',
        description: 'Preview bulk email update operation',
        input: { 
          operation: 'preview' as const, 
          resourceIds: [1], 
          newValues: { email: 'test@example.com' },
          confirmationRequired: true 
        },
        expectedSuccess: true,
        maxDuration: 6000
      },
      {
        name: 'Single Resource Operation',
        description: 'Preview operation on single resource',
        input: { 
          operation: 'preview' as const, 
          resourceIds: [1], 
          confirmationRequired: false 
        },
        expectedSuccess: true,
        maxDuration: 5000
      },
      {
        name: 'Maximum Resources Preview',
        description: 'Preview with maximum allowed resources',
        input: { 
          operation: 'preview' as const, 
          resourceIds: Array.from({length: 100}, (_, i) => i + 1),
          confirmationRequired: true 
        },
        expectedSuccess: true,
        maxDuration: 20000
      },
      {
        name: 'Folder Update Preview',
        description: 'Preview folder assignment update',
        input: { 
          operation: 'preview' as const, 
          resourceIds: [1, 2, 3], 
          newValues: { resourceFolder: 'NewFolder' },
          confirmationRequired: true 
        },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Search-Based Operation',
        description: 'Preview operation with search criteria',
        input: { 
          operation: 'preview' as const, 
          resourceIds: [1, 2], 
          searchCriteria: { query: 'test' },
          confirmationRequired: true 
        },
        expectedSuccess: true,
        maxDuration: 10000
      }
    ];

    // Execute real API tests
    await tester.testTool(createBulkOperationsTool, realScenarios);

    // Test input validation with real schemas
    await tester.testInputValidation(createBulkOperationsTool, [
      {
        name: 'Valid Activation Operation',
        input: { 
          operation: 'activate' as const, 
          resourceIds: [1, 2, 3], 
          confirmationRequired: false 
        },
        shouldPass: true
      },
      {
        name: 'Valid Deactivation Operation',
        input: { 
          operation: 'deactivate' as const, 
          resourceIds: [4, 5] 
        },
        shouldPass: true
      },
      {
        name: 'Valid Email Update',
        input: { 
          operation: 'updateEmail' as const, 
          resourceIds: [1], 
          newValues: { email: 'new@example.com' } 
        },
        shouldPass: true
      },
      {
        name: 'Valid Preview Operation',
        input: { 
          operation: 'preview' as const, 
          resourceIds: [1, 2, 3, 4, 5] 
        },
        shouldPass: true
      },
      {
        name: 'Empty Resource IDs (Invalid)',
        input: { 
          operation: 'activate' as const, 
          resourceIds: [] 
        },
        shouldPass: false
      },
      {
        name: 'Too Many Resources (Invalid)',
        input: { 
          operation: 'activate' as const, 
          resourceIds: Array.from({length: 101}, (_, i) => i + 1) 
        },
        shouldPass: false
      },
      {
        name: 'Invalid Operation Type',
        input: { 
          operation: 'delete' as 'delete', 
          resourceIds: [1] 
        },
        shouldPass: false
      },
      {
        name: 'Invalid Email Format',
        input: { 
          operation: 'updateEmail' as const, 
          resourceIds: [1], 
          newValues: { email: 'not-an-email' } 
        },
        shouldPass: false
      },
      {
        name: 'Wrong Resource ID Type',
        input: { 
          operation: 'activate' as const, 
          resourceIds: ['one', 'two'] as string[] 
        },
        shouldPass: false
      }
    ]);

    // Test real API error scenarios
    await tester.testRealErrorScenarios(createBulkOperationsTool, [
      {
        name: 'Non-Existent Resource IDs',
        input: { 
          operation: 'preview' as const, 
          resourceIds: [999999, 999998, 999997] 
        },
        description: 'Test with resource IDs that likely do not exist'
      },
      {
        name: 'Negative Resource IDs',
        input: { 
          operation: 'preview' as const, 
          resourceIds: [-1, -2, -3] 
        },
        description: 'Test with negative resource IDs'
      },
      {
        name: 'Mixed Valid and Invalid IDs',
        input: { 
          operation: 'preview' as const, 
          resourceIds: [1, 999999, 2] 
        },
        description: 'Test with mix of valid and invalid IDs'
      }
    ]);

    // Test real API performance
    await tester.testRealPerformance(createBulkOperationsTool, [
      {
        name: 'Small Batch Performance',
        input: { 
          operation: 'preview' as const, 
          resourceIds: [1, 2, 3] 
        },
        expectedMaxDuration: 5000,
        description: 'Small batch should be fast'
      },
      {
        name: 'Medium Batch Performance',
        input: { 
          operation: 'preview' as const, 
          resourceIds: Array.from({length: 25}, (_, i) => i + 1) 
        },
        expectedMaxDuration: 10000,
        description: 'Medium batch performance'
      },
      {
        name: 'Large Batch Performance',
        input: { 
          operation: 'preview' as const, 
          resourceIds: Array.from({length: 50}, (_, i) => i + 1) 
        },
        expectedMaxDuration: 15000,
        description: 'Large batch performance'
      }
    ]);

    // Tool-specific real API tests
    console.log('\n🔧 BULK OPERATIONS TOOL REAL API SPECIFIC TESTS');
    console.log('─'.repeat(50));

    // Test different bulk operation patterns with real data
    const tool = createBulkOperationsTool(workbookClient);

    // Test preview mode
    console.log('👁️ Testing preview mode...');
    try {
      const previewResult = await tool.execute({
        context: { 
          operation: 'preview' as const, 
          resourceIds: [1, 2], 
          confirmationRequired: true 
        },
        runtimeContext: new RuntimeContext(),
        runId: `preview-test-${Date.now()}`,
        threadId: `preview-thread-${Date.now()}`,
        resourceId: `preview-resource-${Date.now()}`
      });
      console.log('✅ Preview mode completed');
      console.log(`   Result type: ${typeof previewResult}`);
      console.log(`   Preview: ${JSON.stringify(previewResult).substring(0, 150)}...`);
    } catch (error) {
      console.log(`⚠️ Preview mode error: ${error}`);
    }

    // Test activation operation
    console.log('\n✅ Testing activation operation preview...');
    try {
      const activateResult = await tool.execute({
        context: { 
          operation: 'preview' as const, 
          resourceIds: [3, 4, 5], 
          newValues: { active: true },
          confirmationRequired: false 
        },
        runtimeContext: new RuntimeContext(),
        runId: `activate-test-${Date.now()}`,
        threadId: `activate-thread-${Date.now()}`,
        resourceId: `activate-resource-${Date.now()}`
      });
      console.log('✅ Activation preview completed');
      console.log(`   Result type: ${typeof activateResult}`);
    } catch (error) {
      console.log(`⚠️ Activation preview error: ${error}`);
    }

    // Test email update operation
    console.log('\n📧 Testing email update preview...');
    try {
      const emailResult = await tool.execute({
        context: { 
          operation: 'preview' as const, 
          resourceIds: [1], 
          newValues: { email: 'bulk-test@example.com' },
          confirmationRequired: false
        },
        runtimeContext: new RuntimeContext(),
        runId: `email-test-${Date.now()}`,
        threadId: `email-thread-${Date.now()}`,
        resourceId: `email-resource-${Date.now()}`
      });
      console.log('✅ Email update preview completed');
      console.log(`   Result type: ${typeof emailResult}`);
    } catch (error) {
      console.log(`⚠️ Email update preview error: ${error}`);
    }

    // Test search-based operation
    console.log('\n🔍 Testing search-based bulk operation...');
    try {
      const searchResult = await tool.execute({
        context: { 
          operation: 'preview' as const, 
          resourceIds: [1, 2], 
          searchCriteria: { query: 'manager' },
          confirmationRequired: false
        },
        runtimeContext: new RuntimeContext(),
        runId: `search-test-${Date.now()}`,
        threadId: `search-thread-${Date.now()}`,
        resourceId: `search-resource-${Date.now()}`
      });
      console.log('✅ Search-based operation completed');
      console.log(`   Result type: ${typeof searchResult}`);
    } catch (error) {
      console.log(`⚠️ Search-based operation error: ${error}`);
    }

    // Generate comprehensive summary
    const summary = tester.generateSummary();
    console.log(`\n📊 Bulk Operations Tool Real Integration Test Complete - ${summary.successRate.toFixed(1)}% success rate`);
    console.log(`📄 Detailed logs: ${summary.logFile}`);

    return summary;

  } catch (error) {
    console.error('❌ Bulk Operations Tool real integration test failed:', error);
    throw error;
  }
}

// Run if called directly
testBulkOperationsToolReal()
  .then(summary => {
    console.log(`\n🎉 Bulk Operations Tool real integration testing completed with ${summary.successful}/${summary.totalTests} tests passed`);
    process.exit(summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('💥 Bulk Operations Tool real integration test suite failed:', error);
    process.exit(1);
  });

export { testBulkOperationsToolReal };