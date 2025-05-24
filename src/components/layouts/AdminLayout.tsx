
import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import AppSidebar from "./AdminSidebar";
import Navbar from "./AdminNavbar";
import { useAuth } from "@/contexts/AuthContext";

const AdminLayout = () => {
  const [mounted, setMounted] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Force RTL for admin panel
  const { setLanguage } = useLanguage();

  // Set language to Arabic for admin panel
  useEffect(() => {
    setLanguage('ar');
    document.documentElement.dir = 'rtl';
  }, [setLanguage]);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!mounted) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/10" dir="rtl">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
