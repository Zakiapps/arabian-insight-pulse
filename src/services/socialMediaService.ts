
import { supabase } from '@/integrations/supabase/client';

export interface ScrapedPost {
  id: string;
  platform: string;
  post_id: string;
  content: string;
  author: string;
  category: string;
  engagement_count: number;
  is_viral: boolean;
  is_jordanian_dialect: boolean;
  sentiment?: string;
  sentiment_score?: number;
  created_at: string;
}

export interface SocialMediaStats {
  totalPosts: number;
  platformDistribution: { platform: string; count: number }[];
  categoryDistribution: { category: string; count: number }[];
  sentimentDistribution: { sentiment: string; count: number }[];
  viralPosts: number;
  jordanianDialectPosts: number;
}

class SocialMediaService {
  async getScrapedPosts(filters?: {
    platform?: string;
    category?: string;
    sentiment?: string;
    isViral?: boolean;
    isJordanianDialect?: boolean;
    limit?: number;
  }): Promise<ScrapedPost[]> {
    try {
      // Use analyzed_posts table instead of scraped_posts since it exists
      let query = supabase
        .from('analyzed_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.sentiment) {
        query = query.eq('sentiment', filters.sentiment);
      }

      if (filters?.isJordanianDialect !== undefined) {
        query = query.eq('is_jordanian_dialect', filters.isJordanianDialect);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform analyzed_posts data to match ScrapedPost interface
      return (data || []).map((post: any) => ({
        id: post.id,
        platform: post.source || 'unknown',
        post_id: post.id,
        content: post.content,
        author: 'unknown',
        category: 'general',
        engagement_count: post.engagement_count || 0,
        is_viral: (post.engagement_count || 0) > 1000,
        is_jordanian_dialect: post.is_jordanian_dialect || false,
        sentiment: post.sentiment,
        sentiment_score: post.sentiment_score,
        created_at: post.created_at,
      }));
    } catch (error) {
      console.error('Error fetching scraped posts:', error);
      return [];
    }
  }

  // Add alias methods for compatibility
  async getPosts(filters?: any): Promise<ScrapedPost[]> {
    return this.getScrapedPosts(filters);
  }

  async getStats(): Promise<SocialMediaStats> {
    try {
      const posts = await this.getScrapedPosts();

      const platformDistribution = posts.reduce((acc: { platform: string; count: number }[], post) => {
        const existing = acc.find(p => p.platform === post.platform);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ platform: post.platform, count: 1 });
        }
        return acc;
      }, []);

      const categoryDistribution = posts.reduce((acc: { category: string; count: number }[], post) => {
        const existing = acc.find(c => c.category === post.category);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ category: post.category, count: 1 });
        }
        return acc;
      }, []);

      const sentimentDistribution = posts.reduce((acc: { sentiment: string; count: number }[], post) => {
        if (post.sentiment) {
          const existing = acc.find(s => s.sentiment === post.sentiment);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ sentiment: post.sentiment, count: 1 });
          }
        }
        return acc;
      }, []);

      return {
        totalPosts: posts.length,
        platformDistribution,
        categoryDistribution,
        sentimentDistribution,
        viralPosts: posts.filter(p => p.is_viral).length,
        jordanianDialectPosts: posts.filter(p => p.is_jordanian_dialect).length,
      };
    } catch (error) {
      console.error('Error getting social media stats:', error);
      return {
        totalPosts: 0,
        platformDistribution: [],
        categoryDistribution: [],
        sentimentDistribution: [],
        viralPosts: 0,
        jordanianDialectPosts: 0,
      };
    }
  }

  // Add alias method for compatibility
  async getPostStats(): Promise<SocialMediaStats> {
    return this.getStats();
  }

  async scrapePlatform(platform: string, keywords: string[]): Promise<void> {
    try {
      // This would integrate with the scraping edge functions
      const { data, error } = await supabase.functions.invoke('scrape-brightdata', {
        body: {
          platform,
          keywords,
          rules: {
            platforms: [platform],
            keywords,
            limit: 100,
          },
        },
      });

      if (error) throw error;

      console.log('Scraping initiated for platform:', platform);
    } catch (error) {
      console.error('Error initiating scraping:', error);
      throw error;
    }
  }

  // Add alias methods for compatibility
  async triggerScraping(platform: string, keywords: string[]): Promise<void> {
    return this.scrapePlatform(platform, keywords);
  }

  async deletePosts(postIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('analyzed_posts')
        .delete()
        .in('id', postIds);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting posts:', error);
      throw error;
    }
  }
}

export const socialMediaService = new SocialMediaService();
