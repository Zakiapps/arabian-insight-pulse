/*
  # Admin Functions

  1. New Functions
    - `is_admin` - Check if current user is an admin
    - `admin_create_user` - Create a new user with profile
    - `admin_delete_user` - Delete a user
    - `admin_update_user_role` - Update a user's role
    - `get_user_count` - Get total user count
    - `get_project_count` - Get project count
    - `get_all_users_admin` - Get all users with details (admin only)
    - `get_system_stats` - Get system statistics

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

-- Function to get project count
CREATE OR REPLACE FUNCTION get_project_count()
RETURNS INT AS $$
DECLARE
  project_count INT;
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can view project count';
  END IF;

  SELECT COUNT(*) INTO project_count FROM projects;
  RETURN project_count;
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
  project_count INT
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
    (SELECT COUNT(*) FROM projects WHERE user_id = p.id) AS project_count
  FROM 
    profiles p
  JOIN 
    auth.users u ON p.id = u.id
  ORDER BY 
    p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get system statistics
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can view system statistics';
  END IF;

  SELECT jsonb_build_object(
    'user_count', (SELECT COUNT(*) FROM profiles),
    'project_count', (SELECT COUNT(*) FROM projects),
    'upload_count', (SELECT COUNT(*) FROM uploads),
    'analysis_count', (SELECT COUNT(*) FROM analyses),
    'success_rate', (
      SELECT 
        CASE 
          WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(*) FILTER (WHERE status = 'success')::FLOAT / COUNT(*)) * 100)
          ELSE 0
        END
      FROM function_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
    ),
    'avg_execution_time', (
      SELECT COALESCE(ROUND(AVG(execution_time)), 0)
      FROM function_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;