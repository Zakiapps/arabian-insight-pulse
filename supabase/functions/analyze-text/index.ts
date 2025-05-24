
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

// Progressive vocabulary loading with chunks
let vocabChunks: Map<string, number>[] = [];
let currentChunkIndex = 0;
let specialTokens: any = null;
const CHUNK_SIZE = 5000;
let fullVocabLoaded = false;
let totalVocabLines: string[] = [];

// Memory-efficient Arabic text preprocessing
function preprocessArabicText(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // Remove diacritics
    .replace(/[أإآ]/g, 'ا') // Normalize alif
    .replace(/ة/g, 'ه') // Normalize taa marbouta
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

// Enhanced Jordanian dialect detection with minimal patterns
function detectJordanianDialect(text: string): string {
  const jordanianWords = ['زلمة', 'هسا', 'شو', 'بدك', 'يلا', 'تمام', 'خلاص', 'مش', 'هيك'];
  let matchCount = 0;
  
  for (const word of jordanianWords) {
    if (text.includes(word)) matchCount++;
    if (matchCount >= 2) break; // Early exit
  }
  
  return matchCount >= 2 ? 'Jordanian' : 'Non-Jordanian';
}

// Validate Arabic text
function validateArabicText(text: string): boolean {
  return text && text.length >= 3 && /[\u0600-\u06FF]/.test(text);
}

// Load vocabulary progressively in chunks
async function loadVocabChunk(chunkIndex: number): Promise<boolean> {
  try {
    console.log(`Loading vocabulary chunk ${chunkIndex + 1}...`);
    
    // Load full vocab only once if not already loaded
    if (totalVocabLines.length === 0) {
      const { data: vocabData, error } = await supabase.storage
        .from('private-model')
        .download('vocab.txt');
      
      if (error || !vocabData) {
        throw new Error(`Vocab load failed: ${error?.message}`);
      }
      
      const vocabText = await vocabData.text();
      totalVocabLines = vocabText.split('\n').filter(line => line.trim());
      console.log(`Total vocabulary size: ${totalVocabLines.length} tokens`);
    }
    
    const startIndex = chunkIndex * CHUNK_SIZE;
    const endIndex = Math.min(startIndex + CHUNK_SIZE, totalVocabLines.length);
    
    if (startIndex >= totalVocabLines.length) {
      console.log('No more vocabulary chunks to load');
      return false;
    }
    
    // Create or extend the chunk
    if (!vocabChunks[chunkIndex]) {
      vocabChunks[chunkIndex] = new Map();
    }
    
    const chunk = vocabChunks[chunkIndex];
    for (let i = startIndex; i < endIndex; i++) {
      const token = totalVocabLines[i].trim();
      if (token) {
        chunk.set(token, i);
      }
    }
    
    // Set special tokens from first chunk
    if (chunkIndex === 0 && !specialTokens) {
      specialTokens = {
        cls: chunk.get('[CLS]') || 101,
        sep: chunk.get('[SEP]') || 102,
        pad: chunk.get('[PAD]') || 0,
        unk: chunk.get('[UNK]') || 100
      };
    }
    
    console.log(`Loaded chunk ${chunkIndex + 1}: ${chunk.size} tokens (${startIndex}-${endIndex-1})`);
    return true;
  } catch (error) {
    console.error(`Error loading vocab chunk ${chunkIndex}:`, error);
    throw error;
  }
}

// Find token in loaded chunks, load more if needed
async function findTokenInVocab(word: string): Promise<number | null> {
  // Search in currently loaded chunks
  for (let i = 0; i < vocabChunks.length; i++) {
    const chunk = vocabChunks[i];
    if (chunk && chunk.has(word)) {
      return chunk.get(word) || null;
    }
  }
  
  // If not found and more chunks available, load next chunk
  const nextChunkIndex = vocabChunks.length;
  const hasMoreChunks = await loadVocabChunk(nextChunkIndex);
  
  if (hasMoreChunks) {
    const newChunk = vocabChunks[nextChunkIndex];
    if (newChunk && newChunk.has(word)) {
      return newChunk.get(word) || null;
    }
  }
  
  return null;
}

// Memory-efficient tokenization with progressive vocabulary loading
async function tokenizeTextProgressive(text: string, maxLength: number = 128): Promise<number[]> {
  if (!specialTokens) {
    // Load first chunk to get special tokens
    await loadVocabChunk(0);
  }
  
  const tokens = [specialTokens.cls];
  const words = text.split(/\s+/).slice(0, maxLength - 3);
  
  for (const word of words) {
    if (tokens.length >= maxLength - 1) break;
    
    // Try to find token in vocabulary
    let tokenId = await findTokenInVocab(word);
    
    if (tokenId === null) {
      // Try variations
      tokenId = await findTokenInVocab(`##${word}`) || 
                await findTokenInVocab(word.toLowerCase()) || 
                specialTokens.unk;
    }
    
    tokens.push(tokenId);
  }
  
  tokens.push(specialTokens.sep);
  
  // Pad to exact length
  while (tokens.length < maxLength) {
    tokens.push(specialTokens.pad);
  }
  
  return tokens.slice(0, maxLength);
}

// Optimized ONNX inference with streaming and memory management
async function runOptimizedONNXInference(inputIds: number[]): Promise<{
  sentiment: string;
  confidence: number;
  positive_prob: number;
  negative_prob: number;
}> {
  let modelBuffer: ArrayBuffer | null = null;
  let session: any = null;
  
  try {
    console.log('Starting optimized ONNX inference...');
    
    // Load model with streaming
    const { data: modelData, error } = await supabase.storage
      .from('private-model')
      .download('model.onnx');
    
    if (error || !modelData) {
      throw new Error(`Model load failed: ${error?.message}`);
    }
    
    modelBuffer = await modelData.arrayBuffer();
    const modelSizeMB = (modelBuffer.byteLength / 1024 / 1024).toFixed(2);
    console.log(`Model loaded: ${modelSizeMB}MB`);
    
    // Import ONNX Runtime with optimizations
    const ort = await import('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/ort.min.js');
    
    // Optimized session options for memory efficiency
    const sessionOptions = {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
      enableMemPattern: false,
      enableCpuMemArena: false,
      logSeverityLevel: 3,
    };
    
    session = await ort.InferenceSession.create(modelBuffer, sessionOptions);
    console.log('ONNX session created');
    
    // Create tensors efficiently
    const inputTensor = new ort.Tensor('int64', 
      BigInt64Array.from(inputIds.map(x => BigInt(x))), 
      [1, inputIds.length]
    );
    
    const attentionMask = new ort.Tensor('int64',
      BigInt64Array.from(inputIds.map(x => x > 0 ? BigInt(1) : BigInt(0))),
      [1, inputIds.length]
    );
    
    // Run inference
    const feeds: Record<string, any> = {};
    const inputNames = session.inputNames;
    feeds[inputNames[0]] = inputTensor;
    if (inputNames.length > 1) {
      feeds[inputNames[1]] = attentionMask;
    }
    
    const results = await session.run(feeds);
    const outputKey = Object.keys(results)[0];
    const logits = results[outputKey];
    const logitsData = logits.data as Float32Array;
    
    // Calculate probabilities efficiently
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
    // Aggressive cleanup
    if (session) {
      try {
        session.release();
        session = null;
      } catch (e) {
        console.error('Session cleanup error:', e);
      }
    }
    
    if (modelBuffer) {
      modelBuffer = null;
    }
    
    // Force garbage collection if available
    if (globalThis.gc) {
      globalThis.gc();
    }
    
    console.log('Memory cleanup completed');
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

    // Load first vocabulary chunk if needed
    if (vocabChunks.length === 0) {
      await loadVocabChunk(0);
    }
    console.log('Initial vocabulary chunk loaded');
    
    // Tokenize text with progressive loading
    const tokenIds = await tokenizeTextProgressive(preprocessedText, 128);
    console.log('Text tokenized with progressive vocabulary');
    
    // Run optimized ONNX inference
    const analysisResult = await runOptimizedONNXInference(tokenIds);
    console.log('ONNX analysis completed');
    
    // Detect dialect efficiently
    const dialect = detectJordanianDialect(preprocessedText);
    
    const finalResult = {
      ...analysisResult,
      dialect,
      modelSource: 'AraBERT_ONNX_Progressive'
    };
    
    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify(finalResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    
    // Clear caches on error to free memory
    vocabChunks = [];
    specialTokens = null;
    totalVocabLines = [];
    currentChunkIndex = 0;
    
    if (globalThis.gc) {
      globalThis.gc();
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'ONNX model analysis failed',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
