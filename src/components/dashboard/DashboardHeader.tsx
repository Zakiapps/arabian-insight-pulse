
import { ChevronDown, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";

export const DashboardHeader = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const t = {
    dashboard: isArabic ? "لوحة التحكم" : "Dashboard",
    description: isArabic 
      ? "مراقبة وتحليل المشاعر واللهجات والمواضيع في وسائل التواصل الاجتماعي العربية" 
      : "Monitor and analyze sentiments, dialects and topics in Arabic social media",
    filter: isArabic ? "تصفية" : "Filter",
    export: isArabic ? "تصدير" : "Export",
    exportAsPDF: isArabic ? "تصدير كملف PDF" : "Export as PDF",
    exportAsExcel: isArabic ? "تصدير كملف Excel" : "Export as Excel",
    all: isArabic ? "الكل" : "All",
  };

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.dashboard}</h1>
        <p className="text-muted-foreground">
          {t.description}
        </p>
      </div>
      <div className="flex gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1">
              <Filter className="w-4 h-4 ml-1" />
              {t.filter}
              <ChevronDown className="w-4 h-4 mr-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>{t.all}</DropdownMenuItem>
            <DropdownMenuItem>Facebook</DropdownMenuItem>
            <DropdownMenuItem>Twitter</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1">
              <Download className="w-4 h-4 ml-1" />
              {t.export}
              <ChevronDown className="w-4 h-4 mr-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>{t.exportAsPDF}</DropdownMenuItem>
            <DropdownMenuItem>{t.exportAsExcel}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
