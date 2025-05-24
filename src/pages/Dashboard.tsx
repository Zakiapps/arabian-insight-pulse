
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Trash2, 
  RefreshCw,
  Settings,
  AlertTriangle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

interface DashboardStats {
  total_posts: number;
  positive_posts: number;
  negative_posts: number;
  neutral_posts: number;
  jordanian_posts: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    total_posts: 0,
    positive_posts: 0,
    negative_posts: 0,
    neutral_posts: 0,
    jordanian_posts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_sentiment_stats', {
        user_id_param: user?.id
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setStats({
          total_posts: Number(data[0].total_posts) || 0,
          positive_posts: Number(data[0].positive_posts) || 0,
          negative_posts: Number(data[0].negative_posts) || 0,
          neutral_posts: Number(data[0].neutral_posts) || 0,
          jordanian_posts: Number(data[0].jordanian_posts) || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error("خطأ في جلب الإحصائيات");
    } finally {
      setLoading(false);
    }
  };

  const clearPosts = async () => {
    if (!confirm("هل أنت متأكد من حذف جميع المنشورات؟ لا يمكن التراجع عن هذا الإجراء.")) {
      return;
    }

    setClearing(true);
    try {
      const { error } = await supabase.rpc('clear_user_posts');
      
      if (error) throw error;
      
      toast.success("تم حذف جميع المنشورات بنجاح");
      fetchStats(); // Refresh stats
    } catch (error: any) {
      console.error('Error clearing posts:', error);
      toast.error("خطأ في حذف المنشورات");
    } finally {
      setClearing(false);
    }
  };

  const positivePercentage = stats.total_posts > 0 ? (stats.positive_posts / stats.total_posts) * 100 : 0;
  const negativePercentage = stats.total_posts > 0 ? (stats.negative_posts / stats.total_posts) * 100 : 0;
  const jordanianPercentage = stats.total_posts > 0 ? (stats.jordanian_posts / stats.total_posts) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground">نظرة شاملة على تحليل المشاعر</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchStats}
            disabled={loading}
            size="sm"
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
          <Button
            variant="destructive"
            onClick={clearPosts}
            disabled={clearing || stats.total_posts === 0}
            size="sm"
          >
            <Trash2 className="h-4 w-4 ml-2" />
            مسح المنشورات
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/analysis-settings">
              <Settings className="h-4 w-4 ml-2" />
              الإعدادات
            </Link>
          </Button>
        </div>
      </div>

      {stats.total_posts === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            لم يتم تحليل أي منشورات بعد. 
            <Link to="/upload" className="text-primary hover:underline mr-1">
              ابدأ بتحميل البيانات
            </Link>
            لعرض الإحصائيات.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنشورات</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_posts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">منشور محلل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاعر الإيجابية</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.positive_posts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {positivePercentage.toFixed(1)}% من المجموع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاعر السلبية</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.negative_posts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {negativePercentage.toFixed(1)}% من المجموع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">اللهجة الأردنية</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.jordanian_posts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {jordanianPercentage.toFixed(1)}% من المجموع
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>تحليل المشاعر</CardTitle>
            <CardDescription>توزيع المشاعر في المنشورات المحللة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>إيجابي</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{stats.positive_posts}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {positivePercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>محايد</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{stats.neutral_posts}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {stats.total_posts > 0 ? ((stats.neutral_posts / stats.total_posts) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>سلبي</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{stats.negative_posts}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {negativePercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>روابط سريعة</CardTitle>
            <CardDescription>الوصول السريع للأدوات الرئيسية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button asChild variant="outline" className="justify-start">
                <Link to="/upload">
                  <MessageCircle className="h-4 w-4 ml-2" />
                  تحميل البيانات
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start">
                <Link to="/posts">
                  <BarChart3 className="h-4 w-4 ml-2" />
                  عرض المنشورات
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start">
                <Link to="/reports">
                  <TrendingUp className="h-4 w-4 ml-2" />
                  التقارير
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start">
                <Link to="/alerts">
                  <AlertTriangle className="h-4 w-4 ml-2" />
                  التنبيهات
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
