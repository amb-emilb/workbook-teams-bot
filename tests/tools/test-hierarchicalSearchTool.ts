/**
 * Real Integration Test Suite for Hierarchical Search Tool (hierarchicalSearchTool.ts)
 * Tests against actual Workbook API in dev environment
 */
import dotenv from 'dotenv';
import { RealToolTester, createTestWorkbookClient } from '../utils/testHelpers.js';
import { createHierarchicalSearchTool } from '../../src/agent/tools/hierarchicalSearchTool.js';
import { RuntimeContext } from '@mastra/core/runtime-context';

dotenv.config();

async function testHierarchicalSearchToolReal() {
  // Initialize real WorkbookClient
  const workbookClient = await createTestWorkbookClient();
  const tester = new RealToolTester('hierarchicalSearchTool', workbookClient);

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
        name: 'Get All Companies with Contacts',
        description: 'Get companies with their contact hierarchy',
        input: { includeContacts: true, limit: 5 },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Get Companies Without Contacts',
        description: 'Get companies without contact details',
        input: { includeContacts: false, limit: 8 },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Get Specific Company Hierarchy',
        description: 'Get hierarchy for a specific resource ID',
        input: { resourceId: 1, includeContacts: true, limit: 1 },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Minimal Limit with Contacts',
        description: 'Get single company with full hierarchy',
        input: { includeContacts: true, limit: 1 },
        expectedSuccess: true,
        maxDuration: 6000
      },
      {
        name: 'Maximum Limit Test',
        description: 'Get maximum allowed companies',
        input: { includeContacts: true, limit: 10 },
        expectedSuccess: true,
        maxDuration: 15000
      },
      {
        name: 'Default Parameters',
        description: 'Test with all default values',
        input: {},
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Mid-Range Limit',
        description: 'Get moderate number of companies',
        input: { includeContacts: true, limit: 3 },
        expectedSuccess: true,
        maxDuration: 8000
      }
    ];

    // Execute real API tests
    await tester.testTool(createHierarchicalSearchTool, realScenarios);

    // Test input validation with real schemas
    await tester.testInputValidation(createHierarchicalSearchTool, [
      {
        name: 'Valid All Parameters',
        input: { resourceId: 123, includeContacts: true, limit: 5 },
        shouldPass: true
      },
      {
        name: 'Only Limit Specified',
        input: { limit: 7 },
        shouldPass: true
      },
      {
        name: 'Only Include Contacts',
        input: { includeContacts: false },
        shouldPass: true
      },
      {
        name: 'Empty Object (Defaults)',
        input: {},
        shouldPass: true
      },
      {
        name: 'Resource ID Only',
        input: { resourceId: 456 },
        shouldPass: true
      },
      {
        name: 'Limit Too Low (Invalid)',
        input: { limit: 0 },
        shouldPass: false
      },
      {
        name: 'Limit Too High (Invalid)',
        input: { limit: 11 },
        shouldPass: false
      },
      {
        name: 'Negative Limit (Invalid)',
        input: { limit: -5 },
        shouldPass: false
      },
      {
        name: 'Wrong Resource ID Type (Invalid)',
        input: { resourceId: 'abc' },
        shouldPass: false
      },
      {
        name: 'Wrong Include Contacts Type (Invalid)',
        input: { includeContacts: 'yes' },
        shouldPass: false
      }
    ]);

    // Test real API error scenarios
    await tester.testRealErrorScenarios(createHierarchicalSearchTool, [
      {
        name: 'Non-Existent Resource ID',
        input: { resourceId: 999999999, includeContacts: true },
        description: 'Test with resource ID that likely does not exist'
      },
      {
        name: 'Negative Resource ID',
        input: { resourceId: -1, includeContacts: true },
        description: 'Test with negative resource ID'
      },
      {
        name: 'Very Large Resource ID',
        input: { resourceId: Number.MAX_SAFE_INTEGER, includeContacts: true },
        description: 'Test with maximum safe integer as resource ID'
      }
    ]);

    // Test real API performance
    await tester.testRealPerformance(createHierarchicalSearchTool, [
      {
        name: 'Quick Hierarchy Without Contacts',
        input: { includeContacts: false, limit: 3 },
        expectedMaxDuration: 5000,
        description: 'Without contacts should be faster'
      },
      {
        name: 'Single Company with Contacts',
        input: { includeContacts: true, limit: 1 },
        expectedMaxDuration: 7000,
        description: 'Single company with full hierarchy'
      },
      {
        name: 'Maximum Companies with Contacts',
        input: { includeContacts: true, limit: 10 },
        expectedMaxDuration: 20000,
        description: 'Maximum companies with full hierarchy'
      }
    ]);

    // Tool-specific real API tests
    console.log('\n🔧 HIERARCHICAL SEARCH TOOL REAL API SPECIFIC TESTS');
    console.log('─'.repeat(50));

    // Test different hierarchy patterns with real data
    const tool = createHierarchicalSearchTool(workbookClient);

    // Test basic hierarchy retrieval
    console.log('🏢 Testing basic hierarchy retrieval...');
    try {
      const hierarchyResult = await tool.execute({
        context: { includeContacts: true, limit: 2 },
        runtimeContext: new RuntimeContext(),
        runId: `hierarchy-test-${Date.now()}`,
        threadId: `hierarchy-thread-${Date.now()}`,
        resourceId: `hierarchy-resource-${Date.now()}`
      });
      console.log('✅ Hierarchy retrieval completed');
      console.log(`   Result type: ${typeof hierarchyResult}`);
      if (hierarchyResult && typeof hierarchyResult === 'object' && 'companies' in hierarchyResult) {
        const companies = (hierarchyResult as { companies: unknown[] }).companies;
        console.log(`   Companies returned: ${Array.isArray(companies) ? companies.length : 0}`);
      }
    } catch (error) {
      console.log(`⚠️ Hierarchy retrieval error: ${error}`);
    }

    // Test responsible employee mapping
    console.log('\n👤 Testing responsible employee mapping...');
    try {
      const employeeResult = await tool.execute({
        context: { includeContacts: false, limit: 5 },
        runtimeContext: new RuntimeContext(),
        runId: `employee-test-${Date.now()}`,
        threadId: `employee-thread-${Date.now()}`,
        resourceId: `employee-resource-${Date.now()}`
      });
      console.log('✅ Responsible employee mapping completed');
      console.log(`   Result type: ${typeof employeeResult}`);
      if (employeeResult && typeof employeeResult === 'object' && 'companies' in employeeResult) {
        const companies = (employeeResult as { companies: { responsibleEmployee?: string }[] }).companies;
        if (Array.isArray(companies) && companies.length > 0) {
          const withResponsible = companies.filter((c: { responsibleEmployee?: string }) => c.responsibleEmployee).length;
          console.log(`   Companies with responsible: ${withResponsible}/${companies.length}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ Responsible employee mapping error: ${error}`);
    }

    // Test contact count accuracy
    console.log('\n📊 Testing contact count accuracy...');
    try {
      const contactResult = await tool.execute({
        context: { includeContacts: true, limit: 3 },
        runtimeContext: new RuntimeContext(),
        runId: `contact-test-${Date.now()}`,
        threadId: `contact-thread-${Date.now()}`,
        resourceId: `contact-resource-${Date.now()}`
      });
      console.log('✅ Contact count testing completed');
      console.log(`   Result type: ${typeof contactResult}`);
      if (contactResult && typeof contactResult === 'object' && 'companies' in contactResult) {
        const companies = (contactResult as { companies: { name: string; contactCount: number; contacts?: unknown[] }[] }).companies;
        if (Array.isArray(companies) && companies.length > 0) {
          companies.forEach((c: { name: string; contactCount: number; contacts?: unknown[] }, idx: number) => {
            const actualContacts = c.contacts ? c.contacts.length : 0;
            console.log(`   Company ${idx + 1}: ${c.contactCount} reported, ${actualContacts} actual`);
          });
        }
      }
    } catch (error) {
      console.log(`⚠️ Contact count testing error: ${error}`);
    }

    // Test specific resource ID lookup
    console.log('\n🔍 Testing specific resource ID lookup...');
    try {
      const resourceResult = await tool.execute({
        context: { resourceId: 1, includeContacts: true, limit: 1 },
        runtimeContext: new RuntimeContext(),
        runId: `resource-test-${Date.now()}`,
        threadId: `resource-thread-${Date.now()}`,
        resourceId: `resource-resource-${Date.now()}`
      });
      console.log('✅ Resource ID lookup completed');
      console.log(`   Result type: ${typeof resourceResult}`);
      if (resourceResult && typeof resourceResult === 'object' && 'companies' in resourceResult) {
        const companies = (resourceResult as { companies: { name: string; id?: number }[] }).companies;
        if (Array.isArray(companies) && companies.length > 0) {
          console.log(`   Company found: ${companies[0].name}`);
          console.log(`   ID matches: ${companies[0].id === 1}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ Resource ID lookup error: ${error}`);
    }

    // Generate comprehensive summary
    const summary = tester.generateSummary();
    console.log(`\n📊 Hierarchical Search Tool Real Integration Test Complete - ${summary.successRate.toFixed(1)}% success rate`);
    console.log(`📄 Detailed logs: ${summary.logFile}`);

    return summary;

  } catch (error) {
    console.error('❌ Hierarchical Search Tool real integration test failed:', error);
    throw error;
  }
}

// Always run the test when this file is executed directly
testHierarchicalSearchToolReal()
  .then(summary => {
    console.log(`\n🎉 Hierarchical Search Tool real integration testing completed with ${summary.successful}/${summary.totalTests} tests passed`);
    process.exit(summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('💥 Hierarchical Search Tool real integration test suite failed:', error);
    process.exit(1);
  });

export { testHierarchicalSearchToolReal };