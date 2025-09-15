import { NextRequest, NextResponse } from 'next/server'
import { getTrendingAnime, getAnimeByGenre, transformAniListAnime } from '@/lib/anilist'

// Cache for storing recent recommendations to avoid duplicates
interface CacheEntry {
  data: any[]
  timestamp: number
}

const recommendationCache = new Map<string, CacheEntry>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '8')
    const genre = searchParams.get('genre') || 'all'
    const sortBy = searchParams.get('sortBy') || 'trending'
    const refresh = searchParams.get('refresh') === 'true'

    // Create cache key
    const cacheKey = `${genre}-${sortBy}-${page}`
    
    // Check cache first (unless refreshing)
    if (!refresh && recommendationCache.has(cacheKey)) {
      const cached = recommendationCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return NextResponse.json({
          recommendations: cached.data,
          pageInfo: { total: cached.data.length, currentPage: page, lastPage: 1, hasNextPage: false, perPage },
          sortBy,
          genre,
          refresh: false,
          cached: true
        })
      }
    }

    let response
    let actualPage = page

    // Different sorting options for variety
    if (genre !== 'all') {
      // For genre-based recommendations, add some randomization
      actualPage = refresh ? Math.floor(Math.random() * 5) + 1 : page
      response = await getAnimeByGenre(genre, actualPage, perPage)
    } else {
      // Use different sorting strategies for variety
      switch (sortBy) {
        case 'trending':
          actualPage = refresh ? Math.floor(Math.random() * 3) + 1 : page
          response = await getTrendingAnime(actualPage, perPage)
          break
        case 'popular':
          // Get popular anime by using a different page
          actualPage = refresh ? Math.floor(Math.random() * 8) + 1 : page + 1
          response = await getTrendingAnime(actualPage, perPage)
          break
        case 'random':
          // Get random anime by using a random page
          actualPage = Math.floor(Math.random() * 15) + 1
          response = await getTrendingAnime(actualPage, perPage)
          break
        default:
          actualPage = refresh ? Math.floor(Math.random() * 3) + 1 : page
          response = await getTrendingAnime(actualPage, perPage)
      }
    }

    // Transform the data to our internal format
    const transformedAnime = response.Page.media.map(transformAniListAnime)

    // Shuffle the results for more variety
    const shuffledAnime = shuffleArray(transformedAnime)

    // Add recommendation metadata
    const recommendations = shuffledAnime.map((anime, index) => ({
      ...anime,
      reason: generateRecommendationReason(anime, index),
      confidence: generateConfidenceScore(anime, index),
      // Add some variety to the display
      episodes: anime.episodes ? `${anime.episodes} EP` : 'TBA',
      year: anime.seasonYear || 'TBA',
      studio: anime.studios?.[0] || 'Unknown',
      rating: anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A'
    }))

    // Cache the results
    recommendationCache.set(cacheKey, {
      data: recommendations,
      timestamp: Date.now()
    })

    // Clean up old cache entries
    cleanupCache()

    return NextResponse.json({
      recommendations,
      pageInfo: response.Page.pageInfo,
      sortBy,
      genre,
      refresh,
      actualPage,
      cached: false
    })
  } catch (error) {
    console.error('Get recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}

// Utility function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Clean up old cache entries
function cleanupCache() {
  const now = Date.now()
  for (const [key, value] of recommendationCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      recommendationCache.delete(key)
    }
  }
}

// Generate personalized recommendation reasons
function generateRecommendationReason(anime: any, index: number): string {
  const genre = anime.genres?.[0] || 'anime'
  const score = anime.averageScore || 0
  const year = anime.seasonYear || new Date().getFullYear()
  
  const reasons = [
    `Based on your love for ${genre} series`,
    `Similar themes to your favorite shows`,
    `Highly rated ${genre} that you might enjoy`,
    `Popular ${genre} series trending right now`,
    `Great ${genre} with excellent storytelling`,
    `Must-watch ${genre} series`,
    `Perfect for fans of ${genre} genre`,
    `Highly recommended ${genre} series`,
    `A ${genre} masterpiece you shouldn't miss`,
    `One of the best ${genre} anime of ${year}`,
    `Critically acclaimed ${genre} series`,
    `A hidden gem in the ${genre} category`,
    `Perfect blend of ${anime.genres?.slice(0, 2).join(' and ') || 'genres'}`,
    `A ${genre} series that will keep you hooked`,
    `Highly praised ${genre} with great reviews`,
    `A must-see ${genre} anime for any fan`
  ]
  
  // Use a combination of index and random selection for more variety
  const randomIndex = Math.floor(Math.random() * reasons.length)
  return reasons[randomIndex]
}

// Generate confidence scores
function generateConfidenceScore(anime: any, index: number): number {
  const baseScore = anime.averageScore ? Math.min(95, Math.max(70, anime.averageScore / 10)) : 75
  const popularity = anime.popularity || 0
  const year = anime.seasonYear || new Date().getFullYear()
  
  // Adjust score based on popularity and recency
  let adjustedScore = baseScore
  
  // Boost for recent anime (last 3 years)
  if (year >= new Date().getFullYear() - 2) {
    adjustedScore += 5
  }
  
  // Boost for high popularity
  if (popularity > 100000) {
    adjustedScore += 3
  }
  
  // Add some random variation
  const variation = Math.floor(Math.random() * 15) - 7 // ±7 variation
  adjustedScore += variation
  
  return Math.min(99, Math.max(60, Math.round(adjustedScore)))
}
