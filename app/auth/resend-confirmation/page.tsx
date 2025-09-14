"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ResendConfirmationPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Confirmation email sent! Please check your inbox and spam folder.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Mail className="text-white text-2xl" />
          </div>
          <CardTitle className="text-2xl font-bold">Resend Confirmation</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Didn't receive your confirmation email? Enter your email below to resend it.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResend} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? "Sending..." : "Resend Confirmation Email"}
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-3">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center text-sm text-blue-600 hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
            
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Common Issues:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• Verify you entered the correct email</li>
                <li>• Wait a few minutes for delivery</li>
                <li>• Try a different email provider</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
