import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminAuth } from '@/lib/admin-auth'

// Create admin record for existing user
export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const admin = getSupabaseAdmin()
    
    // Verify JWT token
    const { data: { user }, error } = await admin.auth.getUser(token)
    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
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

    // Check if user is already an admin
    const { data: existingAdmin, error: adminCheckError } = await admin
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'User is already an admin' },
        { status: 409 }
      )
    }

    // Create admin record
    const { data: adminData, error: adminError } = await admin
      .from('admins')
      .insert({
        user_id: user.id,
        email: email,
        role: existingAdmins && existingAdmins.length > 0 ? 'admin' : 'super_admin',
        permissions: existingAdmins && existingAdmins.length > 0 
          ? ['read', 'write'] 
          : ['read', 'write', 'delete', 'admin'],
        created_by: user.id // First admin creates themselves
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
      message: 'Admin created successfully',
      admin: {
        id: adminData.id,
        email: adminData.email,
        role: adminData.role,
        permissions: adminData.permissions
      },
      user: {
        id: user.id,
        email: user.email,
        name
      }
    })
  } catch (error) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
