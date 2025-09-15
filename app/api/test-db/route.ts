import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('anime_metadata')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Database connection error:', error)
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }

    // Test user_anime table
    const { data: userAnimeData, error: userAnimeError } = await supabase
      .from('user_anime')
      .select('count')
      .limit(1)

    if (userAnimeError) {
      console.error('User anime table error:', userAnimeError)
      return NextResponse.json(
        { 
          error: 'User anime table access failed',
          details: userAnimeError.message,
          code: userAnimeError.code
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      animeMetadataTable: 'accessible',
      userAnimeTable: 'accessible'
    })
  } catch (error) {
    console.error('Test database error:', error)
    return NextResponse.json(
      { 
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
