
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

// Get Hugging Face API token
const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

// Arabic text preprocessing
function preprocessArabicText(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // Remove diacritics
    .replace(/[أإآ]/g, 'ا') // Normalize alif
    .replace(/ة/g, 'ه') // Normalize taa marbouta
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

// Enhanced Jordanian dialect detection
function detectJordanianDialect(text: string): string {
  const jordanianWords = ['زلمة', 'هسا', 'شو', 'بدك', 'يلا', 'تمام', 'خلاص', 'مش', 'هيك', 'بموت', 'فيك'];
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

// Hugging Face Inference API for sentiment analysis using mofawzy/bert-ajgt
async function analyzeWithHuggingFace(text: string): Promise<{
  sentiment: string;
  confidence: number;
  positive_prob: number;
  negative_prob: number;
}> {
  try {
    console.log('Starting Hugging Face inference with mofawzy/bert-ajgt model...');
    
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mofawzy/bert-ajgt',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          options: {
            wait_for_model: true
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, errorText);
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Hugging Face response:', result);

    // Handle the response format from Hugging Face
    let scores;
    if (Array.isArray(result) && result.length > 0) {
      scores = result[0];
    } else if (result.scores) {
      scores = result.scores;
    } else {
      throw new Error('Unexpected response format from Hugging Face');
    }

    // Find positive and negative scores
    const positiveScore = scores.find((s: any) => 
      s.label.toLowerCase().includes('positive') || 
      s.label.toLowerCase().includes('pos') ||
      s.label === 'LABEL_1' ||
      s.label === '1'
    );
    
    const negativeScore = scores.find((s: any) => 
      s.label.toLowerCase().includes('negative') || 
      s.label.toLowerCase().includes('neg') ||
      s.label === 'LABEL_0' ||
      s.label === '0'
    );

    let positive_prob = 0.5;
    let negative_prob = 0.5;

    if (positiveScore && negativeScore) {
      positive_prob = positiveScore.score;
      negative_prob = negativeScore.score;
    } else if (scores.length >= 2) {
      // Fallback: assume first two scores are negative and positive
      negative_prob = scores[0].score;
      positive_prob = scores[1].score;
    }

    const sentiment = positive_prob > negative_prob ? 'positive' : 'negative';
    const confidence = Math.max(positive_prob, negative_prob);

    console.log('Hugging Face inference completed successfully with mofawzy/bert-ajgt');

    return {
      sentiment,
      confidence: Math.round(confidence * 10000) / 10000,
      positive_prob: Math.round(positive_prob * 10000) / 10000,
      negative_prob: Math.round(negative_prob * 10000) / 10000
    };

  } catch (error) {
    console.error('Hugging Face inference error:', error);
    throw error;
  }
}

// Validate model with test data
async function validateWithTestData(): Promise<void> {
  try {
    console.log('Loading test.csv for validation...');
    
    const { data: testData, error } = await supabase.storage
      .from('private-model')
      .download('test.csv');
    
    if (error || !testData) {
      console.log('Test data not found, skipping validation');
      return;
    }
    
    const csvText = await testData.text();
    const lines = csvText.split('\n').slice(1, 6); // Take first 5 test samples
    
    let correct = 0;
    let total = 0;
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const [text, expectedLabel] = line.split(',').map(col => col.trim().replace(/"/g, ''));
      if (!text || !expectedLabel) continue;
      
      try {
        const result = await analyzeWithHuggingFace(text);
        const predicted = result.sentiment === 'positive' ? '1' : '0';
        
        if (predicted === expectedLabel) correct++;
        total++;
        
        console.log(`Test: "${text.substring(0, 30)}..." | Expected: ${expectedLabel} | Predicted: ${predicted} | Confidence: ${result.confidence}`);
      } catch (err) {
        console.error('Error validating sample:', err);
      }
    }
    
    if (total > 0) {
      const accuracy = (correct / total * 100).toFixed(1);
      console.log(`Validation accuracy: ${accuracy}% (${correct}/${total})`);
    }
    
  } catch (error) {
    console.error('Validation error:', error);
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

    // Validate Hugging Face token
    if (!hfToken) {
      return new Response(
        JSON.stringify({ error: 'Hugging Face API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Analyze with Hugging Face mofawzy/bert-ajgt model
    const analysisResult = await analyzeWithHuggingFace(preprocessedText);
    console.log('Hugging Face analysis completed');
    
    // Detect dialect efficiently
    const dialect = detectJordanianDialect(preprocessedText);
    
    // Run validation in background (don't wait for it)
    validateWithTestData().catch(err => console.error('Background validation error:', err));
    
    const finalResult = {
      ...analysisResult,
      dialect,
      modelSource: 'mofawzy/bert-ajgt_HuggingFace'
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
        error: 'Sentiment analysis failed',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
