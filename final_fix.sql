-- Final Database Fix - Complete Reset and Clean Setup
-- Run this in Supabase SQL Editor

-- Step 1: Complete reset - drop everything
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP POLICY IF EXISTS "Admin" ON profiles;
DROP POLICY IF EXISTS "consultant" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable select for admins" ON profiles;

-- Drop tables completely and recreate
DROP TABLE IF EXISTS consultations CASCADE;
DROP TABLE IF EXISTS farms CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Step 2: Create clean tables without foreign keys initially
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

-- Step 3: Keep RLS disabled for now - we'll enable after testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE farms DISABLE ROW LEVEL SECURITY;
ALTER TABLE consultations DISABLE ROW LEVEL SECURITY;

-- Step 4: Create a simple trigger that won't cause issues
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Test by creating a manual admin user
-- Replace 'your-admin-uuid-here' with an actual user UUID from auth.users
-- You can create a user through the Supabase Auth UI first, then get the UUID

-- INSERT INTO profiles (id, name, email, role, phone)
-- VALUES (
--   'your-admin-uuid-here',
--   'Admin User',
--   'admin@mlimi-connect.com',
--   'admin',
--   '+265999999999'
-- );

-- Step 6: After confirming everything works, enable minimal RLS policies
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid()::TEXT = id);
-- CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid()::TEXT = id);
-- CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid()::TEXT = id);

-- CREATE POLICY "farms_select" ON farms FOR SELECT USING (auth.uid()::TEXT = farmer_id);
-- CREATE POLICY "farms_insert" ON farms FOR INSERT WITH CHECK (auth.uid()::TEXT = farmer_id);
-- CREATE POLICY "farms_update" ON farms FOR UPDATE USING (auth.uid()::TEXT = farmer_id);

-- CREATE POLICY "consultations_select_farmer" ON consultations FOR SELECT USING (auth.uid()::TEXT = farmer_id);
-- CREATE POLICY "consultations_select_consultant" ON consultations FOR SELECT USING (auth.uid()::TEXT = consultant_id);
-- CREATE POLICY "consultations_insert" ON consultations FOR INSERT WITH CHECK (auth.uid()::TEXT = farmer_id);
-- CREATE POLICY "consultations_update" ON consultations FOR UPDATE USING (auth.uid()::TEXT = consultant_id);