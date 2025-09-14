import { NextRequest, NextResponse } from 'next/server'
import { getTrendingAnime, transformAniListAnime } from '@/lib/anilist'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '20')

    const response = await getTrendingAnime(page, perPage)
    
    // Transform the data to our internal format
    const transformedAnime = response.Page.media.map(transformAniListAnime)

    return NextResponse.json({
      anime: transformedAnime,
      pageInfo: response.Page.pageInfo,
    })
  } catch (error) {
    console.error('Get trending anime error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending anime' },
      { status: 500 }
    )
  }
}
