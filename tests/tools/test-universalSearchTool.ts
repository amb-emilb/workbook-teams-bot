/**
 * Real Integration Test Suite for Universal Search Tool (universalSearchTool.ts)  
 * Tests against actual Workbook API in dev environment
 */
import dotenv from 'dotenv';
import { RealToolTester, createTestWorkbookClient } from '../utils/testHelpers.js';
import { createUniversalSearchTool } from '../../src/agent/tools/universalSearchTool.js';
import { RuntimeContext } from '@mastra/core/runtime-context';

dotenv.config();

async function testUniversalSearchToolReal() {
  // Initialize real WorkbookClient
  const workbookClient = await createTestWorkbookClient();
  const tester = new RealToolTester('universalSearchTool', workbookClient);

  try {
    console.log('🔄 Initializing real WorkbookClient for universal search testing...');
    
    // Test basic API connectivity first
    console.log('🔌 Testing API connectivity...');
    const statsResponse = await workbookClient.resources.getStats();
    if (!statsResponse.success) {
      throw new Error(`API connectivity test failed: ${statsResponse.error}`);
    }
    console.log('✅ API connectivity confirmed');

    // Real integration test scenarios for universal search
    const realScenarios = [
      {
        name: 'Auto-Detect Query Type (General)',
        description: 'Let universal search auto-detect query type for general term',
        input: { query: 'microsoft', searchType: 'auto', maxResults: 10 },
        expectedSuccess: true,
        maxDuration: 12000
      },
      {
        name: 'Specific Company Search',
        description: 'Search specifically for companies',
        input: { query: 'tech', searchType: 'company', maxResults: 15 },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Specific People Search',
        description: 'Search specifically for people',
        input: { query: 'john', searchType: 'person', maxResults: 12 },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Contact Search',
        description: 'Search for contacts specifically',
        input: { query: 'manager', searchType: 'person', maxResults: 8 },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Email Pattern Auto-Detection',
        description: 'Auto-detect email pattern search',
        input: { query: '@company.com', searchType: 'auto', maxResults: 8 },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Include Inactive Resources',
        description: 'Search including inactive resources',
        input: { query: 'test', searchType: 'auto', maxResults: 10, includeInactive: true },
        expectedSuccess: true,
        maxDuration: 12000
      },
      {
        name: 'Exclude Inactive Resources',
        description: 'Search excluding inactive resources (default)',
        input: { query: 'test', searchType: 'auto', maxResults: 10, includeInactive: false },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Auto-Detect with No Query',
        description: 'Auto-detect with empty query (should get all)',
        input: { searchType: 'auto', maxResults: 15 },
        expectedSuccess: true,
        maxDuration: 12000
      },
      {
        name: 'Single Character Auto-Detect',
        description: 'Auto-detect with single character',
        input: { query: 'A', searchType: 'auto', maxResults: 20 },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Complex Search Term',
        description: 'Auto-detect with complex search term',
        input: { query: 'sales manager', searchType: 'auto', maxResults: 10 },
        expectedSuccess: true,
        maxDuration: 12000
      }
    ];

    // Execute real API tests
    await tester.testTool(createUniversalSearchTool, realScenarios);

    // Test input validation with real schemas
    await tester.testInputValidation(createUniversalSearchTool, [
      {
        name: 'Valid Complete Input',
        input: { query: 'search term', searchType: 'auto', maxResults: 10, includeInactive: false },
        shouldPass: true
      },
      {
        name: 'Minimal Valid Input (Query Only)',
        input: { query: 'test' },
        shouldPass: true
      },
      {
        name: 'Companies Search Type',
        input: { query: 'test', searchType: 'company' },
        shouldPass: true
      },
      {
        name: 'People Search Type',
        input: { query: 'test', searchType: 'person' },
        shouldPass: true
      },
      {
        name: 'Contacts Search Type',
        input: { query: 'test', searchType: 'person' },
        shouldPass: true
      },
      {
        name: 'Auto Search Type',
        input: { query: 'test', searchType: 'auto' },
        shouldPass: true
      },
      {
        name: 'Include Inactive True',
        input: { query: 'test', includeInactive: true },
        shouldPass: true
      },
      {
        name: 'Include Inactive False',
        input: { query: 'test', includeInactive: false },
        shouldPass: true
      },
      {
        name: 'Invalid Search Type',
        input: { query: 'test', searchType: 'invalid' },
        shouldPass: false
      },
      {
        name: 'Negative Limit',
        input: { query: 'test', maxResults: -1 },
        shouldPass: false
      },
      {
        name: 'Excessive Limit',
        input: { query: 'test', maxResults: 101 },
        shouldPass: false
      },
      {
        name: 'Invalid Limit Type',
        input: { query: 'test', maxResults: 'ten' },
        shouldPass: false
      },
      {
        name: 'Invalid Include Inactive Type',
        input: { query: 'test', includeInactive: 'yes' },
        shouldPass: false
      }
    ]);

    // Test real API error scenarios
    await tester.testRealErrorScenarios(createUniversalSearchTool, [
      {
        name: 'Extremely Long Query',
        input: { query: 'very'.repeat(200), searchType: 'auto', maxResults: 5 },
        description: 'Test with extremely long query string'
      },
      {
        name: 'Special Characters in Query',
        input: { query: '<script>alert("test")</script>', searchType: 'auto', maxResults: 5 },
        description: 'Test with potentially dangerous characters'
      },
      {
        name: 'SQL-like Pattern',
        input: { query: '\'; DROP TABLE users; --', searchType: 'auto', maxResults: 5 },
        description: 'Test with SQL injection patterns'
      },
      {
        name: 'Unicode and Emoji',
        input: { query: '🏢💼👥', searchType: 'auto', maxResults: 5 },
        description: 'Test with unicode and emoji characters'
      }
    ]);

    // Test real API performance
    await tester.testRealPerformance(createUniversalSearchTool, [
      {
        name: 'Quick Auto Search Performance',
        input: { query: 'test', searchType: 'auto', maxResults: 5 },
        expectedMaxDuration: 6000,
        description: 'Quick auto-detect search should be fast'
      },
      {
        name: 'Company Search Performance',
        input: { query: 'company', searchType: 'company', maxResults: 20 },
        expectedMaxDuration: 10000,
        description: 'Company-specific search performance'
      },
      {
        name: 'People Search Performance',
        input: { query: 'manager', searchType: 'person', maxResults: 25 },
        expectedMaxDuration: 12000,
        description: 'People-specific search performance'
      },
      {
        name: 'Large Result Set Performance',
        input: { searchType: 'auto', maxResults: 50 },
        expectedMaxDuration: 18000,
        description: 'Large result set performance'
      }
    ]);

    // Tool-specific real API tests
    console.log('\n🔧 UNIVERSAL SEARCH TOOL REAL API SPECIFIC TESTS');
    console.log('─'.repeat(50));

    const tool = createUniversalSearchTool(workbookClient);

    // Test query type auto-detection with real API
    console.log('🧠 Testing query type auto-detection with real API...');
    
    const autoDetectionTests = [
      { query: '@company.com', expectedType: 'email domain', searchType: 'auto' },
      { query: 'Microsoft Corp', expectedType: 'company', searchType: 'auto' },
      { query: 'John Smith', expectedType: 'person', searchType: 'auto' },
      { query: 'sales', expectedType: 'general', searchType: 'auto' },
      { query: '', expectedType: 'all records', searchType: 'auto' }
    ];

    for (const test of autoDetectionTests) {
      try {
        console.log(`  Testing: "${test.query}" (expected: ${test.expectedType})`);
        const result = await tool.execute({
          context: { 
            query: test.query, 
            searchType: test.searchType as 'auto' | 'company' | 'person' | 'email' | 'hierarchy',
            maxResults: 3,
            includeInactive: false
          },
          runtimeContext: new RuntimeContext(),
          runId: `test-${Date.now()}`,
          threadId: `thread-${Date.now()}`,
          resourceId: `resource-${Date.now()}`
        });
        console.log(`  ✅ Auto-detection completed for "${test.query}"`);
        console.log(`     Result: ${JSON.stringify(result).substring(0, 100)}...`);
      } catch (error) {
        console.log(`  ⚠️ Auto-detection failed for "${test.query}": ${error}`);
      }
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Test search type routing with real API
    console.log('\n🎯 Testing search type routing with real API...');
    
    const routingTests = [
      { searchType: 'company', query: 'tech company' },
      { searchType: 'person', query: 'john' },
      { searchType: 'person', query: 'manager' },
      { searchType: 'auto', query: 'search term' }
    ];

    for (const test of routingTests) {
      try {
        console.log(`  Testing ${test.searchType} search for: "${test.query}"`);
        const result = await tool.execute({
          context: { 
            query: test.query, 
            searchType: test.searchType as 'auto' | 'company' | 'person' | 'email' | 'hierarchy', 
            maxResults: 3,
            includeInactive: false
          },
          runtimeContext: new RuntimeContext(),
          runId: `test-${Date.now()}`,
          threadId: `thread-${Date.now()}`,
          resourceId: `resource-${Date.now()}`
        });
        console.log(`  ✅ ${test.searchType} search completed`);
        console.log(`     Response type: ${typeof result}`);
      } catch (error) {
        console.log(`  ⚠️ ${test.searchType} search failed: ${error}`);
      }
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Test inactive resource inclusion with real API
    console.log('\n👻 Testing inactive resource inclusion with real API...');
    
    const inactiveTests = [
      { includeInactive: false, description: 'active only' },
      { includeInactive: true, description: 'include inactive' }
    ];

    for (const test of inactiveTests) {
      try {
        console.log(`  Testing ${test.description}...`);
        await tool.execute({
          context: { 
            query: 'test', 
            searchType: 'auto', 
            includeInactive: test.includeInactive, 
            maxResults: 5 
          },
          runtimeContext: new RuntimeContext(),
          runId: `test-${Date.now()}`,
          threadId: `thread-${Date.now()}`,
          resourceId: `resource-${Date.now()}`
        });
        console.log(`  ✅ Search ${test.description} completed`);
      } catch (error) {
        console.log(`  ⚠️ Search ${test.description} failed: ${error}`);
      }
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Test edge cases with real API
    console.log('\n🔍 Testing edge cases with real API...');
    
    const edgeCaseTests = [
      { name: 'Maximum Limit', input: { query: 'a', searchType: 'auto', maxResults: 50, includeInactive: false } },
      { name: 'Minimum Limit', input: { query: 'test', searchType: 'auto', maxResults: 1, includeInactive: false } },
      { name: 'No Query with Auto', input: { query: '', searchType: 'auto', maxResults: 5, includeInactive: false } },
      { name: 'Single Character', input: { query: 'A', searchType: 'auto', maxResults: 10, includeInactive: false } }
    ];

    for (const test of edgeCaseTests) {
      try {
        console.log(`  Testing ${test.name}...`);
        await tool.execute({
          context: {
            ...test.input,
            searchType: test.input.searchType as 'auto' | 'company' | 'person' | 'email' | 'hierarchy'
          },
          runtimeContext: new RuntimeContext(),
          runId: `test-${Date.now()}`,
          threadId: `thread-${Date.now()}`,
          resourceId: `resource-${Date.now()}`
        });
        console.log(`  ✅ ${test.name} completed successfully`);
      } catch (error) {
        console.log(`  ⚠️ ${test.name} failed: ${error}`);
      }
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Generate comprehensive summary
    const summary = tester.generateSummary();
    console.log(`\n📊 Universal Search Tool Real Integration Test Complete - ${summary.successRate.toFixed(1)}% success rate`);
    console.log(`📄 Detailed logs: ${summary.logFile}`);

    return summary;

  } catch (error) {
    console.error('❌ Universal Search Tool real integration test failed:', error);
    throw error;
  }
}

// Always run the test when this file is executed directly
testUniversalSearchToolReal()
  .then(summary => {
    console.log(`\n🎉 Universal Search Tool real integration testing completed with ${summary.successful}/${summary.totalTests} tests passed`);
    process.exit(summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('💥 Universal Search Tool real integration test suite failed:', error);
    process.exit(1);
  });

export { testUniversalSearchToolReal };