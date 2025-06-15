
// أنواع البيانات للتحليلات المتقدمة
export interface AdvancedAnalysisResult {
  id: string;
  article_id: string;
  project_id: string;
  user_id: string;
  
  // تحليل المشاعر المتقدم
  primary_emotion: string;
  emotion_scores: { [emotion: string]: number };
  sentiment_confidence: number;
  sentiment_reasoning?: string;
  
  // تحليل المواضيع
  main_topics: string[];
  topic_scores: { [topic: string]: number };
  keywords_extracted: string[];
  
  // تحليل اللهجة المتقدم
  dialect_features: { [feature: string]: string[] };
  regional_indicators: string[];
  
  // تحليل السياق
  context_analysis?: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  
  // الجودة والثقة
  analysis_quality_score: number;
  
  created_at: string;
  updated_at: string;
}

export interface ArticleKeyword {
  id: string;
  analysis_id: string;
  keyword: string;
  relevance_score: number;
  keyword_type: 'topic' | 'emotion' | 'entity' | 'action';
  created_at: string;
}

export interface SentimentTimelineData {
  id: string;
  project_id: string;
  analysis_date: string;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  average_sentiment_score: number;
  dominant_emotion: string;
  top_topics: string[];
  created_at: string;
}

export interface AnalysisChartData {
  name: string;
  value: number;
  color?: string;
}

export interface EmotionRadarData {
  emotion: string;
  score: number;
  fullMark: number;
}
