
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface LanguageContextType {
  isRTL: boolean;
  t: (text: string) => string;
  language: string;
  toggleLanguage: () => void;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  // Dashboard translations
  'Dashboard': 'لوحة التحكم',
  'Monitor and analyze sentiments, dialects and topics in Arabic social media': 'مراقبة وتحليل المشاعر واللهجات والمواضيع في وسائل التواصل الاجتماعي العربية',
  'Filter': 'تصفية',
  'Export': 'تصدير',
  'Export as PDF': 'تصدير كملف PDF',
  'Export as Excel': 'تصدير كملف Excel',
  'All': 'الكل',
  'Total Analyzed Posts': 'إجمالي المنشورات المحللة',
  'Positive Sentiment': 'المشاعر الإيجابية',
  'Neutral Sentiment': 'المشاعر المحايدة',
  'Negative Sentiment': 'المشاعر السلبية',
  'from last week': 'من الأسبوع الماضي',
  'posts': 'منشور',
  'Platform Distribution': 'توزيع المنصات',
  'Posts by social media platform': 'المنشورات حسب منصة التواصل الاجتماعي',
  'View All': 'عرض الكل',
  'Dialect Detection': 'كشف اللهجة',
  'Distribution of Jordanian vs non-Jordanian dialects': 'توزيع اللهجات الأردنية مقابل غير الأردنية',
  
  // Admin panel translations
  'Users': 'المستخدمين',
  'Settings': 'الإعدادات',
  'Logout': 'تسجيل الخروج',
  'Search': 'بحث',
  'Notifications': 'الإشعارات',
  'Profile': 'الملف الشخصي',
  'Help': 'المساعدة',
  'Admin': 'مدير',
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Initial setting is Arabic (RTL)
  const [isRTL, setIsRTL] = useState<boolean>(true);
  const [language, setLanguageState] = useState<string>('ar');
  
  // Update document direction when RTL state changes
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  // Toggle between RTL and LTR
  const toggleLanguage = () => {
    setIsRTL(prev => !prev);
    setLanguageState(prev => prev === 'ar' ? 'en' : 'ar');
  };

  // Set language directly
  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    setIsRTL(lang === 'ar');
  };

  // Simple translation helper 
  const t = (text: string): string => {
    if (language === 'en') return text;
    return translations[text as keyof typeof translations] || text;
  };

  return (
    <LanguageContext.Provider value={{ isRTL, t, language, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
