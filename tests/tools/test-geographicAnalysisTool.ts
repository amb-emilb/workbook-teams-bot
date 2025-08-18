/**
 * Real Integration Test Suite for Geographic Analysis Tool (geographicAnalysisTool.ts)
 * Tests against actual Workbook API in dev environment
 */
import dotenv from 'dotenv';
import { RealToolTester, createTestWorkbookClient } from '../utils/testHelpers.js';
import { createGeographicAnalysisTool } from '../../src/agent/tools/geographicAnalysisTool.js';
import { RuntimeContext } from '@mastra/core/runtime-context';

dotenv.config();

async function testGeographicAnalysisToolReal() {
  // Initialize real WorkbookClient
  const workbookClient = await createTestWorkbookClient();
  const tester = new RealToolTester('geographicAnalysisTool', workbookClient);

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
        name: 'Geographic Distribution Analysis',
        description: 'Analyze overall geographic distribution',
        input: { 
          analysisType: 'distribution' as const
        },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Clustering Analysis',
        description: 'Analyze geographic clustering patterns',
        input: { 
          analysisType: 'clustering' as const
        },
        expectedSuccess: true,
        maxDuration: 12000
      },
      {
        name: 'Coverage Analysis',
        description: 'Analyze geographic coverage gaps',
        input: { 
          analysisType: 'coverage' as const
        },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Territory Analysis',
        description: 'Analyze territory assignments and optimization',
        input: { 
          analysisType: 'territory' as const
        },
        expectedSuccess: true,
        maxDuration: 12000
      },
      {
        name: 'Travel Optimization',
        description: 'Analyze travel and route optimization',
        input: { 
          analysisType: 'travel-optimization' as const
        },
        expectedSuccess: true,
        maxDuration: 15000
      },
      {
        name: 'Regional Performance',
        description: 'Analyze regional performance metrics',
        input: { 
          analysisType: 'regional-performance' as const
        },
        expectedSuccess: true,
        maxDuration: 12000
      },
      {
        name: 'Country-Specific Analysis',
        description: 'Analyze specific countries',
        input: { 
          analysisType: 'distribution' as const,
          countries: ['USA', 'Canada', 'UK']
        },
        expectedSuccess: true,
        maxDuration: 10000
      }
    ];

    // Execute real API tests
    await tester.testTool(createGeographicAnalysisTool, realScenarios);

    // Test input validation with real schemas
    await tester.testInputValidation(createGeographicAnalysisTool, [
      {
        name: 'Valid Distribution Analysis',
        input: { 
          analysisType: 'distribution' as const
        },
        shouldPass: true
      },
      {
        name: 'Valid Clustering Analysis',
        input: { 
          analysisType: 'clustering' as const
        },
        shouldPass: true
      },
      {
        name: 'Valid Coverage Analysis',
        input: { 
          analysisType: 'coverage' as const
        },
        shouldPass: true
      },
      {
        name: 'Valid with Countries',
        input: { 
          analysisType: 'distribution' as const,
          countries: ['Denmark', 'Sweden', 'Norway']
        },
        shouldPass: true
      },
      {
        name: 'Valid with Cities',
        input: { 
          analysisType: 'clustering' as const,
          cities: ['Copenhagen', 'Stockholm', 'Oslo']
        },
        shouldPass: true
      },
      {
        name: 'Valid with Regions',
        input: { 
          analysisType: 'territory' as const,
          regions: ['Scandinavia', 'Nordic']
        },
        shouldPass: true
      },
      {
        name: 'Invalid Analysis Type',
        input: { 
          analysisType: 'location' as 'location'
        },
        shouldPass: false
      },
      {
        name: 'Invalid Countries Type',
        input: { 
          analysisType: 'distribution' as const,
          countries: 'USA' as string
        },
        shouldPass: false
      },
      {
        name: 'Invalid Cities Type',
        input: { 
          analysisType: 'clustering' as const,
          cities: ['New York', 123] as (string | number)[]
        },
        shouldPass: false
      }
    ]);

    // Test real API error scenarios
    await tester.testRealErrorScenarios(createGeographicAnalysisTool, [
      {
        name: 'Non-Existent Countries',
        input: { 
          analysisType: 'distribution' as const,
          countries: ['Atlantis', 'ElDorado']
        },
        description: 'Test with fictional country names'
      },
      {
        name: 'Very Long Country List',
        input: { 
          analysisType: 'distribution' as const,
          countries: Array.from({length: 50}, (_, i) => `Country${i}`)
        },
        description: 'Test with very long country list'
      },
      {
        name: 'Empty Filter Arrays',
        input: { 
          analysisType: 'clustering' as const,
          countries: [],
          cities: [],
          regions: []
        },
        description: 'Test with empty filter arrays'
      }
    ]);

    // Test real API performance
    await tester.testRealPerformance(createGeographicAnalysisTool, [
      {
        name: 'Quick Distribution Analysis',
        input: { 
          analysisType: 'distribution' as const
        },
        expectedMaxDuration: 8000,
        description: 'Basic distribution should be fast'
      },
      {
        name: 'Clustering Analysis Performance',
        input: { 
          analysisType: 'clustering' as const
        },
        expectedMaxDuration: 12000,
        description: 'Clustering analysis performance'
      },
      {
        name: 'Travel Optimization Performance',
        input: { 
          analysisType: 'travel-optimization' as const
        },
        expectedMaxDuration: 20000,
        description: 'Travel optimization may take longer'
      }
    ]);

    // Tool-specific real API tests
    console.log('\n🔧 GEOGRAPHIC ANALYSIS TOOL REAL API SPECIFIC TESTS');
    console.log('─'.repeat(50));

    // Test different analysis types with real data
    const tool = createGeographicAnalysisTool(workbookClient);

    // Test distribution analysis
    console.log('🗺️ Testing geographic distribution analysis...');
    try {
      const distributionResult = await tool.execute({
        context: { 
          analysisType: 'distribution' as const,
          active: true,
          includeEmployees: true,
          includeContacts: true,
          clusterRadius: 50,
          minClusterSize: 5,
          includeMap: false,
          includeRecommendations: true,
          detailLevel: 'detailed' as const
        },
        runtimeContext: new RuntimeContext(),
        runId: `distribution-test-${Date.now()}`,
        threadId: `distribution-thread-${Date.now()}`,
        resourceId: `distribution-resource-${Date.now()}`
      });
      console.log('✅ Distribution analysis completed');
      console.log(`   Result type: ${typeof distributionResult}`);
      if (distributionResult && typeof distributionResult === 'object' && 'distributions' in distributionResult) {
        const distributions = (distributionResult as { distributions: { byCountry: unknown[] } }).distributions;
        console.log(`   Countries analyzed: ${Array.isArray(distributions.byCountry) ? distributions.byCountry.length : 0}`);
      }
    } catch (error) {
      console.log(`⚠️ Distribution analysis error: ${error}`);
    }

    // Test clustering analysis
    console.log('\n🎯 Testing clustering analysis...');
    try {
      const clusteringResult = await tool.execute({
        context: { 
          analysisType: 'clustering' as const,
          active: true,
          includeEmployees: true,
          includeContacts: true,
          clusterRadius: 50,
          minClusterSize: 5,
          includeMap: false,
          includeRecommendations: true,
          detailLevel: 'detailed' as const
        },
        runtimeContext: new RuntimeContext(),
        runId: `clustering-test-${Date.now()}`,
        threadId: `clustering-thread-${Date.now()}`,
        resourceId: `clustering-resource-${Date.now()}`
      });
      console.log('✅ Clustering analysis completed');
      console.log(`   Result type: ${typeof clusteringResult}`);
      if (clusteringResult && typeof clusteringResult === 'object' && 'insights' in clusteringResult) {
        const result = clusteringResult as { insights: string[] };
        console.log(`   Insights generated: ${Array.isArray(result.insights) ? result.insights.length : 0}`);
      }
    } catch (error) {
      console.log(`⚠️ Clustering analysis error: ${error}`);
    }

    // Test coverage analysis
    console.log('\n🔍 Testing coverage analysis...');
    try {
      const coverageResult = await tool.execute({
        context: { 
          analysisType: 'coverage' as const,
          active: true,
          includeEmployees: true,
          includeContacts: true,
          clusterRadius: 50,
          minClusterSize: 5,
          includeMap: false,
          includeRecommendations: true,
          detailLevel: 'detailed' as const
        },
        runtimeContext: new RuntimeContext(),
        runId: `coverage-test-${Date.now()}`,
        threadId: `coverage-thread-${Date.now()}`,
        resourceId: `coverage-resource-${Date.now()}`
      });
      console.log('✅ Coverage analysis completed');
      console.log(`   Result type: ${typeof coverageResult}`);
      if (coverageResult && typeof coverageResult === 'object') {
        if ('insights' in coverageResult) {
          const result = coverageResult as { insights: string[] };
          console.log(`   Insights: ${Array.isArray(result.insights) ? result.insights.length : 0}`);
        }
        if ('totalResources' in coverageResult) {
          const totalResources = (coverageResult as { totalResources: number }).totalResources;
          console.log(`   Total resources: ${totalResources}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ Coverage analysis error: ${error}`);
    }

    // Test territory analysis
    console.log('\n🏘️ Testing territory analysis...');
    try {
      const territoryResult = await tool.execute({
        context: { 
          analysisType: 'territory' as const,
          active: true,
          includeEmployees: true,
          includeContacts: true,
          clusterRadius: 50,
          minClusterSize: 5,
          includeMap: false,
          includeRecommendations: true,
          detailLevel: 'detailed' as const
        },
        runtimeContext: new RuntimeContext(),
        runId: `territory-test-${Date.now()}`,
        threadId: `territory-thread-${Date.now()}`,
        resourceId: `territory-resource-${Date.now()}`
      });
      console.log('✅ Territory analysis completed');
      console.log(`   Result type: ${typeof territoryResult}`);
      if (territoryResult && typeof territoryResult === 'object' && 'totalResources' in territoryResult) {
        const totalResources = (territoryResult as { totalResources: number }).totalResources;
        console.log(`   Resources analyzed: ${totalResources}`);
      }
    } catch (error) {
      console.log(`⚠️ Territory analysis error: ${error}`);
    }

    // Generate comprehensive summary
    const summary = tester.generateSummary();
    console.log(`\n📊 Geographic Analysis Tool Real Integration Test Complete - ${summary.successRate.toFixed(1)}% success rate`);
    console.log(`📄 Detailed logs: ${summary.logFile}`);

    return summary;

  } catch (error) {
    console.error('❌ Geographic Analysis Tool real integration test failed:', error);
    throw error;
  }
}

// Always run the test when this file is executed directly
testGeographicAnalysisToolReal()
  .then(summary => {
    console.log(`\n🎉 Geographic Analysis Tool real integration testing completed with ${summary.successful}/${summary.totalTests} tests passed`);
    process.exit(summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('💥 Geographic Analysis Tool real integration test suite failed:', error);
    process.exit(1);
  });

export { testGeographicAnalysisToolReal };