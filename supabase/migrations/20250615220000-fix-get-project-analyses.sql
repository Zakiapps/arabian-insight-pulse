
-- Fix the ambiguous column reference in get_project_analyses function
CREATE OR REPLACE FUNCTION get_project_analyses(project_id_param UUID)
RETURNS TABLE(
  analysis_id uuid,
  upload_id uuid,
  sentiment text,
  sentiment_score double precision,
  dialect text,
  dialect_confidence double precision,
  created_at timestamp with time zone,
  raw_text text,
  source text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has access to project
  IF NOT EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_id_param
    AND projects.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to project';
  END IF;

  RETURN QUERY
  SELECT
    a.id as analysis_id,
    a.upload_id,
    a.sentiment,
    a.sentiment_score,
    a.dialect,
    a.dialect_confidence,
    a.created_at,
    u.raw_text,
    u.source
  FROM
    analyses a
  JOIN
    uploads u ON a.upload_id = u.id
  WHERE
    u.project_id = project_id_param
  ORDER BY
    a.created_at DESC;
END;
$$;
