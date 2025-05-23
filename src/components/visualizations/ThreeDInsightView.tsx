
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// Simple 2D replacement for the 3D visualization
interface ThreeDInsightViewProps {
  sentimentData?: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

const ThreeDInsightView = ({ sentimentData = { positive: 42, neutral: 35, negative: 23 } }: ThreeDInsightViewProps) => {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  if (!mounted) return null;
  
  const total = sentimentData.positive + sentimentData.neutral + sentimentData.negative;
  const positivePercent = (sentimentData.positive / total) * 100;
  const neutralPercent = (sentimentData.neutral / total) * 100;
  const negativePercent = (sentimentData.negative / total) * 100;
  
  return (
    <div className="w-full h-[350px] rounded-lg overflow-hidden border border-border bg-muted/30 p-4 relative">
      <div className="absolute top-2 right-2 text-xs text-muted-foreground">
        JordanInsight - تحليل المشاعر
      </div>
      
      {/* Main visualization container */}
      <div className="h-full flex flex-col items-center justify-center">
        {/* Sentiment bars */}
        <div className="flex items-end justify-center space-x-12 h-[60%]">
          <div className="flex flex-col items-center">
            <div className="text-sm mb-2">{positivePercent.toFixed(0)}%</div>
            <div 
              className="w-16 bg-green-500 rounded-t-md transition-all duration-300 hover:opacity-90"
              style={{ height: `${(sentimentData.positive / 100) * 200}px` }}
            ></div>
            <div className="mt-2 text-sm">{t("إيجابي")}</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-sm mb-2">{neutralPercent.toFixed(0)}%</div>
            <div 
              className="w-16 bg-gray-400 rounded-t-md transition-all duration-300 hover:opacity-90"
              style={{ height: `${(sentimentData.neutral / 100) * 200}px` }}
            ></div>
            <div className="mt-2 text-sm">{t("محايد")}</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-sm mb-2">{negativePercent.toFixed(0)}%</div>
            <div 
              className="w-16 bg-red-500 rounded-t-md transition-all duration-300 hover:opacity-90"
              style={{ height: `${(sentimentData.negative / 100) * 200}px` }}
            ></div>
            <div className="mt-2 text-sm">{t("سلبي")}</div>
          </div>
        </div>
        
        {/* Jordan map representation */}
        <div className="mt-8 bg-primary/20 h-16 w-48 rounded-md border border-primary/30 flex items-center justify-center">
          <span className="text-sm text-primary">المملكة الأردنية الهاشمية</span>
        </div>
      </div>
      
      <div className="absolute bottom-2 left-2 bg-black/40 text-white px-2 py-1 text-xs rounded">
        تحليل المشاعر في المجتمع الأردني
      </div>
    </div>
  );
};

export default ThreeDInsightView;
