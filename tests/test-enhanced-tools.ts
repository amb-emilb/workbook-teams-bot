import dotenv from 'dotenv';
import { createWorkbookAgent } from '../src/agent/workbookAgent.js';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = path.join('logs', `enhanced-tools-comprehensive-${timestamp}.log`);

// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

function log(message: string) {
  const timestampedMessage = `[${new Date().toISOString()}] ${message}`;
  console.log(timestampedMessage);
  fs.appendFileSync(logFile, timestampedMessage + '\n');
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testEnhancedTools() {
  log('🚀 Testing Enhanced Tool Suite - Comprehensive Sequential Test');
  log('=' .repeat(65));
  log(`Starting comprehensive tests at ${new Date().toISOString()}`);
  log(`Log file: ${path.resolve(logFile)}`);
  log('');
  
  // Create agent for testing
  const agent = await createWorkbookAgent();
  
  try {
  
  const tests = [
    {
      name: 'Universal Search Tool - Companies starting with A',
      query: 'Find companies starting with A',
      prompt: 'Use the universal search to find companies starting with A - limit to 5 results',
      expected: 'Should find companies that start with A and report accurate count'
    },
    {
      name: 'Data Quality Analysis', 
      query: 'Analyze overall data quality',
      prompt: 'Analyze the data quality of our CRM database - give me an overview',
      expected: 'Should provide health metrics and identify issues'
    },
    {
      name: 'Portfolio Analysis - Summary Mode',
      query: 'Portfolio workload distribution',
      prompt: 'Analyze the portfolio distribution in summary mode - how are clients distributed among employees?',
      expected: 'Should analyze workload without making excessive API calls'
    },
    {
      name: 'Advanced Filter Tool - Companies without emails',
      query: 'Find companies missing emails',
      prompt: 'Use advanced filter to find active companies that are missing email addresses - limit to 3',
      expected: 'Should filter companies by multiple criteria'
    },
    {
      name: 'Relationship Mapping - ADECCO',
      query: 'Map ADECCO relationships',
      prompt: 'Map the relationships for ADECCO company - show me the structure',
      expected: 'Should show portfolio companies (not subsidiaries) managed by same account manager'
    },
    {
      name: 'Bulk Operations - Actually deactivate companies without emails',
      query: 'Deactivate companies without emails',
      prompt: 'Deactivate the first 2 companies that don\'t have email addresses - EXECUTE the operation since this is sandbox mode',
      expected: 'Should actually deactivate companies (not just preview) since sandbox mode'
    }
  ];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    log(`📌 Test ${i + 1}: ${test.name}`);
    log(`Query: "${test.query}"`);
    log(`Expected: ${test.expected}`);
    log('');
    
    try {
      const startTime = Date.now();
      const result = await agent.generate(test.prompt);
      const duration = Date.now() - startTime;
      
      log(`✅ ${test.name} completed in ${duration}ms`);
      log(`Result preview: ${result.text.substring(0, 300)}${result.text.length > 300 ? '...' : ''}`);
      log('');
      log('Full result:');
      log(result.text);
      log('');
      
      // Wait 3 seconds between tests to avoid timeouts
      if (i < tests.length - 1) {
        log('Waiting 3 seconds before next test...');
        await delay(3000);
        log('');
      }
      
    } catch (error) {
      log(`❌ Error in ${test.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (error instanceof Error && error.stack) {
        log(`Stack: ${error.stack}`);
      }
      log('');
    }
  }

  log('==================================================');
  log('🎉 Enhanced Tools Comprehensive Test Suite Completed!');
  log('');
  log('Tool Suite Summary:');
  log('• Universal Search - Intelligent query routing with accurate reporting');
  log('• Data Quality Analysis - Completeness and health metrics');
  log('• Portfolio Analysis - Workload distribution insights (optimized)');
  log('• Advanced Filter - Multi-criteria filtering');
  log('• Relationship Mapping - Portfolio companies (fixed terminology)');
  log('• Bulk Operations - Actual execution in sandbox mode');
  log('');
  log(`📄 Full results saved to: ${path.resolve(logFile)}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
testEnhancedTools().catch(console.error);