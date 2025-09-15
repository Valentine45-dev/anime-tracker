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
                  <li>Copy and paste the SQL script below</li>
                  <li>Click "Run" to execute the script</li>
                </ol>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
{`-- Admin table setup for AniTracker
-- Run this in your Supabase SQL Editor

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  permissions TEXT[] DEFAULT ARRAY['read', 'write'],
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_actions table for audit logging
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admins table
CREATE POLICY "Only admins can view admins" ON admins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND is_active = TRUE
    )
  );

CREATE POLICY "Only super admins can manage admins" ON admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = TRUE
    )
  );

-- Create RLS policies for admin_actions table
CREATE POLICY "Only admins can view admin actions" ON admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND is_active = TRUE
    )
  );

CREATE POLICY "Only admins can create admin actions" ON admin_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND is_active = TRUE
    )
  );

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = user_uuid 
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin role
CREATE OR REPLACE FUNCTION get_admin_role(user_uuid UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM admins 
    WHERE user_id = user_uuid 
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check admin permissions
CREATE OR REPLACE FUNCTION has_admin_permission(
  user_uuid UUID DEFAULT auth.uid(),
  permission TEXT DEFAULT 'read'
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = user_uuid 
    AND is_active = TRUE
    AND permission = ANY(permissions)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  action_type TEXT,
  target_type TEXT DEFAULT NULL,
  target_id TEXT DEFAULT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  action_id UUID;
  admin_record admins%ROWTYPE;
BEGIN
  -- Get current admin
  SELECT * INTO admin_record FROM admins WHERE user_id = auth.uid() AND is_active = TRUE;
  
  IF admin_record.id IS NULL THEN
    RAISE EXCEPTION 'User is not an active admin';
  END IF;
  
  -- Log the action
  INSERT INTO admin_actions (
    admin_id, action_type, target_type, target_id, 
    details, ip_address, user_agent
  ) VALUES (
    admin_record.id, action_type, target_type, target_id,
    details, ip_address, user_agent
  ) RETURNING id INTO action_id;
  
  RETURN action_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update trigger for admins table
CREATE OR REPLACE FUNCTION update_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_admins_updated_at();`}
                  </pre>
                </div>
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
                  <li>Go to the Create Admin page</li>
                  <li>Enter your name, email, and password</li>
                  <li>Click "Create Super Admin"</li>
                  <li>You'll be redirected to the admin dashboard</li>
                </ol>
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
