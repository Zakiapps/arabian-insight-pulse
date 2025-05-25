
import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImprovedTextAnalyzer from "@/components/analysis/ImprovedTextAnalyzer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload as UploadIcon,
  FileText,
  Database,
  Brain,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Download,
  X,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import Papa from 'papaparse';

interface CSVRow {
  content: string;
  source?: string;
  engagement_count?: string;
}

interface AnalyzedData extends CSVRow {
  sentiment: string;
  confidence: number;
  dialect: string;
}

interface UploadError {
  type: 'validation' | 'network' | 'analysis' | 'storage';
  message: string;
  details?: string;
}

const ImprovedUpload = () => {
  const { isRTL } = useLanguage();
  const { profile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadedData, setUploadedData] = useState<AnalyzedData[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [errors, setErrors] = useState<UploadError[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const validateFile = useCallback((file: File): UploadError | null => {
    if (!file.name.endsWith('.csv')) {
      return {
        type: 'validation',
        message: 'نوع الملف غير صحيح',
        details: 'يجب أن يكون الملف بصيغة CSV'
      };
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return {
        type: 'validation',
        message: 'حجم الملف كبير جداً',
        details: 'يجب أن يكون حجم الملف أقل من 10 ميجابايت'
      };
    }

    return null;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const addError = useCallback((error: UploadError) => {
    setErrors(prev => [...prev, error]);
  }, []);

  const analyzeText = async (text: string, retries = 3): Promise<any> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke('analyze-text', {
          body: { text }
        });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error(`Analysis attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          throw new Error(`فشل في تحليل النص بعد ${retries} محاولات`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.id) return;

    clearErrors();
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      addError(validationError);
      return;
    }

    setUploading(true);
    setAnalysisProgress(0);
    setCurrentStep('جاري قراءة الملف...');
    
    try {
      Papa.parse(file, {
        header: true,
        encoding: 'UTF-8',
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            setCurrentStep('معالجة البيانات...');
            setAnalysisProgress(10);

            const data = (results.data as CSVRow[]).filter((row: CSVRow) => 
              row.content && row.content.trim().length > 0
            );
            
            if (data.length === 0) {
              addError({
                type: 'validation',
                message: 'لا توجد بيانات صالحة',
                details: 'لم يتم العثور على نصوص صالحة في الملف'
              });
              setUploading(false);
              return;
            }

            if (data.length > 1000) {
              addError({
                type: 'validation',
                message: 'عدد السجلات كبير جداً',
                details: 'يمكن معالجة حتى 1000 سجل في المرة الواحدة'
              });
              setUploading(false);
              return;
            }

            setCurrentStep('تحليل البيانات بالذكاء الاصطناعي...');
            setAnalysisProgress(20);

            const batchSize = 5;
            const analyzedData: AnalyzedData[] = [];
            const totalBatches = Math.ceil(data.length / batchSize);
            
            for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
              const batch = data.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);
              setCurrentStep(`معالجة مجموعة ${batchIndex + 1} من ${totalBatches}...`);
              
              const batchPromises = batch.map(async (item, itemIndex) => {
                try {
                  const analysisResult = await analyzeText(item.content);
                  
                  // Store in analyzed_posts table instead of predictions
                  const { error: insertError } = await supabase
                    .from('analyzed_posts')
                    .insert({
                      user_id: profile.id,
                      content: item.content,
                      sentiment: analysisResult.sentiment,
                      sentiment_score: analysisResult.confidence,
                      is_jordanian_dialect: analysisResult.dialect === 'Jordanian',
                      source: item.source || 'csv_upload',
                      engagement_count: item.engagement_count ? parseInt(item.engagement_count) : null
                    });

                  if (insertError) {
                    console.error('Database insert error:', insertError);
                    addError({
                      type: 'storage',
                      message: 'خطأ في حفظ البيانات',
                      details: `فشل في حفظ السجل ${batchIndex * batchSize + itemIndex + 1}`
                    });
                    return null;
                  }

                  return {
                    ...item,
                    sentiment: analysisResult.sentiment,
                    confidence: analysisResult.confidence,
                    dialect: analysisResult.dialect
                  };
                } catch (error) {
                  console.error(`Error processing item ${itemIndex}:`, error);
                  addError({
                    type: 'analysis',
                    message: 'خطأ في تحليل النص',
                    details: `فشل في تحليل السجل ${batchIndex * batchSize + itemIndex + 1}`
                  });
                  return null;
                }
              });

              const batchResults = await Promise.all(batchPromises);
              const validResults = batchResults.filter(result => result !== null) as AnalyzedData[];
              analyzedData.push(...validResults);

              // Update progress
              const progress = 20 + ((batchIndex + 1) / totalBatches) * 70;
              setAnalysisProgress(Math.round(progress));
            }

            setAnalysisProgress(100);
            setCurrentStep('اكتمل التحليل!');
            setUploadedData(analyzedData);

            if (analyzedData.length > 0) {
              toast.success(`تم تحليل ${analyzedData.length} منشور بنجاح! 🎉`);
            }

            if (errors.length > 0) {
              toast.warning(`تم التحليل مع ${errors.length} تحذير`);
            }

          } catch (error) {
            console.error('Processing error:', error);
            addError({
              type: 'analysis',
              message: 'خطأ في معالجة الملف',
              details: error instanceof Error ? error.message : 'خطأ غير معروف'
            });
          } finally {
            setUploading(false);
            setCurrentStep('');
          }
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          addError({
            type: 'validation',
            message: 'خطأ في قراءة الملف',
            details: 'تأكد من أن الملف بصيغة CSV صحيحة'
          });
          setUploading(false);
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      addError({
        type: 'network',
        message: 'خطأ في رفع الملف',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      setUploading(false);
    }
  };

  const downloadSampleFile = () => {
    const sampleData = [
      {
        content: "هذا منشور تجريبي إيجابي جداً ومفرح والله زاكي كثير",
        source: "twitter",
        engagement_count: "150"
      },
      {
        content: "أشعر بالحزن والإحباط من هذا الوضع",
        source: "facebook", 
        engagement_count: "75"
      },
      {
        content: "هذا نص محايد لا يحتوي على مشاعر واضحة",
        source: "instagram",
        engagement_count: "200"
      }
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sample_data.csv';
    link.click();
  };

  const retryAnalysis = () => {
    setRetryCount(prev => prev + 1);
    clearErrors();
    // Trigger re-upload
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      handleFileUpload({ target: { files: fileInput.files } } as any);
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      default: return '😐';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'from-green-400 to-green-600';
      case 'negative': return 'from-red-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'إيجابي';
      case 'negative': return 'سلبي';
      default: return 'محايد';
    }
  };

  return (
    <div className="space-y-8 p-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <motion.div 
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 border-2 border-primary/20"
          >
            <Brain className="h-10 w-10 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              مختبر الذكاء الاصطناعي المطور 🚀
            </h1>
            <p className="text-lg text-muted-foreground">رفع وتحليل البيانات بأحدث التقنيات</p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-8 w-8 text-yellow-500" />
          </motion.div>
        </div>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {errors.map((error, index) => (
              <Alert key={index} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <strong>{error.message}</strong>
                      {error.details && <p className="text-sm mt-1">{error.details}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setErrors(prev => prev.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
            {retryCount < 3 && (
              <Button onClick={retryAnalysis} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                إعادة المحاولة ({retryCount + 1}/3)
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-14">
          <TabsTrigger value="text" className="flex items-center gap-3 text-lg">
            <Brain className="h-5 w-5" />
            تحليل نص مفرد 🎯
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-3 text-lg">
            <Database className="h-5 w-5" />
            رفع مجموعي 📊
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-8">
          <ImprovedTextAnalyzer />
        </TabsContent>

        <TabsContent value="bulk" className="mt-8">
          <div className="space-y-8">
            {/* Enhanced File Upload Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-hidden border-2 border-primary/20 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <FileText className="h-7 w-7" />
                    </motion.div>
                    رفع ملف CSV للذكاء الاصطناعي 🤖
                  </CardTitle>
                  <CardDescription className="text-lg">
                    قم برفع ملف CSV وسيقوم الذكاء الاصطناعي بتحليل المشاعر واللهجة الأردنية لكل نص
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-6">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="border-3 border-dashed border-primary/30 rounded-2xl p-12 text-center bg-gradient-to-br from-blue-50/50 to-purple-50/50"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <UploadIcon className="h-16 w-16 text-primary mx-auto mb-6" />
                      </motion.div>
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-2xl font-bold">🎯 انقر لرفع ملف CSV</span>
                        <p className="text-lg text-muted-foreground mt-3">
                          أو اسحب وأفلت الملف هنا للتحليل الفوري
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          ✨ سيقوم الذكاء الاصطناعي بتحليل كل نص في ثوانٍ معدودة
                        </p>
                      </Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </motion.div>

                    {uploading && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-primary/20">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Brain className="h-8 w-8 text-blue-600" />
                          </motion.div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-blue-700">🤖 {currentStep}</p>
                            <p className="text-blue-600">يتم تحليل المشاعر واكتشاف اللهجة الأردنية</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Progress value={analysisProgress} className="w-full h-4" />
                          <p className="text-center text-lg font-medium">{analysisProgress}% مكتمل</p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <h4 className="font-bold text-xl">📋 متطلبات الملف:</h4>
                    <div className="grid gap-4 text-lg">
                      <motion.div 
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <span>📄 يجب أن يكون الملف بصيغة CSV</span>
                      </motion.div>
                      <motion.div 
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <span>📝 يجب أن يحتوي على عمود "content" للنصوص</span>
                      </motion.div>
                      <motion.div 
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <span>📊 حد أقصى 1000 سجل للملف الواحد</span>
                      </motion.div>
                      <motion.div 
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <span>💾 حد أقصى 10 ميجابايت لحجم الملف</span>
                      </motion.div>
                    </div>
                  </div>

                  <Button onClick={downloadSampleFile} variant="outline" className="w-full h-14 text-lg">
                    <Download className="h-6 w-6 mr-3" />
                    📥 تحميل ملف نموذجي
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Results Display */}
            {uploadedData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="border-2 border-green-200 shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </motion.div>
                      🎉 نتائج التحليل بالذكاء الاصطناعي
                    </CardTitle>
                    <CardDescription className="text-lg">
                      🤖 تم تحليل {uploadedData.length} منشور بنجاح باستخدام نماذج MARBERT المتطورة
                      {errors.length > 0 && (
                        <span className="text-orange-600 block mt-1">
                          ⚠️ مع {errors.length} تحذير
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-8">
                      {/* Enhanced Summary Stats */}
                      <div className="grid gap-6 md:grid-cols-3">
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200"
                        >
                          <div className="text-5xl mb-3">😊</div>
                          <div className="text-3xl font-bold text-green-600">
                            {uploadedData.filter(item => item.sentiment === 'positive').length}
                          </div>
                          <div className="text-lg text-green-700 font-medium">منشور إيجابي 💚</div>
                        </motion.div>
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="text-center p-6 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200"
                        >
                          <div className="text-5xl mb-3">😞</div>
                          <div className="text-3xl font-bold text-red-600">
                            {uploadedData.filter(item => item.sentiment === 'negative').length}
                          </div>
                          <div className="text-lg text-red-700 font-medium">منشور سلبي 💔</div>
                        </motion.div>
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200"
                        >
                          <div className="text-5xl mb-3">😐</div>
                          <div className="text-3xl font-bold text-gray-600">
                            {uploadedData.filter(item => item.sentiment === 'neutral').length}
                          </div>
                          <div className="text-lg text-gray-700 font-medium">منشور محايد ⚖️</div>
                        </motion.div>
                      </div>

                      {/* Sample Results */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-6 w-6 text-primary" />
                          <h4 className="font-bold text-xl">🔍 عينة من النتائج المحللة:</h4>
                        </div>
                        {uploadedData.slice(0, 5).map((item, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="p-6 rounded-2xl border-2 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all"
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <div className="text-3xl">
                                {getSentimentEmoji(item.sentiment)}
                              </div>
                              <Badge 
                                className={`bg-gradient-to-r ${getSentimentColor(item.sentiment)} text-white text-lg px-4 py-2`}
                              >
                                {getSentimentText(item.sentiment)}
                              </Badge>
                              <Badge variant="outline" className="text-sm">
                                🇯🇴 {item.dialect === 'jordanian' ? 'أردنية' : 'غير أردنية'}
                              </Badge>
                              <span className="text-sm text-muted-foreground ml-auto">
                                🎯 ثقة: {Math.round(item.confidence * 100)}%
                              </span>
                            </div>
                            <p className="text-lg leading-relaxed" dir="rtl">{item.content}</p>
                          </motion.div>
                        ))}
                      </div>

                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-primary/20"
                      >
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <Brain className="h-6 w-6 text-primary" />
                          <Sparkles className="h-6 w-6 text-yellow-500" />
                        </div>
                        <p className="text-lg font-medium text-primary">
                          🤖 تم التحليل باستخدام نماذج MARBERT المتطورة للذكاء الاصطناعي
                        </p>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImprovedUpload;
