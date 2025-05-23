
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface LanguageContextType {
  isRTL: boolean;
  t: (text: string) => string;
  language: string;
  toggleLanguage: () => void; // Add the toggleLanguage function
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Initial setting is Arabic (RTL)
  const [isRTL, setIsRTL] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>('ar');
  
  // Update document direction when RTL state changes
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  // Toggle between RTL and LTR
  const toggleLanguage = () => {
    setIsRTL(prev => !prev);
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  // Simple translation helper 
  const t = (text: string): string => {
    return text;
  };

  return (
    <LanguageContext.Provider value={{ isRTL, t, language, toggleLanguage }}>
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
