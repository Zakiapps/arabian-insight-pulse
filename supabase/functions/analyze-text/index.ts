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

// Enhanced text validation that accepts fallback content
function validateText(text: string): { 
  isValid: boolean; 
  errorMsg: string; 
  qualityScore: number; 
  contentType: string;
  details: any;
} {
  if (!text || text.trim().length < 3) {
    return { 
      isValid: false, 
      errorMsg: "النص فارغ أو قصير جداً", 
      qualityScore: 0, 
      contentType: 'empty',
      details: { reason: 'empty_text', length: text?.length || 0 }
    };
  }
  
  // Check for placeholder content but don't automatically reject
  const placeholderPatterns = [
    /ONLY AVAILABLE IN PAID PLANS/i,
    /upgrade to premium/i,
    /subscribe to read/i,
    /premium content/i,
    /paywall/i,
    /login to continue/i,
    /register to view/i
  ];
  
  const hasPlaceholder = placeholderPatterns.some(pattern => pattern.test(text));
  
  // If we detect placeholder content, check if there's still usable Arabic text
  if (hasPlaceholder) {
    // Extract non-placeholder parts
    const textParts = text.split(/ONLY AVAILABLE IN PAID PLANS|upgrade to premium|subscribe to read|premium content|paywall|login to continue|register to view/i);
    const usableText = textParts.join(' ').trim();
    
    if (usableText.length < 10) {
      return { 
        isValid: false, 
        errorMsg: "المحتوى محجوب بالكامل - لا يوجد نص قابل للتحليل", 
        qualityScore: 0, 
        contentType: 'completely_blocked',
        details: { reason: 'completely_blocked', usable_length: usableText.length }
      };
    }
    
    // Continue with validation using the usable text
    text = usableText;
  }
  
  // Check for Arabic characters (Unicode range 0x0600-0x06FF)
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  if (!hasArabic) {
    return { 
      isValid: false, 
      errorMsg: "النص لا يحتوي على حروف عربية", 
      qualityScore: 0, 
      contentType: 'non-arabic',
      details: { reason: 'no_arabic', language_detected: 'unknown' }
    };
  }

  // Calculate quality score with adjusted thresholds for fallback content
  let qualityScore = 0;
  const wordCount = text.split(/\s+/).length;
  const charCount = text.length;
  
  // Length scoring (more lenient for shorter content)
  if (wordCount > 100) qualityScore += 40;
  else if (wordCount > 50) qualityScore += 30;
  else if (wordCount > 20) qualityScore += 25;
  else if (wordCount > 10) qualityScore += 20;
  else if (wordCount > 5) qualityScore += 15;
  else qualityScore += 10;
  
  // Content structure scoring
  const sentences = text.split(/[.!؟]/).filter(s => s.trim().length > 0);
  if (sentences.length > 5) qualityScore += 25;
  else if (sentences.length > 2) qualityScore += 20;
  else if (sentences.length > 1) qualityScore += 15;
  else qualityScore += 10;
  
  // Arabic content density
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const arabicDensity = arabicChars / charCount;
  if (arabicDensity > 0.8) qualityScore += 20;
  else if (arabicDensity > 0.6) qualityScore += 15;
  else if (arabicDensity > 0.4) qualityScore += 10;
  else qualityScore += 5;
  
  // Meaningful content indicators
  const meaningfulWords = ['في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'التي', 'الذي', 'كان', 'تم', 'يتم', 'بعد', 'قبل'];
  const meaningfulCount = meaningfulWords.reduce((count, word) => 
    count + (text.toLowerCase().includes(word) ? 1 : 0), 0);
  qualityScore += Math.min(meaningfulCount, 15);
  
  // Determine content type
  let contentType = 'short';
  if (hasPlaceholder && qualityScore > 30) contentType = 'fallback_good';
  else if (hasPlaceholder) contentType = 'fallback_limited';
  else if (wordCount > 100 && qualityScore > 70) contentType = 'excellent';
  else if (wordCount > 50 && qualityScore > 50) contentType = 'good';
  else if (wordCount > 20 && qualityScore > 30) contentType = 'fair';
  
  return { 
    isValid: true, // Accept for analysis if we have Arabic text
    errorMsg: "", 
    qualityScore: Math.min(qualityScore, 100),
    contentType,
    details: {
      word_count: wordCount,
      char_count: charCount,
      sentence_count: sentences.length,
      arabic_density: arabicDensity,
      meaningful_words_found: meaningfulCount,
      has_placeholder: hasPlaceholder
    }
  };
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

// Fixed emotion and sentiment analysis for single-score response
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
    console.log('Raw HF result structure:', JSON.stringify(hfResult, null, 2));

    // Handle different HuggingFace response formats
    let scores: any[] = [];
    
    if (Array.isArray(hfResult)) {
      scores = Array.isArray(hfResult[0]) ? hfResult[0] : hfResult;
    } else if (hfResult.scores && Array.isArray(hfResult.scores)) {
      scores = hfResult.scores;
    }

    console.log('Extracted scores:', scores);

    if (!Array.isArray(scores) || scores.length === 0) {
      throw new Error("Invalid scores format");
    }

    // Enhanced emotion detection based on text content and model scores
    const emotionKeywords = {
      'سعادة': ['سعيد', 'فرح', 'مبسوط', 'رائع', 'ممتاز', 'تمام', 'منيح', 'روعة'],
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
    const capsRatio = (originalText.match(/[A-Z]/g) || []).length;
    
    emotional_intensity = Math.min((exclamationCount * 0.2 + questionCount * 0.1 + capsRatio + maxEmotionScore * 0.3), 1);

    // Process sentiment scores - FIXED FOR SINGLE SCORE RESPONSE
    if (scores.length === 1) {
      // Single score response - assume LABEL_0 is negative, score represents negative probability
      const score = scores[0];
      console.log('Processing single score:', score);
      
      if (score.label === 'LABEL_0') {
        // LABEL_0 typically represents negative class
        negative_prob = score.score;
        positive_prob = 1 - score.score;
      } else if (score.label === 'LABEL_1') {
        // LABEL_1 typically represents positive class
        positive_prob = score.score;
        negative_prob = 1 - score.score;
      } else {
        // Unknown label, use score as negative probability
        negative_prob = score.score;
        positive_prob = 1 - score.score;
      }
    } else {
      // Multiple scores - use existing logic
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

      if (positiveScore && negativeScore) {
        positive_prob = positiveScore.score;
        negative_prob = negativeScore.score;
      } else if (scores.length >= 2) {
        negative_prob = scores[0].score || 0.5;
        positive_prob = scores[1].score || 0.5;
      }
    }

    // Ensure probabilities are valid
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

    console.log('Final probabilities:', { positive_prob, negative_prob });

    // Determine sentiment based on probabilities
    const diff = Math.abs(positive_prob - negative_prob);
    if (diff < 0.1) {
      // Very close probabilities - neutral
      sentiment = 'neutral';
      confidence = 0.5;
    } else if (positive_prob > negative_prob) {
      sentiment = 'positive';
      confidence = positive_prob;
    } else {
      sentiment = 'negative';
      confidence = negative_prob;
    }

    emotion = detectedEmotion;

    console.log('Final analysis result:', { sentiment, confidence, positive_prob, negative_prob });

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

    console.log('Processing text for enhanced analysis:', text.substring(0, 100) + '...');

    // Enhanced text validation that accepts fallback content
    const validation = validateText(text);
    if (!validation.isValid) {
      return new Response(JSON.stringify({ 
        error: "Text validation failed", 
        details: validation.errorMsg,
        quality_score: validation.qualityScore,
        content_type: validation.contentType,
        validation_details: validation.details
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

    console.log(`Content quality score: ${validation.qualityScore}%, type: ${validation.contentType}`);

    // Enhanced Arabic text preprocessing
    const preprocessResult = preprocessArabicText(text);
    console.log('Preprocessed text:', preprocessResult.processed.substring(0, 100) + '...');

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
    console.log('HuggingFace enhanced analysis result:', JSON.stringify(hfResult, null, 2));

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
      content_quality: {
        score: validation.qualityScore,
        type: validation.contentType,
        details: validation.details
      },
      modelSource: 'MARBERT_Enhanced_Analysis',
      processed_text: preprocessResult.processed,
      validation: validation,
      analysis_metadata: {
        api_version: '2.0',
        enhanced_features: true,
        processing_time: new Date().toISOString()
      }
    };

    console.log('Enhanced analysis result completed:', {
      sentiment: result.sentiment,
      quality_score: validation.qualityScore,
      content_type: validation.contentType
    });

    return new Response(JSON.stringify(result), { headers: corsHeaders });

  } catch (error) {
    console.error("Enhanced analysis function error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: error.message 
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
