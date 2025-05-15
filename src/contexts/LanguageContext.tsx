
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface LanguageContextType {
  isRTL: boolean;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Set Arabic as the only language
  const [isRTL, setIsRTL] = useState<boolean>(true);
  
  // Set initial direction when component mounts
  useEffect(() => {
    document.documentElement.dir = 'rtl';
  }, []);

  // Simple translation helper (now just returns the text since we only have Arabic)
  const t = (text: string): string => {
    return text;
  };

  return (
    <LanguageContext.Provider value={{ isRTL, t }}>
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
