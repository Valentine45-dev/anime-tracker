"use client"

import { useState, useEffect } from "react"
import { Search, Star, Edit3, Plus, Menu, Bell, User, TrendingUp, Users, Brain, Moon, Sun, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimeCard } from "@/components/ui/anime-card"
import Image from "next/image"
import Link from "next/link"
import { useSupabaseAuth } from "@/components/providers/supabase-auth-provider"
import { useTheme } from "@/hooks/use-theme"
import { useRouter } from "next/navigation"

interface DashboardAnime {
  id: number
  title: string
  titleEnglish?: string
  titleRomaji?: string
  coverImage?: string
  episodes?: number
  rating: number
  progress: number
  progressColor: string
  genre: string
  genres: string[]
  averageScore?: number
  status?: string
  nextEpisode?: string
  streamingPlatform?: string
  completedDate?: string
  onHoldDate?: string
  droppedDate?: string
  addedDate?: string
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("watching")
  const { user, profile, session, signOut } = useSupabaseAuth()
  const { theme, toggleTheme } = useTheme()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [animeLists, setAnimeLists] = useState<Record<string, DashboardAnime[]>>({
    watching: [],
    completed: [],
    onHold: [],
    dropped: [],
    planToWatch: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getDisplayName = () => {
    if (profile?.name) {
      return profile.name
    }
    if (user?.email) {
      // Extract name from email (part before @)
      const emailName = user.email.split('@')[0]
      // Capitalize first letter and replace dots/underscores with spaces
      return emailName
        .replace(/[._]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    }
    return 'User'
  }

  // Fetch user's personal anime list for each status
  const fetchAnimeData = async (apiStatus: string, tabName: string) => {
    try {
      console.log(`Fetching anime for status: ${apiStatus} -> tab: ${tabName}`)
      
      if (!session?.access_token) {
        console.log('No session token available')
        return
      }
      
      const response = await fetch(`/api/supabase-user/anime-list?status=${apiStatus}&limit=8`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      const data = await response.json()
      
      console.log(`API response for ${apiStatus}:`, data)
      
      if (data.animeList) {
        // Transform the data to match our dashboard format
        const transformedAnime = data.animeList.map((item: any) => ({
          id: item.anime_metadata.id,
          title: item.anime_metadata.title,
          titleEnglish: item.anime_metadata.title_english,
          titleRomaji: item.anime_metadata.title_japanese,
          coverImage: item.anime_metadata.image_url,
          episodes: item.anime_metadata.episodes,
          averageScore: item.anime_metadata.score,
          genres: item.anime_metadata.genres || [],
          studios: item.anime_metadata.studios || [],
          rating: item.user_rating || 0,
          progress: item.progress || 0,
          progressColor: getProgressColor(item.progress || 0),
          genre: item.anime_metadata.genres?.[0] || 'Unknown',
          status: item.status,
          nextEpisode: item.status === 'watching' ? 'Next Episode' : undefined,
          streamingPlatform: 'Crunchyroll', // Default for now
          completedDate: item.finish_date,
          onHoldDate: item.status === 'on-hold' ? item.updated_at?.split('T')[0] : undefined,
          droppedDate: item.status === 'dropped' ? item.updated_at?.split('T')[0] : undefined,
          addedDate: item.created_at?.split('T')[0]
        }))
        
        setAnimeLists(prev => ({
          ...prev,
          [tabName]: transformedAnime
        }))
      } else {
        // If no anime in this status, show empty array
        setAnimeLists(prev => ({
          ...prev,
          [tabName]: []
        }))
      }
    } catch (error) {
      console.error(`Error fetching ${apiStatus} anime:`, error)
      // Set empty array on error
      setAnimeLists(prev => ({
        ...prev,
        [tabName]: []
      }))
    }
  }

  // Helper function to get progress color based on progress percentage
  const getProgressColor = (progress: number): string => {
    if (progress >= 90) return 'bg-green-500'
    if (progress >= 70) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    if (progress >= 30) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Handle adding anime to list
  const handleAddToList = async (animeId: number, status: string, rating?: number, notes?: string) => {
    try {
      // Map the status to the correct tab name and refresh
      const statusMap: Record<string, { tab: string; api: string }> = {
        'watching': { tab: 'watching', api: 'watching' },
        'completed': { tab: 'completed', api: 'completed' },
        'on-hold': { tab: 'onHold', api: 'on-hold' },
        'dropped': { tab: 'dropped', api: 'dropped' },
        'plan-to-watch': { tab: 'planToWatch', api: 'plan-to-watch' }
      }
      
      const mapping = statusMap[status]
      if (mapping) {
        await fetchAnimeData(mapping.api, mapping.tab)
      }
    } catch (error) {
      console.error('Error refreshing anime data after adding to list:', error)
    }
  }

  // Load all anime data on component mount
  useEffect(() => {
    const loadAllAnime = async () => {
      if (!session?.access_token) {
        console.log('No session available, skipping data fetch')
        return
      }

      setIsLoading(true)
      const statuses = [
        { tab: 'watching', api: 'watching' },
        { tab: 'completed', api: 'completed' },
        { tab: 'onHold', api: 'on-hold' },
        { tab: 'dropped', api: 'dropped' },
        { tab: 'planToWatch', api: 'plan-to-watch' }
      ]
      
      await Promise.all(statuses.map(({ tab, api }) => fetchAnimeData(api, tab)))
      setIsLoading(false)
    }

    loadAllAnime()
  }, [session?.access_token])

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`w-3 h-3 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
        ))}
      </div>
    )
  }

  const getCurrentList = () => {
    return animeLists[activeTab] || []
  }

  const getTabCount = (tab: string) => {
    return animeLists[tab]?.length || 0
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Welcome to AniTrack</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please sign in to track your anime journey</p>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button className="bg-blue-600 hover:bg-blue-700">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-700 text-white sticky top-0 z-50 overflow-x-hidden">
        <div className="px-4 py-3 max-w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-white p-1 md:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold">AT</span>
                </div>
                <h1 className="text-xl font-bold">AniTrack</h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/recommendations">
                <Button variant="ghost" size="sm" className="text-white">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Recommendations
                </Button>
              </Link>
              <Link href="/communities">
                <Button variant="ghost" size="sm" className="text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Communities
                </Button>
              </Link>
              <Link href="/trending">
                <Button variant="ghost" size="sm" className="text-white">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white p-1">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white p-1">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white p-1" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white p-1">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.name || "User"} />
                      <AvatarFallback className="text-xs">
                        {getInitials(getDisplayName())}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{getDisplayName()}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden bg-blue-700 rounded-lg p-4 mb-4">
              <div className="space-y-2">
                <Link href="/recommendations" className="block">
                  <Button variant="ghost" className="w-full justify-start text-white">
                    <Brain className="w-4 h-4 mr-2" />
                    AI Recommendations
                  </Button>
                </Link>
                <Link href="/communities" className="block">
                  <Button variant="ghost" className="w-full justify-start text-white">
                    <Users className="w-4 h-4 mr-2" />
                    Communities
                  </Button>
                </Link>
                <Link href="/trending" className="block">
                  <Button variant="ghost" className="w-full justify-start text-white">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Trending
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Welcome Message */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              <span className="hidden sm:inline">Welcome back, {getDisplayName()}! 👋</span>
              <span className="sm:hidden">Hi {getDisplayName()}! 👋</span>
            </h2>
            <p className="text-blue-100 text-sm">
              <span className="hidden sm:inline">You have {animeLists.watching.length} anime in progress</span>
              <span className="sm:hidden">{animeLists.watching.length} in progress</span>
            </p>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="bg-transparent border-0 p-0 h-auto space-x-0 flex w-max min-w-full">
              <TabsTrigger
                value="watching"
                className="text-white data-[state=active]:text-white data-[state=active]:bg-blue-700 rounded-t-lg border-0 px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
              >
                <span className="hidden sm:inline">Watching</span>
                <span className="sm:hidden">Watch</span> ({getTabCount("watching")})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="text-white data-[state=active]:text-white data-[state=active]:bg-blue-700 rounded-t-lg border-0 px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
              >
                <span className="hidden sm:inline">Completed</span>
                <span className="sm:hidden">Done</span> ({getTabCount("completed")})
              </TabsTrigger>
              <TabsTrigger
                value="onHold"
                className="text-white data-[state=active]:text-white data-[state=active]:bg-blue-700 rounded-t-lg border-0 px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
              >
                <span className="hidden sm:inline">On-Hold</span>
                <span className="sm:hidden">Hold</span> ({getTabCount("onHold")})
              </TabsTrigger>
              <TabsTrigger
                value="dropped"
                className="text-white data-[state=active]:text-white data-[state=active]:bg-blue-700 rounded-t-lg border-0 px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
              >
                <span className="hidden sm:inline">Dropped</span>
                <span className="sm:hidden">Drop</span> ({getTabCount("dropped")})
              </TabsTrigger>
              <TabsTrigger
                value="planToWatch"
                className="text-white data-[state=active]:text-white data-[state=active]:bg-blue-700 rounded-t-lg border-0 px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
              >
                <span className="hidden sm:inline">Plan to Watch</span>
                <span className="sm:hidden">Plan</span> ({getTabCount("planToWatch")})
              </TabsTrigger>
            </TabsList>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 overflow-x-hidden">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="px-4 py-8">
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : getCurrentList().length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  <p className="text-lg font-medium mb-2">No anime in your {activeTab} list</p>
                  <p className="text-sm mb-4">Start adding anime from the Trending or Recommendations pages!</p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <a 
                      href="/trending" 
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                    >
                      Browse Trending
                    </a>
                    <a 
                      href="/recommendations" 
                      className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-center"
                    >
                      Get Recommendations
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {getCurrentList().map((anime) => (
                    <AnimeCard
                      key={anime.id}
                      anime={{
                        id: anime.id,
                        title: anime.title,
                        titleEnglish: anime.titleEnglish,
                        titleRomaji: anime.titleRomaji,
                        coverImage: anime.coverImage,
                        episodes: anime.episodes,
                        averageScore: anime.averageScore,
                        genres: anime.genres,
                        studios: [],
                        seasonYear: undefined,
                        status: anime.status,
                        duration: undefined,
                        format: undefined,
                        season: undefined,
                        source: undefined,
                        startDate: undefined,
                        endDate: undefined,
                        nextAiringEpisode: undefined,
                        nextAiringTime: undefined,
                        description: undefined,
                        popularity: undefined,
                        bannerImage: undefined,
                      }}
                      showAddToList={false}
                      showRating={true}
                      userRating={anime.rating}
                      userStatus={anime.status}
                      userProgress={anime.progress}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 overflow-x-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {animeLists.watching.length + animeLists.completed.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Anime</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{animeLists.completed.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round(
                animeLists.watching.reduce((acc: number, anime: DashboardAnime) => acc + anime.progress, 0) / animeLists.watching.length,
              ) || 0}
              %
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Avg Progress</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {animeLists.planToWatch.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Plan to Watch</div>
          </div>
        </div>
      </div>
    </div>
  )
}
