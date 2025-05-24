
import { Bell, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  SidebarTrigger,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminNavbar = () => {
  return (
    <header className="h-16 flex items-center gap-4 border-b bg-background px-4 lg:px-6">
      <div className="flex items-center gap-2 lg:gap-3">
        <SidebarTrigger />
        <div className="flex-1 flex items-center">
          <span className="text-lg font-semibold hidden md:inline-block">لوحة الإدارة</span>
        </div>
      </div>
      <div className="flex flex-1 items-center gap-4 md:gap-2 lg:gap-4">
        <form className="hidden md:flex-1 md:flex md:max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="البحث في النظام..."
              className="w-full pl-8 bg-background"
            />
          </div>
        </form>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex">
            <LanguageToggle />
          </div>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute top-1 right-1 h-2 w-2 p-0" variant="destructive" />
                <span className="sr-only">الإشعارات</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2 font-medium">الإشعارات</div>
              <div className="p-4 text-center text-sm text-muted-foreground">
                لا توجد إشعارات جديدة
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="icon" variant="ghost">
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">المساعدة</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
