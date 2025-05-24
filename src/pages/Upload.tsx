import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EnhancedTextAnalyzer from "@/components/analysis/EnhancedTextAnalyzer";
import {
  Upload as UploadIcon,
  FileText,
  Database,
  Brain,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download
} from "lucide-react";
import Papa from 'papaparse';

// Define types for CSV data
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

const Upload = () => {
  const { isRTL } = useLanguage();
  const { profile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadedData, setUploadedData] = useState<AnalyzedData[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("يرجى رفع ملف CSV فقط");
      return;
    }

    setUploading(true);
    
    Papa.parse(file, {
      header: true,
      encoding: 'UTF-8',
      complete: async (results) => {
        try {
          const data = (results.data as CSVRow[]).filter((row: CSVRow) => 
            row.content && row.content.trim().length > 0
          );
          
          if (data.length === 0) {
            toast.error("لم يتم العثور على بيانات صالحة في الملف");
            setUploading(false);
            return;
          }

          // Process data in batches
          const batchSize = 10;
          const analyzedData: AnalyzedData[] = [];
          
          for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            
            for (const item of batch) {
              try {
                // Analyze each text
                const { data: analysisResult, error } = await supabase.functions.invoke('analyze-text', {
                  body: { text: item.content }
                });

                if (error) throw error;

                // Store in database
                const { error: insertError } = await supabase
                  .from('analyzed_posts')
                  .insert({
                    user_id: profile?.id,
                    content: item.content,
                    sentiment: analysisResult.sentiment,
                    sentiment_score: analysisResult.confidence,
                    is_jordanian_dialect: analysisResult.dialect === 'jordanian',
                    source: item.source || 'csv_upload',
                    engagement_count: item.engagement_count ? parseInt(item.engagement_count) : null
                  });

                if (insertError) throw insertError;

                analyzedData.push({
                  ...item,
                  sentiment: analysisResult.sentiment,
                  confidence: analysisResult.confidence,
                  dialect: analysisResult.dialect
                });
              } catch (error) {
                console.error('Error processing item:', error);
              }
            }
            
            // Show progress
            toast.info(`تمت معالجة ${Math.min(i + batchSize, data.length)} من ${data.length} عنصر`);
          }

          setUploadedData(analyzedData);
          toast.success(`تم تحليل ${analyzedData.length} منشور بنجاح`);
        } catch (error) {
          console.error('Error processing file:', error);
          toast.error("حدث خطأ أثناء معالجة الملف");
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        toast.error("حدث خطأ أثناء قراءة الملف");
        setUploading(false);
      }
    });
  };

  const downloadSampleFile = () => {
    const sampleData = [
      {
        content: "هذا منشور تجريبي إيجابي جداً ومفرح",
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
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sample_data.csv';
    link.click();
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 border">
            <UploadIcon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            رفع وتحليل البيانات
          </h1>
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          قم برفع ملفات البيانات أو تحليل النصوص مباشرة باستخدام أحدث تقنيات الذكاء الاصطناعي
        </p>
      </div>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            تحليل نص مفرد
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            رفع مجموعي
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-6">
          <EnhancedTextAnalyzer />
        </TabsContent>

        <TabsContent value="bulk" className="mt-6">
          <div className="space-y-6">
            {/* File Upload Section */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  رفع ملف CSV
                </CardTitle>
                <CardDescription>
                  قم برفع ملف CSV يحتوي على النصوص المراد تحليلها
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center">
                    <UploadIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-lg font-medium">انقر لرفع ملف CSV</span>
                      <p className="text-sm text-muted-foreground mt-2">
                        أو اسحب وأفلت الملف هنا
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
                  </div>

                  {uploading && (
                    <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="text-blue-700">جاري تحليل البيانات...</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">متطلبات الملف:</h4>
                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>يجب أن يكون الملف بصيغة CSV</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>يجب أن يحتوي على عمود "content" للنصوص</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span>يمكن إضافة أعمدة اختيارية: "source", "engagement_count"</span>
                    </div>
                  </div>
                </div>

                <Button onClick={downloadSampleFile} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  تحميل ملف نموذجي
                </Button>
              </CardContent>
            </Card>

            {/* Results Display */}
            {uploadedData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    نتائج التحليل
                  </CardTitle>
                  <CardDescription>
                    تم تحليل {uploadedData.length} منشور بنجاح
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Summary Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="text-2xl font-bold text-green-600">
                          {uploadedData.filter(item => item.sentiment === 'positive').length}
                        </div>
                        <div className="text-sm text-green-700">منشور إيجابي</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
                        <div className="text-2xl font-bold text-red-600">
                          {uploadedData.filter(item => item.sentiment === 'negative').length}
                        </div>
                        <div className="text-sm text-red-700">منشور سلبي</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="text-2xl font-bold text-gray-600">
                          {uploadedData.filter(item => item.sentiment === 'neutral').length}
                        </div>
                        <div className="text-sm text-gray-700">منشور محايد</div>
                      </div>
                    </div>

                    {/* Sample Results */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">عينة من النتائج:</h4>
                      {uploadedData.slice(0, 5).map((item, index) => (
                        <div key={index} className="p-3 rounded-lg border bg-muted/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={
                              item.sentiment === 'positive' ? 'default' : 
                              item.sentiment === 'negative' ? 'destructive' : 'secondary'
                            }>
                              {item.sentiment === 'positive' ? 'إيجابي' : 
                               item.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              ثقة: {Math.round(item.confidence * 100)}%
                            </span>
                          </div>
                          <p className="text-sm" dir="rtl">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Upload;
