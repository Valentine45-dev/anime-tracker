import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getUserAnimeList, addAnimeToList } from '@/lib/supabase-anime'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Get user's anime list
    const animeList = await getUserAnimeList(user.id, status || undefined)

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
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    // Add anime to user's list
    const animeListEntry = await addAnimeToList(
      user.id,
      animeMetadataId,
      status,
      progress,
      userRating,
      notes,
      startDate,
      finishDate,
      isFavorite
    )

    return NextResponse.json({
      animeListEntry,
      message: 'Anime added to list successfully',
    })
  } catch (error) {
    console.error('Add anime to list error:', error)
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'Anime already exists in your list' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add anime to list' },
      { status: 500 }
    )
  }
}
