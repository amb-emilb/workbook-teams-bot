/**
 * Universal Freshness Detection Utility
 * Used by ALL tools to detect when queries require fresh data vs cached/memory responses
 * 
 * Phase 7A: Memory & Data Freshness Remediation
 * Critical fix for Teams bot serving stale statistical data
 */

import { cacheManager } from '../services/base/cache.js';

/**
 * Detects if a query requires fresh data and should bypass memory/cache
 * @param query - User query text to analyze
 * @returns boolean - true if fresh data is required
 */
export function requiresFreshData(query: string): boolean {
  if (!query) return false;
  
  const queryLower = query.toLowerCase();
  
  // Statistical/data query keywords that always need fresh data
  const freshnessKeywords = [
    'overview', 'statistics', 'database', 'stats', 'count', 'total', 
    'how many', 'show me', 'give me', 'list', 'all', 'current', 'show',
    'latest', 'recent', 'today', 'now', 'updated', 'fresh', 'new'
  ];
  
  // Check for statistical keywords
  const hasStatisticalKeywords = freshnessKeywords.some(keyword => 
    queryLower.includes(keyword)
  );
  
  // Check for data operation patterns
  const dataOperationPatterns = [
    /\b(how many|count|total|number of)\b/i,
    /\b(show|give|list).*\b(all|me)\b/i,
    /\b(database|system|data)\s+(overview|stats|statistics)\b/i,
    /\b(current|latest|recent)\s+(data|information)\b/i
  ];
  
  const hasDataOperationPattern = dataOperationPatterns.some(pattern => 
    pattern.test(query)
  );
  
  return hasStatisticalKeywords || hasDataOperationPattern;
}

/**
 * Forces cache flush for tools when fresh data is required
 * @param query - User query text
 * @param toolName - Name of the tool requesting freshness check
 */
export function ensureFreshData(query: string, toolName: string): void {
  if (requiresFreshData(query)) {
    console.log(`[FRESHNESS DETECTION] Query "${query}" requires fresh data for ${toolName}`);
    console.log(`[AUTO CACHE PURGE] Flushing cache to ensure fresh data...`);
    cacheManager.flush();
  }
}

/**
 * Logs freshness detection results for monitoring
 * @param query - User query text  
 * @param toolName - Name of the tool
 * @param forced - Whether fresh data was forced
 */
export function logFreshnessDecision(query: string, toolName: string, forced: boolean): void {
  console.log(`[FRESHNESS LOG] Tool: ${toolName}, Query: "${query}", Fresh: ${forced}`);
}