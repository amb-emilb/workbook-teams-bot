import winston from 'winston';
import Transport from 'winston-transport';
import * as appInsights from 'applicationinsights';
import { KnownSeverityLevel } from 'applicationinsights/out/src/declarations/generated/models/index.js';

/**
 * Custom Winston transport for Application Insights
 */
class ApplicationInsightsTransport extends Transport {
  constructor(opts?: Transport.TransportStreamOptions) {
    super(opts);
  }

  log(info: winston.LogEntry, callback: () => void) {
    process.nextTick(() => {
      this.emit('logged', info);
    });

    // Send to Application Insights if available
    const client = appInsights.defaultClient;
    if (client) {
      const { level, message, ...meta } = info;

      // Map Winston levels to Application Insights severity
      switch (level) {
      case 'error':
        client.trackException({ 
          exception: new Error(message),
          properties: meta,
          severity: KnownSeverityLevel.Error
        });
        break;
      case 'warn':
        client.trackTrace({
          message,
          severity: KnownSeverityLevel.Warning,
          properties: meta
        });
        break;
      case 'info':
        client.trackTrace({
          message,
          severity: KnownSeverityLevel.Information,
          properties: meta
        });
        break;
      case 'debug':
      case 'verbose':
        client.trackTrace({
          message,
          severity: KnownSeverityLevel.Verbose,
          properties: meta
        });
        break;
      default:
        client.trackTrace({
          message,
          properties: meta
        });
      }
    }

    callback();
  }
}

/**
 * Logger configuration and initialization
 */
class Logger {
  private logger: winston.Logger;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // Configure log format
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    );

    // Console format for development
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}]: ${message} ${metaString}`;
      })
    );

    // Create transports array
    const transports: winston.transport[] = [];

    // Always add console transport
    transports.push(
      new winston.transports.Console({
        format: this.isProduction ? logFormat : consoleFormat,
        level: process.env.LOG_LEVEL || (this.isProduction ? 'info' : 'debug')
      })
    );

    // Add Application Insights transport if configured
    if (appInsights.defaultClient) {
      transports.push(new ApplicationInsightsTransport({
        level: process.env.LOG_LEVEL || 'info'
      }));
    }

    // Create the logger
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || (this.isProduction ? 'info' : 'debug'),
      format: logFormat,
      defaultMeta: { 
        service: 'workbook-teams-bot',
        environment: process.env.NODE_ENV || 'development'
      },
      transports
    });
  }

  /**
   * Log levels
   */
  public error(message: string, meta?: Record<string, unknown>) {
    this.logger.error(message, meta);
  }

  public warn(message: string, meta?: Record<string, unknown>) {
    this.logger.warn(message, meta);
  }

  public info(message: string, meta?: Record<string, unknown>) {
    this.logger.info(message, meta);
  }

  public debug(message: string, meta?: Record<string, unknown>) {
    this.logger.debug(message, meta);
  }

  public verbose(message: string, meta?: Record<string, unknown>) {
    this.logger.verbose(message, meta);
  }

  /**
   * Log HTTP requests
   */
  public logRequest(method: string, url: string, statusCode?: number, duration?: number) {
    this.info('HTTP Request', {
      method,
      url,
      statusCode,
      duration,
      type: 'http_request'
    });
  }

  /**
   * Log bot messages
   */
  public logBotMessage(userId: string, message: string, response?: string) {
    this.info('Bot Message', {
      userId,
      message: message.substring(0, 100), // Truncate for privacy
      responseLength: response?.length,
      type: 'bot_message'
    });
  }

  /**
   * Log tool usage
   */
  public logToolUsage(toolName: string, params: Record<string, unknown>, duration: number, success: boolean) {
    this.info('Tool Usage', {
      toolName,
      params: JSON.stringify(params).substring(0, 200), // Truncate for privacy
      duration,
      success,
      type: 'tool_usage'
    });
  }

  /**
   * Log performance metrics
   */
  public logPerformance(operation: string, duration: number, metadata?: Record<string, unknown>) {
    this.info('Performance', {
      operation,
      duration,
      ...metadata,
      type: 'performance'
    });
  }

  /**
   * Log security events
   */
  public logSecurity(event: string, details: Record<string, unknown>) {
    this.warn('Security Event', {
      event,
      details,
      type: 'security'
    });
  }

  /**
   * Create child logger with additional context
   */
  public child(meta: Record<string, unknown>): winston.Logger {
    return this.logger.child(meta);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for dependency injection
export type ILogger = Logger;