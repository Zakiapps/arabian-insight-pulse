import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ForecastRequest {
  project_id: string;
  days?: number;
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
    const requestBody = await req.json() as ForecastRequest;
    
    // Validate request
    if (!requestBody.project_id) {
      throw new Error("project_id is required");
    }

    const forecastDays = requestBody.days || 7; // Default to 7 days forecast

    // Verify project access (security check)
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", requestBody.project_id)
      .single();
    
    if (projectError) {
      throw new Error(`Failed to verify project access: ${projectError.message}`);
    }

    // Get historical sentiment data for this project
    const { data: analyses, error: analysesError } = await supabase
      .from("analyses")
      .select(`
        id,
        sentiment,
        sentiment_score,
        created_at,
        uploads!inner(project_id)
      `)
      .eq("uploads.project_id", requestBody.project_id)
      .order("created_at", { ascending: true });
    
    if (analysesError) {
      throw new Error(`Failed to get analyses: ${analysesError.message}`);
    }

    if (!analyses || analyses.length < 5) {
      throw new Error("Not enough historical data for forecasting (minimum 5 data points required)");
    }

    // Prepare time series data
    const timeSeriesData = analyses.map(analysis => ({
      date: new Date(analysis.created_at).toISOString().split('T')[0],
      sentiment_score: analysis.sentiment_score
    }));

    // Group by date and average sentiment scores
    const groupedData: Record<string, number[]> = {};
    timeSeriesData.forEach(item => {
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

    // Simple forecasting algorithm (moving average with trend)
    const forecast = () => {
      const windowSize = 3; // Moving average window
      const data = [...aggregatedData];
      const lastDate = new Date(data[data.length - 1].date);
      
      // Calculate average trend
      let totalTrend = 0;
      let trendPoints = 0;
      
      for (let i = windowSize; i < data.length; i++) {
        const windowAvg = data.slice(i - windowSize, i).reduce((sum, item) => sum + item.sentiment_score, 0) / windowSize;
        const trend = data[i].sentiment_score - windowAvg;
        totalTrend += trend;
        trendPoints++;
      }
      
      const avgTrend = trendPoints > 0 ? totalTrend / trendPoints : 0;
      
      // Calculate last window average
      const lastWindow = data.slice(-windowSize);
      const lastAvg = lastWindow.reduce((sum, item) => sum + item.sentiment_score, 0) / lastWindow.length;
      
      // Generate forecast
      const forecastData = [];
      let forecastDate = new Date(lastDate);
      let forecastValue = lastAvg;
      
      for (let i = 0; i < forecastDays; i++) {
        forecastDate.setDate(forecastDate.getDate() + 1);
        forecastValue += avgTrend;
        
        // Ensure value is between 0 and 1
        forecastValue = Math.max(0, Math.min(1, forecastValue));
        
        forecastData.push({
          date: forecastDate.toISOString().split('T')[0],
          sentiment_score: forecastValue,
          is_forecast: true
        });
      }
      
      return forecastData;
    };

    const forecastData = forecast();
    
    // Get the latest analysis to associate the forecast with
    const latestAnalysis = analyses[analyses.length - 1];
    
    // Insert forecast
    const { data: forecastRecord, error: forecastError } = await supabase
      .from("forecasts")
      .insert({
        analysis_id: latestAnalysis.id,
        forecast_json: {
          historical: aggregatedData,
          forecast: forecastData
        },
        start_date: new Date().toISOString(),
        end_date: new Date(forecastData[forecastData.length - 1].date).toISOString()
      })
      .select()
      .single();
    
    if (forecastError) {
      throw new Error(`Failed to insert forecast: ${forecastError.message}`);
    }
    
    // Log function completion
    const endTime = performance.now();
    await supabase.from("function_logs").insert({
      function_name: "generate-forecast",
      status: "success",
      duration_ms: Math.round(endTime - startTime),
      request_payload: requestBody,
      response_payload: { 
        forecast_id: forecastRecord.id,
        data_points: aggregatedData.length,
        forecast_days: forecastDays
      }
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Forecast generated successfully",
        forecast: {
          id: forecastRecord.id,
          historical: aggregatedData,
          forecast: forecastData
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
    
  } catch (error) {
    console.error("Error in generate-forecast function:", error);
    
    // Log error
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from("function_logs").insert({
      function_name: "generate-forecast",
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