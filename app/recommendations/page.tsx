"use client"

import { useState, useEffect } from "react"
import { Brain, ArrowLeft, RefreshCw, Filter, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimeCard } from "@/components/ui/anime-card"
import Link from "next/link"

interface Recommendation {
  id: number
  title: string
  titleEnglish?: string
  titleRomaji?: string
  titleNative?: string
  description?: string
  coverImage?: string
  bannerImage?: string
  episodes?: number
  status?: string
  format?: string
  season?: string
  seasonYear?: number
  genres: string[]
  tags: string[]
  averageScore?: number
  popularity?: number
  studios: string[]
  source?: string
  duration?: number
  startDate?: Date | null
  endDate?: Date | null
  nextAiringEpisode?: number
  nextAiringTime?: Date | null
  reason: string
  confidence: number
  rating: string
  year: string | number
  studio: string
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("trending")
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchRecommendations = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const params = new URLSearchParams({
        perPage: '8',
        genre: filter,
        sortBy: sortBy,
        refresh: refresh.toString()
      })

      const response = await fetch(`/api/recommendations?${params}`)
      const data = await response.json()

      if (data.recommendations) {
        setRecommendations(data.recommendations)
      } else {
        console.error('Failed to fetch recommendations:', data.error)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [filter, sortBy])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    fetchRecommendations(true)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600"
    if (confidence >= 80) return "text-blue-600"
    if (confidence >= 70) return "text-yellow-600"
    return "text-gray-600"
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">AI Recommendations</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Personalized anime suggestions just for you</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">Back to Dashboard</Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                <SelectItem value="Action">Action</SelectItem>
                <SelectItem value="Adventure">Adventure</SelectItem>
                <SelectItem value="Comedy">Comedy</SelectItem>
                <SelectItem value="Drama">Drama</SelectItem>
                <SelectItem value="Fantasy">Fantasy</SelectItem>
                <SelectItem value="Horror">Horror</SelectItem>
                <SelectItem value="Romance">Romance</SelectItem>
                <SelectItem value="Supernatural">Supernatural</SelectItem>
                <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                <SelectItem value="Slice of Life">Slice of Life</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="random">Random</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 bg-transparent"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Recommendations'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.map((anime) => (
              <AnimeCard
                key={`${anime.id}-${refreshKey}`}
                anime={{
                  id: anime.id,
                  title: anime.title,
                  titleEnglish: anime.titleEnglish,
                  titleRomaji: anime.titleRomaji,
                  coverImage: anime.coverImage,
                  episodes: anime.episodes,
                  averageScore: anime.averageScore,
                  genres: anime.genres,
                  studios: anime.studios,
                  seasonYear: anime.seasonYear,
                  status: anime.status,
                  duration: anime.duration,
                  format: anime.format,
                  season: anime.season,
                  source: anime.source,
                  startDate: anime.startDate?.toString(),
                  endDate: anime.endDate?.toString(),
                  nextAiringEpisode: anime.nextAiringEpisode,
                  nextAiringTime: anime.nextAiringTime?.toString(),
                  description: anime.description,
                  popularity: anime.popularity,
                  bannerImage: anime.bannerImage,
                }}
                showAddToList={true}
                showRating={true}
              />
            ))}
          </div>
        )}
        
        {!isLoading && recommendations.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No recommendations found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or refresh to get new recommendations.
            </p>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Refresh Recommendations
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
