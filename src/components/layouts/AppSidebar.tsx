import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    BadgePercent,
    BarChart3,
    Bell,
    Brain,
    CreditCard,
    FileText,
    FolderKanban,
    Globe,
    Languages,
    LayoutDashboard,
    MessageSquare,
    Newspaper,
    PieChart,
    Receipt,
    Settings,
    Shield,
    TrendingUp,
    Upload,
    Users2,
    Zap
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const AppSidebar = () => {
  const location = useLocation();
  const { profile, isAdmin, user } = useAuth();
  const { isRTL } = useLanguage();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  const mainMenuItems = [
    {
      title: isRTL ? "لوحة التحكم" : "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: isRTL ? "المشاريع" : "Projects",
      url: "/projects",
      icon: FolderKanban,
    },
    {
      title: isRTL ? "المنشورات" : "Posts",
      url: "/dashboard/posts",
      icon: MessageSquare,
    },
    {
      title: isRTL ? "رفع البيانات" : "Upload",
      url: "/dashboard/upload",
      icon: Upload,
    },
    {
      title: isRTL ? "التنبيهات" : "Alerts",
      url: "/dashboard/alerts",
      icon: Bell,
    },
    {
      title: isRTL ? "التقارير" : "Reports",
      url: "/dashboard/reports",
      icon: FileText,
    },
  ];

  const analysisMenuItems = [
    {
      title: isRTL ? "تحليل المشاعر" : "Sentiment Analysis",
      url: "/dashboard/sentiment",
      icon: BarChart3,
    },
    {
      title: isRTL ? "توزيع الفئات" : "Categories",
      url: "/dashboard/categories",
      icon: PieChart,
    },
    {
      title: isRTL ? "توزيع المنصات" : "Platforms",
      url: "/dashboard/platforms",
      icon: Globe,
    },
    {
      title: isRTL ? "المواضيع الشائعة" : "Topics",
      url: "/dashboard/topics",
      icon: TrendingUp,
    },
    {
      title: isRTL ? "كشف اللهجات" : "Dialects",
      url: "/dashboard/dialects",
      icon: Languages,
    },
  ];
  
  const modelsServicesItems = [
    {
      title: isRTL ? "تحليل المشاعر" : "Sentiment Analysis",
      url: "/models/sentiment",
      icon: Brain,
    },
    {
      title: isRTL ? "تلخيص النصوص" : "Text Summarization",
      url: "/models/summarization",
      icon: FileText,
    },
    {
      title: isRTL ? "BrightData" : "BrightData",
      url: "/models/brightdata",
      icon: Globe,
    },
    {
      title: isRTL ? "NewsAPI" : "NewsAPI",
      url: "/models/newsapi",
      icon: Newspaper,
    },
    {
      title: isRTL ? "التنبؤ" : "Forecasting",
      url: "/models/forecasting",
      icon: Zap,
    },
  ];

  const adminMenuItems = [
    {
      title: isRTL ? "إدارة المستخدمين" : "Users",
      url: "/admin/users",
      icon: Users2,
    },
    {
      title: isRTL ? "خطط الاشتراك" : "Plans",
      url: "/admin/plans",
      icon: BadgePercent,
    },
    {
      title: isRTL ? "الاشتراكات" : "Subscriptions",
      url: "/admin/subscriptions",
      icon: CreditCard,
    },
    {
      title: isRTL ? "المعاملات" : "Transactions",
      url: "/admin/transactions",
      icon: Receipt,
    },
    {
      title: isRTL ? "إعدادات النظام" : "Settings",
      url: "/admin/settings",
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
            <h2 className="font-bold text-lg">
              {isRTL ? "رؤى عربية" : "Arab Insights"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isRTL ? "تحليل البيانات الاجتماعية" : "Social Data Analysis"}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-foreground/70 mb-2 px-2">
            {isRTL ? "الميزات الرئيسية" : "Main Features"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-foreground/70 mb-2 px-2">
            {isRTL ? "أدوات التحليل" : "Analysis Tools"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-foreground/70 mb-2 px-2">
            {isRTL ? "النماذج والخدمات" : "Models & Services"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {modelsServicesItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm font-medium text-foreground/70 mb-2 flex items-center gap-2 px-2">
              <Shield className="h-4 w-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">
                {isRTL ? "إدارة النظام" : "Admin"}
              </span>
              <Badge variant="destructive" className="text-xs group-data-[collapsible=icon]:hidden">
                {isRTL ? "مشرف" : "Admin"}
              </Badge>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
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
                <SidebarMenuButton asChild isActive={isActive('/dashboard/settings')} tooltip={isRTL ? "الإعدادات" : "Settings"}>
                  <Link to="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors">
                    <Settings className="h-4 w-4 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {isRTL ? "الإعدادات" : "Settings"}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium truncate">
              {profile?.full_name || 'User'}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-xs text-muted-foreground">
                {isRTL ? "متصل" : "Online"}
              </p>
              {isAdmin && (
                <Badge variant="destructive" className="text-xs">
                  {isRTL ? "مشرف" : "Admin"}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;