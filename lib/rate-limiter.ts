// Rate limiting system for API protection
import { logger } from './logger'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: any) => string
  onLimitReached?: (key: string) => void
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    let removedCount = 0

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
        removedCount++
      }
    }

    if (removedCount > 0) {
      logger.debug(`Rate limiter cleanup: removed ${removedCount} expired entries`)
    }
  }

  check(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const windowStart = now
    const windowEnd = now + config.windowMs

    let entry = this.store.get(key)

    // If no entry exists or window has expired, create new entry
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: windowEnd
      }
      this.store.set(key, entry)

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: windowEnd
      }
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      config.onLimitReached?.(key)
      logger.warn(`Rate limit exceeded for key: ${key}`, { 
        count: entry.count, 
        maxRequests: config.maxRequests,
        resetTime: entry.resetTime
      })

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    // Increment count
    entry.count++
    this.store.set(key, entry)

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }

  reset(key: string) {
    this.store.delete(key)
  }

  getStats() {
    return {
      totalKeys: this.store.size,
      entries: Array.from(this.store.entries()).map(([key, entry]) => ({
        key,
        count: entry.count,
        resetTime: entry.resetTime
      }))
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.store.clear()
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter()

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // General API requests
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyGenerator: (req: any) => req.ip || 'anonymous'
  },

  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (req: any) => req.ip || 'anonymous'
  },

  // Search endpoints
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    keyGenerator: (req: any) => req.ip || 'anonymous'
  },

  // User-specific actions
  userActions: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    keyGenerator: (req: any) => req.user?.id || req.ip || 'anonymous'
  },

  // Admin actions
  admin: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50,
    keyGenerator: (req: any) => req.user?.id || req.ip || 'anonymous'
  },

  // File uploads
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    keyGenerator: (req: any) => req.user?.id || req.ip || 'anonymous'
  },

  // Password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    keyGenerator: (req: any) => req.ip || 'anonymous'
  }
}

// Middleware function for Next.js API routes
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return (req: any, res: any, next?: () => void) => {
    const key = config.keyGenerator ? config.keyGenerator(req) : req.ip || 'anonymous'
    const result = rateLimiter.check(key, config)

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests)
    res.setHeader('X-RateLimit-Remaining', result.remaining)
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000))

    if (!result.allowed) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      })
      return
    }

    if (next) {
      next()
    }
  }
}

// Client-side rate limiting for frontend
export class ClientRateLimiter {
  private requests = new Map<string, number[]>()

  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const windowStart = now - windowMs

    // Get existing requests for this key
    let requests = this.requests.get(key) || []

    // Filter out requests outside the window
    requests = requests.filter(timestamp => timestamp > windowStart)

    // Check if limit would be exceeded
    if (requests.length >= maxRequests) {
      return false
    }

    // Add current request
    requests.push(now)
    this.requests.set(key, requests)

    return true
  }

  reset(key: string) {
    this.requests.delete(key)
  }

  cleanup() {
    const now = Date.now()
    const maxAge = 60 * 60 * 1000 // 1 hour

    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => now - timestamp < maxAge)
      
      if (validRequests.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, validRequests)
      }
    }
  }
}

// Export client rate limiter instance
export const clientRateLimiter = new ClientRateLimiter()

// Utility functions
export function getRateLimitKey(type: 'ip' | 'user' | 'session', identifier: string): string {
  return `${type}:${identifier}`
}

export function formatRateLimitError(resetTime: number): string {
  const seconds = Math.ceil((resetTime - Date.now()) / 1000)
  const minutes = Math.floor(seconds / 60)
  
  if (minutes > 0) {
    return `Rate limit exceeded. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`
  } else {
    return `Rate limit exceeded. Try again in ${seconds} second${seconds !== 1 ? 's' : ''}.`
  }
}

// Rate limiting for specific anime API calls
export const animeApiLimiter = {
  search: (userId?: string) => {
    const key = userId ? getRateLimitKey('user', userId) : getRateLimitKey('ip', 'anonymous')
    return rateLimiter.check(key, rateLimitConfigs.search)
  },

  details: (userId?: string) => {
    const key = userId ? getRateLimitKey('user', userId) : getRateLimitKey('ip', 'anonymous')
    return rateLimiter.check(key, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60, // Higher limit for details
      keyGenerator: () => key
    })
  },

  recommendations: (userId?: string) => {
    const key = userId ? getRateLimitKey('user', userId) : getRateLimitKey('ip', 'anonymous')
    return rateLimiter.check(key, {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 10, // Lower limit for expensive operations
      keyGenerator: () => key
    })
  }
}

// Distributed rate limiting (for production with Redis)
export class DistributedRateLimiter {
  private redis: any // Redis client would be injected

  constructor(redisClient?: any) {
    this.redis = redisClient
  }

  async check(key: string, config: RateLimitConfig): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    if (!this.redis) {
      // Fallback to in-memory limiter
      return rateLimiter.check(key, config)
    }

    const now = Date.now()
    const window = Math.floor(now / config.windowMs)
    const redisKey = `rate_limit:${key}:${window}`

    try {
      const current = await this.redis.incr(redisKey)
      
      if (current === 1) {
        await this.redis.expire(redisKey, Math.ceil(config.windowMs / 1000))
      }

      const resetTime = (window + 1) * config.windowMs

      return {
        allowed: current <= config.maxRequests,
        remaining: Math.max(0, config.maxRequests - current),
        resetTime
      }
    } catch (error) {
      logger.error('Distributed rate limiter error', { error, key })
      // Fallback to allowing the request
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs
      }
    }
  }
}
