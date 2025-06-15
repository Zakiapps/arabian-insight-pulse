
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);

// Hugging Face endpoint & token
const HF_ENDPOINT = "https://jdzzl8pdnwofvatk.us-east-1.aws.endpoints.huggingface.cloud";
const HF_TOKEN = Deno.env.get('HUGGINGFACE_API_KEY');

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, projectId } = await req.json();
    const authHeader = req.headers.get('Authorization')!;
    
    // Get user from auth header
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    if (!text || !projectId) {
      return new Response(JSON.stringify({ error: "Text and projectId are required" }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    if (!HF_TOKEN) {
      return new Response(JSON.stringify({ error: "Hugging Face API key missing" }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    // Call HuggingFace endpoint
    const response = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {}
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("HuggingFace error:", errText);
      return new Response(JSON.stringify({ error: "Failed to analyze text", details: errText }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    const hfResult = await response.json();
    console.log("HF Result:", JSON.stringify(hfResult));

    // Parse sentiment result
    let sentiment = "neutral";
    let sentimentScore = 0;
    let dialect = "msa"; // Modern Standard Arabic as default
    let dialectConfidence = 0.5;

    try {
      // Handle different response formats
      const scores = Array.isArray(hfResult) ? hfResult[0] : hfResult;
      
      if (Array.isArray(scores)) {
        // Find sentiment scores - usually LABEL_0 = negative, LABEL_1 = positive
        const positive = scores.find(s => ["LABEL_1", "positive", "POSITIVE"].includes((s.label || "").toUpperCase()));
        const negative = scores.find(s => ["LABEL_0", "negative", "NEGATIVE"].includes((s.label || "").toUpperCase()));
        
        if (positive && negative) {
          if (positive.score > negative.score) {
            sentiment = "positive";
            sentimentScore = positive.score;
          } else {
            sentiment = "negative";
            sentimentScore = negative.score;
          }
        } else if (positive) {
          sentiment = "positive";
          sentimentScore = positive.score;
        } else if (negative) {
          sentiment = "negative";
          sentimentScore = negative.score;
        }
      }
    } catch (e) {
      console.error("Could not parse sentiment from response", e);
    }

    // Simple dialect detection based on text patterns
    if (/أردن|عمان|زلمة|طقس|هسا|شو|كيفك/.test(text)) {
      dialect = "jordanian";
      dialectConfidence = 0.8;
    } else if (/مصر|القاهرة|إيه|ازيك|عامل/.test(text)) {
      dialect = "egyptian";
      dialectConfidence = 0.7;
    } else if (/السعودية|الرياض|وش|كيف الحال/.test(text)) {
      dialect = "saudi";
      dialectConfidence = 0.7;
    }

    // Store analysis in database
    const { data: analysisData, error: dbError } = await supabase
      .from('text_analyses')
      .insert({
        project_id: projectId,
        user_id: user.id,
        input_text: text,
        sentiment,
        sentiment_score: sentimentScore,
        language: 'arabic',
        dialect,
        dialect_confidence: dialectConfidence,
        model_response: hfResult
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to save analysis", details: dbError.message }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    return new Response(JSON.stringify({
      id: analysisData.id,
      sentiment,
      sentimentScore,
      language: 'arabic',
      dialect,
      dialectConfidence,
      analysis: analysisData
    }), { headers: corsHeaders });

  } catch (error) {
    console.error("analyze-arabic-text function error:", error);
    return new Response(JSON.stringify({ error: "Internal error", details: error.message }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
