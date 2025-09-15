-- Fix all RLS policies for development
-- Run this in your Supabase SQL Editor

-- 1. Disable RLS for all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_anime DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE anime_metadata DISABLE ROW LEVEL SECURITY;

-- 2. Create the development user in auth.users table first
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  'dev@animetracker.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- 3. Create the development user profile
INSERT INTO profiles (
  id,
  email,
  name,
  avatar_url,
  bio,
  watch_time_hours,
  favorite_genres,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'dev@animetracker.com',
  'Development User',
  null,
  'Development user for testing anime tracker functionality',
  0,
  ARRAY['Action', 'Drama', 'Fantasy'],
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- 6. Create user preferences for the dev user
INSERT INTO user_preferences (
  user_id,
  theme,
  language,
  email_notifications,
  push_notifications,
  privacy_level,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'system',
  'en',
  true,
  true,
  'public',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  updated_at = NOW();

-- 7. Fix the score field precision (if not already done)
ALTER TABLE anime_metadata ALTER COLUMN score TYPE DECIMAL(5,2);

-- 8. Verify the setup
SELECT 
  'profiles' as table_name,
  COUNT(*) as count
FROM profiles
WHERE id = '550e8400-e29b-41d4-a716-446655440000'::uuid

UNION ALL

SELECT 
  'user_preferences' as table_name,
  COUNT(*) as count
FROM user_preferences
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid;
