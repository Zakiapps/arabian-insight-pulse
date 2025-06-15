
-- Create table for storing text analysis results
CREATE TABLE IF NOT EXISTS public.text_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  input_text TEXT NOT NULL,
  sentiment TEXT NOT NULL, -- positive, negative, neutral
  sentiment_score DECIMAL(5,4) NOT NULL, -- confidence score 0-1
  language TEXT NOT NULL DEFAULT 'arabic',
  dialect TEXT, -- jordanian, egyptian, saudi, etc.
  dialect_confidence DECIMAL(5,4),
  model_response JSONB, -- store full model response
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.text_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for text_analyses
CREATE POLICY "Users can view their own analyses" 
  ON public.text_analyses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses" 
  ON public.text_analyses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses" 
  ON public.text_analyses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses" 
  ON public.text_analyses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to get project analysis stats
CREATE OR REPLACE FUNCTION get_project_analysis_stats(project_id_param UUID)
RETURNS TABLE(
  total_analyses BIGINT,
  positive_count BIGINT,
  negative_count BIGINT,
  neutral_count BIGINT,
  arabic_count BIGINT,
  jordanian_dialect_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has access to project
  IF NOT EXISTS (
    SELECT 1 FROM projects
    WHERE id = project_id_param
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to project';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*) AS total_analyses,
    COUNT(*) FILTER (WHERE sentiment = 'positive') AS positive_count,
    COUNT(*) FILTER (WHERE sentiment = 'negative') AS negative_count,
    COUNT(*) FILTER (WHERE sentiment = 'neutral') AS neutral_count,
    COUNT(*) FILTER (WHERE language = 'arabic') AS arabic_count,
    COUNT(*) FILTER (WHERE dialect = 'jordanian') AS jordanian_dialect_count
  FROM text_analyses
  WHERE project_id = project_id_param;
END;
$$;
