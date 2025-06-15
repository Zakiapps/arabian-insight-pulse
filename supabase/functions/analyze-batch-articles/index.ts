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

// Enhanced text validation that allows title + description fallback
function validateAndScoreContent(text: string, isMainContent: boolean = true): { 
  isValid: boolean; 
  errorMsg: string; 
  qualityScore: number;
  contentType: string;
} {
  if (!text || text.trim().length < 3) {
    return { isValid: false, errorMsg: "النص فارغ أو قصير جداً", qualityScore: 0, contentType: 'none' };
  }
  
  // Check for placeholder content patterns
  const placeholderPatterns = [
    /ONLY AVAILABLE IN PAID PLANS/i,
    /upgrade to premium/i,
    /subscribe to read/i,
    /premium content/i,
    /paywall/i
  ];
  
  const hasPlaceholder = placeholderPatterns.some(pattern => pattern.test(text));
  
  // If main content has placeholder, mark it but don't reject completely
  if (hasPlaceholder && isMainContent) {
    return { 
      isValid: false, 
      errorMsg: "المحتوى الرئيسي محجوب - سيتم استخدام العنوان والوصف", 
      qualityScore: 0, 
      contentType: 'blocked_main_content' 
    };
  }
  
  // Check for Arabic characters
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  if (!hasArabic) {
    return { 
      isValid: false, 
      errorMsg: "النص لا يحتوي على حروف عربية", 
      qualityScore: 0, 
      contentType: 'non-arabic' 
    };
  }

  // Calculate quality score
  let qualityScore = 0;
  const wordCount = text.split(/\s+/).length;
  
  // Adjust scoring for fallback content (title + description)
  const minWords = isMainContent ? 20 : 10;
  const goodWords = isMainContent ? 100 : 30;
  const excellentWords = isMainContent ? 200 : 50;
  
  // Length scoring (adjusted for content type)
  if (wordCount > excellentWords) qualityScore += 40;
  else if (wordCount > goodWords) qualityScore += 30;
  else if (wordCount > minWords) qualityScore += 20;
  else if (wordCount > 5) qualityScore += 10;
  else qualityScore += 5;
  
  // Content structure scoring
  const sentences = text.split(/[.!؟]/).filter(s => s.trim().length > 0);
  if (sentences.length > 3) qualityScore += 20;
  else if (sentences.length > 1) qualityScore += 15;
  else qualityScore += 5;
  
  // Arabic content density
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const arabicDensity = arabicChars / text.length;
  if (arabicDensity > 0.7) qualityScore += 25;
  else if (arabicDensity > 0.5) qualityScore += 15;
  else if (arabicDensity > 0.3) qualityScore += 10;
  
  // Meaningful content indicators
  const meaningfulWords = ['في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'التي', 'الذي'];
  const meaningfulCount = meaningfulWords.reduce((count, word) => 
    count + (text.toLowerCase().includes(word) ? 1 : 0), 0);
  qualityScore += Math.min(meaningfulCount * 2, 15);
  
  // For fallback content, lower the minimum threshold
  const minQualityThreshold = isMainContent ? 20 : 15;
  const contentType = wordCount > goodWords ? 'good' : wordCount > minWords ? 'fair' : 'short';
  
  return { 
    isValid: qualityScore >= minQualityThreshold, 
    errorMsg: qualityScore < minQualityThreshold ? "جودة المحتوى منخفضة للتحليل" : "", 
    qualityScore: Math.min(qualityScore, 100),
    contentType
  };
}

// Enhanced content extraction with better fallback handling
function extractBestContent(article: any): { text: string; source: string; quality: number } {
  // First, try main content
  if (article.content && article.content.trim().length > 0) {
    const contentValidation = validateAndScoreContent(article.content, true);
    if (contentValidation.isValid) {
      return { 
        text: article.content, 
        source: 'content', 
        quality: contentValidation.qualityScore 
      };
    }
  }

  // If main content is blocked or invalid, try title + description combination
  const titleDesc = [article.title, article.description]
    .filter(text => text && text.trim().length > 0)
    .join('. ');

  if (titleDesc.length > 0) {
    const fallbackValidation = validateAndScoreContent(titleDesc, false);
    if (fallbackValidation.isValid) {
      return { 
        text: titleDesc, 
        source: 'title_description', 
        quality: fallbackValidation.qualityScore 
      };
    }
  }

  // Last resort: just title
  if (article.title && article.title.trim().length > 0) {
    const titleValidation = validateAndScoreContent(article.title, false);
    if (titleValidation.isValid) {
      return { 
        text: article.title, 
        source: 'title_only', 
        quality: titleValidation.qualityScore 
      };
    }
  }

  return { text: '', source: 'none', quality: 0 };
}

// Enhanced dialect detection with better patterns
function detectJordanianDialect(text: string): { 
  isJordanian: boolean; 
  confidence: number; 
  indicators: string[];
  emotionalMarkers: string[];
} {
  const jordanianTerms = [
    "زلمة", "يا زلمة", "خرفنة", "تسليك", "احشش", "انكب", "راعي", "هسا", "شو", "كيفك",
    "إربد", "عمان", "الزرقاء", "العقبة", "واللهي", "عال", "بدك", "مش عارف",
    "تمام", "فش", "عالسريع", "يا رجال", "يلا", "خلص", "دبس", "بسطة", "زَيّ الفل",
    "جاي", "روح", "حياتي", "عن جد", "بكفي", "ما بدي", "طيب", "قديش", "وينك",
    "عالطول", "شايف", "هسه", "بتعرف", "بس", "يعني", "كتير", "شوي", "حبتين",
    "منيح", "بدأيش", "بطل", "خبرني", "ولك", "يا عمي", "مفكر", "بفكر", "زفت", "روعة"
  ];

  const emotionalMarkers = [
    "واللهي", "يا رب", "حرام", "حبيبي", "يا زلمة", "عن جد", "يا عمي", 
    "يا حياتي", "يا رجال", "بتجنن", "روعة", "زفت", "فظيع"
  ];

  const textLower = text.toLowerCase();
  let foundTerms: string[] = [];
  let foundEmotionalMarkers: string[] = [];
  let score = 0;
  const totalWords = text.split(/\s+/).length;

  jordanianTerms.forEach(term => {
    if (textLower.includes(term.toLowerCase())) {
      foundTerms.push(term);
      const weight = ["شو", "كيفك", "بدك", "مش", "هسا", "تمام", "واللهي", "عن جد"].includes(term) ? 2 : 1;
      score += weight;
    }
  });

  emotionalMarkers.forEach(marker => {
    if (textLower.includes(marker.toLowerCase())) {
      foundEmotionalMarkers.push(marker);
      score += 1.5;
    }
  });

  const wordDensityScore = (score / Math.max(totalWords * 0.15, 1)) * 100;
  const absoluteMatchScore = Math.min((foundTerms.length / 3) * 100, 100);
  const emotionalBonus = foundEmotionalMarkers.length * 10;
  
  const confidence = Math.min(Math.max(wordDensityScore, absoluteMatchScore) + emotionalBonus, 100);
  const isJordanian = confidence > 20;

  return {
    isJordanian,
    confidence: Math.round(confidence),
    indicators: [...new Set(foundTerms)].slice(0, 12),
    emotionalMarkers: [...new Set(foundEmotionalMarkers)]
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { project_id, user_id, article_ids } = await req.json();

    if (!project_id || !user_id) {
      return new Response(JSON.stringify({ 
        error: "project_id and user_id are required" 
      }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log(`Starting batch analysis for project ${project_id}, user ${user_id}`);

    // Fetch articles to analyze
    let query = supabase
      .from('scraped_news')
      .select('*')
      .eq('project_id', project_id)
      .eq('user_id', user_id);

    if (article_ids && article_ids.length > 0) {
      query = query.in('id', article_ids);
    } else {
      query = query.eq('is_analyzed', false);
    }

    const { data: articles, error: fetchError } = await query.limit(20);

    if (fetchError) {
      console.error('Error fetching articles:', fetchError);
      return new Response(JSON.stringify({ 
        error: "Failed to fetch articles", 
        details: fetchError.message 
      }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    if (!articles || articles.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No articles to analyze",
        processed: 0,
        results: []
      }), { 
        headers: corsHeaders 
      });
    }

    console.log(`Found ${articles.length} articles to analyze`);

    const results = [];
    let processed = 0;
    let errors = 0;

    for (const article of articles) {
      try {
        console.log(`Analyzing article ${article.id}: ${article.title.substring(0, 50)}...`);

        // Extract best available content (now with fallback support)
        const contentResult = extractBestContent(article);
        
        // Lower the quality threshold since we're using fallback content
        if (contentResult.quality < 10) {
          console.log(`Skipping article ${article.id} - no usable content (${contentResult.quality})`);
          results.push({
            article_id: article.id,
            success: false,
            error: "لا يوجد محتوى مناسب للتحليل",
            quality_score: contentResult.quality,
            content_source: contentResult.source
          });
          errors++;
          continue;
        }

        console.log(`Using ${contentResult.source} for analysis with quality ${contentResult.quality}%`);

        // Call MARBERT analysis
        const response = await fetch(HF_ENDPOINT, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            inputs: contentResult.text,
            parameters: {}
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`HuggingFace API error for article ${article.id}:`, response.status, errText);
          errors++;
          results.push({
            article_id: article.id,
            success: false,
            error: "فشل في تحليل النص",
            details: errText
          });
          continue;
        }

        const hfResult = await response.json();
        console.log(`HuggingFace result for article ${article.id}:`, hfResult);

        // Process sentiment analysis result
        let sentiment = "neutral";
        let confidence = 0.5;
        let positive_prob = 0.5;
        let negative_prob = 0.5;

        if (Array.isArray(hfResult) && hfResult.length > 0) {
          const scores = Array.isArray(hfResult[0]) ? hfResult[0] : hfResult;
          
          if (scores.length === 1) {
            const score = scores[0];
            if (score.label === 'LABEL_0') {
              negative_prob = score.score;
              positive_prob = 1 - score.score;
            } else {
              positive_prob = score.score;
              negative_prob = 1 - score.score;
            }
          }
        }

        // Normalize probabilities
        const total = positive_prob + negative_prob;
        if (total > 0) {
          positive_prob = positive_prob / total;
          negative_prob = negative_prob / total;
        }

        // Determine sentiment
        const diff = Math.abs(positive_prob - negative_prob);
        if (diff < 0.1) {
          sentiment = 'neutral';
          confidence = 0.5;
        } else if (positive_prob > negative_prob) {
          sentiment = 'positive';
          confidence = positive_prob;
        } else {
          sentiment = 'negative';
          confidence = negative_prob;
        }

        // Enhanced dialect detection
        const dialectResult = detectJordanianDialect(contentResult.text);

        // Map emotion based on sentiment and content
        let emotion = 'محايد';
        if (sentiment === 'positive') {
          emotion = dialectResult.emotionalMarkers.length > 0 ? 'سعادة' : 'تفاؤل';
        } else if (sentiment === 'negative') {
          emotion = dialectResult.emotionalMarkers.length > 0 ? 'غضب' : 'استياء';
        }

        // Store analysis in text_analyses table
        const { error: insertError } = await supabase
          .from('text_analyses')
          .insert({
            project_id: project_id,
            user_id: user_id,
            input_text: contentResult.text,
            sentiment: sentiment,
            sentiment_score: confidence,
            emotion: emotion,
            language: article.language || 'ar',
            dialect: dialectResult.isJordanian ? 'jordanian' : 'other',
            dialect_confidence: dialectResult.confidence,
            dialect_indicators: dialectResult.indicators,
            emotional_markers: dialectResult.emotionalMarkers,
            model_response: {
              hf_result: hfResult,
              content_source: contentResult.source,
              quality_score: contentResult.quality,
              analysis_type: 'batch_auto'
            }
          });

        if (insertError) {
          console.error(`Error inserting analysis for article ${article.id}:`, insertError);
          errors++;
          results.push({
            article_id: article.id,
            success: false,
            error: "فشل في حفظ التحليل",
            details: insertError.message
          });
          continue;
        }

        // Update the article as analyzed
        const { error: updateError } = await supabase
          .from('scraped_news')
          .update({ 
            is_analyzed: true,
            sentiment: sentiment,
            emotion: emotion,
            dialect: dialectResult.isJordanian ? 'jordanian' : 'other',
            dialect_confidence: dialectResult.confidence,
            dialect_indicators: dialectResult.indicators,
            emotional_markers: dialectResult.emotionalMarkers,
            updated_at: new Date().toISOString()
          })
          .eq('id', article.id);

        if (updateError) {
          console.error(`Error updating article ${article.id}:`, updateError);
          // Continue processing even if update fails
        }

        processed++;
        results.push({
          article_id: article.id,
          success: true,
          sentiment: sentiment,
          emotion: emotion,
          confidence: confidence,
          quality_score: contentResult.quality,
          content_source: contentResult.source,
          dialect: dialectResult.isJordanian ? 'jordanian' : 'other'
        });

        console.log(`Successfully analyzed article ${article.id} using ${contentResult.source}`);

      } catch (error) {
        console.error(`Error processing article ${article.id}:`, error);
        errors++;
        results.push({
          article_id: article.id,
          success: false,
          error: "خطأ في معالجة المقال",
          details: error.message
        });
      }
    }

    console.log(`Batch analysis completed: ${processed} successful, ${errors} errors`);

    return new Response(JSON.stringify({
      success: true,
      processed: processed,
      errors: errors,
      total: articles.length,
      results: results,
      message: `تم تحليل ${processed} مقال بنجاح من أصل ${articles.length}`
    }), { 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error("Batch analysis function error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: error.message 
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
