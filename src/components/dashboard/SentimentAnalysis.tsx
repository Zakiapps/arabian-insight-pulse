
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const data = [
  { sentiment: "إيجابي", count: 450, color: "#22c55e" },
  { sentiment: "محايد", count: 320, color: "#6b7280" },
  { sentiment: "سلبي", count: 180, color: "#ef4444" },
];

interface SentimentAnalysisProps {
  onSentimentClick?: (sentiment: string) => void;
}

export default function SentimentAnalysis({ onSentimentClick }: SentimentAnalysisProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const t = {
    sentimentAnalysis: isArabic ? "تحليل المشاعر" : "Sentiment Analysis",
    sentimentDescription: isArabic ? "توزيع المشاعر في المنشورات المحللة" : "Distribution of sentiments in analyzed posts",
    positive: isArabic ? "إيجابي" : "Positive",
    negative: isArabic ? "سلبي" : "Negative",
    neutral: isArabic ? "محايد" : "Neutral",
    posts: isArabic ? "منشور" : "posts",
  };

  const handleBarClick = (sentiment: string) => {
    const sentimentMap: { [key: string]: string } = {
      "إيجابي": "positive",
      "محايد": "neutral", 
      "سلبي": "negative"
    };
    
    const englishSentiment = sentimentMap[sentiment] || sentiment;
    onSentimentClick?.(englishSentiment);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          {t.sentimentAnalysis}
        </CardTitle>
        <CardDescription>{t.sentimentDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            {data.map((item) => (
              <div 
                key={item.sentiment} 
                className="space-y-1 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                onClick={() => handleBarClick(item.sentiment)}
              >
                <div className="flex items-center justify-center">
                  {item.sentiment === "إيجابي" && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {item.sentiment === "محايد" && <Minus className="h-4 w-4 text-gray-500" />}
                  {item.sentiment === "سلبي" && <TrendingDown className="h-4 w-4 text-red-500" />}
                </div>
                <div className="text-2xl font-bold" style={{ color: item.color }}>
                  {item.count}
                </div>
                <div className="text-xs text-muted-foreground">{item.sentiment}</div>
              </div>
            ))}
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <XAxis dataKey="sentiment" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} ${t.posts}`, '']}
                contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
              />
              <Bar 
                dataKey="count" 
                fill="#8884d8"
                onClick={(data) => handleBarClick(data.sentiment)}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
