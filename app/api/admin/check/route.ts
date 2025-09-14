import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-middleware'

// Check if current user is admin
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user, admin } = authResult

    return NextResponse.json({
      isAdmin: true,
      admin: {
        id: admin!.id,
        email: admin!.email,
        role: admin!.role,
        permissions: admin!.permissions
      },
      user: {
        id: user.id,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json(
      { error: 'Failed to verify admin status' },
      { status: 500 }
    )
  }
}
