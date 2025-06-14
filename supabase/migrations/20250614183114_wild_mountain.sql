/*
  # Fix profiles table RLS policy

  1. Changes
    - Drop existing RLS policies that may be causing recursion
    - Create new simplified RLS policy for profiles table
    
  2. Security
    - Enable RLS on profiles table
    - Add policy for authenticated users to read/write their own profile data
    - Add policy for public read access if needed
*/

-- First, drop any existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add a simple policy for authenticated users to manage their own profiles
CREATE POLICY "Users can manage own profile"
ON profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- If public read access is needed, add this policy
CREATE POLICY "Public profiles are viewable"
ON profiles
FOR SELECT
TO public
USING (true);