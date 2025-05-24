import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings } from "lucide-react";

const Navbar = () => {
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const isArabic = language === 'ar';

  const handleLanguageToggle = () => {
    setLanguage(isArabic ? 'en' : 'ar');
  };

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary">Arab Insights</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8 md:space-x-reverse">
              <Link
                to="/dashboard"
                className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                {isArabic ? "لوحة القيادة" : "Dashboard"}
              </Link>
              <Link
                to="/text-analysis"
                className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                {isArabic ? "تحليل النصوص" : "Text Analysis"}
              </Link>
              <Link
                to="/reports"
                className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                {isArabic ? "التقارير" : "Reports"}
              </Link>
              <Link
                to="/pricing"
                className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                {isArabic ? "الأسعار" : "Pricing"}
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <Button variant="outline" size="sm" onClick={handleLanguageToggle}>
              {isArabic ? 'English' : 'العربية'}
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-3 h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || ''} alt={user.full_name || user.email} />
                      <AvatarFallback>{user.full_name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link to="/profile" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      {isArabic ? "الملف الشخصي" : "Profile"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="h-4 w-4 ml-2" />
                    {isArabic ? "تسجيل الخروج" : "Log out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:ml-6 md:flex md:items-center">
                <Link
                  to="/login"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {isArabic ? "تسجيل الدخول" : "Log in"}
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 ml-4 px-4 py-2 rounded-md text-sm font-medium"
                >
                  {isArabic ? "إنشاء حساب" : "Register"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
