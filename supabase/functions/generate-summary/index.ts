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

// Get Hugging Face API token
const hfToken = Deno.env.get("HUGGING_FACE_ACCESS_TOKEN");

// mT5 endpoint for summarization
const mt5Endpoint = "https://vtsy9tnv5uq77r27.us-east-1.aws.endpoints.huggingface.cloud";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Start timing for performance logging
    const startTime = performance.now();
    
    // Parse request body
    const { text, analysis_id } = await req.json();
    
    // Validate input
    if ((!text || typeof text !== "string") && !analysis_id) {
      return new Response(
        JSON.stringify({ error: "Either text or analysis_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Validate Hugging Face token
    if (!hfToken) {
      return new Response(
        JSON.stringify({ error: "Hugging Face API token not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    let textToSummarize = text;
    
    // If analysis_id is provided, get the text from the database
    if (analysis_id && !text) {
      const { data: analysis, error: analysisError } = await supabase
        .from("analyses")
        .select("upload_id")
        .eq("id", analysis_id)
        .single();
      
      if (analysisError) {
        console.error("Error fetching analysis:", analysisError);
        return new Response(
          JSON.stringify({ error: "Analysis not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const { data: upload, error: uploadError } = await supabase
        .from("uploads")
        .select("raw_text")
        .eq("id", analysis.upload_id)
        .single();
      
      if (uploadError) {
        console.error("Error fetching upload:", uploadError);
        return new Response(
          JSON.stringify({ error: "Upload not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      textToSummarize = upload.raw_text;
    }
    
    console.log(`Generating summary for text: ${textToSummarize.substring(0, 50)}...`);
    
    // Call mT5 endpoint for summarization
    const summaryResponse = await fetch(mt5Endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: textToSummarize,
        parameters: {
          max_length: 150,
          min_length: 30,
          do_sample: false
        }
      }),
    });
    
    if (!summaryResponse.ok) {
      const errorText = await summaryResponse.text();
      console.error("mT5 endpoint error:", summaryResponse.status, errorText);
      
      // Log the error
      await supabase.from("function_logs").insert({
        function_name: "generate-summary",
        status: "error",
        execution_time: performance.now() - startTime,
        error_message: `mT5 endpoint error: ${summaryResponse.status} - ${errorText}`,
        request_payload: { text: textToSummarize.substring(0, 100) + "..." }
      });
      
      throw new Error(`mT5 endpoint error: ${summaryResponse.status}`);
    }
    
    const summaryResult = await summaryResponse.json();
    console.log("mT5 response:", summaryResult);
    
    // Extract summary text
    let summaryText = "";
    if (Array.isArray(summaryResult) && summaryResult.length > 0) {
      summaryText = summaryResult[0].summary_text || summaryResult[0].generated_text || "";
    } else if (summaryResult.summary_text) {
      summaryText = summaryResult.summary_text;
    } else if (summaryResult.generated_text) {
      summaryText = summaryResult.generated_text;
    } else {
      summaryText = JSON.stringify(summaryResult);
    }
    
    // If analysis_id is provided, store the summary in the database
    if (analysis_id) {
      try {
        const { error: summaryError } = await supabase
          .from("summaries")
          .insert({
            analysis_id,
            summary_text: summaryText,
            model_used: "mT5_multilingual_XLSum"
          });
        
        if (summaryError) {
          console.error("Error storing summary:", summaryError);
        }
      } catch (error) {
        console.error("Error storing summary:", error);
      }
    }
    
    // Log successful execution
    await supabase.from("function_logs").insert({
      function_name: "generate-summary",
      status: "success",
      execution_time: performance.now() - startTime,
      request_payload: { text: textToSummarize.substring(0, 100) + "..." },
      response_payload: { summary: summaryText }
    });
    
    return new Response(
      JSON.stringify({
        summary: summaryText,
        model: "mT5_multilingual_XLSum"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function error:", error);
    
    // Log the error
    await supabase.from("function_logs").insert({
      function_name: "generate-summary",
      status: "error",
      execution_time: null,
      error_message: error.message,
      request_payload: { error: "Error occurred" }
    });
    
    return new Response(
      JSON.stringify({ 
        error: "Summary generation failed",
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});