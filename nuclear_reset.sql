-- Nuclear Reset - Complete Database Fix
-- Run this in Supabase SQL Editor

-- Step 1: Drop everything problematic
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

-- Step 2: Temporarily disable RLS completely
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 3: Remove the foreign key constraint temporarily
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 4: Add back the foreign key without cascading delete initially
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id);

-- Step 5: Create a simple trigger that doesn't cause conflicts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if profile doesn't exist
  INSERT INTO public.profiles (id, name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Test user creation (this should work now)
-- The trigger will create profiles automatically

-- Step 8: After confirming users can be created, re-enable RLS with minimal policies
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "users_select_own" ON profiles
--   FOR SELECT USING (auth.uid() = id);
--
-- CREATE POLICY "users_insert_own" ON profiles
--   FOR INSERT WITH CHECK (auth.uid() = id);
--
-- CREATE POLICY "users_update_own" ON profiles
--   FOR UPDATE USING (auth.uid() = id);