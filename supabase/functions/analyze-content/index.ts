import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeRequest {
  upload_id: string;
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
    const requestBody = await req.json() as AnalyzeRequest;
    
    // Validate request
    if (!requestBody.upload_id) {
      throw new Error("upload_id is required");
    }

    // Get upload data
    const { data: upload, error: uploadError } = await supabase
      .from("uploads")
      .select("*")
      .eq("id", requestBody.upload_id)
      .single();
    
    if (uploadError) {
      throw new Error(`Failed to get upload: ${uploadError.message}`);
    }

    // Verify project access (security check)
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", upload.project_id)
      .single();
    
    if (projectError) {
      throw new Error(`Failed to verify project access: ${projectError.message}`);
    }

    // Call AraBERT endpoint for sentiment and dialect analysis
    const arabertEndpoint = "https://jdzzl8pdnwofvatk.us-east-1.aws.endpoints.huggingface.cloud";
    const hfToken = Deno.env.get("HUGGING_FACE_ACCESS_TOKEN") || "";
    
    if (!hfToken) {
      throw new Error("Hugging Face API token not configured");
    }
    
    const arabertResponse = await fetch(arabertEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: upload.raw_text,
        parameters: {
          return_all_scores: true
        }
      }),
    });
    
    if (!arabertResponse.ok) {
      throw new Error(`AraBERT request failed: ${arabertResponse.statusText}`);
    }
    
    const arabertResult = await arabertResponse.json();
    
    // Process AraBERT result
    let scores;
    if (Array.isArray(arabertResult) && arabertResult.length > 0) {
      scores = arabertResult[0];
    } else if (arabertResult.scores) {
      scores = arabertResult.scores;
    } else {
      throw new Error("Unexpected response format from AraBERT");
    }
    
    // Find positive and negative scores
    const positiveScore = scores.find((s: any) => 
      s.label && (
        s.label.toLowerCase().includes('positive') || 
        s.label.toLowerCase().includes('pos') ||
        s.label === 'LABEL_1' ||
        s.label === '1' ||
        s.label === 'POSITIVE'
      )
    );
    
    const negativeScore = scores.find((s: any) => 
      s.label && (
        s.label.toLowerCase().includes('negative') || 
        s.label.toLowerCase().includes('neg') ||
        s.label === 'LABEL_0' ||
        s.label === '0' ||
        s.label === 'NEGATIVE'
      )
    );
    
    let positive_prob = 0.5;
    let negative_prob = 0.5;
    
    if (positiveScore && negativeScore) {
      positive_prob = positiveScore.score;
      negative_prob = negativeScore.score;
    } else if (scores.length >= 2) {
      negative_prob = scores[0].score;
      positive_prob = scores[1].score;
    }
    
    const sentiment = positive_prob > negative_prob ? 'positive' : 'negative';
    const confidence = Math.max(positive_prob, negative_prob);
    
    // Detect dialect (simple rule-based approach)
    const detectJordanianDialect = (text: string): { dialect: string, confidence: number } => {
      const jordanianTerms = [
        "زلمة", "يا زلمة", "خرفنة", "تسليك", "احشش", "انكب", "راعي", "هسا", "شو", "كيفك",
        "إربد", "عمان", "الزرقاء", "العقبة", "منتخب", "واللهي", "عال", "بدك", "مش عارف",
        "تمام", "فش", "عالسريع", "يا رجال", "يلا", "خلص", "دبس", "بسطة"
      ];
      
      const textLower = text.toLowerCase();
      let score = 0;
      
      jordanianTerms.forEach(term => {
        if (textLower.includes(term.toLowerCase())) {
          score += 1;
        }
      });
      
      const totalWords = text.split(/\s+/).length;
      const confidence = Math.min((score / Math.max(totalWords * 0.1, 1)) * 100, 100) / 100;
      
      return {
        dialect: confidence > 0.15 ? 'jordanian' : 'standard_arabic',
        confidence
      };
    };
    
    const dialectResult = detectJordanianDialect(upload.raw_text);
    
    // Insert analysis result
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .insert({
        upload_id: upload.id,
        sentiment,
        sentiment_score: confidence,
        dialect: dialectResult.dialect,
        dialect_confidence: dialectResult.confidence,
        model_response: {
          positive_prob,
          negative_prob,
          raw_scores: scores
        }
      })
      .select()
      .single();
    
    if (analysisError) {
      throw new Error(`Failed to insert analysis: ${analysisError.message}`);
    }
    
    // Generate summary using mT5
    const mt5Endpoint = "https://vtsy9tnv5uq77r27.us-east-1.aws.endpoints.huggingface.cloud";
    
    const mt5Response = await fetch(mt5Endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: upload.raw_text.substring(0, 1000) // Limit to 1000 chars
      }),
    });
    
    if (!mt5Response.ok) {
      throw new Error(`mT5 request failed: ${mt5Response.statusText}`);
    }
    
    const mt5Result = await mt5Response.json();
    const summaryText = Array.isArray(mt5Result) && mt5Result.length > 0 
      ? mt5Result[0].summary_text 
      : (mt5Result.summary_text || "No summary available");
    
    // Insert summary
    const { data: summary, error: summaryError } = await supabase
      .from("summaries")
      .insert({
        analysis_id: analysis.id,
        summary_text: summaryText,
        language: "ar",
        model_used: "mT5_multilingual_XLSum"
      })
      .select()
      .single();
    
    if (summaryError) {
      throw new Error(`Failed to insert summary: ${summaryError.message}`);
    }
    
    // Mark upload as processed
    await supabase
      .from("uploads")
      .update({ processed: true })
      .eq("id", upload.id);
    
    // Log function completion
    const endTime = performance.now();
    await supabase.from("function_logs").insert({
      function_name: "analyze-content",
      status: "success",
      duration_ms: Math.round(endTime - startTime),
      request_payload: requestBody,
      response_payload: { 
        analysis_id: analysis.id,
        summary_id: summary.id
      }
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Content analyzed successfully",
        analysis,
        summary
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
    
  } catch (error) {
    console.error("Error in analyze-content function:", error);
    
    // Log error
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from("function_logs").insert({
      function_name: "analyze-content",
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