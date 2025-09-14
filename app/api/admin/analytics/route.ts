import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// Get comprehensive analytics data
export async function GET(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin()
    
    // Get analytics data from multiple tables
    const [
      { data: userStats, error: userError },
      { data: animeStats, error: animeError },
      { data: communityStats, error: communityError },
      { data: activityStats, error: activityError }
    ] = await Promise.all([
      // User statistics
      admin
        .from('profiles')
        .select('created_at, watch_time_hours')
        .order('created_at', { ascending: false }),
      
      // Anime statistics
      admin
        .from('user_anime')
        .select('status, progress, created_at'),
      
      // Community statistics
      admin
        .from('communities')
        .select('member_count, post_count, created_at'),
      
      // Activity statistics
      admin
        .from('user_activities')
        .select('type, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    ])

    if (userError || animeError || communityError || activityError) {
      console.error('Analytics fetch errors:', { userError, animeError, communityError, activityError })
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      )
    }

    // Process analytics data
    const analytics = {
      users: {
        total: userStats?.length || 0,
        newThisMonth: userStats?.filter(user => 
          new Date(user.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length || 0,
        totalWatchTime: userStats?.reduce((sum, user) => sum + (user.watch_time_hours || 0), 0) || 0
      },
      anime: {
        totalEntries: animeStats?.length || 0,
        byStatus: animeStats?.reduce((acc, entry) => {
          acc[entry.status] = (acc[entry.status] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {},
        averageProgress: animeStats?.reduce((sum, entry) => sum + entry.progress, 0) / (animeStats?.length || 1) || 0
      },
      communities: {
        total: communityStats?.length || 0,
        totalMembers: communityStats?.reduce((sum, comm) => sum + comm.member_count, 0) || 0,
        totalPosts: communityStats?.reduce((sum, comm) => sum + comm.post_count, 0) || 0
      },
      activities: {
        last30Days: activityStats?.length || 0,
        byType: activityStats?.reduce((acc, activity) => {
          acc[activity.type] = (acc[activity.type] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}
      }
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Unauthorized or server error' },
      { status: 500 }
    )
  }
}
