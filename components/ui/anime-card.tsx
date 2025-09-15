"use client"

import { useState } from "react"
import { Star, Plus, Heart, Play, Calendar, Users, Clock, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"
import { useSupabaseAuth } from "@/components/providers/supabase-auth-provider"
import { toast } from "sonner"

interface AnimeCardProps {
  anime: {
    id: number
    title: string
    titleEnglish?: string
    titleRomaji?: string
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
  }
  showAddToList?: boolean
  showRating?: boolean
  userRating?: number
  userStatus?: string
  userProgress?: number
  onStatusChange?: (animeId: number, status: string) => void
  onRatingChange?: (animeId: number, rating: number) => void
  onProgressChange?: (animeId: number, progress: number) => void
  onAddToList?: (animeId: number, status: string, rating?: number, notes?: string) => void
  className?: string
}

export function AnimeCard({
  anime,
  showAddToList = true,
  showRating = true,
  userRating,
  userStatus,
  userProgress,
  onStatusChange,
  onRatingChange,
  onProgressChange,
  onAddToList,
  className = ""
}: AnimeCardProps) {
  const { user } = useSupabaseAuth()
  const [isAddingToList, setIsAddingToList] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(userStatus || "plan-to-watch")
  const [selectedRating, setSelectedRating] = useState(userRating || 0)
  const [notes, setNotes] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddToList = async () => {
    if (!user) {
      toast.error("Please log in to add anime to your list")
      return
    }

    setIsAddingToList(true)
    try {
      const requestData = {
        animeMetadataId: anime.id,
        status: selectedStatus,
        userRating: selectedRating > 0 ? selectedRating : undefined,
        notes: notes.trim() || undefined,
      }

      console.log('Adding anime to list with data:', requestData)
      console.log('Anime object:', anime)

      const response = await fetch('/api/supabase-user/anime-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const error = await response.json()
        console.error('API Error:', error)
        throw new Error(error.error || 'Failed to add anime to list')
      }

      const result = await response.json()
      console.log('Success result:', result)
      toast.success("Anime added to your list!")
      setIsDialogOpen(false)
      setNotes("")
      setSelectedRating(0)
      setSelectedStatus("plan-to-watch")
      
      if (onAddToList) {
        onAddToList(anime.id, selectedStatus, selectedRating, notes)
      }
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
          animeMetadataId: anime.id,
          status: userStatus || "plan-to-watch",
          userRating: rating,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update rating')
      }

      toast.success(`Rated ${anime.title} ${rating}/10`)
      setSelectedRating(rating)
      
      if (onRatingChange) {
        onRatingChange(anime.id, rating)
      }
    } catch (error) {
      console.error('Error updating rating:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update rating')
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

  const getDisplayTitle = () => {
    return anime.titleEnglish || anime.titleRomaji || anime.title
  }

  const getProgressPercentage = () => {
    if (!anime.episodes || !userProgress) return 0
    return Math.min((userProgress / anime.episodes) * 100, 100)
  }

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 cursor-pointer ${className}`}>
      <div className="relative">
        {/* Anime Image */}
        <Link href={`/anime/${anime.id}`}>
          <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
            {anime.coverImage ? (
              <Image
                src={anime.coverImage}
                alt={getDisplayTitle()}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Play className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            {/* Overlay with rating and status */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ExternalLink className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Status Badge */}
            {userStatus && (
              <Badge 
                className={`absolute top-2 left-2 ${getStatusColor(userStatus)} text-white`}
              >
                {getStatusText(userStatus)}
              </Badge>
            )}

            {/* User Rating */}
            {userRating && userRating > 0 && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full px-2 py-1 flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-white text-xs font-medium">{userRating}</span>
              </div>
            )}

            {/* Progress Bar */}
            {userProgress !== undefined && anime.episodes && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                <div className="flex items-center justify-between text-white text-xs mb-1">
                  <span>Progress</span>
                  <span>{userProgress}/{anime.episodes}</span>
                </div>
                <Progress 
                  value={getProgressPercentage()} 
                  className="h-1 bg-gray-600"
                />
              </div>
            )}
          </div>
        </Link>

        <CardContent className="p-4">
          {/* Title */}
          <Link href={`/anime/${anime.id}`}>
            <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {getDisplayTitle()}
            </h3>
          </Link>

          {/* Alternative Title */}
          {(anime.titleEnglish || anime.titleRomaji) && anime.title !== getDisplayTitle() && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
              {anime.title}
            </p>
          )}

          {/* Genres */}
          <div className="flex flex-wrap gap-1 mb-3">
            {anime.genres.slice(0, 3).map((genre, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
            {anime.genres.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{anime.genres.length - 3}
              </Badge>
            )}
          </div>

          {/* Anime Info */}
          <div className="space-y-1 mb-3 text-sm text-gray-600 dark:text-gray-400">
            {anime.episodes && (
              <div className="flex items-center space-x-1">
                <Play className="w-3 h-3" />
                <span>{anime.episodes} episodes</span>
              </div>
            )}
            {anime.duration && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{anime.duration} min</span>
              </div>
            )}
            {anime.seasonYear && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{anime.season} {anime.seasonYear}</span>
              </div>
            )}
            {anime.averageScore && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span>{anime.averageScore}/100</span>
              </div>
            )}
          </div>

          {/* Rating Stars */}
          {showRating && (
            <div className="flex items-center space-x-1 mb-3">
              <span className="text-sm font-medium">Rate:</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingClick(rating)}
                    className={`w-4 h-4 transition-colors ${
                      selectedRating >= rating
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    <Star className="w-full h-full" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to List Button */}
          {showAddToList && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full" 
                  variant={userStatus ? "outline" : "default"}
                  disabled={isAddingToList}
                >
                  {userStatus ? (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      {getStatusText(userStatus)}
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
          )}
        </CardContent>
      </div>
    </Card>
  )
}
