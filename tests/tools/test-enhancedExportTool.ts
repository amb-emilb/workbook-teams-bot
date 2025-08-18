/**
 * Real Integration Test Suite for Enhanced Export Tool (enhancedExportTool.ts)
 * Tests against actual Workbook API in dev environment
 */
import dotenv from 'dotenv';
import { RealToolTester, createTestWorkbookClient } from '../utils/testHelpers.js';
import { createEnhancedExportTool } from '../../src/agent/tools/enhancedExportTool.js';
import { RuntimeContext } from '@mastra/core/runtime-context';

dotenv.config();

async function testEnhancedExportToolReal() {
  // Initialize real WorkbookClient
  const workbookClient = await createTestWorkbookClient();
  const tester = new RealToolTester('enhancedExportTool', workbookClient);

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
        name: 'Export All as CSV',
        description: 'Export all resources in CSV format',
        input: { 
          format: 'csv' as const, 
          exportType: 'all' as const,
          limit: 10,
          saveToFile: false
        },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Export as JSON',
        description: 'Export resources in JSON format',
        input: { 
          format: 'json' as const, 
          exportType: 'all' as const,
          limit: 5,
          saveToFile: false
        },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Generate Statistics Report',
        description: 'Generate statistics summary',
        input: { 
          format: 'statistics' as const, 
          exportType: 'all' as const,
          includeStatistics: true,
          saveToFile: false
        },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Filtered Export by Type',
        description: 'Export filtered by resource types',
        input: { 
          format: 'csv' as const, 
          exportType: 'filtered' as const,
          resourceTypes: [2, 10], // Employees and Contacts
          limit: 10,
          saveToFile: false
        },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Export Active Resources Only',
        description: 'Export only active resources',
        input: { 
          format: 'json' as const, 
          exportType: 'filtered' as const,
          active: true,
          limit: 8,
          saveToFile: false
        },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Custom Field Selection',
        description: 'Export with specific fields only',
        input: { 
          format: 'csv' as const, 
          exportType: 'custom' as const,
          fields: ['Id', 'Name', 'Email', 'Active'],
          limit: 5,
          saveToFile: false
        },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Formatted Report Export',
        description: 'Generate formatted text report',
        input: { 
          format: 'report' as const, 
          exportType: 'all' as const,
          limit: 5,
          includeStatistics: true,
          saveToFile: false
        },
        expectedSuccess: true,
        maxDuration: 10000
      }
    ];

    // Execute real API tests
    await tester.testTool(createEnhancedExportTool, realScenarios);

    // Test input validation with real schemas
    await tester.testInputValidation(createEnhancedExportTool, [
      {
        name: 'Valid CSV Export',
        input: { 
          format: 'csv' as const, 
          exportType: 'all' as const,
          saveToFile: false
        },
        shouldPass: true
      },
      {
        name: 'Valid JSON Export',
        input: { 
          format: 'json' as const, 
          exportType: 'filtered' as const,
          active: true
        },
        shouldPass: true
      },
      {
        name: 'Valid Report Export',
        input: { 
          format: 'report' as const, 
          exportType: 'all' as const
        },
        shouldPass: true
      },
      {
        name: 'Valid Statistics Export',
        input: { 
          format: 'statistics' as const, 
          exportType: 'all' as const
        },
        shouldPass: true
      },
      {
        name: 'Custom Fields Export',
        input: { 
          format: 'csv' as const, 
          exportType: 'custom' as const,
          fields: ['Id', 'Name']
        },
        shouldPass: true
      },
      {
        name: 'Invalid Format Type',
        input: { 
          format: 'xml' as 'xml', 
          exportType: 'all' as const
        },
        shouldPass: false
      },
      {
        name: 'Invalid Export Type',
        input: { 
          format: 'csv' as const, 
          exportType: 'partial' as 'partial'
        },
        shouldPass: false
      },
      {
        name: 'Negative Limit',
        input: { 
          format: 'csv' as const, 
          exportType: 'all' as const,
          limit: -5
        },
        shouldPass: false
      },
      {
        name: 'Invalid Resource Types',
        input: { 
          format: 'csv' as const, 
          exportType: 'filtered' as const,
          resourceTypes: ['employee', 'contact'] as string[]
        },
        shouldPass: false
      }
    ]);

    // Test real API error scenarios
    await tester.testRealErrorScenarios(createEnhancedExportTool, [
      {
        name: 'Very Large Export Request',
        input: { 
          format: 'json' as const, 
          exportType: 'all' as const,
          limit: 10000
        },
        description: 'Test with very large limit'
      },
      {
        name: 'Non-Existent Company Filter',
        input: { 
          format: 'csv' as const, 
          exportType: 'filtered' as const,
          companyIds: [999999, 999998]
        },
        description: 'Test with non-existent company IDs'
      },
      {
        name: 'Empty Field Selection',
        input: { 
          format: 'csv' as const, 
          exportType: 'custom' as const,
          fields: []
        },
        description: 'Test with empty field selection'
      }
    ]);

    // Test real API performance
    await tester.testRealPerformance(createEnhancedExportTool, [
      {
        name: 'Small CSV Export',
        input: { 
          format: 'csv' as const, 
          exportType: 'all' as const,
          limit: 5,
          saveToFile: false
        },
        expectedMaxDuration: 5000,
        description: 'Small export should be fast'
      },
      {
        name: 'Medium JSON Export',
        input: { 
          format: 'json' as const, 
          exportType: 'all' as const,
          limit: 25,
          saveToFile: false
        },
        expectedMaxDuration: 10000,
        description: 'Medium export performance'
      },
      {
        name: 'Statistics Generation',
        input: { 
          format: 'statistics' as const, 
          exportType: 'all' as const,
          includeStatistics: true,
          saveToFile: false
        },
        expectedMaxDuration: 8000,
        description: 'Statistics should be computed quickly'
      }
    ]);

    // Tool-specific real API tests
    console.log('\n🔧 ENHANCED EXPORT TOOL REAL API SPECIFIC TESTS');
    console.log('─'.repeat(50));

    // Test different export formats with real data
    const tool = createEnhancedExportTool(workbookClient);

    // Test CSV export
    console.log('📊 Testing CSV export format...');
    try {
      const csvResult = await tool.execute({
        context: { 
          format: 'csv' as const, 
          exportType: 'all' as const,
          limit: 3,
          saveToFile: false,
          includeInactive: false,
          includeContactCounts: false
        },
        runtimeContext: new RuntimeContext(),
        runId: `csv-test-${Date.now()}`,
        threadId: `csv-thread-${Date.now()}`,
        resourceId: `csv-resource-${Date.now()}`
      });
      console.log('✅ CSV export completed');
      console.log(`   Result type: ${typeof csvResult}`);
      if (csvResult && typeof csvResult === 'object' && 'success' in csvResult) {
        const success = (csvResult as { success: boolean }).success;
        console.log(`   Export success: ${success}`);
      }
    } catch (error) {
      console.log(`⚠️ CSV export error: ${error}`);
    }

    // Test JSON export
    console.log('\n📋 Testing JSON export format...');
    try {
      const jsonResult = await tool.execute({
        context: { 
          format: 'json' as const, 
          exportType: 'all' as const,
          limit: 3,
          saveToFile: false,
          includeInactive: false,
          includeContactCounts: false
        },
        runtimeContext: new RuntimeContext(),
        runId: `json-test-${Date.now()}`,
        threadId: `json-thread-${Date.now()}`,
        resourceId: `json-resource-${Date.now()}`
      });
      console.log('✅ JSON export completed');
      console.log(`   Result type: ${typeof jsonResult}`);
      if (jsonResult && typeof jsonResult === 'object' && 'recordCount' in jsonResult) {
        console.log(`   Records exported: ${(jsonResult as { recordCount: number }).recordCount}`);
      }
    } catch (error) {
      console.log(`⚠️ JSON export error: ${error}`);
    }

    // Test statistics generation
    console.log('\n📈 Testing statistics generation...');
    try {
      const statsResult = await tool.execute({
        context: { 
          format: 'statistics' as const, 
          exportType: 'all' as const,
          saveToFile: false,
          includeInactive: false,
          includeContactCounts: false
        },
        runtimeContext: new RuntimeContext(),
        runId: `stats-test-${Date.now()}`,
        threadId: `stats-thread-${Date.now()}`,
        resourceId: `stats-resource-${Date.now()}`
      });
      console.log('✅ Statistics generation completed');
      console.log(`   Result type: ${typeof statsResult}`);
      if (statsResult && typeof statsResult === 'object' && 'success' in statsResult) {
        const success = (statsResult as { success: boolean }).success;
        console.log(`   Statistics generated: ${success ? 'Yes' : 'No'}`);
      }
    } catch (error) {
      console.log(`⚠️ Statistics generation error: ${error}`);
    }

    // Test filtered export
    console.log('\n🔍 Testing filtered export...');
    try {
      const filteredResult = await tool.execute({
        context: { 
          format: 'csv' as const, 
          exportType: 'filtered' as const,
          active: true,
          limit: 5,
          saveToFile: false,
          includeInactive: false,
          includeContactCounts: false
        },
        runtimeContext: new RuntimeContext(),
        runId: `filtered-test-${Date.now()}`,
        threadId: `filtered-thread-${Date.now()}`,
        resourceId: `filtered-resource-${Date.now()}`
      });
      console.log('✅ Filtered export completed');
      console.log(`   Result type: ${typeof filteredResult}`);
      if (filteredResult && typeof filteredResult === 'object' && 'recordCount' in filteredResult) {
        console.log(`   Active records: ${(filteredResult as { recordCount: number }).recordCount}`);
      }
    } catch (error) {
      console.log(`⚠️ Filtered export error: ${error}`);
    }

    // Generate comprehensive summary
    const summary = tester.generateSummary();
    console.log(`\n📊 Enhanced Export Tool Real Integration Test Complete - ${summary.successRate.toFixed(1)}% success rate`);
    console.log(`📄 Detailed logs: ${summary.logFile}`);

    return summary;

  } catch (error) {
    console.error('❌ Enhanced Export Tool real integration test failed:', error);
    throw error;
  }
}

// Run if called directly
// Always run the test when this file is executed directly
testEnhancedExportToolReal()
  .then(summary => {
    console.log(`\n🎉 Enhanced Export Tool real integration testing completed with ${summary.successful}/${summary.totalTests} tests passed`);
    process.exit(summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('💥 Enhanced Export Tool real integration test suite failed:', error);
    process.exit(1);
  });

export { testEnhancedExportToolReal };