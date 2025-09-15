"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function TestPage() {
  // Popular anime IDs from AniList for testing
  const popularAnimeIds = [
    { id: 16498, name: "Attack on Titan" },
    { id: 1535, name: "Death Note" },
    { id: 11061, name: "Hunter x Hunter (2011)" },
    { id: 9253, name: "Steins;Gate" },
    { id: 1, name: "Cowboy Bebop" },
    { id: 5114, name: "Fullmetal Alchemist: Brotherhood" },
    { id: 1735, name: "Naruto" },
    { id: 31964, name: "Boku no Hero Academia" },
    { id: 28851, name: "Kimi no Na wa" },
    { id: 223, name: "Dragon Ball Z" }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Test Page - Real Anime Data
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Test the anime tracking functionality with real anime data from AniList API.
          </p>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Anime Details Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Click on any anime below to test the anime details page with real data from AniList API.
                  The data will be fetched from AniList and cached in your Supabase database.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {popularAnimeIds.map((anime) => (
                    <Link key={anime.id} href={`/anime/${anime.id}`}>
                      <Button variant="outline" className="w-full h-auto p-3 flex flex-col items-center text-center">
                        <span className="font-medium text-sm">{anime.name}</span>
                        <span className="text-xs text-gray-500">ID: {anime.id}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Pages with Real Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Test the main pages that fetch real anime data from AniList API.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/trending">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                      <span className="font-medium">Trending</span>
                      <span className="text-xs text-gray-500">Real trending anime</span>
                    </Button>
                  </Link>
                  <Link href="/recommendations">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                      <span className="font-medium">Recommendations</span>
                      <span className="text-xs text-gray-500">AI recommendations</span>
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                      <span className="font-medium">Dashboard</span>
                      <span className="text-xs text-gray-500">Your anime list</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How to Test</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start space-x-2">
                    <span className="font-medium text-blue-600">1.</span>
                    <span>Click on any anime above to view its details page</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-medium text-blue-600">2.</span>
                    <span>Try rating the anime using the star rating system</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-medium text-blue-600">3.</span>
                    <span>Add anime to your list with different statuses</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-medium text-blue-600">4.</span>
                    <span>Test the trending and recommendations pages</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-medium text-blue-600">5.</span>
                    <span>Check your dashboard to see your anime list</span>
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
