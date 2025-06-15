import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  CreditCard, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MessageSquare,
  AlertCircle,
  PieChart,
  BarChart,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { useHuggingFaceConfig } from "@/hooks/useHuggingFaceConfig";

const data = [
  { name: 'يناير', revenue: 4000, users: 24 },
  { name: 'فبراير', revenue: 3000, users: 13 },
  { name: 'مارس', revenue: 2000, users: 9 },
  { name: 'أبريل', revenue: 2780, users: 39 },
  { name: 'مايو', revenue: 1890, users: 48 },
  { name: 'يونيو', revenue: 2390, users: 38 },
  { name: 'يوليو', revenue: 3490, users: 43 },
];

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeDirection = "up", 
  loading = false,
  bgColor
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  change?: string;
  changeDirection?: "up" | "down";
  loading?: boolean;
  bgColor?: string;
}) => {
  return (
    <Card className="overflow-hidden">
      <div className={`${bgColor || 'bg-primary/5'} px-6 py-5`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{title}</h3>
          <div className={`${bgColor ? 'bg-white/20' : 'bg-primary/10'} p-2 rounded-full`}>
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold">
            {loading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              value
            )}
          </div>
          {change && (
            <p className="text-xs mt-2 flex items-center">
              {changeDirection === "up" ? (
                <ArrowUpRight className="ml-1 h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="ml-1 h-3 w-3 text-red-500" />
              )}
              <span className={changeDirection === "up" ? "text-green-500" : "text-red-500"}>
                {change}
              </span>
              <span className="mx-1">منذ الشهر الماضي</span>
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

const InsightCard = ({ title, value, icon: Icon, description }: { title: string; value: string; icon: React.ElementType, description: string }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="bg-primary/10 p-2 rounded-full">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <Badge variant="outline" className="text-xs">اليوم</Badge>
        </div>
        <div className="mt-6">
          <div className="text-3xl font-bold">{value}</div>
          <h3 className="text-sm font-medium text-muted-foreground mt-1">{title}</h3>
        </div>
        <div className="mt-6 text-xs text-muted-foreground">
          {description}
        </div>
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    subscriptionCount: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [hfStatus, setHfStatus] = useState<"loading" | "found" | "missing">("loading");
  const { config: hfConfig, loading: hfLoading, error: hfError } = useHuggingFaceConfig();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { data: userCount },
          { data: subscriptionCount },
          { data: revenue }
        ] = await Promise.all([
          supabase.rpc('get_user_count'),
          supabase.rpc('get_active_subscription_count'),
          supabase.rpc('get_total_revenue')
        ]);

        setStats({
          userCount: userCount || 0,
          subscriptionCount: subscriptionCount || 0,
          revenue: revenue || 0
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("huggingface_configs")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error || !data) setHfStatus("missing");
        else setHfStatus("found");
      });
    return () => { mounted = false; };
  }, []);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Convert cents to dollars
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">مرحباً بك في لوحة القيادة</h1>
          <p className="text-muted-foreground mt-1">
            هذا هو ملخص أداء النظام والإحصاءات الرئيسية
          </p>
        </div>
        <Button className="gap-2">
          تقرير كامل
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard 
          title="إجمالي المستخدمين" 
          value={stats.userCount} 
          icon={Users} 
          change="12%" 
          changeDirection="up"
          loading={loading}
          bgColor="bg-blue-500/10"
        />
        <StatsCard 
          title="الاشتراكات النشطة" 
          value={stats.subscriptionCount} 
          icon={CreditCard} 
          change="5%" 
          changeDirection="up"
          loading={loading}
          bgColor="bg-green-500/10"
        />
        <StatsCard 
          title="إجمالي الإيرادات" 
          value={formatCurrency(stats.revenue)} 
          icon={DollarSign} 
          change="8%" 
          changeDirection="up"
          loading={loading}
          bgColor="bg-purple-500/10"
        />
        <StatsCard 
          title="معدل الاحتفاظ" 
          value="82%" 
          icon={PieChart} 
          change="2%" 
          changeDirection="down"
          loading={loading}
          bgColor="bg-orange-500/10"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle>الإيرادات الشهرية</CardTitle>
              <Button variant="ghost" size="sm">المزيد</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'الإيرادات']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      borderColor: 'hsl(var(--border))',
                      textAlign: 'right',
                      direction: 'rtl'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المستخدمين الجدد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={data}
                  margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}`, 'مستخدم']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      borderColor: 'hsl(var(--border))',
                      textAlign: 'right',
                      direction: 'rtl'
                    }}
                  />
                  <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <InsightCard 
          title="عدد المشاهدات" 
          value="1,234" 
          icon={Eye}
          description="إجمالي مشاهدات المحتوى في اليوم الحالي"
        />
        <InsightCard 
          title="المنشورات المحللة" 
          value="526" 
          icon={MessageSquare}
          description="عدد المنشورات التي تم تحليلها اليوم"
        />
        <InsightCard 
          title="التنبيهات النشطة" 
          value="48" 
          icon={AlertCircle}
          description="تنبيهات المشاعر السلبية والمواضيع الحساسة"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>أحدث المستخدمين</CardTitle>
              <Button variant="ghost" size="sm">عرض الكل</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 mt-2">
              {Array.from({length: 5}).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium">{String.fromCharCode(65 + i)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">مستخدم {i + 1}</div>
                      <div className="text-xs text-muted-foreground">user{i+1}@example.com</div>
                    </div>
                  </div>
                  <Badge variant={i % 2 === 0 ? "default" : "outline"}>
                    {i % 2 === 0 ? 'مدفوع' : 'مجاني'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>أحدث العمليات</CardTitle>
              <Button variant="ghost" size="sm">عرض الكل</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 mt-2">
              {Array.from({length: 5}).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full ${i % 3 === 0 ? 'bg-green-500/10' : i % 3 === 1 ? 'bg-blue-500/10' : 'bg-orange-500/10'} flex items-center justify-center`}>
                      <DollarSign className={`h-4 w-4 ${i % 3 === 0 ? 'text-green-500' : i % 3 === 1 ? 'text-blue-500' : 'text-orange-500'}`} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{i % 3 === 0 ? 'اشتراك جديد' : i % 3 === 1 ? 'تجديد اشتراك' : 'ترقية باقة'}</div>
                      <div className="text-xs text-muted-foreground">منذ {i + 1} ساعات</div>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${i % 2 === 0 ? 'text-green-500' : ''}`}>
                    {i % 2 === 0 ? '+' : ''} ${(i + 1) * 25}.00
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hugging Face Config Card */}
      <Card className="border-l-4 border-purple-500 shadow flex flex-row items-center mt-6">
        <CardHeader className="flex flex-row items-center gap-3 py-6">
          <Shield className="h-8 w-8 text-purple-500" />
          <div>
            <CardTitle className="text-lg font-bold">
              إعدادات Hugging Face
            </CardTitle>
            <CardDescription>
              إعداد نقاط النهاية الخاصة بنماذج Hugging Face.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-end justify-end flex-1">
          {hfLoading ? (
            <span className="text-muted-foreground text-sm">جار التحميل...</span>
          ) : hfConfig ? (
            <span className="text-green-600 text-sm font-semibold">تم الإعداد</span>
          ) : (
            <span className="text-red-600 text-sm font-semibold">غير مفعل</span>
          )}
          <Link
            to="/admin/huggingface-config"
            className="mt-2 px-4 py-1 bg-purple-100 text-purple-700 text-xs rounded hover:bg-purple-200 transition"
          >
            إعداد أو تعديل
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
