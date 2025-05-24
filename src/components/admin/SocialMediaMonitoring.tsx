
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, RefreshCw, TrendingUp, AlertTriangle, Activity } from "lucide-react";

interface SocialMediaPost {
  id: string;
  platform: string;
  content: string;
  author_name?: string;
  category: string;
  sentiment: string;
  sentiment_score: number;
  engagement_count: number;
  is_viral: boolean;
  is_jordanian_dialect: boolean;
  scraped_at: string;
}

const SocialMediaMonitoring = () => {
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [scrapingActive, setScrapingActive] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    viral: 0,
    positive: 0,
    negative: 0,
    neutral: 0
  });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_media_posts')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPosts(data || []);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayPosts = data?.filter(post => 
        post.scraped_at.startsWith(today)
      ) || [];

      setStats({
        total: data?.length || 0,
        today: todayPosts.length,
        viral: data?.filter(post => post.is_viral).length || 0,
        positive: data?.filter(post => post.sentiment === 'positive').length || 0,
        negative: data?.filter(post => post.sentiment === 'negative').length || 0,
        neutral: data?.filter(post => post.sentiment === 'neutral').length || 0
      });

    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast.error('خطأ في جلب المنشورات');
    } finally {
      setLoading(false);
    }
  };

  const startScraping = async () => {
    setScrapingActive(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-social-media', {
        body: {}
      });

      if (error) throw error;
      toast.success(`تم معالجة ${data.processed} منشور بنجاح`);
      fetchPosts();
    } catch (error: any) {
      console.error('Error starting scraping:', error);
      toast.error('خطأ في بدء عملية الاستخراج');
    } finally {
      setScrapingActive(false);
    }
  };

  const sendTestAlert = async (type: 'daily' | 'weekly' | 'urgent') => {
    try {
      const { data, error } = await supabase.functions.invoke('send-alerts', {
        body: { type }
      });

      if (error) throw error;
      toast.success(`تم إرسال ${data.alerts_sent} تنبيه`);
    } catch (error: any) {
      console.error('Error sending alerts:', error);
      toast.error('خطأ في إرسال التنبيهات');
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Badge className="bg-green-500">إيجابي</Badge>;
      case 'negative':
        return <Badge className="bg-red-500">سلبي</Badge>;
      default:
        return <Badge variant="secondary">محايد</Badge>;
    }
  };

  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      'economics': 'اقتصاد',
      'politics': 'سياسة',
      'sports': 'رياضة',
      'education': 'تعليم',
      'other': 'أخرى'
    };
    return categories[category] || category;
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold">مراقبة وسائل التواصل الاجتماعي</h2>
        <p className="text-muted-foreground">استخراج وتحليل المنشورات من المنصات الاجتماعية</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنشورات</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">اليوم</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">رائج</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.viral}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إيجابي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.positive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">سلبي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.negative}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">محايد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.neutral}</div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>لوحة التحكم</CardTitle>
          <CardDescription>إدارة عمليات الاستخراج والتنبيهات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={startScraping} 
              disabled={scrapingActive}
              className="flex items-center gap-2"
            >
              {scrapingActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {scrapingActive ? 'جاري الاستخراج...' : 'بدء الاستخراج'}
            </Button>
            
            <Button variant="outline" onClick={fetchPosts} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              تحديث
            </Button>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => sendTestAlert('daily')}
              size="sm"
            >
              إرسال تنبيه يومي
            </Button>
            <Button 
              variant="outline" 
              onClick={() => sendTestAlert('weekly')}
              size="sm"
            >
              إرسال تنبيه أسبوعي
            </Button>
            <Button 
              variant="outline" 
              onClick={() => sendTestAlert('urgent')}
              size="sm"
            >
              إرسال تنبيه عاجل
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>المنشورات المحدثة</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنصة</TableHead>
                <TableHead>المحتوى</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>المشاعر</TableHead>
                <TableHead>التفاعل</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Badge variant={post.platform === 'twitter' ? 'default' : 'secondary'}>
                      {post.platform === 'twitter' ? 'تويتر' : 'فيسبوك'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">{post.content}</div>
                    {post.author_name && (
                      <div className="text-xs text-muted-foreground">{post.author_name}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getCategoryName(post.category)}</Badge>
                  </TableCell>
                  <TableCell>{getSentimentBadge(post.sentiment)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {post.engagement_count}
                      {post.is_viral && <TrendingUp className="h-3 w-3 text-red-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {post.is_jordanian_dialect && (
                        <Badge variant="outline" className="text-xs">لهجة أردنية</Badge>
                      )}
                      {post.is_viral && (
                        <Badge variant="destructive" className="text-xs">رائج</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(post.scraped_at).toLocaleDateString('ar-SA')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaMonitoring;
