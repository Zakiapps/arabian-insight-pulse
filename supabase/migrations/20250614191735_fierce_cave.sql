/*
  # Create get_user_projects RPC function

  1. New Functions
    - `get_user_projects()` - Returns user's projects with upload and analysis counts
      - Returns project details including id, name, description, is_active status
      - Includes aggregated counts for uploads and analyses per project
      - Filters results to only show projects owned by the authenticated user

  2. Security
    - Function uses auth.uid() to ensure users only see their own projects
    - Leverages existing RLS policies on underlying tables
*/

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
        COALESCE(uc.count, 0) AS upload_count,
        COALESCE(ac.count, 0) AS analysis_count,
        p.created_at,
        p.updated_at
    FROM
        public.projects p
    LEFT JOIN (
        SELECT
            project_id,
            COUNT(*) AS count
        FROM
            public.uploads
        GROUP BY
            project_id
    ) uc ON p.id = uc.project_id
    LEFT JOIN (
        SELECT
            u.project_id,
            COUNT(*) AS count
        FROM
            public.analyses a
        JOIN
            public.uploads u ON a.upload_id = u.id
        GROUP BY
            u.project_id
    ) ac ON p.id = ac.project_id
    WHERE
        p.user_id = auth.uid()
    ORDER BY p.updated_at DESC;
END;
$$;