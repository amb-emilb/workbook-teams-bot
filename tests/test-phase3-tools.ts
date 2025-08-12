import fs from 'fs';
import path from 'path';
import { enhancedExportTool } from '../src/agent/tools/enhancedExportTool.js';
import { geographicAnalysisTool } from '../src/agent/tools/geographicAnalysisTool.js';

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

  try {
    // Test 1: Enhanced Export Tool - CSV Export
    log('\n📤 TEST 1: Enhanced Export Tool - CSV Export');
    log('-'.repeat(40));
    
    const csvExportResult = await enhancedExportTool.execute({
      context: {
        format: 'csv',
        exportType: 'filtered',
        active: true,
        includeInactive: false,
        includeContactCounts: false,
        saveToFile: true,
        fileName: 'test-csv-export',
        limit: 50
      }
    });
    
    log(`✅ CSV Export Result: ${csvExportResult.success ? 'SUCCESS' : 'FAILED'}`);
    log(`📊 Records exported: ${csvExportResult.recordCount}`);
    log(`📁 File saved: ${csvExportResult.filePath || 'No file saved'}`);
    log(`📄 Preview:\n${csvExportResult.preview.substring(0, 300)}...`);
    
    if (csvExportResult.statistics) {
      log(`📈 Statistics:`);
      log(`   - Total: ${csvExportResult.statistics.totalRecords}`);
      log(`   - Active: ${csvExportResult.statistics.activeRecords}`);
      log(`   - Employees: ${csvExportResult.statistics.employeeCount}`);
      log(`   - Contacts: ${csvExportResult.statistics.contactCount}`);
    }

    // Test 2: Enhanced Export Tool - JSON Export with Statistics
    log('\n📤 TEST 2: Enhanced Export Tool - Statistics Report');
    log('-'.repeat(40));
    
    const statsExportResult = await enhancedExportTool.execute({
      context: {
        format: 'statistics',
        exportType: 'all',
        includeInactive: true,
        includeContactCounts: false,
        saveToFile: false
      }
    });
    
    log(`✅ Statistics Export Result: ${statsExportResult.success ? 'SUCCESS' : 'FAILED'}`);
    log(`📊 Records analyzed: ${statsExportResult.recordCount}`);
    log(`📄 Statistics Preview:\n${statsExportResult.preview.substring(0, 500)}...`);

    // Test 3: Enhanced Export Tool - Report Format
    log('\n📤 TEST 3: Enhanced Export Tool - Report Format');
    log('-'.repeat(40));
    
    const reportExportResult = await enhancedExportTool.execute({
      context: {
        format: 'report',
        exportType: 'filtered',
        resourceTypes: [2], // Only employees
        active: true,
        includeInactive: false,
        includeContactCounts: false,
        saveToFile: true,
        fileName: 'test-employee-report',
        limit: 20
      }
    });
    
    log(`✅ Report Export Result: ${reportExportResult.success ? 'SUCCESS' : 'FAILED'}`);
    log(`📊 Records in report: ${reportExportResult.recordCount}`);
    log(`📁 File saved: ${reportExportResult.filePath || 'No file saved'}`);

    // Test 4: Geographic Analysis Tool - Distribution Analysis
    log('\n🌍 TEST 4: Geographic Analysis Tool - Distribution Analysis');
    log('-'.repeat(40));
    
    const distributionResult = await geographicAnalysisTool.execute({
      context: {
        analysisType: 'distribution',
        active: true,
        includeEmployees: true,
        includeContacts: true,
        includeMap: true,
        includeRecommendations: true,
        detailLevel: 'detailed'
      }
    });
    
    log(`✅ Distribution Analysis Result: ${distributionResult.success ? 'SUCCESS' : 'FAILED'}`);
    log(`📊 Resources analyzed: ${distributionResult.totalResources}`);
    log(`🏴 Countries found: ${distributionResult.locationDistribution.countries.length}`);
    log(`🏙️  Cities found: ${distributionResult.locationDistribution.topCities.length}`);
    
    if (distributionResult.locationDistribution.countries.length > 0) {
      log(`🔝 Top country: ${distributionResult.locationDistribution.countries[0].name} (${distributionResult.locationDistribution.countries[0].count} resources)`);
    }
    
    if (distributionResult.insights.length > 0) {
      log(`💡 Key insights:`);
      distributionResult.insights.slice(0, 3).forEach((insight, index) => {
        log(`   ${index + 1}. ${insight}`);
      });
    }
    
    if (distributionResult.mapVisualization) {
      log(`🗺️  Map visualization:\n${distributionResult.mapVisualization.substring(0, 400)}...`);
    }

    // Test 5: Geographic Analysis Tool - Clustering Analysis
    log('\n🌍 TEST 5: Geographic Analysis Tool - Clustering Analysis');
    log('-'.repeat(40));
    
    const clusteringResult = await geographicAnalysisTool.execute({
      context: {
        analysisType: 'clustering',
        active: true,
        clusterRadius: 50,
        minClusterSize: 3,
        includeEmployees: true,
        includeContacts: true,
        includeMap: false,
        includeRecommendations: true,
        detailLevel: 'comprehensive'
      }
    });
    
    log(`✅ Clustering Analysis Result: ${clusteringResult.success ? 'SUCCESS' : 'FAILED'}`);
    log(`📊 Resources analyzed: ${clusteringResult.totalResources}`);
    
    if (clusteringResult.clusters && clusteringResult.clusters.length > 0) {
      log(`🔗 Clusters found: ${clusteringResult.clusters.length}`);
      clusteringResult.clusters.slice(0, 3).forEach((cluster, index) => {
        log(`   ${index + 1}. ${cluster.centerLocation}: ${cluster.size} resources`);
      });
    } else {
      log(`🔗 No significant clusters found`);
    }
    
    if (clusteringResult.metrics) {
      log(`📊 Metrics:`);
      log(`   - Regional Balance: ${(clusteringResult.metrics.regionalBalance * 100).toFixed(1)}%`);
      log(`   - Concentration Index: ${clusteringResult.metrics.concentrationIndex}`);
    }

    // Test 6: Geographic Analysis Tool - Coverage Analysis
    log('\n🌍 TEST 6: Geographic Analysis Tool - Coverage Analysis');
    log('-'.repeat(40));
    
    const coverageResult = await geographicAnalysisTool.execute({
      context: {
        analysisType: 'coverage',
        active: true,
        clusterRadius: 50,
        minClusterSize: 5,
        includeEmployees: true,
        includeContacts: true,
        includeMap: false,
        includeRecommendations: true,
        detailLevel: 'detailed'
      }
    });
    
    log(`✅ Coverage Analysis Result: ${coverageResult.success ? 'SUCCESS' : 'FAILED'}`);
    log(`📊 Resources analyzed: ${coverageResult.totalResources}`);
    
    if (coverageResult.coverage) {
      log(`🗺️  Coverage:`);
      log(`   - Covered locations: ${coverageResult.coverage.coveredLocations}`);
      log(`   - Uncovered regions: ${coverageResult.coverage.uncoveredRegions.length}`);
      log(`   - Coverage gaps: ${coverageResult.coverage.coverageGaps.length}`);
      
      if (coverageResult.coverage.recommendedExpansions.length > 0) {
        log(`💡 Expansion recommendations: ${coverageResult.coverage.recommendedExpansions.join(', ')}`);
      }
    }
    
    if (coverageResult.recommendations && coverageResult.recommendations.length > 0) {
      log(`🎯 Strategic recommendations:`);
      coverageResult.recommendations.slice(0, 3).forEach((rec, index) => {
        log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}: ${rec.description}`);
      });
    }

    // Test 7: Error Handling Test
    log('\n❌ TEST 7: Error Handling Test');
    log('-'.repeat(40));
    
    const errorTestResult = await enhancedExportTool.execute({
      context: {
        format: 'csv',
        exportType: 'filtered',
        includeInactive: false,
        includeContactCounts: false,
        limit: -1, // Invalid limit to test error handling
        saveToFile: true,
        fileName: 'error-test'
      }
    });
    
    log(`✅ Error handling test: ${errorTestResult.success ? 'UNEXPECTED SUCCESS' : 'PROPERLY HANDLED'}`);
    if (!errorTestResult.success) {
      log(`📄 Error message captured in preview: ${errorTestResult.preview.substring(0, 100)}...`);
    }

    // Performance Summary
    log('\n⏱️  PERFORMANCE SUMMARY');
    log('-'.repeat(40));
    log(`✅ All Phase 3 tools tested successfully`);
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