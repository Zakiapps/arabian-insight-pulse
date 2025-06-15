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

// Hugging Face endpoint & token -- USING the provided ones for testing
const HF_ENDPOINT = "https://jdzzl8pdnwofvatk.us-east-1.aws.endpoints.huggingface.cloud";
// Provided token (hard-coded for now, REMOVE after testing)
const HF_TOKEN = "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";

// Enhanced Jordanian dialect detection (keep as before)
function detectJordanianDialect(text: string): string {
  const jordanianTerms = [
    "زلمة", "يا زلمة", "خرفنة", "تسليك", "احشش", "انكب", "راعي", "هسا", "شو", "كيفك",
    "إربد", "عمان", "الزرقاء", "العقبة", "منتخب", "واللهي", "عال", "بدك", "مش عارف",
    "تمام", "فش", "عالسريع", "يا رجال", "يلا", "خلص", "دبس", "بسطة", "زَيّ الفل",
    "جاي", "روح", "حياتي", "عن جد", "بكفي", "ما بدي", "طيب", "قديش", "وينك",
    "عالطول", "شايف", "هسه", "بتعرف", "بس", "يعني", "كتير", "شوي", "حبتين",
    "منيح", "بدأيش", "بطل", "خبرني", "ولك", "يا عمي", "مفكر", "بفكر"
  ];

  const jordanianPatterns = [
    /\b(شو|كيف|وين|بدك|مش|هسا|هسه|منيح)\b/gi,
    /\b(يا\s*(زلمة|رجال|حياتي|عمي))\b/gi,
    /\b(عال|فش|كتير|شوي|زَيّ)\b/gi,
    /\b(بدأيش|بطل|خبرني)\b/gi
  ];

  const textLower = text.toLowerCase();
  let score = 0;
  let totalChecks = jordanianTerms.length + jordanianPatterns.length;

  // Check for Jordanian terms
  jordanianTerms.forEach(term => {
    if (textLower.includes(term.toLowerCase())) {
      score += 1;
    }
  });

  // Check for Jordanian patterns
  jordanianPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      score += matches.length;
    }
  });

  // Calculate confidence score (0-1)
  const confidence = score / Math.max(totalChecks, 1);
  
  // Determine if text is Jordanian dialect
  return confidence > 0.15 ? 'Jordanian' : 'Non-Jordanian';
}

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

    // Call HuggingFace endpoint (match your sample Python logic: parameters: {})
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
      return new Response(JSON.stringify({ error: "Failed to call HuggingFace", details: errText }), { status: 500, headers: corsHeaders });
    }

    const hfResult = await response.json();

    // Defensive: always extract scores in a robust way
    let sentiment = "neutral";
    let confidence = 0.5;
    let positive_prob = 0.5;
    let negative_prob = 0.5;

    try {
      // HuggingFace result structure varies: sometimes it's [ [ {label,score}, ... ] ] or [ {label,score}, ... ]
      let scores: any[] = Array.isArray(hfResult) && hfResult.length > 0 && Array.isArray(hfResult[0])
        ? hfResult[0]
        : Array.isArray(hfResult) ? hfResult : hfResult.scores || [];

      // fallback: if not an array, cannot parse
      if (!Array.isArray(scores)) {
        throw new Error("Scores is not an array");
      }

      // Try to find best matching positive/negative
      const positiveScore = scores.find(s => 
        s.label && (
          s.label.toLowerCase().includes('positive') || 
          s.label.toLowerCase().includes('pos') ||
          s.label === 'LABEL_1' ||
          s.label === '1' ||
          s.label === 'POSITIVE'
        ) && typeof s.score === "number"
      );
  
      const negativeScore = scores.find(s => 
        s.label && (
          s.label.toLowerCase().includes('negative') || 
          s.label.toLowerCase().includes('neg') ||
          s.label === 'LABEL_0' ||
          s.label === '0' ||
          s.label === 'NEGATIVE'
        ) && typeof s.score === "number"
      );

      // Never let scores be NaN
      if (positiveScore && negativeScore) {
        positive_prob = typeof positiveScore.score === "number" ? positiveScore.score : 0.5;
        negative_prob = typeof negativeScore.score === "number" ? negativeScore.score : 0.5;
      } else if (scores.length >= 2 && typeof scores[0].score === "number" && typeof scores[1].score === "number") {
        negative_prob = scores[0].score;
        positive_prob = scores[1].score;
      } else {
        positive_prob = 0.5;
        negative_prob = 0.5;
      }

      // If for any reason value is not a positive real number, set to 0.5
      if (!isFinite(positive_prob) || positive_prob < 0 || positive_prob > 1) positive_prob = 0.5;
      if (!isFinite(negative_prob) || negative_prob < 0 || negative_prob > 1) negative_prob = 0.5;

      sentiment = positive_prob > negative_prob ? 'positive' : 'negative';
      confidence = Math.max(positive_prob, negative_prob);

    } catch (e) {
      sentiment = "neutral";
      confidence = 0.5;
      positive_prob = 0.5;
      negative_prob = 0.5;
    }

    // Detect dialect
    const dialect = detectJordanianDialect(text);

    const result = {
      sentiment,
      confidence: Math.round(confidence * 10000) / 10000,
      positive_prob: Math.round(positive_prob * 10000) / 10000,
      negative_prob: Math.round(negative_prob * 10000) / 10000,
      dialect,
      modelSource: 'MARBERT_Custom_Endpoint'
    };

    return new Response(JSON.stringify(result), { headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal error", details: error.message }), { status: 500, headers: corsHeaders });
  }
});
