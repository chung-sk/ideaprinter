/**
 * Logging utilities for Idea Printer
 * Provides structured logging for generation requests, errors, and performance metrics
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

/**
 * Logger class for structured logging
 */
class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };

    // Add to logs array
    this.logs.push(entry);

    // Trim logs if exceeded max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    const consoleMessage = `[${entry.timestamp}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'debug':
        console.debug(consoleMessage, context || '', error || '');
        break;
      case 'info':
        console.info(consoleMessage, context || '');
        break;
      case 'warn':
        console.warn(consoleMessage, context || '', error || '');
        break;
      case 'error':
        console.error(consoleMessage, context || '', error || '');
        break;
    }

    // In production, send to analytics/monitoring service
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(entry);
    }
  }

  private sendToAnalytics(entry: LogEntry) {
    // Placeholder for analytics integration (e.g., Google Analytics, Sentry)
    // Implementation depends on chosen analytics service
    
    // Example: Send to custom analytics endpoint
    if (entry.level === 'error' || entry.level === 'warn') {
      // In production, you would send this to your analytics service
      console.log('[Analytics]', entry);
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log('warn', message, context, error);
  }

  error(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log('error', message, context, error);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton logger instance
export const logger = new Logger();

/**
 * Log generation request
 */
export function logGenerationRequest(context: {
  requestId: string;
  category?: string;
  apiKeySource: 'default' | 'user_provided';
  startTime: number;
}) {
  logger.info('Idea generation requested', context);
}

/**
 * Log generation success
 */
export function logGenerationSuccess(context: {
  requestId: string;
  ideaId: string;
  category: string;
  durationMs: number;
  apiKeySource: 'default' | 'user_provided';
}) {
  logger.info('Idea generation successful', context);
}

/**
 * Log generation failure
 */
export function logGenerationFailure(context: {
  requestId: string;
  errorMessage: string;
  durationMs: number;
  apiKeySource: 'default' | 'user_provided';
}, error?: Error) {
  logger.error('Idea generation failed', context, error);
}

/**
 * Log API errors
 */
export function logApiError(context: {
  endpoint: string;
  method: string;
  statusCode?: number;
  errorMessage: string;
}, error?: Error) {
  logger.error('API error', context, error);
}

/**
 * Log performance metrics
 */
export function logPerformanceMetric(context: {
  metric: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  details?: Record<string, unknown>;
}) {
  logger.info('Performance metric', context);
}

/**
 * Log user action
 */
export function logUserAction(context: {
  action: string;
  details?: Record<string, unknown>;
}) {
  logger.debug('User action', context);
}

/**
 * Get performance metrics summary
 */
export function getPerformanceMetrics(): {
  averageGenerationTime?: number;
  totalRequests: number;
  failedRequests: number;
  successRate: number;
} {
  const logs = logger.getLogs();
  
  const generationLogs = logs.filter(log => 
    log.message === 'Idea generation successful' || log.message === 'Idea generation failed'
  );

  const totalRequests = generationLogs.length;
  const failedRequests = generationLogs.filter(log => log.message === 'Idea generation failed').length;
  const successfulRequests = totalRequests - failedRequests;
  const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

  const durations = generationLogs
    .filter(log => log.context?.durationMs)
    .map(log => log.context!.durationMs as number);

  const averageGenerationTime = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : undefined;

  return {
    averageGenerationTime,
    totalRequests,
    failedRequests,
    successRate,
  };
}
