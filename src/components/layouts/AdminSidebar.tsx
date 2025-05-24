
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
  Users2,
  CreditCard,
  Receipt,
  Settings,
  BadgePercent,
  CreditCard as PaymentCardIcon,
  Shield,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const AdminSidebar = () => {
  const location = useLocation();
  const { profile } = useAuth();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  const adminMenuItems = [
    {
      title: "لوحة المشرف",
      url: "/admin",
      icon: LayoutDashboard,
    },
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
    {
      title: "إعدادات الدفع",
      url: "/admin/payment-settings",
      icon: PaymentCardIcon,
    },
  ];

  return (
    <Sidebar side="right" className="border-l bg-card" collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive text-destructive-foreground shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <h2 className="font-bold text-lg text-right">لوحة المشرف</h2>
            <p className="text-xs text-muted-foreground text-right">إدارة النظام والمستخدمين</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-foreground/70 mb-2 flex items-center gap-2 justify-end">
            <Badge variant="destructive" className="text-xs group-data-[collapsible=icon]:hidden">مشرف</Badge>
            <span className="group-data-[collapsible=icon]:hidden">أدوات الإدارة</span>
            <Shield className="h-4 w-4 shrink-0" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-right">
                      <span className="group-data-[collapsible=icon]:hidden flex-1">{item.title}</span>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {isActive(item.url) && <ChevronLeft className="h-4 w-4 shrink-0" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-foreground/70 mb-2 text-right group-data-[collapsible=icon]:hidden">
            العودة للوحة الرئيسية
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="لوحة التحكم الرئيسية">
                  <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-right hover:bg-primary/10 hover:text-primary">
                    <span className="group-data-[collapsible=icon]:hidden flex-1">لوحة التحكم الرئيسية</span>
                    <BarChart3 className="h-4 w-4 shrink-0" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0 text-right group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium truncate">
              {profile?.full_name || 'مشرف'}
            </p>
            <div className="flex items-center gap-2 justify-end">
              <p className="text-xs text-muted-foreground">{profile?.role || 'مشرف'}</p>
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
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
