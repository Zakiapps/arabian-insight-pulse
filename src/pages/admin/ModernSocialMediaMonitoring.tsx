
import { ArabicSentimentChart } from '@/components/charts/ArabicSentimentChart';
import { FluidContainer, ModernGrid, ModernLayout } from '@/components/layouts/ModernLayout';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ModernButton, ToggleButton } from '@/components/ui/modern-button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { socialMediaService, type ScrapedPost } from "@/services/socialMediaService";
import { Activity, Eye, RefreshCw, Settings, Trash2, TrendingUp } from "lucide-react";
import { useEffect, useState } from 'react';
import { toast } from "sonner";

interface LocalStats {
  total: number;
  byPlatform: Record<string, number>;
  byCategory: Record<string, number>;
  bySentiment: Record<string, number>;
  jordanianDialect: number;
  viral: number;
}

const ModernSocialMediaMonitoring = () => {
  const [posts, setPosts] = useState<ScrapedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [scrapingActive, setScrapingActive] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [stats, setStats] = useState<LocalStats>({
    total: 0,
    byPlatform: {},
    byCategory: {},
    bySentiment: {},
    jordanianDialect: 0,
    viral: 0
  });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const postsData = await socialMediaService.getScrapedPosts({ limit: 50 });
      setPosts(postsData);

      const statsData = await socialMediaService.getStats();
      
      // Map the stats to our local interface
      setStats({
        total: statsData.totalPosts,
        byPlatform: statsData.platformDistribution.reduce((acc, item) => {
          acc[item.platform] = item.count;
          return acc;
        }, {} as Record<string, number>),
        byCategory: statsData.categoryDistribution.reduce((acc, item) => {
          acc[item.category] = item.count;
          return acc;
        }, {} as Record<string, number>),
        bySentiment: statsData.sentimentDistribution.reduce((acc, item) => {
          acc[item.sentiment] = item.count;
          return acc;
        }, {} as Record<string, number>),
        jordanianDialect: statsData.jordanianDialectPosts,
        viral: statsData.viralPosts
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
      await socialMediaService.scrapePlatform('twitter', ['jordan', 'عمان']);
      toast.success('تم بدء عملية الاستخراج بنجاح');
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

  const getSentimentBadge = (sentiment: string) => {
    const sentimentConfig = {
      positive: { label: 'إيجابي', color: 'bg-green-500 text-white' },
      negative: { label: 'سلبي', color: 'bg-red-500 text-white' },
      neutral: { label: 'محايد', color: 'bg-gray-500 text-white' }
    };

    const config = sentimentConfig[sentiment as keyof typeof sentimentConfig] || sentimentConfig.neutral;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const sentimentChartData = [
    {
      name: 'positive',
      arabicName: 'إيجابي',
      value: stats.bySentiment.positive || 0,
      color: '#22c55e'
    },
    {
      name: 'negative', 
      arabicName: 'سلبي',
      value: stats.bySentiment.negative || 0,
      color: '#ef4444'
    },
    {
      name: 'neutral',
      arabicName: 'محايد', 
      value: stats.bySentiment.neutral || 0,
      color: '#6b7280'
    }
  ];

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
    <FluidContainer>
      <ModernLayout spacing="lg">
        {/* Header */}
        <div className="flex justify-between items-center" dir="rtl">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">مراقبة وسائل التواصل الاجتماعي</h1>
            <p className="text-gray-600 mt-2">استخراج وتحليل المنشورات من المنصات الاجتماعية بذكاء</p>
          </div>
          <div className="flex gap-3">
            <ModernButton
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
              variant="outline"
            >
              <Eye className="h-4 w-4 ml-2" />
              {viewMode === 'grid' ? 'عرض جدول' : 'عرض شبكي'}
            </ModernButton>
            <ModernButton onClick={fetchPosts} loading={loading} variant="outline">
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </ModernButton>
          </div>
        </div>

        {/* Stats Overview */}
        <ModernGrid cols={6}>
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between" dir="rtl">
                <div>
                  <p className="text-sm font-medium text-blue-600">إجمالي المنشورات</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between" dir="rtl">
                <div>
                  <p className="text-sm font-medium text-green-600">إيجابي</p>
                  <p className="text-2xl font-bold text-green-900">{stats.bySentiment.positive || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between" dir="rtl">
                <div>
                  <p className="text-sm font-medium text-red-600">سلبي</p>
                  <p className="text-2xl font-bold text-red-900">{stats.bySentiment.negative || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-500 rotate-180" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between" dir="rtl">
                <div>
                  <p className="text-sm font-medium text-purple-600">لهجة أردنية</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.jordanianDialect}</p>
                </div>
                <span className="text-2xl">🇯🇴</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between" dir="rtl">
                <div>
                  <p className="text-sm font-medium text-orange-600">تويتر</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.byPlatform.twitter || 0}</p>
                </div>
                <span className="text-2xl">🐦</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-indigo-50 to-indigo-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between" dir="rtl">
                <div>
                  <p className="text-sm font-medium text-indigo-600">فيسبوك</p>
                  <p className="text-2xl font-bold text-indigo-900">{stats.byPlatform.facebook || 0}</p>
                </div>
                <span className="text-2xl">📘</span>
              </div>
            </CardContent>
          </Card>
        </ModernGrid>

        {/* Control Panel */}
        <Card className="border-0 bg-gradient-to-r from-gray-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-right" dir="rtl">
              <Settings className="h-6 w-6" />
              لوحة التحكم
            </CardTitle>
            <CardDescription className="text-right" dir="rtl">
              إدارة عمليات الاستخراج والتحليل
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center" dir="rtl">
              <div className="flex gap-3">
                <ToggleButton
                  enabled={scrapingActive}
                  onToggle={startScraping}
                  enabledText="إيقاف الاستخراج"
                  disabledText="بدء الاستخراج"
                  loading={scrapingActive}
                />
                <ModernButton
                  onClick={deleteSelectedPosts}
                  disabled={selectedPosts.length === 0}
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف المحدد ({selectedPosts.length})
                </ModernButton>
              </div>
              <div className="text-sm text-gray-500">
                آخر تحديث: {new Date().toLocaleString('ar-SA')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Analysis Chart */}
        <ModernGrid cols={2}>
          <ArabicSentimentChart 
            data={sentimentChartData}
            type="pie"
            title="توزيع المشاعر"
          />
          <ArabicSentimentChart 
            data={sentimentChartData}
            type="bar"
            title="إحصائيات المشاعر"
          />
        </ModernGrid>

        {/* Posts Display */}
        {viewMode === 'table' ? (
          <Card className="border-0">
            <CardHeader>
              <CardTitle className="text-right" dir="rtl">المنشورات المستخرجة</CardTitle>
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
                    <TableHead className="text-right">المنصة</TableHead>
                    <TableHead className="text-right">المحتوى</TableHead>
                    <TableHead className="text-right">المشاعر</TableHead>
                    <TableHead className="text-right">التفاعل</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
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
                        <div className="truncate" dir="rtl">{post.content}</div>
                      </TableCell>
                      <TableCell>{getSentimentBadge(post.sentiment || 'neutral')}</TableCell>
                      <TableCell>{post.engagement_count}</TableCell>
                      <TableCell>
                        {post.created_at ? new Date(post.created_at).toLocaleDateString('ar-SA') : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <ModernGrid cols={3}>
            {posts.map((post) => (
              <Card key={post.id} className="border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3" dir="rtl">
                    <Checkbox
                      checked={selectedPosts.includes(post.id)}
                      onCheckedChange={() => togglePostSelection(post.id)}
                    />
                    <Badge variant={post.platform === 'twitter' ? 'default' : 'secondary'}>
                      {post.platform === 'twitter' ? 'تويتر' : 'فيسبوك'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-3" dir="rtl">
                    {post.content}
                  </p>
                  <div className="flex justify-between items-center" dir="rtl">
                    {getSentimentBadge(post.sentiment || 'neutral')}
                    <span className="text-xs text-gray-500">
                      {post.engagement_count} تفاعل
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ModernGrid>
        )}
      </ModernLayout>
    </FluidContainer>
  );
};

export default ModernSocialMediaMonitoring;
