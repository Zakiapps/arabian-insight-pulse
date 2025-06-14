import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Globe, 
  MessageSquare, 
  TrendingUp, 
  FileText, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Download, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Newspaper,
  Search
} from 'lucide-react';
import SentimentChart from './SentimentChart';
import DialectDistribution from './DialectDistribution';
import { useLanguage } from '@/contexts/LanguageContext';

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface Upload {
  id: string;
  project_id: string;
  source: string;
  title: string | null;
  raw_text: string;
  processed: boolean;
  created_at: string;
}

interface Analysis {
  id: string;
  upload_id: string;
  sentiment: string;
  sentiment_score: number;
  dialect: string;
  dialect_confidence: number;
  created_at: string;
  upload?: {
    raw_text: string;
    source: string;
  };
}

interface Summary {
  id: string;
  analysis_id: string;
  summary_text: string;
  language: string;
  created_at: string;
}

interface Forecast {
  id: string;
  analysis_id: string;
  forecast_json: {
    historical: Array<{
      date: string;
      sentiment_score: number;
    }>;
    forecast: Array<{
      date: string;
      sentiment_score: number;
      is_forecast: boolean;
    }>;
  };
  created_at: string;
}

interface ProjectDashboardProps {
  projectId: string;
}

const ProjectDashboard = ({ projectId }: ProjectDashboardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('analysis');
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [dialectFilter, setDialectFilter] = useState('all');
  const [manualText, setManualText] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  
  // Fetch project details
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      return data as Project;
    }
  });
  
  // Fetch uploads for this project
  const { data: uploads, isLoading: uploadsLoading } = useQuery({
    queryKey: ['uploads', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Upload[];
    }
  });
  
  // Fetch analyses for this project
  const { data: analyses, isLoading: analysesLoading } = useQuery({
    queryKey: ['analyses', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analyses')
        .select(`
          *,
          uploads (
            raw_text,
            source
          )
        `)
        .eq('uploads.project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Analysis[];
    }
  });
  
  // Fetch summaries for this project
  const { data: summaries, isLoading: summariesLoading } = useQuery({
    queryKey: ['summaries', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('summaries')
        .select(`
          *,
          analyses!inner (
            id,
            uploads!inner (
              project_id
            )
          )
        `)
        .eq('analyses.uploads.project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Summary[];
    }
  });
  
  // Fetch forecasts for this project
  const { data: forecasts, isLoading: forecastsLoading } = useQuery({
    queryKey: ['forecasts', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forecasts')
        .select(`
          *,
          analyses!inner (
            id,
            uploads!inner (
              project_id
            )
          )
        `)
        .eq('analyses.uploads.project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Forecast[];
    }
  });
  
  // Mutation for scraping NewsAPI
  const scrapeNewsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('scrape-newsapi', {
        body: { project_id: projectId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: isRTL ? "تم بدء عملية الاستخراج بنجاح" : "Scraping started successfully",
        description: isRTL ? "سيتم تحديث البيانات قريبًا" : "Data will be updated soon",
      });
      
      // Refetch uploads after a delay to allow for processing
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['uploads', projectId] });
      }, 5000);
    },
    onError: (error) => {
      toast({
        title: isRTL ? "فشل في بدء عملية الاستخراج" : "Failed to start scraping",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutation for analyzing content
  const analyzeContentMutation = useMutation({
    mutationFn: async (uploadId: string) => {
      const { data, error } = await supabase.functions.invoke('analyze-content', {
        body: { upload_id: uploadId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: isRTL ? "تم تحليل المحتوى بنجاح" : "Content analyzed successfully",
      });
      
      // Refetch analyses and summaries
      queryClient.invalidateQueries({ queryKey: ['analyses', projectId] });
      queryClient.invalidateQueries({ queryKey: ['summaries', projectId] });
      queryClient.invalidateQueries({ queryKey: ['uploads', projectId] });
    },
    onError: (error) => {
      toast({
        title: isRTL ? "فشل في تحليل المحتوى" : "Failed to analyze content",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutation for generating forecast
  const generateForecastMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-forecast', {
        body: { project_id: projectId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: isRTL ? "تم إنشاء التنبؤ بنجاح" : "Forecast generated successfully",
      });
      
      // Refetch forecasts
      queryClient.invalidateQueries({ queryKey: ['forecasts', projectId] });
    },
    onError: (error) => {
      toast({
        title: isRTL ? "فشل في إنشاء التنبؤ" : "Failed to generate forecast",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutation for manual text upload
  const uploadManualTextMutation = useMutation({
    mutationFn: async () => {
      // First, insert the text as an upload
      const { data: uploadData, error: uploadError } = await supabase
        .from('uploads')
        .insert({
          project_id: projectId,
          source: 'manual',
          title: manualTitle || 'Manual upload',
          raw_text: manualText,
          processed: false
        })
        .select()
        .single();
      
      if (uploadError) throw uploadError;
      
      // Then analyze the content
      return analyzeContentMutation.mutateAsync(uploadData.id);
    },
    onSuccess: () => {
      toast({
        title: isRTL ? "تم تحليل النص بنجاح" : "Text analyzed successfully",
      });
      
      // Clear form
      setManualText('');
      setManualTitle('');
      
      // Refetch data
      queryClient.invalidateQueries({ queryKey: ['uploads', projectId] });
      queryClient.invalidateQueries({ queryKey: ['analyses', projectId] });
      queryClient.invalidateQueries({ queryKey: ['summaries', projectId] });
    },
    onError: (error) => {
      toast({
        title: isRTL ? "فشل في تحليل النص" : "Failed to analyze text",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Filter analyses based on search and filters
  const filteredAnalyses = analyses?.filter(analysis => {
    const matchesSearch = analysis.upload?.raw_text.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesSentiment = sentimentFilter === 'all' || analysis.sentiment === sentimentFilter;
    const matchesDialect = dialectFilter === 'all' || analysis.dialect === dialectFilter;
    
    return matchesSearch && matchesSentiment && matchesDialect;
  });
  
  // Copy summary to clipboard
  const copySummary = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: isRTL ? "تم نسخ الملخص" : "Summary copied",
      description: isRTL ? "تم نسخ الملخص إلى الحافظة" : "Summary copied to clipboard",
    });
  };
  
  // Get sentiment badge
  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Badge className="bg-green-500">{isRTL ? 'إيجابي' : 'Positive'}</Badge>;
      case 'negative':
        return <Badge variant="destructive">{isRTL ? 'سلبي' : 'Negative'}</Badge>;
      default:
        return <Badge variant="secondary">{isRTL ? 'محايد' : 'Neutral'}</Badge>;
    }
  };
  
  // Get dialect badge
  const getDialectBadge = (dialect: string) => {
    switch (dialect) {
      case 'jordanian':
        return <Badge variant="outline">{isRTL ? 'أردني' : 'Jordanian'}</Badge>;
      default:
        return <Badge variant="outline">{dialect}</Badge>;
    }
  };
  
  // Get source badge
  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'newsapi':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Newspaper className="h-3 w-3" />
            NewsAPI
          </Badge>
        );
      case 'brightdata':
        <Badge variant="outline" className="flex items-center gap-1">
          <Globe className="h-3 w-3" />
          BrightData
        </Badge>;
      case 'manual':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {isRTL ? 'يدوي' : 'Manual'}
          </Badge>
        );
      default:
        return <Badge variant="outline">{source}</Badge>;
    }
  };
  
  // Loading state
  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Project Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{project?.name}</h1>
          <p className="text-muted-foreground">
            {project?.description || (isRTL ? 'مشروع تحليل المحتوى العربي' : 'Arabic content analysis project')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => scrapeNewsMutation.mutate()} 
            disabled={scrapeNewsMutation.isPending}
          >
            {scrapeNewsMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {isRTL ? 'جاري الاستخراج...' : 'Scraping...'}
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                {isRTL ? 'استخراج الأخبار' : 'Scrape News'}
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => generateForecastMutation.mutate()}
            disabled={generateForecastMutation.isPending || analysesLoading || analyses?.length === 0}
          >
            {generateForecastMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {isRTL ? 'جاري التنبؤ...' : 'Forecasting...'}
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                {isRTL ? 'إنشاء تنبؤ' : 'Generate Forecast'}
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'المحتوى المستخرج' : 'Extracted Content'}
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploads?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? 'عنصر محتوى' : 'content items'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'التحليلات' : 'Analyses'}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyses?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? 'تحليل مكتمل' : 'completed analyses'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'المشاعر الإيجابية' : 'Positive Sentiment'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {analyses?.filter(a => a.sentiment === 'positive').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? 'محتوى إيجابي' : 'positive content'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'اللهجة الأردنية' : 'Jordanian Dialect'}
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {analyses?.filter(a => a.dialect === 'jordanian').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? 'محتوى باللهجة الأردنية' : 'jordanian dialect content'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>{isRTL ? 'التحليل' : 'Analysis'}</span>
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>{isRTL ? 'التنبؤ' : 'Forecast'}</span>
          </TabsTrigger>
          <TabsTrigger value="summaries" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>{isRTL ? 'الملخصات' : 'Summaries'}</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>{isRTL ? 'تحليل نص' : 'Analyze Text'}</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{isRTL ? 'بحث' : 'Search'}</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={isRTL ? "بحث في المحتوى..." : "Search content..."}
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'المشاعر' : 'Sentiment'}</Label>
                  <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                      <SelectItem value="positive">{isRTL ? 'إيجابي' : 'Positive'}</SelectItem>
                      <SelectItem value="negative">{isRTL ? 'سلبي' : 'Negative'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'اللهجة' : 'Dialect'}</Label>
                  <Select value={dialectFilter} onValueChange={setDialectFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                      <SelectItem value="jordanian">{isRTL ? 'أردني' : 'Jordanian'}</SelectItem>
                      <SelectItem value="standard_arabic">{isRTL ? 'عربي فصيح' : 'Standard Arabic'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Analysis Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? 'توزيع المشاعر' : 'Sentiment Distribution'}</CardTitle>
              </CardHeader>
              <CardContent>
                {analysesLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : analyses?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {isRTL ? 'لا توجد تحليلات بعد' : 'No analyses yet'}
                    </p>
                  </div>
                ) : (
                  <SentimentChart analyses={analyses} />
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? 'توزيع اللهجات' : 'Dialect Distribution'}</CardTitle>
              </CardHeader>
              <CardContent>
                {analysesLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : analyses?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {isRTL ? 'لا توجد تحليلات بعد' : 'No analyses yet'}
                    </p>
                  </div>
                ) : (
                  <DialectDistribution analyses={analyses} />
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Analysis List */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'قائمة التحليلات' : 'Analysis List'}</CardTitle>
              <CardDescription>
                {isRTL 
                  ? `${filteredAnalyses?.length || 0} تحليل من إجمالي ${analyses?.length || 0}`
                  : `${filteredAnalyses?.length || 0} analyses out of ${analyses?.length || 0}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : filteredAnalyses?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {isRTL ? 'لا توجد تحليلات تطابق معايير البحث' : 'No analyses match your search criteria'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAnalyses?.map((analysis) => (
                    <Card key={analysis.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-wrap gap-2">
                              {getSentimentBadge(analysis.sentiment)}
                              {getDialectBadge(analysis.dialect)}
                              {getSourceBadge(analysis.upload?.source || '')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(analysis.created_at).toLocaleString()}
                            </div>
                          </div>
                          
                          <p className="text-sm line-clamp-3">
                            {analysis.upload?.raw_text}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">
                              {isRTL ? 'درجة الثقة:' : 'Confidence:'}
                            </div>
                            <Progress value={analysis.sentiment_score * 100} className="h-2 flex-1" />
                            <div className="text-xs font-medium">
                              {Math.round(analysis.sentiment_score * 100)}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'تنبؤ المشاعر' : 'Sentiment Forecast'}</CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'توقع اتجاهات المشاعر المستقبلية بناءً على البيانات التاريخية'
                  : 'Predict future sentiment trends based on historical data'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {forecastsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : forecasts?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {isRTL ? 'لا توجد تنبؤات بعد' : 'No forecasts yet'}
                  </p>
                  <Button 
                    onClick={() => generateForecastMutation.mutate()}
                    disabled={generateForecastMutation.isPending || analyses?.length === 0}
                  >
                    {generateForecastMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {isRTL ? 'جاري التنبؤ...' : 'Generating forecast...'}
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        {isRTL ? 'إنشاء تنبؤ' : 'Generate Forecast'}
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Forecast Chart */}
                  <div className="h-80">
                    {/* Implement forecast chart here */}
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        {isRTL ? 'الرسم البياني للتنبؤ' : 'Forecast chart goes here'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Forecast Details */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h3 className="font-medium mb-1">
                          {isRTL ? 'الاتجاه العام' : 'Overall Trend'}
                        </h3>
                        <div className="text-2xl font-bold text-green-500">
                          {isRTL ? 'إيجابي' : 'Positive'}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h3 className="font-medium mb-1">
                          {isRTL ? 'التغير المتوقع' : 'Expected Change'}
                        </h3>
                        <div className="text-2xl font-bold text-blue-500">+5.2%</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h3 className="font-medium mb-1">
                          {isRTL ? 'دقة التنبؤ' : 'Forecast Accuracy'}
                        </h3>
                        <div className="text-2xl font-bold">87%</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      {isRTL ? 'تصدير التنبؤ' : 'Export Forecast'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Summaries Tab */}
        <TabsContent value="summaries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'ملخصات المحتوى' : 'Content Summaries'}</CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'ملخصات آلية للمحتوى المحلل باستخدام نماذج التلخيص المتقدمة'
                  : 'Automatic summaries of analyzed content using advanced summarization models'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summariesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : summaries?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {isRTL ? 'لا توجد ملخصات بعد' : 'No summaries yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {summaries?.map((summary) => (
                    <Card key={summary.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">
                              {summary.language === 'ar' 
                                ? (isRTL ? 'عربي' : 'Arabic') 
                                : (isRTL ? 'إنجليزي' : 'English')}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {new Date(summary.created_at).toLocaleString()}
                            </div>
                          </div>
                          
                          <p className="text-sm">
                            {summary.summary_text}
                          </p>
                          
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copySummary(summary.summary_text)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              {isRTL ? 'نسخ' : 'Copy'}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              {isRTL ? 'تنزيل PDF' : 'Download PDF'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'تحليل نص جديد' : 'Analyze New Text'}</CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'أدخل نصًا عربيًا لتحليله وتلخيصه'
                  : 'Enter Arabic text to analyze and summarize'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'العنوان (اختياري)' : 'Title (Optional)'}</Label>
                  <Input 
                    placeholder={isRTL ? "عنوان المحتوى" : "Content title"}
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'النص العربي' : 'Arabic Text'}</Label>
                  <Textarea 
                    placeholder={isRTL ? "أدخل النص العربي هنا..." : "Enter Arabic text here..."}
                    className="min-h-[200px]"
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={() => uploadManualTextMutation.mutate()}
                  disabled={uploadManualTextMutation.isPending || !manualText.trim()}
                  className="w-full"
                >
                  {uploadManualTextMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {isRTL ? 'جاري التحليل...' : 'Analyzing...'}
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      {isRTL ? 'تحليل النص' : 'Analyze Text'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Unprocessed Uploads */}
          {uploads?.some(upload => !upload.processed) && (
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? 'محتوى بانتظار التحليل' : 'Content Awaiting Analysis'}</CardTitle>
                <CardDescription>
                  {isRTL 
                    ? 'محتوى تم استخراجه ولكن لم يتم تحليله بعد'
                    : 'Content that has been extracted but not yet analyzed'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploads?.filter(upload => !upload.processed).map((upload) => (
                    <Card key={upload.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-wrap gap-2">
                              {getSourceBadge(upload.source)}
                              <Badge variant="secondary">
                                {isRTL ? 'بانتظار التحليل' : 'Awaiting Analysis'}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(upload.created_at).toLocaleString()}
                            </div>
                          </div>
                          
                          {upload.title && (
                            <h3 className="font-medium">{upload.title}</h3>
                          )}
                          
                          <p className="text-sm line-clamp-3">
                            {upload.raw_text}
                          </p>
                          
                          <div className="flex justify-end">
                            <Button 
                              size="sm"
                              onClick={() => analyzeContentMutation.mutate(upload.id)}
                              disabled={analyzeContentMutation.isPending}
                            >
                              {analyzeContentMutation.isPending ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  {isRTL ? 'جاري التحليل...' : 'Analyzing...'}
                                </>
                              ) : (
                                <>
                                  <BarChart3 className="mr-2 h-4 w-4" />
                                  {isRTL ? 'تحليل' : 'Analyze'}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDashboard;