
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
  Users2,
  CreditCard,
  DollarSign,
  Receipt,
  Settings,
  BadgePercent,
  CreditCard as PaymentCardIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const AdminSidebar = () => {
  const location = useLocation();
  const { profile } = useAuth();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <Sidebar>
      <SidebarContent className="pt-6">
        <div className="mb-4 px-4">
          <h2 className="font-bold text-lg tracking-tight mb-1">لوحة المشرف</h2>
          <p className="text-sm text-muted-foreground mb-4">إدارة المستخدمين والاشتراكات</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-muted-foreground">{profile?.role || 'مشرف'}</p>
          </div>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>الإدارة</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin">
                    <Button 
                      variant="ghost"
                      className={`justify-start w-full ${isActive('/admin') && !isActive('/admin/') ? 'bg-primary/10 text-primary font-medium' : ''}`}
                    >
                      <LayoutDashboard className="h-4 w-4 ml-2" />
                      <span>لوحة التحكم</span>
                      <ChevronRight className="h-4 w-4 mr-auto" />
                    </Button>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin/users">
                    <Button 
                      variant="ghost"
                      className={`justify-start w-full ${isActive('/admin/users') ? 'bg-primary/10 text-primary font-medium' : ''}`}
                    >
                      <Users2 className="h-4 w-4 ml-2" />
                      <span>المستخدمين</span>
                      <ChevronRight className="h-4 w-4 mr-auto" />
                    </Button>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin/plans">
                    <Button 
                      variant="ghost"
                      className={`justify-start w-full ${isActive('/admin/plans') ? 'bg-primary/10 text-primary font-medium' : ''}`}
                    >
                      <BadgePercent className="h-4 w-4 ml-2" />
                      <span>خطط الاشتراك</span>
                      <ChevronRight className="h-4 w-4 mr-auto" />
                    </Button>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin/subscriptions">
                    <Button 
                      variant="ghost"
                      className={`justify-start w-full ${isActive('/admin/subscriptions') ? 'bg-primary/10 text-primary font-medium' : ''}`}
                    >
                      <CreditCard className="h-4 w-4 ml-2" />
                      <span>الاشتراكات</span>
                      <ChevronRight className="h-4 w-4 mr-auto" />
                    </Button>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin/transactions">
                    <Button 
                      variant="ghost"
                      className={`justify-start w-full ${isActive('/admin/transactions') ? 'bg-primary/10 text-primary font-medium' : ''}`}
                    >
                      <Receipt className="h-4 w-4 ml-2" />
                      <span>المعاملات</span>
                      <ChevronRight className="h-4 w-4 mr-auto" />
                    </Button>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>الإعدادات</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin/settings">
                    <Button 
                      variant="ghost"
                      className={`justify-start w-full ${isActive('/admin/settings') ? 'bg-primary/10 text-primary font-medium' : ''}`}
                    >
                      <Settings className="h-4 w-4 ml-2" />
                      <span>إعدادات النظام</span>
                      <ChevronRight className="h-4 w-4 mr-auto" />
                    </Button>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin/payment-settings">
                    <Button 
                      variant="ghost"
                      className={`justify-start w-full ${isActive('/admin/payment-settings') ? 'bg-primary/10 text-primary font-medium' : ''}`}
                    >
                      <PaymentCardIcon className="h-4 w-4 ml-2" />
                      <span>إعدادات الدفع</span>
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

export default AdminSidebar;
