
import React from "react";
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
  BarChart3, 
  Home, 
  MessageSquare, 
  Users, 
  Settings, 
  FileText, 
  TrendingUp, 
  Shield, 
  Database, 
  Activity,
  Upload,
  PieChart,
  Globe,
  Hash
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const AppSidebar = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const { isRTL } = useLanguage();
  const location = useLocation();

  // Don't show sidebar if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const userMenuItems = [
    {
      title: "الرئيسية",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "رفع الملفات",
      url: "/dashboard/upload",
      icon: Upload,
    },
    {
      title: "المنشورات",
      url: "/dashboard/posts",
      icon: MessageSquare,
    },
    {
      title: "تحليل المشاعر",
      url: "/dashboard/sentiment-analysis",
      icon: TrendingUp,
    },
    {
      title: "تحليل وسائل التواصل",
      url: "/dashboard/social-media-analysis",
      icon: Activity,
    },
    {
      title: "التقارير",
      url: "/dashboard/reports",
      icon: FileText,
    },
    {
      title: "الملف الشخصي",
      url: "/dashboard/profile",
      icon: Users,
    },
    {
      title: "الإعدادات",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const adminMenuItems = [
    {
      title: "لوحة التحكم الإدارية",
      url: "/admin",
      icon: Shield,
    },
    {
      title: "لوحة التحكم الرئيسية",
      url: "/admin/control-panel",
      icon: Database,
    },
    {
      title: "إدارة المستخدمين",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "إدارة المستخدمين المتقدمة",
      url: "/admin/users-management",
      icon: Users,
    },
    {
      title: "استخراج وسائل التواصل",
      url: "/admin/social-media-scraping",
      icon: Activity,
    },
  ];

  return (
    <Sidebar dir={isRTL ? "rtl" : "ltr"}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">رؤى عربية</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>الإدارة</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter>
        <div className="text-xs text-muted-foreground text-center p-2">
          رؤى عربية © 2024
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
