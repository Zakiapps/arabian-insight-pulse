
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  MessageSquare, 
  Upload, 
  Bell, 
  FileText, 
  Settings, 
  LogOut,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const AppSidebar = () => {
  const { pathname } = useLocation();
  const { logout, user, profile } = useAuth();
  const { canAccessFeature } = useSubscription();

  // Define menu items with feature requirements
  const menuItems = [
    { 
      icon: BarChart3, 
      label: "لوحة التحكم", 
      href: "/dashboard",
      featureName: "basic-analytics" 
    },
    { 
      icon: MessageSquare, 
      label: "المنشورات", 
      href: "/dashboard/posts",
      featureName: "basic-analytics" 
    },
    { 
      icon: Upload, 
      label: "رفع البيانات", 
      href: "/dashboard/upload",
      featureName: "bulk-upload" 
    },
    { 
      icon: Bell, 
      label: "التنبيهات", 
      href: "/dashboard/alerts",
      featureName: "sentiment-analysis" 
    },
    { 
      icon: FileText, 
      label: "التقارير", 
      href: "/dashboard/reports",
      featureName: "advanced-reporting" 
    },
    { 
      icon: Settings, 
      label: "الإعدادات", 
      href: "/dashboard/settings" 
    },
  ];

  return (
    <Sidebar side="right" variant="floating" className="border-r border-t-0 border-b-0 border-l-0">
      <SidebarHeader className="border-b py-3">
        <Link to="/dashboard" className="flex items-center gap-2 px-4">
          <div className="rounded-md bg-primary p-1.5">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-xl">
            رؤى عربية
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="pt-6">
        <SidebarMenu>
          {menuItems.map((item) => {
            const hasAccess = !item.featureName || canAccessFeature(item.featureName);
            
            return (
              <SidebarMenuItem key={item.href}>
                {hasAccess ? (
                  <SidebarMenuButton asChild className={
                    cn("w-full justify-start gap-4", 
                      pathname === item.href && "bg-sidebar-accent",
                      "[&>a]:flex [&>a]:items-center [&>a]:gap-4"
                    )
                  }>
                    <Link to={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={
                        cn("w-full flex items-center justify-start gap-4 px-3 py-2 text-sm rounded-md opacity-60 cursor-not-allowed")
                      }>
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                        <Lock className="h-3.5 w-3.5 ml-auto" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>هذه الميزة غير متاحة في اشتراكك الحالي</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 px-2">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">{profile?.full_name || user?.email}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
              </div>
            </div>
            <SubscriptionBadge showIcon={false} className="text-xs" />
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-sidebar-accent text-right"
          >
            <LogOut className="h-4 w-4 ml-1" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
