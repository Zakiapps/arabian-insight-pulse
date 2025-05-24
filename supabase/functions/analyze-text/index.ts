
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for accessing storage
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Lightweight cache for essential model data only
let modelCache: {
  vocab?: Map<string, number>;
  specialTokens?: any;
  clsTokenId?: number;
  sepTokenId?: number;
  padTokenId?: number;
  unkTokenId?: number;
  modelLoaded?: boolean;
} = {};

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

// Load essential tokenizer components only (not the full model)
async function loadTokenizerComponents() {
  try {
    if (modelCache.vocab && modelCache.specialTokens) {
      console.log('Tokenizer components already loaded');
      return true;
    }

    console.log('Loading essential tokenizer components from private-model bucket...');
    
    // Load vocab.txt first (essential for tokenization)
    if (!modelCache.vocab) {
      const { data: vocabData, error: vocabError } = await supabase.storage
        .from('private-model')
        .download('vocab.txt');
      
      if (vocabError || !vocabData) {
        throw new Error(`Failed to load vocab: ${vocabError?.message}`);
      }
      
      const vocabText = await vocabData.text();
      const vocabLines = vocabText.split('\n').filter(line => line.trim());
      modelCache.vocab = new Map();
      
      vocabLines.forEach((token, index) => {
        modelCache.vocab!.set(token.trim(), index);
      });
      
      console.log('Vocab loaded, size:', modelCache.vocab.size);
    }
    
    // Load special_tokens_map.json
    if (!modelCache.specialTokens) {
      const { data: specialData, error: specialError } = await supabase.storage
        .from('private-model')
        .download('special_tokens_map.json');
      
      if (specialError || !specialData) {
        throw new Error(`Failed to load special tokens: ${specialError?.message}`);
      }
      
      modelCache.specialTokens = JSON.parse(await specialData.text());
      
      // Pre-calculate token IDs
      const clsToken = modelCache.specialTokens?.cls_token || '[CLS]';
      const sepToken = modelCache.specialTokens?.sep_token || '[SEP]';
      const padToken = modelCache.specialTokens?.pad_token || '[PAD]';
      const unkToken = modelCache.specialTokens?.unk_token || '[UNK]';
      
      modelCache.clsTokenId = modelCache.vocab!.get(clsToken) || modelCache.vocab!.get('[CLS]') || 101;
      modelCache.sepTokenId = modelCache.vocab!.get(sepToken) || modelCache.vocab!.get('[SEP]') || 102;
      modelCache.padTokenId = modelCache.vocab!.get(padToken) || modelCache.vocab!.get('[PAD]') || 0;
      modelCache.unkTokenId = modelCache.vocab!.get(unkToken) || modelCache.vocab!.get('[UNK]') || 100;
      
      console.log('Special tokens loaded and token IDs calculated');
    }
    
    return true;
  } catch (error) {
    console.error('Error loading tokenizer components:', error);
    return false;
  }
}

// Optimized tokenization using loaded tokenizer data
function tokenizeText(text: string, maxLength: number = 128): number[] {
  try {
    const { vocab, clsTokenId, sepTokenId, padTokenId, unkTokenId } = modelCache;
    
    if (!vocab || !clsTokenId || !sepTokenId || !padTokenId || !unkTokenId) {
      throw new Error('Tokenizer components not loaded');
    }
    
    console.log('Starting tokenization for text:', text.substring(0, 50) + '...');
    
    // Preprocess the text
    const preprocessed = preprocessArabicText(text);
    
    // Start with [CLS] token
    const tokens: number[] = [clsTokenId];
    
    // Simple word-level tokenization
    const words = preprocessed.split(/\s+/);
    
    for (const word of words) {
      if (tokens.length >= maxLength - 1) break; // Reserve space for [SEP]
      
      // Try exact word match first
      if (vocab.has(word)) {
        tokens.push(vocab.get(word)!);
        continue;
      }
      
      // Try with ## prefix for subword tokens
      const subwordToken = `##${word}`;
      if (vocab.has(subwordToken)) {
        tokens.push(vocab.get(subwordToken)!);
        continue;
      }
      
      // Character-level fallback for Arabic text
      const chars = Array.from(word);
      for (const char of chars) {
        if (tokens.length >= maxLength - 1) break;
        
        if (vocab.has(char)) {
          tokens.push(vocab.get(char)!);
        } else if (vocab.has(`##${char}`)) {
          tokens.push(vocab.get(`##${char}`)!);
        } else {
          tokens.push(unkTokenId);
        }
      }
    }
    
    // Add [SEP] token
    if (tokens.length < maxLength) {
      tokens.push(sepTokenId);
    }
    
    // Pad to maxLength
    while (tokens.length < maxLength) {
      tokens.push(padTokenId);
    }
    
    // Truncate if too long
    if (tokens.length > maxLength) {
      tokens.splice(maxLength - 1, tokens.length - maxLength, sepTokenId);
    }
    
    console.log('Tokenized sequence length:', tokens.length);
    console.log('First 10 tokens:', tokens.slice(0, 10));
    
    return tokens;
  } catch (error) {
    console.error('Tokenization error:', error);
    // Fallback tokenization
    return createFallbackTokenization(text, 128);
  }
}

// Fallback tokenization
function createFallbackTokenization(text: string, maxLength: number): number[] {
  const clsId = 101;
  const sepId = 102;
  const padId = 0;
  
  const tokens = [clsId];
  const chars = text.split('').slice(0, maxLength - 2);
  
  chars.forEach(char => {
    tokens.push(char.charCodeAt(0) % 30000 + 1);
  });
  
  tokens.push(sepId);
  
  while (tokens.length < maxLength) {
    tokens.push(padId);
  }
  
  return tokens.slice(0, maxLength);
}

// Real ONNX Runtime inference with memory optimization
async function runONNXInference(inputIds: number[]): Promise<{ sentiment: string; confidence: number; positive_prob: number; negative_prob: number }> {
  try {
    console.log('Starting ONNX inference...');
    
    // Load model on-demand to save memory
    const { data: modelData, error: modelError } = await supabase.storage
      .from('private-model')
      .download('model.onnx');
    
    if (modelError || !modelData) {
      throw new Error(`Failed to load model: ${modelError?.message}`);
    }
    
    const modelBuffer = await modelData.arrayBuffer();
    console.log('Model loaded, size:', modelBuffer.byteLength);
    
    // Import ONNX Runtime Web
    const ort = await import('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/ort.min.js');
    
    // Create session from the loaded model buffer
    const session = await ort.InferenceSession.create(modelBuffer);
    console.log('ONNX session created successfully');
    console.log('Model input names:', session.inputNames);
    console.log('Model output names:', session.outputNames);
    
    // Prepare input tensors
    const inputTensor = new ort.Tensor('int64', BigInt64Array.from(inputIds.map(x => BigInt(x))), [1, inputIds.length]);
    const attentionMask = new ort.Tensor('int64', BigInt64Array.from(inputIds.map(x => x > 0 ? BigInt(1) : BigInt(0))), [1, inputIds.length]);
    
    console.log('Input tensor shape:', inputTensor.dims);
    console.log('Attention mask shape:', attentionMask.dims);
    
    // Prepare feeds object based on model's expected inputs
    const feeds: Record<string, any> = {};
    
    // Try common input names
    if (session.inputNames.includes('input_ids')) {
      feeds['input_ids'] = inputTensor;
    } else if (session.inputNames.includes('inputs')) {
      feeds['inputs'] = inputTensor;
    } else {
      feeds[session.inputNames[0]] = inputTensor;
    }
    
    if (session.inputNames.includes('attention_mask')) {
      feeds['attention_mask'] = attentionMask;
    }
    
    console.log('Running inference with feeds:', Object.keys(feeds));
    
    // Run inference
    const results = await session.run(feeds);
    console.log('Inference completed, output keys:', Object.keys(results));
    
    // Extract logits from output
    const logits = results['logits'] || results['output'] || results[session.outputNames[0]];
    
    if (!logits) {
      throw new Error('No logits found in model output');
    }
    
    const logitsData = logits.data as Float32Array;
    console.log('Raw logits:', Array.from(logitsData));
    
    // Apply softmax to get probabilities
    // Assuming binary classification: index 0 = negative, index 1 = positive
    const negative_logit = logitsData[0];
    const positive_logit = logitsData[1];
    
    const max_logit = Math.max(negative_logit, positive_logit);
    const exp_neg = Math.exp(negative_logit - max_logit);
    const exp_pos = Math.exp(positive_logit - max_logit);
    const sum_exp = exp_neg + exp_pos;
    
    const negative_prob = exp_neg / sum_exp;
    const positive_prob = exp_pos / sum_exp;
    
    const sentiment = positive_prob > negative_prob ? 'positive' : 'negative';
    const confidence = Math.max(positive_prob, negative_prob);
    
    console.log('ONNX Results:', { sentiment, confidence, positive_prob, negative_prob });
    
    // Clear model from memory immediately
    session.release();
    
    return {
      sentiment,
      confidence: Math.round(confidence * 10000) / 10000,
      positive_prob: Math.round(positive_prob * 10000) / 10000,
      negative_prob: Math.round(negative_prob * 10000) / 10000
    };
    
  } catch (error) {
    console.error('ONNX inference error:', error);
    throw error;
  }
}

// Enhanced keyword-based analysis (fallback)
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
  
  const totalScore = positiveScore + negativeScore;
  let sentiment: string;
  let confidence: number;
  let positiveProb: number;
  let negativeProb: number;
  
  if (totalScore === 0) {
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
      // Load essential tokenizer components only
      const tokenizerLoaded = await loadTokenizerComponents();
      
      if (!tokenizerLoaded) {
        throw new Error('Failed to load tokenizer components');
      }
      
      console.log('Tokenizer components loaded successfully');
      
      // Tokenize the text
      const tokenIds = tokenizeText(preprocessedText, 128);
      console.log('Tokenization completed');
      
      // Run real ONNX inference
      const onnxResult = await runONNXInference(tokenIds);
      
      analysisResult = {
        ...onnxResult,
        modelSource: 'AraBERT_ONNX'
      };
      
      console.log('AraBERT ONNX analysis successful');
    } catch (modelError) {
      console.error('AraBERT ONNX model failed, falling back to keyword analysis:', modelError);
      // Fallback to keyword analysis
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
