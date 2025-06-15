
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

// Enhanced Hugging Face endpoint & token
const HF_ENDPOINT = "https://jdzzl8pdnwofvatk.us-east-1.aws.endpoints.huggingface.cloud";
const HF_TOKEN = "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";

// Enhanced dialect detection with better patterns
function detectJordanianDialect(text: string): { 
  isJordanian: boolean; 
  confidence: number; 
  indicators: string[];
  emotionalMarkers: string[];
} {
  const jordanianTerms = [
    "زلمة", "يا زلمة", "خرفنة", "تسليك", "احشش", "انكب", "راعي", "هسا", "شو", "كيفك",
    "إربد", "عمان", "الزرقاء", "العقبة", "واللهي", "عال", "بدك", "مش عارف",
    "تمام", "فش", "عالسريع", "يا رجال", "يلا", "خلص", "دبس", "بسطة", "زَيّ الفل",
    "جاي", "روح", "حياتي", "عن جد", "بكفي", "ما بدي", "طيب", "قديش", "وينك",
    "عالطول", "شايف", "هسه", "بتعرف", "بس", "يعني", "كتير", "شوي", "حبتين",
    "منيح", "بدأيش", "بطل", "خبرني", "ولك", "يا عمي", "مفكر", "بفكر", "زفت", "روعة"
  ];

  const emotionalMarkers = [
    "واللهي", "يا رب", "حرام", "حبيبي", "يا زلمة", "عن جد", "يا عمي", 
    "يا حياتي", "يا رجال", "بتجنن", "روعة", "زفت", "فظيع"
  ];

  const textLower = text.toLowerCase();
  let foundTerms: string[] = [];
  let foundEmotionalMarkers: string[] = [];
  let score = 0;
  const totalWords = text.split(/\s+/).length;

  jordanianTerms.forEach(term => {
    if (textLower.includes(term.toLowerCase())) {
      foundTerms.push(term);
      const weight = ["شو", "كيفك", "بدك", "مش", "هسا", "تمام", "واللهي", "عن جد"].includes(term) ? 2 : 1;
      score += weight;
    }
  });

  emotionalMarkers.forEach(marker => {
    if (textLower.includes(marker.toLowerCase())) {
      foundEmotionalMarkers.push(marker);
      score += 1.5;
    }
  });

  const wordDensityScore = (score / Math.max(totalWords * 0.15, 1)) * 100;
  const absoluteMatchScore = Math.min((foundTerms.length / 3) * 100, 100);
  const emotionalBonus = foundEmotionalMarkers.length * 10;
  
  const confidence = Math.min(Math.max(wordDensityScore, absoluteMatchScore) + emotionalBonus, 100);
  const isJordanian = confidence > 20;

  return {
    isJordanian,
    confidence: Math.round(confidence),
    indicators: [...new Set(foundTerms)].slice(0, 12),
    emotionalMarkers: [...new Set(foundEmotionalMarkers)]
  };
}

function validateText(text: string): boolean {
  if (!text || text.trim().length < 3) {
    return false;
  }
  
  // Check for placeholder content patterns
  const placeholderPatterns = [
    /ONLY AVAILABLE IN PAID PLANS/i,
    /upgrade to premium/i,
    /subscribe to read/i,
    /premium content/i,
    /paywall/i
  ];
  
  const hasPlaceholder = placeholderPatterns.some(pattern => pattern.test(text));
  if (hasPlaceholder) {
    return false;
  }
  
  // Check for Arabic characters
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  return hasArabic;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    console.log('Received text for analysis:', text.substring(0, 100) + '...');

    if (!validateText(text)) {
      return new Response(JSON.stringify({ 
        error: "النص غير صالح للتحليل أو يحتوي على محتوى محجوب" 
      }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Call MARBERT analysis
    console.log('Calling MARBERT endpoint...');
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
      console.error('HuggingFace API error:', response.status, errText);
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const hfResult = await response.json();
    console.log('HuggingFace result:', hfResult);

    // Process sentiment analysis result
    let sentiment = "neutral";
    let confidence = 0.5;
    let positive_prob = 0.5;
    let negative_prob = 0.5;

    if (Array.isArray(hfResult) && hfResult.length > 0) {
      const scores = Array.isArray(hfResult[0]) ? hfResult[0] : hfResult;
      
      if (scores.length === 1) {
        const score = scores[0];
        if (score.label === 'LABEL_0') {
          negative_prob = score.score;
          positive_prob = 1 - score.score;
        } else {
          positive_prob = score.score;
          negative_prob = 1 - score.score;
        }
      }
    }

    // Normalize probabilities
    const total = positive_prob + negative_prob;
    if (total > 0) {
      positive_prob = positive_prob / total;
      negative_prob = negative_prob / total;
    }

    // Determine sentiment
    const diff = Math.abs(positive_prob - negative_prob);
    if (diff < 0.1) {
      sentiment = 'neutral';
      confidence = 0.5;
    } else if (positive_prob > negative_prob) {
      sentiment = 'positive';
      confidence = positive_prob;
    } else {
      sentiment = 'negative';
      confidence = negative_prob;
    }

    // Enhanced dialect detection
    const dialectResult = detectJordanianDialect(text);

    // Map emotion based on sentiment and content
    let emotion = 'محايد';
    if (sentiment === 'positive') {
      emotion = dialectResult.emotionalMarkers.length > 0 ? 'سعادة' : 'تفاؤل';
    } else if (sentiment === 'negative') {
      emotion = dialectResult.emotionalMarkers.length > 0 ? 'غضب' : 'استياء';
    }

    const result = {
      sentiment: sentiment,
      confidence: confidence,
      emotion: emotion,
      dialect: dialectResult.isJordanian ? 'Jordanian' : 'Other Arabic',
      dialect_confidence: dialectResult.confidence,
      dialect_indicators: dialectResult.indicators,
      emotional_markers: dialectResult.emotionalMarkers,
      hf_result: hfResult
    };

    console.log('Final analysis result:', result);

    return new Response(JSON.stringify(result), { 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(JSON.stringify({ 
      error: "فشل في تحليل النص", 
      details: error.message 
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
