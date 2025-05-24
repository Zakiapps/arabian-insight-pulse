
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
} from "@/components/ui/sidebar";
import {
  ChevronRight,
  LayoutDashboard,
  FileText,
  Upload,
  Bell,
  BarChart3,
  Settings,
  MessageSquare,
  TrendingUp,
  Users,
  Globe,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AppSidebar = () => {
  const location = useLocation();
  const { profile } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const mainFeatures = [
    {
      title: "لوحة التحكم",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "المنشورات",
      url: "/dashboard/posts",
      icon: FileText,
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
      icon: BarChart3,
    },
  ];

  const analysisFeatures = [
    {
      title: "تحليل المشاعر",
      url: "/dashboard/sentiment",
      icon: TrendingUp,
    },
    {
      title: "توزيع الفئات",
      url: "/dashboard/categories",
      icon: BarChart3,
    },
    {
      title: "توزيع المنصات",
      url: "/dashboard/platforms",
      icon: Globe,
    },
    {
      title: "المواضيع الشائعة",
      url: "/dashboard/topics",
      icon: MessageSquare,
    },
    {
      title: "كشف اللهجة",
      url: "/dashboard/dialects",
      icon: Users,
    },
  ];

  return (
    <Sidebar>
      <SidebarContent className="pt-6">
        <div className="mb-4 px-4">
          <h2 className="font-bold text-lg tracking-tight mb-1">أراب إنسايتس</h2>
          <p className="text-sm text-muted-foreground mb-4">تحليل البيانات الاجتماعية</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-muted-foreground">{profile?.role || 'مستخدم'}</p>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>الميزات الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainFeatures.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <Button 
                        variant="ghost"
                        className={`justify-start w-full ${isActive(item.url) ? 'bg-primary/10 text-primary font-medium' : ''}`}
                      >
                        <item.icon className="h-4 w-4 ml-2" />
                        <span>{item.title}</span>
                        <ChevronRight className="h-4 w-4 mr-auto" />
                      </Button>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>أدوات التحليل</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisFeatures.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <Button 
                        variant="ghost"
                        className={`justify-start w-full ${isActive(item.url) ? 'bg-primary/10 text-primary font-medium' : ''}`}
                      >
                        <item.icon className="h-4 w-4 ml-2" />
                        <span>{item.title}</span>
                        <ChevronRight className="h-4 w-4 mr-auto" />
                      </Button>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>الإعدادات</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/settings">
                    <Button 
                      variant="ghost"
                      className={`justify-start w-full ${isActive('/dashboard/settings') ? 'bg-primary/10 text-primary font-medium' : ''}`}
                    >
                      <Settings className="h-4 w-4 ml-2" />
                      <span>إعدادات الحساب</span>
                      <ChevronRight className="h-4 w-4 mr-auto" />
                    </Button>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
