"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DashboardData {
  overview: {
    totalUsers: number
    newUsersToday: number
    totalAnimeEntries: number
    totalCommunities: number
    totalWatchTime: number
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
  const { user, profile } = useSupabaseAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (user) {
      checkAdminStatus()
      fetchDashboardData()
    }
  }, [user])

  const checkAdminStatus = async () => {
    try {
      // Check if user is authenticated
      if (!user) {
        setIsAdmin(false)
        return
      }

      // Check if admin system is initialized
      const initResponse = await fetch('/api/admin/init')
      const initData = await initResponse.json()
      
      if (!initData.initialized) {
        setIsAdmin(false)
        return
      }

      // Check if current user is admin
      const response = await fetch('/api/admin/check', {
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      })

      if (response.ok) {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
        // Redirect to admin login if not admin
        router.push('/admin/login')
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
          'Authorization': `Bearer ${user?.access_token}`
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
      const response = await fetch('/api/admin/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user?.email,
          password: 'admin123', // You should change this
          name: profile?.name || 'Admin User'
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Initialize Admin System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Admin system not initialized. Click below to create your first super admin account.</p>
            <Button onClick={initializeAdmin} className="w-full">
              Initialize Admin System
            </Button>
            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {profile?.name || user?.email}!</p>
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
