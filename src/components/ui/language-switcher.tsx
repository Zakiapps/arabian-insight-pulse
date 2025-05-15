
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage} title={language === 'ar' ? "Switch to English" : "التبديل إلى العربية"}>
      <Languages className="h-5 w-5" />
    </Button>
  );
}
