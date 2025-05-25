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
      alert_subscriptions: {
        Row: {
          category: string
          created_at: string | null
          email: string
          frequency: string
          id: string
          is_active: boolean | null
          last_sent_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          email: string
          frequency: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          email?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analysis_settings: {
        Row: {
          accuracy_level: string | null
          auto_categorization: boolean | null
          created_at: string
          dialect_detection_enabled: boolean | null
          email_notifications: boolean | null
          enable_advanced_analytics: boolean | null
          id: string
          language_preference: string | null
          sentiment_threshold: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy_level?: string | null
          auto_categorization?: boolean | null
          created_at?: string
          dialect_detection_enabled?: boolean | null
          email_notifications?: boolean | null
          enable_advanced_analytics?: boolean | null
          id?: string
          language_preference?: string | null
          sentiment_threshold?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy_level?: string | null
          auto_categorization?: boolean | null
          created_at?: string
          dialect_detection_enabled?: boolean | null
          email_notifications?: boolean | null
          enable_advanced_analytics?: boolean | null
          id?: string
          language_preference?: string | null
          sentiment_threshold?: number | null
          updated_at?: string
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
      notification_history: {
        Row: {
          alert_id: string | null
          id: string
          message: string | null
          sent_at: string
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          alert_id?: string | null
          id?: string
          message?: string | null
          sent_at?: string
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          alert_id?: string | null
          id?: string
          message?: string | null
          sent_at?: string
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
      payment_methods: {
        Row: {
          brand: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          last_four: string | null
          stripe_payment_method_id: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          last_four?: string | null
          stripe_payment_method_id?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          last_four?: string | null
          stripe_payment_method_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      predictions: {
        Row: {
          confidence: number
          created_at: string
          dialect: string
          id: string
          model_source: string
          negative_prob: number
          positive_prob: number
          sentiment: string
          text: string
          user_id: string | null
        }
        Insert: {
          confidence: number
          created_at?: string
          dialect: string
          id?: string
          model_source?: string
          negative_prob: number
          positive_prob: number
          sentiment: string
          text: string
          user_id?: string | null
        }
        Update: {
          confidence?: number
          created_at?: string
          dialect?: string
          id?: string
          model_source?: string
          negative_prob?: number
          positive_prob?: number
          sentiment?: string
          text?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          advanced_analytics: boolean | null
          created_at: string | null
          description: string | null
          features: Json
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          max_posts_per_month: number | null
          max_scraping_sources: number | null
          name: string
          price_monthly: number
          price_yearly: number
          priority_support: boolean | null
        }
        Insert: {
          advanced_analytics?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          max_posts_per_month?: number | null
          max_scraping_sources?: number | null
          name: string
          price_monthly: number
          price_yearly: number
          priority_support?: boolean | null
        }
        Update: {
          advanced_analytics?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          max_posts_per_month?: number | null
          max_scraping_sources?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          priority_support?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string
          subscription_plan: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          role?: string
          subscription_plan?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
          subscription_plan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scraped_posts: {
        Row: {
          author_handle: string | null
          author_name: string | null
          category: string
          comments_count: number | null
          confidence: number | null
          content: string
          created_at: string | null
          engagement_count: number | null
          hashtags: string[] | null
          id: string
          is_jordanian_dialect: boolean | null
          is_viral: boolean | null
          likes_count: number | null
          location: string | null
          platform: string
          post_id: string
          post_url: string | null
          raw_data: Json | null
          scraped_at: string | null
          sentiment: string | null
          sentiment_score: number | null
          shares_count: number | null
        }
        Insert: {
          author_handle?: string | null
          author_name?: string | null
          category: string
          comments_count?: number | null
          confidence?: number | null
          content: string
          created_at?: string | null
          engagement_count?: number | null
          hashtags?: string[] | null
          id?: string
          is_jordanian_dialect?: boolean | null
          is_viral?: boolean | null
          likes_count?: number | null
          location?: string | null
          platform: string
          post_id: string
          post_url?: string | null
          raw_data?: Json | null
          scraped_at?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          shares_count?: number | null
        }
        Update: {
          author_handle?: string | null
          author_name?: string | null
          category?: string
          comments_count?: number | null
          confidence?: number | null
          content?: string
          created_at?: string | null
          engagement_count?: number | null
          hashtags?: string[] | null
          id?: string
          is_jordanian_dialect?: boolean | null
          is_viral?: boolean | null
          likes_count?: number | null
          location?: string | null
          platform?: string
          post_id?: string
          post_url?: string | null
          raw_data?: Json | null
          scraped_at?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          shares_count?: number | null
        }
        Relationships: []
      }
      scraping_configs: {
        Row: {
          created_at: string | null
          hashtags: string[] | null
          id: string
          is_active: boolean | null
          last_scrape_at: string | null
          location_filters: string[] | null
          platform: string
          search_terms: string[]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          is_active?: boolean | null
          last_scrape_at?: string | null
          location_filters?: string[] | null
          platform: string
          search_terms: string[]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          is_active?: boolean | null
          last_scrape_at?: string | null
          location_filters?: string[] | null
          platform?: string
          search_terms?: string[]
          updated_at?: string | null
        }
        Relationships: []
      }
      sendgrid_settings: {
        Row: {
          api_key: string | null
          created_at: string
          enabled: boolean | null
          from_email: string | null
          from_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          enabled?: boolean | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string | null
          created_at?: string
          enabled?: boolean | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_media_posts: {
        Row: {
          author_handle: string | null
          author_name: string | null
          category: string | null
          comments_count: number | null
          confidence: number | null
          content: string
          created_at: string | null
          engagement_count: number | null
          hashtags: string[] | null
          id: string
          is_duplicate: boolean | null
          is_jordanian_dialect: boolean | null
          is_spam: boolean | null
          is_viral: boolean | null
          likes_count: number | null
          location: string | null
          platform: string
          post_id: string
          post_url: string | null
          raw_data: Json | null
          scraped_at: string | null
          sentiment: string | null
          sentiment_score: number | null
          shares_count: number | null
          updated_at: string | null
        }
        Insert: {
          author_handle?: string | null
          author_name?: string | null
          category?: string | null
          comments_count?: number | null
          confidence?: number | null
          content: string
          created_at?: string | null
          engagement_count?: number | null
          hashtags?: string[] | null
          id?: string
          is_duplicate?: boolean | null
          is_jordanian_dialect?: boolean | null
          is_spam?: boolean | null
          is_viral?: boolean | null
          likes_count?: number | null
          location?: string | null
          platform: string
          post_id: string
          post_url?: string | null
          raw_data?: Json | null
          scraped_at?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          shares_count?: number | null
          updated_at?: string | null
        }
        Update: {
          author_handle?: string | null
          author_name?: string | null
          category?: string | null
          comments_count?: number | null
          confidence?: number | null
          content?: string
          created_at?: string | null
          engagement_count?: number | null
          hashtags?: string[] | null
          id?: string
          is_duplicate?: boolean | null
          is_jordanian_dialect?: boolean | null
          is_spam?: boolean | null
          is_viral?: boolean | null
          likes_count?: number | null
          location?: string | null
          platform?: string
          post_id?: string
          post_url?: string | null
          raw_data?: Json | null
          scraped_at?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          shares_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          name: string
          price_monthly: number
          price_yearly: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price_monthly: number
          price_yearly: number
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price_monthly?: number
          price_yearly?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          created_at: string
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
          created_at?: string
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
          created_at?: string
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
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
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
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
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
          created_at?: string
          currency?: string
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
          created_at?: string
          currency?: string
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
      usage_stats: {
        Row: {
          created_at: string | null
          id: string
          last_reset_date: string | null
          posts_analyzed_this_month: number | null
          scraping_sources_used: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_reset_date?: string | null
          posts_analyzed_this_month?: number | null
          scraping_sources_used?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_reset_date?: string | null
          posts_analyzed_this_month?: number | null
          scraping_sources_used?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      categorize_jordanian_post: {
        Args: { content: string }
        Returns: string
      }
      categorize_post: {
        Args: { content: string }
        Returns: string
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
      detect_jordanian_dialect_enhanced: {
        Args: { content: string }
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
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_post_viral: {
        Args: { engagement_count: number; platform: string }
        Returns: boolean
      }
      mark_notification_read: {
        Args: { notification_id_param: string }
        Returns: undefined
      }
      update_monthly_usage: {
        Args: { user_id_param: string }
        Returns: undefined
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
