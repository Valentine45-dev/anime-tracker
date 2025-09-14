import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

// Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await requireAdmin(request, 'admin', 'read')
    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const admin = getSupabaseAdmin()
    
    // Get all profiles with user stats
    const { data: profiles, error } = await admin
      .from('profiles')
      .select(`
        *,
        user_anime(count),
        user_activities(count),
        reviews(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Log admin action
    await adminAuth.logAction(
      authResult.userId,
      'view_users',
      'users',
      undefined,
      { count: profiles?.length || 0 }
    )

    return NextResponse.json({
      users: profiles,
      total: profiles?.length || 0
    })
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Unauthorized or server error' },
      { status: 500 }
    )
  }
}

// Get user statistics
export async function POST(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin()
    
    const { data: stats, error } = await admin.rpc('get_user_statistics')
    
    if (error) {
      console.error('Error fetching user stats:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user statistics' },
        { status: 500 }
      )
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Admin stats API error:', error)
    return NextResponse.json(
      { error: 'Unauthorized or server error' },
      { status: 500 }
    )
  }
}
