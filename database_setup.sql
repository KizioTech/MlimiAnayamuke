-- Supabase Database Setup for Mlimi Connect Farm
-- Run this SQL in your Supabase SQL Editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'farmer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create farms table
CREATE TABLE IF NOT EXISTS farms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  size DECIMAL,
  crops TEXT[],
  soil_type TEXT,
  location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for farms
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

-- Farms policies
DROP POLICY IF EXISTS "Users can view own farms" ON farms;
CREATE POLICY "Users can view own farms" ON farms
  FOR SELECT USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Users can insert own farms" ON farms;
CREATE POLICY "Users can insert own farms" ON farms
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Users can update own farms" ON farms;
CREATE POLICY "Users can update own farms" ON farms
  FOR UPDATE USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Users can delete own farms" ON farms;
CREATE POLICY "Users can delete own farms" ON farms
  FOR DELETE USING (auth.uid() = farmer_id);

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES profiles(id),
  issue_description TEXT NOT NULL,
  recommendation TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for consultations
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Consultations policies
DROP POLICY IF EXISTS "Farmers can view own consultations" ON consultations;
CREATE POLICY "Farmers can view own consultations" ON consultations
  FOR SELECT USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Consultants can view assigned consultations" ON consultations;
CREATE POLICY "Consultants can view assigned consultations" ON consultations
  FOR SELECT USING (auth.uid() = consultant_id);

DROP POLICY IF EXISTS "Farmers can create consultations" ON consultations;
CREATE POLICY "Farmers can create consultations" ON consultations
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Consultants can update consultations" ON consultations;
CREATE POLICY "Consultants can update consultations" ON consultations
  FOR UPDATE USING (auth.uid() = consultant_id);

-- Allow admins to view all consultations
DROP POLICY IF EXISTS "Admins can view all consultations" ON consultations;
CREATE POLICY "Admins can view all consultations" ON consultations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_farms_updated_at ON farms;
CREATE TRIGGER update_farms_updated_at
    BEFORE UPDATE ON farms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consultations_updated_at ON consultations;
CREATE TRIGGER update_consultations_updated_at
    BEFORE UPDATE ON consultations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();