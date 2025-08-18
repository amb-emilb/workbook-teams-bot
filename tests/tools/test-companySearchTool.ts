/**
 * Real Integration Test Suite for Company Search Tool (companySearchTool.ts)
 * Tests against actual Workbook API in dev environment
 */
import dotenv from 'dotenv';
import { RealToolTester, createTestWorkbookClient } from '../utils/testHelpers.js';
import { createCompanySearchTool } from '../../src/agent/tools/companySearchTool.js';
import { RuntimeContext } from '@mastra/core/runtime-context';

dotenv.config();

async function testCompanySearchToolReal() {
  // Initialize real WorkbookClient
  const workbookClient = await createTestWorkbookClient();
  const tester = new RealToolTester('companySearchTool', workbookClient);

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
        name: 'Search for Company by Name',
        description: 'Search for a company by partial name',
        input: { companyName: 'tech', includeHierarchy: true, multiple: true },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Search for Specific Company',
        description: 'Search for a specific company by exact name',
        input: { companyName: 'Microsoft', includeHierarchy: true, multiple: false },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Search with Short Name',
        description: 'Search with very short company name',
        input: { companyName: 'A', includeHierarchy: false, multiple: true },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Search Without Hierarchy',
        description: 'Search for companies without hierarchy details',
        input: { companyName: 'corp', includeHierarchy: false, multiple: true },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Single Company with Hierarchy',
        description: 'Get single company with full hierarchy',
        input: { companyName: 'Google', includeHierarchy: true, multiple: false },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Case Insensitive Search',
        description: 'Test case-insensitive company search',
        input: { companyName: 'AMAZON', includeHierarchy: false, multiple: false },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Partial Match Search',
        description: 'Search with partial company name',
        input: { companyName: 'soft', includeHierarchy: true, multiple: true },
        expectedSuccess: true,
        maxDuration: 10000
      }
    ];

    // Execute real API tests
    await tester.testTool(createCompanySearchTool, realScenarios);

    // Test input validation with real schemas
    await tester.testInputValidation(createCompanySearchTool, [
      {
        name: 'Valid Company Name',
        input: { companyName: 'Test Company', includeHierarchy: true, multiple: false },
        shouldPass: true
      },
      {
        name: 'Company Name Only',
        input: { companyName: 'Acme Corp' },
        shouldPass: true
      },
      {
        name: 'All Parameters Specified',
        input: { companyName: 'Tech Inc', includeHierarchy: false, multiple: true },
        shouldPass: true
      },
      {
        name: 'Empty Company Name (Invalid)',
        input: { companyName: '', includeHierarchy: true },
        shouldPass: false
      },
      {
        name: 'Missing Company Name (Invalid)',
        input: { includeHierarchy: true, multiple: false },
        shouldPass: false
      },
      {
        name: 'Wrong Company Name Type (Invalid)',
        input: { companyName: 12345, includeHierarchy: true },
        shouldPass: false
      },
      {
        name: 'Wrong Hierarchy Type (Invalid)',
        input: { companyName: 'Test', includeHierarchy: 'yes' },
        shouldPass: false
      },
      {
        name: 'Wrong Multiple Type (Invalid)',
        input: { companyName: 'Test', multiple: 'true' },
        shouldPass: false
      }
    ]);

    // Test real API error scenarios
    await tester.testRealErrorScenarios(createCompanySearchTool, [
      {
        name: 'Very Long Company Name',
        input: { companyName: 'a'.repeat(500), includeHierarchy: false },
        description: 'Test with extremely long company name'
      },
      {
        name: 'Special Characters in Name',
        input: { companyName: '@#$%^&*()', includeHierarchy: false },
        description: 'Test with special characters that might cause issues'
      },
      {
        name: 'Unicode Company Name',
        input: { companyName: '北京公司', includeHierarchy: false },
        description: 'Test with unicode characters'
      },
      {
        name: 'SQL Injection Attempt',
        input: { companyName: '\'; DROP TABLE companies; --', includeHierarchy: false },
        description: 'Test SQL injection prevention'
      }
    ]);

    // Test real API performance
    await tester.testRealPerformance(createCompanySearchTool, [
      {
        name: 'Quick Company Search',
        input: { companyName: 'Apple', includeHierarchy: false, multiple: false },
        expectedMaxDuration: 5000,
        description: 'Single company without hierarchy should be fast'
      },
      {
        name: 'Multiple Companies Performance',
        input: { companyName: 'Inc', includeHierarchy: false, multiple: true },
        expectedMaxDuration: 10000,
        description: 'Multiple companies without hierarchy'
      },
      {
        name: 'Full Hierarchy Performance',
        input: { companyName: 'Corp', includeHierarchy: true, multiple: true },
        expectedMaxDuration: 15000,
        description: 'Multiple companies with full hierarchy'
      }
    ]);

    // Tool-specific real API tests
    console.log('\n🔧 COMPANY SEARCH TOOL REAL API SPECIFIC TESTS');
    console.log('─'.repeat(50));

    // Test different search patterns with real data
    const tool = createCompanySearchTool(workbookClient);

    // Test partial matching with real API
    console.log('🏢 Testing partial company name matching...');
    try {
      const partialResult = await tool.execute({
        context: { companyName: 'Tech', includeHierarchy: false, multiple: true },
        runtimeContext: new RuntimeContext(),
        runId: `partial-test-${Date.now()}`,
        threadId: `partial-thread-${Date.now()}`,
        resourceId: `partial-resource-${Date.now()}`
      });
      console.log('✅ Partial matching completed');
      console.log(`   Result type: ${typeof partialResult}`);
      console.log(`   Preview: ${JSON.stringify(partialResult).substring(0, 150)}...`);
    } catch (error) {
      console.log(`⚠️ Partial matching error: ${error}`);
    }

    // Test hierarchy inclusion with real API
    console.log('\n👥 Testing company hierarchy inclusion...');
    try {
      const hierarchyResult = await tool.execute({
        context: { companyName: 'Software', includeHierarchy: true, multiple: false },
        runtimeContext: new RuntimeContext(),
        runId: `hierarchy-test-${Date.now()}`,
        threadId: `hierarchy-thread-${Date.now()}`,
        resourceId: `hierarchy-resource-${Date.now()}`
      });
      console.log('✅ Hierarchy inclusion completed');
      console.log(`   Result type: ${typeof hierarchyResult}`);
      if (hierarchyResult && typeof hierarchyResult === 'object' && 'companies' in hierarchyResult) {
        const companies = (hierarchyResult as { companies: { hierarchy?: { contactCount?: number } }[] }).companies;
        if (Array.isArray(companies) && companies.length > 0 && companies[0].hierarchy) {
          console.log(`   Contact count: ${companies[0].hierarchy.contactCount || 0}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ Hierarchy inclusion error: ${error}`);
    }

    // Test case-insensitive search with real API
    console.log('\n🔤 Testing case-insensitive search...');
    try {
      const caseResult = await tool.execute({
        context: { companyName: 'MICROSOFT', includeHierarchy: false, multiple: false },
        runtimeContext: new RuntimeContext(),
        runId: `case-test-${Date.now()}`,
        threadId: `case-thread-${Date.now()}`,
        resourceId: `case-resource-${Date.now()}`
      });
      console.log('✅ Case-insensitive search completed');
      console.log(`   Result type: ${typeof caseResult}`);
    } catch (error) {
      console.log(`⚠️ Case-insensitive search error: ${error}`);
    }

    // Test multiple companies retrieval with real API
    console.log('\n📊 Testing multiple companies retrieval...');
    try {
      const multipleResult = await tool.execute({
        context: { companyName: 'Co', includeHierarchy: false, multiple: true },
        runtimeContext: new RuntimeContext(),
        runId: `multiple-test-${Date.now()}`,
        threadId: `multiple-thread-${Date.now()}`,
        resourceId: `multiple-resource-${Date.now()}`
      });
      console.log('✅ Multiple companies retrieval completed');
      console.log(`   Result type: ${typeof multipleResult}`);
      if (multipleResult && typeof multipleResult === 'object' && 'totalFound' in multipleResult) {
        console.log(`   Companies found: ${(multipleResult as { totalFound: number }).totalFound}`);
      }
    } catch (error) {
      console.log(`⚠️ Multiple companies retrieval error: ${error}`);
    }

    // Generate comprehensive summary
    const summary = tester.generateSummary();
    console.log(`\n📊 Company Search Tool Real Integration Test Complete - ${summary.successRate.toFixed(1)}% success rate`);
    console.log(`📄 Detailed logs: ${summary.logFile}`);

    return summary;

  } catch (error) {
    console.error('❌ Company Search Tool real integration test failed:', error);
    throw error;
  }
}

// Run if called directly
// Always run the test when this file is executed directly
testCompanySearchToolReal()
  .then(summary => {
    console.log(`\n🎉 Company Search Tool real integration testing completed with ${summary.successful}/${summary.totalTests} tests passed`);
    process.exit(summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('💥 Company Search Tool real integration test suite failed:', error);
    process.exit(1);
  });

export { testCompanySearchToolReal };