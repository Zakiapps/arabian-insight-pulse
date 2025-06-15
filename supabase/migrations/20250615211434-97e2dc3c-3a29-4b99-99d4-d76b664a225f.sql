
-- Create table to store scraped news articles
CREATE TABLE public.scraped_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id TEXT, -- from newsdata.io
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  source_name TEXT,
  source_icon TEXT,
  image_url TEXT,
  link TEXT,
  pub_date TIMESTAMP WITH TIME ZONE,
  language TEXT DEFAULT 'en',
  category TEXT[],
  keywords TEXT[],
  sentiment TEXT,
  is_analyzed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.scraped_news ENABLE ROW LEVEL SECURITY;

-- Create policies for scraped_news
CREATE POLICY "Users can view their own scraped news"
  ON public.scraped_news
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scraped news"
  ON public.scraped_news
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scraped news"
  ON public.scraped_news
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scraped news"
  ON public.scraped_news
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_scraped_news_project_id ON public.scraped_news(project_id);
CREATE INDEX idx_scraped_news_user_id ON public.scraped_news(user_id);
