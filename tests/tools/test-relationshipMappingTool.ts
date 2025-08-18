/**
 * Real Integration Test Suite for Relationship Mapping Tool (relationshipMappingTool.ts)
 * Tests against actual Workbook API in dev environment
 */
import dotenv from 'dotenv';
import { RealToolTester, createTestWorkbookClient } from '../utils/testHelpers.js';
import { createRelationshipMappingTool } from '../../src/agent/tools/relationshipMappingTool.js';
import { RuntimeContext } from '@mastra/core/runtime-context';

dotenv.config();

async function testRelationshipMappingToolReal() {
  // Initialize real WorkbookClient
  const workbookClient = await createTestWorkbookClient();
  const tester = new RealToolTester('relationshipMappingTool', workbookClient);

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
        name: 'All Companies Relationship Map',
        description: 'Map relationships for all companies',
        input: { 
          includeVisualization: true,
          maxDepth: 3,
          includeInactive: false
        },
        expectedSuccess: true,
        maxDuration: 12000
      },
      {
        name: 'Specific Company by ID',
        description: 'Map relationships for specific company',
        input: { 
          companyId: 1,
          includeVisualization: true,
          maxDepth: 2,
          includeInactive: false
        },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Company by Name Search',
        description: 'Find and map company relationships by name',
        input: { 
          companyName: 'Tech',
          includeVisualization: true,
          maxDepth: 3,
          includeInactive: false
        },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Deep Relationship Tree',
        description: 'Map deep relationships with max depth',
        input: { 
          includeVisualization: true,
          maxDepth: 5,
          includeInactive: false
        },
        expectedSuccess: true,
        maxDuration: 15000
      },
      {
        name: 'Include Inactive Resources',
        description: 'Map including inactive resources',
        input: { 
          includeVisualization: true,
          maxDepth: 2,
          includeInactive: true
        },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Without Visualization',
        description: 'Get relationship data without ASCII visualization',
        input: { 
          includeVisualization: false,
          maxDepth: 3,
          includeInactive: false
        },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Shallow Mapping',
        description: 'Map with minimal depth',
        input: { 
          includeVisualization: true,
          maxDepth: 1,
          includeInactive: false
        },
        expectedSuccess: true,
        maxDuration: 6000
      }
    ];

    // Execute real API tests
    await tester.testTool(createRelationshipMappingTool, realScenarios);

    // Test input validation with real schemas
    await tester.testInputValidation(createRelationshipMappingTool, [
      {
        name: 'Valid All Parameters',
        input: { 
          companyId: 123,
          includeVisualization: true,
          maxDepth: 3,
          includeInactive: false
        },
        shouldPass: true
      },
      {
        name: 'Valid Company Name',
        input: { 
          companyName: 'Test Company',
          includeVisualization: true,
          maxDepth: 2,
          includeInactive: true
        },
        shouldPass: true
      },
      {
        name: 'Valid Minimal Parameters',
        input: { 
          includeVisualization: false,
          maxDepth: 1,
          includeInactive: false
        },
        shouldPass: true
      },
      {
        name: 'Valid Maximum Depth',
        input: { 
          includeVisualization: true,
          maxDepth: 5,
          includeInactive: false
        },
        shouldPass: true
      },
      {
        name: 'Depth Too Low',
        input: { 
          includeVisualization: true,
          maxDepth: 0,
          includeInactive: false
        },
        shouldPass: false
      },
      {
        name: 'Depth Too High',
        input: { 
          includeVisualization: true,
          maxDepth: 6,
          includeInactive: false
        },
        shouldPass: false
      },
      {
        name: 'Invalid Company ID Type',
        input: { 
          companyId: 'one' as string,
          includeVisualization: true,
          maxDepth: 3,
          includeInactive: false
        },
        shouldPass: false
      },
      {
        name: 'Invalid Visualization Type',
        input: { 
          includeVisualization: 'yes' as string,
          maxDepth: 3,
          includeInactive: false
        },
        shouldPass: false
      }
    ]);

    // Test real API error scenarios
    await tester.testRealErrorScenarios(createRelationshipMappingTool, [
      {
        name: 'Non-Existent Company ID',
        input: { 
          companyId: 999999,
          includeVisualization: true,
          maxDepth: 3,
          includeInactive: false
        },
        description: 'Test with company ID that likely does not exist'
      },
      {
        name: 'Non-Existent Company Name',
        input: { 
          companyName: 'NonExistentCompany12345',
          includeVisualization: true,
          maxDepth: 3,
          includeInactive: false
        },
        description: 'Test with company name that does not exist'
      },
      {
        name: 'Negative Company ID',
        input: { 
          companyId: -1,
          includeVisualization: true,
          maxDepth: 3,
          includeInactive: false
        },
        description: 'Test with negative company ID'
      }
    ]);

    // Test real API performance
    await tester.testRealPerformance(createRelationshipMappingTool, [
      {
        name: 'Quick Shallow Mapping',
        input: { 
          includeVisualization: false,
          maxDepth: 1,
          includeInactive: false
        },
        expectedMaxDuration: 5000,
        description: 'Shallow mapping without visualization should be fast'
      },
      {
        name: 'Single Company Performance',
        input: { 
          companyId: 1,
          includeVisualization: true,
          maxDepth: 2,
          includeInactive: false
        },
        expectedMaxDuration: 8000,
        description: 'Single company mapping performance'
      },
      {
        name: 'Deep Mapping Performance',
        input: { 
          includeVisualization: true,
          maxDepth: 5,
          includeInactive: true
        },
        expectedMaxDuration: 20000,
        description: 'Deep mapping with inactive resources'
      }
    ]);

    // Tool-specific real API tests
    console.log('\n🔧 RELATIONSHIP MAPPING TOOL REAL API SPECIFIC TESTS');
    console.log('─'.repeat(50));

    // Test different mapping approaches with real data
    const tool = createRelationshipMappingTool(workbookClient);

    // Test basic relationship mapping
    console.log('🗺️ Testing basic relationship mapping...');
    try {
      const mappingResult = await tool.execute({
        context: { 
          includeVisualization: true,
          maxDepth: 2,
          includeInactive: false
        },
        runtimeContext: new RuntimeContext(),
        runId: `mapping-test-${Date.now()}`,
        threadId: `mapping-thread-${Date.now()}`,
        resourceId: `mapping-resource-${Date.now()}`
      });
      console.log('✅ Basic relationship mapping completed');
      console.log(`   Result type: ${typeof mappingResult}`);
      if (mappingResult && typeof mappingResult === 'object' && 'relationshipMap' in mappingResult) {
        const relationshipMap = (mappingResult as { relationshipMap: { companies: unknown[] } }).relationshipMap;
        console.log(`   Companies mapped: ${Array.isArray(relationshipMap.companies) ? relationshipMap.companies.length : 0}`);
      }
    } catch (error) {
      console.log(`⚠️ Basic relationship mapping error: ${error}`);
    }

    // Test visualization generation
    console.log('\n🌳 Testing ASCII visualization generation...');
    try {
      const visualResult = await tool.execute({
        context: { 
          companyId: 1,
          includeVisualization: true,
          maxDepth: 3,
          includeInactive: false
        },
        runtimeContext: new RuntimeContext(),
        runId: `visual-test-${Date.now()}`,
        threadId: `visual-thread-${Date.now()}`,
        resourceId: `visual-resource-${Date.now()}`
      });
      console.log('✅ Visualization generation completed');
      console.log(`   Result type: ${typeof visualResult}`);
      if (visualResult && typeof visualResult === 'object' && 'message' in visualResult) {
        const message = (visualResult as { message: string }).message;
        if (typeof message === 'string') {
          console.log(`   Visualization lines: ${message.split('\n').length}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ Visualization generation error: ${error}`);
    }

    // Test company search and mapping
    console.log('\n🔍 Testing company search and mapping...');
    try {
      const searchResult = await tool.execute({
        context: { 
          companyName: 'Corp',
          includeVisualization: false,
          maxDepth: 2,
          includeInactive: false
        },
        runtimeContext: new RuntimeContext(),
        runId: `search-test-${Date.now()}`,
        threadId: `search-thread-${Date.now()}`,
        resourceId: `search-resource-${Date.now()}`
      });
      console.log('✅ Company search and mapping completed');
      console.log(`   Result type: ${typeof searchResult}`);
      if (searchResult && typeof searchResult === 'object' && 'relationshipMap' in searchResult) {
        const relationshipMap = (searchResult as { relationshipMap: { companies: { name: string }[] } }).relationshipMap;
        if (Array.isArray(relationshipMap.companies) && relationshipMap.companies.length > 0) {
          console.log(`   First company: ${relationshipMap.companies[0].name || 'Unknown'}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ Company search and mapping error: ${error}`);
    }

    // Test deep relationship mapping
    console.log('\n🔬 Testing deep relationship mapping...');
    try {
      const deepResult = await tool.execute({
        context: { 
          includeVisualization: true,
          maxDepth: 4,
          includeInactive: true
        },
        runtimeContext: new RuntimeContext(),
        runId: `deep-test-${Date.now()}`,
        threadId: `deep-thread-${Date.now()}`,
        resourceId: `deep-resource-${Date.now()}`
      });
      console.log('✅ Deep relationship mapping completed');
      console.log(`   Result type: ${typeof deepResult}`);
      if (deepResult && typeof deepResult === 'object') {
        if ('relationshipMap' in deepResult) {
          const relationshipMap = (deepResult as { relationshipMap: { networkMetrics: { totalNodes: number, totalConnections: number } } }).relationshipMap;
          console.log(`   Total nodes: ${relationshipMap.networkMetrics?.totalNodes || 0}`);
          console.log(`   Total connections: ${relationshipMap.networkMetrics?.totalConnections || 0}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ Deep relationship mapping error: ${error}`);
    }

    // Generate comprehensive summary
    const summary = tester.generateSummary();
    console.log(`\n📊 Relationship Mapping Tool Real Integration Test Complete - ${summary.successRate.toFixed(1)}% success rate`);
    console.log(`📄 Detailed logs: ${summary.logFile}`);

    return summary;

  } catch (error) {
    console.error('❌ Relationship Mapping Tool real integration test failed:', error);
    throw error;
  }
}

// Run if called directly
// Always run the test when this file is executed directly
testRelationshipMappingToolReal()
  .then(summary => {
    console.log(`\n🎉 Relationship Mapping Tool real integration testing completed with ${summary.successful}/${summary.totalTests} tests passed`);
    process.exit(summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('💥 Relationship Mapping Tool real integration test suite failed:', error);
    process.exit(1);
  });

export { testRelationshipMappingToolReal };