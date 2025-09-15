import { NextRequest, NextResponse } from 'next/server'
import { getTrendingAnime, transformAniListAnime } from '@/lib/anilist'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '20')
    const sort = searchParams.get('sort') || 'trending'

    // Use different pages for variety when refreshing
    const actualPage = Math.floor(Math.random() * 5) + 1

    const response = await getTrendingAnime(actualPage, perPage)
    
    // Transform the data to our internal format
    const transformedAnime = response.Page.media.map(transformAniListAnime)

    // Sort based on the sort parameter
    let sortedAnime = [...transformedAnime]
    switch (sort) {
      case 'popularity':
        sortedAnime.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        break
      case 'score':
        sortedAnime.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
        break
      case 'favorites':
        sortedAnime.sort((a, b) => (b.favourites || 0) - (a.favourites || 0))
        break
      case 'trending':
      default:
        // Keep original order for trending
        break
    }

    return NextResponse.json({
      anime: sortedAnime,
      pageInfo: response.Page.pageInfo,
      sort,
      actualPage
    })
  } catch (error) {
    console.error('Get trending anime error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending anime' },
      { status: 500 }
    )
  }
}
