
import { supabase } from "@/integrations/supabase/client";

export interface ScrapedPost {
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
  sentiment?: string;
  sentiment_score?: number;
  confidence?: number;
  is_jordanian_dialect?: boolean;
  engagement_count: number;
  likes_count?: number;
  shares_count?: number;
  comments_count?: number;
  is_viral?: boolean;
  scraped_at?: string;
  created_at?: string;
  raw_data?: any;
}

export interface ScrapingConfig {
  id: string;
  platform: string;
  search_terms: string[];
  hashtags?: string[];
  location_filters?: string[];
  is_active: boolean;
  scraping_interval?: number;
  last_scrape_at?: string;
  created_at?: string;
  updated_at?: string;
}

class SocialMediaService {
  async getPosts(filters?: {
    platform?: string;
    category?: string;
    sentiment?: string;
    is_jordanian_dialect?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ScrapedPost[]> {
    let query = supabase
      .from('scraped_posts')
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
    
    if (filters?.is_jordanian_dialect !== undefined) {
      query = query.eq('is_jordanian_dialect', filters.is_jordanian_dialect);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
    
    return data || [];
  }

  async getPostStats() {
    const { data, error } = await supabase
      .from('scraped_posts')
      .select('platform, category, sentiment, is_jordanian_dialect, is_viral');
    
    if (error) {
      console.error('Error fetching post stats:', error);
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      byPlatform: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      bySentiment: {} as Record<string, number>,
      jordanianDialect: data?.filter(p => p.is_jordanian_dialect).length || 0,
      viral: data?.filter(p => p.is_viral).length || 0
    };

    data?.forEach(post => {
      // Platform stats
      stats.byPlatform[post.platform] = (stats.byPlatform[post.platform] || 0) + 1;
      
      // Category stats
      stats.byCategory[post.category] = (stats.byCategory[post.category] || 0) + 1;
      
      // Sentiment stats
      if (post.sentiment) {
        stats.bySentiment[post.sentiment] = (stats.bySentiment[post.sentiment] || 0) + 1;
      }
    });

    return stats;
  }

  async triggerScraping() {
    const { data, error } = await supabase.functions.invoke('scrape-social-media', {
      body: {}
    });

    if (error) {
      console.error('Error triggering scraping:', error);
      throw error;
    }

    return data;
  }

  async getScrapingConfigs(): Promise<ScrapingConfig[]> {
    const { data, error } = await supabase
      .from('scraping_settings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching scraping configs:', error);
      throw error;
    }

    return data || [];
  }

  async createScrapingConfig(config: Omit<ScrapingConfig, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('scraping_settings')
      .insert(config)
      .select()
      .single();

    if (error) {
      console.error('Error creating scraping config:', error);
      throw error;
    }

    return data;
  }

  async updateScrapingConfig(id: string, updates: Partial<ScrapingConfig>) {
    const { data, error } = await supabase
      .from('scraping_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating scraping config:', error);
      throw error;
    }

    return data;
  }

  async deleteScrapingConfig(id: string) {
    const { error } = await supabase
      .from('scraping_settings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting scraping config:', error);
      throw error;
    }
  }

  async deletePosts(postIds: string[]) {
    const { error } = await supabase
      .from('scraped_posts')
      .delete()
      .in('id', postIds);

    if (error) {
      console.error('Error deleting posts:', error);
      throw error;
    }
  }

  async deleteAllPosts() {
    const { error } = await supabase
      .from('scraped_posts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.error('Error deleting all posts:', error);
      throw error;
    }
  }
}

export const socialMediaService = new SocialMediaService();