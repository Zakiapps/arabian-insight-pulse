import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUpload } from '@/contexts/UploadContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BarChart, 
  Copy, 
  Download, 
  FileText, 
  Globe, 
  Heart, 
  TrendingDown, 
  TrendingUp 
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import SentimentChart from './SentimentChart';
import ForecastChart from './ForecastChart';

interface AnalysisResultsProps {
  uploadId: string;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ uploadId }) => {
  const { uploads, analyses, summaries, forecasts, loading } = useUpload();
  const { isRTL } = useLanguage();
  
  // Find the upload and its related data
  const upload = uploads.find(u => u.id === uploadId);
  const analysis = analyses.find(a => a.upload_id === uploadId);
  const summary = analysis ? summaries.find(s => s.analysis_id === analysis.id) : null;
  const forecast = analysis ? forecasts.find(f => f.analysis_id === analysis.id) : null;
  
  const handleCopySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary.summary_text);
      toast.success(isRTL ? 'تم نسخ الملخص' : 'Summary copied to clipboard');
    }
  };
  
  const handleDownloadSummary = () => {
    if (summary) {
      const element = document.createElement('a');
      const file = new Blob([summary.summary_text], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `summary-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success(isRTL ? 'تم تنزيل الملخص' : 'Summary downloaded');
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!upload || !analysis) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center p-4">
            <p className="text-muted-foreground">
              {isRTL 
                ? 'لم يتم العثور على تحليل لهذا التحميل' 
                : 'No analysis found for this upload'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isRTL ? 'نتائج التحليل' : 'Analysis Results'}
        </CardTitle>
        <CardDescription>
          {isRTL 
            ? 'تحليل المشاعر واللهجة والملخص والتوقعات' 
            : 'Sentiment, dialect, summary, and forecast'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sentiment" className="space-y-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="sentiment">
              {isRTL ? 'المشاعر' : 'Sentiment'}
            </TabsTrigger>
            <TabsTrigger value="dialect">
              {isRTL ? 'اللهجة' : 'Dialect'}
            </TabsTrigger>
            <TabsTrigger value="summary">
              {isRTL ? 'الملخص' : 'Summary'}
            </TabsTrigger>
            <TabsTrigger value="forecast">
              {isRTL ? 'التوقعات' : 'Forecast'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sentiment" className="space-y-4">
            <div className="flex justify-center">
              <div className="text-center p-6 rounded-lg bg-muted/30 w-full max-w-md">
                <div className="mb-4">
                  {analysis.sentiment === 'positive' ? (
                    <div className="flex justify-center">
                      <div className="rounded-full bg-green-100 p-3">
                        <Heart className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  ) : analysis.sentiment === 'negative' ? (
                    <div className="flex justify-center">
                      <div className="rounded-full bg-red-100 p-3">
                        <TrendingDown className="h-8 w-8 text-red-600" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <div className="rounded-full bg-gray-100 p-3">
                        <BarChart className="h-8 w-8 text-gray-600" />
                      </div>
                    </div>
                  )}
                </div>
                
                <Badge className={
                  analysis.sentiment === 'positive' ? 'bg-green-500' :
                  analysis.sentiment === 'negative' ? 'bg-red-500' :
                  'bg-gray-500'
                }>
                  {analysis.sentiment === 'positive' ? (isRTL ? 'إيجابي' : 'Positive') :
                   analysis.sentiment === 'negative' ? (isRTL ? 'سلبي' : 'Negative') :
                   (isRTL ? 'محايد' : 'Neutral')}
                </Badge>
                
                <p className="mt-4 text-2xl font-bold">
                  {Math.round((analysis.sentiment_score || 0) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'درجة الثقة' : 'Confidence Score'}
                </p>
              </div>
            </div>
            
            <SentimentChart analysis={analysis} />
            
            <div className="text-sm text-muted-foreground text-center">
              <p>
                {isRTL 
                  ? `تم التحليل في ${format(new Date(analysis.created_at), 'PPpp', { locale: ar })}` 
                  : `Analyzed on ${format(new Date(analysis.created_at), 'PPpp')}`}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="dialect" className="space-y-4">
            <div className="flex justify-center">
              <div className="text-center p-6 rounded-lg bg-muted/30 w-full max-w-md">
                <div className="mb-4">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-blue-100 p-3">
                      <Globe className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <Badge variant="outline" className="bg-blue-500 text-white">
                  {analysis.dialect === 'jordanian' 
                    ? (isRTL ? 'لهجة أردنية' : 'Jordanian Dialect')
                    : (isRTL ? 'عربية فصحى' : 'Standard Arabic')}
                </Badge>
                
                <p className="mt-4 text-2xl font-bold">
                  {Math.round((analysis.dialect_confidence || 0) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'درجة الثقة' : 'Confidence Score'}
                </p>
              </div>
            </div>
            
            <Card className="bg-muted/10">
              <CardHeader>
                <CardTitle className="text-sm">
                  {isRTL ? 'خصائص اللهجة المكتشفة' : 'Detected Dialect Features'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {analysis.dialect === 'jordanian' 
                    ? (isRTL 
                        ? 'تم اكتشاف خصائص اللهجة الأردنية في هذا النص، مثل المصطلحات والتعبيرات المحلية الشائعة في الأردن.' 
                        : 'Jordanian dialect features were detected in this text, such as local terms and expressions common in Jordan.')
                    : (isRTL 
                        ? 'هذا النص مكتوب باللغة العربية الفصحى أو لهجة غير أردنية.' 
                        : 'This text is written in Standard Arabic or a non-Jordanian dialect.')}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="summary" className="space-y-4">
            {summary ? (
              <>
                <Card className="bg-muted/10">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm">
                        {isRTL ? 'ملخص النص' : 'Text Summary'}
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={handleCopySummary}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleDownloadSummary}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-line">
                      {summary.summary_text}
                    </p>
                  </CardContent>
                </Card>
                
                <div className="text-xs text-muted-foreground text-center">
                  <p>
                    {isRTL 
                      ? `تم إنشاء الملخص باستخدام ${summary.model_used || 'mT5'}` 
                      : `Summary generated using ${summary.model_used || 'mT5'}`}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-muted p-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {isRTL ? 'لا يوجد ملخص' : 'No Summary Available'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? 'لم يتم إنشاء ملخص لهذا التحليل بعد.' 
                    : 'No summary has been generated for this analysis yet.'}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="forecast" className="space-y-4">
            {forecast ? (
              <>
                <ForecastChart forecast={forecast} />
                
                <div className="text-xs text-muted-foreground text-center">
                  <p>
                    {isRTL 
                      ? `تم إنشاء التوقع لفترة ${forecast.forecast_period === 'daily' ? 'يومية' : forecast.forecast_period === 'weekly' ? 'أسبوعية' : 'شهرية'}` 
                      : `Forecast generated for ${forecast.forecast_period} period`}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-muted p-3">
                    <TrendingUp className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {isRTL ? 'لا توجد توقعات' : 'No Forecast Available'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? 'لم يتم إنشاء توقعات لهذا التحليل بعد.' 
                    : 'No forecast has been generated for this analysis yet.'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;