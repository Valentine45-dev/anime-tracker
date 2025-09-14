import { NextRequest, NextResponse } from 'next/server'
import { searchAnimeMetadata } from '@/lib/supabase-anime'
import { searchAnime as searchAniList, transformAniListAnime } from '@/lib/anilist'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '20')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // First, try to search in our local anime metadata cache
    try {
      const localResults = await searchAnimeMetadata(query, perPage)
      
      if (localResults.length > 0) {
        return NextResponse.json({
          anime: localResults,
          source: 'local',
          pageInfo: {
            total: localResults.length,
            currentPage: 1,
            lastPage: 1,
            hasNextPage: false,
            perPage: localResults.length,
          },
        })
      }
    } catch (error) {
      console.warn('Local search failed, falling back to AniList API:', error)
    }

    // Fallback to AniList API if no local results
    const response = await searchAniList(query, page, perPage)
    
    // Transform the data to our internal format
    const transformedAnime = response.Page.media.map(transformAniListAnime)

    return NextResponse.json({
      anime: transformedAnime,
      source: 'anilist',
      pageInfo: response.Page.pageInfo,
    })
  } catch (error) {
    console.error('Search anime error:', error)
    return NextResponse.json(
      { error: 'Failed to search anime' },
      { status: 500 }
    )
  }
}
