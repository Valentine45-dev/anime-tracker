"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { onAuthStateChange, getCurrentUser } from "@/lib/supabase-auth"
import type { User, Session } from "@supabase/supabase-js"
import type { Profile } from "@/lib/supabase-auth"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  signUp: (email: string, password: string, name: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setSession(session)
          setUser(session.user)
          
          // Get user profile with error handling using API route
          try {
            const response = await fetch('/api/profile', {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
            })
            
            if (response.ok) {
              const { profile } = await response.json()
              setProfile(profile)
            } else {
              console.error('Initial profile fetch error:', response.status, response.statusText)
              setProfile(null)
            }
          } catch (error) {
            console.error('Error in initial profile fetch:', error)
            setProfile(null)
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(true)
      
      if (session?.user) {
        // Get user profile with improved error handling using API route
        try {
          const response = await fetch('/api/profile', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          })
          
          if (response.ok) {
            const { profile } = await response.json()
            setProfile(profile)
          } else {
            console.error('Profile fetch error:', response.status, response.statusText)
            setProfile(null)
          }
        } catch (error) {
          console.error('Error fetching profile:', error)
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      
      // First, check if user already exists in our database
      const checkResponse = await fetch(`/api/auth/create-user?email=${encodeURIComponent(email)}`)
      const checkData = await checkResponse.json()
      
      if (checkData.exists) {
        throw new Error('An account with this email already exists')
      }

      // Create Supabase auth user
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

      // If user was created successfully, create profile in our database
      if (data.user) {
        try {
          const createResponse = await fetch('/api/auth/create-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: data.user.id,
              email: email,
              name: name
            })
          })

          if (!createResponse.ok) {
            const errorData = await createResponse.json()
            console.warn('Failed to create user profile:', errorData.error)
            // Don't throw error here - user is still created in Supabase auth
          }
        } catch (profileError) {
          console.warn('Error creating user profile:', profileError)
          // Don't throw error here - user is still created in Supabase auth
        }
      }

      return data
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Auth state change will handle setting user and profile
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      // Auth state change will handle clearing user and profile
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !session) return

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const { profile } = await response.json()
      setProfile(profile)
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    signUp,
    signIn,
    signOut,
    updateProfile,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider")
  }
  return context
}
