/*
  # Add Project Management Functions

  1. New Functions
    - `get_user_projects()` - Retrieves projects for the current user with upload and analysis counts
    - `create_project(name_param, description_param)` - Creates a new project for the current user
    - `update_project(project_id_param, name_param, description_param, is_active_param)` - Updates an existing project
    - `delete_project(project_id_param)` - Deletes a project and all related data
    - `get_project_stats(project_id_param)` - Gets detailed statistics for a specific project

  2. Security
    - All functions use RLS and auth.uid() to ensure users can only access their own data
    - Functions return appropriate data types matching the frontend expectations
*/

-- Function to get user projects with counts
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
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.description,
        p.is_active,
        COALESCE((SELECT COUNT(*) FROM public.uploads u WHERE u.project_id = p.id), 0)::bigint AS upload_count,
        COALESCE((SELECT COUNT(*) FROM public.analyses a JOIN public.uploads u ON a.upload_id = u.id WHERE u.project_id = p.id), 0)::bigint AS analysis_count,
        p.created_at,
        p.updated_at
    FROM
        public.projects p
    WHERE
        p.user_id = auth.uid()
    ORDER BY p.updated_at DESC;
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
    new_project_id uuid;
BEGIN
    INSERT INTO public.projects (user_id, name, description)
    VALUES (auth.uid(), name_param, description_param)
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
    updated_rows integer;
BEGIN
    UPDATE public.projects 
    SET 
        name = COALESCE(name_param, name),
        description = COALESCE(description_param, description),
        is_active = COALESCE(is_active_param, is_active),
        updated_at = now()
    WHERE 
        id = project_id_param 
        AND user_id = auth.uid();
    
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    RETURN updated_rows > 0;
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
    deleted_rows integer;
BEGIN
    DELETE FROM public.projects 
    WHERE 
        id = project_id_param 
        AND user_id = auth.uid();
    
    GET DIAGNOSTICS deleted_rows = ROW_COUNT;
    RETURN deleted_rows > 0;
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
    project_exists boolean;
    stats_result jsonb;
BEGIN
    -- Check if project exists and belongs to user
    SELECT EXISTS(
        SELECT 1 FROM public.projects 
        WHERE id = project_id_param AND user_id = auth.uid()
    ) INTO project_exists;
    
    IF NOT project_exists THEN
        RETURN NULL;
    END IF;
    
    -- Build statistics
    WITH upload_stats AS (
        SELECT COUNT(*) as upload_count
        FROM public.uploads u
        WHERE u.project_id = project_id_param
    ),
    analysis_stats AS (
        SELECT COUNT(*) as analysis_count
        FROM public.analyses a
        JOIN public.uploads u ON a.upload_id = u.id
        WHERE u.project_id = project_id_param
    ),
    sentiment_stats AS (
        SELECT 
            a.sentiment,
            COUNT(*) as count
        FROM public.analyses a
        JOIN public.uploads u ON a.upload_id = u.id
        WHERE u.project_id = project_id_param
        GROUP BY a.sentiment
    ),
    dialect_stats AS (
        SELECT 
            a.dialect,
            COUNT(*) as count
        FROM public.analyses a
        JOIN public.uploads u ON a.upload_id = u.id
        WHERE u.project_id = project_id_param
        AND a.dialect IS NOT NULL
        GROUP BY a.dialect
    ),
    source_stats AS (
        SELECT 
            u.source,
            COUNT(*) as count
        FROM public.uploads u
        WHERE u.project_id = project_id_param
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_projects() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_project(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_project(uuid, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_project(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_stats(uuid) TO authenticated;