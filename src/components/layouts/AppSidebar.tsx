
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
  Receipt,
  BadgePercent,
  Shield,
  Download,
  Filter,
  Plus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTaskHistory } from "@/hooks/useTaskHistory";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isAdmin, user } = useAuth();
  const { isRTL } = useLanguage();
  const { startTask, completeTask } = useTaskHistory();
  const { createNotification } = useNotifications();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  // Quick action handlers
  const handleQuickAction = async (action: string, path: string, taskName: string) => {
    if (!user || !profile) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    const taskId = await startTask(action, taskName);
    try {
      navigate(path);
      await completeTask(taskId, { page: path });
      await createNotification('تم التنفيذ', `تم ${taskName} بنجاح`, 'success');
    } catch (error) {
      await completeTask(taskId, null, `فشل في ${taskName}`);
    }
  };

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
      quickAction: true,
      action: "upload_data",
      taskName: "الانتقال لرفع البيانات"
    },
    {
      title: "التنبيهات",
      url: "/dashboard/alerts",
      icon: Bell,
      quickAction: true,
      action: "setup_alert",
      taskName: "الانتقال للتنبيهات"
    },
    {
      title: "التقارير",
      url: "/dashboard/reports",
      icon: FileText,
      quickAction: true,
      action: "view_reports",
      taskName: "الانتقال للتقارير"
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

  const quickActionsItems = [
    {
      title: "تحليل جديد",
      url: "/dashboard/upload",
      icon: Plus,
      quickAction: true,
      action: "new_analysis",
      taskName: "بدء تحليل جديد"
    },
    {
      title: "تصفية البيانات",
      url: "/dashboard/posts",
      icon: Filter,
      quickAction: true,
      action: "filter_data",
      taskName: "تصفية البيانات"
    },
    {
      title: "تصدير البيانات",
      url: "/dashboard/reports",
      icon: Download,
      quickAction: true,
      action: "export_data",
      taskName: "تصدير البيانات"
    }
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
    <Sidebar side="right" className="border-l bg-card" collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <h2 className="font-bold text-lg">Arab Insights</h2>
            <p className="text-xs text-muted-foreground">تحليل البيانات الاجتماعية</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-foreground/70 mb-2 px-2">
            الميزات الرئيسية
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    {item.quickAction ? (
                      <button 
                        onClick={() => handleQuickAction(item.action!, item.url, item.taskName!)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </button>
                    ) : (
                      <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-foreground/70 mb-2 px-2">
            إجراءات سريعة
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActionsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <button 
                      onClick={() => handleQuickAction(item.action!, item.url, item.taskName!)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left hover:bg-primary/10"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-foreground/70 mb-2 px-2">
            أدوات التحليل
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

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm font-medium text-foreground/70 mb-2 flex items-center gap-2 px-2">
              <Shield className="h-4 w-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">إدارة النظام</span>
              <Badge variant="destructive" className="text-xs group-data-[collapsible=icon]:hidden">مشرف</Badge>
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
                <SidebarMenuButton asChild isActive={isActive('/dashboard/settings')} tooltip="الإعدادات">
                  <Link to="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors">
                    <Settings className="h-4 w-4 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden">الإعدادات</span>
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
