// Simplified analytics system for current AniTrack project
import { logger } from './logger'

export interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  userId?: string
  sessionId?: string
  timestamp?: number
}

export interface UserMetrics {
  userId: string
  sessionDuration: number
  pageViews: number
  interactions: number
  animeViewed: number
  searchesPerformed: number
}

export interface SystemMetrics {
  activeUsers: number
  totalPageViews: number
  averageSessionDuration: number
  topPages: Array<{ path: string; views: number }>
  errorRate: number
}

class AnalyticsService {
  private events: AnalyticsEvent[] = []
  private maxEvents = 1000
  private sessionStartTime = Date.now()
  private pageViews = new Map<string, number>()
  private userSessions = new Map<string, { startTime: number; events: number }>()

  // Track custom events
  track(event: AnalyticsEvent) {
    const enrichedEvent: AnalyticsEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      sessionId: this.getSessionId()
    }

    this.events.push(enrichedEvent)
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }

    // Log for debugging
    logger.debug('Analytics event tracked', enrichedEvent)

    // Send to external analytics if configured
    this.sendToExternalAnalytics(enrichedEvent)
  }

  // Track page views
  trackPageView(path: string, userId?: string) {
    this.pageViews.set(path, (this.pageViews.get(path) || 0) + 1)
    
    this.track({
      name: 'page_view',
      properties: { path },
      userId
    })
  }

  // Track user interactions
  trackInteraction(type: string, element: string, userId?: string, properties?: Record<string, any>) {
    this.track({
      name: 'user_interaction',
      properties: {
        type,
        element,
        ...properties
      },
      userId
    })
  }

  // Track anime-specific events
  trackAnimeEvent(action: string, animeId: number, animeTitle: string, userId?: string) {
    this.track({
      name: 'anime_interaction',
      properties: {
        action,
        animeId,
        animeTitle
      },
      userId
    })
  }

  // Track search events
  trackSearch(query: string, resultsCount: number, userId?: string) {
    this.track({
      name: 'search_performed',
      properties: {
        query: query.toLowerCase(),
        resultsCount,
        queryLength: query.length
      },
      userId
    })
  }

  // Track errors
  trackError(error: Error, context?: Record<string, any>, userId?: string) {
    this.track({
      name: 'error_occurred',
      properties: {
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
        ...context
      },
      userId
    })
  }

  // Get user metrics
  getUserMetrics(userId: string): UserMetrics {
    const userEvents = this.events.filter(e => e.userId === userId)
    const session = this.userSessions.get(userId)
    
    return {
      userId,
      sessionDuration: session ? Date.now() - session.startTime : 0,
      pageViews: userEvents.filter(e => e.name === 'page_view').length,
      interactions: userEvents.filter(e => e.name === 'user_interaction').length,
      animeViewed: userEvents.filter(e => e.name === 'anime_interaction').length,
      searchesPerformed: userEvents.filter(e => e.name === 'search_performed').length
    }
  }

  // Get system metrics
  getSystemMetrics(): SystemMetrics {
    const now = Date.now()
    const recentEvents = this.events.filter(e => now - (e.timestamp || 0) < 24 * 60 * 60 * 1000) // Last 24 hours
    
    const pageViewEvents = recentEvents.filter(e => e.name === 'page_view')
    const errorEvents = recentEvents.filter(e => e.name === 'error_occurred')
    
    // Calculate top pages
    const pageViewCounts = new Map<string, number>()
    pageViewEvents.forEach(event => {
      const path = event.properties?.path
      if (path) {
        pageViewCounts.set(path, (pageViewCounts.get(path) || 0) + 1)
      }
    })
    
    const topPages = Array.from(pageViewCounts.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Calculate active users (unique users in last hour)
    const activeUserIds = new Set(
      recentEvents
        .filter(e => now - (e.timestamp || 0) < 60 * 60 * 1000)
        .map(e => e.userId)
        .filter(Boolean)
    )

    return {
      activeUsers: activeUserIds.size,
      totalPageViews: pageViewEvents.length,
      averageSessionDuration: this.calculateAverageSessionDuration(),
      topPages,
      errorRate: recentEvents.length > 0 ? errorEvents.length / recentEvents.length : 0
    }
  }

  // Start user session
  startSession(userId: string) {
    this.userSessions.set(userId, {
      startTime: Date.now(),
      events: 0
    })
    
    this.track({
      name: 'session_start',
      userId
    })
  }

  // End user session
  endSession(userId: string) {
    const session = this.userSessions.get(userId)
    if (session) {
      const duration = Date.now() - session.startTime
      
      this.track({
        name: 'session_end',
        properties: {
          duration,
          events: session.events
        },
        userId
      })
      
      this.userSessions.delete(userId)
    }
  }

  // Get session ID
  private getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('anitrack_session_id')
      if (!sessionId) {
        sessionId = Math.random().toString(36).substr(2, 9)
        sessionStorage.setItem('anitrack_session_id', sessionId)
      }
      return sessionId
    }
    return 'server_session'
  }

  // Calculate average session duration
  private calculateAverageSessionDuration(): number {
    const sessionEvents = this.events.filter(e => e.name === 'session_end')
    if (sessionEvents.length === 0) return 0
    
    const totalDuration = sessionEvents.reduce((sum, event) => {
      return sum + (event.properties?.duration || 0)
    }, 0)
    
    return totalDuration / sessionEvents.length
  }

  // Send to external analytics services
  private async sendToExternalAnalytics(event: AnalyticsEvent) {
    try {
      // Google Analytics 4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.name, {
          ...event.properties,
          user_id: event.userId
        })
      }

      // Custom analytics endpoint
      if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
        await fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        })
      }
    } catch (error) {
      logger.error('Failed to send analytics event', { error, event })
    }
  }

  // Export events for analysis
  exportEvents(startTime?: number, endTime?: number): AnalyticsEvent[] {
    let filteredEvents = this.events
    
    if (startTime) {
      filteredEvents = filteredEvents.filter(e => (e.timestamp || 0) >= startTime)
    }
    
    if (endTime) {
      filteredEvents = filteredEvents.filter(e => (e.timestamp || 0) <= endTime)
    }
    
    return filteredEvents
  }

  // Clear old events
  cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000) { // 7 days default
    const cutoff = Date.now() - maxAge
    this.events = this.events.filter(e => (e.timestamp || 0) > cutoff)
  }
}

// Export singleton instance
export const analytics = new AnalyticsService()

// React hook for analytics
export function useAnalytics() {
  const trackEvent = (name: string, properties?: Record<string, any>) => {
    analytics.track({ name, properties })
  }

  const trackPageView = (path: string) => {
    analytics.trackPageView(path)
  }

  const trackClick = (element: string, properties?: Record<string, any>) => {
    analytics.trackInteraction('click', element, undefined, properties)
  }

  const trackAnime = (action: string, animeId: number, animeTitle: string) => {
    analytics.trackAnimeEvent(action, animeId, animeTitle)
  }

  return {
    trackEvent,
    trackPageView,
    trackClick,
    trackAnime
  }
}
