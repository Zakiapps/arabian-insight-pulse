
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

// Enhanced text validation - more lenient for title+description analysis
function validateAndCleanText(text: string): { isValid: boolean; cleanText: string; contentType: string } {
  if (!text || text.trim().length < 2) {
    return { isValid: false, cleanText: "", contentType: "none" };
  }
  
  const cleanText = text.trim();
  
  // Check for Arabic characters (more lenient)
  const hasArabic = /[\u0600-\u06FF]/.test(cleanText);
  const hasEnglish = /[a-zA-Z]/.test(cleanText);
  
  // Accept if has Arabic or if it's a title/description with some meaningful content
  if (hasArabic) {
    return { isValid: true, cleanText, contentType: "arabic" };
  } else if (hasEnglish && cleanText.length > 10) {
    return { isValid: true, cleanText, contentType: "english" };
  }
  
  return { isValid: false, cleanText: "", contentType: "unknown" };
}

// Utility to bound numeric values to prevent overflow
function boundNumericValue(value: number, min: number, max: number): number {
  if (isNaN(value) || !isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, title, description } = await req.json();
    
    // Enhanced content selection logic
    let textToAnalyze = '';
    let contentSource = 'none';
    
    // If explicit text is provided, use it
    if (text) {
      const validation = validateAndCleanText(text);
      if (validation.isValid) {
        textToAnalyze = validation.cleanText;
        contentSource = 'direct_text';
      }
    }
    
    // If no valid text, try title + description combination
    if (!textToAnalyze && (title || description)) {
      const combinedText = [title, description].filter(Boolean).join('. ');
      const validation = validateAndCleanText(combinedText);
      if (validation.isValid) {
        textToAnalyze = validation.cleanText;
        contentSource = title && description ? 'title_description' : (title ? 'title_only' : 'description_only');
      }
    }
    
    if (!textToAnalyze) {
      return new Response(JSON.stringify({ 
        error: "لا يوجد نص صالح للتحليل",
        contentSource: 'none'
      }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log(`Analyzing text from ${contentSource}: ${textToAnalyze.substring(0, 100)}...`);

    // Call MARBERT analysis
    const response = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        inputs: textToAnalyze,
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

    // Process sentiment analysis result with bounds checking
    let sentiment = "neutral";
    let confidence = 0.5;
    let positive_prob = 0.5;
    let negative_prob = 0.5;

    if (Array.isArray(hfResult) && hfResult.length > 0) {
      const scores = Array.isArray(hfResult[0]) ? hfResult[0] : hfResult;
      
      if (scores.length === 1) {
        const score = scores[0];
        if (score.label === 'LABEL_0') {
          negative_prob = boundNumericValue(score.score, 0, 1);
          positive_prob = 1 - negative_prob;
        } else {
          positive_prob = boundNumericValue(score.score, 0, 1);
          negative_prob = 1 - positive_prob;
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
    const dialectResult = detectJordanianDialect(textToAnalyze);

    // Map emotion based on sentiment and content
    let emotion = 'محايد';
    if (sentiment === 'positive') {
      emotion = dialectResult.emotionalMarkers.length > 0 ? 'سعادة' : 'تفاؤل';
    } else if (sentiment === 'negative') {
      emotion = dialectResult.emotionalMarkers.length > 0 ? 'غضب' : 'استياء';
    }

    // Bound all numeric values to prevent overflow
    const result = {
      sentiment: sentiment,
      confidence: boundNumericValue(confidence, 0, 1),
      emotion: emotion,
      dialect: dialectResult.isJordanian ? 'Jordanian' : 'Other Arabic',
      dialect_confidence: boundNumericValue(dialectResult.confidence, 0, 100),
      dialect_indicators: dialectResult.indicators,
      emotional_markers: dialectResult.emotionalMarkers,
      contentSource: contentSource,
      analyzedText: textToAnalyze.length > 200 ? textToAnalyze.substring(0, 200) + '...' : textToAnalyze,
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
      details: error.message,
      contentSource: 'error'
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
