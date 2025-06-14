/*
  # Create get_user_projects function

  1. New Functions
    - `get_user_projects` - Get all projects for the current user with counts
    
  2. Security
    - Function is secured with SECURITY DEFINER
    - Only returns projects owned by the current user
*/

-- Create the function with a simpler implementation to avoid timeout
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

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_projects() TO authenticated;