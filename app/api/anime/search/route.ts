import { NextRequest, NextResponse } from 'next/server'
import { searchAnime, transformAniListAnime } from '@/lib/anilist'

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

    const response = await searchAnime(query, page, perPage)
    
    // Transform the data to our internal format
    const transformedAnime = response.Page.media.map(transformAniListAnime)

    return NextResponse.json({
      anime: transformedAnime,
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
