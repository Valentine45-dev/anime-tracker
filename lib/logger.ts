// Comprehensive logging system for production
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  userId?: string
  sessionId?: string
  stack?: string
}

class Logger {
  private logLevel: LogLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: context?.userId,
      sessionId: context?.sessionId,
      stack: level >= LogLevel.ERROR ? new Error().stack : undefined
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Console output for development
    if (process.env.NODE_ENV !== 'production') {
      const levelName = LogLevel[entry.level]
      console.log(`[${entry.timestamp}] ${levelName}: ${entry.message}`, entry.context || '')
    }

    // In production, you might want to send to external logging service
    if (process.env.NODE_ENV === 'production' && entry.level >= LogLevel.ERROR) {
      this.sendToExternalLogger(entry)
    }
  }

  private async sendToExternalLogger(entry: LogEntry) {
    // Placeholder for external logging service integration
    // Could integrate with services like Sentry, LogRocket, etc.
    try {
      // Example: await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) })
    } catch (error) {
      console.error('Failed to send log to external service:', error)
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.addLog(this.formatMessage(LogLevel.DEBUG, message, context))
    }
  }

  info(message: string, context?: Record<string, any>) {
    if (this.shouldLog(LogLevel.INFO)) {
      this.addLog(this.formatMessage(LogLevel.INFO, message, context))
    }
  }

  warn(message: string, context?: Record<string, any>) {
    if (this.shouldLog(LogLevel.WARN)) {
      this.addLog(this.formatMessage(LogLevel.WARN, message, context))
    }
  }

  error(message: string, context?: Record<string, any>) {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.addLog(this.formatMessage(LogLevel.ERROR, message, context))
    }
  }

  critical(message: string, context?: Record<string, any>) {
    if (this.shouldLog(LogLevel.CRITICAL)) {
      this.addLog(this.formatMessage(LogLevel.CRITICAL, message, context))
    }
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count)
  }

  // Clear logs
  clearLogs() {
    this.logs = []
  }

  // Set log level dynamically
  setLogLevel(level: LogLevel) {
    this.logLevel = level
  }
}

// Export singleton instance
export const logger = new Logger()

// Utility functions for common logging patterns
export const logApiCall = (endpoint: string, method: string, userId?: string) => {
  logger.info(`API call: ${method} ${endpoint}`, { endpoint, method, userId })
}

export const logApiError = (endpoint: string, method: string, error: any, userId?: string) => {
  logger.error(`API error: ${method} ${endpoint}`, { 
    endpoint, 
    method, 
    error: error.message || error,
    userId 
  })
}

export const logUserAction = (action: string, userId: string, details?: Record<string, any>) => {
  logger.info(`User action: ${action}`, { action, userId, ...details })
}

export const logDatabaseOperation = (operation: string, table: string, success: boolean, error?: any) => {
  if (success) {
    logger.debug(`Database operation: ${operation} on ${table}`, { operation, table })
  } else {
    logger.error(`Database operation failed: ${operation} on ${table}`, { 
      operation, 
      table, 
      error: error?.message || error 
    })
  }
}
