import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserAnimeList, addAnimeToList } from '@/lib/supabase-anime'
import { getCurrentUserId, isAuthenticated } from '@/lib/auth-helper'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const userId = getCurrentUserId()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const animeId = searchParams.get('animeId')

    // If specific anime ID is requested, get that anime's data
    if (animeId) {
      const animeIdNum = parseInt(animeId)
      if (isNaN(animeIdNum)) {
        return NextResponse.json(
          { error: 'Invalid anime ID' },
          { status: 400 }
        )
      }

      const { data: animeData, error } = await supabase
        .from('user_anime')
        .select(`
          *,
          anime_metadata:anime_metadata_id (*)
        `)
        .eq('user_id', userId)
        .eq('anime_metadata_id', animeIdNum)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ animeList: [] })
        }
        throw error
      }

      return NextResponse.json({
        animeList: [animeData],
      })
    }

    // Get user's anime list
    const animeList = await getUserAnimeList(userId, status || undefined)

    return NextResponse.json({
      animeList,
      status,
    })
  } catch (error) {
    console.error('Get anime list error:', error)
    return NextResponse.json(
      { error: 'Failed to get anime list' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const userId = getCurrentUserId()

    const body = await request.json()
    console.log('Received request body:', body)
    const {
      animeMetadataId,
      status = 'plan-to-watch',
      progress = 0,
      userRating,
      notes,
      startDate,
      finishDate,
      isFavorite = false,
    } = body
    
    console.log('Extracted animeMetadataId:', animeMetadataId)

    if (!animeMetadataId) {
      return NextResponse.json(
        { error: 'Anime metadata ID is required' },
        { status: 400 }
      )
    }

    // First, ensure the anime metadata exists in our database
    // If not, fetch it from AniList API and cache it
    let { data: animeMetadata, error: metadataError } = await supabase
      .from('anime_metadata')
      .select('*')
      .eq('id', animeMetadataId)
      .single()

    if (metadataError || !animeMetadata) {
      // Anime not in database, fetch from AniList API
      try {
        console.log(`Fetching anime ${animeMetadataId} from API...`)
        const animeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/anime/${animeMetadataId}`)
        
        console.log('Anime API response status:', animeResponse.status)
        
        if (!animeResponse.ok) {
          const errorData = await animeResponse.json()
          console.error('Anime API error:', errorData)
          throw new Error(`Failed to fetch anime data: ${errorData.error || 'Unknown error'}`)
        }
        
        const animeData = await animeResponse.json()
        console.log('Anime data received:', animeData)
        
        // The anime API route will cache the data, so try to get it again
        const { data: cachedMetadata } = await supabase
          .from('anime_metadata')
          .select('*')
          .eq('id', animeMetadataId)
          .single()
        
        if (!cachedMetadata) {
          console.error('Anime was not cached in database after API call')
          // Create a minimal anime metadata entry for the user's list
          animeMetadata = {
            id: animeMetadataId,
            mal_id: animeMetadataId,
            anilist_id: animeMetadataId,
            title: 'Unknown Title',
            title_english: null,
            title_japanese: null,
            synopsis: null,
            episodes: null,
            duration_minutes: null,
            status: null,
            aired_from: null,
            aired_to: null,
            season: null,
            year: null,
            rating: null,
            score: null,
            genres: [],
            studios: [],
            image_url: null,
            trailer_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          console.log('Using minimal anime metadata:', animeMetadata)
        } else {
          animeMetadata = cachedMetadata
          console.log('Anime metadata retrieved from cache:', animeMetadata)
        }
      } catch (error) {
        console.error('Error fetching anime metadata:', error)
        return NextResponse.json(
          { 
            error: 'Failed to fetch anime data',
            details: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 404 }
        )
      }
    }

    // Check if anime already exists in user's list
    const { data: existingEntry } = await supabase
      .from('user_anime')
      .select('id')
      .eq('user_id', userId)
      .eq('anime_metadata_id', animeMetadataId)
      .single()

    let animeListEntry

    if (existingEntry) {
      // Update existing entry
      const { data, error } = await supabase
        .from('user_anime')
        .update({
          status,
          progress,
          user_rating: userRating,
          notes,
          start_date: startDate,
          finish_date: finishDate,
          is_favorite: isFavorite,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingEntry.id)
        .eq('user_id', userId)
        .select(`
          *,
          anime_metadata:anime_metadata_id (*)
        `)
        .single()

      if (error) {
        throw error
      }

      animeListEntry = data
    } else {
      // Add new anime to user's list
      animeListEntry = await addAnimeToList(
        userId,
        animeMetadataId,
        status,
        progress,
        userRating,
        notes,
        startDate,
        finishDate,
        isFavorite
      )
    }

    return NextResponse.json({
      animeListEntry,
      message: existingEntry ? 'Anime updated successfully' : 'Anime added to list successfully',
    })
  } catch (error) {
    console.error('Add/Update anime to list error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: getCurrentUserId(),
      animeMetadataId: 'unknown'
    })
    
    // Check if it's a database schema error
    if (error instanceof Error && error.message.includes('numeric field overflow')) {
      return NextResponse.json(
        { 
          error: 'Database schema needs to be updated. Please run the SQL fix in Supabase.',
          details: 'The score field needs to be changed to DECIMAL(5,2) to handle anime scores 0-100'
        },
        { status: 500 }
      )
    }
    
    // Check if it's an RLS policy violation
    if (error instanceof Error && error.message.includes('row-level security policy')) {
      return NextResponse.json(
        { 
          error: 'Row Level Security policy violation. Please run the RLS fix in Supabase.',
          details: 'The RLS policy needs to be updated to allow the development user ID'
        },
        { status: 500 }
      )
    }
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'Anime already exists in your list' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to add/update anime to list',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}