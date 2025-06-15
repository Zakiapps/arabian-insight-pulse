
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { articleTitle, articleDescription, articleContent, language = 'ar' } = await req.json()
    
    console.log('Advanced analysis started for:', { articleTitle, language })
    
    // إنشاء النص المدمج للتحليل
    let textToAnalyze = articleTitle || ''
    if (articleDescription) textToAnalyze += '. ' + articleDescription
    if (articleContent && articleContent.length > 50) {
      textToAnalyze = articleContent.substring(0, 1000) // أول 1000 حرف من المحتوى
    }

    // 1. تحليل المشاعر المتقدم باستخدام OpenAI GPT-4
    const emotionAnalysis = await analyzeEmotionsWithGPT(textToAnalyze, language)
    
    // 2. تحليل المواضيع والكلمات المفتاحية
    const topicAnalysis = await extractTopicsAndKeywords(textToAnalyze, language)
    
    // 3. تحليل اللهجة المحسن
    const dialectAnalysis = await analyzeDialectAdvanced(textToAnalyze)
    
    // 4. تحليل السياق والأهمية
    const contextAnalysis = await analyzeContext(textToAnalyze, language)
    
    // 5. حساب جودة التحليل
    const qualityScore = calculateAnalysisQuality(textToAnalyze, emotionAnalysis, topicAnalysis)

    const result = {
      // تحليل المشاعر المتقدم
      sentiment: emotionAnalysis.primarySentiment,
      sentiment_confidence: emotionAnalysis.confidence,
      sentiment_reasoning: emotionAnalysis.reasoning,
      primary_emotion: emotionAnalysis.primaryEmotion,
      emotion_scores: emotionAnalysis.emotionScores,
      
      // تحليل المواضيع
      main_topics: topicAnalysis.topics,
      topic_scores: topicAnalysis.topicScores,
      keywords_extracted: topicAnalysis.keywords,
      
      // تحليل اللهجة المتقدم
      dialect: dialectAnalysis.dialect,
      dialect_confidence: dialectAnalysis.confidence,
      dialect_features: dialectAnalysis.features,
      regional_indicators: dialectAnalysis.indicators,
      
      // تحليل السياق
      context_analysis: contextAnalysis.summary,
      urgency_level: contextAnalysis.urgency,
      
      // جودة التحليل
      analysis_quality_score: qualityScore,
      
      // معلومات إضافية
      language: language,
      analyzed_text: textToAnalyze.substring(0, 500),
      content_source: articleContent && articleContent.length > 100 ? 'full_content' : 
                     articleDescription ? 'title_description' : 'title_only'
    }

    console.log('Advanced analysis completed:', result)
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Advanced analysis error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallback: {
          sentiment: 'neutral',
          sentiment_confidence: 0.5,
          primary_emotion: 'محايد',
          emotion_scores: { neutral: 0.5 },
          main_topics: [],
          keywords_extracted: [],
          analysis_quality_score: 0.3
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }
})

async function analyzeEmotionsWithGPT(text: string, language: string) {
  try {
    // محاولة استخدام OpenAI إذا كان متوفراً
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (openaiApiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `أنت خبير في تحليل المشاعر والعواطف للنصوص العربية. قم بتحليل النص وإرجاع النتيجة بصيغة JSON مع:
              - primarySentiment: إيجابي/سلبي/محايد
              - confidence: رقم من 0 إلى 1
              - primaryEmotion: العاطفة الأساسية (فرح، حزن، غضب، خوف، مفاجأة، اشمئزاز، محايد)
              - emotionScores: كائن يحتوي على درجات جميع العواطف
              - reasoning: تفسير قصير للتحليل`
            },
            {
              role: 'user',
              content: `حلل هذا النص: "${text}"`
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      })

      if (response.ok) {
        const data = await response.json()
        const content = data.choices[0].message.content
        
        try {
          const parsed = JSON.parse(content)
          return {
            primarySentiment: parsed.primarySentiment || 'محايد',
            confidence: Math.min(Math.max(parsed.confidence || 0.7, 0), 1),
            primaryEmotion: parsed.primaryEmotion || 'محايد',
            emotionScores: parsed.emotionScores || { neutral: 0.7 },
            reasoning: parsed.reasoning || 'تحليل تلقائي'
          }
        } catch {
          // إذا فشل parsing، استخدم النص كما هو
          return parseGPTResponse(content)
        }
      }
    }
    
    // fallback إلى MARBERT إذا لم يكن OpenAI متوفراً
    return await fallbackEmotionAnalysis(text)
    
  } catch (error) {
    console.error('GPT emotion analysis failed:', error)
    return await fallbackEmotionAnalysis(text)
  }
}

async function fallbackEmotionAnalysis(text: string) {
  // تحليل مبسط بناءً على الكلمات المفتاحية
  const positiveWords = ['جيد', 'ممتاز', 'رائع', 'إيجابي', 'نجاح', 'تقدم', 'فرح', 'سعادة']
  const negativeWords = ['سيء', 'فشل', 'مشكلة', 'أزمة', 'خطر', 'حزن', 'غضب', 'قلق']
  
  const words = text.toLowerCase().split(/\s+/)
  let positiveCount = 0
  let negativeCount = 0
  
  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) positiveCount++
    if (negativeWords.some(nw => word.includes(nw))) negativeCount++
  })
  
  let sentiment = 'محايد'
  let primaryEmotion = 'محايد'
  let confidence = 0.6
  
  if (positiveCount > negativeCount) {
    sentiment = 'إيجابي'
    primaryEmotion = 'فرح'
    confidence = Math.min(0.8, 0.5 + (positiveCount * 0.1))
  } else if (negativeCount > positiveCount) {
    sentiment = 'سلبي'
    primaryEmotion = 'حزن'
    confidence = Math.min(0.8, 0.5 + (negativeCount * 0.1))
  }
  
  return {
    primarySentiment: sentiment,
    confidence,
    primaryEmotion,
    emotionScores: {
      [primaryEmotion]: confidence,
      'محايد': 1 - confidence
    },
    reasoning: `تحليل بناءً على ${positiveCount} كلمات إيجابية و ${negativeCount} كلمات سلبية`
  }
}

async function extractTopicsAndKeywords(text: string, language: string) {
  // استخراج الكلمات المفتاحية بناءً على التكرار والأهمية
  const words = text.toLowerCase()
    .replace(/[^\u0600-\u06FF\s]/g, '') // إبقاء الأحرف العربية فقط
    .split(/\s+/)
    .filter(word => word.length > 2)
  
  // حساب تكرار الكلمات
  const wordFreq: { [key: string]: number } = {}
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1
  })
  
  // ترتيب الكلمات حسب التكرار
  const keywords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)
  
  // تصنيف المواضيع بناءً على الكلمات المفتاحية
  const topicKeywords = {
    'سياسة': ['سياسة', 'حكومة', 'وزير', 'رئيس', 'انتخابات', 'برلمان'],
    'اقتصاد': ['اقتصاد', 'مال', 'دولار', 'تجارة', 'استثمار', 'بنك'],
    'صحة': ['صحة', 'مرض', 'طبيب', 'مستشفى', 'علاج', 'دواء'],
    'رياضة': ['رياضة', 'كرة', 'فريق', 'مباراة', 'لاعب', 'بطولة'],
    'تكنولوجيا': ['تكنولوجيا', 'تقنية', 'إنترنت', 'كمبيوتر', 'تطبيق', 'ذكي']
  }
  
  const topics: string[] = []
  const topicScores: { [key: string]: number } = {}
  
  Object.entries(topicKeywords).forEach(([topic, topicWords]) => {
    const matches = topicWords.filter(tw => text.toLowerCase().includes(tw)).length
    if (matches > 0) {
      topics.push(topic)
      topicScores[topic] = matches / topicWords.length
    }
  })
  
  return {
    topics: topics.slice(0, 5),
    topicScores,
    keywords: keywords.slice(0, 8)
  }
}

async function analyzeDialectAdvanced(text: string) {
  // تحليل متقدم للهجة الأردنية
  const jordanianIndicators = [
    'شو', 'ليش', 'وين', 'شلون', 'هيك', 'هاي', 'يلا', 'زي',
    'هاد', 'هاذ', 'منيح', 'كتير', 'شوي', 'بدي', 'بده',
    'إش', 'شو بدك', 'كيفك', 'مبسوط', 'زعلان'
  ]
  
  const dialectFeatures = {
    'question_particles': ['شو', 'ليش', 'وين', 'شلون'],
    'demonstratives': ['هاد', 'هاذ', 'هاي'],
    'expressions': ['يلا', 'منيح', 'كتير'],
    'verbs': ['بدي', 'بده', 'بدها']
  }
  
  let matches = 0
  const foundIndicators: string[] = []
  const foundFeatures: { [key: string]: string[] } = {}
  
  jordanianIndicators.forEach(indicator => {
    if (text.toLowerCase().includes(indicator)) {
      matches++
      foundIndicators.push(indicator)
    }
  })
  
  Object.entries(dialectFeatures).forEach(([feature, words]) => {
    const featureMatches = words.filter(word => text.toLowerCase().includes(word))
    if (featureMatches.length > 0) {
      foundFeatures[feature] = featureMatches
    }
  })
  
  const confidence = Math.min(matches * 15, 95) // كل مؤشر يزيد الثقة 15%
  
  return {
    dialect: confidence > 30 ? 'jordanian' : 'other',
    confidence: confidence,
    indicators: foundIndicators,
    features: foundFeatures
  }
}

async function analyzeContext(text: string, language: string) {
  // تحليل السياق والأهمية
  const urgencyKeywords = {
    'critical': ['عاجل', 'طارئ', 'خطير', 'كارثة', 'أزمة'],
    'high': ['مهم', 'ضروري', 'عالي', 'كبير'],
    'medium': ['متوسط', 'مناسب', 'طبيعي'],
    'low': ['بسيط', 'قليل', 'صغير']
  }
  
  let urgency = 'low'
  
  Object.entries(urgencyKeywords).forEach(([level, keywords]) => {
    if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
      urgency = level
    }
  })
  
  const summary = text.length > 200 ? 
    text.substring(0, 200) + '...' : text
  
  return {
    summary,
    urgency
  }
}

function calculateAnalysisQuality(text: string, emotionAnalysis: any, topicAnalysis: any): number {
  let score = 0.5 // نقطة انطلاق
  
  // جودة النص
  if (text.length > 100) score += 0.2
  if (text.length > 300) score += 0.1
  
  // جودة تحليل المشاعر
  if (emotionAnalysis.confidence > 0.7) score += 0.1
  
  // جودة تحليل المواضيع
  if (topicAnalysis.topics.length > 0) score += 0.1
  if (topicAnalysis.keywords.length > 3) score += 0.1
  
  return Math.min(score, 1.0)
}

function parseGPTResponse(content: string) {
  // استخراج المعلومات من نص GPT إذا لم يكن JSON
  const lines = content.split('\n')
  let sentiment = 'محايد'
  let emotion = 'محايد'
  let confidence = 0.7
  
  lines.forEach(line => {
    if (line.includes('إيجابي') || line.includes('positive')) sentiment = 'إيجابي'
    if (line.includes('سلبي') || line.includes('negative')) sentiment = 'سلبي'
    if (line.includes('فرح') || line.includes('joy')) emotion = 'فرح'
    if (line.includes('حزن') || line.includes('sadness')) emotion = 'حزن'
    if (line.includes('غضب') || line.includes('anger')) emotion = 'غضب'
  })
  
  return {
    primarySentiment: sentiment,
    confidence,
    primaryEmotion: emotion,
    emotionScores: { [emotion]: confidence },
    reasoning: content.substring(0, 200)
  }
}
