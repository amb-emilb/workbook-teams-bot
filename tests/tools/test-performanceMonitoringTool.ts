/**
 * Real Integration Test Suite for Performance Monitoring Tool (performanceMonitoringTool.ts)
 * Tests against actual Workbook API in dev environment
 */
import dotenv from 'dotenv';
import { RealToolTester, createTestWorkbookClient } from '../utils/testHelpers.js';
import { createPerformanceMonitoringTool } from '../../src/agent/tools/performanceMonitoringTool.js';
// RuntimeContext is used internally by testHelpers

dotenv.config();

async function testPerformanceMonitoringToolReal() {
  // Initialize real WorkbookClient
  const workbookClient = await createTestWorkbookClient();
  const tester = new RealToolTester('performanceMonitoringTool', workbookClient);

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
        name: 'Get Current Performance Stats',
        description: 'Retrieve current system performance statistics',
        input: { action: 'current-stats' },
        expectedSuccess: true,
        maxDuration: 5000
      },
      {
        name: 'Get Tool Performance History',
        description: 'Get performance history for all tools',
        input: { action: 'tool-history' },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Get API Performance Metrics',
        description: 'Retrieve API call performance metrics',
        input: { action: 'api-metrics' },
        expectedSuccess: true,
        maxDuration: 6000
      },
      {
        name: 'Get Cache Performance Stats',
        description: 'Retrieve cache hit/miss statistics',
        input: { action: 'cache-stats' },
        expectedSuccess: true,
        maxDuration: 4000
      },
      {
        name: 'Generate Performance Report',
        description: 'Generate comprehensive performance report',
        input: { action: 'performance-report', includeGraphs: true },
        expectedSuccess: true,
        maxDuration: 15000
      },
      {
        name: 'Get System Health Check',
        description: 'Perform system health check',
        input: { action: 'health-check' },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Get Resource Usage Stats',
        description: 'Get memory and resource usage statistics',
        input: { action: 'resource-usage' },
        expectedSuccess: true,
        maxDuration: 5000
      }
    ];

    // Performance optimization scenarios
    const optimizationScenarios = [
      {
        name: 'Get Performance Recommendations',
        description: 'Get optimization recommendations based on current metrics',
        input: { action: 'optimization-recommendations' },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Analyze Slow Operations',
        description: 'Identify and analyze slow operations',
        input: { action: 'slow-operations-analysis' },
        expectedSuccess: true,
        maxDuration: 12000
      },
      {
        name: 'Get Bottleneck Analysis',
        description: 'Analyze system bottlenecks',
        input: { action: 'bottleneck-analysis' },
        expectedSuccess: true,
        maxDuration: 10000
      }
    ];

    // Edge case scenarios
    const edgeCaseScenarios = [
      {
        name: 'Export Performance Data',
        description: 'Export performance data to file',
        input: { action: 'export-data', format: 'json' },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Clear Performance History',
        description: 'Clear historical performance data',
        input: { action: 'clear-history' },
        expectedSuccess: true,
        maxDuration: 3000
      },
      {
        name: 'Get Performance Trends',
        description: 'Analyze performance trends over time',
        input: { action: 'trends-analysis', timeRange: '24h' },
        expectedSuccess: true,
        maxDuration: 10000
      }
    ];

    // Error case scenarios
    const errorScenarios = [
      {
        name: 'Invalid Action',
        description: 'Use invalid action parameter',
        input: { action: 'invalid-action-name' },
        expectedSuccess: false,
        maxDuration: 3000
      },
      {
        name: 'Invalid Format for Export',
        description: 'Use invalid format for data export',
        input: { action: 'export-data', format: 'invalid-format' },
        expectedSuccess: false,
        maxDuration: 3000
      },
      {
        name: 'Invalid Time Range',
        description: 'Use invalid time range parameter',
        input: { action: 'trends-analysis', timeRange: 'invalid-range' },
        expectedSuccess: false,
        maxDuration: 3000
      }
    ];

    console.log('🧪 Testing Performance Monitoring Tool - Real API Integration');
    console.log('=' .repeat(60));

    // Run happy path scenarios
    console.log('📋 Testing Happy Path Scenarios...');
    await tester.testTool(createPerformanceMonitoringTool, realScenarios);

    // Run optimization scenarios
    console.log('🚀 Testing Optimization Scenarios...');
    await tester.testTool(createPerformanceMonitoringTool, optimizationScenarios);

    // Run edge case scenarios
    console.log('🔍 Testing Edge Case Scenarios...');
    await tester.testTool(createPerformanceMonitoringTool, edgeCaseScenarios);

    // Run error scenarios
    console.log('⚠️ Testing Error Scenarios...');
    await tester.testRealErrorScenarios(createPerformanceMonitoringTool, errorScenarios);

    // Generate comprehensive test report
    console.log('📊 Generating Test Summary Report...');
    const report = tester.generateSummary();
    console.log('\n' + '='.repeat(60));
    console.log('📋 PERFORMANCE MONITORING TOOL - INTEGRATION TEST REPORT');
    console.log('='.repeat(60));
    console.log(report);

    console.log('✅ Performance Monitoring Tool integration testing completed successfully!');

  } catch (error) {
    console.error('❌ Performance Monitoring Tool testing failed:', error);
    console.error('Stack trace:', (error as Error).stack);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
// Always run the test when this file is executed directly
testPerformanceMonitoringToolReal()
  .then(() => {
    console.log('🎉 All Performance Monitoring Tool tests completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });

export { testPerformanceMonitoringToolReal };