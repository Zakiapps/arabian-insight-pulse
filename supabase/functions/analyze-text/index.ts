
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

// Enhanced Hugging Face endpoint & token
const HF_ENDPOINT = "https://jdzzl8pdnwofvatk.us-east-1.aws.endpoints.huggingface.cloud";
const HF_TOKEN = "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";

// Enhanced text validation with emotion context
function validateText(text: string): { isValid: boolean; errorMsg: string; emotionContext?: string } {
  if (!text || text.trim().length < 3) {
    return { isValid: false, errorMsg: "النص فارغ أو قصير جداً" };
  }
  
  // Check for Arabic characters (Unicode range 0x0600-0x06FF)
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  if (!hasArabic) {
    return { isValid: false, errorMsg: "النص لا يحتوي على حروف عربية" };
  }

  // Detect emotional intensity indicators
  const emotionalIntensityWords = [
    "جداً", "كتير", "شديد", "قوي", "ضعيف", "هائل", "رهيب", "ممتاز", "سيء", "فظيع"
  ];
  
  const hasIntensity = emotionalIntensityWords.some(word => 
    text.toLowerCase().includes(word.toLowerCase())
  );
  
  const emotionContext = hasIntensity ? "نص يحتوي على مؤشرات عاطفية قوية" : "نص بمستوى عاطفي معتدل";
  
  return { isValid: true, errorMsg: "", emotionContext };
}

// Enhanced Jordanian dialect detection with emotion markers
function detectJordanianDialect(text: string): { 
  isJordanian: boolean; 
  confidence: number; 
  indicators: string[];
  emotionalMarkers: string[];
} {
  // Extended Jordanian terms with emotional context
  const jordanianTerms = [
    "زلمة", "يا زلمة", "خرفنة", "تسليك", "احشش", "انكب", "راعي", "هسا", "شو", "كيفك",
    "إربد", "عمان", "الزرقاء", "العقبة", "مطربين الأردن", "منتخب", "واللهي", "عال", "بدك", "مش عارف",
    "تمام", "فش", "عالسريع", "يا رجال", "يلا", "خلص", "دبس", "بسطة", "زَيّ الفل",
    "جاي", "روح", "حياتي", "عن جد", "بكفي", "ما بدي", "طيب", "قديش", "وينك",
    "عالطول", "شايف", "هسه", "بتعرف", "بس", "يعني", "كتير", "شوي", "حبتين",
    "منيح", "بدأيش", "بطل", "خبرني", "ولك", "يا عمي", "مفكر", "بفكر", "زفت", "روعة"
  ];

  // Emotional markers in Jordanian dialect
  const emotionalMarkers = [
    "واللهي", "يا رب", "حرام", "حبيبي", "يا زلمة", "عن جد", "يا عمي", 
    "يا حياتي", "يا رجال", "بتجنن", "روعة", "زفت", "فظيع"
  ];

  // Enhanced Jordanian patterns with emotional context
  const jordanianPatterns = [
    /\b(شو|كيف|وين|بدك|مش|هسا|هسه|منيح)\b/gi,
    /\b(يا\s*(زلمة|رجال|حياتي|عمي|حبيبي))\b/gi,
    /\b(عال|فش|كتير|شوي|زَيّ)\b/gi,
    /\b(بدأيش|بطل|خبرني|زفت|روعة)\b/gi,
    /\b(واللهي|عن جد|تمام|بتجنن)\b/gi
  ];

  const textLower = text.toLowerCase();
  let foundTerms: string[] = [];
  let foundEmotionalMarkers: string[] = [];
  let score = 0;
  const totalWords = text.split(/\s+/).length;

  // Check for Jordanian terms with weighted scoring
  jordanianTerms.forEach(term => {
    if (textLower.includes(term.toLowerCase())) {
      foundTerms.push(term);
      // Weight common emotional terms higher
      const weight = ["شو", "كيفك", "بدك", "مش", "هسا", "تمام", "واللهي", "عن جد"].includes(term) ? 2 : 1;
      score += weight;
    }
  });

  // Check for emotional markers
  emotionalMarkers.forEach(marker => {
    if (textLower.includes(marker.toLowerCase())) {
      foundEmotionalMarkers.push(marker);
      score += 1.5; // Emotional markers get higher weight
    }
  });

  // Check for Jordanian patterns
  jordanianPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      foundTerms.push(...matches);
      score += matches.length * 1.5;
    }
  });

  // Calculate confidence with emotional context
  const wordDensityScore = (score / Math.max(totalWords * 0.15, 1)) * 100;
  const absoluteMatchScore = Math.min((foundTerms.length / 3) * 100, 100);
  const emotionalBonus = foundEmotionalMarkers.length * 10; // Bonus for emotional markers
  
  const confidence = Math.min(Math.max(wordDensityScore, absoluteMatchScore) + emotionalBonus, 100);
  const isJordanian = confidence > 20;

  return {
    isJordanian,
    confidence: Math.round(confidence),
    indicators: [...new Set(foundTerms)].slice(0, 12),
    emotionalMarkers: [...new Set(foundEmotionalMarkers)]
  };
}

// Enhanced Arabic text preprocessing with emotion preservation
function preprocessArabicText(text: string): { processed: string; emotionalContext: string[] } {
  const emotionalPunctuation = ['!', '؟', '!!', '!!!', '؟؟', '😊', '😞', '😍', '😡'];
  const foundEmotions = emotionalPunctuation.filter(punct => text.includes(punct));
  
  const processed = text
    // Normalize Arabic letters
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    // Remove diacritics but preserve emotional punctuation
    .replace(/[\u064B-\u0652]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();

  return {
    processed,
    emotionalContext: foundEmotions
  };
}

// Enhanced emotion and sentiment analysis
function analyzeEmotionAndSentiment(hfResult: any, originalText: string): {
  sentiment: string;
  emotion: string;
  confidence: number;
  positive_prob: number;
  negative_prob: number;
  emotional_intensity: number;
  emotion_details: any;
} {
  let sentiment = "neutral";
  let emotion = "محايد";
  let confidence = 0.5;
  let positive_prob = 0.5;
  let negative_prob = 0.5;
  let emotional_intensity = 0.5;

  try {
    // Handle different HuggingFace response formats
    let scores: any[] = [];
    
    if (Array.isArray(hfResult)) {
      scores = Array.isArray(hfResult[0]) ? hfResult[0] : hfResult;
    } else if (hfResult.scores && Array.isArray(hfResult.scores)) {
      scores = hfResult.scores;
    }

    if (!Array.isArray(scores) || scores.length === 0) {
      throw new Error("Invalid scores format");
    }

    // Enhanced emotion detection based on text content and model scores
    const emotionKeywords = {
      'سعادة': ['سعيد', 'فرح', 'مبسوط', 'رائع', 'ممتاز', 'تمام', 'منيح'],
      'غضب': ['غضبان', 'زعلان', 'زفت', 'بطل', 'مش طايق', 'فظيع'],
      'حزن': ['حزين', 'زعلان', 'مكسور', 'متضايق', 'مش منيح'],
      'خوف': ['خايف', 'قلقان', 'متوتر', 'خوف'],
      'تفاؤل': ['إن شاء الله', 'ربنا يعين', 'الله يوفق', 'بإذن الله'],
      'استياء': ['مش راضي', 'مستاء', 'مضايق', 'بكفي']
    };

    // Detect emotion from text content
    let detectedEmotion = 'محايد';
    let maxEmotionScore = 0;
    
    for (const [emotionType, keywords] of Object.entries(emotionKeywords)) {
      const emotionScore = keywords.reduce((score, keyword) => {
        return score + (originalText.toLowerCase().includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);
      
      if (emotionScore > maxEmotionScore) {
        maxEmotionScore = emotionScore;
        detectedEmotion = emotionType;
      }
    }

    // Calculate emotional intensity based on exclamation marks, capitals, and repetition
    const exclamationCount = (originalText.match(/!/g) || []).length;
    const questionCount = (originalText.match(/؟/g) || []).length;
    const capsRatio = (originalText.match(/[A-Z]/g) || []).length / originalText.length;
    
    emotional_intensity = Math.min((exclamationCount * 0.2 + questionCount * 0.1 + capsRatio + maxEmotionScore * 0.3), 1);

    // Process sentiment scores
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

    // Assign probabilities
    if (positiveScore && negativeScore) {
      positive_prob = positiveScore.score;
      negative_prob = negativeScore.score;
    } else if (scores.length >= 2) {
      negative_prob = scores[0].score || 0.5;
      positive_prob = scores[1].score || 0.5;
    }

    // Ensure probabilities are valid
    if (!isFinite(positive_prob) || positive_prob < 0 || positive_prob > 1) {
      positive_prob = 0.5;
    }
    if (!isFinite(negative_prob) || negative_prob < 0 || negative_prob > 1) {
      negative_prob = 0.5;
    }

    // Normalize probabilities
    const total = positive_prob + negative_prob;
    if (total > 0) {
      positive_prob = positive_prob / total;
      negative_prob = negative_prob / total;
    }

    // Determine sentiment
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

    emotion = detectedEmotion;

  } catch (e) {
    console.error("Error in emotion analysis:", e);
    // Fallback values
    sentiment = "neutral";
    emotion = "محايد";
    confidence = 0.5;
    positive_prob = 0.5;
    negative_prob = 0.5;
    emotional_intensity = 0.5;
  }

  return {
    sentiment,
    emotion,
    confidence: Math.round(confidence * 10000) / 10000,
    positive_prob: Math.round(positive_prob * 10000) / 10000,
    negative_prob: Math.round(negative_prob * 10000) / 10000,
    emotional_intensity: Math.round(emotional_intensity * 10000) / 10000,
    emotion_details: {
      detected_emotion: emotion,
      intensity_level: emotional_intensity > 0.7 ? 'عالي' : emotional_intensity > 0.4 ? 'متوسط' : 'منخفض'
    }
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

    // Enhanced text validation with emotion context
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

    console.log('Processing text for emotion analysis:', text);

    // Enhanced Arabic text preprocessing
    const preprocessResult = preprocessArabicText(text);
    console.log('Preprocessed text:', preprocessResult.processed);
    console.log('Emotional context found:', preprocessResult.emotionalContext);

    // Call enhanced Hugging Face endpoint
    const response = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        inputs: preprocessResult.processed,
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
    console.log('HuggingFace emotion analysis result:', JSON.stringify(hfResult, null, 2));

    // Enhanced emotion and sentiment analysis
    const emotionResult = analyzeEmotionAndSentiment(hfResult, text);

    // Enhanced dialect detection with emotional markers
    const dialectResult = detectJordanianDialect(text);

    const result = {
      sentiment: emotionResult.sentiment,
      emotion: emotionResult.emotion,
      confidence: emotionResult.confidence,
      positive_prob: emotionResult.positive_prob,
      negative_prob: emotionResult.negative_prob,
      emotional_intensity: emotionResult.emotional_intensity,
      emotion_details: emotionResult.emotion_details,
      dialect: dialectResult.isJordanian ? 'Jordanian' : 'Non-Jordanian',
      dialect_confidence: dialectResult.confidence,
      dialect_indicators: dialectResult.indicators,
      emotional_markers: dialectResult.emotionalMarkers,
      emotional_context: preprocessResult.emotionalContext,
      validation_context: validation.emotionContext,
      modelSource: 'MARBERT_Enhanced_Emotion_Analysis',
      processed_text: preprocessResult.processed,
      validation: validation
    };

    console.log('Enhanced emotion analysis result:', result);

    return new Response(JSON.stringify(result), { headers: corsHeaders });

  } catch (error) {
    console.error("Enhanced emotion analysis function error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: error.message 
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
