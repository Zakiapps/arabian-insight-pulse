
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";
import { useEffect } from "react";

export function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  // Apply language direction change to document
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleLanguage} 
      title={language === 'ar' ? "Switch to English" : "التبديل إلى العربية"}
      className="transition-all hover:bg-primary/10"
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">{language === 'ar' ? "Switch to English" : "التبديل إلى العربية"}</span>
    </Button>
  );
}
