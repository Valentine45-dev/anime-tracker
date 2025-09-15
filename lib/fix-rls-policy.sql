-- Fix RLS policy for development user
-- Run this in your Supabase SQL Editor

-- Temporarily disable RLS for user_anime table during development
ALTER TABLE user_anime DISABLE ROW LEVEL SECURITY;

-- Or alternatively, create a policy that allows our development user
-- Uncomment the lines below if you prefer to keep RLS enabled:

-- DROP POLICY IF EXISTS "Users can insert their own anime" ON user_anime;
-- CREATE POLICY "Users can insert their own anime" ON user_anime
--   FOR INSERT WITH CHECK (
--     auth.uid() = user_id OR 
--     user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
--   );

-- DROP POLICY IF EXISTS "Users can view their own anime" ON user_anime;
-- CREATE POLICY "Users can view their own anime" ON user_anime
--   FOR SELECT USING (
--     auth.uid() = user_id OR 
--     user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
--   );

-- DROP POLICY IF EXISTS "Users can update their own anime" ON user_anime;
-- CREATE POLICY "Users can update their own anime" ON user_anime
--   FOR UPDATE USING (
--     auth.uid() = user_id OR 
--     user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
--   );

-- DROP POLICY IF EXISTS "Users can delete their own anime" ON user_anime;
-- CREATE POLICY "Users can delete their own anime" ON user_anime
--   FOR DELETE USING (
--     auth.uid() = user_id OR 
--     user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
--   );
