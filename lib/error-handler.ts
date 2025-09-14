// Centralized error handling utilities

export interface AppError extends Error {
  code?: string
  statusCode?: number
  context?: Record<string, any>
}

export class DatabaseError extends Error implements AppError {
  code = 'DATABASE_ERROR'
  statusCode = 500
  context: Record<string, any>

  constructor(message: string, context?: Record<string, any>) {
    super(message)
    this.name = 'DatabaseError'
    this.context = context || {}
  }
}

export class ValidationError extends Error implements AppError {
  code = 'VALIDATION_ERROR'
  statusCode = 400
  context: Record<string, any>

  constructor(message: string, context?: Record<string, any>) {
    super(message)
    this.name = 'ValidationError'
    this.context = context || {}
  }
}

export class AuthenticationError extends Error implements AppError {
  code = 'AUTHENTICATION_ERROR'
  statusCode = 401
  context: Record<string, any>

  constructor(message: string, context?: Record<string, any>) {
    super(message)
    this.name = 'AuthenticationError'
    this.context = context || {}
  }
}

export class AuthorizationError extends Error implements AppError {
  code = 'AUTHORIZATION_ERROR'
  statusCode = 403
  context: Record<string, any>

  constructor(message: string, context?: Record<string, any>) {
    super(message)
    this.name = 'AuthorizationError'
    this.context = context || {}
  }
}

export class NotFoundError extends Error implements AppError {
  code = 'NOT_FOUND_ERROR'
  statusCode = 404
  context: Record<string, any>

  constructor(message: string, context?: Record<string, any>) {
    super(message)
    this.name = 'NotFoundError'
    this.context = context || {}
  }
}

export class RateLimitError extends Error implements AppError {
  code = 'RATE_LIMIT_ERROR'
  statusCode = 429
  context: Record<string, any>

  constructor(message: string, context?: Record<string, any>) {
    super(message)
    this.name = 'RateLimitError'
    this.context = context || {}
  }
}

// Error handler function
export function handleError(error: unknown): AppError {
  // If it's already an AppError, return it
  if (error instanceof Error && 'code' in error) {
    return error as AppError
  }

  // Handle Supabase errors
  if (error && typeof error === 'object' && 'message' in error) {
    const supabaseError = error as any
    
    // Map common Supabase error codes
    switch (supabaseError.code) {
      case 'PGRST116':
        return new NotFoundError('Resource not found', { originalError: supabaseError })
      case '23505':
        return new ValidationError('Duplicate entry', { originalError: supabaseError })
      case '23503':
        return new ValidationError('Foreign key constraint violation', { originalError: supabaseError })
      case '42501':
        return new AuthorizationError('Insufficient permissions', { originalError: supabaseError })
      default:
        return new DatabaseError(supabaseError.message || 'Database error occurred', { 
          originalError: supabaseError 
        })
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return new DatabaseError(error.message, { originalError: error })
  }

  // Handle unknown error types
  return new DatabaseError('An unknown error occurred', { originalError: error })
}

// Error logging utility
export function logError(error: AppError, context?: Record<string, any>) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    code: error.code,
    message: error.message,
    stack: error.stack,
    context: { ...error.context, ...context },
    statusCode: error.statusCode,
  }

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorLog)
  }

  // In production, you would send this to your error reporting service
  // Example: Sentry.captureException(error, { extra: errorLog })
  
  // For now, we'll just log to console in production too
  console.error('Error logged:', errorLog)
}

// Error response formatter
export function formatErrorResponse(error: AppError) {
  return {
    error: {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        context: error.context,
      }),
    },
  }
}

// Async error wrapper for API routes
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      const appError = handleError(error)
      logError(appError)
      throw appError
    }
  }
}

// React hook for error handling
export function useErrorHandler() {
  return (error: unknown, context?: Record<string, any>) => {
    const appError = handleError(error)
    logError(appError, context)
    throw appError
  }
}