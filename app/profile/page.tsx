"use client"

import { useState, useEffect } from "react"
import { User, Mail, Calendar, Clock, Star, LogOut, Settings, Edit3, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSupabaseAuth } from "@/components/providers/supabase-auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ProfilePage() {
  const { user, profile, signOut, updateProfile } = useSupabaseAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
    favoriteGenres: profile?.favorite_genres || []
  })
  const [favoriteGenresInput, setFavoriteGenresInput] = useState("")

  // Initialize input field when profile loads
  useEffect(() => {
    if (profile?.favorite_genres) {
      setFavoriteGenresInput(profile.favorite_genres.join(", "))
    }
  }, [profile?.favorite_genres])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      // Process genres one final time before saving
      const finalGenres = favoriteGenresInput.split(",").map(g => g.trim()).filter(g => g)
      await updateProfile({
        name: formData.name,
        bio: formData.bio,
        favorite_genres: finalGenres
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setFormData({
      name: profile?.name || "",
      bio: profile?.bio || "",
      favoriteGenres: profile?.favorite_genres || []
    })
    setFavoriteGenresInput((profile?.favorite_genres || []).join(", "))
    setIsEditing(true)
  }

  const handleCancel = () => {
    setFormData({
      name: profile?.name || "",
      bio: profile?.bio || "",
      favoriteGenres: profile?.favorite_genres || []
    })
    setFavoriteGenresInput((profile?.favorite_genres || []).join(", "))
    setIsEditing(false)
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Please sign in</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You need to be signed in to view your profile.
            </p>
            <Link href="/auth/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your account settings</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="outline" size="sm">
                  ← Back to Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.name || "User"} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(getDisplayName())}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">
                  {getDisplayName()}
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Recently"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {profile?.watch_time_hours || 0} hours watched
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isLoading}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">
                      {profile?.name || "Not set"}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{user.email}</p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">
                      {profile?.bio || "No bio added yet"}
                    </p>
                  )}
                </div>

                {/* Favorite Genres */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Favorite Genres
                  </label>
                  {isEditing ? (
                    <Input
                      value={favoriteGenresInput}
                      onChange={(e) => {
                        const value = e.target.value
                        console.log('Input value:', value)
                        setFavoriteGenresInput(value)
                      }}
                      onBlur={() => {
                        // Process genres when user finishes typing
                        const genres = favoriteGenresInput.split(",").map(g => g.trim()).filter(g => g)
                        console.log('Processed genres on blur:', genres)
                        setFormData({ 
                          ...formData, 
                          favoriteGenres: genres
                        })
                      }}
                      onKeyDown={(e) => {
                        console.log('Key pressed:', e.key)
                        // Allow comma and other normal characters
                        if (e.key === ',') {
                          console.log('Comma key pressed')
                        }
                        // Process genres when Enter is pressed
                        if (e.key === 'Enter') {
                          const genres = favoriteGenresInput.split(",").map(g => g.trim()).filter(g => g)
                          console.log('Processed genres on Enter:', genres)
                          setFormData({ 
                            ...formData, 
                            favoriteGenres: genres
                          })
                        }
                      }}
                      placeholder="Action, Comedy, Drama (comma separated)"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile?.favorite_genres && profile.favorite_genres.length > 0 ? (
                        profile.favorite_genres.map((genre, index) => (
                          <Badge key={index} variant="secondary">
                            {genre}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500">No favorite genres set</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Watch Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Watch Time
                  </label>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">
                      {profile?.watch_time_hours || 0} hours
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
