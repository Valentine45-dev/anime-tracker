"use client"

import { useState, useEffect, use } from "react"
import { ArrowLeft, Star, Play, Calendar, Users, Clock, ExternalLink, Heart, Plus, Share2, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { useSupabaseAuth } from "@/components/providers/supabase-auth-provider"
import { toast } from "sonner"

interface AnimeDetails {
  id: number
  title: string
  titleEnglish?: string
  titleRomaji?: string
  titleJapanese?: string
  coverImage?: string
  bannerImage?: string
  episodes?: number
  averageScore?: number
  genres: string[]
  studios: string[]
  seasonYear?: number
  status?: string
  description?: string
  popularity?: number
  duration?: number
  format?: string
  season?: string
  source?: string
  startDate?: string
  endDate?: string
  nextAiringEpisode?: number
  nextAiringTime?: string
  tags?: string[]
  characters?: Array<{
    name: string
    role: string
    image?: string
  }>
  staff?: Array<{
    name: string
    role: string
  }>
}

interface UserAnimeData {
  status?: string
  progress?: number
  userRating?: number
  notes?: string
  isFavorite?: boolean
  startDate?: string
  finishDate?: string
}

export default function AnimeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useSupabaseAuth()
  const [anime, setAnime] = useState<AnimeDetails | null>(null)
  const [userAnimeData, setUserAnimeData] = useState<UserAnimeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingToList, setIsAddingToList] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("plan-to-watch")
  const [selectedRating, setSelectedRating] = useState(0)
  const [notes, setNotes] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)

  const resolvedParams = use(params)
  const animeId = parseInt(resolvedParams.id)

  useEffect(() => {
    if (animeId) {
      fetchAnimeDetails()
      if (user) {
        fetchUserAnimeData()
      }
    }
  }, [animeId, user])

  const fetchAnimeDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/anime/${animeId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch anime details')
      }
      const data = await response.json()
      setAnime(data.anime)
    } catch (error) {
      console.error('Error fetching anime details:', error)
      toast.error('Failed to load anime details')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserAnimeData = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/supabase-user/anime-list?animeId=${animeId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.animeList && data.animeList.length > 0) {
          const userData = data.animeList[0]
          setUserAnimeData({
            status: userData.status,
            progress: userData.progress,
            userRating: userData.user_rating,
            notes: userData.notes,
            isFavorite: userData.is_favorite,
            startDate: userData.start_date,
            finishDate: userData.finish_date,
          })
          setSelectedStatus(userData.status || "plan-to-watch")
          setSelectedRating(userData.user_rating || 0)
          setNotes(userData.notes || "")
          setIsFavorite(userData.is_favorite || false)
        }
      }
    } catch (error) {
      console.error('Error fetching user anime data:', error)
    }
  }

  const handleAddToList = async () => {
    if (!user) {
      toast.error("Please log in to add anime to your list")
      return
    }

    setIsAddingToList(true)
    try {
      const response = await fetch('/api/supabase-user/anime-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          animeMetadataId: animeId,
          status: selectedStatus,
          userRating: selectedRating > 0 ? selectedRating : undefined,
          notes: notes.trim() || undefined,
          isFavorite,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add anime to list')
      }

      toast.success("Anime added to your list!")
      setIsDialogOpen(false)
      fetchUserAnimeData()
    } catch (error) {
      console.error('Error adding anime to list:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add anime to list')
    } finally {
      setIsAddingToList(false)
    }
  }

  const handleRatingClick = async (rating: number) => {
    if (!user) {
      toast.error("Please log in to rate anime")
      return
    }

    try {
      const response = await fetch('/api/supabase-user/anime-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          animeMetadataId: animeId,
          status: userAnimeData?.status || "plan-to-watch",
          userRating: rating,
          isFavorite,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update rating')
      }

      toast.success(`Rated ${anime?.title} ${rating}/10`)
      setSelectedRating(rating)
      fetchUserAnimeData()
    } catch (error) {
      console.error('Error updating rating:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update rating')
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error("Please log in to manage favorites")
      return
    }

    try {
      const response = await fetch('/api/supabase-user/anime-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          animeMetadataId: animeId,
          status: userAnimeData?.status || "plan-to-watch",
          userRating: userAnimeData?.userRating,
          isFavorite: !isFavorite,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update favorite status')
      }

      setIsFavorite(!isFavorite)
      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites")
      fetchUserAnimeData()
    } catch (error) {
      console.error('Error updating favorite status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update favorite status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'watching': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'on-hold': return 'bg-yellow-500'
      case 'dropped': return 'bg-red-500'
      case 'plan-to-watch': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'watching': return 'Watching'
      case 'completed': return 'Completed'
      case 'on-hold': return 'On Hold'
      case 'dropped': return 'Dropped'
      case 'plan-to-watch': return 'Plan to Watch'
      default: return 'Plan to Watch'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const getProgressPercentage = () => {
    if (!anime?.episodes || !userAnimeData?.progress) return 0
    return Math.min((userAnimeData.progress / anime.episodes) * 100, 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Anime Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The anime you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative mb-8">
          {/* Banner Image */}
          {anime.bannerImage && (
            <div className="h-64 md:h-80 relative overflow-hidden rounded-lg mb-6">
              <Image
                src={anime.bannerImage}
                alt={anime.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            {/* Cover Image */}
            <div className="flex-shrink-0">
              <div className="w-48 h-64 md:w-56 md:h-80 relative overflow-hidden rounded-lg shadow-lg">
                {anime.coverImage ? (
                  <Image
                    src={anime.coverImage}
                    alt={anime.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 192px, 224px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Play className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Anime Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {anime.titleEnglish || anime.titleRomaji || anime.title}
                </h1>
                {anime.title !== (anime.titleEnglish || anime.titleRomaji) && (
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                    {anime.title}
                  </p>
                )}
                {anime.titleJapanese && (
                  <p className="text-lg text-gray-500 dark:text-gray-500">
                    {anime.titleJapanese}
                  </p>
                )}
              </div>

              {/* Status and Rating */}
              <div className="flex flex-wrap items-center gap-4">
                {userAnimeData?.status && (
                  <Badge className={`${getStatusColor(userAnimeData.status)} text-white`}>
                    {getStatusText(userAnimeData.status)}
                  </Badge>
                )}
                {anime.averageScore && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-semibold">{anime.averageScore}/100</span>
                  </div>
                )}
                {userAnimeData?.userRating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-blue-500 fill-current" />
                    <span className="font-semibold">Your Rating: {userAnimeData.userRating}/10</span>
                  </div>
                )}
              </div>

              {/* Anime Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {anime.episodes && (
                  <div className="flex items-center space-x-2">
                    <Play className="w-4 h-4 text-gray-500" />
                    <span>{anime.episodes} episodes</span>
                  </div>
                )}
                {anime.duration && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{anime.duration} min</span>
                  </div>
                )}
                {anime.seasonYear && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{anime.season} {anime.seasonYear}</span>
                  </div>
                )}
                {anime.format && (
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                    <span>{anime.format}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg">
                      {userAnimeData ? (
                        <>
                          <Heart className="w-4 h-4 mr-2" />
                          {getStatusText(userAnimeData.status || "plan-to-watch")}
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add to List
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add to List</DialogTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Add this anime to your personal list with your preferred status and rating.
                      </p>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="plan-to-watch">Plan to Watch</SelectItem>
                            <SelectItem value="watching">Watching</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                            <SelectItem value="dropped">Dropped</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="rating">Rating (1-10)</Label>
                        <Select value={selectedRating.toString()} onValueChange={(value) => setSelectedRating(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">No rating</SelectItem>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                              <SelectItem key={rating} value={rating.toString()}>
                                {rating}/10
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Add your thoughts about this anime..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="favorite"
                          checked={isFavorite}
                          onChange={(e) => setIsFavorite(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="favorite">Add to favorites</Label>
                      </div>

                      <Button 
                        onClick={handleAddToList} 
                        className="w-full"
                        disabled={isAddingToList}
                      >
                        {isAddingToList ? 'Adding...' : 'Add to List'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="lg" onClick={handleToggleFavorite}>
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                  {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </Button>

                <Button variant="outline" size="lg">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {userAnimeData?.progress !== undefined && anime.episodes && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Your Progress</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {userAnimeData.progress}/{anime.episodes} episodes
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rating">Rating</TabsTrigger>
            <TabsTrigger value="characters">Characters</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Description */}
            {anime.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {anime.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Genres */}
            <Card>
              <CardHeader>
                <CardTitle>Genres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre, index) => (
                    <Badge key={index} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Studios */}
            {anime.studios && anime.studios.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Studios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {anime.studios.map((studio, index) => (
                      <Badge key={index} variant="outline">
                        {studio}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rating" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rate This Anime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Your Rating</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRatingClick(rating)}
                          className={`w-8 h-8 transition-colors rounded ${
                            selectedRating >= rating
                              ? 'text-yellow-500 fill-current bg-yellow-50 dark:bg-yellow-900/20'
                              : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                          }`}
                        >
                          <Star className="w-full h-full" />
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {selectedRating > 0 ? `You rated this ${selectedRating}/10` : 'Click a star to rate'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="characters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Characters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">Character information coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">Reviews coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
