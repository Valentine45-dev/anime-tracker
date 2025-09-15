-- Fix the anime_metadata table score field to handle larger values
-- Run this in your Supabase SQL Editor

-- Update the score field to allow values up to 100.00
ALTER TABLE anime_metadata 
ALTER COLUMN score TYPE DECIMAL(5,2);

-- This will allow scores from -999.99 to 999.99, which is more than enough for anime scores (0-100)
