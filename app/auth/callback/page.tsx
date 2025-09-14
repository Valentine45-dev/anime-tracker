"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/login?error=auth_failed')
          return
        }

        if (data.session) {
          // User is authenticated, redirect to home
          router.push('/')
        } else {
          // No session, redirect to login
          router.push('/auth/login')
        }
      } catch (err) {
        console.error('Callback error:', err)
        router.push('/auth/login?error=callback_failed')
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-bold">AT</span>
            </div>
            <CardTitle className="text-2xl font-bold">Processing...</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-600">Completing authentication...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
