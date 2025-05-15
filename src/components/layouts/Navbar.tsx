
import { useState } from "react";
import { Bell, ChevronDown, Languages, Search, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const translations = {
    search: language === 'ar' ? "البحث في المنشورات..." : "Search posts...",
    profile: language === 'ar' ? "إعدادات الملف الشخصي" : "Profile settings",
    logout: language === 'ar' ? "تسجيل الخروج" : "Log out",
    notifications: language === 'ar' ? "الإشعارات" : "Notifications",
    alertTitle: language === 'ar' ? "تنبيه: تم رصد مشاعر سلبية عالية" : "Alert: High negative sentiment detected",
    alertDesc: language === 'ar' ? "آخر 20 منشورًا عن \"الحكومة\" لديهم 65٪ مشاعر سلبية" : "The last 20 posts about \"الحكومة\" have 65% negative sentiment",
    uploadTitle: language === 'ar' ? "تمت معالجة تحميل CSV" : "CSV upload processed",
    uploadDesc: language === 'ar' ? "تم تحليل مجموعتك المكونة من 150 منشورًا" : "Your batch of 150 posts has been analyzed",
    timeAgo1: language === 'ar' ? "قبل 12 دقيقة" : "12m ago",
    timeAgo2: language === 'ar' ? "قبل ساعتين" : "2h ago",
  };
  
  return (
    <header className="border-b bg-background sticky top-0 z-30">
      <div className="flex h-16 items-center px-4 gap-4">
        <SidebarTrigger />
        
        <div className="hidden md:flex md:flex-1 md:items-center md:gap-4 md:w-full">
          <form className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder={translations.search}
                className="w-full bg-background rounded-md border border-input pr-9 pl-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setShowNotifications(true)}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>
          
          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {user?.name.charAt(0)}
                </div>
                <div className="hidden md:flex md:flex-col md:items-end">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.role}</span>
                </div>
                <ChevronDown className="hidden md:inline h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <div className="flex flex-col space-y-0.5">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/settings" className="cursor-pointer flex w-full items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>{translations.profile}</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                {translations.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translations.notifications}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3 border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{translations.alertTitle}</p>
                  <p className="text-sm text-muted-foreground">{translations.alertDesc}</p>
                </div>
                <span className="text-xs text-muted-foreground">{translations.timeAgo1}</span>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{translations.uploadTitle}</p>
                  <p className="text-sm text-muted-foreground">{translations.uploadDesc}</p>
                </div>
                <span className="text-xs text-muted-foreground">{translations.timeAgo2}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Navbar;
