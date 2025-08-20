/**
 * Application Insights telemetry integration
 * Provides monitoring, logging, and performance tracking
 */

import * as appInsights from 'applicationinsights';
import { TelemetryClient } from 'applicationinsights';

let telemetryClient: TelemetryClient | null = null;
let isInitialized = false;

/**
 * Initialize Application Insights
 */
export function initializeTelemetry(): void {
  if (isInitialized) {
    return;
  }

  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    
  if (!connectionString) {
    console.warn('Application Insights connection string not found. Telemetry disabled.');
    return;
  }

  try {
    // Check if Application Insights is already initialized by App Service
    if (appInsights.defaultClient) {
      console.log('Application Insights already initialized by Azure App Service');
      telemetryClient = appInsights.defaultClient;
      isInitialized = true;
      return;
    }

    // Setup Application Insights manually
    appInsights.setup(connectionString)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true, true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true)
      .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C);

    // Start collecting telemetry
    appInsights.start();

    // Get the default client
    telemetryClient = appInsights.defaultClient;

    // Set custom properties for all telemetry (with null check)
    if (telemetryClient) {
      try {
        const client = telemetryClient as any;
        if (client.context && client.context.tags && client.context.keys) {
          client.context.tags[client.context.keys.applicationVersion] = process.env.npm_package_version || '1.0.0';
          client.context.tags[client.context.keys.cloudRole] = 'WorkbookTeamsBot';
        }
      } catch (contextError) {
        console.warn('Could not set telemetry context properties:', contextError);
      }
    }
        
    isInitialized = true;
    console.log('Application Insights initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Application Insights:', error);
    // Continue without telemetry rather than crashing
    isInitialized = true; // Mark as initialized to prevent retry loops
  }
}

/**
 * Track a custom event
 */
export function trackEvent(name: string, properties?: Record<string, unknown>, measurements?: Record<string, number>): void {
  if (!telemetryClient) {
    return;
  }

  telemetryClient.trackEvent({
    name,
    properties,
    measurements
  });
}

/**
 * Track an exception
 */
export function trackException(error: Error, properties?: Record<string, unknown>): void {
  if (!telemetryClient) {
    console.error('Exception (telemetry disabled):', error);
    return;
  }

  telemetryClient.trackException({
    exception: error,
    properties
  });
}

/**
 * Track a metric
 */
export function trackMetric(name: string, value: number, properties?: Record<string, unknown>): void {
  if (!telemetryClient) {
    return;
  }

  telemetryClient.trackMetric({
    name,
    value,
    properties
  });
}

/**
 * Track a dependency call (e.g., Workbook API)
 */
export function trackDependency(
  name: string,
  data: string,
  duration: number,
  success: boolean,
  resultCode: string | number,
  dependencyType: string = 'HTTP'
): void {
  if (!telemetryClient) {
    return;
  }

  telemetryClient.trackDependency({
    name,
    data,
    duration,
    success,
    resultCode,
    dependencyTypeName: dependencyType
  });
}

/**
 * Track a trace message
 */
export function trackTrace(message: string, severity?: number, properties?: Record<string, unknown>): void {
  if (!telemetryClient) {
    console.log('Trace (telemetry disabled):', message);
    return;
  }

  telemetryClient.trackTrace({
    message,
    properties
  });
}

/**
 * Track user activity
 */
export function trackUserActivity(userId: string, activity: string, properties?: Record<string, unknown>): void {
  trackEvent(`User.${activity}`, {
    userId,
    ...properties
  });
}

/**
 * Track tool usage
 */
export function trackToolUsage(toolName: string, success: boolean, duration: number, properties?: Record<string, unknown>): void {
  trackEvent('Tool.Usage', {
    toolName,
    success: success.toString(),
    ...properties
  }, {
    duration
  });

  // Also track as metric for aggregation
  trackMetric(`Tool.${toolName}.Duration`, duration);
  trackMetric(`Tool.${toolName}.SuccessRate`, success ? 1 : 0);
}

/**
 * Track API performance
 */
export function trackApiPerformance(endpoint: string, method: string, statusCode: number, duration: number): void {
  const success = statusCode >= 200 && statusCode < 300;
    
  trackDependency(
    `Workbook API: ${method} ${endpoint}`,
    endpoint,
    duration,
    success,
    statusCode
  );

  // Track as metric for dashboards
  trackMetric('API.ResponseTime', duration, {
    endpoint,
    method,
    statusCode: statusCode.toString()
  });
}

/**
 * Track cache performance
 */
export function trackCachePerformance(operation: 'hit' | 'miss' | 'set' | 'clear', key: string): void {
  trackEvent('Cache.Operation', {
    operation,
    key
  });

  // Track cache hit rate
  if (operation === 'hit' || operation === 'miss') {
    trackMetric('Cache.HitRate', operation === 'hit' ? 1 : 0);
  }
}

/**
 * Track security events
 */
export function trackSecurityEvent(eventType: string, details: Record<string, unknown>): void {
  trackEvent('Security.Event', {
    eventType,
    ...details
  });

  // Log to console for immediate visibility
  console.warn(`Security Event: ${eventType}`, details);
}

/**
 * Flush telemetry before shutdown
 */
export async function flushTelemetry(): Promise<void> {
  if (!telemetryClient) {
    return;
  }

  return new Promise((resolve) => {
        telemetryClient!.flush();
        console.log('Telemetry flushed');
        resolve();
  });
}

/**
 * Create a telemetry context for a conversation
 */
export function createConversationContext(conversationId: string, userId: string): Record<string, unknown> {
  return {
    conversationId,
    userId,
    timestamp: new Date().toISOString()
  };
}

// Export severity levels for convenience
export const SeverityLevel = {
  Verbose: 0,
  Information: 1,
  Warning: 2,
  Error: 3,
  Critical: 4
};