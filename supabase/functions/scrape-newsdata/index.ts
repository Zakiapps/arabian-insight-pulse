
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
    const urlObj = new URL(req.url);
    // Support GET query param for search, fallback to "technology"
    const query = urlObj.searchParams.get("query") || "technology";
    // Optionally support language param, default to "ar"
    const language = urlObj.searchParams.get("language") || "ar";
    const endpoint = `${BASE_URL}?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(query)}&language=${encodeURIComponent(language)}`;
    const apiRes = await fetch(endpoint);
    const newsData = await apiRes.json();

    // Strongly validate expected shape
    const results = Array.isArray(newsData.results) ? newsData.results : [];

    return new Response(
      JSON.stringify({
        success: true,
        articles: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    // Log and always return JSON
    console.error("Edge error fetching newsdata.io:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || "Unknown error, see edge logs."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
