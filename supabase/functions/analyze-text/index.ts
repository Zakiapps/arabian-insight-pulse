
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

// Enhanced Jordanian dialect detection
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

    console.log('Starting sentiment analysis with custom MARBERT endpoint...');
    console.log('Input text:', text);

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
        parameters: {
          return_all_scores: true
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("HuggingFace error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Failed to call HuggingFace", details: errText }), { status: 500, headers: corsHeaders });
    }

    const hfResult = await response.json();
    console.log('HuggingFace response:', JSON.stringify(hfResult));

    // Parse sentiment result - handle different response formats
    let sentiment = "neutral";
    let confidence = 0;
    let positive_prob = 0.5;
    let negative_prob = 0.5;

    try {
      // Handle the response format from your custom endpoint
      let scores;
      if (Array.isArray(hfResult) && hfResult.length > 0) {
        scores = hfResult[0];
      } else if (hfResult.scores) {
        scores = hfResult.scores;
      } else if (Array.isArray(hfResult)) {
        scores = hfResult;
      } else {
        throw new Error('Unexpected response format from HuggingFace');
      }

      console.log('Parsed scores:', scores);

      if (Array.isArray(scores)) {
        // Find positive and negative scores for MARBERT model
        const positiveScore = scores.find(s => 
          s.label && (
            s.label.toLowerCase().includes('positive') || 
            s.label.toLowerCase().includes('pos') ||
            s.label === 'LABEL_1' ||
            s.label === '1' ||
            s.label === 'POSITIVE'
          )
        );
        
        const negativeScore = scores.find(s => 
          s.label && (
            s.label.toLowerCase().includes('negative') || 
            s.label.toLowerCase().includes('neg') ||
            s.label === 'LABEL_0' ||
            s.label === '0' ||
            s.label === 'NEGATIVE'
          )
        );

        if (positiveScore && negativeScore) {
          positive_prob = positiveScore.score;
          negative_prob = negativeScore.score;
        } else if (scores.length >= 2) {
          // Fallback: assume first two scores are negative and positive
          negative_prob = scores[0].score;
          positive_prob = scores[1].score;
        }

        sentiment = positive_prob > negative_prob ? 'positive' : 'negative';
        confidence = Math.max(positive_prob, negative_prob);

        console.log('Final sentiment analysis:', {
          sentiment,
          confidence,
          positive_prob,
          negative_prob
        });
      }
    } catch (e) {
      console.error("Could not parse sentiment from HuggingFace response", e);
      // Return default values if parsing fails
      sentiment = "neutral";
      confidence = 0.5;
      positive_prob = 0.5;
      negative_prob = 0.5;
    }

    // Detect dialect
    const dialect = detectJordanianDialect(text);
    console.log('Dialect detection result:', dialect);

    const result = {
      sentiment,
      confidence: Math.round(confidence * 10000) / 10000,
      positive_prob: Math.round(positive_prob * 10000) / 10000,
      negative_prob: Math.round(negative_prob * 10000) / 10000,
      dialect,
      modelSource: 'MARBERT_Custom_Endpoint'
    };

    console.log('Returning analysis result:', result);

    return new Response(JSON.stringify(result), { headers: corsHeaders });
  } catch (error) {
    console.error("analyze-text function error:", error);
    return new Response(JSON.stringify({ error: "Internal error", details: error.message }), { status: 500, headers: corsHeaders });
  }
});
