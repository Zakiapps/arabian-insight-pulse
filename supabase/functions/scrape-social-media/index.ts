
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SocialMediaPost {
  platform: string;
  post_id: string;
  content: string;
  author_name?: string;
  author_handle?: string;
  post_url?: string;
  location?: string;
  hashtags?: string[];
  engagement_count: number;
  likes_count?: number;
  shares_count?: number;
  comments_count?: number;
  raw_data: any;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Sentiment analysis using Hugging Face
async function analyzeSentiment(text: string) {
  const huggingFaceToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
  
  if (!huggingFaceToken) {
    console.error('Missing Hugging Face token');
    return { sentiment: 'neutral', score: 0.5, confidence: 0.5 };
  }

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/CAMeL-Lab/bert-base-arabic-camelbert-msa-sentiment',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingFaceToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result && result[0] && Array.isArray(result[0])) {
      const predictions = result[0];
      const topPrediction = predictions.reduce((prev: any, current: any) => 
        prev.score > current.score ? prev : current
      );

      // Map labels to our sentiment categories
      let sentiment = 'neutral';
      if (topPrediction.label.toLowerCase().includes('pos')) {
        sentiment = 'positive';
      } else if (topPrediction.label.toLowerCase().includes('neg')) {
        sentiment = 'negative';
      }

      return {
        sentiment,
        score: topPrediction.score,
        confidence: topPrediction.score
      };
    }

    return { sentiment: 'neutral', score: 0.5, confidence: 0.5 };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return { sentiment: 'neutral', score: 0.5, confidence: 0.5 };
  }
}

// Mock scraping function (replace with actual API calls)
async function scrapeTwitter(searchTerms: string[], hashtags: string[], locationFilters: string[]) {
  // This is a mock implementation
  // In production, you'd use Twitter API v2
  const mockPosts: SocialMediaPost[] = [
    {
      platform: 'twitter',
      post_id: '1234567890',
      content: 'الاقتصاد الأردني يشهد نمواً مستقراً هذا العام والدينار الأردني يحافظ على قوته',
      author_name: 'المحلل الاقتصادي',
      author_handle: '@economic_analyst',
      post_url: 'https://twitter.com/economic_analyst/status/1234567890',
      location: 'Amman, Jordan',
      hashtags: ['#الأردن', '#اقتصاد_الأردن'],
      engagement_count: 150,
      likes_count: 120,
      shares_count: 20,
      comments_count: 10,
      raw_data: {}
    },
    {
      platform: 'twitter',
      post_id: '1234567891',
      content: 'نادي الوحدات يحقق فوزاً مهماً في الدوري الأردني اليوم',
      author_name: 'رياضي أردني',
      author_handle: '@sports_fan',
      post_url: 'https://twitter.com/sports_fan/status/1234567891',
      location: 'Amman, Jordan',
      hashtags: ['#الدوري_الأردني', '#نادي_الوحدات'],
      engagement_count: 1200,
      likes_count: 900,
      shares_count: 200,
      comments_count: 100,
      raw_data: {}
    }
  ];

  return mockPosts;
}

async function scrapeFacebook(searchTerms: string[], hashtags: string[], locationFilters: string[]) {
  // Mock implementation - replace with actual Facebook Graph API
  const mockPosts: SocialMediaPost[] = [
    {
      platform: 'facebook',
      post_id: 'fb_1234567890',
      content: 'الجامعة الأردنية تطلق برنامج جديد للتعليم الإلكتروني',
      author_name: 'أخبار التعليم',
      post_url: 'https://facebook.com/education.news/posts/1234567890',
      location: 'Amman, Jordan',
      hashtags: ['#التعليم_في_الأردن', '#الجامعة_الأردنية'],
      engagement_count: 300,
      likes_count: 250,
      shares_count: 30,
      comments_count: 20,
      raw_data: {}
    }
  ];

  return mockPosts;
}

// Check for duplicates
async function isDuplicate(postId: string, platform: string): Promise<boolean> {
  const { data } = await supabase
    .from('scraped_posts')
    .select('id')
    .eq('post_id', postId)
    .eq('platform', platform)
    .single();
  
  return !!data;
}

// Save post to database
async function savePost(post: SocialMediaPost, sentimentResult: any, category: string) {
  const isViral = post.engagement_count > (post.platform === 'twitter' ? 1000 : 500);
  const isJordanianDialect = await detectJordanianDialect(post.content);

  const { error } = await supabase
    .from('scraped_posts')
    .insert({
      platform: post.platform,
      post_id: post.post_id,
      content: post.content,
      author_name: post.author_name,
      author_handle: post.author_handle,
      post_url: post.post_url,
      location: post.location,
      hashtags: post.hashtags || [],
      category,
      sentiment: sentimentResult.sentiment,
      sentiment_score: sentimentResult.score,
      confidence: sentimentResult.confidence,
      is_jordanian_dialect: isJordanianDialect,
      engagement_count: post.engagement_count,
      likes_count: post.likes_count || 0,
      shares_count: post.shares_count || 0,
      comments_count: post.comments_count || 0,
      is_viral: isViral,
      raw_data: post.raw_data
    });

  if (error) {
    console.error('Error saving post:', error);
  }
}

async function detectJordanianDialect(content: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('detect_jordanian_dialect_enhanced', { content });
  
  if (error) {
    console.error('Error detecting dialect:', error);
    return false;
  }
  
  return data || false;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting social media scraping...');

    // Get scraping configurations
    const { data: configs, error: configError } = await supabase
      .from('scraping_settings')
      .select('*')
      .eq('is_active', true);

    if (configError) {
      throw configError;
    }

    let totalProcessed = 0;

    for (const config of configs || []) {
      console.log(`Scraping ${config.platform}...`);
      
      let posts: SocialMediaPost[] = [];
      
      if (config.platform === 'twitter') {
        posts = await scrapeTwitter(config.search_terms, config.hashtags, config.location_filters);
      } else if (config.platform === 'facebook') {
        posts = await scrapeFacebook(config.search_terms, config.hashtags, config.location_filters);
      }

      for (const post of posts) {
        // Check for duplicates
        const duplicate = await isDuplicate(post.post_id, post.platform);
        if (duplicate) {
          console.log(`Skipping duplicate post: ${post.post_id}`);
          continue;
        }

        // Analyze sentiment
        const sentimentResult = await analyzeSentiment(post.content);
        
        // Categorize post
        const { data: categoryData } = await supabase
          .rpc('categorize_jordanian_post', { content: post.content });
        
        const category = categoryData || 'general';

        // Save to database
        await savePost(post, sentimentResult, category);
        totalProcessed++;

        console.log(`Processed post: ${post.post_id} | Category: ${category} | Sentiment: ${sentimentResult.sentiment}`);
      }

      // Update last scrape time
      await supabase
        .from('scraping_settings')
        .update({ last_scrape_at: new Date().toISOString() })
        .eq('id', config.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${totalProcessed} posts`,
        processed: totalProcessed
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in scrape-social-media function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

serve(handler);
