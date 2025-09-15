"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'

export default function CreateAdminPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<'form' | 'creating' | 'success'>('form')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setStep('creating')

    try {
      const response = await fetch('/api/admin/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          name: name || email.split('@')[0]
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create admin account')
      }

      const data = await response.json()
      setSuccess(true)
      setStep('success')
    } catch (error) {
      console.error('Admin creation failed:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
      setStep('form')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-white text-2xl" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Admin Created Successfully!</CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              Your super admin account has been created and is ready to use.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Account Details:</h3>
              <div className="space-y-1 text-sm">
                <div><strong>Email:</strong> {email}</div>
                <div><strong>Name:</strong> {name || email.split('@')[0]}</div>
                <div><strong>Role:</strong> <Badge variant="secondary">Super Admin</Badge></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/admin">Go to Admin Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/login">Admin Login</Link>
              </Button>
            </div>
            
            <div className="text-center">
              <Link 
                href="/" 
                className="inline-flex items-center text-sm text-blue-600 hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Home
              </Link>
            </div>
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
          <CardTitle className="text-2xl font-bold text-red-600">Create Admin Account</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Create the first super admin account for your AniTrack system
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {step === 'creating' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Creating admin account...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
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
                  placeholder="Enter secure password"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Important:</p>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      This will create a super admin account with full system access. 
                      Make sure to use a secure password and keep your credentials safe.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700" 
                disabled={isLoading}
              >
                {isLoading ? "Creating Admin..." : "Create Super Admin"}
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center space-y-2">
            <Link 
              href="/admin/login" 
              className="inline-flex items-center text-sm text-blue-600 hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Admin Login
            </Link>
            <Link 
              href="/admin/setup" 
              className="inline-flex items-center text-sm text-green-600 hover:underline"
            >
              <Shield className="w-4 h-4 mr-1" />
              Setup Guide
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
