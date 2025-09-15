-- Fix existing admin policies
-- Run this if you get "policy already exists" errors

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Only admins can view admins" ON admins;
DROP POLICY IF EXISTS "Only super admins can manage admins" ON admins;
DROP POLICY IF EXISTS "Only admins can view admin actions" ON admin_actions;
DROP POLICY IF EXISTS "Only admins can create admin actions" ON admin_actions;

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

-- Check if admin system is ready
SELECT 
  'Admin policies fixed!' as status,
  (SELECT COUNT(*) FROM admins) as existing_admins,
  (SELECT COUNT(*) FROM admin_actions) as existing_actions;
