import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// Send system notifications to users
export async function POST(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin()
    const { type, title, message, userIds, metadata } = await request.json()

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Type, title, and message are required' },
        { status: 400 }
      )
    }

    let targetUsers: string[] = []

    if (userIds && Array.isArray(userIds)) {
      // Send to specific users
      targetUsers = userIds
    } else {
      // Send to all users
      const { data: allUsers, error: usersError } = await admin
        .from('profiles')
        .select('id')
      
      if (usersError) {
        console.error('Error fetching users:', usersError)
        return NextResponse.json(
          { error: 'Failed to fetch users' },
          { status: 500 }
        )
      }
      
      targetUsers = allUsers?.map(user => user.id) || []
    }

    // Create notifications for all target users
    const notifications = targetUsers.map(userId => ({
      user_id: userId,
      type,
      title,
      message,
      data: metadata || {},
      is_read: false
    }))

    const { data, error } = await admin
      .from('notifications')
      .insert(notifications)

    if (error) {
      console.error('Error creating notifications:', error)
      return NextResponse.json(
        { error: 'Failed to send notifications' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `Notifications sent to ${targetUsers.length} users`,
      count: targetUsers.length
    })
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { error: 'Unauthorized or server error' },
      { status: 500 }
    )
  }
}

// Get system notification templates
export async function GET(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin()
    
    const { data: notifications, error } = await admin
      .from('notifications')
      .select('type, title, message, created_at')
      .eq('type', 'system')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      )
    }

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Notifications GET API error:', error)
    return NextResponse.json(
      { error: 'Unauthorized or server error' },
      { status: 500 }
    )
  }
}
