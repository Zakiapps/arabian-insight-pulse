
import { NavLink } from "react-router-dom";
import { SidebarFooter, SidebarHeader, SidebarSection } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Users, Briefcase, CreditCard, PieChart, Settings, 
  Activity, Database, BarChart3, Coins, CreditCardIcon
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const AdminSidebar = () => {
  const { t, isRTL } = useLanguage();
  
  return (
    <>
      <SidebarHeader className="bg-sidebar py-4">
        <div className="flex items-center gap-2 px-5">
          <div className="rounded bg-primary p-1">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">
            لوحة الإدارة
          </span>
        </div>
      </SidebarHeader>
      
      <div className="flex-1 overflow-auto py-2">
        <SidebarSection title="نظرة عامة">
          <NavLink to="/admin" end>
            {({ isActive }) => (
              <Button
                variant={isActive ? "sidebar" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <PieChart className="mr-2 h-4 w-4" />
                لوحة المعلومات
              </Button>
            )}
          </NavLink>
        </SidebarSection>
        
        <SidebarSection title="إدارة">
          <NavLink to="/admin/users">
            {({ isActive }) => (
              <Button
                variant={isActive ? "sidebar" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Users className="mr-2 h-4 w-4" />
                المستخدمين
              </Button>
            )}
          </NavLink>
          <NavLink to="/admin/plans">
            {({ isActive }) => (
              <Button
                variant={isActive ? "sidebar" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                الخطط
              </Button>
            )}
          </NavLink>
          <NavLink to="/admin/subscriptions">
            {({ isActive }) => (
              <Button
                variant={isActive ? "sidebar" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Activity className="mr-2 h-4 w-4" />
                الاشتراكات
              </Button>
            )}
          </NavLink>
          <NavLink to="/admin/transactions">
            {({ isActive }) => (
              <Button
                variant={isActive ? "sidebar" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                المعاملات
              </Button>
            )}
          </NavLink>
        </SidebarSection>
        
        <SidebarSection title="إعدادات النظام">
          <NavLink to="/admin/settings">
            {({ isActive }) => (
              <Button
                variant={isActive ? "sidebar" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Settings className="mr-2 h-4 w-4" />
                الإعدادات العامة
              </Button>
            )}
          </NavLink>
          <NavLink to="/admin/payment-settings">
            {({ isActive }) => (
              <Button
                variant={isActive ? "sidebar" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Coins className="mr-2 h-4 w-4" />
                إعدادات الدفع
              </Button>
            )}
          </NavLink>
        </SidebarSection>
      </div>
      
      <SidebarFooter>
        <div className="bg-sidebar-accent rounded-md mx-3 p-4">
          <h3 className="font-medium text-sm mb-2">إحصائيات النظام</h3>
          <div className="grid gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">المستخدمون</span>
              <span className="font-medium">345</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">الإيرادات</span>
              <span className="font-medium">$12,435</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </>
  );
};

export default AdminSidebar;
