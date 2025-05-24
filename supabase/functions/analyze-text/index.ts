
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

// Global cache for model components
let modelCache: {
  vocab?: Map<string, number>;
  clsTokenId?: number;
  sepTokenId?: number;
  padTokenId?: number;
  unkTokenId?: number;
  tokenizerConfig?: any;
  specialTokensMap?: any;
  loaded?: boolean;
} = {};

// Advanced Arabic text preprocessing
function preprocessArabicText(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ي/g, 'ى')
    .replace(/\s+/g, ' ')
    .trim();
}

// Enhanced Jordanian dialect detection
function detectJordanianDialect(text: string): string {
  const jordanianPatterns = [
    /\b(زلمة|هسا|هسه|شو|بدك|يلا|تمام|خلاص|مش|ولا|هيك|مبين)\b/g,
    /\b(كيفك|وينك|شوفك|ايمتى|وين)\b/g,
    /\b(بحكي|بقول|بفكر|بشوف|بعرف)\b/g
  ];
  
  let matchCount = 0;
  for (const pattern of jordanianPatterns) {
    const matches = text.match(pattern);
    if (matches) matchCount += matches.length;
  }
  
  return matchCount >= 2 ? 'Jordanian' : 'Non-Jordanian';
}

// Validate Arabic text
function validateArabicText(text: string): boolean {
  return text && text.length >= 3 && /[\u0600-\u06FF]/.test(text);
}

// Load all model components
async function loadModelComponents() {
  if (modelCache.loaded) {
    return true;
  }

  try {
    console.log('Loading model components...');
    
    // Load vocab
    const { data: vocabData, error: vocabError } = await supabase.storage
      .from('private-model')
      .download('vocab.txt');
    
    if (vocabError || !vocabData) {
      throw new Error(`Vocab load failed: ${vocabError?.message}`);
    }
    
    const vocabText = await vocabData.text();
    const vocabLines = vocabText.split('\n').filter(line => line.trim());
    
    modelCache.vocab = new Map();
    vocabLines.forEach((token, index) => {
      modelCache.vocab!.set(token.trim(), index);
    });
    
    // Set special tokens
    modelCache.clsTokenId = modelCache.vocab.get('[CLS]') || 101;
    modelCache.sepTokenId = modelCache.vocab.get('[SEP]') || 102;
    modelCache.padTokenId = modelCache.vocab.get('[PAD]') || 0;
    modelCache.unkTokenId = modelCache.vocab.get('[UNK]') || 100;
    
    // Load tokenizer config
    try {
      const { data: tokenizerConfigData } = await supabase.storage
        .from('private-model')
        .download('tokenizer_config.json');
      
      if (tokenizerConfigData) {
        const configText = await tokenizerConfigData.text();
        modelCache.tokenizerConfig = JSON.parse(configText);
      }
    } catch (e) {
      console.warn('Could not load tokenizer config:', e);
    }
    
    // Load special tokens map
    try {
      const { data: specialTokensData } = await supabase.storage
        .from('private-model')
        .download('special_tokens_map.json');
      
      if (specialTokensData) {
        const specialTokensText = await specialTokensData.text();
        modelCache.specialTokensMap = JSON.parse(specialTokensText);
      }
    } catch (e) {
      console.warn('Could not load special tokens map:', e);
    }
    
    modelCache.loaded = true;
    console.log(`Model components loaded successfully. Vocab size: ${modelCache.vocab.size}`);
    return true;
    
  } catch (error) {
    console.error('Model loading error:', error);
    throw new Error('Failed to load model components');
  }
}

// Enhanced tokenization using AraBERT tokenizer
function tokenizeTextAraBERT(text: string, maxLength: number = 128): number[] {
  const { vocab, clsTokenId, sepTokenId, padTokenId, unkTokenId } = modelCache;
  
  if (!vocab) {
    throw new Error('Vocabulary not loaded');
  }
  
  const tokens = [clsTokenId!];
  
  // Simple word-level tokenization (can be enhanced with subword tokenization)
  const words = text.split(/\s+/);
  
  for (const word of words) {
    if (tokens.length >= maxLength - 1) break;
    
    // Try exact match first
    let tokenId = vocab.get(word);
    
    if (!tokenId) {
      // Try with ## prefix for subword
      tokenId = vocab.get(`##${word}`);
    }
    
    if (!tokenId) {
      // Try lowercase
      tokenId = vocab.get(word.toLowerCase());
    }
    
    if (!tokenId) {
      // Use UNK token
      tokenId = unkTokenId!;
    }
    
    tokens.push(tokenId);
  }
  
  // Add SEP token
  tokens.push(sepTokenId!);
  
  // Pad to max length
  while (tokens.length < maxLength) {
    tokens.push(padTokenId!);
  }
  
  return tokens.slice(0, maxLength);
}

// ONNX model inference
async function runONNXInference(inputIds: number[]): Promise<{
  sentiment: string;
  confidence: number;
  positive_prob: number;
  negative_prob: number;
}> {
  let session: any = null;
  
  try {
    console.log('Loading ONNX model...');
    
    const { data: modelData, error } = await supabase.storage
      .from('private-model')
      .download('model.onnx');
    
    if (error || !modelData) {
      throw new Error(`Model load failed: ${error?.message}`);
    }
    
    const modelBuffer = await modelData.arrayBuffer();
    console.log(`Model loaded: ${(modelBuffer.byteLength / 1024 / 1024).toFixed(2)}MB`);
    
    // Import ONNX Runtime
    const ort = await import('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/ort.min.js');
    
    // Create session with optimized settings
    const sessionOptions = {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
      enableMemPattern: false,
      enableCpuMemArena: false,
    };
    
    session = await ort.InferenceSession.create(modelBuffer, sessionOptions);
    console.log('ONNX session created successfully');
    
    // Prepare input tensors
    const inputTensor = new ort.Tensor('int64', 
      BigInt64Array.from(inputIds.map(x => BigInt(x))), 
      [1, inputIds.length]
    );
    
    const attentionMask = new ort.Tensor('int64',
      BigInt64Array.from(inputIds.map(x => x > 0 ? BigInt(1) : BigInt(0))),
      [1, inputIds.length]
    );
    
    // Prepare feeds
    const feeds: Record<string, any> = {};
    const inputNames = session.inputNames;
    
    feeds[inputNames[0]] = inputTensor;
    if (inputNames.length > 1) {
      feeds[inputNames[1]] = attentionMask;
    }
    
    console.log('Running ONNX inference...');
    const results = await session.run(feeds);
    
    // Extract results
    const outputKey = Object.keys(results)[0];
    const logits = results[outputKey];
    const logitsData = logits.data as Float32Array;
    
    // Calculate probabilities with softmax
    const [neg_logit, pos_logit] = [logitsData[0], logitsData[1]];
    const max_logit = Math.max(neg_logit, pos_logit);
    const exp_neg = Math.exp(neg_logit - max_logit);
    const exp_pos = Math.exp(pos_logit - max_logit);
    const sum_exp = exp_neg + exp_pos;
    
    const negative_prob = exp_neg / sum_exp;
    const positive_prob = exp_pos / sum_exp;
    const sentiment = positive_prob > negative_prob ? 'positive' : 'negative';
    const confidence = Math.max(positive_prob, negative_prob);
    
    console.log('ONNX inference completed successfully');
    
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
    if (session) {
      try {
        session.release();
        console.log('ONNX session released');
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

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    console.log('Processing text:', text?.substring(0, 50) + '...');

    // Validate input
    if (!validateArabicText(text)) {
      return new Response(
        JSON.stringify({ error: 'Text is empty, too short, or not Arabic' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Preprocess text
    const preprocessedText = preprocessArabicText(text);
    console.log('Text preprocessed');

    // Load model components
    await loadModelComponents();
    console.log('Model components loaded');
    
    // Tokenize text
    const tokenIds = tokenizeTextAraBERT(preprocessedText, 128);
    console.log('Text tokenized');
    
    // Run ONNX inference
    const analysisResult = await runONNXInference(tokenIds);
    console.log('ONNX analysis completed');
    
    // Detect dialect
    const dialect = detectJordanianDialect(preprocessedText);
    
    const finalResult = {
      ...analysisResult,
      dialect,
      modelSource: 'AraBERT_ONNX'
    };
    
    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify(finalResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'ONNX model analysis failed',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
