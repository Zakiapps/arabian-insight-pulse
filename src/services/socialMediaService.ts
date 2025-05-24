
import { supabase } from '@/integrations/supabase/client';

export interface SocialMediaPost {
  id: string;
  platform: string;
  post_id: string;
  content: string;
  author_name?: string;
  author_handle?: string;
  post_url?: string;
  location?: string;
  hashtags?: string[];
  category: string;
  sentiment: string;
  sentiment_score?: number;
  confidence?: number;
  is_jordanian_dialect?: boolean;
  engagement_count: number;
  likes_count?: number;
  shares_count?: number;
  comments_count?: number;
  is_viral?: boolean;
  scraped_at: string;
  created_at: string;
}

export interface AlertSubscription {
  id: string;
  user_id: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'urgent';
  email: string;
  is_active: boolean;
  last_sent_at?: string;
}

export const socialMediaService = {
  // Get social media posts with filters
  async getPosts(filters?: {
    platform?: string;
    category?: string;
    sentiment?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }): Promise<SocialMediaPost[]> {
    let query = supabase
      .from('social_media_posts')
      .select('*')
      .order('scraped_at', { ascending: false });

    if (filters?.platform) {
      query = query.eq('platform', filters.platform);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.sentiment) {
      query = query.eq('sentiment', filters.sentiment);
    }
    if (filters?.dateFrom) {
      query = query.gte('scraped_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('scraped_at', filters.dateTo);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  // Get trending posts
  async getTrendingPosts(timeframe: 'day' | 'week' = 'day'): Promise<SocialMediaPost[]> {
    const hours = timeframe === 'day' ? 24 : 168;
    const dateFrom = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('social_media_posts')
      .select('*')
      .eq('is_viral', true)
      .gte('scraped_at', dateFrom)
      .order('engagement_count', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  },

  // Get sentiment statistics
  async getSentimentStats(filters?: {
    platform?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    let query = supabase
      .from('social_media_posts')
      .select('sentiment, category, platform');

    if (filters?.platform) {
      query = query.eq('platform', filters.platform);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.dateFrom) {
      query = query.gte('scraped_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('scraped_at', filters.dateTo);
    }

    const { data, error } = await query;
    
    if (error) throw error;

    // Calculate statistics
    const stats = {
      total: data?.length || 0,
      positive: data?.filter(post => post.sentiment === 'positive').length || 0,
      negative: data?.filter(post => post.sentiment === 'negative').length || 0,
      neutral: data?.filter(post => post.sentiment === 'neutral').length || 0,
      byCategory: {} as Record<string, any>,
      byPlatform: {} as Record<string, any>
    };

    // Group by category
    const categories = ['economics', 'politics', 'sports', 'education', 'other'];
    categories.forEach(category => {
      const categoryPosts = data?.filter(post => post.category === category) || [];
      stats.byCategory[category] = {
        total: categoryPosts.length,
        positive: categoryPosts.filter(post => post.sentiment === 'positive').length,
        negative: categoryPosts.filter(post => post.sentiment === 'negative').length,
        neutral: categoryPosts.filter(post => post.sentiment === 'neutral').length
      };
    });

    // Group by platform
    const platforms = ['twitter', 'facebook'];
    platforms.forEach(platform => {
      const platformPosts = data?.filter(post => post.platform === platform) || [];
      stats.byPlatform[platform] = {
        total: platformPosts.length,
        positive: platformPosts.filter(post => post.sentiment === 'positive').length,
        negative: platformPosts.filter(post => post.sentiment === 'negative').length,
        neutral: platformPosts.filter(post => post.sentiment === 'neutral').length
      };
    });

    return stats;
  },

  // Manage alert subscriptions
  async getAlertSubscriptions(userId: string): Promise<AlertSubscription[]> {
    const { data, error } = await supabase
      .from('alert_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Type cast the data to ensure frequency is properly typed
    return (data || []).map(subscription => ({
      ...subscription,
      frequency: subscription.frequency as 'daily' | 'weekly' | 'urgent'
    }));
  },

  async createAlertSubscription(subscription: Omit<AlertSubscription, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('alert_subscriptions')
      .insert(subscription);

    if (error) throw error;
  },

  async updateAlertSubscription(id: string, updates: Partial<AlertSubscription>): Promise<void> {
    const { error } = await supabase
      .from('alert_subscriptions')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteAlertSubscription(id: string): Promise<void> {
    const { error } = await supabase
      .from('alert_subscriptions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Trigger scraping
  async triggerScraping(): Promise<{ processed: number }> {
    const { data, error } = await supabase.functions.invoke('scrape-social-media', {
      body: {}
    });

    if (error) throw error;
    return data;
  },

  // Send alerts
  async sendAlerts(type: 'daily' | 'weekly' | 'urgent'): Promise<{ alerts_sent: number }> {
    const { data, error } = await supabase.functions.invoke('send-alerts', {
      body: { type }
    });

    if (error) throw error;
    return data;
  }
};
