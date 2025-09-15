"use client"

import { useState } from "react"
import { Users, MessageCircle, Heart, Share, Plus, Search, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const communities = [
    {
      id: 1,
      name: "Shonen Anime Lovers",
      description: "Discuss your favorite action-packed shonen anime series",
      members: 15420,
      posts: 2341,
      image: "/placeholder.jpg?height=100&width=100&text=Shonen",
      isJoined: true,
      category: "Genre",
      trending: true,
    },
    {
      id: 2,
      name: "Studio Ghibli Fans",
      description: "Celebrating the magical world of Studio Ghibli films",
      members: 8932,
      posts: 1205,
      image: "/placeholder.jpg?height=100&width=100&text=Ghibli",
      isJoined: false,
      category: "Studio",
      trending: false,
    },
    {
      id: 3,
      name: "Anime Recommendations",
      description: "Get and share anime recommendations with fellow otakus",
      members: 23567,
      posts: 4521,
      image: "/placeholder.jpg?height=100&width=100&text=Recs",
      isJoined: true,
      category: "General",
      trending: true,
    },
    {
      id: 4,
      name: "Manga Readers Club",
      description: "For those who prefer reading the source material",
      members: 12043,
      posts: 1876,
      image: "/placeholder.jpg?height=100&width=100&text=Manga",
      isJoined: false,
      category: "Manga",
      trending: false,
    },
  ]

  const recentPosts = [
    {
      id: 1,
      title: "What's your favorite anime opening of all time?",
      author: "AnimeOtaku2024",
      community: "Shonen Anime Lovers",
      replies: 127,
      likes: 89,
      timeAgo: "2 hours ago",
      hasImage: true,
    },
    {
      id: 2,
      title: "Just finished Spirited Away for the 10th time and I'm still crying",
      author: "GhibliLover",
      community: "Studio Ghibli Fans",
      replies: 45,
      likes: 156,
      timeAgo: "4 hours ago",
      hasImage: false,
    },
    {
      id: 3,
      title: "Looking for anime similar to Death Note",
      author: "MysteryFan",
      community: "Anime Recommendations",
      replies: 73,
      likes: 34,
      timeAgo: "6 hours ago",
      hasImage: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communities</h1>
                <p className="text-gray-600 dark:text-gray-400">Connect with fellow anime enthusiasts</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Community
              </Button>
              <Link href="/">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="joined">My Communities</TabsTrigger>
            <TabsTrigger value="posts">Recent Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community) => (
                <Card key={community.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={community.image || "/placeholder.jpg"}
                          alt={community.name}
                          width={50}
                          height={50}
                          className="rounded-lg"
                        />
                        <div>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <span>{community.name}</span>
                            {community.trending && <TrendingUp className="w-4 h-4 text-orange-500" />}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {community.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{community.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{community.members.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{community.posts.toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                    <Button
                      className={`w-full ${
                        community.isJoined ? "bg-gray-600 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {community.isJoined ? "Joined" : "Join Community"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="joined">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities
                .filter((c) => c.isJoined)
                .map((community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={community.image || "/placeholder.jpg"}
                          alt={community.name}
                          width={50}
                          height={50}
                          className="rounded-lg"
                        />
                        <div>
                          <CardTitle className="text-lg">{community.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {community.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{community.description}</p>
                      <div className="flex space-x-2">
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">View Posts</Button>
                        <Button variant="outline" size="sm">
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="posts">
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {post.author[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">{post.author}</span>
                          <span className="text-gray-400">•</span>
                          <Badge variant="outline" className="text-xs">
                            {post.community}
                          </Badge>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{post.timeAgo}</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{post.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <button className="flex items-center space-x-1 hover:text-blue-600">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.replies}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-red-600">
                            <Heart className="w-4 h-4" />
                            <span>{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-green-600">
                            <Share className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
