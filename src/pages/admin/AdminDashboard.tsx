
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  CreditCard, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeDirection = "up", 
  loading = false 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  change?: string;
  changeDirection?: "up" | "down";
  loading?: boolean;
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          ) : (
            value
          )}
        </div>
        {change && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            {changeDirection === "up" ? (
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
            )}
            <span className={changeDirection === "up" ? "text-green-500" : "text-red-500"}>
              {change}
            </span>
            <span className="ms-1">منذ الشهر الماضي</span>
          </p>
        )}
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

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Convert cents to dollars
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">لوحة الإدارة</h1>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard 
          title="إجمالي المستخدمين" 
          value={stats.userCount} 
          icon={Users} 
          change="12%" 
          changeDirection="up"
          loading={loading}
        />
        <StatsCard 
          title="الاشتراكات النشطة" 
          value={stats.subscriptionCount} 
          icon={CreditCard} 
          change="5%" 
          changeDirection="up"
          loading={loading}
        />
        <StatsCard 
          title="إجمالي الإيرادات" 
          value={formatCurrency(stats.revenue)} 
          icon={DollarSign} 
          change="8%" 
          changeDirection="up"
          loading={loading}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الاشتراكات حسب الخطة</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {/* We would add a chart here in a real application */}
            <div className="h-full w-full flex items-center justify-center bg-muted/30 rounded-md">
              <p className="text-muted-foreground">مخطط توزيع الاشتراكات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>الإيرادات الشهرية</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {/* We would add a chart here in a real application */}
            <div className="h-full w-full flex items-center justify-center bg-muted/30 rounded-md">
              <p className="text-muted-foreground">مخطط الإيرادات الشهرية</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
