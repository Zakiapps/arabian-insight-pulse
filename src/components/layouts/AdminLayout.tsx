
import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserSession } from "@/hooks/useUserSession";
import AppSidebar from "./AdminSidebar";
import Navbar from "./AdminNavbar";
import { useAuth } from "@/contexts/AuthContext";

const AdminLayout = () => {
  const [mounted, setMounted] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { isRTL } = useLanguage();

  // Track admin session for online status
  useUserSession();

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
    <SidebarProvider defaultOpen={isDesktop}>
      <div className="min-h-screen flex w-full bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <div className="flex flex-col flex-1 min-w-0">
          <Navbar />
          <main className="flex-1 p-4 md:p-6 overflow-auto bg-muted/20">
            <div className="w-full max-w-none">
              <Outlet />
            </div>
          </main>
        </div>
        <AppSidebar />
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
