/*
  # Admin Functions

  1. New Functions
    - `is_admin` - Check if current user is an admin
    - `admin_create_user` - Create a new user with profile
    - `admin_delete_user` - Delete a user
    - `admin_update_user_role` - Update a user's role
    - `get_user_count` - Get total user count
    - `get_active_subscription_count` - Get active subscription count
    - `get_total_revenue` - Get total revenue
    - `get_all_users_admin` - Get all users with details (admin only)
    - `get_sentiment_stats` - Get sentiment statistics

  2. Security
    - Functions are secured with appropriate permissions
    - Admin-only functions check for admin role
*/

-- Function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT (role = 'admin') INTO is_admin
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new user (admin only)
CREATE OR REPLACE FUNCTION admin_create_user(
  email_param TEXT,
  password_param TEXT,
  full_name_param TEXT,
  role_param TEXT DEFAULT 'user'
)
RETURNS JSONB AS $$
DECLARE
  new_user_id UUID;
  result JSONB;
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can create users';
  END IF;

  -- Create user in auth.users
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (
    email_param,
    crypt(password_param, gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('full_name', full_name_param)
  )
  RETURNING id INTO new_user_id;

  -- Create profile
  INSERT INTO profiles (id, full_name, role)
  VALUES (new_user_id, full_name_param, role_param);

  -- Return result
  SELECT jsonb_build_object(
    'id', new_user_id,
    'email', email_param,
    'full_name', full_name_param,
    'role', role_param
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a user (admin only)
CREATE OR REPLACE FUNCTION admin_delete_user(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

  -- Delete user from auth.users (will cascade to profiles)
  DELETE FROM auth.users WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a user's role (admin only)
CREATE OR REPLACE FUNCTION admin_update_user_role(user_id_param UUID, new_role TEXT)
RETURNS VOID AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can update user roles';
  END IF;

  -- Update user role
  UPDATE profiles
  SET role = new_role
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get total user count
CREATE OR REPLACE FUNCTION get_user_count()
RETURNS INT AS $$
DECLARE
  user_count INT;
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can view user count';
  END IF;

  SELECT COUNT(*) INTO user_count FROM profiles;
  RETURN user_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active subscription count
CREATE OR REPLACE FUNCTION get_active_subscription_count()
RETURNS INT AS $$
DECLARE
  subscription_count INT;
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can view subscription count';
  END IF;

  SELECT COUNT(*) INTO subscription_count 
  FROM subscriptions 
  WHERE status = 'active';
  
  RETURN subscription_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get total revenue
CREATE OR REPLACE FUNCTION get_total_revenue()
RETURNS INT AS $$
DECLARE
  total_revenue INT;
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can view revenue';
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO total_revenue 
  FROM transactions 
  WHERE status = 'succeeded';
  
  RETURN total_revenue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all users with details (admin only)
CREATE OR REPLACE FUNCTION get_all_users_admin()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  subscription_plan TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  is_online BOOLEAN,
  payment_methods_count INT
) AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can view all users';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    u.email,
    p.full_name,
    p.role,
    p.subscription_plan,
    p.avatar_url,
    p.created_at,
    u.last_sign_in_at,
    COALESCE(s.is_online, FALSE) AS is_online,
    0 AS payment_methods_count
  FROM 
    profiles p
  JOIN 
    auth.users u ON p.id = u.id
  LEFT JOIN 
    user_sessions s ON p.id = s.user_id AND s.is_online = TRUE
  ORDER BY 
    p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get sentiment statistics
CREATE OR REPLACE FUNCTION get_sentiment_stats(user_id_param UUID DEFAULT NULL)
RETURNS TABLE (
  total_posts INT,
  positive_posts INT,
  negative_posts INT,
  neutral_posts INT,
  jordanian_posts INT
) AS $$
DECLARE
  user_filter UUID;
BEGIN
  -- If user_id_param is NULL, use current user's ID
  user_filter := COALESCE(user_id_param, auth.uid());
  
  RETURN QUERY
  SELECT
    COUNT(*) AS total_posts,
    COUNT(*) FILTER (WHERE sentiment = 'positive') AS positive_posts,
    COUNT(*) FILTER (WHERE sentiment = 'negative') AS negative_posts,
    COUNT(*) FILTER (WHERE sentiment = 'neutral') AS neutral_posts,
    COUNT(*) FILTER (WHERE is_jordanian_dialect = TRUE) AS jordanian_posts
  FROM
    analyzed_posts
  WHERE
    user_id = user_filter;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;