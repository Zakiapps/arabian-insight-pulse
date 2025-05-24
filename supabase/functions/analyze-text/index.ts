
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { pipeline } from 'https://esm.sh/@huggingface/transformers@2.6.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Cache for model files
let modelPipeline: any = null;
let modelLoadError: string | null = null;

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

// Load AraBERT model from Supabase Storage
async function loadAraBERTModel(): Promise<any> {
  if (modelPipeline) return modelPipeline;
  if (modelLoadError) throw new Error(modelLoadError);

  try {
    console.log('Loading AraBERT model from Supabase Storage...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if model files exist in cache
    const modelPath = '/tmp/model';
    try {
      await Deno.stat(`${modelPath}/model.onnx`);
      console.log('Model files found in cache, loading...');
    } catch {
      console.log('Downloading model files from Supabase Storage...');
      await Deno.mkdir(modelPath, { recursive: true });
      
      // Download model files from private bucket
      const files = ['model.onnx', 'tokenizer.json', 'config.json', 'vocab.txt'];
      
      for (const fileName of files) {
        console.log(`Downloading ${fileName}...`);
        const { data, error } = await supabase.storage
          .from('model')
          .download(fileName);
        
        if (error) {
          throw new Error(`Failed to download ${fileName}: ${error.message}`);
        }
        
        if (!data) {
          throw new Error(`No data received for ${fileName}`);
        }
        
        // Write file to tmp directory
        const arrayBuffer = await data.arrayBuffer();
        await Deno.writeFile(`${modelPath}/${fileName}`, new Uint8Array(arrayBuffer));
        console.log(`Downloaded ${fileName} (${arrayBuffer.byteLength} bytes)`);
      }
    }
    
    // Initialize the text classification pipeline with the downloaded model
    console.log('Initializing AraBERT pipeline...');
    modelPipeline = await pipeline(
      'text-classification',
      modelPath,
      {
        device: 'cpu',
        model_file_name: 'model.onnx',
        config_file_name: 'config.json',
        tokenizer_file_name: 'tokenizer.json'
      }
    );
    
    console.log('AraBERT model loaded successfully');
    return modelPipeline;
    
  } catch (error) {
    console.error('Failed to load AraBERT model:', error);
    modelLoadError = error.message;
    throw error;
  }
}

// Enhanced keyword-based analysis fallback
function performKeywordAnalysis(text: string) {
  const positiveKeywords = [
    'جيد', 'رائع', 'ممتاز', 'سعيد', 'أحب', 'جميل', 'مفيد', 'إيجابي', 'تمام', 'عال',
    'حلو', 'زين', 'كويس', 'بحبك', 'فرحان', 'مبسوط', 'حبيبي', 'حياتي', 'شكراً'
  ];
  
  const negativeKeywords = [
    'سيء', 'فظيع', 'أكره', 'حزين', 'غاضب', 'مؤلم', 'سلبي', 'مشكلة', 'زعلان',
    'تعبان', 'مضايق', 'بطال', 'وسخ', 'خراب', 'مش كويس', 'بدي أموت', 'زهقان'
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

    let analysisResult;

    try {
      // Attempt to load and use AraBERT model
      console.log('Attempting to load AraBERT model...');
      const classifier = await loadAraBERTModel();
      
      // Perform sentiment analysis with AraBERT
      console.log('Running AraBERT inference...');
      const results = await classifier(preprocessedText, {
        max_length: 128,
        truncation: true
      });
      
      console.log('AraBERT results:', results);
      
      // Process results (assuming LABEL_0 = negative, LABEL_1 = positive)
      const result = Array.isArray(results) ? results[0] : results;
      
      const sentiment = result.label === 'LABEL_1' ? 'positive' : 'negative';
      const confidence = result.score;
      
      // Calculate probabilities for both classes
      let positiveProb, negativeProb;
      if (sentiment === 'positive') {
        positiveProb = confidence;
        negativeProb = 1 - confidence;
      } else {
        negativeProb = confidence;
        positiveProb = 1 - confidence;
      }
      
      analysisResult = {
        sentiment,
        confidence: Math.round(confidence * 10000) / 10000,
        positive_prob: Math.round(positiveProb * 10000) / 10000,
        negative_prob: Math.round(negativeProb * 10000) / 10000,
        modelSource: 'AraBERT_ONNX'
      };
      
      console.log('AraBERT analysis completed:', analysisResult);
      
    } catch (modelError) {
      console.error('AraBERT model error, falling back to keyword analysis:', modelError);
      
      // Fallback to enhanced keyword analysis
      analysisResult = performKeywordAnalysis(preprocessedText);
    }
    
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
