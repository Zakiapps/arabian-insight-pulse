
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
  ChevronRight,
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
    <Sidebar side="left" className="border-r bg-card">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg">لوحة المشرف</h2>
            <p className="text-xs text-muted-foreground">إدارة النظام والمستخدمين</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-foreground/70 mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            أدوات الإدارة
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
                            ? 'bg-destructive/10 text-destructive font-medium border-r-2 border-destructive' 
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <item.icon className="h-4 w-4 ml-3" />
                        <span className="flex-1 text-right">{item.title}</span>
                        {isActive(item.url) && <ChevronRight className="h-4 w-4 mr-2" />}
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
            العودة للوحة الرئيسية
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard">
                    <Button 
                      variant="ghost"
                      className="justify-start w-full h-10 hover:bg-primary/10 hover:text-primary"
                    >
                      <BarChart3 className="h-4 w-4 ml-3" />
                      <span className="flex-1 text-right">لوحة التحكم الرئيسية</span>
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
              {profile?.full_name?.charAt(0) || 'M'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile?.full_name || 'مشرف'}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-xs text-muted-foreground">{profile?.role || 'مشرف'}</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
