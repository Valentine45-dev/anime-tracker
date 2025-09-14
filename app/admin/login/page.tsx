"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider'
import { useRouter } from 'next/navigation'
import { Shield, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null)
  const { signIn } = useSupabaseAuth()
  const router = useRouter()

  // Check if admin system is initialized
  React.useEffect(() => {
    const checkInitialization = async () => {
      try {
        const response = await fetch('/api/admin/init')
        const data = await response.json()
        setIsInitialized(data.initialized)
      } catch (error) {
        console.error('Error checking initialization:', error)
        setIsInitialized(false)
      }
    }
    checkInitialization()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!isInitialized) {
        // Initialize admin system
        await initializeAdmin()
      } else {
        // Regular admin login
        await loginAsAdmin()
      }
    } catch (error) {
      console.error('Admin login/init failed:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const initializeAdmin = async () => {
    try {
      const response = await fetch('/api/admin/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          name: email.split('@')[0] // Use email prefix as name
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to initialize admin')
      }

      const data = await response.json()
      
      // Auto-login after successful initialization
      await signIn(email, password)
      
      // Wait for auth state to update
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setIsInitialized(true)
      router.push('/admin')
    } catch (error) {
      throw error
    }
  }

  const loginAsAdmin = async () => {
    try {
      // Sign in with Supabase
      await signIn(email, password)
      
      // Wait a moment for auth state to update
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Get current session for admin check
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('Failed to sign in')
      }
      
      // Check if user is admin
      const response = await fetch('/api/admin/check', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        // Redirect to admin dashboard
        router.push('/admin')
      } else {
        throw new Error('You do not have admin privileges')
      }
    } catch (error) {
      throw new Error('Invalid credentials or insufficient permissions')
    }
  }

  // Show loading while checking initialization
  if (isInitialized === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="text-white text-2xl" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking admin system...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white text-2xl" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            {isInitialized === false ? 'Initialize Admin System' : 'Admin Access'}
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            {isInitialized === false 
              ? 'Create the first super admin account' 
              : 'Sign in to access admin dashboard'
            }
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700" 
              disabled={isLoading}
            >
              {isLoading 
                ? (isInitialized === false ? "Creating Admin..." : "Signing in...") 
                : (isInitialized === false ? "Create Super Admin" : "Sign In as Admin")
              }
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center text-sm text-blue-600 hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to User Login
            </Link>
            {isInitialized === false && (
              <div className="mt-2">
                <Link 
                  href="/admin/setup" 
                  className="inline-flex items-center text-sm text-green-600 hover:underline"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Setup Guide
                </Link>
              </div>
            )}
            <p className="text-xs text-gray-500">
              {isInitialized === false 
                ? "This will create the first super admin account" 
                : "Admin access requires special permissions"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
