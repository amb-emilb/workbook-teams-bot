/**
 * Comprehensive Test Logging Utility
 * Provides structured logging for individual tool tests with error handling and performance metrics
 */
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  success: boolean;
  duration: number;
  input?: unknown;
  output?: unknown;
  error?: string;
  timestamp: string;
}

interface TestSession {
  toolName: string;
  testName: string;
  startTime: number;
  results: TestResult[];
  logFile: string;
}

export class TestLogger {
  private session: TestSession;

  constructor(toolName: string, testName: string = 'default') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(process.cwd(), 'logs', `tool-${toolName}-${timestamp}.log`);
    
    // Ensure logs directory exists
    const logsDir = path.dirname(logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    this.session = {
      toolName,
      testName,
      startTime: Date.now(),
      results: [],
      logFile
    };

    this.logHeader();
  }

  private logHeader(): void {
    const header = [
      '='.repeat(80),
      `🧪 COMPREHENSIVE TOOL TEST: ${this.session.toolName.toUpperCase()}`,
      '='.repeat(80),
      `Test Session: ${this.session.testName}`,
      `Start Time: ${new Date().toISOString()}`,
      `Log File: ${this.session.logFile}`,
      '='.repeat(80),
      ''
    ].join('\n');

    this.writeToFile(header);
    console.log(header);
  }

  public async logTest(
    testDescription: string,
    testFn: () => Promise<unknown>,
    input?: unknown
  ): Promise<TestResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    this.log(`📌 TEST: ${testDescription}`);
    if (input) {
      this.log(`📋 INPUT: ${JSON.stringify(input, null, 2)}`);
    }
    this.log(`⏱️  Start Time: ${timestamp}`);
    this.log('');

    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      const testResult: TestResult = {
        success: true,
        duration,
        input,
        output: result,
        timestamp
      };

      this.log(`✅ SUCCESS (${duration}ms)`);
      this.log(`📤 OUTPUT: ${JSON.stringify(result, null, 2)}`);
      this.log('');
      
      this.session.results.push(testResult);
      return testResult;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      const testResult: TestResult = {
        success: false,
        duration,
        input,
        error: errorMessage,
        timestamp
      };

      this.log(`❌ ERROR (${duration}ms): ${errorMessage}`);
      if (error instanceof Error && error.stack) {
        this.log(`📋 STACK TRACE:\n${error.stack}`);
      }
      this.log('');
      
      this.session.results.push(testResult);
      return testResult;
    }
  }

  public async logPerformanceTest(
    testDescription: string,
    testFn: () => Promise<unknown>,
    input?: unknown,
    expectedMaxDuration?: number
  ): Promise<TestResult & { performanceStatus: 'excellent' | 'good' | 'slow' | 'timeout' }> {
    const result = await this.logTest(testDescription, testFn, input);
    
    let performanceStatus: 'excellent' | 'good' | 'slow' | 'timeout';
    const duration = result.duration;
    
    if (expectedMaxDuration) {
      if (duration < expectedMaxDuration * 0.5) {
        performanceStatus = 'excellent';
      } else if (duration < expectedMaxDuration * 0.8) {
        performanceStatus = 'good';
      } else if (duration < expectedMaxDuration) {
        performanceStatus = 'slow';
      } else {
        performanceStatus = 'timeout';
      }
    } else {
      // Default performance thresholds
      if (duration < 1000) {
        performanceStatus = 'excellent';
      } else if (duration < 3000) {
        performanceStatus = 'good';
      } else if (duration < 10000) {
        performanceStatus = 'slow';
      } else {
        performanceStatus = 'timeout';
      }
    }

    this.log(`🏃 PERFORMANCE: ${performanceStatus.toUpperCase()} (${duration}ms)`);
    this.log('');

    return { ...result, performanceStatus };
  }

  public async logValidationTest(
    testDescription: string,
    schema: unknown,
    testData: unknown,
    shouldPass: boolean
  ): Promise<TestResult & { validationResult: 'passed' | 'failed' | 'unexpected' }> {
    const testFn = async () => {
      // This is a mock validation - in real tests, you'd use the actual Zod schema
      return { validated: true, data: testData };
    };

    const result = await this.logTest(`VALIDATION: ${testDescription}`, testFn, testData);
    
    let validationResult: 'passed' | 'failed' | 'unexpected';
    if (shouldPass && result.success) {
      validationResult = 'passed';
    } else if (!shouldPass && !result.success) {
      validationResult = 'failed';
    } else {
      validationResult = 'unexpected';
    }

    this.log(`🔍 VALIDATION: ${validationResult.toUpperCase()}`);
    this.log('');

    return { ...result, validationResult };
  }

  public log(message: string): void {
    const timestampedMessage = `[${new Date().toISOString()}] ${message}`;
    console.log(timestampedMessage);
    this.writeToFile(timestampedMessage + '\n');
  }

  public logSection(sectionName: string): void {
    const section = [
      '',
      '─'.repeat(60),
      `🔧 ${sectionName.toUpperCase()}`,
      '─'.repeat(60),
      ''
    ].join('\n');
    
    this.log(section);
  }

  public logSummary(): TestSummary {
    const totalDuration = Date.now() - this.session.startTime;
    const successful = this.session.results.filter(r => r.success).length;
    const failed = this.session.results.filter(r => r.success === false).length;
    const avgDuration = this.session.results.length > 0 
      ? this.session.results.reduce((sum, r) => sum + r.duration, 0) / this.session.results.length 
      : 0;

    const summary: TestSummary = {
      toolName: this.session.toolName,
      testName: this.session.testName,
      totalTests: this.session.results.length,
      successful,
      failed,
      successRate: this.session.results.length > 0 ? (successful / this.session.results.length) * 100 : 0,
      totalDuration,
      averageDuration: avgDuration,
      logFile: this.session.logFile,
      results: this.session.results
    };

    const summaryText = [
      '',
      '='.repeat(80),
      `📊 TEST SUMMARY: ${this.session.toolName.toUpperCase()}`,
      '='.repeat(80),
      `Total Tests: ${summary.totalTests}`,
      `✅ Successful: ${successful}`,
      `❌ Failed: ${failed}`,
      `📈 Success Rate: ${summary.successRate.toFixed(1)}%`,
      `⏱️  Total Duration: ${totalDuration}ms`,
      `📊 Average Duration: ${avgDuration.toFixed(0)}ms`,
      `📄 Log File: ${this.session.logFile}`,
      '='.repeat(80),
      ''
    ].join('\n');

    this.log(summaryText);
    return summary;
  }

  private writeToFile(content: string): void {
    try {
      fs.appendFileSync(this.session.logFile, content);
    } catch (error) {
      console.error(`Failed to write to log file: ${error}`);
    }
  }
}

export interface TestSummary {
  toolName: string;
  testName: string;
  totalTests: number;
  successful: number;
  failed: number;
  successRate: number;
  totalDuration: number;
  averageDuration: number;
  logFile: string;
  results: TestResult[];
}

export type { TestResult };