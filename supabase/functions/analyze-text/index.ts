
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
const HF_TOKEN = "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";

// Enhanced text validation
function validateText(text: string): { isValid: boolean; errorMsg: string } {
  if (!text || text.trim().length < 3) {
    return { isValid: false, errorMsg: "النص فارغ أو قصير جداً" };
  }
  
  // Check for Arabic characters (Unicode range 0x0600-0x06FF)
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  if (!hasArabic) {
    return { isValid: false, errorMsg: "النص لا يحتوي على حروف عربية" };
  }
  
  return { isValid: true, errorMsg: "" };
}

// Enhanced Jordanian dialect detection with confidence scoring
function detectJordanianDialect(text: string): { isJordanian: boolean; confidence: number; indicators: string[] } {
  // Extended Jordanian terms list
  const jordanianTerms = [
    "زلمة", "يا زلمة", "خرفنة", "تسليك", "احشش", "انكب", "راعي", "هسا", "شو", "كيفك",
    "إربد", "عمان", "الزرقاء", "العقبة", "مطربين الأردن", "منتخب", "واللهي", "عال", "بدك", "مش عارف",
    "تمام", "فش", "عالسريع", "يا رجال", "يلا", "خلص", "دبس", "بسطة", "زَيّ الفل",
    "جاي", "روح", "حياتي", "عن جد", "بكفي", "ما بدي", "طيب", "قديش", "وينك",
    "عالطول", "شايف", "هسه", "بتعرف", "بس", "يعني", "كتير", "شوي", "حبتين",
    "منيح", "بدأيش", "بطل", "خبرني", "ولك", "يا عمي", "مفكر", "بفكر"
  ];

  // Enhanced Jordanian patterns
  const jordanianPatterns = [
    /\b(شو|كيف|وين|بدك|مش|هسا|هسه|منيح)\b/gi,
    /\b(يا\s*(زلمة|رجال|حياتي|عمي))\b/gi,
    /\b(عال|فش|كتير|شوي|زَيّ)\b/gi,
    /\b(بدأيش|بطل|خبرني)\b/gi,
    /\b(واللهي|عن جد|تمام)\b/gi
  ];

  const textLower = text.toLowerCase();
  let foundTerms: string[] = [];
  let score = 0;
  const totalWords = text.split(/\s+/).length;

  // Check for Jordanian terms with weighted scoring
  jordanianTerms.forEach(term => {
    if (textLower.includes(term.toLowerCase())) {
      foundTerms.push(term);
      // Weight common terms higher
      const weight = ["شو", "كيفك", "بدك", "مش", "هسا", "تمام"].includes(term) ? 2 : 1;
      score += weight;
    }
  });

  // Check for Jordanian patterns with pattern matching
  jordanianPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      foundTerms.push(...matches);
      score += matches.length * 1.5; // Pattern matches get higher weight
    }
  });

  // Calculate confidence based on word density and absolute matches
  const wordDensityScore = (score / Math.max(totalWords * 0.15, 1)) * 100;
  const absoluteMatchScore = Math.min((foundTerms.length / 3) * 100, 100);
  const confidence = Math.min(Math.max(wordDensityScore, absoluteMatchScore), 100);
  
  const isJordanian = confidence > 20; // Lowered threshold for better detection

  return {
    isJordanian,
    confidence: Math.round(confidence),
    indicators: [...new Set(foundTerms)].slice(0, 10) // Limit to 10 unique indicators
  };
}

// Arabic text preprocessing (simplified version of ArabertPreprocessor)
function preprocessArabicText(text: string): string {
  return text
    // Normalize Arabic letters
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    // Remove diacritics
    .replace(/[\u064B-\u0652]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Enhanced sentiment analysis with better probability handling
function analyzeSentiment(hfResult: any): {
  sentiment: string;
  confidence: number;
  positive_prob: number;
  negative_prob: number;
} {
  let sentiment = "neutral";
  let confidence = 0.5;
  let positive_prob = 0.5;
  let negative_prob = 0.5;

  try {
    // Handle different HuggingFace response formats
    let scores: any[] = [];
    
    if (Array.isArray(hfResult)) {
      scores = Array.isArray(hfResult[0]) ? hfResult[0] : hfResult;
    } else if (hfResult.scores && Array.isArray(hfResult.scores)) {
      scores = hfResult.scores;
    } else if (Array.isArray(hfResult)) {
      scores = hfResult;
    }

    if (!Array.isArray(scores) || scores.length === 0) {
      throw new Error("Invalid scores format");
    }

    // Try to find sentiment labels in different formats
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

    // Assign probabilities based on found labels
    if (positiveScore && negativeScore) {
      positive_prob = positiveScore.score;
      negative_prob = negativeScore.score;
    } else if (scores.length >= 2) {
      // Assume first is negative, second is positive (common BERT format)
      negative_prob = scores[0].score || 0.5;
      positive_prob = scores[1].score || 0.5;
    }

    // Ensure probabilities are valid numbers
    if (!isFinite(positive_prob) || positive_prob < 0 || positive_prob > 1) {
      positive_prob = 0.5;
    }
    if (!isFinite(negative_prob) || negative_prob < 0 || negative_prob > 1) {
      negative_prob = 0.5;
    }

    // Normalize probabilities to sum to 1
    const total = positive_prob + negative_prob;
    if (total > 0) {
      positive_prob = positive_prob / total;
      negative_prob = negative_prob / total;
    }

    // Determine sentiment and confidence
    if (positive_prob > negative_prob) {
      sentiment = 'positive';
      confidence = positive_prob;
    } else if (negative_prob > positive_prob) {
      sentiment = 'negative';
      confidence = negative_prob;
    } else {
      sentiment = 'neutral';
      confidence = 0.5;
    }

  } catch (e) {
    console.error("Error in sentiment analysis:", e);
    // Fallback values
    sentiment = "neutral";
    confidence = 0.5;
    positive_prob = 0.5;
    negative_prob = 0.5;
  }

  return {
    sentiment,
    confidence: Math.round(confidence * 10000) / 10000,
    positive_prob: Math.round(positive_prob * 10000) / 10000,
    negative_prob: Math.round(negative_prob * 10000) / 10000
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: "No text provided" }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Enhanced text validation
    const validation = validateText(text);
    if (!validation.isValid) {
      return new Response(JSON.stringify({ 
        error: "Text validation failed", 
        details: validation.errorMsg 
      }), { 
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

    console.log('Processing text:', text);

    // Preprocess Arabic text
    const processedText = preprocessArabicText(text);
    console.log('Preprocessed text:', processedText);

    // Call HuggingFace endpoint with enhanced error handling
    const response = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        inputs: processedText,
        parameters: {}
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("HuggingFace API error:", response.status, errText);
      return new Response(JSON.stringify({ 
        error: "Failed to call HuggingFace API", 
        details: errText,
        status: response.status
      }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    const hfResult = await response.json();
    console.log('HuggingFace result:', JSON.stringify(hfResult, null, 2));

    // Enhanced sentiment analysis
    const sentimentResult = analyzeSentiment(hfResult);

    // Enhanced dialect detection
    const dialectResult = detectJordanianDialect(text);

    const result = {
      sentiment: sentimentResult.sentiment,
      confidence: sentimentResult.confidence,
      positive_prob: sentimentResult.positive_prob,
      negative_prob: sentimentResult.negative_prob,
      dialect: dialectResult.isJordanian ? 'Jordanian' : 'Non-Jordanian',
      dialect_confidence: dialectResult.confidence,
      dialect_indicators: dialectResult.indicators,
      modelSource: 'MARBERT_Custom_Endpoint',
      processed_text: processedText,
      validation: validation
    };

    console.log('Final result:', result);

    return new Response(JSON.stringify(result), { headers: corsHeaders });

  } catch (error) {
    console.error("Analyze-text function error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: error.message 
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
