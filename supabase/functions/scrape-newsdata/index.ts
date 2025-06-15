
// Edge function: Proxy request to newsdata.io using fixed API KEY
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NEWS_API_KEY = "pub_33f8e2e2877b40c78551313a82acfb3d";
const BASE_URL = "https://newsdata.io/api/1/latest";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("NewsData.io edge function called");
    
    let query = "technology";
    let language = "en";
    let testConnection = false;
    
    // Handle both GET and POST requests
    if (req.method === "POST") {
      try {
        const body = await req.json();
        query = body.query || query;
        language = body.language || language;
        testConnection = body.test === true;
      } catch (e) {
        console.log("No JSON body, using defaults");
      }
    } else {
      // Handle GET request with URL parameters
      const urlObj = new URL(req.url);
      query = urlObj.searchParams.get("query") || query;
      language = urlObj.searchParams.get("language") || language;
      testConnection = urlObj.searchParams.get("test") === "true";
    }
    
    console.log(`Query: ${query}, Language: ${language}, Test: ${testConnection}`);
    
    // Build the API endpoint
    const endpoint = `${BASE_URL}?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(query)}&language=${encodeURIComponent(language)}`;
    console.log(`Calling NewsData.io API: ${endpoint}`);
    
    const apiRes = await fetch(endpoint);
    console.log(`API Response status: ${apiRes.status}`);
    
    if (!apiRes.ok) {
      console.error(`API Error: ${apiRes.status} - ${apiRes.statusText}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: `NewsData.io API error: ${apiRes.status} - ${apiRes.statusText}`,
          status: apiRes.status
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const newsData = await apiRes.json();
    console.log("NewsData.io response received, status:", newsData.status);
    
    // Handle API-level errors from NewsData.io
    if (newsData.status === "error") {
      console.error("NewsData.io API returned error:", newsData);
      return new Response(
        JSON.stringify({
          success: false,
          error: newsData.message || "NewsData.io API error",
          code: newsData.code
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Validate response structure
    const results = Array.isArray(newsData.results) ? newsData.results : [];
    console.log(`Found ${results.length} articles`);
    
    // If this is a connection test, return minimal info
    if (testConnection) {
      return new Response(
        JSON.stringify({
          success: true,
          connectionTest: true,
          totalResults: newsData.totalResults || 0,
          articlesFound: results.length,
          apiStatus: newsData.status
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: newsData.status,
        totalResults: newsData.totalResults || 0,
        results: results,
        nextPage: newsData.nextPage || null
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || "Unknown error occurred",
        stack: error?.stack
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
