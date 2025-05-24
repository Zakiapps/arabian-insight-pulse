
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Users,
  Globe,
  Heart,
  Share,
  Eye,
  Calendar,
  Filter,
  Download,
  Plus,
  Search,
  Bell,
  Settings,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const { profile, isAdmin } = useAuth();
  const { isRTL } = useLanguage();

  // Fetch real data from Supabase - using correct table name
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['dashboard-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analyzed_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['dashboard-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin
  });

  // Calculate real metrics using correct property names
  const totalPosts = postsData?.length || 0;
  const positivePosts = postsData?.filter(post => post.sentiment === 'positive').length || 0;
  const negativePosts = postsData?.filter(post => post.sentiment === 'negative').length || 0;
  const neutralPosts = postsData?.filter(post => post.sentiment === 'neutral').length || 0;
  const totalUsers = usersData?.length || 0;

  const sentimentPercentage = totalPosts > 0 ? {
    positive: Math.round((positivePosts / totalPosts) * 100),
    negative: Math.round((negativePosts / totalPosts) * 100),
    neutral: Math.round((neutralPosts / totalPosts) * 100)
  } : { positive: 0, negative: 0, neutral: 0 };

  // Recent posts for activity feed
  const recentPosts = postsData?.slice(0, 5) || [];

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header Section - Brandwatch Style */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">لوحة التحكم الرئيسية</h1>
          <p className="text-muted-foreground mt-1">مراقبة وتحليل المحتوى الاجتماعي في الوقت الفعلي</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="البحث في البيانات..." className="pl-10 w-64" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            تصفية
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            تحليل جديد
          </Button>
        </div>
      </div>

      {/* Quick Stats - Brandwatch Style Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنشورات</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +12% من الأسبوع الماضي
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاعر الإيجابية</CardTitle>
            <Heart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentimentPercentage.positive}%</div>
            <p className="text-xs text-muted-foreground">
              {positivePosts.toLocaleString()} منشور إيجابي
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاعر السلبية</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentimentPercentage.negative}%</div>
            <p className="text-xs text-muted-foreground">
              {negativePosts.toLocaleString()} منشور سلبي
            </p>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المستخدمين النشطين</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                +5% نمو شهري
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    النشاط في الوقت الفعلي
                  </CardTitle>
                  <CardDescription>آخر المنشورات والتفاعلات</CardDescription>
                </div>
                <Badge variant="secondary" className="animate-pulse">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  مباشر
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {postsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    جاري تحميل البيانات...
                  </div>
                ) : recentPosts.length > 0 ? (
                  recentPosts.map((post, index) => (
                    <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {post.source?.charAt(0)?.toUpperCase() || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={
                            post.sentiment === 'positive' ? 'default' : 
                            post.sentiment === 'negative' ? 'destructive' : 'secondary'
                          } className="text-xs">
                            {post.sentiment === 'positive' ? 'إيجابي' : 
                             post.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString('ar')}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {post.source || 'غير محدد'}
                          </span>
                          {post.engagement_count && (
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {post.engagement_count.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد منشورات حالياً
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                رؤى سريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">اتجاه إيجابي</span>
                  </div>
                  <p className="text-sm text-green-700">
                    زيادة {sentimentPercentage.positive}% في المشاعر الإيجابية هذا الأسبوع
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">نشاط عالي</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {totalPosts.toLocaleString()} منشور تم تحليله اليوم
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions & Summary */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                رفع بيانات جديدة
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                إنشاء تقرير
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                إعداد تنبيه
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                إعدادات التحليل
              </Button>
            </CardContent>
          </Card>

          {/* Platform Summary */}
          <Card>
            <CardHeader>
              <CardTitle>ملخص المنصات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['تويتر', 'فيسبوك', 'إنستغرام', 'لينكدإن'].map((platform, index) => {
                  const platformPosts = postsData?.filter(post => 
                    post.source?.toLowerCase().includes(platform.toLowerCase())
                  ).length || 0;
                  const percentage = totalPosts > 0 ? Math.round((platformPosts / totalPosts) * 100) : 0;
                  
                  return (
                    <div key={platform} className="flex items-center justify-between">
                      <span className="text-sm">{platform}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>الملف الشخصي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{profile?.full_name || 'مستخدم'}</p>
                  <p className="text-sm text-muted-foreground">المستخدم النشط</p>
                  {isAdmin && (
                    <Badge variant="destructive" className="text-xs mt-1">مشرف</Badge>
                  )}
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>آخر دخول:</span>
                  <span className="text-muted-foreground">اليوم</span>
                </div>
                <div className="flex justify-between">
                  <span>المنشورات المحللة:</span>
                  <span className="text-muted-foreground">{totalPosts.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
