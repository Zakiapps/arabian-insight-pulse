
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { preprocessArabicText, validateArabicTextDetailed } from './utils/textProcessing.ts';
import { detectJordanianDialect } from './utils/dialectDetection.ts';
import { analyzeWithCustomEndpoint } from './utils/marbertAnalyzer.ts';
import { validateWithTestData } from './utils/validation.ts';

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

// Your custom Hugging Face endpoint
const customEndpoint = 'https://jdzzl8pdnwofvatk.us-east-1.aws.endpoints.huggingface.cloud';

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

    // Enhanced validation with detailed error messages
    const validation = validateArabicTextDetailed(text);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: validation.errorMessage }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Preprocess text using enhanced normalization
    const preprocessedText = preprocessArabicText(text);
    console.log('Text preprocessed with enhanced normalization');

    // Analyze with custom MARBERT endpoint
    const analysisResult = await analyzeWithCustomEndpoint(preprocessedText, customEndpoint, hfToken);
    console.log('Custom MARBERT analysis completed');
    
    // Detect dialect using enhanced Jordanian detection logic
    const dialect = detectJordanianDialect(preprocessedText);
    console.log('Enhanced Jordanian dialect detection completed');
    
    // Run validation in background (don't wait for it)
    validateWithTestData(supabase, customEndpoint, hfToken).catch(err => 
      console.error('Background validation error:', err)
    );
    
    const finalResult = {
      ...analysisResult,
      dialect,
      modelSource: 'MARBERT_Custom_Endpoint_Enhanced'
    };
    
    console.log('Analysis completed successfully with enhanced dialect detection');

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
