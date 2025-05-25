
import { Outlet } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const AuthLayout = () => {
  const { isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50" dir={isRTL ? "rtl" : "ltr"}>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
