
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

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    console.log('Processing text:', text?.substring(0, 50) + '...');

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Text is required for analysis" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get admin HuggingFace config from DB
    const { data: huggingfaceData, error: configErr } = await supabase
      .from('huggingface_configs')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (configErr) {
      console.error('Database error:', configErr);
      throw new Error('Cannot load HuggingFace config: ' + configErr.message);
    }
    
    if (!huggingfaceData) {
      return new Response(
        JSON.stringify({ error: "No Hugging Face configuration found. Please configure it in admin settings." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pick the endpoint/token for arabert
    const hfEndpoint = huggingfaceData.arabert_url;
    const hfToken = huggingfaceData.arabert_token;

    if (!hfToken || !hfEndpoint) {
      return new Response(
        JSON.stringify({ error: 'AraBERT endpoint or token missing. Please configure it in admin settings.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Using AraBERT endpoint:', hfEndpoint);

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

    // Analyze with admin-configured HuggingFace endpoint
    const analysisResult = await analyzeWithCustomEndpoint(preprocessedText, hfEndpoint, hfToken);
    console.log('AraBERT analysis completed:', analysisResult);
    
    // Detect dialect using enhanced Jordanian detection logic
    const dialect = detectJordanianDialect(preprocessedText);
    console.log('Enhanced Jordanian dialect detection completed');
    
    // Run validation in background (don't wait for it)
    validateWithTestData(supabase, hfEndpoint, hfToken).catch(err => 
      console.error('Background validation error:', err)
    );
    
    const finalResult = {
      ...analysisResult,
      dialect,
      modelSource: 'AraBERT_Custom_Endpoint'
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
