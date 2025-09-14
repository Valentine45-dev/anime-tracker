// User service for handling user creation, validation, and database operations
import { getSupabaseAdmin } from './supabase'
import { logger } from './logger'

export interface CreateUserResult {
  success: boolean
  user?: any
  profile?: any
  error?: string
  isDuplicate?: boolean
}

export interface UserValidation {
  emailExists: boolean
  nameExists: boolean
  isValid: boolean
}

export class UserService {
  private static instance: UserService

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }
    return UserService.instance
  }

  // Check if user information already exists
  async validateUserInfo(email: string, name?: string): Promise<UserValidation> {
    try {
      const admin = getSupabaseAdmin()
      
      // Check if email already exists in profiles table
      const { data: emailCheck } = await admin
        .from('profiles')
        .select('id, email')
        .eq('email', email.toLowerCase().trim())
        .single()

      // Check if name already exists (optional duplicate name check)
      let nameExists = false
      if (name) {
        const { data: nameCheck } = await admin
          .from('profiles')
          .select('id, name')
          .eq('name', name.trim())
          .single()
        nameExists = !!nameCheck
      }

      return {
        emailExists: !!emailCheck,
        nameExists,
        isValid: !emailCheck // Valid if email doesn't exist
      }
    } catch (error) {
      logger.error('Error validating user info:', error)
      return {
        emailExists: false,
        nameExists: false,
        isValid: true // Allow creation if validation fails
      }
    }
  }

  // Create user profile after Supabase auth user is created
  async createUserProfile(userId: string, email: string, name: string): Promise<CreateUserResult> {
    try {
      const admin = getSupabaseAdmin()

      // First, validate that user info doesn't already exist
      const validation = await this.validateUserInfo(email, name)
      
      if (validation.emailExists) {
        return {
          success: false,
          error: 'An account with this email already exists',
          isDuplicate: true
        }
      }

      // Create profile in database
      const profileData = {
        id: userId,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        avatar_url: null,
        bio: null,
        watch_time_hours: 0,
        favorite_genres: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: profile, error: profileError } = await admin
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (profileError) {
        logger.error('Error creating user profile:', profileError)
        return {
          success: false,
          error: 'Failed to create user profile'
        }
      }

      // Create default user preferences
      const { error: preferencesError } = await admin
        .from('user_preferences')
        .insert({
          user_id: userId,
          theme: 'system',
          language: 'en',
          email_notifications: true,
          push_notifications: true,
          privacy_level: 'public'
        })

      if (preferencesError) {
        logger.warn('Error creating user preferences:', preferencesError)
        // Don't fail the entire process for preferences
      }

      logger.info('User profile created successfully:', { userId, email, name })

      return {
        success: true,
        profile
      }
    } catch (error) {
      logger.error('Error in createUserProfile:', error)
      return {
        success: false,
        error: 'An unexpected error occurred while creating your profile'
      }
    }
  }

  // Get user profile by ID
  async getUserProfile(userId: string) {
    try {
      const admin = getSupabaseAdmin()
      
      const { data: profile, error } = await admin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        logger.error('Error fetching user profile:', error)
        return null
      }

      return profile
    } catch (error) {
      logger.error('Error in getUserProfile:', error)
      return null
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: any) {
    try {
      const admin = getSupabaseAdmin()

      const { data: profile, error } = await admin
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        logger.error('Error updating user profile:', error)
        return { success: false, error: error.message }
      }

      return { success: true, profile }
    } catch (error) {
      logger.error('Error in updateUserProfile:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Check if user exists by email (for signup validation)
  async checkUserExists(email: string) {
    try {
      const admin = getSupabaseAdmin()
      
      const { data: profile } = await admin
        .from('profiles')
        .select('id, email')
        .eq('email', email.toLowerCase().trim())
        .single()

      return !!profile
    } catch (error) {
      logger.error('Error checking user existence:', error)
      return false
    }
  }
}

export const userService = UserService.getInstance()
