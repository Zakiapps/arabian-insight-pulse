/*
  # User Functions

  1. New Functions
    - `create_project` - Create a new project
    - `update_project` - Update a project
    - `delete_project` - Delete a project
    - `get_user_projects` - Get all projects for current user
    - `get_project_stats` - Get statistics for a project
    - `log_function_execution` - Log function execution
    - `update_user_preferences` - Update user preferences

  2. Security
    - Functions are secured with appropriate permissions
    - User-specific functions check for user ownership
*/

-- Function to create a new project
CREATE OR REPLACE FUNCTION create_project(
  name_param TEXT,
  description_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  project_id UUID;
BEGIN
  INSERT INTO projects (
    user_id,
    name,
    description
  )
  VALUES (
    auth.uid(),
    name_param,
    description_param
  )
  RETURNING id INTO project_id;
  
  RETURN project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a project
CREATE OR REPLACE FUNCTION update_project(
  project_id_param UUID,
  name_param TEXT DEFAULT NULL,
  description_param TEXT DEFAULT NULL,
  is_active_param BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  project_exists BOOLEAN;
BEGIN
  -- Check if project exists and belongs to user
  SELECT EXISTS (
    SELECT 1 FROM projects
    WHERE id = project_id_param
    AND user_id = auth.uid()
  ) INTO project_exists;
  
  IF NOT project_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Update project
  UPDATE projects
  SET
    name = COALESCE(name_param, name),
    description = COALESCE(description_param, description),
    is_active = COALESCE(is_active_param, is_active),
    updated_at = NOW()
  WHERE id = project_id_param;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a project
CREATE OR REPLACE FUNCTION delete_project(project_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  project_exists BOOLEAN;
BEGIN
  -- Check if project exists and belongs to user
  SELECT EXISTS (
    SELECT 1 FROM projects
    WHERE id = project_id_param
    AND user_id = auth.uid()
  ) INTO project_exists;
  
  IF NOT project_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Delete project (cascades to related tables)
  DELETE FROM projects
  WHERE id = project_id_param;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all projects for current user
CREATE OR REPLACE FUNCTION get_user_projects()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  is_active BOOLEAN,
  upload_count BIGINT,
  analysis_count BIGINT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.is_active,
    COUNT(DISTINCT u.id) AS upload_count,
    COUNT(DISTINCT a.id) AS analysis_count,
    p.created_at,
    p.updated_at
  FROM 
    projects p
  LEFT JOIN 
    uploads u ON p.id = u.project_id
  LEFT JOIN 
    analyses a ON u.id = a.upload_id
  WHERE 
    p.user_id = auth.uid()
  GROUP BY 
    p.id
  ORDER BY 
    p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get statistics for a project
CREATE OR REPLACE FUNCTION get_project_stats(project_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  project_exists BOOLEAN;
  result JSONB;
BEGIN
  -- Check if project exists and belongs to user
  SELECT EXISTS (
    SELECT 1 FROM projects
    WHERE id = project_id_param
    AND user_id = auth.uid()
  ) INTO project_exists;
  
  IF NOT project_exists THEN
    RETURN NULL;
  END IF;
  
  -- Get statistics
  SELECT jsonb_build_object(
    'upload_count', (SELECT COUNT(*) FROM uploads WHERE project_id = project_id_param),
    'analysis_count', (
      SELECT COUNT(*) FROM analyses a
      JOIN uploads u ON a.upload_id = u.id
      WHERE u.project_id = project_id_param
    ),
    'sentiment_distribution', (
      SELECT jsonb_build_object(
        'positive', COALESCE(COUNT(*) FILTER (WHERE a.sentiment = 'positive'), 0),
        'negative', COALESCE(COUNT(*) FILTER (WHERE a.sentiment = 'negative'), 0),
        'neutral', COALESCE(COUNT(*) FILTER (WHERE a.sentiment = 'neutral'), 0)
      )
      FROM analyses a
      JOIN uploads u ON a.upload_id = u.id
      WHERE u.project_id = project_id_param
    ),
    'dialect_distribution', (
      SELECT jsonb_object_agg(dialect, count)
      FROM (
        SELECT a.dialect, COUNT(*) as count
        FROM analyses a
        JOIN uploads u ON a.upload_id = u.id
        WHERE u.project_id = project_id_param
        AND a.dialect IS NOT NULL
        GROUP BY a.dialect
      ) as dialect_counts
    ),
    'source_distribution', (
      SELECT jsonb_object_agg(source, count)
      FROM (
        SELECT source, COUNT(*) as count
        FROM uploads
        WHERE project_id = project_id_param
        GROUP BY source
      ) as source_counts
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log function execution
CREATE OR REPLACE FUNCTION log_function_execution(
  function_name_param TEXT,
  status_param TEXT,
  execution_time_param FLOAT DEFAULT NULL,
  error_message_param TEXT DEFAULT NULL,
  request_payload_param JSONB DEFAULT NULL,
  response_payload_param JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO function_logs (
    function_name,
    status,
    execution_time,
    error_message,
    request_payload,
    response_payload
  )
  VALUES (
    function_name_param,
    status_param,
    execution_time_param,
    error_message_param,
    request_payload_param,
    response_payload_param
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user preferences
CREATE OR REPLACE FUNCTION update_user_preferences(
  language_param TEXT DEFAULT NULL,
  theme_param TEXT DEFAULT NULL,
  notification_settings_param JSONB DEFAULT NULL,
  dashboard_layout_param JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  preferences_exist BOOLEAN;
BEGIN
  -- Check if preferences exist
  SELECT EXISTS (
    SELECT 1 FROM user_preferences
    WHERE user_id = auth.uid()
  ) INTO preferences_exist;
  
  IF preferences_exist THEN
    -- Update existing preferences
    UPDATE user_preferences
    SET
      language = COALESCE(language_param, language),
      theme = COALESCE(theme_param, theme),
      notification_settings = COALESCE(notification_settings_param, notification_settings),
      dashboard_layout = COALESCE(dashboard_layout_param, dashboard_layout),
      updated_at = NOW()
    WHERE user_id = auth.uid();
  ELSE
    -- Insert new preferences
    INSERT INTO user_preferences (
      user_id,
      language,
      theme,
      notification_settings,
      dashboard_layout
    )
    VALUES (
      auth.uid(),
      COALESCE(language_param, 'ar'),
      COALESCE(theme_param, 'light'),
      COALESCE(notification_settings_param, '{"email": true, "in_app": true}'),
      dashboard_layout_param
    );
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;