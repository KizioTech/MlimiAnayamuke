-- Create Admin User Manually
-- Run this in Supabase SQL Editor after fixing policies

-- Step 1: Temporarily disable RLS to allow manual profile creation
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Create a user through the Supabase Auth UI or API first
-- Then get the user ID and run this INSERT statement

-- Replace 'your-user-id-here' with the actual user ID from auth.users
-- You can find this in Supabase Dashboard > Authentication > Users

-- INSERT INTO profiles (id, name, email, role, phone)
-- VALUES (
--   'your-user-id-here', -- Replace with actual UUID from auth.users
--   'Admin User',
--   'admin@mlimi-connect.com',
--   'admin',
--   '+265999999999'
-- );

-- Step 3: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Verify the admin user was created
-- SELECT * FROM profiles WHERE role = 'admin';

-- Alternative: If you want to create admin through application
-- 1. Temporarily modify the registration code to allow admin role
-- 2. Register a user with admin role
-- 3. Then restore the original code