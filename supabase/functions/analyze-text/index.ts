
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
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
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: "No text provided" }), { status: 400, headers: corsHeaders });
    }
    if (!HF_TOKEN) {
      return new Response(JSON.stringify({ error: "Hugging Face API key missing" }), { status: 500, headers: corsHeaders });
    }

    // Call HuggingFace endpoint as per your function
    const response = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {} // Feel free to add more parameters if needed
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("HuggingFace error:", errText);
      return new Response(JSON.stringify({ error: "Failed to call HuggingFace", details: errText }), { status: 500, headers: corsHeaders });
    }

    // Response expected: e.g. [[{ label: "LABEL_0", score: ... }, { label: "LABEL_1", score: ... }]] or similar
    const hfResult = await response.json();
    // Try to find sentiment result
    let sentiment = "neutral";
    let confidence = 0;
    let dialect = "";
    try {
      // some endpoints wrap results in outer array
      const top = Array.isArray(hfResult) ? hfResult[0] : hfResult;
      if (Array.isArray(top)) {
        // e.g.: [{ label: "LABEL_1", score: 0.9 }, ...]
        // usually LABEL_0 = negative, LABEL_1 = positive, LABEL_2 = neutral (rare)
        const pos = top.find(s => ["LABEL_1", "positive", "POSITIVE"].includes((s.label || "").toUpperCase()));
        const neg = top.find(s => ["LABEL_0", "negative", "NEGATIVE"].includes((s.label || "").toUpperCase()));
        const neu = top.find(s => ["LABEL_2", "neutral", "NEUTRAL"].includes((s.label || "").toUpperCase()));
        if (pos && neg) {
          if (pos.score > neg.score) {
            sentiment = "positive";
            confidence = pos.score;
          } else {
            sentiment = "negative";
            confidence = neg.score;
          }
        } else if (pos) {
          sentiment = "positive";
          confidence = pos.score;
        } else if (neg) {
          sentiment = "negative";
          confidence = neg.score;
        } else if (neu) {
          sentiment = "neutral";
          confidence = neu.score;
        }
      }
    } catch (e) {
      console.error("Could not parse sentiment from HuggingFace response", e);
    }

    // Fake dialect detection (for demo: detect if word "أردني" exists)
    if (/أردن|عمان|زلمة|طقس/.test(text)) {
      dialect = "jordanian";
    } else {
      dialect = "msa";
    }

    return new Response(JSON.stringify({
      sentiment,
      confidence,
      dialect,
      model: "bert-ajgt-abv"
    }), { headers: corsHeaders });
  } catch (error) {
    console.error("analyze-text function error:", error);
    return new Response(JSON.stringify({ error: "Internal error", details: error.message }), { status: 500, headers: corsHeaders });
  }
});
