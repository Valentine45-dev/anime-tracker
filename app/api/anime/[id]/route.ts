import { NextRequest, NextResponse } from 'next/server'
import { getAnimeById, transformAniListAnime } from '@/lib/anilist'
import { getAnimeMetadata, insertAnimeMetadata } from '@/lib/supabase-anime'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const animeId = parseInt(resolvedParams.id)

    if (isNaN(animeId)) {
      return NextResponse.json(
        { error: 'Invalid anime ID' },
        { status: 400 }
      )
    }

    // First try to get from our database
    try {
      const animeMetadata = await getAnimeMetadata(animeId)
      if (animeMetadata) {
        // Transform the database data to match our interface
        const transformedAnime = {
          id: animeMetadata.id,
          title: animeMetadata.title,
          titleEnglish: animeMetadata.title_english,
          titleRomaji: animeMetadata.title_japanese,
          coverImage: animeMetadata.image_url,
          bannerImage: null,
          episodes: animeMetadata.episodes,
          averageScore: animeMetadata.score,
          genres: animeMetadata.genres || [],
          studios: animeMetadata.studios || [],
          seasonYear: animeMetadata.year,
          status: animeMetadata.status,
          description: animeMetadata.synopsis,
          popularity: null,
          duration: animeMetadata.duration_minutes,
          format: null,
          season: animeMetadata.season,
          source: null,
          startDate: animeMetadata.aired_from,
          endDate: animeMetadata.aired_to,
          nextAiringEpisode: null,
          nextAiringTime: null,
          tags: [],
          characters: [],
          staff: []
        }
        return NextResponse.json(transformedAnime)
      }
    } catch (dbError) {
      console.log('Anime not found in database, fetching from AniList API')
    }

    // If not in database, fetch from AniList API and cache it
    try {
      console.log(`Fetching anime ${animeId} from AniList API...`)
      const anime = await getAnimeById(animeId)
      console.log('AniList API response:', anime)
      const transformedAnime = transformAniListAnime(anime)
      console.log('Transformed anime:', transformedAnime)
      
      // Cache the anime data in our database for future requests
      const animeDataToCache = {
        id: animeId,
        mal_id: anime.id, // Use AniList ID as MAL ID for now
        anilist_id: animeId,
        title: transformedAnime.title,
        title_english: transformedAnime.titleEnglish || null,
        title_japanese: transformedAnime.titleRomaji || null,
        synopsis: transformedAnime.description || null,
        episodes: transformedAnime.episodes || null,
        duration_minutes: transformedAnime.duration || null,
        status: transformedAnime.status || null,
        aired_from: transformedAnime.startDate?.toISOString().split('T')[0] || null,
        aired_to: transformedAnime.endDate?.toISOString().split('T')[0] || null,
        season: transformedAnime.season || null,
        year: transformedAnime.seasonYear || null,
        rating: null,
        score: transformedAnime.averageScore || null,
        genres: transformedAnime.genres || [],
        studios: transformedAnime.studios || [],
        image_url: transformedAnime.coverImage || null,
        trailer_url: null,
      }
      
      try {
        await insertAnimeMetadata(animeDataToCache)
        console.log('Anime data cached in database')
      } catch (cacheError) {
        console.error('Failed to cache anime data:', cacheError)
        console.error('Anime data that failed to cache:', animeDataToCache)
        console.log('Continuing without caching - this is not critical')
        // Continue even if caching fails - this is not critical for the user experience
      }
      
      return NextResponse.json(transformedAnime)
    } catch (anilistError) {
      console.error('AniList API error:', anilistError)
      console.error('Error details:', {
        message: anilistError instanceof Error ? anilistError.message : 'Unknown error',
        stack: anilistError instanceof Error ? anilistError.stack : undefined,
        animeId
      })
      return NextResponse.json(
        { 
          error: 'Anime not found',
          details: anilistError instanceof Error ? anilistError.message : 'Unknown error'
        },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Get anime by ID error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch anime details' },
      { status: 500 }
    )
  }
}
