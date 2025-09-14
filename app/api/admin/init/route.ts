import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminAuth } from '@/lib/admin-auth'

// Initialize first admin user
export async function POST(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin()
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Check if any admins already exist
    const { data: existingAdmins, error: checkError } = await admin
      .from('admins')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error('Error checking existing admins:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing admins' },
        { status: 500 }
      )
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json(
        { error: 'Admin system already initialized' },
        { status: 409 }
      )
    }

    // Create new user
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name
      }
    })

    if (authError) {
      console.error('Error creating user:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create profile
    const { error: profileError } = await admin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        name
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Continue anyway, profile can be created later
    }

    // Create admin record
    const { data: adminData, error: adminError } = await admin
      .from('admins')
      .insert({
        user_id: authData.user.id,
        email: authData.user.email!,
        role: 'super_admin',
        permissions: ['read', 'write', 'delete', 'admin'],
        created_by: authData.user.id // First admin creates themselves
      })
      .select()
      .single()

    if (adminError) {
      console.error('Error creating admin:', adminError)
      return NextResponse.json(
        { error: 'Failed to create admin record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Super admin created successfully',
      admin: {
        id: adminData.id,
        email: adminData.email,
        role: adminData.role,
        permissions: adminData.permissions
      },
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name
      }
    })
  } catch (error) {
    console.error('Admin init error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Check if admin system is initialized
export async function GET() {
  try {
    const admin = getSupabaseAdmin()
    
    const { data: admins, error } = await admin
      .from('admins')
      .select('id, email, role, created_at')
      .limit(1)

    if (error) {
      console.error('Error checking admin system:', error)
      return NextResponse.json(
        { error: 'Failed to check admin system' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      initialized: admins && admins.length > 0,
      adminCount: admins?.length || 0
    })
  } catch (error) {
    console.error('Admin init check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
