import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/user-service'
import { getSupabaseAdmin } from '@/lib/supabase'
import { logger } from '@/lib/logger'

// Create user profile after Supabase auth user is created
export async function POST(request: NextRequest) {
  try {
    const { userId, email, name } = await request.json()

    if (!userId || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email, name' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if user already exists in profiles table
    const userExists = await userService.checkUserExists(email)
    if (userExists) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Create user profile
    const result = await userService.createUserProfile(userId, email, name)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create user profile' },
        { status: 500 }
      )
    }

    logger.info('User profile created successfully via API:', { userId, email } as Record<string, any>)

    return NextResponse.json({
      success: true,
      profile: result.profile,
      message: 'User profile created successfully'
    })

  } catch (error) {
    logger.error('Error in create-user API:', error as Record<string, any>)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Check if user exists (for signup validation)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const userExists = await userService.checkUserExists(email)
    
    return NextResponse.json({
      exists: userExists,
      email: email
    })

  } catch (error) {
    logger.error('Error in check-user API:', error as Record<string, any>)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
