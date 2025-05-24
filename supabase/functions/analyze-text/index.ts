
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Minimal memory cache - only store essential data
let tokenCache: {
  vocab?: Map<string, number>;
  clsTokenId?: number;
  sepTokenId?: number;
  padTokenId?: number;
  unkTokenId?: number;
  loaded?: boolean;
} = {};

// Advanced Arabic text preprocessing
function preprocessArabicText(text: string): string {
  // Remove diacritics and normalize in one pass
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ي/g, 'ى')
    .replace(/\s+/g, ' ')
    .trim();
}

// Optimized Jordanian dialect detection with early return
function detectJordanianDialect(text: string): string {
  const quickTerms = ['زلمة', 'هسا', 'شو', 'بدك', 'يلا', 'تمام'];
  
  // Quick check first
  for (const term of quickTerms) {
    if (text.includes(term)) return 'Jordanian';
  }
  
  // Pattern check only if quick terms not found
  if (/\b(شو|كيف|وين|بدك|مش|هسا|هسه)\b/.test(text)) {
    return 'Jordanian';
  }
  
  return 'Non-Jordanian';
}

// Validate Arabic text efficiently
function validateArabicText(text: string): boolean {
  return text && text.length >= 3 && /[\u0600-\u06FF]/.test(text);
}

// Memory-efficient vocab loader with streaming
async function loadVocabEfficiently() {
  if (tokenCache.vocab && tokenCache.loaded) {
    return true;
  }

  try {
    console.log('Loading vocab with memory optimization...');
    
    const { data: vocabData, error } = await supabase.storage
      .from('private-model')
      .download('vocab.txt');
    
    if (error || !vocabData) {
      throw new Error(`Vocab load failed: ${error?.message}`);
    }
    
    // Stream processing to avoid memory spikes
    const vocabText = await vocabData.text();
    const lines = vocabText.split('\n');
    
    // Pre-allocate Map with estimated size
    tokenCache.vocab = new Map(lines.length);
    
    // Process in chunks to prevent memory spikes
    const chunkSize = 1000;
    for (let i = 0; i < lines.length; i += chunkSize) {
      const chunk = lines.slice(i, i + chunkSize);
      chunk.forEach((token, idx) => {
        const trimmed = token.trim();
        if (trimmed) {
          tokenCache.vocab!.set(trimmed, i + idx);
        }
      });
      
      // Allow garbage collection between chunks
      if (i % 5000 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    // Set special token IDs
    tokenCache.clsTokenId = tokenCache.vocab.get('[CLS]') || 101;
    tokenCache.sepTokenId = tokenCache.vocab.get('[SEP]') || 102;
    tokenCache.padTokenId = tokenCache.vocab.get('[PAD]') || 0;
    tokenCache.unkTokenId = tokenCache.vocab.get('[UNK]') || 100;
    tokenCache.loaded = true;
    
    console.log(`Vocab loaded: ${tokenCache.vocab.size} tokens`);
    return true;
    
  } catch (error) {
    console.error('Vocab loading error:', error);
    return false;
  }
}

// Highly optimized tokenization
function tokenizeTextFast(text: string, maxLength: number = 128): number[] {
  const { vocab, clsTokenId, sepTokenId, padTokenId, unkTokenId } = tokenCache;
  
  if (!vocab) {
    return createFallbackTokenization(text, maxLength);
  }
  
  const tokens = [clsTokenId!];
  const words = text.split(/\s+/);
  
  for (const word of words) {
    if (tokens.length >= maxLength - 1) break;
    
    // Direct lookup first
    const tokenId = vocab.get(word) || vocab.get(`##${word}`) || unkTokenId!;
    tokens.push(tokenId);
  }
  
  // Add SEP and pad efficiently
  tokens.push(sepTokenId!);
  while (tokens.length < maxLength) {
    tokens.push(padTokenId!);
  }
  
  return tokens.slice(0, maxLength);
}

// Fallback tokenization
function createFallbackTokenization(text: string, maxLength: number): number[] {
  const tokens = [101]; // CLS
  const chars = Array.from(text.substring(0, maxLength - 2));
  
  chars.forEach(char => {
    tokens.push((char.charCodeAt(0) % 30000) + 1);
  });
  
  tokens.push(102); // SEP
  while (tokens.length < maxLength) tokens.push(0);
  
  return tokens.slice(0, maxLength);
}

// Memory-optimized ONNX inference with cleanup
async function runOptimizedONNXInference(inputIds: number[]): Promise<{
  sentiment: string;
  confidence: number;
  positive_prob: number;
  negative_prob: number;
}> {
  let session: any = null;
  
  try {
    console.log('Starting optimized ONNX inference...');
    
    // Load model with stream processing
    const { data: modelData, error } = await supabase.storage
      .from('private-model')
      .download('model.onnx');
    
    if (error || !modelData) {
      throw new Error(`Model load failed: ${error?.message}`);
    }
    
    const modelBuffer = await modelData.arrayBuffer();
    console.log(`Model loaded: ${(modelBuffer.byteLength / 1024 / 1024).toFixed(2)}MB`);
    
    // Import ONNX with memory optimization
    const ort = await import('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/ort.min.js');
    
    // Configure session with memory limits
    const sessionOptions = {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
      enableMemPattern: false,
      enableCpuMemArena: false,
    };
    
    session = await ort.InferenceSession.create(modelBuffer, sessionOptions);
    
    // Create tensors efficiently
    const inputTensor = new ort.Tensor('int64', 
      BigInt64Array.from(inputIds.map(x => BigInt(x))), 
      [1, inputIds.length]
    );
    
    const attentionMask = new ort.Tensor('int64',
      BigInt64Array.from(inputIds.map(x => x > 0 ? BigInt(1) : BigInt(0))),
      [1, inputIds.length]
    );
    
    // Prepare feeds based on model inputs
    const feeds: Record<string, any> = {};
    const inputNames = session.inputNames;
    
    if (inputNames.includes('input_ids')) {
      feeds['input_ids'] = inputTensor;
    } else {
      feeds[inputNames[0]] = inputTensor;
    }
    
    if (inputNames.includes('attention_mask')) {
      feeds['attention_mask'] = attentionMask;
    }
    
    console.log('Running inference...');
    const results = await session.run(feeds);
    
    // Extract results efficiently
    const outputKey = Object.keys(results)[0];
    const logits = results[outputKey];
    const logitsData = logits.data as Float32Array;
    
    // Calculate probabilities with numerical stability
    const [neg_logit, pos_logit] = [logitsData[0], logitsData[1]];
    const max_logit = Math.max(neg_logit, pos_logit);
    const exp_neg = Math.exp(neg_logit - max_logit);
    const exp_pos = Math.exp(pos_logit - max_logit);
    const sum_exp = exp_neg + exp_pos;
    
    const negative_prob = exp_neg / sum_exp;
    const positive_prob = exp_pos / sum_exp;
    const sentiment = positive_prob > negative_prob ? 'positive' : 'negative';
    const confidence = Math.max(positive_prob, negative_prob);
    
    return {
      sentiment,
      confidence: Math.round(confidence * 10000) / 10000,
      positive_prob: Math.round(positive_prob * 10000) / 10000,
      negative_prob: Math.round(negative_prob * 10000) / 10000
    };
    
  } catch (error) {
    console.error('ONNX inference error:', error);
    throw error;
  } finally {
    // Critical: Always cleanup session
    if (session) {
      try {
        session.release();
        console.log('Session cleaned up');
      } catch (e) {
        console.error('Session cleanup error:', e);
      }
    }
    
    // Force garbage collection
    if (globalThis.gc) {
      globalThis.gc();
    }
  }
}

// Enhanced keyword analysis with optimized scoring
function performEnhancedKeywordAnalysis(text: string) {
  const positiveTerms = ['جيد', 'رائع', 'ممتاز', 'سعيد', 'أحب', 'جميل', 'تمام', 'عال', 'حلو', 'كويس'];
  const negativeTerms = ['سيء', 'فظيع', 'أكره', 'حزين', 'غاضب', 'بطال', 'وسخ', 'مش كويس', 'زعلان'];
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  // Optimized single-pass scoring
  for (const term of positiveTerms) {
    if (text.includes(term)) positiveScore++;
  }
  for (const term of negativeTerms) {
    if (text.includes(term)) negativeScore++;
  }
  
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
  } else if (positiveScore > negativeScore) {
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
  
  return {
    sentiment,
    confidence: Math.round(confidence * 10000) / 10000,
    positive_prob: Math.round(positiveProb * 10000) / 10000,
    negative_prob: Math.round(negativeProb * 10000) / 10000,
    modelSource: 'enhanced_keyword_analysis'
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    console.log('Processing text:', text?.substring(0, 50) + '...');

    // Quick validation
    if (!validateArabicText(text)) {
      return new Response(
        JSON.stringify({ error: 'Text is empty, too short, or not Arabic' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Preprocess text
    const preprocessedText = preprocessArabicText(text);
    console.log('Text preprocessed');

    let analysisResult;

    try {
      // Load vocab efficiently
      const vocabLoaded = await loadVocabEfficiently();
      
      if (!vocabLoaded) {
        throw new Error('Vocab loading failed');
      }
      
      // Fast tokenization
      const tokenIds = tokenizeTextFast(preprocessedText, 128);
      console.log('Tokenization completed');
      
      // Run optimized ONNX inference
      const onnxResult = await runOptimizedONNXInference(tokenIds);
      
      analysisResult = {
        ...onnxResult,
        modelSource: 'AraBERT_ONNX'
      };
      
      console.log('ONNX analysis successful');
      
    } catch (modelError) {
      console.error('ONNX failed, using fallback:', modelError);
      analysisResult = performEnhancedKeywordAnalysis(preprocessedText);
    }
    
    // Detect dialect efficiently
    const dialect = detectJordanianDialect(preprocessedText);
    
    const finalResult = {
      ...analysisResult,
      dialect
    };
    
    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify(finalResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
