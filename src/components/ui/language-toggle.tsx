
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageToggle() {
  const { toggleLanguage, isRTL } = useLanguage();

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage}>
      <span className="font-semibold text-xs">{isRTL ? "EN" : "AR"}</span>
      <span className="sr-only">Toggle Language</span>
    </Button>
  );
}
