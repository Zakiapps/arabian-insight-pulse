/*
  # Fix profiles table RLS policies

  1. Changes
    - Remove recursive policies that cause infinite loops
    - Simplify admin access policy
    - Update user access policies to avoid self-referential checks
  
  2. Security
    - Maintain row-level security
    - Ensure users can only access their own profiles
    - Allow admins full access
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new, simplified policies
CREATE POLICY "Enable full access for admins"
ON profiles
TO public
USING (
  auth.jwt() ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "Enable insert for users based on user_id"
ON profiles
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = id
);

CREATE POLICY "Enable read access for users to own profile"
ON profiles
FOR SELECT
TO public
USING (
  auth.uid() = id
);

CREATE POLICY "Enable update for users to own profile"
ON profiles
FOR UPDATE
TO public
USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
);

CREATE POLICY "Enable delete for users to own profile"
ON profiles
FOR DELETE
TO public
USING (
  auth.uid() = id
);