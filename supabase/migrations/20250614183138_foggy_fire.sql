/*
  # Fix Profiles Table RLS Policies

  1. Changes
    - Remove existing restrictive policies
    - Add new policies for admin access
    - Add policies for user self-management
    - Add policy for public profile viewing

  2. Security
    - Enable RLS on profiles table
    - Add comprehensive policies for all operations
    - Ensure admin users can manage all profiles
    - Allow users to manage their own profiles
*/

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable admin access" ON profiles;
DROP POLICY IF EXISTS "Enable insert for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;

-- Create new policies with proper access controls

-- Admin full access policy
CREATE POLICY "Admins have full access to profiles"
ON profiles
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles AS p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles AS p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO public
USING (auth.uid() = id);

-- Users can create their own profile
CREATE POLICY "Users can create own profile"
ON profiles
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
ON profiles
FOR DELETE
TO public
USING (auth.uid() = id);