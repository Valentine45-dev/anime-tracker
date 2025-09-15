import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { backgroundJobs } from '@/lib/background-jobs'

// Get admin dashboard data
export async function GET(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin()
    
    console.log('Fetching admin dashboard data...')
    
    // Get comprehensive dashboard data - only fetch from tables that exist
    const [
      { data: userStats, error: userError },
      { data: animeStats, error: animeError },
      { data: adminStats, error: adminError },
      { data: animeMetadataStats, error: metadataError }
    ] = await Promise.all([
      // User statistics from profiles table
      admin
        .from('profiles')
        .select('created_at, watch_time_hours, favorite_genres')
        .order('created_at', { ascending: false }),
      
      // Anime statistics from user_anime table
      admin
        .from('user_anime')
        .select('status, progress, created_at, user_rating, user_id'),
      
      // Admin statistics
      admin
        .from('admins')
        .select('created_at, role, is_active'),
      
      // Anime metadata statistics
      admin
        .from('anime_metadata')
        .select('created_at, score, genres')
        .limit(1000)
    ])

    // Log the fetched data for debugging
    console.log('User stats:', userStats?.length || 0)
    console.log('Anime stats:', animeStats?.length || 0)
    console.log('Admin stats:', adminStats?.length || 0)
    console.log('Anime metadata stats:', animeMetadataStats?.length || 0)

    // Handle errors gracefully - don't fail if some tables don't exist
    if (userError) {
      console.warn('User stats error (non-critical):', userError)
    }
    if (animeError) {
      console.warn('Anime stats error (non-critical):', animeError)
    }
    if (adminError) {
      console.warn('Admin stats error (non-critical):', adminError)
    }
    if (metadataError) {
      console.warn('Anime metadata stats error (non-critical):', metadataError)
    }

    // Calculate today's date for filtering
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000)

    // Process dashboard data with real calculations
    const dashboard = {
      overview: {
        totalUsers: userStats?.length || 0,
        newUsersToday: userStats?.filter((user: any) => 
          new Date(user.created_at) >= todayStart
        ).length || 0,
        totalAnimeEntries: animeStats?.length || 0,
        totalCommunities: 0, // Communities table doesn't exist yet
        totalWatchTime: Math.round(userStats?.reduce((sum: number, user: any) => sum + (user.watch_time_hours || 0), 0) || 0),
        totalAnimeMetadata: animeMetadataStats?.length || 0,
        averageAnimeScore: animeMetadataStats && animeMetadataStats.length > 0 
          ? Math.round(animeMetadataStats.reduce((sum: number, anime: any) => sum + (anime.score || 0), 0) / animeMetadataStats.length * 10) / 10
          : 0
      },
      users: {
        growth: calculateGrowthRate(userStats || []),
        topGenres: calculateTopGenres(userStats || []),
        averageWatchTime: calculateAverageWatchTime(userStats || [])
      },
      anime: {
        statusDistribution: calculateStatusDistribution(animeStats || []),
        averageRating: calculateAverageRating(animeStats || []),
        progressDistribution: calculateProgressDistribution(animeStats || [])
      },
      communities: {
        totalMembers: 0, // Communities table doesn't exist yet
        totalPosts: 0, // Communities table doesn't exist yet
        categoryDistribution: {} // Communities table doesn't exist yet
      },
      activity: {
        recentActivities: [], // Activity table doesn't exist yet
        activityTypes: {}, // Activity table doesn't exist yet
        peakHours: [] // Activity table doesn't exist yet
      },
      system: {
        unreadNotifications: 0, // Notifications table doesn't exist yet
        totalNotifications24h: 0, // Notifications table doesn't exist yet
        backgroundJobs: [], // Background jobs not implemented yet
        systemHealth: 'healthy',
        totalAdmins: adminStats?.length || 0,
        activeAdmins: adminStats?.filter((admin: any) => admin.is_active).length || 0
      }
    }

    console.log('Dashboard data processed:', {
      totalUsers: dashboard.overview.totalUsers,
      newUsersToday: dashboard.overview.newUsersToday,
      totalAnimeEntries: dashboard.overview.totalAnimeEntries,
      totalWatchTime: dashboard.overview.totalWatchTime
    })

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Unauthorized or server error' },
      { status: 500 }
    )
  }
}

// Helper functions for data processing
function calculateGrowthRate(users: any[]) {
  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const usersThisWeek = users.filter(user => new Date(user.created_at) > lastWeek).length
  const usersThisMonth = users.filter(user => new Date(user.created_at) > lastMonth).length
  
  return {
    weekly: usersThisWeek,
    monthly: usersThisMonth,
    growthRate: usersThisMonth > 0 ? ((usersThisWeek - usersThisMonth / 4) / (usersThisMonth / 4)) * 100 : 0
  }
}

function calculateTopGenres(users: any[]) {
  const genreCount: Record<string, number> = {}
  
  users.forEach(user => {
    if (user.favorite_genres) {
      user.favorite_genres.forEach((genre: string) => {
        genreCount[genre] = (genreCount[genre] || 0) + 1
      })
    }
  })
  
  return Object.entries(genreCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([genre, count]) => ({ genre, count }))
}

function calculateAverageWatchTime(users: any[]) {
  const totalWatchTime = users.reduce((sum, user) => sum + (user.watch_time_hours || 0), 0)
  return users.length > 0 ? totalWatchTime / users.length : 0
}

function calculateStatusDistribution(animeStats: any[]) {
  const distribution: Record<string, number> = {}
  
  animeStats.forEach(entry => {
    distribution[entry.status] = (distribution[entry.status] || 0) + 1
  })
  
  return distribution
}

function calculateAverageRating(animeStats: any[]) {
  const ratedEntries = animeStats.filter(entry => entry.user_rating)
  const totalRating = ratedEntries.reduce((sum, entry) => sum + entry.user_rating, 0)
  return ratedEntries.length > 0 ? totalRating / ratedEntries.length : 0
}

function calculateProgressDistribution(animeStats: any[]) {
  const ranges = [
    { range: '0-25%', min: 0, max: 25 },
    { range: '25-50%', min: 25, max: 50 },
    { range: '50-75%', min: 50, max: 75 },
    { range: '75-100%', min: 75, max: 100 }
  ]
  
  return ranges.map(({ range, min, max }) => ({
    range,
    count: animeStats.filter(entry => entry.progress >= min && entry.progress < max).length
  }))
}

function calculateCategoryDistribution(communities: any[]) {
  const distribution: Record<string, number> = {}
  
  communities.forEach(comm => {
    const category = comm.category || 'Other'
    distribution[category] = (distribution[category] || 0) + 1
  })
  
  return distribution
}

function calculateActivityTypes(activities: any[]) {
  const types: Record<string, number> = {}
  
  activities.forEach(activity => {
    types[activity.type] = (types[activity.type] || 0) + 1
  })
  
  return types
}

function calculatePeakHours(activities: any[]) {
  const hours: Record<number, number> = {}
  
  activities.forEach(activity => {
    const hour = new Date(activity.created_at).getHours()
    hours[hour] = (hours[hour] || 0) + 1
  })
  
  return Object.entries(hours)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
}
