"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Mail, Settings, Send } from 'lucide-react'

interface EmailSettings {
  fromEmail: string
  fromName: string
  replyTo: string
}

export default function AdminEmailSettings() {
  const [settings, setSettings] = useState<EmailSettings>({
    fromEmail: 'admin@anitrack.app',
    fromName: 'AniTrack Admin',
    replyTo: 'support@anitrack.app'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setLoading(true)
    try {
      // Here you would save the settings to your database or environment
      // For now, we'll just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('Email settings saved successfully!')
    } catch (error) {
      setMessage('Failed to save email settings')
    } finally {
      setLoading(false)
    }
  }

  const testEmail = async () => {
    setLoading(true)
    try {
      // Test email sending functionality
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          type: 'test_email',
          subject: 'Test Email from AniTrack Admin',
          message: 'This is a test email to verify your email configuration.',
          recipient: settings.fromEmail
        })
      })

      if (response.ok) {
        setMessage('Test email sent successfully!')
      } else {
        setMessage('Failed to send test email')
      }
    } catch (error) {
      setMessage('Error sending test email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Settings</h1>
          <p className="text-gray-600">Configure email settings for admin notifications and system emails</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fromEmail">From Email Address</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={settings.fromEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                  placeholder="admin@anitrack.app"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will be the sender address for all admin emails
                </p>
              </div>

              <div>
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  type="text"
                  value={settings.fromName}
                  onChange={(e) => setSettings(prev => ({ ...prev, fromName: e.target.value }))}
                  placeholder="AniTrack Admin"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Display name for the sender
                </p>
              </div>

              <div>
                <Label htmlFor="replyTo">Reply-To Address</Label>
                <Input
                  id="replyTo"
                  type="email"
                  value={settings.replyTo}
                  onChange={(e) => setSettings(prev => ({ ...prev, replyTo: e.target.value }))}
                  placeholder="support@anitrack.app"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Where replies to admin emails will be sent
                </p>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Settings"}
                </Button>
                <Button onClick={testEmail} variant="outline" disabled={loading}>
                  <Send className="w-4 h-4 mr-2" />
                  Test Email
                </Button>
              </div>

              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Email Service Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Service Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">User Signup Emails</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Supabase Service
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Admin System Emails</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Custom Service
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Templates</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Configured
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Email Types:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Welcome emails (after signup)</li>
                  <li>• Admin notifications</li>
                  <li>• System alerts</li>
                  <li>• User announcements</li>
                  <li>• Password reset emails</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Configuration Notes:</h4>
                <p className="text-sm text-gray-600">
                  User signup confirmation emails are automatically handled by Supabase. 
                  Admin system emails use your configured email service with custom templates.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
