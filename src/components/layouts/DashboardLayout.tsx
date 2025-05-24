
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserSession } from "@/hooks/useUserSession";
import AppSidebar from "./AppSidebar";
import Navbar from "./Navbar";

const DashboardLayout = () => {
  const [mounted, setMounted] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { isRTL } = useLanguage();

  // Track user session for online status
  useUserSession();

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          <main className="flex-1 p-4 md:p-6 overflow-auto bg-muted/20">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
        <AppSidebar />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
