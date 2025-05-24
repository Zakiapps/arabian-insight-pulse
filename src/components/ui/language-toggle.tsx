
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageToggle() {
  const { toggleLanguage, isRTL } = useLanguage();

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-full w-9 h-9">
      <span className="font-semibold text-xs">{isRTL ? "EN" : "عربي"}</span>
      <span className="sr-only">تبديل اللغة</span>
    </Button>
  );
}
