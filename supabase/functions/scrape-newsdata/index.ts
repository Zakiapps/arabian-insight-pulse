
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
    // Could optionally fetch from the body as POST if desired
    // Construct newsdata request
    const endpoint = `${BASE_URL}?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(query)}&language=ar`;
    const result = await fetch(endpoint);
    const newsData = await result.json();

    // Success = newsData.results
    return new Response(
      JSON.stringify({
        success: true,
        articles: Array.isArray(newsData.results) ? newsData.results : [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || "Unknown error"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
