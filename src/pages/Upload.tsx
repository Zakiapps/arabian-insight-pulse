import { useState } from "react";
import { Upload as UploadIcon, FileText, X, Check, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Papa from "papaparse";
import AdvancedTextAnalyzer from "@/components/analysis/AdvancedTextAnalyzer";

const Upload = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const processCSV = async (text: string): Promise<any[]> => {
    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        complete: (results) => {
          resolve(results.data);
        }
      });
    });
  };

  const analyzeSentiment = (text: string) => {
    // Enhanced sentiment analysis logic
    const positiveWords = ['رائع', 'ممتاز', 'جميل', 'أحب', 'سعيد', 'مذهل', 'عظيم'];
    const negativeWords = ['سيء', 'فظيع', 'أكره', 'حزين', 'مؤلم', 'غاضب', 'مخيب'];
    
    const textLower = text.toLowerCase();
    let score = 0.5; // neutral baseline
    
    positiveWords.forEach(word => {
      if (textLower.includes(word)) score += 0.1;
    });
    
    negativeWords.forEach(word => {
      if (textLower.includes(word)) score -= 0.1;
    });
    
    // Clamp score between 0 and 1
    score = Math.max(0, Math.min(1, score));
    
    let sentiment;
    if (score > 0.6) sentiment = 'positive';
    else if (score < 0.4) sentiment = 'negative';
    else sentiment = 'neutral';
    
    return { sentiment, score };
  };

  const detectDialect = (text: string) => {
    const jordanianTerms = [
      "زلمة", "يا زلمة", "خرفنة", "تسليك", "احشش", "انكب", "راعي", "هسا", "شو", "كيفك",
      "إربد", "عمان", "واللهي", "عال", "بدك", "مش عارف", "تمام", "فش", "عالسريع", 
      "يلا", "خلص", "دبس", "بسطة", "جاي", "روح", "حياتي", "عن جد", "بكفي", 
      "ما بدي", "طيب", "قديش", "وينك", "عالطول", "شايف", "هسه", "بتعرف", 
      "بس", "يعني", "كتير", "شوي", "حبتين"
    ];
    
    const textLower = text.toLowerCase();
    return jordanianTerms.some(term => textLower.includes(term.toLowerCase()));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    
    if (file && !file.name.endsWith('.csv')) {
      toast.error("يرجى اختيار ملف CSV");
      setSelectedFile(null);
      event.target.value = '';
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    const file = event.dataTransfer.files?.[0] || null;
    setSelectedFile(file);
    
    if (file && !file.name.endsWith('.csv')) {
      toast.error("يرجى اختيار ملف CSV");
      setSelectedFile(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !user) return;
    
    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    
    try {
      const text = await selectedFile.text();
      const records = await processCSV(text);
      
      if (records.length === 0 || !records[0].content) {
        toast.error("تنسيق CSV غير صالح. يرجى التأكد من وجود عمود 'content'");
        setUploadStatus('error');
        setIsUploading(false);
        return;
      }
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 200);
      
      const batchSize = 10;
      let processed = 0;
      let postsProcessed = 0;
      
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const postsToInsert = batch.map(record => {
          const sentimentResult = analyzeSentiment(record.content);
          return {
            user_id: user.id,
            content: record.content,
            source: record.platform || 'csv-upload',
            sentiment: sentimentResult.sentiment,
            sentiment_score: sentimentResult.score,
            is_jordanian_dialect: detectDialect(record.content),
            engagement_count: record.engagement ? parseInt(record.engagement) : 0,
          };
        });
        
        const { error } = await supabase
          .from('analyzed_posts')
          .insert(postsToInsert);
          
        if (error) {
          console.error("Error inserting records:", error);
          toast.error("حدث خطأ أثناء معالجة السجلات");
          setUploadStatus('error');
          setIsUploading(false);
          clearInterval(progressInterval);
          return;
        }
        
        processed++;
        postsProcessed += batch.length;
        
        setUploadProgress(Math.min(90 + (processed / (Math.ceil(records.length / batchSize)) * 10), 100));
      }
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      setIsUploading(false);
      toast.success(`تم تحميل وتحليل ${postsProcessed} منشور بنجاح!`);
      
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("حدث خطأ أثناء تحميل الملف");
      setUploadStatus('error');
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          {t('Data Upload')}
        </h1>
        <p className="text-muted-foreground">
          {t('Upload social media posts for AI sentiment and dialect analysis')}
        </p>
      </div>

      <Tabs defaultValue="advanced" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            تحليل متقدم
          </TabsTrigger>
          <TabsTrigger value="batch">{t('Batch Upload')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="advanced">
          <AdvancedTextAnalyzer />
        </TabsContent>
        
        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>{t('Upload CSV File')}</CardTitle>
              <CardDescription>
                {t('Upload a CSV file containing Arabic social media posts for batch analysis.')}
                <br />
                {t('The CSV should have a "content" column with the Arabic text.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadStatus === 'success' ? (
                <Alert className="bg-green-500/10 border-green-500/30 text-green-500">
                  <Check className="h-4 w-4" />
                  <AlertTitle>{t('Upload Successful')}</AlertTitle>
                  <AlertDescription>
                    {t('Your file has been uploaded and is being processed. You will be notified when the analysis is complete.')}
                  </AlertDescription>
                </Alert>
              ) : uploadStatus === 'error' ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t('Upload Failed')}</AlertTitle>
                  <AlertDescription>
                    {t('There was an error uploading your file. Please try again.')}
                  </AlertDescription>
                </Alert>
              ) : (
                <div 
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById('csv-upload')?.click()}
                >
                  <Input 
                    id="csv-upload"
                    type="file" 
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <UploadIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{t('Click or drag file to upload')}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('Upload a CSV file with your social media posts')}<br />
                    {t('File should be under 10MB')}
                  </p>
                </div>
              )}

              {selectedFile && uploadStatus !== 'success' && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">{uploadProgress}% مكتمل</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            {selectedFile && uploadStatus !== 'success' && (
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
                  {t('Cancel')}
                </Button>
                <Button onClick={handleFileUpload} disabled={isUploading}>
                  {isUploading ? "جاري التحميل..." : t('Upload & Analyze')}
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>{t('Upload Guidelines')}</CardTitle>
          <CardDescription>
            {t('Tips for preparing your data for analysis')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <h3 className="text-base font-semibold">{t('CSV File Format')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('Your CSV file should have the following columns:')}
              </p>
              <ul className="list-disc pr-5 text-sm text-muted-foreground">
                <li>{t('content: The Arabic text content (required)')}</li>
                <li>{t('date: Post date in YYYY-MM-DD format (optional)')}</li>
                <li>{t('platform: Social media platform source (optional)')}</li>
                <li>{t('engagement: Number representing engagement count (optional)')}</li>
              </ul>
            </div>
            
            <div className="grid gap-2">
              <h3 className="text-base font-semibold">{t('Example Format')}</h3>
              <div className="bg-muted/50 p-3 rounded-md overflow-x-auto" dir="ltr">
                <code className="text-xs">
                  content,date,platform,engagement<br />
                  "الحكومة تعلن عن تخفيض أسعار المحروقات",2023-06-01,Twitter,145<br />
                  "زيادة الإقبال على المراكز التجارية خلال العطلة",2023-06-02,Facebook,278
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;
