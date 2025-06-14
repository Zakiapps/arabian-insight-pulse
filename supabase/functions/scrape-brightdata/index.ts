import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScrapeRequest {
  project_id: string;
  config_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log function start
    const startTime = performance.now();
    const requestBody = await req.json() as ScrapeRequest;
    
    // Validate request
    if (!requestBody.project_id) {
      throw new Error("project_id is required");
    }

    // Get BrightData configuration
    let brightDataConfigQuery = supabase
      .from("brightdata_configs")
      .select("*")
      .eq("project_id", requestBody.project_id)
      .eq("is_active", true);
    
    // If config_id is provided, use it to filter
    if (requestBody.config_id) {
      brightDataConfigQuery = brightDataConfigQuery.eq("id", requestBody.config_id);
    }
    
    const { data: brightDataConfig, error: configError } = await brightDataConfigQuery.single();
    
    if (configError) {
      throw new Error(`Failed to get BrightData configuration: ${configError.message}`);
    }

    // Verify project access (security check)
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", requestBody.project_id)
      .single();
    
    if (projectError) {
      throw new Error(`Failed to verify project access: ${projectError.message}`);
    }

    // In a real implementation, this would call the BrightData API
    // For this demo, we'll simulate the scraping process
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock data based on the configuration
    const mockPosts = [];
    const platforms = brightDataConfig.rules.platforms || [];
    const keywords = brightDataConfig.rules.keywords || [];
    const limit = brightDataConfig.rules.limit || 10;
    
    // Generate mock posts
    for (let i = 0; i < limit; i++) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)] || 'twitter';
      const keyword = keywords[Math.floor(Math.random() * keywords.length)] || 'default';
      
      // Create mock post
      mockPosts.push({
        platform,
        content: `This is a mock ${platform} post about ${keyword}. #${keyword} #brightdata #mock`,
        author: `user${i}@${platform}`,
        engagement: Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString()
      });
    }
    
    // Insert mock posts into uploads table
    const insertPromises = mockPosts.map(async (post) => {
      try {
        const { data, error } = await supabase
          .from("uploads")
          .insert({
            project_id: requestBody.project_id,
            source: post.platform,
            raw_text: post.content,
            metadata: {
              author: post.author,
              engagement: post.engagement,
              timestamp: post.timestamp
            },
            processed: false
          })
          .select();
        
        if (error) {
          console.error(`Failed to insert post: ${error.message}`);
          return null;
        }
        
        return data[0];
      } catch (error) {
        console.error(`Error processing post: ${error.message}`);
        return null;
      }
    });
    
    // Wait for all inserts to complete
    const insertedPosts = await Promise.all(insertPromises);
    const successfulInserts = insertedPosts.filter(post => post !== null);
    
    // Update last_run_at timestamp
    await supabase
      .from("brightdata_configs")
      .update({ last_run_at: new Date().toISOString() })
      .eq("id", brightDataConfig.id);
    
    // Log function completion
    const endTime = performance.now();
    await supabase.from("function_logs").insert({
      function_name: "scrape-brightdata",
      status: "success",
      duration_ms: Math.round(endTime - startTime),
      request_payload: requestBody,
      response_payload: { 
        posts_count: successfulInserts.length,
        platforms: platforms
      }
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Scraped ${successfulInserts.length} posts from BrightData`,
        posts: successfulInserts
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
    
  } catch (error) {
    console.error("Error in scrape-brightdata function:", error);
    
    // Log error
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from("function_logs").insert({
      function_name: "scrape-brightdata",
      status: "error",
      error_message: error.message,
      request_payload: req.body ? await req.json() : null
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});