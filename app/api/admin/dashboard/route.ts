import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { backgroundJobs } from '@/lib/background-jobs'

// Get admin dashboard data
export async function GET(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin()
    
    // Get comprehensive dashboard data
    const [
      { data: userStats, error: userError },
      { data: animeStats, error: animeError },
      { data: communityStats, error: communityError },
      { data: recentActivity, error: activityError },
      { data: systemHealth, error: healthError }
    ] = await Promise.all([
      // User statistics
      admin
        .from('profiles')
        .select('created_at, watch_time_hours, favorite_genres')
        .order('created_at', { ascending: false })
        .limit(1000),
      
      // Anime statistics
      admin
        .from('user_anime')
        .select('status, progress, created_at, user_rating'),
      
      // Community statistics
      admin
        .from('communities')
        .select('member_count, post_count, created_at, category'),
      
      // Recent activity
      admin
        .from('user_activities')
        .select('type, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(100),
      
      // System health (notifications, reports, etc.)
      admin
        .from('notifications')
        .select('is_read, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ])

    if (userError || animeError || communityError || activityError || healthError) {
      console.error('Dashboard fetch errors:', { userError, animeError, communityError, activityError, healthError })
      return NextResponse.json(
        { error: 'Failed to fetch dashboard data' },
        { status: 500 }
      )
    }

    // Process dashboard data
    const dashboard = {
      overview: {
        totalUsers: userStats?.length || 0,
        newUsersToday: userStats?.filter(user => 
          new Date(user.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length || 0,
        totalAnimeEntries: animeStats?.length || 0,
        totalCommunities: communityStats?.length || 0,
        totalWatchTime: userStats?.reduce((sum, user) => sum + (user.watch_time_hours || 0), 0) || 0
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
        totalMembers: communityStats?.reduce((sum, comm) => sum + comm.member_count, 0) || 0,
        totalPosts: communityStats?.reduce((sum, comm) => sum + comm.post_count, 0) || 0,
        categoryDistribution: calculateCategoryDistribution(communityStats || [])
      },
      activity: {
        recentActivities: recentActivity?.slice(0, 10) || [],
        activityTypes: calculateActivityTypes(recentActivity || []),
        peakHours: calculatePeakHours(recentActivity || [])
      },
      system: {
        unreadNotifications: systemHealth?.filter(n => !n.is_read).length || 0,
        totalNotifications24h: systemHealth?.length || 0,
        backgroundJobs: backgroundJobs.getAllJobs().slice(-10), // Last 10 jobs
        systemHealth: 'healthy' // TODO: Implement actual health checks
      }
    }

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
