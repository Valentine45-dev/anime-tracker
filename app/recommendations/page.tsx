"use client"

import { useState, useEffect } from "react"
import { Brain, Star, Plus, Filter, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import Link from "next/link"

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  const mockRecommendations = [
    {
      id: 1,
      title: "Chainsaw Man",
      rating: 8.9,
      genre: ["Action", "Supernatural"],
      reason: "Based on your love for Jujutsu Kaisen",
      confidence: 95,
      image: "/placeholder.svg?height=200&width=150&text=Chainsaw+Man",
      episodes: "12 EP",
      year: 2022,
      studio: "MAPPA",
    },
    {
      id: 2,
      title: "Mob Psycho 100",
      rating: 9.1,
      genre: ["Action", "Comedy"],
      reason: "Similar supernatural themes to your favorites",
      confidence: 88,
      image: "/placeholder.svg?height=200&width=150&text=Mob+Psycho",
      episodes: "37 EP",
      year: 2016,
      studio: "Bones",
    },
    {
      id: 3,
      title: "Tokyo Ghoul",
      rating: 8.2,
      genre: ["Action", "Horror"],
      reason: "Dark themes like Attack on Titan",
      confidence: 82,
      image: "/placeholder.svg?height=200&width=150&text=Tokyo+Ghoul",
      episodes: "48 EP",
      year: 2014,
      studio: "Pierrot",
    },
    {
      id: 4,
      title: "Hunter x Hunter",
      rating: 9.4,
      genre: ["Adventure", "Action"],
      reason: "Epic adventure like One Piece",
      confidence: 91,
      image: "/placeholder.svg?height=200&width=150&text=HxH",
      episodes: "148 EP",
      year: 2011,
      studio: "Madhouse",
    },
  ]

  useEffect(() => {
    // Simulate AI recommendation loading
    setTimeout(() => {
      setRecommendations(mockRecommendations)
      setIsLoading(false)
    }, 2000)
  }, [])

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Recommendations</h1>
                <p className="text-gray-600 dark:text-gray-400">Personalized anime suggestions just for you</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                <SelectItem value="action">Action</SelectItem>
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="comedy">Comedy</SelectItem>
                <SelectItem value="drama">Drama</SelectItem>
                <SelectItem value="fantasy">Fantasy</SelectItem>
                <SelectItem value="horror">Horror</SelectItem>
                <SelectItem value="romance">Romance</SelectItem>
                <SelectItem value="supernatural">Supernatural</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Sparkles className="w-4 h-4" />
              <span>Refresh Recommendations</span>
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
              <Card key={anime.id} className="hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <Image
                    src={anime.image || "/placeholder.svg"}
                    alt={anime.title}
                    width={150}
                    height={200}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={`${getConfidenceColor(anime.confidence)} bg-white/90 text-xs`}>
                      {anime.confidence}% match
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">{anime.title}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{anime.rating}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{anime.episodes}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{anime.year}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {anime.genre.map((g) => (
                      <Badge key={g} variant="secondary" className="text-xs">
                        {g}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 italic">"{anime.reason}"</p>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-1" />
                      Add to List
                    </Button>
                    <Link href={`/anime/${anime.id}`}>
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
