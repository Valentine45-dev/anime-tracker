"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Shield, Database, Settings, Users, BarChart3, Mail } from 'lucide-react'

export default function AdminSetupPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin System Setup</h1>
            <p className="text-xl text-gray-600">
              Complete guide to setting up your AniTrack admin system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Database Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-6 h-6 mr-2 text-blue-600" />
                  Step 1: Database Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  First, you need to run the admin setup SQL in your Supabase database.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Go to your Supabase Dashboard</li>
                  <li>Navigate to SQL Editor</li>
                  <li>Copy the contents of <code className="bg-gray-100 px-2 py-1 rounded">lib/admin-setup.sql</code></li>
                  <li>Paste and run the SQL</li>
                </ol>
                <Badge variant="outline" className="mt-4">
                  Creates: admins, admin_actions tables + functions
                </Badge>
              </CardContent>
            </Card>

            {/* Admin Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-red-600" />
                  Step 2: Create Admin Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  After running the SQL, create your first super admin account.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Go to <code className="bg-gray-100 px-2 py-1 rounded">/admin/login</code></li>
                  <li>Enter your email and password</li>
                  <li>Click "Create Super Admin"</li>
                  <li>You'll be automatically logged in</li>
                </ol>
                <Button asChild className="w-full mt-4">
                  <Link href="/admin/login">Create Admin Account</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Features Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-6 h-6 mr-2 text-green-600" />
                  Available Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">User Management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Analytics Dashboard</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Email Notifications</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">Data Migration Tools</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Admin Roles & Permissions</span>
                </div>
              </CardContent>
            </Card>

            {/* Security Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-red-600" />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-start space-x-2">
                    <Badge variant="secondary" className="mt-0.5">RLS</Badge>
                    <span>Row Level Security policies protect admin data</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Badge variant="secondary" className="mt-0.5">JWT</Badge>
                    <span>JWT tokens for secure authentication</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Badge variant="secondary" className="mt-0.5">Audit</Badge>
                    <span>All admin actions are logged</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Badge variant="secondary" className="mt-0.5">Roles</Badge>
                    <span>Role-based access control (super_admin, admin, moderator)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Card className="inline-block">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Ready to get started?</h3>
                <p className="text-gray-600 mb-4">
                  Make sure you've completed the database setup first, then create your admin account.
                </p>
                <div className="flex space-x-4 justify-center">
                  <Button asChild>
                    <Link href="/admin/login">Create Admin Account</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/auth/login">Back to User Login</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
