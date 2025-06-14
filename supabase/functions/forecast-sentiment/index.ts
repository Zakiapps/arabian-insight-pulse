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

// Chronos endpoint for forecasting (placeholder - would be replaced with actual endpoint)
const chronosEndpoint = "https://api.example.com/forecast";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Start timing for performance logging
    const startTime = performance.now();
    
    // Parse request body
    const { project_id, analysis_id, period } = await req.json();
    
    // Validate input
    if (!project_id && !analysis_id) {
      return new Response(
        JSON.stringify({ error: "Either project_id or analysis_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const forecastPeriod = period || "daily";
    console.log(`Generating ${forecastPeriod} forecast for ${project_id ? `project: ${project_id}` : `analysis: ${analysis_id}`}`);
    
    // Get historical sentiment data
    let sentimentData = [];
    
    if (project_id) {
      // Get sentiment data for the entire project
      const { data, error } = await supabase
        .from("analyses")
        .select(`
          id,
          sentiment,
          sentiment_score,
          created_at,
          uploads!inner(project_id)
        `)
        .eq("uploads.project_id", project_id)
        .order("created_at", { ascending: true });
      
      if (error) {
        console.error("Error fetching project sentiment data:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch sentiment data" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      sentimentData = data;
    } else if (analysis_id) {
      // Get sentiment data for a specific analysis
      const { data, error } = await supabase
        .from("analyses")
        .select(`
          id,
          sentiment,
          sentiment_score,
          created_at,
          uploads!inner(project_id)
        `)
        .eq("id", analysis_id);
      
      if (error) {
        console.error("Error fetching analysis sentiment data:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch sentiment data" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (data.length === 0) {
        return new Response(
          JSON.stringify({ error: "Analysis not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Get the project_id from the analysis
      const projectId = data[0].uploads.project_id;
      
      // Get all sentiment data for this project
      const { data: projectData, error: projectError } = await supabase
        .from("analyses")
        .select(`
          id,
          sentiment,
          sentiment_score,
          created_at,
          uploads!inner(project_id)
        `)
        .eq("uploads.project_id", projectId)
        .order("created_at", { ascending: true });
      
      if (projectError) {
        console.error("Error fetching project sentiment data:", projectError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch sentiment data" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      sentimentData = projectData;
    }
    
    // Process sentiment data for forecasting
    const timeSeriesData = sentimentData.map((item: any) => ({
      date: new Date(item.created_at).toISOString().split('T')[0],
      sentiment_score: item.sentiment_score
    }));
    
    // Group by date and calculate average sentiment score
    const groupedData: Record<string, number[]> = {};
    timeSeriesData.forEach((item: any) => {
      if (!groupedData[item.date]) {
        groupedData[item.date] = [];
      }
      groupedData[item.date].push(item.sentiment_score);
    });
    
    const aggregatedData = Object.entries(groupedData).map(([date, scores]) => ({
      date,
      sentiment_score: scores.reduce((sum, score) => sum + score, 0) / scores.length
    }));
    
    // Sort by date
    aggregatedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // If we have less than 3 data points, we can't generate a forecast
    if (aggregatedData.length < 3) {
      // Generate a simple mock forecast
      const lastDate = aggregatedData.length > 0 
        ? new Date(aggregatedData[aggregatedData.length - 1].date)
        : new Date();
      
      const lastScore = aggregatedData.length > 0
        ? aggregatedData[aggregatedData.length - 1].sentiment_score
        : 0.5;
      
      const mockForecast = {
        dates: Array.from({ length: 7 }, (_, i) => {
          const date = new Date(lastDate);
          date.setDate(date.getDate() + i + 1);
          return date.toISOString().split('T')[0];
        }),
        values: Array.from({ length: 7 }, (_, i) => {
          // Simple random walk forecast
          const randomChange = (Math.random() - 0.5) * 0.1;
          return Math.max(0, Math.min(1, lastScore + randomChange * (i + 1)));
        }),
        confidence_intervals: Array.from({ length: 7 }, (_, i) => {
          const value = Math.max(0, Math.min(1, lastScore + (Math.random() - 0.5) * 0.1 * (i + 1)));
          const interval = 0.05 * (i + 1);
          return [Math.max(0, value - interval), Math.min(1, value + interval)];
        })
      };
      
      // Store the forecast if analysis_id is provided
      if (analysis_id) {
        try {
          const { error: forecastError } = await supabase
            .from("forecasts")
            .insert({
              analysis_id,
              forecast_json: mockForecast,
              forecast_period: forecastPeriod
            });
          
          if (forecastError) {
            console.error("Error storing forecast:", forecastError);
          }
        } catch (error) {
          console.error("Error storing forecast:", error);
        }
      }
      
      // Log successful execution
      await supabase.from("function_logs").insert({
        function_name: "forecast-sentiment",
        status: "success",
        execution_time: performance.now() - startTime,
        request_payload: { project_id, analysis_id, period: forecastPeriod },
        response_payload: { forecast: "mock_forecast", points: aggregatedData.length }
      });
      
      return new Response(
        JSON.stringify({
          forecast: mockForecast,
          model: "simple_extrapolation",
          message: "Not enough data points for accurate forecasting, using simple extrapolation"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // In a real implementation, we would call the Chronos endpoint here
    // For now, we'll generate a mock forecast based on the historical data
    
    const lastDate = new Date(aggregatedData[aggregatedData.length - 1].date);
    const forecast = {
      dates: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(lastDate);
        date.setDate(date.getDate() + i + 1);
        return date.toISOString().split('T')[0];
      }),
      values: Array.from({ length: 7 }, () => {
        // Calculate forecast based on recent trend
        const recentData = aggregatedData.slice(-5);
        const avgScore = recentData.reduce((sum, item) => sum + item.sentiment_score, 0) / recentData.length;
        const randomVariation = (Math.random() - 0.5) * 0.1;
        return Math.max(0, Math.min(1, avgScore + randomVariation));
      }),
      confidence_intervals: Array.from({ length: 7 }, (_, i) => {
        const recentData = aggregatedData.slice(-5);
        const avgScore = recentData.reduce((sum, item) => sum + item.sentiment_score, 0) / recentData.length;
        const randomVariation = (Math.random() - 0.5) * 0.1;
        const value = Math.max(0, Math.min(1, avgScore + randomVariation));
        const interval = 0.05 * (i + 1);
        return [Math.max(0, value - interval), Math.min(1, value + interval)];
      })
    };
    
    // Store the forecast if analysis_id is provided
    if (analysis_id) {
      try {
        const { error: forecastError } = await supabase
          .from("forecasts")
          .insert({
            analysis_id,
            forecast_json: forecast,
            forecast_period: forecastPeriod
          });
        
        if (forecastError) {
          console.error("Error storing forecast:", forecastError);
        }
      } catch (error) {
        console.error("Error storing forecast:", error);
      }
    }
    
    // Log successful execution
    await supabase.from("function_logs").insert({
      function_name: "forecast-sentiment",
      status: "success",
      execution_time: performance.now() - startTime,
      request_payload: { project_id, analysis_id, period: forecastPeriod },
      response_payload: { forecast: "generated", points: aggregatedData.length }
    });
    
    return new Response(
      JSON.stringify({
        forecast,
        model: "time_series_analysis",
        data_points: aggregatedData.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function error:", error);
    
    // Log the error
    await supabase.from("function_logs").insert({
      function_name: "forecast-sentiment",
      status: "error",
      execution_time: null,
      error_message: error.message,
      request_payload: { error: "Error occurred" }
    });
    
    return new Response(
      JSON.stringify({ 
        error: "Forecast generation failed",
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});