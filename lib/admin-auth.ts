// Admin authentication and authorization utilities
import { getSupabaseAdmin } from './supabase'
import { logger } from './logger'

export interface AdminUser {
  id: string
  user_id: string
  email: string
  role: 'super_admin' | 'admin' | 'moderator'
  permissions: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminAction {
  id: string
  admin_id: string
  action_type: string
  target_type?: string
  target_id?: string
  details: any
  ip_address?: string
  user_agent?: string
  created_at: string
}

export class AdminAuthService {
  private static instance: AdminAuthService
  private adminCache = new Map<string, AdminUser>()

  static getInstance(): AdminAuthService {
    if (!AdminAuthService.instance) {
      AdminAuthService.instance = new AdminAuthService()
    }
    return AdminAuthService.instance
  }

  // Check if user is admin
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const admin = await this.getAdmin(userId)
      return admin !== null && admin.is_active
    } catch (error) {
      logger.error('Error checking admin status:', error)
      return false
    }
  }

  // Get admin user details
  async getAdmin(userId: string): Promise<AdminUser | null> {
    try {
      // Check cache first
      if (this.adminCache.has(userId)) {
        return this.adminCache.get(userId)!
      }

      const admin = getSupabaseAdmin()
      const { data, error } = await admin
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return null
      }

      // Cache the result
      this.adminCache.set(userId, data)
      
      return data
    } catch (error) {
      logger.error('Error fetching admin:', error)
      return null
    }
  }

  // Check if admin has specific permission
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const admin = await this.getAdmin(userId)
      if (!admin) return false

      return admin.permissions.includes(permission)
    } catch (error) {
      logger.error('Error checking admin permission:', error)
      return false
    }
  }

  // Check if admin has specific role or higher
  async hasRole(userId: string, requiredRole: 'super_admin' | 'admin' | 'moderator'): Promise<boolean> {
    try {
      const admin = await this.getAdmin(userId)
      if (!admin) return false

      const roleHierarchy = { 'moderator': 1, 'admin': 2, 'super_admin': 3 }
      const userRoleLevel = roleHierarchy[admin.role]
      const requiredRoleLevel = roleHierarchy[requiredRole]

      return userRoleLevel >= requiredRoleLevel
    } catch (error) {
      logger.error('Error checking admin role:', error)
      return false
    }
  }

  // Log admin action
  async logAction(
    userId: string,
    actionType: string,
    targetType?: string,
    targetId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string | null> {
    try {
      const admin = await this.getAdmin(userId)
      if (!admin) {
        throw new Error('User is not an admin')
      }

      const adminClient = getSupabaseAdmin()
      const { data, error } = await adminClient
        .from('admin_actions')
        .insert({
          admin_id: admin.id,
          action_type: actionType,
          target_type: targetType,
          target_id: targetId,
          details: details || {},
          ip_address: ipAddress,
          user_agent: userAgent
        })
        .select('id')
        .single()

      if (error) {
        logger.error('Error logging admin action:', error)
        return null
      }

      return data.id
    } catch (error) {
      logger.error('Error logging admin action:', error)
      return null
    }
  }

  // Create new admin (super admin only)
  async createAdmin(
    creatorUserId: string,
    newAdminUserId: string,
    email: string,
    role: 'admin' | 'moderator',
    permissions: string[]
  ): Promise<AdminUser | null> {
    try {
      // Check if creator is super admin
      if (!(await this.hasRole(creatorUserId, 'super_admin'))) {
        throw new Error('Only super admins can create new admins')
      }

      const admin = getSupabaseAdmin()
      const { data, error } = await admin
        .from('admins')
        .insert({
          user_id: newAdminUserId,
          email,
          role,
          permissions,
          created_by: creatorUserId
        })
        .select()
        .single()

      if (error) {
        logger.error('Error creating admin:', error)
        return null
      }

      // Log the action
      await this.logAction(creatorUserId, 'create_admin', 'admin', newAdminUserId, {
        email,
        role,
        permissions
      })

      return data
    } catch (error) {
      logger.error('Error creating admin:', error)
      return null
    }
  }

  // Update admin permissions (super admin only)
  async updateAdmin(
    updaterUserId: string,
    adminId: string,
    updates: Partial<Pick<AdminUser, 'role' | 'permissions' | 'is_active'>>
  ): Promise<AdminUser | null> {
    try {
      // Check if updater is super admin
      if (!(await this.hasRole(updaterUserId, 'super_admin'))) {
        throw new Error('Only super admins can update admin permissions')
      }

      const admin = getSupabaseAdmin()
      const { data, error } = await admin
        .from('admins')
        .update(updates)
        .eq('id', adminId)
        .select()
        .single()

      if (error) {
        logger.error('Error updating admin:', error)
        return null
      }

      // Clear cache
      this.adminCache.delete(data.user_id)

      // Log the action
      await this.logAction(updaterUserId, 'update_admin', 'admin', adminId, updates)

      return data
    } catch (error) {
      logger.error('Error updating admin:', error)
      return null
    }
  }

  // Get admin actions log
  async getAdminActions(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<AdminAction[]> {
    try {
      // Check if user is admin
      if (!(await this.isAdmin(userId))) {
        throw new Error('User is not an admin')
      }

      const admin = getSupabaseAdmin()
      const { data, error } = await admin
        .from('admin_actions')
        .select(`
          *,
          admins!admin_actions_admin_id_fkey(email, role)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        logger.error('Error fetching admin actions:', error)
        return []
      }

      return data || []
    } catch (error) {
      logger.error('Error fetching admin actions:', error)
      return []
    }
  }

  // Clear admin cache
  clearCache(userId?: string) {
    if (userId) {
      this.adminCache.delete(userId)
    } else {
      this.adminCache.clear()
    }
  }
}

// Export singleton instance
export const adminAuth = AdminAuthService.getInstance()

// Middleware helper for API routes
export async function requireAdmin(
  request: Request,
  requiredRole?: 'super_admin' | 'admin' | 'moderator',
  requiredPermission?: string
): Promise<{ userId: string; admin: AdminUser } | null> {
  try {
    // Get user from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.split(' ')[1]
    const admin = getSupabaseAdmin()
    
    // Verify JWT token
    const { data: { user }, error } = await admin.auth.getUser(token)
    if (error || !user) {
      return null
    }

    // Check if user is admin
    const adminUser = await adminAuth.getAdmin(user.id)
    if (!adminUser || !adminUser.is_active) {
      return null
    }

    // Check role if required
    if (requiredRole && !(await adminAuth.hasRole(user.id, requiredRole))) {
      return null
    }

    // Check permission if required
    if (requiredPermission && !(await adminAuth.hasPermission(user.id, requiredPermission))) {
      return null
    }

    return { userId: user.id, admin: adminUser }
  } catch (error) {
    logger.error('Admin auth middleware error:', error)
    return null
  }
}
