
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { isRTL } = useLanguage();

  useEffect(() => {
    console.error(
      "خطأ 404: محاولة وصول المستخدم إلى مسار غير موجود:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100" dir={isRTL ? "rtl" : "ltr"}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">عذرًا! الصفحة غير موجودة</p>
        <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
