"use client"

import { useState, useEffect } from "react"
import { TrendingUp, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimeCard } from "@/components/ui/anime-card"
import Link from "next/link"

interface TrendingAnime {
  id: number
  title: string
  titleEnglish?: string
  titleRomaji?: string
  coverImage?: string
  episodes?: number
  averageScore?: number
  genres: string[]
  studios: string[]
  seasonYear?: number
  status: string
  description?: string
  popularity?: number
  trending?: number
  favourites?: number
}

export default function TrendingPage() {
  const [trendingAnime, setTrendingAnime] = useState<TrendingAnime[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sortBy, setSortBy] = useState("trending")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch trending anime
  const fetchTrendingAnime = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const response = await fetch(`/api/anime/trending?page=1&perPage=20&sort=${sortBy}`)
      if (!response.ok) {
        throw new Error('Failed to fetch trending anime')
      }
      
      const data = await response.json()
      setTrendingAnime(data.anime || [])
    } catch (error) {
      console.error('Error fetching trending anime:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Load trending anime on component mount and when sort changes
  useEffect(() => {
    fetchTrendingAnime()
  }, [sortBy])

  // Filter anime based on search query
  const filteredAnime = trendingAnime.filter(anime => 
    anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    anime.titleEnglish?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    anime.titleRomaji?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRefresh = () => {
    fetchTrendingAnime(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 mr-3 text-blue-600" />
            Trending Anime
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover what's popular and trending in the anime world
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search trending anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Anime Grid */}
        {filteredAnime.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No trending anime found
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              {searchQuery ? 'Try adjusting your search terms' : 'Failed to load trending anime'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAnime.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                showAddToList={true}
                showRating={true}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredAnime.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Anime
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
