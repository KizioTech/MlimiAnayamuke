-- Fix RLS Policies - Remove problematic policies
-- Run this in Supabase SQL Editor

-- Drop all existing policies that might be causing issues
DROP POLICY IF EXISTS "Admin" ON profiles;
DROP POLICY IF EXISTS "consultant" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create clean, simple policies
CREATE POLICY "Enable insert for authenticated users only" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users based on user_id" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to view all profiles (this will work after first admin is created)
CREATE POLICY "Enable select for admins" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Temporarily disable RLS to allow initial setup
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Create a default admin user manually (replace with your desired admin credentials)
-- First, create the user through auth, then manually insert profile
-- INSERT INTO profiles (id, name, email, role)
-- VALUES ('your-admin-user-id-here', 'Admin User', 'admin@example.com', 'admin');

-- Re-enable RLS after manual setup
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;