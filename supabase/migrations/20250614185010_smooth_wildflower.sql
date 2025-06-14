/*
  # Create Project Management RPC Functions

  This migration creates the missing RPC functions needed for project management functionality.

  ## New Functions
  1. `get_user_projects()` - Returns projects for the authenticated user with upload and analysis counts
  2. `create_project(name_param, description_param)` - Creates a new project for the authenticated user
  3. `update_project(project_id_param, name_param, description_param, is_active_param)` - Updates an existing project
  4. `delete_project(project_id_param)` - Deletes a project and all related data
  5. `get_project_stats(project_id_param)` - Returns statistics for a specific project

  ## Security
  - All functions use RLS policies and auth.uid() to ensure users can only access their own data
  - Functions return appropriate data types matching the frontend expectations
*/

-- Function to get user projects with counts
CREATE OR REPLACE FUNCTION get_user_projects()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  is_active boolean,
  upload_count bigint,
  analysis_count bigint,
  created_at timestamptz,
  updated_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.is_active,
    COALESCE(u.upload_count, 0) as upload_count,
    COALESCE(a.analysis_count, 0) as analysis_count,
    p.created_at,
    p.updated_at
  FROM projects p
  LEFT JOIN (
    SELECT project_id, COUNT(*) as upload_count
    FROM uploads
    GROUP BY project_id
  ) u ON p.id = u.project_id
  LEFT JOIN (
    SELECT up.project_id, COUNT(*) as analysis_count
    FROM analyses a
    JOIN uploads up ON a.upload_id = up.id
    GROUP BY up.project_id
  ) a ON p.id = a.project_id
  WHERE p.user_id = auth.uid()
  ORDER BY p.updated_at DESC;
END;
$$;

-- Function to create a new project
CREATE OR REPLACE FUNCTION create_project(
  name_param text,
  description_param text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_project_id uuid;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate input
  IF name_param IS NULL OR trim(name_param) = '' THEN
    RAISE EXCEPTION 'Project name is required';
  END IF;

  -- Insert new project
  INSERT INTO projects (user_id, name, description)
  VALUES (auth.uid(), trim(name_param), description_param)
  RETURNING id INTO new_project_id;

  RETURN new_project_id;
END;
$$;

-- Function to update a project
CREATE OR REPLACE FUNCTION update_project(
  project_id_param uuid,
  name_param text DEFAULT NULL,
  description_param text DEFAULT NULL,
  is_active_param boolean DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_exists boolean;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if project exists and belongs to user
  SELECT EXISTS(
    SELECT 1 FROM projects 
    WHERE id = project_id_param AND user_id = auth.uid()
  ) INTO project_exists;

  IF NOT project_exists THEN
    RETURN false;
  END IF;

  -- Update project with provided parameters
  UPDATE projects 
  SET 
    name = COALESCE(name_param, name),
    description = COALESCE(description_param, description),
    is_active = COALESCE(is_active_param, is_active),
    updated_at = now()
  WHERE id = project_id_param AND user_id = auth.uid();

  RETURN true;
END;
$$;

-- Function to delete a project
CREATE OR REPLACE FUNCTION delete_project(project_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_exists boolean;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if project exists and belongs to user
  SELECT EXISTS(
    SELECT 1 FROM projects 
    WHERE id = project_id_param AND user_id = auth.uid()
  ) INTO project_exists;

  IF NOT project_exists THEN
    RETURN false;
  END IF;

  -- Delete project (cascading deletes will handle related records)
  DELETE FROM projects 
  WHERE id = project_id_param AND user_id = auth.uid();

  RETURN true;
END;
$$;

-- Function to get project statistics
CREATE OR REPLACE FUNCTION get_project_stats(project_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_exists boolean;
  stats_result jsonb;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if project exists and belongs to user
  SELECT EXISTS(
    SELECT 1 FROM projects 
    WHERE id = project_id_param AND user_id = auth.uid()
  ) INTO project_exists;

  IF NOT project_exists THEN
    RAISE EXCEPTION 'Project not found or access denied';
  END IF;

  -- Build statistics
  WITH upload_stats AS (
    SELECT COUNT(*) as upload_count
    FROM uploads
    WHERE project_id = project_id_param
  ),
  analysis_stats AS (
    SELECT 
      COUNT(*) as analysis_count,
      COUNT(CASE WHEN a.sentiment = 'positive' THEN 1 END) as positive_count,
      COUNT(CASE WHEN a.sentiment = 'negative' THEN 1 END) as negative_count,
      COUNT(CASE WHEN a.sentiment = 'neutral' THEN 1 END) as neutral_count
    FROM analyses a
    JOIN uploads u ON a.upload_id = u.id
    WHERE u.project_id = project_id_param
  ),
  dialect_stats AS (
    SELECT 
      jsonb_object_agg(
        COALESCE(a.dialect, 'unknown'), 
        count
      ) as dialect_distribution
    FROM (
      SELECT 
        a.dialect,
        COUNT(*) as count
      FROM analyses a
      JOIN uploads u ON a.upload_id = u.id
      WHERE u.project_id = project_id_param
      AND a.dialect IS NOT NULL
      GROUP BY a.dialect
    ) dialect_counts
  ),
  source_stats AS (
    SELECT 
      jsonb_object_agg(
        u.source, 
        count
      ) as source_distribution
    FROM (
      SELECT 
        u.source,
        COUNT(*) as count
      FROM uploads u
      WHERE u.project_id = project_id_param
      GROUP BY u.source
    ) source_counts
  )
  SELECT jsonb_build_object(
    'upload_count', COALESCE(us.upload_count, 0),
    'analysis_count', COALESCE(ans.analysis_count, 0),
    'sentiment_distribution', jsonb_build_object(
      'positive', COALESCE(ans.positive_count, 0),
      'negative', COALESCE(ans.negative_count, 0),
      'neutral', COALESCE(ans.neutral_count, 0)
    ),
    'dialect_distribution', COALESCE(ds.dialect_distribution, '{}'::jsonb),
    'source_distribution', COALESCE(ss.source_distribution, '{}'::jsonb)
  ) INTO stats_result
  FROM upload_stats us
  CROSS JOIN analysis_stats ans
  LEFT JOIN dialect_stats ds ON true
  LEFT JOIN source_stats ss ON true;

  RETURN stats_result;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_projects() TO authenticated;
GRANT EXECUTE ON FUNCTION create_project(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION update_project(uuid, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_project(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_stats(uuid) TO authenticated;