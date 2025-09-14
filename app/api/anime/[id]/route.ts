import { NextRequest, NextResponse } from 'next/server'
import { getAnimeById, transformAniListAnime } from '@/lib/anilist'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const animeId = parseInt(params.id)

    if (isNaN(animeId)) {
      return NextResponse.json(
        { error: 'Invalid anime ID' },
        { status: 400 }
      )
    }

    const anime = await getAnimeById(animeId)
    const transformedAnime = transformAniListAnime(anime)

    return NextResponse.json({ anime: transformedAnime })
  } catch (error) {
    console.error('Get anime by ID error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch anime details' },
      { status: 500 }
    )
  }
}
