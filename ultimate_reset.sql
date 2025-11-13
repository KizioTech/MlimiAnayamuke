-- Ultimate Database Reset - Handles All Dependencies
-- Run this in Supabase SQL Editor

-- Use CASCADE to drop everything including dependencies
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Drop all policies
DROP POLICY IF EXISTS "Admin" ON profiles CASCADE;
DROP POLICY IF EXISTS "consultant" ON profiles CASCADE;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles CASCADE;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles CASCADE;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles CASCADE;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles CASCADE;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles CASCADE;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON profiles CASCADE;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles CASCADE;
DROP POLICY IF EXISTS "Enable select for admins" ON profiles CASCADE;

-- Drop tables with CASCADE to remove all dependencies
DROP TABLE IF EXISTS consultations CASCADE;
DROP TABLE IF EXISTS farms CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Clean slate - create fresh tables
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'farmer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE farms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id TEXT,
  farm_name TEXT NOT NULL,
  size DECIMAL,
  crops TEXT[],
  soil_type TEXT,
  location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id TEXT,
  consultant_id TEXT,
  issue_description TEXT NOT NULL,
  recommendation TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keep RLS disabled for testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE farms DISABLE ROW LEVEL SECURITY;
ALTER TABLE consultations DISABLE ROW LEVEL SECURITY;

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, role)
  VALUES (
    NEW.id::TEXT,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Success! Now test user registration.
-- After confirming it works, you can manually create an admin user and enable RLS.