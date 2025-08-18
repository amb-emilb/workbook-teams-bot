/**
 * Real Integration Test Suite for Search Tool (searchTool.ts)
 * Tests against actual Workbook API in dev environment
 */
import dotenv from 'dotenv';
import { RealToolTester, createTestWorkbookClient } from '../utils/testHelpers.js';
import { createSearchContactsTool } from '../../src/agent/tools/searchTool.js';
import { RuntimeContext } from '@mastra/core/runtime-context';

dotenv.config();

async function testSearchToolReal() {
  // Initialize real WorkbookClient
  const workbookClient = await createTestWorkbookClient();
  const tester = new RealToolTester('searchTool', workbookClient);

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
        name: 'Search for People with Common Name',
        description: 'Search for people with a common name pattern',
        input: { query: 'john', limit: 5 },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Search by Email Domain',
        description: 'Search for people by email domain pattern',
        input: { query: '@', limit: 10 }, // Should find people with email addresses
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Search by Company Pattern',
        description: 'Search for company-related terms',
        input: { query: 'company', limit: 8 },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Get All People (Limited)',
        description: 'Get all people with small limit',
        input: { limit: 15 },
        expectedSuccess: true,
        maxDuration: 12000
      },
      {
        name: 'Single Character Search',
        description: 'Search with single character (should return many matches)',
        input: { query: 'A', limit: 20 },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Specific Search Term',
        description: 'Search for specific term that might have fewer matches',
        input: { query: 'manager', limit: 10 },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Empty Query Test',
        description: 'Empty query should return all people with limit',
        input: { query: '', limit: 12 },
        expectedSuccess: true,
        maxDuration: 10000
      }
    ];

    // Execute real API tests
    await tester.testTool(createSearchContactsTool, realScenarios);

    // Test input validation with real schemas
    await tester.testInputValidation(createSearchContactsTool, [
      {
        name: 'Valid Search Query',
        input: { query: 'test search', limit: 10 },
        shouldPass: true
      },
      {
        name: 'Query Only (No Limit)',
        input: { query: 'jane doe' },
        shouldPass: true
      },
      {
        name: 'Limit Only (No Query)',
        input: { limit: 15 },
        shouldPass: true
      },
      {
        name: 'Empty Object',
        input: {},
        shouldPass: true
      },
      {
        name: 'Negative Limit (Invalid)',
        input: { query: 'test', limit: -5 },
        shouldPass: false
      },
      {
        name: 'Limit Too Large (Invalid)',
        input: { query: 'test', limit: 100 },
        shouldPass: false
      },
      {
        name: 'Wrong Query Type (Invalid)',
        input: { query: 12345 },
        shouldPass: false
      },
      {
        name: 'Wrong Limit Type (Invalid)',
        input: { query: 'test', limit: 'ten' },
        shouldPass: false
      }
    ]);

    // Test real API error scenarios
    await tester.testRealErrorScenarios(createSearchContactsTool, [
      {
        name: 'Very Long Query String',
        input: { query: 'a'.repeat(1000), limit: 5 },
        description: 'Test with extremely long query string'
      },
      {
        name: 'Special Characters in Query',
        input: { query: '!@#$%^&*()', limit: 5 },
        description: 'Test with special characters that might cause issues'
      },
      {
        name: 'Unicode Characters',
        input: { query: 'åæøüñ', limit: 5 },
        description: 'Test with unicode characters'
      }
    ]);

    // Test real API performance
    await tester.testRealPerformance(createSearchContactsTool, [
      {
        name: 'Quick Search Performance',
        input: { query: 'test', limit: 5 },
        expectedMaxDuration: 5000,
        description: 'Small search should be fast'
      },
      {
        name: 'Medium Search Performance',
        input: { query: 'a', limit: 25 },
        expectedMaxDuration: 10000,
        description: 'Medium result set performance'
      },
      {
        name: 'Large Limit Performance',
        input: { limit: 50 },
        expectedMaxDuration: 15000,
        description: 'Large result set with maximum allowed limit'
      }
    ]);

    // Tool-specific real API tests
    console.log('\n🔧 SEARCH TOOL REAL API SPECIFIC TESTS');
    console.log('─'.repeat(50));

    // Test different search patterns with real data
    const tool = createSearchContactsTool(workbookClient);

    // Test email domain detection with real API
    console.log('📧 Testing email domain detection with real API...');
    try {
      const emailResult = await tool.execute({
        context: { query: '@company.com', limit: 5 },
        runtimeContext: new RuntimeContext(),
        runId: `email-test-${Date.now()}`,
        threadId: `email-thread-${Date.now()}`,
        resourceId: `email-resource-${Date.now()}`
      });
      console.log('✅ Email domain search completed');
      console.log(`   Result type: ${typeof emailResult}`);
      console.log(`   Preview: ${JSON.stringify(emailResult).substring(0, 150)}...`);
    } catch (error) {
      console.log(`⚠️ Email domain search error: ${error}`);
    }

    // Test company name detection with real API
    console.log('\n🏢 Testing company name detection with real API...');
    try {
      const companyResult = await tool.execute({
        context: { query: 'Microsoft Inc', limit: 5 },
        runtimeContext: new RuntimeContext(),
        runId: `test-${Date.now()}`,
        threadId: `thread-${Date.now()}`,
        resourceId: `resource-${Date.now()}`
      });
      console.log('✅ Company name search completed');
      console.log(`   Result type: ${typeof companyResult}`);
    } catch (error) {
      console.log(`⚠️ Company name search error: ${error}`);
    }

    // Test name/initials search with real API
    console.log('\n👤 Testing name search with real API...');
    try {
      const nameResult = await tool.execute({
        context: { query: 'smith', limit: 8 },
        runtimeContext: new RuntimeContext(),
        runId: `test-${Date.now()}`,
        threadId: `thread-${Date.now()}`,
        resourceId: `resource-${Date.now()}`
      });
      console.log('✅ Name search completed');
      console.log(`   Result type: ${typeof nameResult}`);
    } catch (error) {
      console.log(`⚠️ Name search error: ${error}`);
    }

    // Test empty query behavior with real API
    console.log('\n🔍 Testing empty query with real API...');
    try {
      const emptyResult = await tool.execute({
        context: { limit: 10 },
        runtimeContext: new RuntimeContext(),
        runId: `test-${Date.now()}`,
        threadId: `thread-${Date.now()}`,
        resourceId: `resource-${Date.now()}`
      });
      console.log('✅ Empty query search completed');
      console.log(`   Result type: ${typeof emptyResult}`);
    } catch (error) {
      console.log(`⚠️ Empty query search error: ${error}`);
    }

    // Generate comprehensive summary
    const summary = tester.generateSummary();
    console.log(`\n📊 Search Tool Real Integration Test Complete - ${summary.successRate.toFixed(1)}% success rate`);
    console.log(`📄 Detailed logs: ${summary.logFile}`);

    return summary;

  } catch (error) {
    console.error('❌ Search Tool real integration test failed:', error);
    throw error;
  }
}

// Always run the test when this file is executed directly
testSearchToolReal()
  .then(summary => {
    console.log(`\n🎉 Search Tool real integration testing completed with ${summary.successful}/${summary.totalTests} tests passed`);
    process.exit(summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('💥 Search Tool real integration test suite failed:', error);
    process.exit(1);
  });

export { testSearchToolReal };