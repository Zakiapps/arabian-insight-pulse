export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      advanced_analysis_results: {
        Row: {
          analysis_quality_score: number | null
          article_id: string | null
          context_analysis: string | null
          created_at: string
          dialect_features: Json
          emotion_scores: Json
          id: string
          keywords_extracted: Json
          main_topics: Json
          primary_emotion: string
          project_id: string | null
          regional_indicators: Json
          sentiment_confidence: number
          sentiment_reasoning: string | null
          topic_scores: Json
          updated_at: string
          urgency_level: string | null
          user_id: string
        }
        Insert: {
          analysis_quality_score?: number | null
          article_id?: string | null
          context_analysis?: string | null
          created_at?: string
          dialect_features?: Json
          emotion_scores?: Json
          id?: string
          keywords_extracted?: Json
          main_topics?: Json
          primary_emotion: string
          project_id?: string | null
          regional_indicators?: Json
          sentiment_confidence: number
          sentiment_reasoning?: string | null
          topic_scores?: Json
          updated_at?: string
          urgency_level?: string | null
          user_id: string
        }
        Update: {
          analysis_quality_score?: number | null
          article_id?: string | null
          context_analysis?: string | null
          created_at?: string
          dialect_features?: Json
          emotion_scores?: Json
          id?: string
          keywords_extracted?: Json
          main_topics?: Json
          primary_emotion?: string
          project_id?: string | null
          regional_indicators?: Json
          sentiment_confidence?: number
          sentiment_reasoning?: string | null
          topic_scores?: Json
          updated_at?: string
          urgency_level?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advanced_analysis_results_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "scraped_news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advanced_analysis_results_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      analyses: {
        Row: {
          created_at: string | null
          dialect: string | null
          dialect_confidence: number | null
          id: string
          model_response: Json | null
          sentiment: string
          sentiment_score: number
          upload_id: string
        }
        Insert: {
          created_at?: string | null
          dialect?: string | null
          dialect_confidence?: number | null
          id?: string
          model_response?: Json | null
          sentiment: string
          sentiment_score: number
          upload_id: string
        }
        Update: {
          created_at?: string | null
          dialect?: string | null
          dialect_confidence?: number | null
          id?: string
          model_response?: Json | null
          sentiment?: string
          sentiment_score?: number
          upload_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyses_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_settings: {
        Row: {
          accuracy_level: string | null
          auto_categorization: boolean | null
          created_at: string | null
          dialect_detection_enabled: boolean | null
          email_notifications: boolean | null
          id: string
          sentiment_threshold: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accuracy_level?: string | null
          auto_categorization?: boolean | null
          created_at?: string | null
          dialect_detection_enabled?: boolean | null
          email_notifications?: boolean | null
          id?: string
          sentiment_threshold?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accuracy_level?: string | null
          auto_categorization?: boolean | null
          created_at?: string | null
          dialect_detection_enabled?: boolean | null
          email_notifications?: boolean | null
          id?: string
          sentiment_threshold?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analyzed_posts: {
        Row: {
          analyzed_at: string | null
          content: string
          created_at: string | null
          engagement_count: number | null
          id: string
          is_jordanian_dialect: boolean | null
          sentiment: string | null
          sentiment_score: number | null
          source: string | null
          user_id: string
        }
        Insert: {
          analyzed_at?: string | null
          content: string
          created_at?: string | null
          engagement_count?: number | null
          id?: string
          is_jordanian_dialect?: boolean | null
          sentiment?: string | null
          sentiment_score?: number | null
          source?: string | null
          user_id: string
        }
        Update: {
          analyzed_at?: string | null
          content?: string
          created_at?: string | null
          engagement_count?: number | null
          id?: string
          is_jordanian_dialect?: boolean | null
          sentiment?: string | null
          sentiment_score?: number | null
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      article_keywords: {
        Row: {
          analysis_id: string | null
          created_at: string
          id: string
          keyword: string
          keyword_type: string | null
          relevance_score: number
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string
          id?: string
          keyword: string
          keyword_type?: string | null
          relevance_score: number
        }
        Update: {
          analysis_id?: string | null
          created_at?: string
          id?: string
          keyword?: string
          keyword_type?: string | null
          relevance_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "article_keywords_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "advanced_analysis_results"
            referencedColumns: ["id"]
          },
        ]
      }
      brightdata_configs: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          project_id: string
          rules: Json
          token: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          project_id: string
          rules: Json
          token: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          project_id?: string
          rules?: Json
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brightdata_configs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      forecasts: {
        Row: {
          analysis_id: string
          created_at: string | null
          end_date: string
          forecast_json: Json
          id: string
          start_date: string
        }
        Insert: {
          analysis_id: string
          created_at?: string | null
          end_date: string
          forecast_json: Json
          id?: string
          start_date: string
        }
        Update: {
          analysis_id?: string
          created_at?: string | null
          end_date?: string
          forecast_json?: Json
          id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "forecasts_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      function_logs: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          function_name: string
          id: string
          request_payload: Json | null
          response_payload: Json | null
          status: string
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          function_name: string
          id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          status: string
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          function_name?: string
          id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string
        }
        Relationships: []
      }
      huggingface_configs: {
        Row: {
          arabert_token: string | null
          arabert_url: string | null
          created_at: string | null
          id: string
          mt5_token: string | null
          mt5_url: string | null
          updated_at: string | null
        }
        Insert: {
          arabert_token?: string | null
          arabert_url?: string | null
          created_at?: string | null
          id?: string
          mt5_token?: string | null
          mt5_url?: string | null
          updated_at?: string | null
        }
        Update: {
          arabert_token?: string | null
          arabert_url?: string | null
          created_at?: string | null
          id?: string
          mt5_token?: string | null
          mt5_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_history: {
        Row: {
          alert_id: string | null
          id: string
          message: string | null
          sent_at: string | null
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          alert_id?: string | null
          id?: string
          message?: string | null
          sent_at?: string | null
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          alert_id?: string | null
          id?: string
          message?: string | null
          sent_at?: string | null
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_history_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "user_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      predictions: {
        Row: {
          confidence: number
          created_at: string | null
          dialect: string
          id: string
          model_source: string | null
          negative_prob: number
          positive_prob: number
          sentiment: string
          text: string
          user_id: string | null
        }
        Insert: {
          confidence: number
          created_at?: string | null
          dialect: string
          id?: string
          model_source?: string | null
          negative_prob: number
          positive_prob: number
          sentiment: string
          text: string
          user_id?: string | null
        }
        Update: {
          confidence?: number
          created_at?: string | null
          dialect?: string
          id?: string
          model_source?: string | null
          negative_prob?: number
          positive_prob?: number
          sentiment?: string
          text?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          role: string
          subscription_plan: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scraped_news: {
        Row: {
          article_id: string | null
          category: string[] | null
          content: string | null
          created_at: string | null
          description: string | null
          dialect: string | null
          dialect_confidence: number | null
          dialect_indicators: string[] | null
          emotion: string | null
          emotional_markers: string[] | null
          id: string
          image_url: string | null
          is_analyzed: boolean | null
          keywords: string[] | null
          language: string | null
          link: string | null
          project_id: string
          pub_date: string | null
          sentiment: string | null
          source_icon: string | null
          source_name: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          article_id?: string | null
          category?: string[] | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          dialect?: string | null
          dialect_confidence?: number | null
          dialect_indicators?: string[] | null
          emotion?: string | null
          emotional_markers?: string[] | null
          id?: string
          image_url?: string | null
          is_analyzed?: boolean | null
          keywords?: string[] | null
          language?: string | null
          link?: string | null
          project_id: string
          pub_date?: string | null
          sentiment?: string | null
          source_icon?: string | null
          source_name?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          article_id?: string | null
          category?: string[] | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          dialect?: string | null
          dialect_confidence?: number | null
          dialect_indicators?: string[] | null
          emotion?: string | null
          emotional_markers?: string[] | null
          id?: string
          image_url?: string | null
          is_analyzed?: boolean | null
          keywords?: string[] | null
          language?: string | null
          link?: string | null
          project_id?: string
          pub_date?: string | null
          sentiment?: string | null
          source_icon?: string | null
          source_name?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scraped_news_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sendgrid_settings: {
        Row: {
          api_key: string | null
          created_at: string | null
          enabled: boolean | null
          from_email: string | null
          from_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key?: string | null
          created_at?: string | null
          enabled?: boolean | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string | null
          created_at?: string | null
          enabled?: boolean | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sentiment_timeline: {
        Row: {
          analysis_date: string
          average_sentiment_score: number | null
          created_at: string
          dominant_emotion: string | null
          id: string
          negative_count: number | null
          neutral_count: number | null
          positive_count: number | null
          project_id: string | null
          top_topics: Json | null
        }
        Insert: {
          analysis_date: string
          average_sentiment_score?: number | null
          created_at?: string
          dominant_emotion?: string | null
          id?: string
          negative_count?: number | null
          neutral_count?: number | null
          positive_count?: number | null
          project_id?: string | null
          top_topics?: Json | null
        }
        Update: {
          analysis_date?: string
          average_sentiment_score?: number | null
          created_at?: string
          dominant_emotion?: string | null
          id?: string
          negative_count?: number | null
          neutral_count?: number | null
          positive_count?: number | null
          project_id?: string | null
          top_topics?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "sentiment_timeline_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json
          id: string
          is_active: boolean | null
          name: string
          price_monthly: number
          price_yearly: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features: Json
          id?: string
          is_active?: boolean | null
          name: string
          price_monthly: number
          price_yearly: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          price_monthly?: number
          price_yearly?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          plan_id: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      summaries: {
        Row: {
          analysis_id: string
          created_at: string | null
          id: string
          language: string
          model_used: string | null
          summary_text: string
        }
        Insert: {
          analysis_id: string
          created_at?: string | null
          id?: string
          language?: string
          model_used?: string | null
          summary_text: string
        }
        Update: {
          analysis_id?: string
          created_at?: string | null
          id?: string
          language?: string
          model_used?: string | null
          summary_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "summaries_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      task_history: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          parameters: Json | null
          result: Json | null
          started_at: string | null
          status: string | null
          task_name: string
          task_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          parameters?: Json | null
          result?: Json | null
          started_at?: string | null
          status?: string | null
          task_name: string
          task_type: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          parameters?: Json | null
          result?: Json | null
          started_at?: string | null
          status?: string | null
          task_name?: string
          task_type?: string
          user_id?: string
        }
        Relationships: []
      }
      text_analyses: {
        Row: {
          advanced_analysis_id: string | null
          analysis_version: string | null
          created_at: string
          dialect: string | null
          dialect_confidence: number | null
          dialect_indicators: string[] | null
          emotion: string | null
          emotional_markers: string[] | null
          id: string
          input_text: string
          language: string
          model_response: Json | null
          project_id: string
          quality_score: number | null
          sentiment: string
          sentiment_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          advanced_analysis_id?: string | null
          analysis_version?: string | null
          created_at?: string
          dialect?: string | null
          dialect_confidence?: number | null
          dialect_indicators?: string[] | null
          emotion?: string | null
          emotional_markers?: string[] | null
          id?: string
          input_text: string
          language?: string
          model_response?: Json | null
          project_id: string
          quality_score?: number | null
          sentiment: string
          sentiment_score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          advanced_analysis_id?: string | null
          analysis_version?: string | null
          created_at?: string
          dialect?: string | null
          dialect_confidence?: number | null
          dialect_indicators?: string[] | null
          emotion?: string | null
          emotional_markers?: string[] | null
          id?: string
          input_text?: string
          language?: string
          model_response?: Json | null
          project_id?: string
          quality_score?: number | null
          sentiment?: string
          sentiment_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "text_analyses_advanced_analysis_id_fkey"
            columns: ["advanced_analysis_id"]
            isOneToOne: false
            referencedRelation: "advanced_analysis_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "text_analyses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          status: string
          stripe_payment_id: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          status: string
          stripe_payment_id?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          status?: string
          stripe_payment_id?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      uploads: {
        Row: {
          created_at: string | null
          file_url: string | null
          id: string
          metadata: Json | null
          processed: boolean | null
          project_id: string
          raw_text: string
          source: string
          title: string | null
        }
        Insert: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          processed?: boolean | null
          project_id: string
          raw_text: string
          source: string
          title?: string | null
        }
        Update: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          processed?: boolean | null
          project_id?: string
          raw_text?: string
          source?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uploads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_alerts: {
        Row: {
          active: boolean | null
          condition: string
          created_at: string | null
          dialect_value: string | null
          id: string
          keyword: string | null
          metric: string
          name: string
          notify_via: string | null
          timeframe: string
          user_id: string
          value: number | null
        }
        Insert: {
          active?: boolean | null
          condition: string
          created_at?: string | null
          dialect_value?: string | null
          id?: string
          keyword?: string | null
          metric: string
          name: string
          notify_via?: string | null
          timeframe: string
          user_id: string
          value?: number | null
        }
        Update: {
          active?: boolean | null
          condition?: string
          created_at?: string | null
          dialect_value?: string | null
          id?: string
          keyword?: string | null
          metric?: string
          name?: string
          notify_via?: string | null
          timeframe?: string
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          analysis_preferences: Json | null
          created_at: string | null
          dashboard_layout: Json | null
          id: string
          notification_settings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_preferences?: Json | null
          created_at?: string | null
          dashboard_layout?: Json | null
          id?: string
          notification_settings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_preferences?: Json | null
          created_at?: string | null
          dashboard_layout?: Json | null
          id?: string
          notification_settings?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string | null
          file_url: string | null
          format: string
          id: string
          name: string
          parameters: Json | null
          report_type: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_url?: string | null
          format: string
          id?: string
          name: string
          parameters?: Json | null
          report_type: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_url?: string | null
          format?: string
          id?: string
          name?: string
          parameters?: Json | null
          report_type?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          id: string
          is_online: boolean | null
          last_seen: string | null
          session_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          session_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          session_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_user: {
        Args: {
          email_param: string
          password_param: string
          full_name_param: string
          role_param?: string
        }
        Returns: Json
      }
      admin_delete_user: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      admin_update_user_role: {
        Args: { user_id_param: string; new_role: string }
        Returns: undefined
      }
      cleanup_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clear_all_posts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clear_dummy_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clear_user_posts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_notification: {
        Args: {
          user_id_param: string
          title_param: string
          message_param: string
          type_param?: string
          action_url_param?: string
        }
        Returns: string
      }
      create_project: {
        Args: { name_param: string; description_param?: string }
        Returns: string
      }
      delete_project: {
        Args: { project_id_param: string }
        Returns: boolean
      }
      get_active_subscription_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_all_users_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          full_name: string
          role: string
          subscription_plan: string
          avatar_url: string
          created_at: string
          last_sign_in_at: string
          is_online: boolean
          payment_methods_count: number
        }[]
      }
      get_project_analyses: {
        Args: { project_id_param: string }
        Returns: {
          id: string
          upload_id: string
          sentiment: string
          sentiment_score: number
          dialect: string
          dialect_confidence: number
          created_at: string
          raw_text: string
          source: string
        }[]
      }
      get_project_analysis_stats: {
        Args: { project_id_param: string }
        Returns: {
          total_analyses: number
          positive_count: number
          negative_count: number
          neutral_count: number
          arabic_count: number
          jordanian_dialect_count: number
        }[]
      }
      get_project_stats: {
        Args: { project_id_param: string }
        Returns: Json
      }
      get_sentiment_stats: {
        Args: { user_id_param?: string }
        Returns: {
          total_posts: number
          positive_posts: number
          negative_posts: number
          neutral_posts: number
          jordanian_posts: number
        }[]
      }
      get_total_revenue: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_projects: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          is_active: boolean
          upload_count: number
          analysis_count: number
          created_at: string
          updated_at: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_function_execution: {
        Args: {
          function_name_param: string
          status_param: string
          execution_time_param?: number
          error_message_param?: string
          request_payload_param?: Json
          response_payload_param?: Json
        }
        Returns: string
      }
      mark_notification_read: {
        Args: { notification_id_param: string }
        Returns: undefined
      }
      update_project: {
        Args: {
          project_id_param: string
          name_param?: string
          description_param?: string
          is_active_param?: boolean
        }
        Returns: boolean
      }
      update_user_preferences: {
        Args: {
          language_param?: string
          theme_param?: string
          notification_settings_param?: Json
          dashboard_layout_param?: Json
        }
        Returns: boolean
      }
      update_user_session_status: {
        Args: { session_id_param: string; is_online_param?: boolean }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
