
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { socialMediaService, type ScrapedPost } from "@/services/socialMediaService";
import { Play, Pause, RefreshCw, TrendingUp, Activity, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const SocialMediaMonitoring = () => {
  const [posts, setPosts] = useState<ScrapedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [scrapingActive, setScrapingActive] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    byPlatform: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    bySentiment: {} as Record<string, number>,
    jordanianDialect: 0,
    viral: 0
  });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const postsData = await socialMediaService.getPosts({ limit: 50 });
      setPosts(postsData);

      const statsData = await socialMediaService.getPostStats();
      setStats(statsData);
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
      const result = await socialMediaService.triggerScraping();
      toast.success(`تم معالجة ${result.processed} منشور بنجاح`);
      fetchPosts();
    } catch (error: any) {
      console.error('Error starting scraping:', error);
      toast.error('خطأ في بدء عملية الاستخراج');
    } finally {
      setScrapingActive(false);
    }
  };

  const deleteSelectedPosts = async () => {
    if (selectedPosts.length === 0) {
      toast.error('يرجى اختيار منشورات للحذف');
      return;
    }

    try {
      await socialMediaService.deletePosts(selectedPosts);
      toast.success(`تم حذف ${selectedPosts.length} منشور`);
      setSelectedPosts([]);
      fetchPosts();
    } catch (error: any) {
      console.error('Error deleting posts:', error);
      toast.error('خطأ في حذف المنشورات');
    }
  };

  const deleteAllPosts = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع المنشورات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      return;
    }

    try {
      await socialMediaService.deleteAllPosts();
      toast.success('تم حذف جميع المنشورات');
      setPosts([]);
      fetchPosts();
    } catch (error: any) {
      console.error('Error deleting all posts:', error);
      toast.error('خطأ في حذف المنشورات');
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
      'politics': 'سياسة',
      'economics': 'اقتصاد',
      'religion': 'دين',
      'education': 'تعليم',
      'sports': 'رياضة',
      'general': 'عام'
    };
    return categories[category] || category;
  };

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(post => post.id));
    }
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
            <CardTitle className="text-sm font-medium">تويتر</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byPlatform.twitter || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">فيسبوك</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byPlatform.facebook || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">لهجة أردنية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.jordanianDialect}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">رائج</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.viral}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إيجابي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.bySentiment.positive || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>لوحة التحكم</CardTitle>
          <CardDescription>إدارة عمليات الاستخراج والمنشورات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-center justify-between">
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
                variant="destructive"
                onClick={deleteSelectedPosts}
                disabled={selectedPosts.length === 0}
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                حذف المحدد ({selectedPosts.length})
              </Button>
              
              <Button 
                variant="destructive"
                onClick={deleteAllPosts}
                size="sm"
              >
                حذف الكل
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>المنشورات المستخرجة</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={selectedPosts.length === posts.length && posts.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
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
                    <Checkbox
                      checked={selectedPosts.includes(post.id)}
                      onCheckedChange={() => togglePostSelection(post.id)}
                    />
                  </TableCell>
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
                  <TableCell>{getSentimentBadge(post.sentiment || 'neutral')}</TableCell>
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
                    {post.scraped_at ? new Date(post.scraped_at).toLocaleDateString('ar-SA') : ''}
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
