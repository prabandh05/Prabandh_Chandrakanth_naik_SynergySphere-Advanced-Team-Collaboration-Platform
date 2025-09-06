-- TEMPORARY FIX: Disable RLS to test basic functionality
-- Run this in your Supabase SQL Editor if you want to test quickly

-- Disable RLS on all tables temporarily
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE synergy_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- This will allow all operations to work without security restrictions
-- WARNING: Only use this for development/testing!
-- For production, you should use the proper RLS policies from FIX_DATABASE_POLICIES.sql
