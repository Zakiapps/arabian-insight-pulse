
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  isRTL: boolean;
  t: (ar: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Change default language to Arabic
  const [language, setLanguage] = useState<Language>('ar');
  
  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'ar' ? 'en' : 'ar';
      // Update document direction based on language
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      return newLang;
    });
  };

  // Set initial direction when component mounts
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, []);

  // Simple translation helper
  const t = (ar: string, en: string): string => {
    return language === 'ar' ? ar : en;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, isRTL, t }}>
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
