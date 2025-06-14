/*
  # Initial Schema Setup for Arabic Insights SaaS Platform

  1. New Tables
    - `profiles` - User profiles with roles and metadata
    - `projects` - User projects for organizing data sources
    - `brightdata_configs` - BrightData API configuration
    - `news_configs` - NewsAPI configuration
    - `uploads` - Raw data uploads from various sources
    - `analyses` - Sentiment and dialect analysis results
    - `summaries` - Text summaries of analyzed content
    - `forecasts` - Sentiment trend forecasts
    - `function_logs` - System logs for edge functions
    - `user_preferences` - User preferences and settings

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add admin-specific policies
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  subscription_plan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
  last_run_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
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
  last_run_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- 'brightdata', 'newsapi', 'manual', etc.
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
  sentiment_score FLOAT,
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
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forecasts table
CREATE TABLE IF NOT EXISTS forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  forecast_json JSONB NOT NULL,
  forecast_period TEXT, -- 'daily', 'weekly', 'monthly'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function logs
CREATE TABLE IF NOT EXISTS function_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success', 'error'
  execution_time FLOAT, -- in milliseconds
  error_message TEXT,
  request_payload JSONB,
  response_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'ar', -- 'ar', 'en'
  theme TEXT DEFAULT 'light', -- 'light', 'dark'
  notification_settings JSONB DEFAULT '{"email": true, "in_app": true}',
  dashboard_layout JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE brightdata_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE function_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for projects
CREATE POLICY "Users can read own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for brightdata_configs
CREATE POLICY "Users can read own brightdata configs"
  ON brightdata_configs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = brightdata_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own brightdata configs"
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

-- Create RLS policies for news_configs
CREATE POLICY "Users can read own news configs"
  ON news_configs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = news_configs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own news configs"
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

-- Create RLS policies for uploads
CREATE POLICY "Users can read own uploads"
  ON uploads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = uploads.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own uploads"
  ON uploads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = uploads.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create RLS policies for analyses
CREATE POLICY "Users can read own analyses"
  ON analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM uploads
      JOIN projects ON uploads.project_id = projects.id
      WHERE uploads.id = analyses.upload_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create RLS policies for summaries
CREATE POLICY "Users can read own summaries"
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

-- Create RLS policies for forecasts
CREATE POLICY "Users can read own forecasts"
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

-- Create RLS policies for user_preferences
CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin policies for all tables
CREATE POLICY "Admins can do anything with profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can do anything with projects"
  ON projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can do anything with brightdata_configs"
  ON brightdata_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can do anything with news_configs"
  ON news_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can do anything with uploads"
  ON uploads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can do anything with analyses"
  ON analyses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can do anything with summaries"
  ON summaries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can do anything with forecasts"
  ON forecasts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can do anything with function_logs"
  ON function_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can do anything with user_preferences"
  ON user_preferences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );