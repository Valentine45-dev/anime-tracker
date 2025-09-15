"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield } from 'lucide-react'

interface DashboardData {
  overview: {
    totalUsers: number
    newUsersToday: number
    totalAnimeEntries: number
    totalCommunities: number
    totalWatchTime: number
    totalAnimeMetadata: number
    averageAnimeScore: number
  }
  users: {
    growth: {
      weekly: number
      monthly: number
      growthRate: number
    }
    topGenres: Array<{ genre: string; count: number }>
    averageWatchTime: number
  }
  system: {
    unreadNotifications: number
    totalNotifications24h: number
    backgroundJobs: Array<any>
    systemHealth: string
  }
}

export default function AdminDashboard() {
  const { user, profile, session } = useSupabaseAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (user && session) {
      checkAdminStatus()
      fetchDashboardData()
    }
  }, [user, session])

  const checkAdminStatus = async () => {
    try {
      // Check if user is authenticated
      if (!user || !session) {
        console.log('No user or session found')
        setIsAdmin(false)
        return
      }

      console.log('Checking admin status for user:', user.email)

      // Check if admin system is initialized
      const initResponse = await fetch('/api/admin/init')
      const initData = await initResponse.json()
      
      console.log('Admin system initialized:', initData.initialized)
      
      if (!initData.initialized) {
        setIsAdmin(false)
        return
      }

      // Check if current user is admin
      const response = await fetch('/api/admin/check', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      console.log('Admin check response status:', response.status)

      if (response.ok) {
        console.log('User is admin')
        setIsAdmin(true)
      } else {
        console.log('User is not admin, response:', await response.text())
        setIsAdmin(false)
        // Don't redirect automatically, let user choose to initialize
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const initializeAdmin = async () => {
    try {
      // Create admin record for current user
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          email: user?.email,
          name: profile?.name || user?.email?.split('@')[0] || 'Admin User'
        })
      })

      if (response.ok) {
        setIsAdmin(true)
        await fetchDashboardData()
      } else {
        const errorData = await response.json()
        setError(errorData.error)
      }
    } catch (error) {
      console.error('Error initializing admin:', error)
      setError('Failed to initialize admin')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You must be logged in to access the admin dashboard.</p>
            <div className="flex space-x-2">
              <Button asChild className="flex-1">
                <Link href="/admin/login">Admin Login</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/auth/login">User Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Access</h1>
              <p className="text-xl text-gray-600">
                You need admin privileges to access this dashboard
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Make Current User Admin */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-6 h-6 mr-2 text-blue-600" />
                    Make Me Admin
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Make your current account an admin. This is the quickest way to get started.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Current User:</strong> {user?.email}
                    </p>
                  </div>
                  <Button onClick={initializeAdmin} className="w-full" disabled={loading}>
                    {loading ? "Creating Admin..." : "Make Me Admin"}
                  </Button>
                  {error && (
                    <div className="text-red-600 text-sm">
                      {error}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Create New Admin Account */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-6 h-6 mr-2 text-green-600" />
                    Create New Admin
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Create a separate admin account with different credentials.
                  </p>
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link href="/admin/create">Create Admin Account</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/admin/login">Admin Login</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Help Section */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-6 h-6 mr-2 text-orange-600" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">Database Setup</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Make sure you've run the SQL setup script in Supabase
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/admin/setup">Setup Guide</Link>
                      </Button>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">Troubleshooting</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Check console logs for detailed error information
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open('https://supabase.com/docs', '_blank')}
                      >
                        Supabase Docs
                      </Button>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">Support</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Check the README for detailed setup instructions
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/">Back to Home</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {profile?.name || user?.email}!</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchDashboardData}
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh Data"}
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/setup">Setup Guide</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/">Back to App</Link>
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Badge variant="secondary">{dashboardData?.overview.totalUsers || 0}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.overview.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{dashboardData?.overview.newUsersToday || 0} today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Anime Entries</CardTitle>
                  <Badge variant="secondary">{dashboardData?.overview.totalAnimeEntries || 0}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.overview.totalAnimeEntries || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Communities</CardTitle>
                  <Badge variant="secondary">{dashboardData?.overview.totalCommunities || 0}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.overview.totalCommunities || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Active communities
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Watch Time</CardTitle>
                  <Badge variant="secondary">{dashboardData?.overview.totalWatchTime || 0}h</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.overview.totalWatchTime || 0}h</div>
                  <p className="text-xs text-muted-foreground">
                    Combined watch time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Anime Metadata</CardTitle>
                  <Badge variant="secondary">{dashboardData?.overview.totalAnimeMetadata || 0}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.overview.totalAnimeMetadata || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Cached anime data
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <Badge variant="secondary">{dashboardData?.overview.averageAnimeScore || 0}/10</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.overview.averageAnimeScore || 0}/10</div>
                  <p className="text-xs text-muted-foreground">
                    Average anime rating
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>This Week:</span>
                      <span className="font-bold">{dashboardData?.users.growth.weekly || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Month:</span>
                      <span className="font-bold">{dashboardData?.users.growth.monthly || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Growth Rate:</span>
                      <span className="font-bold">{dashboardData?.users.growth.growthRate.toFixed(1) || 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Genres</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dashboardData?.users.topGenres.slice(0, 5).map((genre, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{genre.genre}:</span>
                        <span className="font-bold">{genre.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={dashboardData?.system.systemHealth === 'healthy' ? 'default' : 'destructive'}>
                        {dashboardData?.system.systemHealth || 'unknown'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Unread Notifications:</span>
                      <span className="font-bold">{dashboardData?.system.unreadNotifications || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Notifications (24h):</span>
                      <span className="font-bold">{dashboardData?.system.totalNotifications24h || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Background Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dashboardData?.system.backgroundJobs.length ? (
                      dashboardData.system.backgroundJobs.slice(0, 5).map((job, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{job.type}:</span>
                          <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No recent jobs</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
