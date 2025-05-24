
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Arabic text preprocessing function
function preprocessArabicText(text: string): string {
  // Remove diacritics (Arabic diacritical marks)
  text = text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
  
  // Normalize Arabic characters
  text = text.replace(/[أإآ]/g, 'ا'); // Normalize alef variations
  text = text.replace(/ة/g, 'ه'); // Normalize teh marbuta
  text = text.replace(/ي/g, 'ى'); // Normalize yeh variations
  
  // Remove extra spaces and trim
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// Jordanian dialect detection function
function detectJordanianDialect(text: string): string {
  const jordanianTerms = [
    'زلمة', 'يا زلمة', 'خرفنة', 'تسليك', 'احشش', 'انكب', 'راعي', 'هسا', 'شو', 'كيفك',
    'إربد', 'عمان', 'مطربين الأردن', 'منتخب', 'واللهي', 'عال', 'بدك', 'مش عارف',
    'تمام', 'فش', 'عالسريع', 'يا رجال', 'يلا', 'خلص', 'دبس', 'بسطة', 'جاي', 'روح',
    'حياتي', 'عن جد', 'بكفي', 'ما بدي', 'طيب', 'قديش', 'وينك', 'عالطول', 'شايف',
    'هسه', 'بتعرف', 'بس', 'يعني', 'كتير', 'شوي', 'حبتين'
  ];
  
  // Check for Jordanian terms
  for (const term of jordanianTerms) {
    if (text.includes(term)) {
      return 'Jordanian';
    }
  }
  
  // Check for patterns
  const patterns = [
    /\b(شو|كيف|وين|بدك|مش|هسا|هسه)\b/g,
    /\b(يا\s*(زلمة|رجال|حياتي))\b/g
  ];
  
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      return 'Jordanian';
    }
  }
  
  return 'Non-Jordanian';
}

// Validate Arabic text
function validateArabicText(text: string): boolean {
  if (!text || text.length < 3) return false;
  
  // Check if text contains Arabic characters (Unicode range 0x0600 to 0x06FF)
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text);
}

// Enhanced keyword-based analysis
function performKeywordAnalysis(text: string) {
  const positiveKeywords = [
    'جيد', 'رائع', 'ممتاز', 'سعيد', 'أحب', 'جميل', 'مفيد', 'إيجابي', 'تمام', 'عال',
    'حلو', 'زين', 'كويس', 'بحبك', 'فرحان', 'مبسوط', 'حبيبي', 'حياتي', 'شكراً',
    'ولا أحلى', 'يسلمو', 'بتجنن', 'حبايبي', 'ما شاء الله', 'الله يعطيك العافية'
  ];
  
  const negativeKeywords = [
    'سيء', 'فظيع', 'أكره', 'حزين', 'غاضب', 'مؤلم', 'سلبي', 'مشكلة', 'زعلان',
    'تعبان', 'مضايق', 'بطال', 'وسخ', 'خراب', 'مش كويس', 'بدي أموت', 'زهقان',
    'ما بطيق', 'بكره', 'مش عاجبني', 'وجع راس', 'بزهق', 'مش طبيعي'
  ];
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  const words = text.split(/\s+/);
  
  words.forEach(word => {
    if (positiveKeywords.some(keyword => word.includes(keyword))) {
      positiveScore++;
    }
    if (negativeKeywords.some(keyword => word.includes(keyword))) {
      negativeScore++;
    }
  });
  
  // Calculate sentiment and probabilities
  const totalScore = positiveScore + negativeScore;
  let sentiment: string;
  let confidence: number;
  let positiveProb: number;
  let negativeProb: number;
  
  if (totalScore === 0) {
    // Neutral case - default to slight positive bias
    sentiment = 'positive';
    confidence = 0.55;
    positiveProb = 0.55;
    negativeProb = 0.45;
  } else {
    if (positiveScore > negativeScore) {
      sentiment = 'positive';
      positiveProb = Math.min(0.95, 0.6 + (positiveScore / totalScore) * 0.35);
      negativeProb = 1 - positiveProb;
      confidence = positiveProb;
    } else {
      sentiment = 'negative';
      negativeProb = Math.min(0.95, 0.6 + (negativeScore / totalScore) * 0.35);
      positiveProb = 1 - negativeProb;
      confidence = negativeProb;
    }
  }
  
  return {
    sentiment,
    confidence: Math.round(confidence * 10000) / 10000,
    positive_prob: Math.round(positiveProb * 10000) / 10000,
    negative_prob: Math.round(negativeProb * 10000) / 10000,
    modelSource: 'enhanced_keyword_analysis'
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    console.log('Received text for analysis:', text);

    // Validate input
    if (!validateArabicText(text)) {
      return new Response(
        JSON.stringify({ error: 'Text is empty, too short, or not Arabic' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Preprocess the text
    const preprocessedText = preprocessArabicText(text);
    console.log('Preprocessed text:', preprocessedText);

    // Perform enhanced keyword analysis
    const analysisResult = performKeywordAnalysis(preprocessedText);
    
    // Detect Jordanian dialect
    const dialect = detectJordanianDialect(preprocessedText);
    
    const finalResult = {
      ...analysisResult,
      dialect
    };
    
    console.log('Final analysis result:', finalResult);

    return new Response(
      JSON.stringify(finalResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-text function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
