
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  FileText,
  Settings,
  Bell,
  TrendingUp,
  Globe,
  MessageSquare,
  Languages,
  PieChart,
  LogOut,
  Star,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); // تصحيح: استخدام /login بدلاً من /signin
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login');
    }
  };

  const mainMenuItems = [
    {
      title: "لوحة التحكم",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "رفع البيانات",
      url: "/dashboard/upload",
      icon: Upload,
    },
    {
      title: "المنشورات",
      url: "/dashboard/posts",
      icon: FileText,
    },
    {
      title: "التقارير",
      url: "/dashboard/reports",
      icon: BarChart3,
    },
    {
      title: "التنبيهات",
      url: "/dashboard/alerts",
      icon: Bell,
    },
    {
      title: "المراجعات",
      url: "/dashboard/reviews",
      icon: Star,
    },
    {
      title: "خطط الاشتراك",
      url: "/pricing",
      icon: CreditCard,
    },
  ];

  // تصحيح روابط أدوات التحليل
  const analysisMenuItems = [
    {
      title: "تحليل المشاعر",
      url: "/dashboard/sentiment-analysis", // تصحيح الرابط
      icon: TrendingUp,
    },
    {
      title: "توزيع الفئات",
      url: "/dashboard/category-distribution", // تصحيح الرابط
      icon: PieChart,
    },
    {
      title: "توزيع المنصات",
      url: "/dashboard/platform-distribution", // تصحيح الرابط
      icon: Globe,
    },
    {
      title: "أهم المواضيع",
      url: "/dashboard/top-topics", // تصحيح الرابط
      icon: MessageSquare,
    },
    {
      title: "كشف اللهجة",
      url: "/dashboard/dialect-detection", // تصحيح الرابط
      icon: Languages,
    },
  ];

  const settingsMenuItems = [
    {
      title: "الإعدادات",
      url: "/dashboard/settings",
      icon: Settings,
    },
    {
      title: "إعدادات التحليل",
      url: "/dashboard/analysis-settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar side="right" className="border-l bg-card" collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <h2 className="font-bold text-lg text-right">رؤى عربية</h2>
            <p className="text-xs text-muted-foreground text-right">مراقبة وسائل التواصل الاجتماعي</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-foreground/70 mb-2 text-right group-data-[collapsible=icon]:hidden">
            القائمة الرئيسية
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-right">
                      <span className="group-data-[collapsible=icon]:hidden flex-1">{item.title}</span>
                      <item.icon className="h-4 w-4 shrink-0" />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-foreground/70 mb-2 text-right group-data-[collapsible=icon]:hidden">
            أدوات التحليل
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-right">
                      <span className="group-data-[collapsible=icon]:hidden flex-1">{item.title}</span>
                      <item.icon className="h-4 w-4 shrink-0" />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-foreground/70 mb-2 text-right group-data-[collapsible=icon]:hidden">
            الإعدادات
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-right">
                      <span className="group-data-[collapsible=icon]:hidden flex-1">{item.title}</span>
                      <item.icon className="h-4 w-4 shrink-0" />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0 text-right group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium truncate">
              {profile?.full_name || 'مستخدم'}
            </p>
            <div className="flex items-center gap-2 justify-end">
              <p className="text-xs text-muted-foreground">{profile?.role || 'عضو'}</p>
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || 'M'}
            </AvatarFallback>
          </Avatar>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="mt-2 w-full justify-end text-destructive hover:text-destructive"
        >
          <span className="group-data-[collapsible=icon]:hidden ml-2">تسجيل الخروج</span>
          <LogOut className="h-4 w-4" />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
