/*
  # Fix profiles table RLS policies

  1. Changes
    - Remove existing policies that might be causing recursion
    - Add proper policies for authenticated users to manage their own profiles
    - Add policy for public viewing if needed
    
  2. Security
    - Enable row level security
    - Ensure users can only access their own profiles
    - Allow public read access if needed
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
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- If public read access is needed, add this policy
CREATE POLICY "Public profiles are viewable"
ON profiles
FOR SELECT
TO public
USING (true);