/**
 * Real Integration Test Suite for Advanced Filter Tool (advancedFilterTool.ts)
 * Tests against actual Workbook API in dev environment
 */
import dotenv from 'dotenv';
import { RealToolTester, createTestWorkbookClient } from '../utils/testHelpers.js';
import { createAdvancedFilterTool } from '../../src/agent/tools/advancedFilterTool.js';
// RuntimeContext is used internally by testHelpers

dotenv.config();

async function testAdvancedFilterToolReal() {
  // Initialize real WorkbookClient
  const workbookClient = await createTestWorkbookClient();
  const tester = new RealToolTester('advancedFilterTool', workbookClient);

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
        name: 'Filter Companies Only',
        description: 'Filter to show only companies (type 1)',
        input: { resourceType: [1], limit: 10 },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Filter Active Resources',
        description: 'Filter to show only active resources',
        input: { active: true, limit: 15 },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Filter by Email Domain',
        description: 'Filter resources by specific email domain',
        input: { emailDomain: 'gmail.com', limit: 8 },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Filter Multiple Resource Types',
        description: 'Filter companies and employees',
        input: { resourceType: [1, 2], active: true, limit: 12 },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Filter Resources with Email',
        description: 'Filter to show only resources that have email addresses',
        input: { hasEmail: true, limit: 20 },
        expectedSuccess: true,
        maxDuration: 12000
      },
      {
        name: 'Filter by Contact Count Range',
        description: 'Filter companies with specific contact count range',
        input: { resourceType: [1], contactCountMin: 1, contactCountMax: 10, limit: 15 },
        expectedSuccess: true,
        maxDuration: 10000
      },
      {
        name: 'Complex Multi-Criteria Filter',
        description: 'Complex filter with multiple criteria',
        input: { 
          resourceType: [1, 2], 
          active: true, 
          hasEmail: true, 
          limit: 8 
        },
        expectedSuccess: true,
        maxDuration: 15000
      }
    ];

    // Additional edge case scenarios
    const edgeCaseScenarios = [
      {
        name: 'Empty Filter (Get All)',
        description: 'No filter criteria - should return all resources up to limit',
        input: { limit: 5 },
        expectedSuccess: true,
        maxDuration: 8000
      },
      {
        name: 'Non-existent Email Domain',
        description: 'Filter by domain that likely does not exist',
        input: { emailDomain: 'nonexistentdomain12345.xyz', limit: 10 },
        expectedSuccess: true, // Should succeed but return empty results
        maxDuration: 8000
      },
      {
        name: 'High Contact Count Filter',
        description: 'Filter for companies with very high contact count',
        input: { resourceType: [1], contactCountMin: 100, limit: 5 },
        expectedSuccess: true, // Should succeed but may return empty results
        maxDuration: 10000
      }
    ];

    // Error case scenarios
    const errorScenarios = [
      {
        name: 'Invalid Resource Type',
        description: 'Use invalid resource type number',
        input: { resourceType: [999], limit: 5 },
        expectedSuccess: false,
        maxDuration: 5000
      },
      {
        name: 'Invalid Contact Count Range',
        description: 'Min contact count higher than max',
        input: { contactCountMin: 10, contactCountMax: 5, limit: 5 },
        expectedSuccess: false,
        maxDuration: 5000
      },
      {
        name: 'Zero Limit',
        description: 'Invalid limit of 0',
        input: { limit: 0 },
        expectedSuccess: false, // Should fail validation
        maxDuration: 3000
      }
    ];

    console.log('🧪 Testing Advanced Filter Tool - Real API Integration');
    console.log('=' .repeat(60));

    // Run happy path scenarios
    console.log('📋 Testing Happy Path Scenarios...');
    await tester.testTool(createAdvancedFilterTool, realScenarios);

    // Run edge case scenarios
    console.log('🔍 Testing Edge Case Scenarios...');
    await tester.testTool(createAdvancedFilterTool, edgeCaseScenarios);

    // Run error scenarios
    console.log('⚠️ Testing Error Scenarios...');
    await tester.testRealErrorScenarios(createAdvancedFilterTool, errorScenarios);

    // Generate comprehensive test report
    console.log('📊 Generating Test Summary Report...');
    const report = tester.generateSummary();
    console.log('\n' + '='.repeat(60));
    console.log('📋 ADVANCED FILTER TOOL - INTEGRATION TEST REPORT');
    console.log('='.repeat(60));
    console.log(report);

    console.log('✅ Advanced Filter Tool integration testing completed successfully!');

  } catch (error) {
    console.error('❌ Advanced Filter Tool testing failed:', error);
    console.error('Stack trace:', (error as Error).stack);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
testAdvancedFilterToolReal()
  .then(() => {
    console.log('🎉 All Advanced Filter Tool tests completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });

export { testAdvancedFilterToolReal };