/*
  # Fix profiles table RLS policies

  1. Changes
    - Remove recursive admin policy that was causing infinite recursion
    - Simplify RLS policies for profiles table
    - Add clear, non-recursive policies for admin and user access

  2. Security
    - Maintain row level security
    - Ensure users can only access their own profiles
    - Allow admins to access all profiles
    - Keep existing security constraints
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable admin full access" ON profiles;
DROP POLICY IF EXISTS "Enable read access for admins" ON profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;

-- Create new, non-recursive policies
CREATE POLICY "Enable read access for own profile"
ON profiles FOR SELECT
TO public
USING (auth.uid() = id);

CREATE POLICY "Enable insert for own profile"
ON profiles FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for own profile"
ON profiles FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable admin access"
ON profiles FOR ALL
TO public
USING (
  auth.jwt() ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);