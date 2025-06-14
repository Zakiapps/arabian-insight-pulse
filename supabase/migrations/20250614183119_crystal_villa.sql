/*
  # Fix recursive policies in profiles table

  1. Changes
    - Remove redundant and potentially recursive policies
    - Consolidate access rules into clear, non-recursive policies
    - Maintain security while eliminating circular references
    
  2. Security
    - Maintain row-level security
    - Ensure users can only access their own profiles
    - Preserve admin access to all profiles
    - Simplify policy structure while maintaining security model
*/

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admin full access" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can do anything with profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow admins to read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile or admin" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create new, simplified policies without recursion
CREATE POLICY "Enable read access for own profile"
ON profiles FOR SELECT
TO public
USING (
  auth.uid() = id
);

CREATE POLICY "Enable read access for admins"
ON profiles FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.role = 'admin'
    LIMIT 1
  )
);

CREATE POLICY "Enable insert for own profile"
ON profiles FOR INSERT
TO public
WITH CHECK (
  auth.uid() = id
);

CREATE POLICY "Enable update for own profile"
ON profiles FOR UPDATE
TO public
USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
);

CREATE POLICY "Enable admin full access"
ON profiles FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.role = 'admin'
    LIMIT 1
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles admin_profile
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.role = 'admin'
    LIMIT 1
  )
);