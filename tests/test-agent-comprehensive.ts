/**
 * Comprehensive Agent Integration Test
 * Tests the complete Mastra agent with all 12 tools integrated
 */
import dotenv from 'dotenv';
import { createWorkbookAgent } from '../src/agent/workbookAgent.js';
import { TestLogger } from './utils/testLogger.js';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

interface AgentTestScenario {
  name: string;
  description: string;
  query: string;
  expectedToolUsage?: string[];
  maxDuration?: number;
  shouldSucceed: boolean;
}

async function testAgentComprehensive() {
  const logger = new TestLogger('workbookAgent', 'comprehensive-integration-test');

  try {
    logger.logSection('AGENT INITIALIZATION');
    
    // Initialize the agent
    const agent = await logger.logTest(
      'Initialize Workbook Agent',
      async () => {
        const workbookAgent = await createWorkbookAgent();
        return { initialized: true, agentType: typeof workbookAgent };
      }
    );

    if (!agent.success) {
      throw new Error('Failed to initialize agent');
    }

    const workbookAgent = await createWorkbookAgent();

    logger.logSection('TOOL INTEGRATION TESTS');

    // Test scenarios for different tool categories
    const testScenarios: AgentTestScenario[] = [
      // Core Search Tools Tests
      {
        name: 'Basic People Search',
        description: 'Search for people using natural language',
        query: 'Find employees named John Smith',
        expectedToolUsage: ['searchTool', 'universalSearchTool'],
        maxDuration: 10000,
        shouldSucceed: true
      },
      {
        name: 'Company Search',
        description: 'Search for companies',
        query: 'Show me all companies starting with Microsoft',
        expectedToolUsage: ['companySearchTool', 'universalSearchTool'],
        maxDuration: 10000,
        shouldSucceed: true
      },
      {
        name: 'Universal Search Query',
        description: 'Let agent decide best search method',
        query: 'Find contacts at @microsoft.com',
        expectedToolUsage: ['universalSearchTool'],
        maxDuration: 8000,
        shouldSucceed: true
      },

      // Analysis Tools Tests
      {
        name: 'Data Quality Analysis',
        description: 'Analyze data quality',
        query: 'Analyze the quality of our customer data',
        expectedToolUsage: ['dataQualityTool'],
        maxDuration: 15000,
        shouldSucceed: true
      },
      {
        name: 'Portfolio Analysis',
        description: 'Analyze portfolio distribution',
        query: 'Show me how clients are distributed among our account managers',
        expectedToolUsage: ['portfolioAnalysisTool'],
        maxDuration: 20000,
        shouldSucceed: true
      },
      {
        name: 'Relationship Mapping',
        description: 'Map company relationships',
        query: 'Map the relationships for ADECCO company',
        expectedToolUsage: ['relationshipMappingTool'],
        maxDuration: 12000,
        shouldSucceed: true
      },

      // Operations Tools Tests
      {
        name: 'Bulk Operations Preview',
        description: 'Preview bulk changes',
        query: 'Show me a preview of deactivating companies without email addresses',
        expectedToolUsage: ['bulkOperationsTool', 'advancedFilterTool'],
        maxDuration: 15000,
        shouldSucceed: true
      },
      {
        name: 'Export Request',
        description: 'Export data to file',
        query: 'Export all active companies to CSV',
        expectedToolUsage: ['enhancedExportTool'],
        maxDuration: 20000,
        shouldSucceed: true
      },

      // Advanced Filtering Tests
      {
        name: 'Complex Filter Query',
        description: 'Filter with multiple criteria',
        query: 'Find active companies in technology sector without phone numbers',
        expectedToolUsage: ['advancedFilterTool'],
        maxDuration: 10000,
        shouldSucceed: true
      },

      // Geographic Analysis Tests
      {
        name: 'Geographic Analysis',
        description: 'Analyze geographic distribution',
        query: 'Show me the geographic distribution of our clients',
        expectedToolUsage: ['geographicAnalysisTool'],
        maxDuration: 15000,
        shouldSucceed: true
      },

      // Performance Monitoring Tests
      {
        name: 'Performance Monitoring',
        description: 'Check system performance',
        query: 'Give me a performance report of the system',
        expectedToolUsage: ['performanceMonitoringTool'],
        maxDuration: 8000,
        shouldSucceed: true
      },

      // Hierarchical Search Tests
      {
        name: 'Hierarchical Search',
        description: 'Search company hierarchies',
        query: 'Show me the hierarchy structure for large companies',
        expectedToolUsage: ['hierarchicalSearchTool'],
        maxDuration: 12000,
        shouldSucceed: true
      },

      // Edge Cases and Error Handling
      {
        name: 'Vague Query',
        description: 'Handle vague queries',
        query: 'Show me stuff',
        maxDuration: 5000,
        shouldSucceed: false // Should fail gracefully
      },
      {
        name: 'Empty Query',
        description: 'Handle empty queries',
        query: '',
        maxDuration: 3000,
        shouldSucceed: false
      },
      {
        name: 'Complex Multi-Tool Query',
        description: 'Query requiring multiple tools',
        query: 'Find all inactive companies in Europe, analyze their data quality, and prepare a bulk reactivation plan',
        expectedToolUsage: ['advancedFilterTool', 'geographicAnalysisTool', 'dataQualityTool', 'bulkOperationsTool'],
        maxDuration: 30000,
        shouldSucceed: true
      }
    ];

    // Execute test scenarios
    const scenarioResults = [];
    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      
      logger.log(`\n📋 Scenario ${i + 1}/${testScenarios.length}: ${scenario.name}`);
      logger.log(`📝 Description: ${scenario.description}`);
      logger.log(`💬 Query: "${scenario.query}"`);
      
      const result = await logger.logPerformanceTest(
        `Agent Response: ${scenario.name}`,
        async () => {
          const response = await workbookAgent.generate([
            { role: 'user', content: scenario.query }
          ]);
          
          if (!response) {
            throw new Error('Agent returned no response');
          }
          
          return {
            response: response.text || 'No text in response',
            hasText: !!response.text,
            responseLength: response.text?.length || 0
          };
        },
        { query: scenario.query },
        scenario.maxDuration
      );
      
      scenarioResults.push({
        scenario: scenario.name,
        success: result.success,
        duration: result.duration,
        performanceStatus: result.performanceStatus,
        expectedSuccess: scenario.shouldSucceed
      });

      // Wait between tests to avoid overwhelming the system
      if (i < testScenarios.length - 1) {
        logger.log('⏱️ Waiting 2 seconds before next test...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    logger.logSection('AGENT CAPABILITY TESTS');

    // Test agent's ability to handle different types of queries
    const capabilityTests = [
      {
        name: 'Tool Selection Intelligence',
        query: 'I need to find companies, analyze their quality, and export the results',
        description: 'Test if agent can plan multi-step operations'
      },
      {
        name: 'Context Understanding',
        query: 'Show me more details about the first company from the previous search',
        description: 'Test context retention (will likely fail without previous context)'
      },
      {
        name: 'Error Recovery',
        query: 'Find companies with invalid search criteria that should cause an error',
        description: 'Test graceful error handling'
      },
      {
        name: 'Natural Language Understanding',
        query: 'Can you help me understand which clients need attention?',
        description: 'Test natural language interpretation'
      }
    ];

    for (const test of capabilityTests) {
      await logger.logTest(
        `Capability Test: ${test.name}`,
        async () => {
          const response = await workbookAgent.generate([
            { role: 'user', content: test.query }
          ]);
          
          return {
            hasResponse: !!response,
            responseText: response?.text?.substring(0, 200) + '...',
            interpretation: test.description
          };
        },
        { query: test.query, testType: 'capability' }
      );
    }

    logger.logSection('STRESS TESTING');

    // Stress test with concurrent requests (simplified)
    await logger.logTest(
      'Concurrent Request Handling',
      async () => {
        const queries = [
          'Find active companies',
          'Check system performance',
          'Analyze data quality'
        ];
        
        const promises = queries.map(query => 
          workbookAgent.generate([{ role: 'user', content: query }])
        );
        
        const results = await Promise.all(promises);
        return {
          concurrentRequests: queries.length,
          allSucceeded: results.every(r => !!r),
          responses: results.length
        };
      }
    );

    logger.logSection('PERFORMANCE ANALYSIS');

    // Analyze scenario results
    const successfulScenarios = scenarioResults.filter(r => r.success);
    const failedScenarios = scenarioResults.filter(r => !r.success);
    const expectedFailures = scenarioResults.filter(r => !r.expectedSuccess && !r.success);
    const unexpectedFailures = scenarioResults.filter(r => r.expectedSuccess && !r.success);

    logger.log('📊 Scenario Analysis:');
    logger.log(`  Total Scenarios: ${scenarioResults.length}`);
    logger.log(`  ✅ Successful: ${successfulScenarios.length}`);
    logger.log(`  ❌ Failed: ${failedScenarios.length}`);
    logger.log(`  🎯 Expected Failures: ${expectedFailures.length}`);
    logger.log(`  ⚠️  Unexpected Failures: ${unexpectedFailures.length}`);

    if (unexpectedFailures.length > 0) {
      logger.log('\n⚠️  Unexpected Failures:');
      unexpectedFailures.forEach(f => {
        logger.log(`  - ${f.scenario} (${f.duration}ms)`);
      });
    }

    // Performance analysis
    const avgDuration = scenarioResults.reduce((sum, r) => sum + r.duration, 0) / scenarioResults.length;
    const fastScenarios = scenarioResults.filter(r => r.duration < 5000);
    const slowScenarios = scenarioResults.filter(r => r.duration > 15000);

    logger.log('\n⚡ Performance Analysis:');
    logger.log(`  Average Response Time: ${avgDuration.toFixed(0)}ms`);
    logger.log(`  Fast Responses (<5s): ${fastScenarios.length}`);
    logger.log(`  Slow Responses (>15s): ${slowScenarios.length}`);

    // Generate summary
    const summary = logger.logSummary();

    // Save scenario results to separate file for analysis
    const resultsFile = path.join(path.dirname(summary.logFile), `agent-scenario-results-${Date.now()}.json`);
    fs.writeFileSync(resultsFile, JSON.stringify({
      scenarios: scenarioResults,
      summary: {
        totalScenarios: scenarioResults.length,
        successful: successfulScenarios.length,
        failed: failedScenarios.length,
        expectedFailures: expectedFailures.length,
        unexpectedFailures: unexpectedFailures.length,
        averageDuration: avgDuration
      }
    }, null, 2));

    logger.log(`\n📄 Scenario results saved to: ${resultsFile}`);

    return {
      summary,
      scenarioResults,
      resultsFile,
      overallSuccess: unexpectedFailures.length === 0
    };

  } catch (error) {
    console.error('❌ Agent comprehensive test failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAgentComprehensive()
    .then(result => {
      const { summary, scenarioResults } = result;
      console.log('\n🎉 Agent comprehensive testing completed!');
      console.log(`📊 Results: ${summary.successful}/${summary.totalTests} tests passed (${summary.successRate.toFixed(1)}%)`);
      
      const unexpectedFailures = scenarioResults.filter(r => r.expectedSuccess && !r.success).length;
      console.log(`🎯 Unexpected Failures: ${unexpectedFailures}`);
      console.log(`📄 Detailed logs: ${summary.logFile}`);
      
      process.exit(unexpectedFailures > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Agent comprehensive test suite failed:', error);
      process.exit(1);
    });
}

export { testAgentComprehensive };