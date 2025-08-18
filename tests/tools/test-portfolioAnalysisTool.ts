/**
 * Real Integration Test Suite for Portfolio Analysis Tool (portfolioAnalysisTool.ts)
 * Tests against actual Workbook API in dev environment
 */
import dotenv from 'dotenv';
import { RealToolTester, createTestWorkbookClient } from '../utils/testHelpers.js';
import { createPortfolioAnalysisTool } from '../../src/agent/tools/portfolioAnalysisTool.js';
import { RuntimeContext } from '@mastra/core/runtime-context';

dotenv.config();

async function testPortfolioAnalysisToolReal() {
  // Initialize real WorkbookClient
  const workbookClient = await createTestWorkbookClient();
  const tester = new RealToolTester('portfolioAnalysisTool', workbookClient);

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
        name: 'Portfolio Summary Analysis',
        description: 'Get summary portfolio analysis for all employees',
        input: { 
          analysisMode: 'summary' as const,
          includeContactCounts: false,
          includeInactiveClients: false,
          topClientsLimit: 5
        },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Detailed Portfolio Analysis',
        description: 'Get detailed portfolio analysis with contact counts',
        input: { 
          analysisMode: 'detailed' as const,
          includeContactCounts: true,
          includeInactiveClients: false,
          topClientsLimit: 3
        },
        expectedSuccess: true,
        maxDuration: 15000
      },
      {
        name: 'Top Performers Analysis',
        description: 'Get top performing employees analysis',
        input: { 
          analysisMode: 'top-performers' as const,
          includeContactCounts: false,
          includeInactiveClients: false,
          topClientsLimit: 5
        },
        expectedSuccess: true,
        maxDuration: 12000
      },
      {
        name: 'Specific Employee by ID',
        description: 'Analyze specific employee by ID',
        input: { 
          employeeId: 1,
          analysisMode: 'detailed' as const,
          includeContactCounts: true,
          includeInactiveClients: false,
          topClientsLimit: 8
        },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Employee by Name Search',
        description: 'Find and analyze employee by name',
        input: { 
          employeeName: 'manager',
          analysisMode: 'summary' as const,
          includeContactCounts: false,
          includeInactiveClients: false,
          topClientsLimit: 5
        },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Include Inactive Clients',
        description: 'Analysis including inactive clients',
        input: { 
          analysisMode: 'detailed' as const,
          includeContactCounts: false,
          includeInactiveClients: true,
          topClientsLimit: 5
        },
        expectedSuccess: true,
        maxDuration: 12000
      },
      {
        name: 'Maximum Top Clients',
        description: 'Show maximum number of top clients',
        input: { 
          analysisMode: 'summary' as const,
          includeContactCounts: false,
          includeInactiveClients: false,
          topClientsLimit: 10
        },
        expectedSuccess: true,
        maxDuration: 12000
      }
    ];

    // Execute real API tests
    await tester.testTool(createPortfolioAnalysisTool, realScenarios);

    // Test input validation with real schemas
    await tester.testInputValidation(createPortfolioAnalysisTool, [
      {
        name: 'Valid Summary Analysis',
        input: { 
          analysisMode: 'summary' as const,
          includeContactCounts: false,
          includeInactiveClients: false,
          topClientsLimit: 5
        },
        shouldPass: true
      },
      {
        name: 'Valid Detailed Analysis',
        input: { 
          analysisMode: 'detailed' as const,
          includeContactCounts: true,
          includeInactiveClients: true,
          topClientsLimit: 3
        },
        shouldPass: true
      },
      {
        name: 'Valid Employee by ID',
        input: { 
          employeeId: 123,
          analysisMode: 'summary' as const,
          includeContactCounts: false,
          includeInactiveClients: false,
          topClientsLimit: 5
        },
        shouldPass: true
      },
      {
        name: 'Valid Employee by Name',
        input: { 
          employeeName: 'John Smith',
          analysisMode: 'detailed' as const,
          includeContactCounts: true,
          includeInactiveClients: false,
          topClientsLimit: 7
        },
        shouldPass: true
      },
      {
        name: 'Invalid Analysis Mode',
        input: { 
          analysisMode: 'overview' as 'overview',
          includeContactCounts: false,
          includeInactiveClients: false,
          topClientsLimit: 5
        },
        shouldPass: false
      },
      {
        name: 'Top Clients Limit Too Low',
        input: { 
          analysisMode: 'summary' as const,
          includeContactCounts: false,
          includeInactiveClients: false,
          topClientsLimit: 0
        },
        shouldPass: false
      },
      {
        name: 'Top Clients Limit Too High',
        input: { 
          analysisMode: 'summary' as const,
          includeContactCounts: false,
          includeInactiveClients: false,
          topClientsLimit: 15
        },
        shouldPass: false
      },
      {
        name: 'Invalid Employee ID Type',
        input: { 
          employeeId: 'one' as string,
          analysisMode: 'summary' as const,
          includeContactCounts: false,
          includeInactiveClients: false,
          topClientsLimit: 5
        },
        shouldPass: false
      }
    ]);

    // Test real API error scenarios
    await tester.testRealErrorScenarios(createPortfolioAnalysisTool, [
      {
        name: 'Non-Existent Employee ID',
        input: { 
          employeeId: 999999,
          analysisMode: 'summary' as const,
          includeContactCounts: false,
          includeInactiveClients: false,
          topClientsLimit: 5
        },
        description: 'Test with employee ID that likely does not exist'
      },
      {
        name: 'Non-Existent Employee Name',
        input: { 
          employeeName: 'NonExistentEmployee12345',
          analysisMode: 'summary' as const,
          includeContactCounts: false,
          includeInactiveClients: false,
          topClientsLimit: 5
        },
        description: 'Test with employee name that does not exist'
      },
      {
        name: 'Negative Employee ID',
        input: { 
          employeeId: -1,
          analysisMode: 'summary' as const,
          includeContactCounts: false,
          includeInactiveClients: false,
          topClientsLimit: 5
        },
        description: 'Test with negative employee ID'
      }
    ]);

    // Test real API performance
    await tester.testRealPerformance(createPortfolioAnalysisTool, [
      {
        name: 'Quick Summary',
        input: { 
          analysisMode: 'summary' as const,
          includeContactCounts: false,
          includeInactiveClients: false,
          topClientsLimit: 3
        },
        expectedMaxDuration: 8000,
        description: 'Summary without contact counts should be fast'
      },
      {
        name: 'Single Employee Analysis',
        input: { 
          employeeId: 1,
          analysisMode: 'detailed' as const,
          includeContactCounts: true,
          includeInactiveClients: false,
          topClientsLimit: 5
        },
        expectedMaxDuration: 10000,
        description: 'Single employee analysis performance'
      },
      {
        name: 'Top Performers Analysis',
        input: { 
          analysisMode: 'top-performers' as const,
          includeContactCounts: false,
          includeInactiveClients: false,
          topClientsLimit: 5
        },
        expectedMaxDuration: 15000,
        description: 'Top performers analysis performance'
      }
    ]);

    // Tool-specific real API tests
    console.log('\n🔧 PORTFOLIO ANALYSIS TOOL REAL API SPECIFIC TESTS');
    console.log('─'.repeat(50));

    // Test different analysis modes with real data
    const tool = createPortfolioAnalysisTool(workbookClient);

    // Test summary analysis
    console.log('📊 Testing summary analysis...');
    try {
      const summaryResult = await tool.execute({
        context: { 
          analysisMode: 'summary' as const,
          includeContactCounts: false,
          includeInactiveClients: false,
          topClientsLimit: 5
        },
        runtimeContext: new RuntimeContext(),
        runId: `summary-test-${Date.now()}`,
        threadId: `summary-thread-${Date.now()}`,
        resourceId: `summary-resource-${Date.now()}`
      });
      console.log('✅ Summary analysis completed');
      console.log(`   Result type: ${typeof summaryResult}`);
      if (summaryResult && typeof summaryResult === 'object' && 'metrics' in summaryResult) {
        const metrics = (summaryResult as { metrics: { totalClients: number } }).metrics;
        console.log(`   Total clients: ${metrics.totalClients || 0}`);
      }
    } catch (error) {
      console.log(`⚠️ Summary analysis error: ${error}`);
    }

    // Test detailed analysis with contact counts
    console.log('\n📋 Testing detailed analysis with contact counts...');
    try {
      const detailedResult = await tool.execute({
        context: { 
          analysisMode: 'detailed' as const,
          includeContactCounts: true,
          includeInactiveClients: false,
          topClientsLimit: 3
        },
        runtimeContext: new RuntimeContext(),
        runId: `detailed-test-${Date.now()}`,
        threadId: `detailed-thread-${Date.now()}`,
        resourceId: `detailed-resource-${Date.now()}`
      });
      console.log('✅ Detailed analysis completed');
      console.log(`   Result type: ${typeof detailedResult}`);
      if (detailedResult && typeof detailedResult === 'object' && 'metrics' in detailedResult) {
        const metrics = (detailedResult as { metrics: { totalClients: number, averageProjectValue: number } }).metrics;
        console.log(`   Total clients: ${metrics.totalClients || 0}`);
        console.log(`   Average project value: ${metrics.averageProjectValue || 0}`);
      }
    } catch (error) {
      console.log(`⚠️ Detailed analysis error: ${error}`);
    }

    // Test top performers analysis
    console.log('\n🏆 Testing top performers analysis...');
    try {
      const topResult = await tool.execute({
        context: { 
          analysisMode: 'top-performers' as const,
          includeContactCounts: false,
          includeInactiveClients: false,
          topClientsLimit: 5
        },
        runtimeContext: new RuntimeContext(),
        runId: `top-test-${Date.now()}`,
        threadId: `top-thread-${Date.now()}`,
        resourceId: `top-resource-${Date.now()}`
      });
      console.log('✅ Top performers analysis completed');
      console.log(`   Result type: ${typeof topResult}`);
      if (topResult && typeof topResult === 'object' && 'metrics' in topResult) {
        const metrics = (topResult as { metrics: { topClients: unknown[] } }).metrics;
        console.log(`   Top clients: ${Array.isArray(metrics.topClients) ? metrics.topClients.length : 0}`);
      }
    } catch (error) {
      console.log(`⚠️ Top performers analysis error: ${error}`);
    }

    // Test employee-specific analysis
    console.log('\n👤 Testing employee-specific analysis...');
    try {
      const employeeResult = await tool.execute({
        context: { 
          employeeId: 1,
          analysisMode: 'detailed' as const,
          includeContactCounts: true,
          includeInactiveClients: true,
          topClientsLimit: 8
        },
        runtimeContext: new RuntimeContext(),
        runId: `employee-test-${Date.now()}`,
        threadId: `employee-thread-${Date.now()}`,
        resourceId: `employee-resource-${Date.now()}`
      });
      console.log('✅ Employee-specific analysis completed');
      console.log(`   Result type: ${typeof employeeResult}`);
      if (employeeResult && typeof employeeResult === 'object' && 'metrics' in employeeResult) {
        const metrics = (employeeResult as { metrics: { totalClients: number } }).metrics;
        console.log(`   Employee clients: ${metrics.totalClients || 0}`);
      }
    } catch (error) {
      console.log(`⚠️ Employee-specific analysis error: ${error}`);
    }

    // Generate comprehensive summary
    const summary = tester.generateSummary();
    console.log(`\n📊 Portfolio Analysis Tool Real Integration Test Complete - ${summary.successRate.toFixed(1)}% success rate`);
    console.log(`📄 Detailed logs: ${summary.logFile}`);

    return summary;

  } catch (error) {
    console.error('❌ Portfolio Analysis Tool real integration test failed:', error);
    throw error;
  }
}

// Run if called directly
// Always run the test when this file is executed directly
testPortfolioAnalysisToolReal()
  .then(summary => {
    console.log(`\n🎉 Portfolio Analysis Tool real integration testing completed with ${summary.successful}/${summary.totalTests} tests passed`);
    process.exit(summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('💥 Portfolio Analysis Tool real integration test suite failed:', error);
    process.exit(1);
  });

export { testPortfolioAnalysisToolReal };