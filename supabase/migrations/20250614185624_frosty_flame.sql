/*
  # Project Management Functions

  1. New Functions
    - `get_user_projects` - Retrieves user's projects with upload and analysis counts
    - `create_project` - Creates a new project for the authenticated user
    - `update_project` - Updates project details (name, description, active status)
    - `delete_project` - Deletes a user's project
    - `get_project_stats` - Gets detailed statistics for a project

  2. Security
    - All functions use SECURITY DEFINER with user authentication checks
    - Users can only access their own projects
    - Proper error handling for unauthorized access
*/

-- First, drop existing functions to avoid return type conflicts
DROP FUNCTION IF EXISTS public.get_user_projects();
DROP FUNCTION IF EXISTS public.create_project(text, text);
DROP FUNCTION IF EXISTS public.update_project(uuid, text, text, boolean);
DROP FUNCTION IF EXISTS public.delete_project(uuid);
DROP FUNCTION IF EXISTS public.get_project_stats(uuid);

-- Function to get user's projects with counts
CREATE OR REPLACE FUNCTION public.get_user_projects()
RETURNS TABLE (
    id uuid,
    name text,
    description text,
    is_active boolean,
    upload_count bigint,
    analysis_count bigint,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id uuid;
BEGIN
    -- Get the current user's ID
    SELECT auth.uid() INTO current_user_id;

    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.description,
        p.is_active,
        COALESCE(uc.count, 0) AS upload_count,
        COALESCE(ac.count, 0) AS analysis_count,
        p.created_at,
        p.updated_at
    FROM
        projects p
    LEFT JOIN (
        SELECT
            u.project_id,
            COUNT(u.id) AS count
        FROM
            uploads u
        GROUP BY
            u.project_id
    ) uc ON p.id = uc.project_id
    LEFT JOIN (
        SELECT
            u.project_id,
            COUNT(a.id) AS count
        FROM
            analyses a
        JOIN
            uploads u ON a.upload_id = u.id
        GROUP BY
            u.project_id
    ) ac ON p.id = ac.project_id
    WHERE
        p.user_id = current_user_id
    ORDER BY
        p.created_at DESC;
END;
$$;

-- Function to create a new project
CREATE OR REPLACE FUNCTION public.create_project(
    name_param text,
    description_param text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id uuid;
    new_project_id uuid;
BEGIN
    -- Get the current user's ID
    SELECT auth.uid() INTO current_user_id;

    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    IF name_param IS NULL OR trim(name_param) = '' THEN
        RAISE EXCEPTION 'Project name is required';
    END IF;

    -- Insert new project
    INSERT INTO projects (user_id, name, description)
    VALUES (current_user_id, trim(name_param), description_param)
    RETURNING id INTO new_project_id;

    RETURN new_project_id;
END;
$$;

-- Function to update a project
CREATE OR REPLACE FUNCTION public.update_project(
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
    current_user_id uuid;
    project_exists boolean;
BEGIN
    -- Get the current user's ID
    SELECT auth.uid() INTO current_user_id;

    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Check if project exists and belongs to user
    SELECT EXISTS(
        SELECT 1 FROM projects 
        WHERE id = project_id_param AND user_id = current_user_id
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
    WHERE id = project_id_param AND user_id = current_user_id;

    RETURN true;
END;
$$;

-- Function to delete a project
CREATE OR REPLACE FUNCTION public.delete_project(
    project_id_param uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id uuid;
    project_exists boolean;
BEGIN
    -- Get the current user's ID
    SELECT auth.uid() INTO current_user_id;

    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Check if project exists and belongs to user
    SELECT EXISTS(
        SELECT 1 FROM projects 
        WHERE id = project_id_param AND user_id = current_user_id
    ) INTO project_exists;

    IF NOT project_exists THEN
        RETURN false;
    END IF;

    -- Delete project (cascading deletes will handle related records)
    DELETE FROM projects 
    WHERE id = project_id_param AND user_id = current_user_id;

    RETURN true;
END;
$$;

-- Function to get project statistics
CREATE OR REPLACE FUNCTION public.get_project_stats(
    project_id_param uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id uuid;
    project_exists boolean;
    stats_result jsonb;
BEGIN
    -- Get the current user's ID
    SELECT auth.uid() INTO current_user_id;

    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Check if project exists and belongs to user
    SELECT EXISTS(
        SELECT 1 FROM projects 
        WHERE id = project_id_param AND user_id = current_user_id
    ) INTO project_exists;

    IF NOT project_exists THEN
        RAISE EXCEPTION 'Project not found or access denied';
    END IF;

    -- Build comprehensive statistics
    WITH upload_stats AS (
        SELECT COUNT(*) as upload_count
        FROM uploads u
        WHERE u.project_id = project_id_param
    ),
    analysis_stats AS (
        SELECT COUNT(*) as analysis_count
        FROM analyses a
        JOIN uploads u ON a.upload_id = u.id
        WHERE u.project_id = project_id_param
    ),
    sentiment_stats AS (
        SELECT 
            a.sentiment,
            COUNT(*) as count
        FROM analyses a
        JOIN uploads u ON a.upload_id = u.id
        WHERE u.project_id = project_id_param
        GROUP BY a.sentiment
    ),
    dialect_stats AS (
        SELECT 
            a.dialect,
            COUNT(*) as count
        FROM analyses a
        JOIN uploads u ON a.upload_id = u.id
        WHERE u.project_id = project_id_param AND a.dialect IS NOT NULL
        GROUP BY a.dialect
    ),
    source_stats AS (
        SELECT 
            u.source,
            COUNT(*) as count
        FROM uploads u
        WHERE u.project_id = project_id_param AND u.source IS NOT NULL
        GROUP BY u.source
    )
    SELECT jsonb_build_object(
        'upload_count', COALESCE(us.upload_count, 0),
        'analysis_count', COALESCE(ans.analysis_count, 0),
        'sentiment_distribution', jsonb_build_object(
            'positive', COALESCE((SELECT count FROM sentiment_stats WHERE sentiment = 'positive'), 0),
            'negative', COALESCE((SELECT count FROM sentiment_stats WHERE sentiment = 'negative'), 0),
            'neutral', COALESCE((SELECT count FROM sentiment_stats WHERE sentiment = 'neutral'), 0)
        ),
        'dialect_distribution', COALESCE(
            (SELECT jsonb_object_agg(dialect, count) FROM dialect_stats), 
            '{}'::jsonb
        ),
        'source_distribution', COALESCE(
            (SELECT jsonb_object_agg(source, count) FROM source_stats), 
            '{}'::jsonb
        )
    ) INTO stats_result
    FROM upload_stats us
    CROSS JOIN analysis_stats ans;

    RETURN stats_result;
END;
$$;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_projects() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_project(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_project(uuid, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_project(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_stats(uuid) TO authenticated;