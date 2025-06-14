/*
  # Bilingual SaaS Schema for Arabic Text Analysis

  1. New Tables
    - `projects` - User projects for organizing analyses
    - `brightdata_configs` - BrightData API configurations
    - `news_configs` - NewsAPI configurations
    - `uploads` - Uploaded content for analysis
    - `analyses` - Sentiment and dialect analysis results
    - `summaries` - Text summaries
    - `forecasts` - Sentiment trend forecasts
    - `function_logs` - Logs for edge functions

  2. Security
    - Enable RLS on all tables
    - Add policies for multi-tenant isolation
*/

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BrightData configurations
CREATE TABLE IF NOT EXISTS brightdata_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  rules JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NewsAPI configurations
CREATE TABLE IF NOT EXISTS news_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  sources TEXT[],
  keywords TEXT[],
  language TEXT DEFAULT 'ar',
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- 'brightdata', 'newsapi', 'manual', etc.
  title TEXT,
  file_url TEXT,
  raw_text TEXT NOT NULL,
  metadata JSONB,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  sentiment TEXT NOT NULL, -- 'positive', 'negative', 'neutral'
  sentiment_score FLOAT NOT NULL,
  dialect TEXT, -- 'jordanian', 'egyptian', 'levantine', etc.
  dialect_confidence FLOAT,
  model_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Summaries table
CREATE TABLE IF NOT EXISTS summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'ar', -- 'ar', 'en'
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forecasts table
CREATE TABLE IF NOT EXISTS forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  forecast_json JSONB NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function logs table
CREATE TABLE IF NOT EXISTS function_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success', 'error'
  duration_ms INTEGER,
  request_payload JSONB,
  response_payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE brightdata_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE function_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for brightdata_configs
CREATE POLICY "Users can view own brightdata configs"
  ON brightdata_configs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = brightdata_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own brightdata configs"
  ON brightdata_configs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = brightdata_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own brightdata configs"
  ON brightdata_configs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = brightdata_configs.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = brightdata_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own brightdata configs"
  ON brightdata_configs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = brightdata_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for news_configs
CREATE POLICY "Users can view own news configs"
  ON news_configs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = news_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own news configs"
  ON news_configs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = news_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own news configs"
  ON news_configs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = news_configs.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = news_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own news configs"
  ON news_configs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = news_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for uploads
CREATE POLICY "Users can view own uploads"
  ON uploads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = uploads.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own uploads"
  ON uploads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = uploads.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own uploads"
  ON uploads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = uploads.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = uploads.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own uploads"
  ON uploads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = uploads.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for analyses
CREATE POLICY "Users can view own analyses"
  ON analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM uploads
      JOIN projects ON uploads.project_id = projects.id
      WHERE uploads.id = analyses.upload_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own analyses"
  ON analyses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM uploads
      JOIN projects ON uploads.project_id = projects.id
      WHERE uploads.id = analyses.upload_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for summaries
CREATE POLICY "Users can view own summaries"
  ON summaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analyses
      JOIN uploads ON analyses.upload_id = uploads.id
      JOIN projects ON uploads.project_id = projects.id
      WHERE analyses.id = summaries.analysis_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own summaries"
  ON summaries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM analyses
      JOIN uploads ON analyses.upload_id = uploads.id
      JOIN projects ON uploads.project_id = projects.id
      WHERE analyses.id = summaries.analysis_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for forecasts
CREATE POLICY "Users can view own forecasts"
  ON forecasts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analyses
      JOIN uploads ON analyses.upload_id = uploads.id
      JOIN projects ON uploads.project_id = projects.id
      WHERE analyses.id = forecasts.analysis_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own forecasts"
  ON forecasts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM analyses
      JOIN uploads ON analyses.upload_id = uploads.id
      JOIN projects ON uploads.project_id = projects.id
      WHERE analyses.id = forecasts.analysis_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for function_logs (admin only)
CREATE POLICY "Only admins can view function logs"
  ON function_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can create function logs"
  ON function_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create storage buckets if they don't exist
DO $$
BEGIN
  -- Create uploads bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('uploads', 'uploads', false)
  ON CONFLICT (id) DO NOTHING;

  -- Create reports bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('reports', 'reports', false)
  ON CONFLICT (id) DO NOTHING;
END
$$;

-- Create RLS policies for storage buckets
BEGIN;
  -- Policy for uploads bucket
  DROP POLICY IF EXISTS "Users can access own uploads" ON storage.objects;
  CREATE POLICY "Users can access own uploads"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'uploads' AND
    (auth.uid() = owner OR owner IS NULL)
  )
  WITH CHECK (
    bucket_id = 'uploads' AND
    (auth.uid() = owner OR owner IS NULL)
  );

  -- Policy for reports bucket
  DROP POLICY IF EXISTS "Users can access own reports" ON storage.objects;
  CREATE POLICY "Users can access own reports"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'reports' AND
    (auth.uid() = owner OR owner IS NULL)
  )
  WITH CHECK (
    bucket_id = 'reports' AND
    (auth.uid() = owner OR owner IS NULL)
  );
COMMIT;

-- Create helper functions
CREATE OR REPLACE FUNCTION create_project(
  name_param TEXT,
  description_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  project_id UUID;
BEGIN
  INSERT INTO projects (user_id, name, description)
  VALUES (auth.uid(), name_param, description_param)
  RETURNING id INTO project_id;
  
  RETURN project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_project_analyses(
  project_id_param UUID
)
RETURNS TABLE (
  id UUID,
  upload_id UUID,
  sentiment TEXT,
  sentiment_score FLOAT,
  dialect TEXT,
  dialect_confidence FLOAT,
  created_at TIMESTAMPTZ,
  raw_text TEXT,
  source TEXT
) AS $$
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
    a.id,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;