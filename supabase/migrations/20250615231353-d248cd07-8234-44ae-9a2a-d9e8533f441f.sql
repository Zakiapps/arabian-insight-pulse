
-- إضافة جداول جديدة للتحليلات المتقدمة
CREATE TABLE IF NOT EXISTS public.advanced_analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.scraped_news(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- تحليل المشاعر المتقدم
  primary_emotion TEXT NOT NULL,
  emotion_scores JSONB NOT NULL DEFAULT '{}', -- {"joy": 0.8, "anger": 0.2, "fear": 0.1, ...}
  sentiment_confidence NUMERIC(5,4) NOT NULL,
  sentiment_reasoning TEXT,
  
  -- تحليل المواضيع
  main_topics JSONB NOT NULL DEFAULT '[]', -- ["politics", "economy", "health"]
  topic_scores JSONB NOT NULL DEFAULT '{}', -- {"politics": 0.9, "economy": 0.3}
  keywords_extracted JSONB NOT NULL DEFAULT '[]', -- ["انتخابات", "اقتصاد", "صحة"]
  
  -- تحليل اللهجة المتقدم
  dialect_features JSONB NOT NULL DEFAULT '{}', -- تفاصيل أكثر عن اللهجة
  regional_indicators JSONB NOT NULL DEFAULT '[]',
  
  -- تحليل السياق
  context_analysis TEXT,
  urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  
  -- الجودة والثقة
  analysis_quality_score NUMERIC(3,2) CHECK (analysis_quality_score >= 0 AND analysis_quality_score <= 1),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول للكلمات المفتاحية والمواضيع
CREATE TABLE IF NOT EXISTS public.article_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES public.advanced_analysis_results(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  relevance_score NUMERIC(3,2) NOT NULL,
  keyword_type TEXT CHECK (keyword_type IN ('topic', 'emotion', 'entity', 'action')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول لتتبع التحليلات الزمنية
CREATE TABLE IF NOT EXISTS public.sentiment_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  analysis_date DATE NOT NULL,
  positive_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,
  neutral_count INTEGER DEFAULT 0,
  average_sentiment_score NUMERIC(3,2),
  dominant_emotion TEXT,
  top_topics JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, analysis_date)
);

-- إضافة RLS للجداول الجديدة
ALTER TABLE public.advanced_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_timeline ENABLE ROW LEVEL SECURITY;

-- سياسات الحماية
CREATE POLICY "Users can view their own advanced analysis results" 
  ON public.advanced_analysis_results 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own advanced analysis results" 
  ON public.advanced_analysis_results 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own advanced analysis results" 
  ON public.advanced_analysis_results 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own advanced analysis results" 
  ON public.advanced_analysis_results 
  FOR DELETE 
  USING (user_id = auth.uid());

-- سياسات للكلمات المفتاحية
CREATE POLICY "Users can view keywords for their analysis" 
  ON public.article_keywords 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.advanced_analysis_results 
    WHERE id = analysis_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create keywords for their analysis" 
  ON public.article_keywords 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.advanced_analysis_results 
    WHERE id = analysis_id AND user_id = auth.uid()
  ));

-- سياسات للخط الزمني
CREATE POLICY "Users can view their project timeline" 
  ON public.sentiment_timeline 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create timeline for their projects" 
  ON public.sentiment_timeline 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update timeline for their projects" 
  ON public.sentiment_timeline 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_id AND user_id = auth.uid()
  ));

-- تحديث جدول text_analyses لإضافة حقول جديدة
ALTER TABLE public.text_analyses 
ADD COLUMN IF NOT EXISTS advanced_analysis_id UUID REFERENCES public.advanced_analysis_results(id),
ADD COLUMN IF NOT EXISTS quality_score NUMERIC(3,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS analysis_version TEXT DEFAULT 'v1';

-- فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_advanced_analysis_project_id ON public.advanced_analysis_results(project_id);
CREATE INDEX IF NOT EXISTS idx_advanced_analysis_user_id ON public.advanced_analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_advanced_analysis_created_at ON public.advanced_analysis_results(created_at);
CREATE INDEX IF NOT EXISTS idx_keywords_analysis_id ON public.article_keywords(analysis_id);
CREATE INDEX IF NOT EXISTS idx_timeline_project_date ON public.sentiment_timeline(project_id, analysis_date);
