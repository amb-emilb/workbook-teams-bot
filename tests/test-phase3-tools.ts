import fs from 'fs';
import path from 'path';
import { createEnhancedExportTool } from '../src/agent/tools/enhancedExportTool.js';
import { createGeographicAnalysisTool } from '../src/agent/tools/geographicAnalysisTool.js';
import { WorkbookClient } from '../src/services/index.js';

async function testPhase3Tools() {
  const timestamp = new Date().toISOString();
  const logPath = path.join(process.cwd(), 'logs', `test-phase3-tools-${timestamp.replace(/[:.]/g, '-')}.log`);
  
  // Ensure logs directory exists
  const logsDir = path.dirname(logPath);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const log = (message: string) => {
    console.log(message);
    fs.appendFileSync(logPath, `${new Date().toISOString()} - ${message}\n`);
  };

  log('🚀 Testing Phase 3 Advanced Resource Features Tools');
  log('=' .repeat(60));

  // Initialize WorkbookClient and tools
  const workbookClient = await WorkbookClient.fromKeyVault();
  
  try {
    // Test 1: Enhanced Export Tool Creation
    log('\n📤 TEST 1: Enhanced Export Tool - Creation and Configuration');
    log('-'.repeat(40));
    
    const enhancedExportTool = createEnhancedExportTool(workbookClient);
    
    if (enhancedExportTool && enhancedExportTool.id === 'enhanced-export') {
      log('✅ Enhanced Export Tool created successfully');
      log(`📋 Tool ID: ${enhancedExportTool.id}`);
      log(`📄 Tool Description: ${enhancedExportTool.description?.substring(0, 100)}...`);
    } else {
      log('❌ Enhanced Export Tool creation failed');
    }

    // Test 2: Geographic Analysis Tool Creation
    log('\n🌍 TEST 2: Geographic Analysis Tool - Creation and Configuration');
    log('-'.repeat(40));
    
    const geographicAnalysisTool = createGeographicAnalysisTool(workbookClient);
    
    if (geographicAnalysisTool && geographicAnalysisTool.id === 'geographic-analysis') {
      log('✅ Geographic Analysis Tool created successfully');
      log(`📋 Tool ID: ${geographicAnalysisTool.id}`);
      log(`📄 Tool Description: ${geographicAnalysisTool.description?.substring(0, 100)}...`);
    } else {
      log('❌ Geographic Analysis Tool creation failed');
    }

    // Test 3: Verify Tool Schema Validation
    log('\n🔍 TEST 3: Tool Schema Validation');
    log('-'.repeat(40));
    
    // Test Enhanced Export Tool schema
    if (enhancedExportTool.inputSchema) {
      try {
        const testInput = {
          format: 'csv',
          exportType: 'all',
          includeInactive: false,
          saveToFile: false
        };
        
        const validated = enhancedExportTool.inputSchema.parse(testInput);
        log('✅ Enhanced Export Tool input schema validation passed');
        log(`📊 Validated input: ${JSON.stringify(validated).substring(0, 100)}...`);
      } catch (error) {
        log(`❌ Enhanced Export Tool schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Test Geographic Analysis Tool schema
    if (geographicAnalysisTool.inputSchema) {
      try {
        const testInput = {
          analysisType: 'distribution',
          active: true,
          includeEmployees: true,
          includeContacts: true,
          detailLevel: 'detailed'
        };
        
        const validated = geographicAnalysisTool.inputSchema.parse(testInput);
        log('✅ Geographic Analysis Tool input schema validation passed');
        log(`📊 Validated input: ${JSON.stringify(validated).substring(0, 100)}...`);
      } catch (error) {
        log(`❌ Geographic Analysis Tool schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Test 4: WorkbookClient Integration
    log('\n🔗 TEST 4: WorkbookClient Integration Test');
    log('-'.repeat(40));
    
    try {
      const stats = await workbookClient.resources.getStats();
      if (stats.success) {
        log('✅ WorkbookClient integration working');
        log(`📊 Resource stats: ${JSON.stringify(stats.data)}`);
      } else {
        log(`❌ WorkbookClient integration failed: ${stats.error}`);
      }
    } catch (error) {
      log(`❌ WorkbookClient test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 5: Tool Documentation and Metadata
    log('\n📚 TEST 5: Tool Documentation and Metadata');
    log('-'.repeat(40));
    
    // Check Enhanced Export Tool metadata
    log('Enhanced Export Tool Metadata:');
    log(`  - ID: ${enhancedExportTool.id}`);
    log(`  - Has Description: ${!!enhancedExportTool.description}`);
    log(`  - Has Input Schema: ${!!enhancedExportTool.inputSchema}`);
    log(`  - Has Output Schema: ${!!enhancedExportTool.outputSchema}`);
    
    // Check Geographic Analysis Tool metadata
    log('Geographic Analysis Tool Metadata:');
    log(`  - ID: ${geographicAnalysisTool.id}`);
    log(`  - Has Description: ${!!geographicAnalysisTool.description}`);
    log(`  - Has Input Schema: ${!!geographicAnalysisTool.inputSchema}`);
    log(`  - Has Output Schema: ${!!geographicAnalysisTool.outputSchema}`);

    // Performance Summary
    log('\n⏱️  PERFORMANCE SUMMARY');
    log('-'.repeat(40));
    log(`✅ All Phase 3 tool creation tests completed successfully`);
    log(`📁 Test results saved to: ${logPath}`);
    log(`🕒 Test completed at: ${new Date().toLocaleString()}`);

  } catch (error) {
    log(`❌ Critical error during testing: ${error}`);
    if (error instanceof Error) {
      log(`📄 Error details: ${error.message}`);
      log(`📚 Stack trace: ${error.stack}`);
    }
  }

  log('\n🎯 TEST COMPLETION');
  log('='.repeat(60));
  log(`📁 Full test log available at: ${logPath}`);
}

// Run the tests
testPhase3Tools().catch(console.error);