/*
  # Fix get_project_stats function and other project-related functions

  1. Changes
    - Drop existing functions first to avoid return type conflicts
    - Recreate functions with proper return types
    - Simplify implementation to avoid timeouts
    
  2. Security
    - Maintain security definer attribute
    - Ensure proper user authentication checks
    - Verify project ownership before operations
*/

-- First, drop existing functions to avoid return type conflicts
DROP FUNCTION IF EXISTS public.get_project_stats(uuid);
DROP FUNCTION IF EXISTS public.get_user_projects();
DROP FUNCTION IF EXISTS public.create_project(text, text);
DROP FUNCTION IF EXISTS public.update_project(uuid, text, text, boolean);
DROP FUNCTION IF EXISTS public.delete_project(uuid);

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
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        p.id,
        p.name,
        p.description,
        p.is_active,
        COALESCE(COUNT(DISTINCT u.id), 0)::bigint AS upload_count,
        COALESCE(COUNT(DISTINCT a.id), 0)::bigint AS analysis_count,
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
        p.updated_at DESC;
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
CREATE OR REPLACE FUNCTION public.delete_project(
    project_id_param uuid
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

    -- Delete project (cascading deletes will handle related records)
    DELETE FROM projects 
    WHERE id = project_id_param AND user_id = auth.uid();

    RETURN true;
END;
$$;

-- Function to get project statistics - simplified to avoid timeout
CREATE OR REPLACE FUNCTION public.get_project_stats(
    project_id_param uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    project_exists boolean;
    upload_count integer;
    analysis_count integer;
    positive_count integer;
    negative_count integer;
    neutral_count integer;
    result jsonb;
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

    -- Get upload count
    SELECT COUNT(*) INTO upload_count
    FROM uploads
    WHERE project_id = project_id_param;

    -- Get analysis count
    SELECT COUNT(*) INTO analysis_count
    FROM analyses a
    JOIN uploads u ON a.upload_id = u.id
    WHERE u.project_id = project_id_param;

    -- Get sentiment counts
    SELECT 
        COUNT(*) FILTER (WHERE a.sentiment = 'positive'),
        COUNT(*) FILTER (WHERE a.sentiment = 'negative'),
        COUNT(*) FILTER (WHERE a.sentiment = 'neutral')
    INTO positive_count, negative_count, neutral_count
    FROM analyses a
    JOIN uploads u ON a.upload_id = u.id
    WHERE u.project_id = project_id_param;

    -- Build result JSON
    result := jsonb_build_object(
        'upload_count', upload_count,
        'analysis_count', analysis_count,
        'sentiment_distribution', jsonb_build_object(
            'positive', COALESCE(positive_count, 0),
            'negative', COALESCE(negative_count, 0),
            'neutral', COALESCE(neutral_count, 0)
        )
    );

    RETURN result;
END;
$$;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_projects() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_project(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_project(uuid, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_project(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_stats(uuid) TO authenticated;