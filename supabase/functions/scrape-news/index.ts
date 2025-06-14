// Import necessary modules
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// NewsAPI endpoint
const newsApiEndpoint = "https://newsapi.org/v2/everything";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Start timing for performance logging
    const startTime = performance.now();
    
    // Parse request body
    const { project_id } = await req.json();
    
    // Validate input
    if (!project_id) {
      return new Response(
        JSON.stringify({ error: "Project ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Scraping news for project: ${project_id}`);
    
    // Get the NewsAPI configuration for this project
    const { data: newsConfig, error: configError } = await supabase
      .from("news_configs")
      .select("*")
      .eq("project_id", project_id)
      .single();
    
    if (configError) {
      console.error("Error fetching NewsAPI config:", configError);
      return new Response(
        JSON.stringify({ error: "NewsAPI configuration not found for this project" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Validate API key
    if (!newsConfig.api_key) {
      return new Response(
        JSON.stringify({ error: "NewsAPI key is not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Prepare NewsAPI query
    const keywords = newsConfig.keywords.join(" OR ");
    const sources = newsConfig.sources.join(",");
    const language = newsConfig.language || "ar";
    
    // Build the URL
    const url = new URL(newsApiEndpoint);
    url.searchParams.append("q", keywords);
    if (sources) url.searchParams.append("sources", sources);
    url.searchParams.append("language", language);
    url.searchParams.append("sortBy", "publishedAt");
    url.searchParams.append("pageSize", "100");
    
    // Call NewsAPI
    const response = await fetch(url.toString(), {
      headers: {
        "X-Api-Key": newsConfig.api_key
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("NewsAPI error:", response.status, errorText);
      
      // Log the error
      await supabase.from("function_logs").insert({
        function_name: "scrape-news",
        status: "error",
        execution_time: performance.now() - startTime,
        error_message: `NewsAPI error: ${response.status} - ${errorText}`,
        request_payload: { project_id }
      });
      
      return new Response(
        JSON.stringify({ error: `NewsAPI error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const newsData = await response.json();
    console.log(`Retrieved ${newsData.articles?.length || 0} articles from NewsAPI`);
    
    // Process and store articles
    const articles = newsData.articles || [];
    const uploadPromises = articles.map(async (article: any) => {
      try {
        // Extract text content
        const content = [article.title, article.description, article.content]
          .filter(Boolean)
          .join("\n\n");
        
        if (!content.trim()) {
          return null; // Skip articles with no content
        }
        
        // Store in uploads table
        const { data: upload, error: uploadError } = await supabase
          .from("uploads")
          .insert({
            project_id,
            source: "newsapi",
            raw_text: content,
            metadata: {
              title: article.title,
              url: article.url,
              author: article.author,
              source: article.source?.name,
              published_at: article.publishedAt,
              image_url: article.urlToImage
            }
          })
          .select()
          .single();
        
        if (uploadError) {
          console.error("Error storing article:", uploadError);
          return null;
        }
        
        return upload;
      } catch (error) {
        console.error("Error processing article:", error);
        return null;
      }
    });
    
    // Wait for all uploads to complete
    const uploads = await Promise.all(uploadPromises);
    const validUploads = uploads.filter(Boolean);
    
    // Update the last run timestamp
    await supabase
      .from("news_configs")
      .update({ last_run_at: new Date().toISOString() })
      .eq("id", newsConfig.id);
    
    // Log successful execution
    await supabase.from("function_logs").insert({
      function_name: "scrape-news",
      status: "success",
      execution_time: performance.now() - startTime,
      request_payload: { project_id },
      response_payload: { articles_count: validUploads.length }
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        articles_count: validUploads.length,
        message: `Successfully scraped and stored ${validUploads.length} articles`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function error:", error);
    
    // Log the error
    await supabase.from("function_logs").insert({
      function_name: "scrape-news",
      status: "error",
      execution_time: null,
      error_message: error.message,
      request_payload: { error: "Error occurred" }
    });
    
    return new Response(
      JSON.stringify({ 
        error: "News scraping failed",
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});