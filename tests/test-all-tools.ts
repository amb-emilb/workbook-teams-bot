/**
 * Comprehensive Test Runner for All Tools
 * Executes individual tests for all 12 tools with consolidated reporting
 */
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { TestSummary } from './utils/testLogger.js';

// Import all individual tool tests
import { testSearchToolReal } from './tools/test-searchTool.js';
import { testUniversalSearchToolReal } from './tools/test-universalSearchTool.js';
import { testCompanySearchToolReal } from './tools/test-companySearchTool.js';
import { testHierarchicalSearchToolReal } from './tools/test-hierarchicalSearchTool.js';
import { testBulkOperationsToolReal } from './tools/test-bulkOperationsTool.js';
import { testEnhancedExportToolReal } from './tools/test-enhancedExportTool.js';
import { testDataQualityToolReal } from './tools/test-dataQualityTool.js';
import { testPortfolioAnalysisToolReal } from './tools/test-portfolioAnalysisTool.js';
import { testRelationshipMappingToolReal } from './tools/test-relationshipMappingTool.js';
import { testGeographicAnalysisToolReal } from './tools/test-geographicAnalysisTool.js';
import { testAdvancedFilterToolReal } from './tools/test-advancedFilterTool.js';
import { testPerformanceMonitoringToolReal } from './tools/test-performanceMonitoringTool.js';

dotenv.config();

interface ConsolidatedReport {
  overallSummary: {
    totalTools: number;
    totalTests: number;
    totalSuccessful: number;
    totalFailed: number;
    overallSuccessRate: number;
    totalDuration: number;
    averageToolSuccessRate: number;
  };
  toolResults: Array<TestSummary & { toolCategory: string }>;
  detailedLogs: string[];
  reportFile: string;
}

class ToolTestRunner {
  private results: Array<TestSummary & { toolCategory: string }> = [];
  private startTime = Date.now();

  async runAllTests(): Promise<ConsolidatedReport> {
    console.log('🚀 COMPREHENSIVE TOOL TEST SUITE');
    console.log('='.repeat(80));
    console.log(`Starting comprehensive testing of all 12 tools at ${new Date().toISOString()}`);
    console.log('='.repeat(80));
    console.log('');

    // Category 1: Core Search Tools
    await this.runToolCategory('Core Search Tools', [
      { name: 'Search Tool', testFn: testSearchToolReal },
      { name: 'Universal Search Tool', testFn: testUniversalSearchToolReal },
      { name: 'Company Search Tool', testFn: testCompanySearchToolReal },
      { name: 'Hierarchical Search Tool', testFn: testHierarchicalSearchToolReal }
    ]);

    // Category 2: Operations Tools  
    await this.runToolCategory('Operations Tools', [
      { name: 'Bulk Operations Tool', testFn: testBulkOperationsToolReal },
      { name: 'Enhanced Export Tool', testFn: testEnhancedExportToolReal }
    ]);

    // Category 3: Analysis Tools
    await this.runToolCategory('Analysis Tools', [
      { name: 'Data Quality Tool', testFn: testDataQualityToolReal },
      { name: 'Portfolio Analysis Tool', testFn: testPortfolioAnalysisToolReal },
      { name: 'Relationship Mapping Tool', testFn: testRelationshipMappingToolReal },
      { name: 'Geographic Analysis Tool', testFn: testGeographicAnalysisToolReal }
    ]);

    // Category 4: Filtering Tools
    await this.runToolCategory('Filtering Tools', [
      { name: 'Advanced Filter Tool', testFn: testAdvancedFilterToolReal }
    ]);

    // Category 5: Monitoring Tools
    await this.runToolCategory('Monitoring Tools', [
      { name: 'Performance Monitoring Tool', testFn: testPerformanceMonitoringToolReal }
    ]);

    // Generate consolidated report
    return this.generateConsolidatedReport();
  }

  private async runToolCategory(
    categoryName: string, 
    tools: Array<{ name: string; testFn: () => Promise<TestSummary> }>
  ): Promise<void> {
    console.log(`\n📁 CATEGORY: ${categoryName.toUpperCase()}`);
    console.log('─'.repeat(60));

    for (const tool of tools) {
      console.log(`\n🔧 Testing ${tool.name}...`);
      
      try {
        const startTime = Date.now();
        const result = await tool.testFn();
        const duration = Date.now() - startTime;
        
        const categorizedResult = {
          ...result,
          toolCategory: categoryName
        };
        
        this.results.push(categorizedResult);
        
        const status = result.failed === 0 ? '✅ PASSED' : '❌ FAILED';
        console.log(`${status} - ${tool.name}: ${result.successful}/${result.totalTests} tests (${result.successRate.toFixed(1)}%) in ${duration}ms`);
        
      } catch (error) {
        console.error(`💥 ${tool.name} test suite crashed:`, error);
        
        // Create a failure result
        const failedResult: TestSummary & { toolCategory: string } = {
          toolName: tool.name,
          testName: 'comprehensive-test',
          totalTests: 0,
          successful: 0,
          failed: 1,
          successRate: 0,
          totalDuration: 0,
          averageDuration: 0,
          logFile: 'N/A - Test suite crashed',
          results: [],
          toolCategory: categoryName
        };
        
        this.results.push(failedResult);
      }
    }
  }

  private generateConsolidatedReport(): ConsolidatedReport {
    const totalDuration = Date.now() - this.startTime;
    const totalTests = this.results.reduce((sum, r) => sum + r.totalTests, 0);
    const totalSuccessful = this.results.reduce((sum, r) => sum + r.successful, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const overallSuccessRate = totalTests > 0 ? (totalSuccessful / totalTests) * 100 : 0;
    const averageToolSuccessRate = this.results.length > 0 
      ? this.results.reduce((sum, r) => sum + r.successRate, 0) / this.results.length 
      : 0;

    const report: ConsolidatedReport = {
      overallSummary: {
        totalTools: this.results.length,
        totalTests,
        totalSuccessful,
        totalFailed,
        overallSuccessRate,
        totalDuration,
        averageToolSuccessRate
      },
      toolResults: this.results,
      detailedLogs: this.results.map(r => r.logFile),
      reportFile: ''
    };

    // Generate and save consolidated report
    report.reportFile = this.saveConsolidatedReport(report);
    
    return report;
  }

  private saveConsolidatedReport(report: ConsolidatedReport): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(process.cwd(), 'logs', `consolidated-tool-test-report-${timestamp}.md`);
    
    // Ensure logs directory exists
    const logsDir = path.dirname(reportFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const reportContent = this.generateReportMarkdown(report);
    fs.writeFileSync(reportFile, reportContent);
    
    return reportFile;
  }

  private generateReportMarkdown(report: ConsolidatedReport): string {
    const { overallSummary, toolResults } = report;
    
    let markdown = [
      '# Comprehensive Tool Test Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '## Overall Summary',
      `- **Total Tools Tested**: ${overallSummary.totalTools}`,
      `- **Total Tests Executed**: ${overallSummary.totalTests}`,
      `- **✅ Successful Tests**: ${overallSummary.totalSuccessful}`,
      `- **❌ Failed Tests**: ${overallSummary.totalFailed}`,
      `- **📊 Overall Success Rate**: ${overallSummary.overallSuccessRate.toFixed(1)}%`,
      `- **⏱️ Total Duration**: ${overallSummary.totalDuration}ms`,
      `- **📈 Average Tool Success Rate**: ${overallSummary.averageToolSuccessRate.toFixed(1)}%`,
      '',
      '## Tool Results by Category',
      ''
    ].join('\n');

    // Group results by category
    const categories = new Map<string, Array<TestSummary & { toolCategory: string }>>();
    toolResults.forEach(result => {
      if (!categories.has(result.toolCategory)) {
        categories.set(result.toolCategory, []);
      }
      categories.get(result.toolCategory)!.push(result);
    });

    categories.forEach((tools, category) => {
      markdown += `### ${category}\n\n`;
      
      tools.forEach(tool => {
        const status = tool.failed === 0 ? '✅' : '❌';
        markdown += `#### ${status} ${tool.toolName}\n`;
        markdown += `- Tests: ${tool.successful}/${tool.totalTests}\n`;
        markdown += `- Success Rate: ${tool.successRate.toFixed(1)}%\n`;
        markdown += `- Duration: ${tool.totalDuration}ms\n`;
        markdown += `- Average Test Time: ${tool.averageDuration.toFixed(0)}ms\n`;
        markdown += `- Log File: \`${tool.logFile}\`\n\n`;
      });
    });

    // Add detailed logs section
    markdown += '\n## Detailed Log Files\n\n';
    report.detailedLogs.forEach((logFile, index) => {
      markdown += `${index + 1}. \`${logFile}\`\n`;
    });

    // Add performance analysis
    markdown += '\n## Performance Analysis\n\n';
    
    const fastTools = toolResults.filter(t => t.averageDuration < 1000);
    const slowTools = toolResults.filter(t => t.averageDuration >= 3000);
    
    if (fastTools.length > 0) {
      markdown += '### ⚡ Fast Tools (< 1s average)\n';
      fastTools.forEach(tool => {
        markdown += `- ${tool.toolName}: ${tool.averageDuration.toFixed(0)}ms\n`;
      });
      markdown += '\n';
    }
    
    if (slowTools.length > 0) {
      markdown += '### 🐌 Slow Tools (≥ 3s average)\n';
      slowTools.forEach(tool => {
        markdown += `- ${tool.toolName}: ${tool.averageDuration.toFixed(0)}ms\n`;
      });
      markdown += '\n';
    }

    // Add recommendations
    markdown += '\n## Recommendations\n\n';
    
    const failedTools = toolResults.filter(t => t.failed > 0);
    if (failedTools.length > 0) {
      markdown += '### 🔧 Tools Needing Attention\n';
      failedTools.forEach(tool => {
        markdown += `- **${tool.toolName}**: ${tool.failed} failed tests (${tool.successRate.toFixed(1)}% success rate)\n`;
      });
      markdown += '\n';
    }

    if (slowTools.length > 0) {
      markdown += '### ⏱️ Performance Optimization\n';
      markdown += 'Consider optimizing the following tools for better performance:\n';
      slowTools.forEach(tool => {
        markdown += `- ${tool.toolName}: Average ${tool.averageDuration.toFixed(0)}ms per test\n`;
      });
      markdown += '\n';
    }

    if (overallSummary.overallSuccessRate < 90) {
      markdown += '### 🎯 Quality Improvement\n';
      markdown += `Current overall success rate is ${overallSummary.overallSuccessRate.toFixed(1)}%. Consider:\n`;
      markdown += '- Review failed test cases\n';
      markdown += '- Improve error handling\n';
      markdown += '- Add more comprehensive input validation\n';
      markdown += '- Enhance API error recovery mechanisms\n\n';
    }

    return markdown;
  }

  displayConsolidatedResults(report: ConsolidatedReport): void {
    const { overallSummary } = report;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 CONSOLIDATED TEST RESULTS');
    console.log('='.repeat(80));
    console.log(`🔧 Tools Tested: ${overallSummary.totalTools}`);
    console.log(`📝 Total Tests: ${overallSummary.totalTests}`);
    console.log(`✅ Successful: ${overallSummary.totalSuccessful}`);
    console.log(`❌ Failed: ${overallSummary.totalFailed}`);
    console.log(`📊 Overall Success Rate: ${overallSummary.overallSuccessRate.toFixed(1)}%`);
    console.log(`⏱️ Total Duration: ${overallSummary.totalDuration}ms`);
    console.log(`📈 Average Tool Success Rate: ${overallSummary.averageToolSuccessRate.toFixed(1)}%`);
    console.log('');
    
    // Display per-tool summary
    console.log('📋 Per-Tool Results:');
    console.log('─'.repeat(60));
    report.toolResults.forEach(tool => {
      const status = tool.failed === 0 ? '✅' : '❌';
      console.log(`${status} ${tool.toolName.padEnd(25)} ${tool.successful}/${tool.totalTests} (${tool.successRate.toFixed(1)}%)`);
    });
    
    console.log('');
    console.log(`📄 Detailed Report: ${report.reportFile}`);
    console.log('='.repeat(80));
  }
}

async function runAllToolTests(): Promise<ConsolidatedReport> {
  const runner = new ToolTestRunner();
  const report = await runner.runAllTests();
  runner.displayConsolidatedResults(report);
  return report;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllToolTests()
    .then(report => {
      const { overallSummary } = report;
      console.log('\n🎉 All tool testing completed!');
      console.log(`Final Result: ${overallSummary.totalSuccessful}/${overallSummary.totalTests} tests passed (${overallSummary.overallSuccessRate.toFixed(1)}%)`);
      
      // Exit with error code if any tests failed
      process.exit(overallSummary.totalFailed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Tool test suite failed:', error);
      process.exit(1);
    });
}

export { runAllToolTests, ToolTestRunner };