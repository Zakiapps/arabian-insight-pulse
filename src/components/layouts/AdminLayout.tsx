
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserSession } from "@/hooks/useUserSession";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import Navbar from "./Navbar";

const AdminLayout = () => {
  const [mounted, setMounted] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { isRTL } = useLanguage();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Track user session for online status
  useUserSession();

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <SidebarProvider defaultOpen={isDesktop}>
      <div className="min-h-screen flex w-full bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Navbar />
          <main className="flex-1 p-4 md:p-6 overflow-auto bg-muted/20">
            <div className="w-full max-w-none">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
