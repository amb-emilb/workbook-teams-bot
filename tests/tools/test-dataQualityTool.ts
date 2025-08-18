/**
 * Real Integration Test Suite for Data Quality Tool (dataQualityTool.ts)
 * Tests against actual Workbook API in dev environment
 */
import dotenv from 'dotenv';
import { RealToolTester, createTestWorkbookClient } from '../utils/testHelpers.js';
import { createDataQualityTool } from '../../src/agent/tools/dataQualityTool.js';
import { RuntimeContext } from '@mastra/core/runtime-context';

dotenv.config();

async function testDataQualityToolReal() {
  // Initialize real WorkbookClient
  const workbookClient = await createTestWorkbookClient();
  const tester = new RealToolTester('dataQualityTool', workbookClient);

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
        name: 'Data Quality Overview',
        description: 'Get overall data quality summary',
        input: { 
          analysisType: 'overview' as const,
          includeRecommendations: true,
          duplicateThreshold: 0.8
        },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Detailed Analysis',
        description: 'Perform detailed data quality analysis',
        input: { 
          analysisType: 'detailed' as const,
          includeRecommendations: true,
          duplicateThreshold: 0.85
        },
        expectedSuccess: true,
        maxDuration: 15000
      },
      {
        name: 'Issues Only Report',
        description: 'Get only data quality issues',
        input: { 
          analysisType: 'issues-only' as const,
          includeRecommendations: false,
          duplicateThreshold: 0.8
        },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Company Data Quality',
        description: 'Analyze quality for companies only',
        input: { 
          analysisType: 'overview' as const,
          resourceType: [1], // Companies
          includeRecommendations: true,
          duplicateThreshold: 0.8
        },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Employee Data Quality',
        description: 'Analyze quality for employees only',
        input: { 
          analysisType: 'overview' as const,
          resourceType: [2], // Employees
          includeRecommendations: true,
          duplicateThreshold: 0.8
        },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Multiple Resource Types',
        description: 'Analyze multiple resource types',
        input: { 
          analysisType: 'detailed' as const,
          resourceType: [1, 2], // Companies and Employees
          includeRecommendations: true,
          duplicateThreshold: 0.75
        },
        expectedSuccess: true,
        maxDuration: 12000
      },
      {
        name: 'High Duplicate Threshold',
        description: 'Strict duplicate detection',
        input: { 
          analysisType: 'overview' as const,
          includeRecommendations: true,
          duplicateThreshold: 0.95
        },
        expectedSuccess: true,
        maxDuration: 10000
      }
    ];

    // Execute real API tests
    await tester.testTool(createDataQualityTool, realScenarios);

    // Test input validation with real schemas
    await tester.testInputValidation(createDataQualityTool, [
      {
        name: 'Valid Overview Analysis',
        input: { 
          analysisType: 'overview' as const,
          includeRecommendations: true,
          duplicateThreshold: 0.8
        },
        shouldPass: true
      },
      {
        name: 'Valid Detailed Analysis',
        input: { 
          analysisType: 'detailed' as const,
          includeRecommendations: false,
          duplicateThreshold: 0.7
        },
        shouldPass: true
      },
      {
        name: 'Valid Issues Only',
        input: { 
          analysisType: 'issues-only' as const,
          includeRecommendations: true,
          duplicateThreshold: 0.8
        },
        shouldPass: true
      },
      {
        name: 'With Resource Types',
        input: { 
          analysisType: 'overview' as const,
          resourceType: [1, 2, 3],
          includeRecommendations: true,
          duplicateThreshold: 0.8
        },
        shouldPass: true
      },
      {
        name: 'Invalid Analysis Type',
        input: { 
          analysisType: 'summary' as 'summary',
          includeRecommendations: true,
          duplicateThreshold: 0.8
        },
        shouldPass: false
      },
      {
        name: 'Threshold Too Low',
        input: { 
          analysisType: 'overview' as const,
          includeRecommendations: true,
          duplicateThreshold: -0.1
        },
        shouldPass: false
      },
      {
        name: 'Threshold Too High',
        input: { 
          analysisType: 'overview' as const,
          includeRecommendations: true,
          duplicateThreshold: 1.5
        },
        shouldPass: false
      },
      {
        name: 'Invalid Resource Type',
        input: { 
          analysisType: 'overview' as const,
          resourceType: ['company', 'employee'] as string[],
          includeRecommendations: true,
          duplicateThreshold: 0.8
        },
        shouldPass: false
      }
    ]);

    // Test real API error scenarios
    await tester.testRealErrorScenarios(createDataQualityTool, [
      {
        name: 'Invalid Resource Type ID',
        input: { 
          analysisType: 'overview' as const,
          resourceType: [999, 998],
          includeRecommendations: true,
          duplicateThreshold: 0.8
        },
        description: 'Test with invalid resource type IDs'
      },
      {
        name: 'Edge Case Threshold',
        input: { 
          analysisType: 'detailed' as const,
          includeRecommendations: true,
          duplicateThreshold: 0
        },
        description: 'Test with minimum threshold value'
      },
      {
        name: 'Maximum Threshold',
        input: { 
          analysisType: 'detailed' as const,
          includeRecommendations: true,
          duplicateThreshold: 1
        },
        description: 'Test with maximum threshold value'
      }
    ]);

    // Test real API performance
    await tester.testRealPerformance(createDataQualityTool, [
      {
        name: 'Quick Overview',
        input: { 
          analysisType: 'overview' as const,
          includeRecommendations: false,
          duplicateThreshold: 0.8
        },
        expectedMaxDuration: 5000,
        description: 'Overview should be fast'
      },
      {
        name: 'Issues Only Performance',
        input: { 
          analysisType: 'issues-only' as const,
          includeRecommendations: false,
          duplicateThreshold: 0.8
        },
        expectedMaxDuration: 8000,
        description: 'Issues only should be moderately fast'
      },
      {
        name: 'Detailed Analysis Performance',
        input: { 
          analysisType: 'detailed' as const,
          includeRecommendations: true,
          duplicateThreshold: 0.8
        },
        expectedMaxDuration: 20000,
        description: 'Detailed analysis may take longer'
      }
    ]);

    // Tool-specific real API tests
    console.log('\n🔧 DATA QUALITY TOOL REAL API SPECIFIC TESTS');
    console.log('─'.repeat(50));

    // Test different analysis types with real data
    const tool = createDataQualityTool(workbookClient);

    // Test overview analysis
    console.log('📊 Testing overview analysis...');
    try {
      const overviewResult = await tool.execute({
        context: { 
          analysisType: 'overview' as const,
          includeRecommendations: true,
          duplicateThreshold: 0.8
        },
        runtimeContext: new RuntimeContext(),
        runId: `overview-test-${Date.now()}`,
        threadId: `overview-thread-${Date.now()}`,
        resourceId: `overview-resource-${Date.now()}`
      });
      console.log('✅ Overview analysis completed');
      console.log(`   Result type: ${typeof overviewResult}`);
      if (overviewResult && typeof overviewResult === 'object' && 'summary' in overviewResult) {
        const summary = (overviewResult as { summary: { qualityScore?: number } }).summary;
        console.log(`   Quality score: ${summary?.qualityScore || 'N/A'}`);
      }
    } catch (error) {
      console.log(`⚠️ Overview analysis error: ${error}`);
    }

    // Test issues detection
    console.log('\n⚠️ Testing issues detection...');
    try {
      const issuesResult = await tool.execute({
        context: { 
          analysisType: 'issues-only' as const,
          includeRecommendations: false,
          duplicateThreshold: 0.8
        },
        runtimeContext: new RuntimeContext(),
        runId: `issues-test-${Date.now()}`,
        threadId: `issues-thread-${Date.now()}`,
        resourceId: `issues-resource-${Date.now()}`
      });
      console.log('✅ Issues detection completed');
      console.log(`   Result type: ${typeof issuesResult}`);
      if (issuesResult && typeof issuesResult === 'object' && 'issues' in issuesResult) {
        const result = issuesResult as { issues: { missingEmails?: unknown[]; orphanedRecords?: unknown[] } };
        const missingEmails = result.issues.missingEmails || [];
        const orphanedRecords = result.issues.orphanedRecords || [];
        console.log(`   Missing emails: ${Array.isArray(missingEmails) ? missingEmails.length : 0}`);
        console.log(`   Orphaned records: ${Array.isArray(orphanedRecords) ? orphanedRecords.length : 0}`);
      }
    } catch (error) {
      console.log(`⚠️ Issues detection error: ${error}`);
    }

    // Test duplicate detection
    console.log('\n🔍 Testing duplicate detection with different thresholds...');
    try {
      const duplicateResult = await tool.execute({
        context: { 
          analysisType: 'detailed' as const,
          includeRecommendations: false,
          duplicateThreshold: 0.7
        },
        runtimeContext: new RuntimeContext(),
        runId: `duplicate-test-${Date.now()}`,
        threadId: `duplicate-thread-${Date.now()}`,
        resourceId: `duplicate-resource-${Date.now()}`
      });
      console.log('✅ Duplicate detection completed');
      console.log(`   Result type: ${typeof duplicateResult}`);
      if (duplicateResult && typeof duplicateResult === 'object' && 'issues' in duplicateResult) {
        const result = duplicateResult as { issues: { duplicateNames?: unknown[] } };
        const duplicates = result.issues.duplicateNames || [];
        console.log(`   Potential duplicates found: ${Array.isArray(duplicates) ? duplicates.length : 0}`);
      }
    } catch (error) {
      console.log(`⚠️ Duplicate detection error: ${error}`);
    }

    // Test recommendations generation
    console.log('\n💡 Testing recommendations generation...');
    try {
      const recommendResult = await tool.execute({
        context: { 
          analysisType: 'overview' as const,
          includeRecommendations: true,
          duplicateThreshold: 0.8
        },
        runtimeContext: new RuntimeContext(),
        runId: `recommend-test-${Date.now()}`,
        threadId: `recommend-thread-${Date.now()}`,
        resourceId: `recommend-resource-${Date.now()}`
      });
      console.log('✅ Recommendations generation completed');
      console.log(`   Result type: ${typeof recommendResult}`);
      if (recommendResult && typeof recommendResult === 'object' && 'recommendations' in recommendResult) {
        const recommendations = (recommendResult as { recommendations: string[] }).recommendations;
        console.log(`   Recommendations count: ${Array.isArray(recommendations) ? recommendations.length : 0}`);
      }
    } catch (error) {
      console.log(`⚠️ Recommendations generation error: ${error}`);
    }

    // Generate comprehensive summary
    const summary = tester.generateSummary();
    console.log(`\n📊 Data Quality Tool Real Integration Test Complete - ${summary.successRate.toFixed(1)}% success rate`);
    console.log(`📄 Detailed logs: ${summary.logFile}`);

    return summary;

  } catch (error) {
    console.error('❌ Data Quality Tool real integration test failed:', error);
    throw error;
  }
}

// Run if called directly
// Always run the test when this file is executed directly
testDataQualityToolReal()
  .then(summary => {
    console.log(`\n🎉 Data Quality Tool real integration testing completed with ${summary.successful}/${summary.totalTests} tests passed`);
    process.exit(summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('💥 Data Quality Tool real integration test suite failed:', error);
    process.exit(1);
  });

export { testDataQualityToolReal };