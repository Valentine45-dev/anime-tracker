// Comprehensive caching system for better performance
import { logger } from './logger'

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
  serialize?: boolean // Whether to serialize data
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes
  private maxSize = 1000
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Start cleanup interval
    this.startCleanup()
  }

  private startCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60 * 1000) // Cleanup every minute
  }

  private cleanup() {
    const now = Date.now()
    let removedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        removedCount++
      }
    }

    if (removedCount > 0) {
      logger.debug(`Cache cleanup: removed ${removedCount} expired entries`)
    }

    // If cache is still too large, remove oldest entries
    if (this.cache.size > this.maxSize) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toRemove = this.cache.size - this.maxSize
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0])
      }
      
      logger.debug(`Cache cleanup: removed ${toRemove} oldest entries`)
    }
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL
    const entry: CacheEntry<T> = {
      data: options.serialize ? JSON.parse(JSON.stringify(data)) : data,
      timestamp: Date.now(),
      ttl,
      key
    }

    this.cache.set(key, entry)
    logger.debug(`Cache set: ${key}`, { ttl, size: this.cache.size })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      logger.debug(`Cache miss: ${key}`)
      return null
    }

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      logger.debug(`Cache expired: ${key}`)
      return null
    }

    logger.debug(`Cache hit: ${key}`)
    return entry.data
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      logger.debug(`Cache delete: ${key}`)
    }
    return deleted
  }

  clear(): void {
    const size = this.cache.size
    this.cache.clear()
    logger.info(`Cache cleared: ${size} entries removed`)
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      defaultTTL: this.defaultTTL
    }
  }

  // Utility method for caching async operations
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    try {
      const data = await fetcher()
      this.set(key, data, options)
      return data
    } catch (error) {
      logger.error(`Cache fetcher error for key ${key}:`, { error })
      throw error
    }
  }

  // Method for invalidating cache by pattern
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern)
    let count = 0

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        count++
      }
    }

    if (count > 0) {
      logger.info(`Cache invalidated by pattern "${pattern}": ${count} entries`)
    }

    return count
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }
}

// Export singleton instance
export const cache = new CacheManager()

// Specialized cache instances for different data types
export const animeCache = {
  getTrending: (limit: number = 10) => 
    cache.getOrSet(`trending_anime_${limit}`, async () => {
      // This would be replaced with actual API call
      return []
    }, { ttl: 10 * 60 * 1000 }), // 10 minutes

  getAnimeDetails: (id: number) =>
    cache.getOrSet(`anime_${id}`, async () => {
      // This would be replaced with actual API call
      return null
    }, { ttl: 30 * 60 * 1000 }), // 30 minutes

  getSearchResults: (query: string, filters: any) => {
    const cacheKey = `search_${query}_${JSON.stringify(filters)}`
    return cache.getOrSet(cacheKey, async () => {
      // This would be replaced with actual search
      return []
    }, { ttl: 5 * 60 * 1000 }) // 5 minutes
  },

  invalidateAnime: (id: number) => {
    cache.delete(`anime_${id}`)
    cache.invalidatePattern(`search_.*`)
  }
}

export const userCache = {
  getProfile: (userId: string) =>
    cache.getOrSet(`profile_${userId}`, async () => {
      // This would be replaced with actual database call
      return null
    }, { ttl: 15 * 60 * 1000 }), // 15 minutes

  getUserAnime: (userId: string) =>
    cache.getOrSet(`user_anime_${userId}`, async () => {
      // This would be replaced with actual database call
      return []
    }, { ttl: 2 * 60 * 1000 }), // 2 minutes

  invalidateUser: (userId: string) => {
    cache.invalidatePattern(`.*_${userId}`)
  }
}

import React from 'react'

// React hook for caching
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & { enabled?: boolean } = {}
) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (!options.enabled) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await cache.getOrSet(key, fetcher, options)
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [key, options.enabled])

  const invalidate = () => {
    cache.delete(key)
    setData(null)
  }

  return { data, loading, error, invalidate }
}

// Cache middleware for API routes
export function withCache(options: CacheOptions = {}) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!

    descriptor.value = (async function (this: any, ...args: any[]) {
      const cacheKey = `${target.constructor.name}_${propertyName}_${JSON.stringify(args)}`
      
      return cache.getOrSet(cacheKey, async () => {
        return method.apply(this, args)
      }, options)
    }) as T
  }
}
