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

    // Get NewsAPI configuration
    let newsConfigQuery = supabase
      .from("news_configs")
      .select("*")
      .eq("project_id", requestBody.project_id)
      .eq("is_active", true);
    
    // If config_id is provided, use it to filter
    if (requestBody.config_id) {
      newsConfigQuery = newsConfigQuery.eq("id", requestBody.config_id);
    }
    
    const { data: newsConfig, error: configError } = await newsConfigQuery.single();
    
    if (configError) {
      throw new Error(`Failed to get NewsAPI configuration: ${configError.message}`);
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

    // Prepare NewsAPI request
    const apiKey = newsConfig.api_key || "482cb9523dff462ebd58db6177d3af91"; // Fallback to provided key
    const keywords = newsConfig.keywords?.join(" OR ") || "";
    const sources = newsConfig.sources?.join(",") || "";
    const language = newsConfig.language || "ar";
    
    // Build NewsAPI URL
    let newsApiUrl = `https://newsapi.org/v2/everything?apiKey=${apiKey}&language=${language}`;
    
    if (keywords) {
      newsApiUrl += `&q=${encodeURIComponent(keywords)}`;
    }
    
    if (sources) {
      newsApiUrl += `&sources=${encodeURIComponent(sources)}`;
    }
    
    // Call NewsAPI
    const newsResponse = await fetch(newsApiUrl);
    
    if (!newsResponse.ok) {
      throw new Error(`NewsAPI request failed: ${newsResponse.statusText}`);
    }
    
    const newsData = await newsResponse.json();
    
    if (!newsData.articles || !Array.isArray(newsData.articles)) {
      throw new Error("Invalid response from NewsAPI");
    }
    
    // Process articles
    const articles = newsData.articles;
    const insertPromises = articles.map(async (article: any) => {
      // Prepare article data
      const articleData = {
        project_id: requestBody.project_id,
        source: "newsapi",
        title: article.title,
        raw_text: `${article.title}\n\n${article.description || ""}\n\n${article.content || ""}`,
        metadata: {
          url: article.url,
          author: article.author,
          publishedAt: article.publishedAt,
          source: article.source?.name,
          urlToImage: article.urlToImage
        },
        processed: false
      };
      
      // Insert article into uploads table
      const { data, error } = await supabase
        .from("uploads")
        .insert(articleData)
        .select();
      
      if (error) {
        console.error(`Failed to insert article: ${error.message}`);
        return null;
      }
      
      return data[0];
    });
    
    // Wait for all inserts to complete
    const insertedArticles = await Promise.all(insertPromises);
    const successfulInserts = insertedArticles.filter(article => article !== null);
    
    // Update last_run_at timestamp
    await supabase
      .from("news_configs")
      .update({ last_run_at: new Date().toISOString() })
      .eq("id", newsConfig.id);
    
    // Log function completion
    const endTime = performance.now();
    await supabase.from("function_logs").insert({
      function_name: "scrape-newsapi",
      status: "success",
      duration_ms: Math.round(endTime - startTime),
      request_payload: requestBody,
      response_payload: { 
        articles_count: successfulInserts.length,
        total_articles: articles.length
      }
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Scraped ${successfulInserts.length} articles from NewsAPI`,
        articles: successfulInserts
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
    
  } catch (error) {
    console.error("Error in scrape-newsapi function:", error);
    
    // Log error
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from("function_logs").insert({
      function_name: "scrape-newsapi",
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