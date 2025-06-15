
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { ArrowLeft, Download, Search, Filter, Brain, Newspaper, MessageSquare, Calendar, Target, Globe } from 'lucide-react';

interface UnifiedAnalysis {
  id: string;
  type: 'news' | 'text';
  input_text: string;
  sentiment: string;
  sentiment_score: number;
  emotion?: string;
  dialect?: string;
  dialect_confidence?: number;
  dialect_indicators?: string[];
  emotional_markers?: string[];
  language: string;
  created_at: string;
  source?: string;
  model_response?: any;
}

const ProjectAnalysesPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch unified analyses (both text_analyses and news analyses)
  const { data: analyses, isLoading, refetch } = useQuery({
    queryKey: ['unified-analyses', projectId, searchTerm, sentimentFilter, typeFilter],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      
      // Fetch text analyses
      let textQuery = supabase
        .from('text_analyses')
        .select('*')
        .eq('project_id', projectId);
      
      if (sentimentFilter !== 'all') {
        textQuery = textQuery.eq('sentiment', sentimentFilter);
      }
      
      const { data: textAnalyses, error: textError } = await textQuery
        .order('created_at', { ascending: false });
      
      if (textError) throw textError;

      // Fetch news analyses from scraped_news
      let newsQuery = supabase
        .from('scraped_news')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_analyzed', true);
      
      if (sentimentFilter !== 'all') {
        newsQuery = newsQuery.eq('sentiment', sentimentFilter);
      }
      
      const { data: newsAnalyses, error: newsError } = await newsQuery
        .order('created_at', { ascending: false });
      
      if (newsError) throw newsError;

      // Combine and format results
      const unifiedData: UnifiedAnalysis[] = [
        ...(textAnalyses || []).map(analysis => ({
          id: analysis.id,
          type: 'text' as const,
          input_text: analysis.input_text,
          sentiment: analysis.sentiment,
          sentiment_score: analysis.sentiment_score,
          emotion: analysis.emotion,
          dialect: analysis.dialect,
          dialect_confidence: analysis.dialect_confidence,
          dialect_indicators: analysis.dialect_indicators,
          emotional_markers: analysis.emotional_markers,
          language: analysis.language,
          created_at: analysis.created_at,
          source: 'تحليل نص مباشر',
          model_response: analysis.model_response
        })),
        ...(newsAnalyses || []).map(news => ({
          id: news.id,
          type: 'news' as const,
          input_text: news.title + (news.description ? '. ' + news.description : ''),
          sentiment: news.sentiment || 'neutral',
          sentiment_score: 0.5,
          emotion: news.emotion,
          dialect: news.dialect,
          dialect_confidence: news.dialect_confidence,
          dialect_indicators: news.dialect_indicators,
          emotional_markers: news.emotional_markers,
          language: news.language || 'ar',
          created_at: news.created_at,
          source: news.source_name || 'مقال إخباري'
        }))
      ];

      // Apply filters
      let filtered = unifiedData;
      
      if (typeFilter !== 'all') {
        filtered = filtered.filter(item => item.type === typeFilter);
      }
      
      if (searchTerm) {
        filtered = filtered.filter(item => 
          item.input_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.source?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    enabled: !!projectId,
  });

  const handleExportCSV = async () => {
    if (!analyses || analyses.length === 0) {
      toast({
        title: isRTL ? "لا توجد بيانات للتصدير" : "No data to export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      // Prepare CSV data
      const csvHeaders = [
        'النوع',
        'النص',
        'المشاعر',
        'درجة الثقة',
        'العاطفة',
        'اللهجة',
        'ثقة اللهجة',
        'المؤشرات',
        'العلامات العاطفية',
        'اللغة',
        'المصدر',
        'التاريخ'
      ];

      const csvData = analyses.map(analysis => [
        analysis.type === 'news' ? 'أخبار' : 'نص',
        `"${analysis.input_text.replace(/"/g, '""')}"`,
        analysis.sentiment === 'positive' ? 'إيجابي' : 
        analysis.sentiment === 'negative' ? 'سلبي' : 'محايد',
        analysis.sentiment_score?.toFixed(2) || '0.50',
        analysis.emotion || 'محايد',
        analysis.dialect === 'jordanian' ? 'أردني' : 'أخرى',
        analysis.dialect_confidence?.toFixed(0) || '0',
        `"${(analysis.dialect_indicators || []).join(', ')}"`,
        `"${(analysis.emotional_markers || []).join(', ')}"`,
        analysis.language === 'ar' ? 'عربي' : 'إنجليزي',
        `"${analysis.source || ''}"`,
        new Date(analysis.created_at).toLocaleDateString('ar-SA')
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `تحليلات_المشروع_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: isRTL ? "تم التصدير بنجاح" : "Export successful",
        description: isRTL ? "تم تحميل ملف CSV" : "CSV file downloaded",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: isRTL ? "خطأ في التصدير" : "Export error",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            تحليلات المشروع الشاملة
          </h1>
        </div>
        
        <Button
          onClick={handleExportCSV}
          disabled={isExporting || !analyses?.length}
          className="bg-green-600 hover:bg-green-700"
        >
          {isExporting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          تصدير CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلترة وبحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">البحث</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث في النصوص..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">المشاعر</label>
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المشاعر</SelectItem>
                  <SelectItem value="positive">إيجابي</SelectItem>
                  <SelectItem value="negative">سلبي</SelectItem>
                  <SelectItem value="neutral">محايد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">نوع التحليل</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="news">تحليل أخبار</SelectItem>
                  <SelectItem value="text">تحليل نص مباشر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">الإحصائيات</label>
              <div className="text-sm text-muted-foreground">
                المجموع: {analyses?.length || 0} تحليل
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>نتائج التحليلات</CardTitle>
          <CardDescription>
            جميع تحليلات MARBERT للنصوص والأخبار في هذا المشروع
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!analyses || analyses.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || sentimentFilter !== 'all' || typeFilter !== 'all' 
                  ? "لا توجد تحليلات تطابق معايير البحث" 
                  : "لا توجد تحليلات متاحة في هذا المشروع"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <div key={analysis.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {analysis.type === 'news' ? (
                        <Newspaper className="h-4 w-4 text-blue-600" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      )}
                      <span className="font-medium">
                        تحليل #{analysis.id.slice(0, 8)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {analysis.type === 'news' ? 'أخبار' : 'نص مباشر'}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Badge variant={
                        analysis.sentiment === 'positive' ? 'default' : 
                        analysis.sentiment === 'negative' ? 'destructive' : 'secondary'
                      }>
                        {analysis.sentiment === 'positive' ? 'إيجابي' :
                         analysis.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                      </Badge>
                      
                      {analysis.emotion && (
                        <Badge variant="outline" className="text-xs">
                          {analysis.emotion}
                        </Badge>
                      )}
                      
                      {analysis.dialect === 'jordanian' && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          🇯🇴 أردني
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {analysis.input_text}
                  </p>
                  
                  {/* Analysis Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-3">
                    <div>
                      <span className="font-medium">الثقة:</span> 
                      <span className="ml-1">{Math.round(analysis.sentiment_score * 100)}%</span>
                    </div>
                    
                    {analysis.dialect_confidence && (
                      <div>
                        <span className="font-medium">ثقة اللهجة:</span> 
                        <span className="ml-1">{Math.round(analysis.dialect_confidence)}%</span>
                      </div>
                    )}
                    
                    <div>
                      <span className="font-medium">اللغة:</span> 
                      <span className="ml-1">{analysis.language === 'ar' ? 'عربي' : 'إنجليزي'}</span>
                    </div>
                    
                    <div>
                      <span className="font-medium">المصدر:</span> 
                      <span className="ml-1">{analysis.source}</span>
                    </div>
                  </div>
                  
                  {/* Indicators */}
                  {analysis.dialect_indicators && analysis.dialect_indicators.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs text-blue-600 font-medium mr-2">مؤشرات أردنية:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.dialect_indicators.slice(0, 5).map((indicator, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            {indicator}
                          </Badge>
                        ))}
                        {analysis.dialect_indicators.length > 5 && (
                          <span className="text-xs text-blue-600">+{analysis.dialect_indicators.length - 5}</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {analysis.emotional_markers && analysis.emotional_markers.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs text-purple-600 font-medium mr-2">مؤشرات عاطفية:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.emotional_markers.slice(0, 3).map((marker, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-purple-50 text-purple-700">
                            {marker}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(analysis.created_at).toLocaleDateString('ar-SA')}</span>
                      <span>{new Date(analysis.created_at).toLocaleTimeString('ar-SA')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectAnalysesPage;
