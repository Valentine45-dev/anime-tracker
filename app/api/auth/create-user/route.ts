import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

// Check if email already exists (GET request)
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

    const admin = getSupabaseAdmin() as any
    
    console.log('Checking email existence for:', email)
    
    // Check if email already exists in profiles table
    const { data: existingProfile, error } = await admin
      .from('profiles')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .single()

    console.log('Database query result:', { existingProfile, error })

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking email existence:', error)
      return NextResponse.json(
        { error: 'Failed to check email availability' },
        { status: 500 }
      )
    }

    // PGRST116 means no rows found, so email is available
    const exists = !!existingProfile
    console.log('Email exists:', exists)

    return NextResponse.json({ exists })
  } catch (error) {
    console.error('Create user check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create user profile (POST request)
export async function POST(request: NextRequest) {
  try {
    const { userId, email, name } = await request.json()

    if (!userId || !email || !name) {
      return NextResponse.json(
        { error: 'User ID, email, and name are required' },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin() as any
    
    // Create user profile
    const { data: profile, error } = await admin
      .from('profiles')
      .insert({
        id: userId,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      profile 
    })
  } catch (error) {
    console.error('Create user profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
