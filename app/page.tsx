"use client"

import { useState, useEffect } from "react"
import { Search, Star, Edit3, Plus, Menu, Bell, User, TrendingUp, Users, Brain, Moon, Sun, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  const { user, profile, signOut } = useSupabaseAuth()
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

  // Fetch anime data for each status
  const fetchAnimeData = async (status: string) => {
    try {
      const response = await fetch(`/api/dashboard/anime?status=${status}&limit=8`)
      const data = await response.json()
      
      if (data.anime) {
        setAnimeLists(prev => ({
          ...prev,
          [status]: data.anime
        }))
      }
    } catch (error) {
      console.error(`Error fetching ${status} anime:`, error)
    }
  }

  // Load all anime data on component mount
  useEffect(() => {
    const loadAllAnime = async () => {
      setIsLoading(true)
      const statuses = ['watching', 'completed', 'onHold', 'dropped', 'planToWatch']
      
      await Promise.all(statuses.map(status => fetchAnimeData(status)))
      setIsLoading(false)
    }

    loadAllAnime()
  }, [])

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-700 text-white sticky top-0 z-50">
        <div className="px-4 py-3">
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
                        {getInitials(profile?.name || user?.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{profile?.name || user?.email?.split("@")[0] || "User"}</p>
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
            <h2 className="text-lg font-semibold">Welcome back, {profile?.name || user?.email}! 👋</h2>
            <p className="text-blue-100 text-sm">You have {animeLists.watching.length} anime in progress</p>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-0 p-0 h-auto space-x-0 overflow-x-auto">
              <TabsTrigger
                value="watching"
                className="text-white data-[state=active]:text-white data-[state=active]:bg-blue-700 rounded-t-lg border-0 px-3 py-2 text-sm whitespace-nowrap"
              >
                Watching ({getTabCount("watching")})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="text-white data-[state=active]:text-white data-[state=active]:bg-blue-700 rounded-t-lg border-0 px-3 py-2 text-sm whitespace-nowrap"
              >
                Completed ({getTabCount("completed")})
              </TabsTrigger>
              <TabsTrigger
                value="onHold"
                className="text-white data-[state=active]:text-white data-[state=active]:bg-blue-700 rounded-t-lg border-0 px-3 py-2 text-sm whitespace-nowrap"
              >
                On-Hold ({getTabCount("onHold")})
              </TabsTrigger>
              <TabsTrigger
                value="dropped"
                className="text-white data-[state=active]:text-white data-[state=active]:bg-blue-700 rounded-t-lg border-0 px-3 py-2 text-sm whitespace-nowrap"
              >
                Dropped ({getTabCount("dropped")})
              </TabsTrigger>
              <TabsTrigger
                value="planToWatch"
                className="text-white data-[state=active]:text-white data-[state=active]:bg-blue-700 rounded-t-lg border-0 px-3 py-2 text-sm whitespace-nowrap"
              >
                Plan to Watch ({getTabCount("planToWatch")})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800">
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
                  <p className="text-lg font-medium mb-2">No anime in this list</p>
                  <p className="text-sm">Start adding anime to your {activeTab} list!</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {getCurrentList().map((anime, index) => (
                <div key={anime.id} className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    {/* Anime Cover */}
                    <div className="flex-shrink-0">
                      <Link href={`/anime/${anime.id}`}>
                        <Image
                          src={anime.coverImage || "/placeholder.jpg"}
                          alt={anime.title}
                          width={45}
                          height={60}
                          className="rounded object-cover hover:opacity-80 transition-opacity cursor-pointer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.jpg";
                          }}
                        />
                      </Link>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <Link href={`/anime/${anime.id}`}>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate pr-2 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                              {anime.title}
                            </h3>
                          </Link>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {anime.genre}
                            </Badge>
                            {activeTab === "watching" && "streamingPlatform" in anime && (
                              <Badge variant="outline" className="text-xs">
                                {anime.streamingPlatform}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between">
                        <span>{anime.episodes}</span>
                        {activeTab === "watching" && "nextEpisode" in anime && (
                          <span className="text-blue-600 dark:text-blue-400">Next: {anime.nextEpisode}</span>
                        )}
                        {activeTab === "completed" && "completedDate" in anime && (
                          <span>Completed: {anime.completedDate}</span>
                        )}
                        {activeTab === "planToWatch" && "addedDate" in anime && <span>Added: {anime.addedDate}</span>}
                      </div>

                      {/* Rating */}
                      {anime.rating > 0 && <div className="mb-2">{renderStars(anime.rating)}</div>}

                      {/* Progress Bar */}
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <Progress value={anime.progress} className="flex-1 mr-2" />
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {anime.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4">
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
