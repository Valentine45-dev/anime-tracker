// Comprehensive notification system
import { supabase } from './supabase'
import { logger } from './logger'

export enum NotificationType {
  ANIME_UPDATE = 'anime_update',
  CLUB_INVITATION = 'club_invitation',
  CLUB_POST = 'club_post',
  FOLLOW = 'follow',
  LIKE = 'like',
  COMMENT = 'comment',
  SYSTEM = 'system',
  MODERATION = 'moderation'
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  created_at: string
  expires_at?: string
}

export interface NotificationPreferences {
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  anime_updates: boolean
  club_activities: boolean
  social_interactions: boolean
  system_notifications: boolean
}

class NotificationService {
  // Create a new notification
  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<{ data: Notification | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        logger.error('Failed to create notification', { error, notification })
        return { data: null, error }
      }

      // Send real-time notification
      await this.sendRealTimeNotification(notification.user_id, data)
      
      logger.info('Notification created', { notificationId: data.id, userId: notification.user_id })
      return { data, error: null }
    } catch (error) {
      logger.error('Error creating notification', { error })
      return { data: null, error }
    }
  }

  // Get notifications for a user
  async getUserNotifications(userId: string, limit: number = 20, unreadOnly: boolean = false): Promise<{ data: Notification[] | null; error: any }> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (unreadOnly) {
        query = query.eq('read', false)
      }

      const { data, error } = await query

      if (error) {
        logger.error('Failed to get user notifications', { error, userId })
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      logger.error('Error getting user notifications', { error, userId })
      return { data: null, error }
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        logger.error('Failed to mark notification as read', { error, notificationId, userId })
      }

      return { error }
    } catch (error) {
      logger.error('Error marking notification as read', { error, notificationId, userId })
      return { error }
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        logger.error('Failed to mark all notifications as read', { error, userId })
      }

      return { error }
    } catch (error) {
      logger.error('Error marking all notifications as read', { error, userId })
      return { error }
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        logger.error('Failed to delete notification', { error, notificationId, userId })
      }

      return { error }
    } catch (error) {
      logger.error('Error deleting notification', { error, notificationId, userId })
      return { error }
    }
  }

  // Get unread count
  async getUnreadCount(userId: string): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        logger.error('Failed to get unread count', { error, userId })
        return { count: 0, error }
      }

      return { count: count || 0, error: null }
    } catch (error) {
      logger.error('Error getting unread count', { error, userId })
      return { count: 0, error }
    }
  }

  // Send real-time notification via Supabase channels
  private async sendRealTimeNotification(userId: string, notification: Notification) {
    try {
      const channel = supabase.channel(`notifications:${userId}`)
      await channel.send({
        type: 'broadcast',
        event: 'new_notification',
        payload: notification
      })
    } catch (error) {
      logger.error('Failed to send real-time notification', { error, userId })
    }
  }

  // Notification preferences
  async getNotificationPreferences(userId: string): Promise<{ data: NotificationPreferences | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error
        logger.error('Failed to get notification preferences', { error, userId })
        return { data: null, error }
      }

      // Return default preferences if none exist
      if (!data) {
        const defaultPreferences: NotificationPreferences = {
          user_id: userId,
          email_notifications: true,
          push_notifications: true,
          anime_updates: true,
          club_activities: true,
          social_interactions: true,
          system_notifications: true
        }
        return { data: defaultPreferences, error: null }
      }

      return { data, error: null }
    } catch (error) {
      logger.error('Error getting notification preferences', { error, userId })
      return { data: null, error }
    }
  }

  async updateNotificationPreferences(preferences: NotificationPreferences): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert(preferences)

      if (error) {
        logger.error('Failed to update notification preferences', { error, userId: preferences.user_id })
      }

      return { error }
    } catch (error) {
      logger.error('Error updating notification preferences', { error, userId: preferences.user_id })
      return { error }
    }
  }

  // Cleanup expired notifications
  async cleanupExpiredNotifications(): Promise<{ deletedCount: number; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id')

      if (error) {
        logger.error('Failed to cleanup expired notifications', { error })
        return { deletedCount: 0, error }
      }

      const deletedCount = data?.length || 0
      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} expired notifications`)
      }

      return { deletedCount, error: null }
    } catch (error) {
      logger.error('Error cleaning up expired notifications', { error })
      return { deletedCount: 0, error }
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

// Helper functions for common notification types
export const createAnimeUpdateNotification = async (userId: string, animeTitle: string, episode: number) => {
  return notificationService.createNotification({
    user_id: userId,
    type: NotificationType.ANIME_UPDATE,
    title: 'New Episode Available',
    message: `Episode ${episode} of ${animeTitle} is now available!`,
    data: { animeTitle, episode },
    read: false
  })
}

export const createFollowNotification = async (userId: string, followerName: string, followerId: string) => {
  return notificationService.createNotification({
    user_id: userId,
    type: NotificationType.FOLLOW,
    title: 'New Follower',
    message: `${followerName} started following you!`,
    data: { followerId, followerName },
    read: false
  })
}

export const createClubInvitationNotification = async (userId: string, clubName: string, clubId: string, inviterName: string) => {
  return notificationService.createNotification({
    user_id: userId,
    type: NotificationType.CLUB_INVITATION,
    title: 'Club Invitation',
    message: `${inviterName} invited you to join ${clubName}`,
    data: { clubId, clubName, inviterName },
    read: false
  })
}

export const createCommentNotification = async (userId: string, commenterName: string, postTitle: string, postId: string) => {
  return notificationService.createNotification({
    user_id: userId,
    type: NotificationType.COMMENT,
    title: 'New Comment',
    message: `${commenterName} commented on "${postTitle}"`,
    data: { postId, postTitle, commenterName },
    read: false
  })
}

export const createSystemNotification = async (userId: string, title: string, message: string, expiresInHours?: number) => {
  const expiresAt = expiresInHours 
    ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
    : undefined

  return notificationService.createNotification({
    user_id: userId,
    type: NotificationType.SYSTEM,
    title,
    message,
    read: false,
    expires_at: expiresAt
  })
}
