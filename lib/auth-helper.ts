// Authentication helper for Supabase integration
import { supabase } from './supabase'

export async function getCurrentUserId(): Promise<string | null> {
  try {
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.user) {
      console.log('No active session found')
      return null
    }

    return session.user.id
  } catch (error) {
    console.error('Error getting current user ID:', error)
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const userId = await getCurrentUserId()
    return userId !== null
  } catch (error) {
    console.error('Error checking authentication:', error)
    return false
  }
}
