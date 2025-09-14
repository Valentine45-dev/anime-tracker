import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface Profile {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  bio: string | null
  watch_time_hours: number
  favorite_genres: string[] | null
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User | null
  session: Session | null
  profile?: Profile | null
}

// Get current user and their profile
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { user: null, session: null }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return { user, session: null }
    }

    return { user, session: null, profile }
  } catch (error) {
    console.error('Error getting current user:', error)
    return { user: null, session: null }
  }
}

// Sign up with email and password
export async function signUp(email: string, password: string, name: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      throw error
    }

    // Profile will be created automatically by the trigger
    return {
      user: data.user,
      session: data.session,
    }
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    // Get user profile
    let profile = null
    if (data.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      profile = profileData
    }

    return {
      user: data.user,
      session: data.session,
      profile,
    }
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

// Update user profile
export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Update profile error:', error)
    throw error
  }
}

// Get user profile by ID
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw error
    }

    return data
  } catch (error) {
    console.error('Get user profile error:', error)
    throw error
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(callback)
}
