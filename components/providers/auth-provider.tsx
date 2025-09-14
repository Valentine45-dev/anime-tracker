"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  joinDate: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  loading: boolean
}

// Export the context so it can be imported elsewhere
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token and validate it
    const token = localStorage.getItem("anitrack_token")
    if (token) {
      validateToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const validateToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        localStorage.setItem("anitrack_user", JSON.stringify(data.user))
      } else {
        // Token is invalid, remove it
        localStorage.removeItem("anitrack_token")
        localStorage.removeItem("anitrack_user")
      }
    } catch (error) {
      console.error('Token validation error:', error)
      localStorage.removeItem("anitrack_token")
      localStorage.removeItem("anitrack_user")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      setUser(data.user)
      localStorage.setItem("anitrack_token", data.token)
      localStorage.setItem("anitrack_user", JSON.stringify(data.user))
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      setUser(data.user)
      localStorage.setItem("anitrack_token", data.token)
      localStorage.setItem("anitrack_user", JSON.stringify(data.user))
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("anitrack_token")
    localStorage.removeItem("anitrack_user")
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return

    try {
      const token = localStorage.getItem("anitrack_token")
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const updatedUser = { ...user, ...data }
        setUser(updatedUser)
        localStorage.setItem("anitrack_user", JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
