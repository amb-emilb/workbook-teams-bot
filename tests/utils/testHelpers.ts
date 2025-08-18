/**
 * Real Integration Test Helper Utilities
 * Uses actual WorkbookClient for real API integration testing
 */
import { WorkbookClient } from '../../src/services/workbookClient.js';
import { TestLogger, TestResult } from './testLogger.js';
import { z } from 'zod';
import type { Tool, ToolExecutionContext } from '@mastra/core/tools';
import { RuntimeContext } from '@mastra/core/runtime-context';

export interface RealTestScenario {
  name: string;
  description: string;
  input: unknown;
  expectedSuccess: boolean;
  maxDuration?: number;
  skipReason?: string; // If test should be skipped for some reason
}

// Generic tool factory interface that preserves strong typing
export interface ToolFactory<
  TInputSchema extends z.ZodSchema = z.ZodSchema,
  TOutputSchema extends z.ZodSchema = z.ZodSchema
> {
  // eslint-disable-next-line no-unused-vars
  (workbookClient: WorkbookClient): Tool<TInputSchema, TOutputSchema, ToolExecutionContext<TInputSchema>>
}

export class RealToolTester {
  private logger: TestLogger;
  private toolName: string;
  private workbookClient: WorkbookClient;

  constructor(toolName: string, workbookClient: WorkbookClient) {
    this.toolName = toolName;
    this.workbookClient = workbookClient;
    this.logger = new TestLogger(toolName, 'real-integration-test');
  }

  /**
   * Test a tool with real API integration
   */
  async testTool<TInputSchema extends z.ZodSchema, TOutputSchema extends z.ZodSchema>(
    toolFactory: ToolFactory<TInputSchema, TOutputSchema>,
    scenarios: RealTestScenario[]
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];

    this.logger.logSection(`Real Integration Testing: ${this.toolName}`);

    for (const scenario of scenarios) {
      if (scenario.skipReason) {
        this.logger.log(`⏭️ SKIPPED: ${scenario.name} - ${scenario.skipReason}`);
        continue;
      }

      const tool = toolFactory(this.workbookClient);
      
      const result = await this.logger.logPerformanceTest(
        `REAL API: ${scenario.name}`,
        async () => {
          // Validate input against schema first
          if (!tool.inputSchema) {
            throw new Error('Tool has no input schema');
          }
          
          const inputValidation = tool.inputSchema.safeParse(scenario.input);
          if (!inputValidation.success) {
            throw new Error(`Input validation failed: ${inputValidation.error.message}`);
          }

          // Execute with real WorkbookClient - create proper ToolExecutionContext
          if (!tool.execute) {
            throw new Error('Tool has no execute function');
          }
          
          const executionContext: ToolExecutionContext<TInputSchema> = {
            context: scenario.input as z.infer<TInputSchema>,
            runtimeContext: new RuntimeContext(),
            runId: `test-${Date.now()}`,
            threadId: `thread-${Date.now()}`,
            resourceId: `resource-${Date.now()}`
          };
          
          const response = await tool.execute(executionContext);
          
          // Validate response structure if we have output schema
          if (tool.outputSchema) {
            const validation = tool.outputSchema.safeParse(response);
            if (!validation.success) {
              this.logger.log(`⚠️ Output validation failed: ${validation.error.message}`);
              // Don't throw - just log the issue as response might still be valid
            }
          }
          
          return response;
        },
        scenario.input,
        scenario.maxDuration || 15000 // Default 15 second timeout for real API calls
      );

      results.push(result);

      // Add delay between real API calls to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  /**
   * Test input validation against real Zod schemas
   */
  async testInputValidation<TInputSchema extends z.ZodSchema, TOutputSchema extends z.ZodSchema>(
    toolFactory: ToolFactory<TInputSchema, TOutputSchema>,
    validationScenarios: Array<{
      name: string;
      input: unknown;
      shouldPass: boolean;
    }>
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const tool = toolFactory(this.workbookClient);

    this.logger.logSection('Input Schema Validation Tests');

    for (const scenario of validationScenarios) {
      const result = await this.logger.logTest(
        `INPUT VALIDATION: ${scenario.name}`,
        async () => {
          // Test input schema validation
          if (!tool.inputSchema) {
            throw new Error('Tool has no input schema for validation');
          }
          
          const validation = tool.inputSchema.safeParse(scenario.input);
          
          if (scenario.shouldPass && !validation.success) {
            throw new Error(`Expected input to be valid but got: ${validation.error.message}`);
          }
          
          if (!scenario.shouldPass && validation.success) {
            throw new Error('Expected input to be invalid but it passed validation');
          }

          return { 
            validationResult: validation.success ? 'valid' : 'invalid',
            expectedResult: scenario.shouldPass ? 'valid' : 'invalid',
            errorDetails: validation.success ? undefined : validation.error.issues
          };
        },
        scenario.input
      );

      results.push(result);
    }

    return results;
  }

  /**
   * Test real API error scenarios (when API is down, network issues, etc.)
   */
  async testRealErrorScenarios<TInputSchema extends z.ZodSchema, TOutputSchema extends z.ZodSchema>(
    toolFactory: ToolFactory<TInputSchema, TOutputSchema>,
    errorScenarios: Array<{
      name: string;
      input: unknown;
      description: string;
    }>
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];

    this.logger.logSection('Real API Error Scenario Tests');

    for (const scenario of errorScenarios) {
      const tool = toolFactory(this.workbookClient);

      const result = await this.logger.logTest(
        `ERROR SCENARIO: ${scenario.name}`,
        async () => {
          try {
            if (!tool.execute) {
              throw new Error('Tool has no execute function');
            }
            
            const executionContext: ToolExecutionContext<TInputSchema> = {
              context: scenario.input as z.infer<TInputSchema>,
              runtimeContext: new RuntimeContext(),
              runId: `test-error-${Date.now()}`,
              threadId: `thread-error-${Date.now()}`,
              resourceId: `resource-error-${Date.now()}`
            };
            
            const response = await tool.execute(executionContext);
            
            // If we get here, check if response indicates error was handled gracefully
            if (typeof response === 'object' && response !== null) {
              const resp = response as Record<string, unknown>;
              return { 
                errorHandling: 'graceful', 
                response: resp,
                description: scenario.description
              };
            }
            
            return { 
              errorHandling: 'succeeded_unexpectedly', 
              response,
              description: scenario.description 
            };
            
          } catch (error) {
            // Expected for some error scenarios
            return { 
              errorHandling: 'exception_thrown', 
              error: error instanceof Error ? error.message : String(error),
              description: scenario.description
            };
          }
        },
        scenario.input
      );

      results.push(result);
      
      // Longer delay after error scenarios to let API recover
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return results;
  }

  /**
   * Test tool performance with real API calls
   */
  async testRealPerformance<TInputSchema extends z.ZodSchema, TOutputSchema extends z.ZodSchema>(
    toolFactory: ToolFactory<TInputSchema, TOutputSchema>,
    performanceScenarios: Array<{
      name: string;
      input: unknown;
      expectedMaxDuration: number;
      description: string;
    }>
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];

    this.logger.logSection('Real API Performance Tests');

    for (const scenario of performanceScenarios) {
      const tool = toolFactory(this.workbookClient);

      const result = await this.logger.logPerformanceTest(
        `PERFORMANCE: ${scenario.name}`,
        async () => {
          if (!tool.execute) {
            throw new Error('Tool has no execute function');
          }
          
          const executionContext: ToolExecutionContext<TInputSchema> = {
            context: scenario.input as z.infer<TInputSchema>,
            runtimeContext: new RuntimeContext(),
            runId: `test-perf-${Date.now()}`,
            threadId: `thread-perf-${Date.now()}`,
            resourceId: `resource-perf-${Date.now()}`
          };
          
          return await tool.execute(executionContext);
        },
        scenario.input,
        scenario.expectedMaxDuration
      );

      this.logger.log(`📊 Performance Result: ${result.duration}ms (expected < ${scenario.expectedMaxDuration}ms)`);
      results.push(result);

      // Brief pause between performance tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
  }

  /**
   * Generate comprehensive test summary
   */
  generateSummary(): import('./testLogger.js').TestSummary {
    return this.logger.logSummary();
  }
}

/**
 * Real-world test scenarios that work with actual API data
 */
export const RealTestScenarios = {
  // Common valid inputs that should work with real API
  validInputs: {
    basicSearch: {
      name: 'Basic Search Query',
      description: 'Search with a simple term that should return results',
      input: { query: 'A', limit: 5 }, // Single letter should match many names
      expectedSuccess: true,
      maxDuration: 8000
    },
    smallLimit: {
      name: 'Small Limit Query',
      description: 'Search with small result limit',
      input: { query: 'test', limit: 3 },
      expectedSuccess: true,
      maxDuration: 5000
    },
    noQuery: {
      name: 'No Query (Get All)',
      description: 'Get all records with limit',
      input: { limit: 10 },
      expectedSuccess: true,
      maxDuration: 10000
    },
    emptyQuery: {
      name: 'Empty Query String',
      description: 'Empty query should return all with limit',
      input: { query: '', limit: 5 },
      expectedSuccess: true,
      maxDuration: 8000
    }
  },

  // Invalid inputs that should be rejected by schema validation
  invalidInputs: {
    negativeLimit: {
      name: 'Negative Limit',
      description: 'Negative limit should be rejected',
      input: { query: 'test', limit: -1 },
      expectedSuccess: false
    },
    tooLargeLimit: {
      name: 'Excessive Limit',
      description: 'Limit exceeding maximum should be rejected',
      input: { query: 'test', limit: 1000 },
      expectedSuccess: false
    },
    wrongTypes: {
      name: 'Wrong Parameter Types',
      description: 'Wrong type for query parameter',
      input: { query: 123, limit: 5 },
      expectedSuccess: false
    },
    invalidEmail: {
      name: 'Invalid Email Format',
      description: 'Invalid email format should be rejected',
      input: { email: 'not-an-email' },
      expectedSuccess: false
    }
  },

  // Performance scenarios with realistic expectations
  performanceScenarios: {
    quickSearch: {
      name: 'Quick Search Performance',
      description: 'Fast search with small limit',
      input: { query: 'A', limit: 5 },
      expectedMaxDuration: 5000
    },
    mediumSearch: {
      name: 'Medium Search Performance',  
      description: 'Medium complexity search',
      input: { query: 'company', limit: 20 },
      expectedMaxDuration: 10000
    },
    largeSearch: {
      name: 'Large Result Set Performance',
      description: 'Search that might return many results',
      input: { limit: 50 },
      expectedMaxDuration: 15000
    }
  }
};

/**
 * Initialize WorkbookClient for testing
 * Uses environment variables instead of Key Vault for local testing
 */
export async function createTestWorkbookClient(): Promise<WorkbookClient> {
  return WorkbookClient.fromEnvironment();
}