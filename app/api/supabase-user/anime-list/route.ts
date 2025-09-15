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

    if (!animeMetadataId) {
      return NextResponse.json(
        { error: 'Anime metadata ID is required' },
        { status: 400 }
      )
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
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'Anime already exists in your list' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add/update anime to list' },
      { status: 500 }
    )
  }
}