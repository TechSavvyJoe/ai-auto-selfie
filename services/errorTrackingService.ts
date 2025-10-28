/**
 * Error Tracking Service
 * Centralizes error logging, reporting, and monitoring
 * Supports development and production environments
 */

export interface ErrorLog {
  timestamp: number;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
  userAgent?: string;
  url?: string;
}

class ErrorTrackingService {
  private errorLogs: ErrorLog[] = [];
  private maxLogs = 50;
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log an error with context
   */
  logError(error: Error | string, context?: Record<string, any>, severity: ErrorLog['severity'] = 'error'): void {
    const errorLog: ErrorLog = {
      timestamp: Date.now(),
      message: typeof error === 'string' ? error : error.message,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      severity,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.errorLogs.push(errorLog);

    // Keep only recent logs
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (this.isDevelopment) {
      const logLevel = severity === 'critical' ? 'error' : severity;
      console[logLevel as 'error' | 'warn' | 'info']({
        message: errorLog.message,
        stack: errorLog.stack,
        context: errorLog.context,
      });
    }

    // Send critical errors to monitoring service (Sentry, DataDog, etc.)
    if (severity === 'critical') {
      this.sendToMonitoringService(errorLog);
    }
  }

  /**
   * Log warning
   */
  logWarning(message: string, context?: Record<string, any>): void {
    this.logError(message, context, 'warning');
  }

  /**
   * Log info
   */
  logInfo(message: string, context?: Record<string, any>): void {
    this.logError(message, context, 'info');
  }

  /**
   * Get all logged errors
   */
  getLogs(): ErrorLog[] {
    return [...this.errorLogs];
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.errorLogs = [];
  }

  /**
   * Send error to monitoring service
   */
  private sendToMonitoringService(errorLog: ErrorLog): void {
    // This would integrate with services like:
    // - Sentry
    // - DataDog
    // - LogRocket
    // - New Relic
    // For now, we'll just log it
    if (!this.isDevelopment) {
      // TODO: Implement actual error monitoring integration
      // Example:
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorLog),
      // });
    }
  }

  /**
   * Set up global error handlers
   */
  setupGlobalHandlers(): void {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.logError(event.error || event.message, {
        type: 'uncaughtError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }, 'critical');
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(event.reason || 'Unhandled Promise Rejection', {
        type: 'unhandledRejection',
      }, 'critical');
    });
  }
}

let instance: ErrorTrackingService | null = null;

export const getErrorTrackingService = (): ErrorTrackingService => {
  if (!instance) {
    instance = new ErrorTrackingService();
    instance.setupGlobalHandlers();
  }
  return instance;
};

export default ErrorTrackingService;
