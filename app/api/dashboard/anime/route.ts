import { NextRequest, NextResponse } from 'next/server'
import { getTrendingAnime, transformAniListAnime } from '@/lib/anilist'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'watching'
    const limit = parseInt(searchParams.get('limit') || '8')

    // Fetch different anime based on status
    let response
    let page = 1

    switch (status) {
      case 'watching':
        // Get currently airing anime
        page = 1
        break
      case 'completed':
        // Get completed popular anime
        page = 2
        break
      case 'onHold':
        // Get different page for variety
        page = 3
        break
      case 'dropped':
        // Get different page for variety
        page = 4
        break
      case 'planToWatch':
        // Get upcoming or popular anime
        page = 5
        break
      default:
        page = 1
    }

    response = await getTrendingAnime(page, limit)
    
    // Transform the data to our internal format
    const transformedAnime = response.Page.media.map(transformAniListAnime)

    // Add dashboard-specific metadata
    const dashboardAnime = transformedAnime.map((anime, index) => {
      // Generate random progress and ratings for demo purposes
      const progress = Math.floor(Math.random() * 100)
      const rating = Math.floor(Math.random() * 5) + 1
      
      // Generate status-specific data
      let statusData = {}
      
      switch (status) {
        case 'watching':
          statusData = {
            episodes: `${Math.floor(Math.random() * (anime.episodes || 12))} / ${anime.episodes || '??'} EP`,
            progress: progress,
            nextEpisode: progress < 100 ? ['Tomorrow', 'Friday', 'Sunday', 'Next Week'][Math.floor(Math.random() * 4)] : 'Completed',
            streamingPlatform: ['Crunchyroll', 'Funimation', 'Netflix', 'Hulu'][Math.floor(Math.random() * 4)]
          }
          break
        case 'completed':
          statusData = {
            episodes: `${anime.episodes || '??'} / ${anime.episodes || '??'} EP`,
            progress: 100,
            completedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
          break
        case 'onHold':
          statusData = {
            episodes: `${Math.floor(Math.random() * (anime.episodes || 12))} / ${anime.episodes || '??'} EP`,
            progress: Math.floor(Math.random() * 80) + 10,
            onHoldDate: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
          break
        case 'dropped':
          statusData = {
            episodes: `${Math.floor(Math.random() * (anime.episodes || 12))} / ${anime.episodes || '??'} EP`,
            progress: Math.floor(Math.random() * 50) + 5,
            droppedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
          break
        case 'planToWatch':
          statusData = {
            episodes: anime.episodes ? `${anime.episodes} EP` : 'TBA',
            progress: 0,
            addedDate: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
          break
      }

      return {
        ...anime,
        rating,
        ...statusData,
        genre: anime.genres?.[0] || 'Unknown',
        progressColor: getProgressColor(progress),
        coverImage: anime.coverImage || '/placeholder.jpg'
      }
    })

    return NextResponse.json({
      anime: dashboardAnime,
      status,
      pageInfo: response.Page.pageInfo
    })
  } catch (error) {
    console.error('Get dashboard anime error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard anime' },
      { status: 500 }
    )
  }
}

// Helper function to get progress color based on progress percentage
function getProgressColor(progress: number): string {
  if (progress >= 90) return 'bg-green-500'
  if (progress >= 70) return 'bg-blue-500'
  if (progress >= 50) return 'bg-yellow-500'
  if (progress >= 30) return 'bg-orange-500'
  return 'bg-red-500'
}
