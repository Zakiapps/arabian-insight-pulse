
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  MessageSquare, 
  Upload, 
  Bell, 
  FileText, 
  Settings, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const AppSidebar = () => {
  const { pathname } = useLocation();
  const { logout, user, profile } = useAuth();

  // Arabic menu items
  const menuItems = [
    { 
      icon: BarChart3, 
      label: "لوحة التحكم", 
      href: "/dashboard" 
    },
    { 
      icon: MessageSquare, 
      label: "المنشورات", 
      href: "/dashboard/posts" 
    },
    { 
      icon: Upload, 
      label: "رفع البيانات", 
      href: "/dashboard/upload" 
    },
    { 
      icon: Bell, 
      label: "التنبيهات", 
      href: "/dashboard/alerts" 
    },
    { 
      icon: FileText, 
      label: "التقارير", 
      href: "/dashboard/reports" 
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
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
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
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{profile?.full_name || user?.email}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
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
