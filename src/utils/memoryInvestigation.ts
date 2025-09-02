/**
 * Memory System Investigation Utility
 * Phase 7B: Systematic investigation of tool execution bypass mechanism
 * 
 * GOAL: Find concrete evidence of what's preventing tool execution
 * APPROACH: Add detailed logging without changing core behavior
 */

/**
 * Investigation logging for Mastra memory system behavior
 */
export class MemoryInvestigator {
  private static logPrefix = '[MEMORY INVESTIGATION]';

  /**
   * Log memory system entry point
   */
  static logMemoryEntry(query: string, userId?: string) {
    console.log(`${this.logPrefix} ENTRY - Query: "${query}", User: ${userId || 'unknown'}`);
    console.log(`${this.logPrefix} Timestamp: ${new Date().toISOString()}`);
  }

  /**
   * Log memory system decision points
   */
  static logMemoryDecision(decision: string, reason?: string) {
    console.log(`${this.logPrefix} DECISION - ${decision}`);
    if (reason) {
      console.log(`${this.logPrefix} REASON - ${reason}`);
    }
  }

  /**
   * Log semantic recall behavior
   */
  static logSemanticRecall(query: string, matches: unknown[], topK: number) {
    console.log(`${this.logPrefix} SEMANTIC_RECALL - Query: "${query}"`);
    console.log(`${this.logPrefix} SEMANTIC_RECALL - TopK: ${topK}, Matches found: ${matches.length}`);
    
    if (matches.length > 0) {
      matches.forEach((match, index) => {
        const matchObj = match as Record<string, unknown>;
        console.log(`${this.logPrefix} SEMANTIC_MATCH_${index} - Score: ${matchObj.score || 'unknown'}`);
        console.log(`${this.logPrefix} SEMANTIC_MATCH_${index} - Content: ${JSON.stringify(match).substring(0, 200)}...`);
      });
    }
  }

  /**
   * Log tool selection decision
   */
  static logToolSelection(query: string, toolsAvailable: string[], toolsSelected: string[]) {
    console.log(`${this.logPrefix} TOOL_SELECTION - Query: "${query}"`);
    console.log(`${this.logPrefix} TOOL_SELECTION - Available: [${toolsAvailable.join(', ')}]`);
    console.log(`${this.logPrefix} TOOL_SELECTION - Selected: [${toolsSelected.join(', ')}]`);
    
    if (toolsSelected.length === 0) {
      console.log(`${this.logPrefix} TOOL_BYPASS - NO TOOLS SELECTED - This is the critical issue`);
    }
  }

  /**
   * Log memory vs fresh data decision
   */
  static logFreshnessDecision(query: string, hasMemoryMatch: boolean, decision: 'memory' | 'tools' | 'hybrid') {
    console.log(`${this.logPrefix} FRESHNESS - Query: "${query}"`);
    console.log(`${this.logPrefix} FRESHNESS - Memory match: ${hasMemoryMatch}`);
    console.log(`${this.logPrefix} FRESHNESS - Decision: ${decision}`);
    
    if (decision === 'memory' && hasMemoryMatch) {
      console.log(`${this.logPrefix} MEMORY_BYPASS - Using cached response instead of tools`);
    }
  }

  /**
   * Log agent generation flow
   */
  static logGenerationFlow(step: string, data?: Record<string, unknown>) {
    console.log(`${this.logPrefix} GENERATION_${step.toUpperCase()} - ${new Date().toISOString()}`);
    if (data) {
      console.log(`${this.logPrefix} GENERATION_${step.toUpperCase()}_DATA - ${JSON.stringify(data, null, 2)}`);
    }
  }
}

/**
 * Test query patterns to isolate behavior
 */
export const TEST_QUERIES = {
  // Statistical queries that should trigger tools
  STATISTICAL: [
    'show me database overview',
    'give me database statistics', 
    'how many companies do we have',
    'total employees count',
    'current system stats'
  ],
  
  // Fresh data queries with explicit keywords
  FRESH_DATA: [
    'show me FRESH database overview',
    'give me CURRENT statistics',
    'LATEST employee count',
    'UPDATED company totals'
  ],
  
  // Conversational queries that could use memory
  CONVERSATIONAL: [
    'hello how are you',
    'what can you help me with',
    'thanks for your help',
    'can you explain how this works'
  ],
  
  // Specific searches that should always hit tools
  SPECIFIC_SEARCHES: [
    'find company named Ambition',
    'search for employees in Copenhagen', 
    'show me contacts at Microsoft',
    'export Danish prospects'
  ]
};

