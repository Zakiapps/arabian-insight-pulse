
import { Link, useLocation } from "react-router-dom";
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
  ChevronLeft,
  LayoutDashboard,
  MessageSquare,
  Upload,
  Bell,
  FileText,
  BarChart3,
  PieChart,
  Globe,
  TrendingUp,
  Languages,
  Settings,
  Users2,
  CreditCard,
  DollarSign,
  Receipt,
  BadgePercent,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const AppSidebar = () => {
  const location = useLocation();
  const { profile, isAdmin } = useAuth();
  const { isRTL } = useLanguage();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  const mainMenuItems = [
    {
      title: "لوحة التحكم",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "المنشورات",
      url: "/dashboard/posts",
      icon: MessageSquare,
    },
    {
      title: "رفع البيانات",
      url: "/dashboard/upload",
      icon: Upload,
    },
    {
      title: "التنبيهات",
      url: "/dashboard/alerts",
      icon: Bell,
    },
    {
      title: "التقارير",
      url: "/dashboard/reports",
      icon: FileText,
    },
  ];

  const analysisMenuItems = [
    {
      title: "تحليل المشاعر",
      url: "/dashboard/sentiment",
      icon: BarChart3,
    },
    {
      title: "توزيع الفئات",
      url: "/dashboard/categories",
      icon: PieChart,
    },
    {
      title: "توزيع المنصات",
      url: "/dashboard/platforms",
      icon: Globe,
    },
    {
      title: "المواضيع الشائعة",
      url: "/dashboard/topics",
      icon: TrendingUp,
    },
    {
      title: "كشف اللهجات",
      url: "/dashboard/dialects",
      icon: Languages,
    },
  ];

  const adminMenuItems = [
    {
      title: "إدارة المستخدمين",
      url: "/admin/users",
      icon: Users2,
    },
    {
      title: "خطط الاشتراك",
      url: "/admin/plans",
      icon: BadgePercent,
    },
    {
      title: "الاشتراكات",
      url: "/admin/subscriptions",
      icon: CreditCard,
    },
    {
      title: "المعاملات",
      url: "/admin/transactions",
      icon: Receipt,
    },
    {
      title: "إعدادات النظام",
      url: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar side="right" className="border-l bg-card">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg">Arab Insights</h2>
            <p className="text-xs text-muted-foreground">تحليل البيانات الاجتماعية</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-foreground/70 mb-2">
            الميزات الرئيسية
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <Button 
                        variant="ghost"
                        className={`justify-start w-full h-10 ${
                          isActive(item.url) 
                            ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary' 
                            : 'hover:bg-muted/50'
                        }`}
                        dir={isRTL ? "rtl" : "ltr"}
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        <span className="flex-1 text-right">{item.title}</span>
                        {isActive(item.url) && <ChevronLeft className="h-4 w-4 ml-2" />}
                      </Button>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-foreground/70 mb-2">
            أدوات التحليل
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <Button 
                        variant="ghost"
                        className={`justify-start w-full h-10 ${
                          isActive(item.url) 
                            ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary' 
                            : 'hover:bg-muted/50'
                        }`}
                        dir={isRTL ? "rtl" : "ltr"}
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        <span className="flex-1 text-right">{item.title}</span>
                        {isActive(item.url) && <ChevronLeft className="h-4 w-4 ml-2" />}
                      </Button>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm font-medium text-foreground/70 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              إدارة النظام
              <Badge variant="destructive" className="text-xs">مشرف</Badge>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <Button 
                          variant="ghost"
                          className={`justify-start w-full h-10 ${
                            isActive(item.url) 
                              ? 'bg-destructive/10 text-destructive font-medium border-l-2 border-destructive' 
                              : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                          }`}
                          dir={isRTL ? "rtl" : "ltr"}
                        >
                          <item.icon className="h-4 w-4 mr-3" />
                          <span className="flex-1 text-right">{item.title}</span>
                          {isActive(item.url) && <ChevronLeft className="h-4 w-4 ml-2" />}
                        </Button>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/settings">
                    <Button 
                      variant="ghost"
                      className={`justify-start w-full h-10 ${
                        isActive('/dashboard/settings') 
                          ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      <span className="flex-1 text-right">الإعدادات</span>
                      {isActive('/dashboard/settings') && <ChevronLeft className="h-4 w-4 ml-2" />}
                    </Button>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile?.full_name || 'مستخدم'}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-xs text-muted-foreground">متصل</p>
              {isAdmin && (
                <Badge variant="destructive" className="text-xs">مشرف</Badge>
              )}
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
