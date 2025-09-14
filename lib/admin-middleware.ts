// Admin authentication middleware for protecting admin routes
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from './supabase'
import { adminAuth } from './admin-auth'

export async function requireAdminAuth(request: NextRequest) {
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

    // Check if user is admin
    const isAdmin = await adminAuth.isAdmin(user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    return { user, admin: await adminAuth.getAdmin(user.id) }
  } catch (error) {
    console.error('Admin auth middleware error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// Middleware for specific admin roles
export async function requireAdminRole(
  request: NextRequest, 
  requiredRole: 'super_admin' | 'admin' | 'moderator'
) {
  const authResult = await requireAdminAuth(request)
  
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user, admin } = authResult

  // Check role hierarchy
  const roleHierarchy = { 'moderator': 1, 'admin': 2, 'super_admin': 3 }
  const userRoleLevel = roleHierarchy[admin!.role]
  const requiredRoleLevel = roleHierarchy[requiredRole]

  if (userRoleLevel < requiredRoleLevel) {
    return NextResponse.json(
      { error: `Insufficient permissions. ${requiredRole} role required.` },
      { status: 403 }
    )
  }

  return { user, admin }
}

// Middleware for specific permissions
export async function requireAdminPermission(
  request: NextRequest,
  permission: string
) {
  const authResult = await requireAdminAuth(request)
  
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user, admin } = authResult

  if (!admin!.permissions.includes(permission)) {
    return NextResponse.json(
      { error: `Missing permission: ${permission}` },
      { status: 403 }
    )
  }

  return { user, admin }
}
