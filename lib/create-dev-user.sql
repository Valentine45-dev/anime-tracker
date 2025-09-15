-- Create development user profile
-- Run this in your Supabase SQL Editor

-- Insert the development user into the profiles table
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

-- Also create user preferences for the dev user
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
