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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Start timing for performance logging
    const startTime = performance.now();
    
    // Parse request body
    const { upload_id } = await req.json();
    
    // Validate input
    if (!upload_id) {
      return new Response(
        JSON.stringify({ error: "Upload ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Processing upload: ${upload_id}`);
    
    // Get the upload
    const { data: upload, error: uploadError } = await supabase
      .from("uploads")
      .select("*")
      .eq("id", upload_id)
      .single();
    
    if (uploadError) {
      console.error("Error fetching upload:", uploadError);
      return new Response(
        JSON.stringify({ error: "Upload not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if already processed
    if (upload.processed) {
      return new Response(
        JSON.stringify({ message: "Upload already processed", upload_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Process the upload - call analyze-text function
    const analyzeResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        text: upload.raw_text,
        upload_id: upload.id
      })
    });
    
    if (!analyzeResponse.ok) {
      const errorText = await analyzeResponse.text();
      console.error("Error analyzing text:", analyzeResponse.status, errorText);
      
      // Log the error
      await supabase.from("function_logs").insert({
        function_name: "process-upload",
        status: "error",
        execution_time: performance.now() - startTime,
        error_message: `Error analyzing text: ${analyzeResponse.status} - ${errorText}`,
        request_payload: { upload_id }
      });
      
      return new Response(
        JSON.stringify({ error: `Error analyzing text: ${analyzeResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const analysisResult = await analyzeResponse.json();
    console.log("Analysis completed:", analysisResult);
    
    // Get the analysis ID
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .select("id")
      .eq("upload_id", upload_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    if (analysisError) {
      console.error("Error fetching analysis:", analysisError);
      return new Response(
        JSON.stringify({ error: "Analysis not found after processing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Generate summary
    const summaryResponse = await fetch(`${supabaseUrl}/functions/v1/generate-summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        analysis_id: analysis.id
      })
    });
    
    if (!summaryResponse.ok) {
      console.error("Error generating summary:", summaryResponse.status);
      // Continue processing even if summary fails
    } else {
      const summaryResult = await summaryResponse.json();
      console.log("Summary generated:", summaryResult);
    }
    
    // Generate forecast
    const forecastResponse = await fetch(`${supabaseUrl}/functions/v1/forecast-sentiment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        analysis_id: analysis.id,
        period: "daily"
      })
    });
    
    if (!forecastResponse.ok) {
      console.error("Error generating forecast:", forecastResponse.status);
      // Continue processing even if forecast fails
    } else {
      const forecastResult = await forecastResponse.json();
      console.log("Forecast generated:", forecastResult);
    }
    
    // Mark upload as processed
    await supabase
      .from("uploads")
      .update({ processed: true })
      .eq("id", upload_id);
    
    // Log successful execution
    await supabase.from("function_logs").insert({
      function_name: "process-upload",
      status: "success",
      execution_time: performance.now() - startTime,
      request_payload: { upload_id },
      response_payload: { analysis_id: analysis.id }
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        upload_id,
        analysis_id: analysis.id,
        message: "Upload processed successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function error:", error);
    
    // Log the error
    await supabase.from("function_logs").insert({
      function_name: "process-upload",
      status: "error",
      execution_time: null,
      error_message: error.message,
      request_payload: { error: "Error occurred" }
    });
    
    return new Response(
      JSON.stringify({ 
        error: "Upload processing failed",
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});