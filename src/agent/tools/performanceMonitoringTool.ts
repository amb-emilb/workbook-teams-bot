import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient } from '../../services/index.js';
import { cacheManager } from '../../services/base/cache.js';
import * as fs from 'fs';
import * as path from 'path';


// Global performance tracking
const performanceTracker = {
  apiCalls: [] as Array<{ endpoint: string; duration: number; cached: boolean; error?: boolean; timestamp: string }>,
  toolExecutions: new Map<string, Array<{ duration: number; success: boolean; timestamp: string }>>(),
  startTime: Date.now(),
  
  recordApiCall(endpoint: string, duration: number, cached: boolean, error: boolean = false) {
    this.apiCalls.push({
      endpoint,
      duration,
      cached,
      error,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 1000 records
    if (this.apiCalls.length > 1000) {
      this.apiCalls = this.apiCalls.slice(-1000);
    }
  },
  
  recordToolExecution(toolId: string, duration: number, success: boolean) {
    if (!this.toolExecutions.has(toolId)) {
      this.toolExecutions.set(toolId, []);
    }
    
    const executions = this.toolExecutions.get(toolId)!;
    executions.push({
      duration,
      success,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 executions per tool
    if (executions.length > 100) {
      this.toolExecutions.set(toolId, executions.slice(-100));
    }
  }
};

/**
 * Performance Monitoring Tool for system telemetry and optimization
 * Tracks API performance, cache efficiency, tool usage, and system health
 */
/**
 * Create performance monitoring tool
 * Factory function that accepts initialized WorkbookClient
 */
export function createPerformanceMonitoringTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'performance-monitoring',
    description: `Monitor system performance and generate optimization insights. Use this tool to:
  - Track API call performance and response times
  - Monitor cache hit ratios and memory usage
  - Analyze tool usage patterns and efficiency
  - Generate performance reports and alerts
  - Identify optimization opportunities
  - Export performance data for analysis
  
  Provides comprehensive performance telemetry and health monitoring.`,
  
    inputSchema: z.object({
      monitoringType: z.enum([
        'real-time', 
        'historical', 
        'cache-analysis', 
        'api-performance',
        'tool-usage',
        'system-health',
        'optimization-report',
        'performance-alert'
      ])
        .optional()
        .default('real-time')
        .describe('Type of performance monitoring to perform'),
      
      // Legacy parameter support
      action: z.string()
        .optional()
        .describe('Legacy action parameter (mapped to monitoringType)'),
    
      // Time range for historical analysis
      timeRange: z.enum(['1h', '6h', '24h', '7d', '30d'])
        .default('24h')
        .describe('Time range for historical data analysis'),
    
      // Specific metrics to focus on
      metrics: z.array(z.enum([
        'api-calls',
        'cache-performance',
        'tool-usage',
        'memory-usage',
        'response-times',
        'error-rates'
      ]))
        .optional()
        .describe('Specific metrics to focus on (all if not specified)'),
    
      // Thresholds for alerts
      alertThresholds: z.object({
        maxResponseTime: z.number().default(5000).describe('Max acceptable response time in ms'),
        minCacheHitRatio: z.number().min(0).max(1).default(0.7).describe('Minimum acceptable cache hit ratio'),
        maxErrorRate: z.number().min(0).max(1).default(0.05).describe('Maximum acceptable error rate'),
        maxMemoryUsage: z.number().default(500).describe('Max memory usage in MB')
      }).optional(),
    
      // Output options
      includeRecommendations: z.boolean()
        .default(true)
        .describe('Include performance optimization recommendations'),
    
      exportMetrics: z.boolean()
        .default(false)
        .describe('Export detailed metrics to file'),
    
      generateReport: z.boolean()
        .default(false)
        .describe('Generate comprehensive performance report'),
    
      detailLevel: z.enum(['summary', 'detailed', 'comprehensive'])
        .default('detailed')
        .describe('Level of detail in analysis output')
    }),
  
    outputSchema: z.object({
      success: z.boolean(),
      monitoringType: z.string(),
      timestamp: z.string(),
    
      // Real-time metrics
      currentMetrics: z.object({
        apiCalls: z.object({
          recentCount: z.number(),
          averageResponseTime: z.number(),
          cacheHitRatio: z.number(),
          errorRate: z.number()
        }),
        cacheStats: z.object({
          hitRatio: z.number(),
          totalKeys: z.number(),
          memoryUsage: z.string(),
          keyCount: z.number()
        }),
        systemHealth: z.object({
          uptime: z.string(),
          memoryUsage: z.string(),
          status: z.enum(['healthy', 'warning', 'critical'])
        })
      }),
    
      // Historical trends
      trends: z.object({
        apiPerformance: z.array(z.object({
          timestamp: z.string(),
          averageResponseTime: z.number(),
          callCount: z.number(),
          errorRate: z.number()
        })),
        cacheEfficiency: z.array(z.object({
          timestamp: z.string(),
          hitRatio: z.number(),
          keyCount: z.number()
        }))
      }).optional(),
    
      // Tool usage statistics
      toolUsage: z.object({
        totalExecutions: z.number(),
        mostUsedTools: z.array(z.object({
          toolId: z.string(),
          executions: z.number(),
          averageTime: z.number(),
          successRate: z.number(),
          lastUsed: z.string()
        })),
        performanceLeaders: z.array(z.object({
          toolId: z.string(),
          averageTime: z.number(),
          efficiency: z.number()
        }))
      }).optional(),
    
      // Alerts and warnings
      alerts: z.array(z.object({
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        type: z.string(),
        message: z.string(),
        metric: z.string(),
        currentValue: z.number(),
        threshold: z.number(),
        timestamp: z.string()
      })),
    
      // Optimization recommendations
      recommendations: z.array(z.object({
        category: z.enum(['cache', 'api', 'tools', 'system']),
        priority: z.enum(['low', 'medium', 'high']),
        title: z.string(),
        description: z.string(),
        expectedImpact: z.string(),
        implementation: z.string()
      })).optional(),
    
      // Performance insights
      insights: z.array(z.string()),
    
      // Export information
      exportPath: z.string().optional(),
      reportPath: z.string().optional(),
    
      executionTime: z.string()
    }),
  
    execute: async ({ context }) => {
      const startTime = Date.now();
      console.log('📊 Performance Monitoring Tool - Starting analysis...', context);
    
      try {
        // Handle legacy 'action' parameter mapping to new 'monitoringType' schema
        const legacyActionMap: Record<string, string> = {
          'current-stats': 'real-time',
          'tool-history': 'tool-usage', 
          'api-metrics': 'api-performance',
          'cache-stats': 'cache-analysis',
          'performance-report': 'optimization-report',
          'health-check': 'system-health',
          'resource-usage': 'system-health',
          'optimization-recommendations': 'optimization-report',
          'slow-operations-analysis': 'historical',
          'bottleneck-analysis': 'optimization-report',
          'export-data': 'optimization-report',
          'clear-history': 'optimization-report',
          'trends-analysis': 'historical'
        };
        
        const {
          monitoringType: rawMonitoringType,
          timeRange,
          alertThresholds,
          includeRecommendations,
          exportMetrics,
          generateReport,
          detailLevel,
          action // Legacy parameter
        } = context as any;
        
        // Map legacy action parameter to monitoringType
        const monitoringType = rawMonitoringType || legacyActionMap[action] || 'real-time';

        // Get current system metrics (pass workbookClient for API health check)
        const currentMetrics = await getCurrentMetrics(workbookClient);
      
        // Generate historical trends if requested
        let trends;
        if (monitoringType === 'historical' || detailLevel === 'comprehensive') {
          trends = generateHistoricalTrends(timeRange);
        }
      
        // Analyze tool usage if requested
        let toolUsage;
        if (monitoringType === 'tool-usage' || detailLevel === 'comprehensive') {
          toolUsage = analyzeToolUsage();
        }
      
        // Check for performance alerts
        const alerts = checkPerformanceAlerts(currentMetrics, alertThresholds);
      
        // Generate optimization recommendations
        let recommendations;
        if (includeRecommendations) {
          recommendations = generateOptimizationRecommendations(currentMetrics, toolUsage, alerts);
        }
      
        // Generate performance insights
        const insights = generatePerformanceInsights(currentMetrics, trends, toolUsage, alerts);
      
        // Export metrics if requested
        let exportPath;
        if (exportMetrics) {
          exportPath = await exportPerformanceMetrics({
            currentMetrics,
            trends,
            toolUsage,
            alerts,
            timestamp: new Date().toISOString()
          });
        }
      
        // Generate comprehensive report if requested
        let reportPath;
        if (generateReport) {
          reportPath = await generatePerformanceReport({
            monitoringType,
            currentMetrics,
            trends,
            toolUsage,
            alerts,
            recommendations,
            insights
          });
        }

        const executionTime = `${Date.now() - startTime}ms`;
      
        // Record this tool execution
        performanceTracker.recordToolExecution('performance-monitoring', Date.now() - startTime, true);
      
        console.log(`✅ Performance monitoring completed in ${executionTime}`);

        return {
          success: true,
          monitoringType,
          timestamp: new Date().toISOString(),
          currentMetrics,
          trends,
          toolUsage,
          alerts,
          recommendations,
          insights,
          exportPath,
          reportPath,
          executionTime
        };

      } catch (error) {
        const executionTime = `${Date.now() - startTime}ms`;
        performanceTracker.recordToolExecution('performance-monitoring', Date.now() - startTime, false);
      
        console.error('❌ Performance Monitoring Tool error:', error);
        return {
          success: false,
          monitoringType: context.monitoringType,
          timestamp: new Date().toISOString(),
          currentMetrics: {
            apiCalls: { recentCount: 0, averageResponseTime: 0, cacheHitRatio: 0, errorRate: 0 },
            cacheStats: { hitRatio: 0, totalKeys: 0, memoryUsage: '0 MB', keyCount: 0 },
            systemHealth: { uptime: '0s', memoryUsage: '0 MB', status: 'critical' as const }
          },
          alerts: [{
            severity: 'critical' as const,
            type: 'system-error',
            message: `Performance monitoring failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            metric: 'system',
            currentValue: 0,
            threshold: 1,
            timestamp: new Date().toISOString()
          }],
          insights: [`Error during performance monitoring: ${error instanceof Error ? error.message : 'Unknown error'}`],
          executionTime
        };
      }
    }
  });
}

// Helper functions
async function getCurrentMetrics(workbookClient?: WorkbookClient) {
  const cacheStats = cacheManager.getStats();
  const cacheKeys = cacheManager.getKeys();
  
  // If WorkbookClient is provided, we could get additional metrics
  // For example, test API connectivity
  let apiHealthy = false;
  if (workbookClient) {
    try {
      const testResponse = await workbookClient.resources.getStats();
      apiHealthy = testResponse.success;
    } catch {
      apiHealthy = false;
    }
  }
  
  // Calculate recent API performance
  const recentCalls = performanceTracker.apiCalls.filter(call => 
    Date.now() - new Date(call.timestamp).getTime() < 3600000 // Last hour
  );
  
  const cachedCalls = recentCalls.filter(call => call.cached).length;
  const errorCalls = recentCalls.filter(call => call.error).length;
  const avgResponseTime = recentCalls.length > 0 
    ? recentCalls.reduce((sum, call) => sum + call.duration, 0) / recentCalls.length
    : 0;
  
  const cacheHitRatio = recentCalls.length > 0 ? cachedCalls / recentCalls.length : 0;
  const errorRate = recentCalls.length > 0 ? errorCalls / recentCalls.length : 0;
  
  // System health
  const uptime = Date.now() - performanceTracker.startTime;
  const memoryUsage = process.memoryUsage();
  
  return {
    apiCalls: {
      recentCount: recentCalls.length,
      averageResponseTime: Math.round(avgResponseTime),
      cacheHitRatio: Math.round(cacheHitRatio * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100
    },
    cacheStats: {
      hitRatio: cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0,
      totalKeys: cacheStats.keys,
      memoryUsage: formatBytes(memoryUsage.heapUsed),
      keyCount: cacheKeys.length
    },
    systemHealth: {
      uptime: formatDuration(uptime),
      memoryUsage: formatBytes(memoryUsage.heapUsed),
      status: determineSystemHealth(avgResponseTime, errorRate, cacheHitRatio, apiHealthy) as 'healthy' | 'warning' | 'critical'
    },
    apiHealthy // Return API health status for use in determining system health
  };
}

function generateHistoricalTrends(timeRange: string) {
  const timeRangeMs = {
    '1h': 3600000,
    '6h': 21600000,
    '24h': 86400000,
    '7d': 604800000,
    '30d': 2592000000
  }[timeRange] || 86400000;
  
  const cutoff = Date.now() - timeRangeMs;
  const relevantCalls = performanceTracker.apiCalls.filter(call => 
    new Date(call.timestamp).getTime() > cutoff
  );
  
  // Group by time intervals
  const intervalSize = Math.max(timeRangeMs / 20, 300000); // 20 data points, minimum 5 minutes
  const intervals = new Map<number, Array<typeof relevantCalls[0]>>();
  
  relevantCalls.forEach(call => {
    const intervalKey = Math.floor(new Date(call.timestamp).getTime() / intervalSize) * intervalSize;
    if (!intervals.has(intervalKey)) {
      intervals.set(intervalKey, []);
    }
    intervals.get(intervalKey)!.push(call);
  });
  
  const apiPerformance = Array.from(intervals.entries())
    .sort(([a], [b]) => a - b)
    .map(([timestamp, calls]) => ({
      timestamp: new Date(timestamp).toISOString(),
      averageResponseTime: calls.reduce((sum, call) => sum + call.duration, 0) / calls.length,
      callCount: calls.length,
      errorRate: calls.filter(call => call.error).length / calls.length
    }));
  
  const cacheEfficiency = apiPerformance.map(point => ({
    timestamp: point.timestamp,
    hitRatio: 0.8, // Simplified - would need more detailed tracking
    keyCount: cacheManager.getKeys().length
  }));
  
  return { apiPerformance, cacheEfficiency };
}

function analyzeToolUsage() {
  const totalExecutions = Array.from(performanceTracker.toolExecutions.values())
    .reduce((sum, executions) => sum + executions.length, 0);
  
  const mostUsedTools = Array.from(performanceTracker.toolExecutions.entries())
    .map(([toolId, executions]) => {
      const avgTime = executions.reduce((sum, exec) => sum + exec.duration, 0) / executions.length;
      const successRate = executions.filter(exec => exec.success).length / executions.length;
      const lastUsed = Math.max(...executions.map(exec => new Date(exec.timestamp).getTime()));
      
      return {
        toolId,
        executions: executions.length,
        averageTime: Math.round(avgTime),
        successRate: Math.round(successRate * 100) / 100,
        lastUsed: new Date(lastUsed).toISOString()
      };
    })
    .sort((a, b) => b.executions - a.executions)
    .slice(0, 10);
  
  const performanceLeaders = mostUsedTools
    .filter(tool => tool.executions > 2) // Minimum usage for statistical significance
    .map(tool => ({
      toolId: tool.toolId,
      averageTime: tool.averageTime,
      efficiency: Math.round((tool.successRate / Math.log(tool.averageTime + 1)) * 100) / 100
    }))
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 5);
  
  return {
    totalExecutions,
    mostUsedTools,
    performanceLeaders
  };
}

interface CurrentMetrics {
  apiCalls: { 
    recentCount: number;
    averageResponseTime: number; 
    cacheHitRatio: number; 
    errorRate: number;
  };
  cacheStats: { 
    hitRatio: number;
    totalKeys: number;
    memoryUsage: string;
    keyCount: number;
  };
  systemHealth: { 
    uptime: string;
    memoryUsage: string;
    status: 'healthy' | 'warning' | 'critical';
  };
  apiHealthy: boolean;
}

interface AlertThresholds {
  maxResponseTime?: number;
  minCacheHitRatio?: number;
  maxErrorRate?: number;
  maxMemoryUsage?: number;
}

function checkPerformanceAlerts(currentMetrics: CurrentMetrics, thresholds?: AlertThresholds) {
  const alerts = [];
  const defaultThresholds = {
    maxResponseTime: 5000,
    minCacheHitRatio: 0.7,
    maxErrorRate: 0.05,
    maxMemoryUsage: 500
  };
  
  const activeThresholds = { ...defaultThresholds, ...thresholds };
  
  // Response time alert
  if (currentMetrics.apiCalls.averageResponseTime > activeThresholds.maxResponseTime) {
    alerts.push({
      severity: 'high' as const,
      type: 'performance',
      message: 'API response times are above acceptable threshold',
      metric: 'averageResponseTime',
      currentValue: currentMetrics.apiCalls.averageResponseTime,
      threshold: activeThresholds.maxResponseTime,
      timestamp: new Date().toISOString()
    });
  }
  
  // Cache hit ratio alert
  if (currentMetrics.apiCalls.cacheHitRatio < activeThresholds.minCacheHitRatio) {
    alerts.push({
      severity: 'medium' as const,
      type: 'cache',
      message: 'Cache hit ratio is below optimal level',
      metric: 'cacheHitRatio',
      currentValue: currentMetrics.apiCalls.cacheHitRatio,
      threshold: activeThresholds.minCacheHitRatio,
      timestamp: new Date().toISOString()
    });
  }
  
  // Error rate alert
  if (currentMetrics.apiCalls.errorRate > activeThresholds.maxErrorRate) {
    alerts.push({
      severity: 'critical' as const,
      type: 'error',
      message: 'API error rate is above acceptable threshold',
      metric: 'errorRate',
      currentValue: currentMetrics.apiCalls.errorRate,
      threshold: activeThresholds.maxErrorRate,
      timestamp: new Date().toISOString()
    });
  }
  
  return alerts;
}

interface ToolUsageMetrics {
  toolId: string;
  averageTime: number;
  executions?: number;
  efficiency?: number;
  successRate?: number;
  lastUsed?: string;
}

interface ToolUsage {
  totalExecutions: number;
  mostUsedTools: Array<ToolUsageMetrics>;
  performanceLeaders?: Array<ToolUsageMetrics>;
}

interface Alert {
  severity: string;
  type: string;
  message: string;
  metric: string;
  currentValue: number;
  threshold: number;
  timestamp: string;
}

function generateOptimizationRecommendations(currentMetrics: CurrentMetrics, toolUsage?: ToolUsage, alerts?: Alert[]) {
  const recommendations = [];
  
  // Cache optimization
  if (currentMetrics.apiCalls.cacheHitRatio < 0.8) {
    recommendations.push({
      category: 'cache' as const,
      priority: 'medium' as const,
      title: 'Improve Cache Hit Ratio',
      description: 'Current cache hit ratio is suboptimal. Consider extending cache TTL for stable data.',
      expectedImpact: '20-30% reduction in API calls',
      implementation: 'Adjust cache TTL settings in cache.ts configuration'
    });
  }
  
  // API performance optimization
  if (currentMetrics.apiCalls.averageResponseTime > 2000) {
    recommendations.push({
      category: 'api' as const,
      priority: 'high' as const,
      title: 'Optimize API Response Times',
      description: 'API response times are elevated. Consider request batching or query optimization.',
      expectedImpact: '40-50% improvement in response times',
      implementation: 'Implement request batching for bulk operations'
    });
  }
  
  // Tool usage optimization
  if (toolUsage?.performanceLeaders && toolUsage.performanceLeaders.length > 0) {
    const slowestTool = toolUsage.mostUsedTools
      .sort((a, b) => b.averageTime - a.averageTime)[0];
    
    if (slowestTool?.averageTime > 5000) {
      recommendations.push({
        category: 'tools' as const,
        priority: 'medium' as const,
        title: `Optimize ${slowestTool.toolId} Performance`,
        description: `${slowestTool.toolId} has high average execution time. Consider optimization.`,
        expectedImpact: '30-40% reduction in tool execution time',
        implementation: 'Review tool logic and add caching or optimize database queries'
      });
    }
  }
  
  // System health recommendations
  const memoryMB = parseInt(currentMetrics.systemHealth.memoryUsage.replace(' MB', ''));
  if (memoryMB > 200) {
    recommendations.push({
      category: 'system' as const,
      priority: 'low' as const,
      title: 'Monitor Memory Usage',
      description: 'Memory usage is elevated. Consider implementing memory optimization.',
      expectedImpact: '15-20% reduction in memory footprint',
      implementation: 'Implement garbage collection optimization and reduce object retention'
    });
  }
  
  // Alert-based recommendations
  if (alerts && alerts.length > 0) {
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
    const highAlerts = alerts.filter(alert => alert.severity === 'high');
    
    if (criticalAlerts.length > 0) {
      recommendations.push({
        category: 'system' as const,
        priority: 'high' as const,
        title: 'Address Critical Performance Issues',
        description: `${criticalAlerts.length} critical alert${criticalAlerts.length > 1 ? 's' : ''} detected. Immediate attention required.`,
        expectedImpact: 'Prevent system degradation or failure',
        implementation: 'Review and resolve critical alerts immediately'
      });
    }
    
    if (highAlerts.length > 0) {
      recommendations.push({
        category: 'system' as const,
        priority: 'medium' as const,
        title: 'Resolve High Priority Alerts',
        description: `${highAlerts.length} high priority alert${highAlerts.length > 1 ? 's' : ''} need attention.`,
        expectedImpact: 'Improved system stability and performance',
        implementation: 'Schedule time to address high priority performance issues'
      });
    }
  }
  
  return recommendations;
}

interface Trends {
  apiPerformance: Array<{ timestamp: string; averageResponseTime: number; callCount: number; errorRate: number }>;
  cacheEfficiency: Array<{ timestamp: string; hitRatio: number; keyCount: number }>;
}

// Performance metrics export data structure
interface PerformanceMetrics {
  currentMetrics: CurrentMetrics;
  trends?: Trends;
  toolUsage?: ToolUsage;
  alerts?: Alert[];
  timestamp: string;
}

function generatePerformanceInsights(currentMetrics: CurrentMetrics, trends?: Trends, toolUsage?: ToolUsage, alerts?: Alert[]) {
  const insights = [];
  
  // Cache performance insights
  if (currentMetrics.cacheStats.hitRatio > 0.9) {
    insights.push('Excellent cache performance - hit ratio above 90%');
  } else if (currentMetrics.cacheStats.hitRatio > 0.7) {
    insights.push('Good cache performance - room for improvement');
  } else {
    insights.push('Cache performance needs attention - hit ratio below 70%');
  }
  
  // API performance insights
  if (currentMetrics.apiCalls.averageResponseTime < 1000) {
    insights.push('API response times are excellent (< 1s average)');
  } else if (currentMetrics.apiCalls.averageResponseTime < 3000) {
    insights.push('API response times are acceptable but could be optimized');
  } else {
    insights.push('API response times need immediate attention');
  }
  
  // System health insights
  if (alerts?.length === 0) {
    insights.push('System health is optimal - no active alerts');
  } else {
    const criticalAlerts = alerts?.filter(alert => alert.severity === 'critical').length || 0;
    if (criticalAlerts > 0) {
      insights.push(`${criticalAlerts} critical performance issue${criticalAlerts > 1 ? 's' : ''} detected`);
    }
  }
  
  // Tool usage insights
  if (toolUsage) {
    const totalTools = toolUsage.mostUsedTools.length;
    const activeTools = toolUsage.mostUsedTools.filter(tool => 
      tool.lastUsed && Date.now() - new Date(tool.lastUsed).getTime() < 86400000
    ).length;
    
    insights.push(`${activeTools}/${totalTools} tools used in the last 24 hours`);
    
    if (toolUsage.performanceLeaders && toolUsage.performanceLeaders.length > 0) {
      const topPerformer = toolUsage.performanceLeaders[0];
      insights.push(`${topPerformer.toolId} is the most efficient tool with ${topPerformer.efficiency} efficiency rating`);
    }
  }
  
  return insights;
}

async function exportPerformanceMetrics(data: PerformanceMetrics): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const exportDir = path.join(process.cwd(), 'exports');
  const exportPath = path.join(exportDir, `performance-metrics-${timestamp}.json`);
  
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  
  fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));
  return exportPath;
}

async function generatePerformanceReport(data: {
  monitoringType: string;
  currentMetrics: CurrentMetrics;
  trends?: Trends;
  toolUsage?: ToolUsage;
  alerts?: Alert[];
  recommendations?: Array<{
    category: string;
    priority: string;
    title: string;
    description: string;
    expectedImpact: string;
    implementation: string;
  }>;
  insights?: string[];
}): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportsDir = path.join(process.cwd(), 'reports');
  const reportPath = path.join(reportsDir, `performance-report-${timestamp}.md`);
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  let report = '# Performance Monitoring Report\n';
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  report += '## System Health Overview\n';
  report += `- Status: ${data.currentMetrics.systemHealth.status.toUpperCase()}\n`;
  report += `- Uptime: ${data.currentMetrics.systemHealth.uptime}\n`;
  report += `- Memory Usage: ${data.currentMetrics.systemHealth.memoryUsage}\n\n`;
  
  report += '## API Performance\n';
  report += `- Recent Calls: ${data.currentMetrics.apiCalls.recentCount}\n`;
  report += `- Average Response Time: ${data.currentMetrics.apiCalls.averageResponseTime}ms\n`;
  report += `- Cache Hit Ratio: ${(data.currentMetrics.apiCalls.cacheHitRatio * 100).toFixed(1)}%\n`;
  report += `- Error Rate: ${(data.currentMetrics.apiCalls.errorRate * 100).toFixed(1)}%\n\n`;
  
  if (data.alerts && data.alerts.length > 0) {
    report += `## Active Alerts (${data.alerts.length})\n`;
    data.alerts.forEach((alert, index) => {
      report += `${index + 1}. **${alert.severity.toUpperCase()}**: ${alert.message}\n`;
      report += `   - Metric: ${alert.metric}\n`;
      report += `   - Current: ${alert.currentValue}, Threshold: ${alert.threshold}\n\n`;
    });
  }
  
  if (data.recommendations && data.recommendations.length > 0) {
    report += '## Optimization Recommendations\n';
    data.recommendations.forEach((rec, index) => {
      report += `### ${index + 1}. ${rec.title} (${rec.priority.toUpperCase()})\n`;
      report += `- **Category**: ${rec.category}\n`;
      report += `- **Description**: ${rec.description}\n`;
      report += `- **Expected Impact**: ${rec.expectedImpact}\n`;
      report += `- **Implementation**: ${rec.implementation}\n\n`;
    });
  }
  
  if (data.insights && data.insights.length > 0) {
    report += '## Key Insights\n';
    data.insights.forEach((insight, index) => {
      report += `${index + 1}. ${insight}\n`;
    });
  }
  
  fs.writeFileSync(reportPath, report);
  return reportPath;
}

// Utility functions
function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) {return '0 Bytes';}
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {return `${days}d ${hours % 24}h`;}
  if (hours > 0) {return `${hours}h ${minutes % 60}m`;}
  if (minutes > 0) {return `${minutes}m ${seconds % 60}s`;}
  return `${seconds}s`;
}

function determineSystemHealth(avgResponseTime: number, errorRate: number, cacheHitRatio: number, apiHealthy: boolean = true): string {
  if (!apiHealthy || errorRate > 0.1 || avgResponseTime > 10000) {return 'critical';}
  if (errorRate > 0.05 || avgResponseTime > 5000 || cacheHitRatio < 0.5) {return 'warning';}
  return 'healthy';
}

// Export performance tracker for other modules to use
export { performanceTracker };