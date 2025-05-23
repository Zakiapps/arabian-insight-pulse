
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

// Dummy data
const timeframeSentimentData = [
  { date: "06/01", positive: 48, neutral: 32, negative: 20 },
  { date: "06/02", positive: 42, neutral: 36, negative: 22 },
  { date: "06/03", positive: 45, neutral: 35, negative: 20 },
  { date: "06/04", positive: 39, neutral: 37, negative: 24 },
  { date: "06/05", positive: 38, neutral: 32, negative: 30 },
  { date: "06/06", positive: 35, neutral: 33, negative: 32 },
  { date: "06/07", positive: 30, neutral: 37, negative: 33 },
];

const SENTIMENT_COLORS = {
  positive: "hsl(var(--sentiment-positive))",
  neutral: "hsl(var(--sentiment-neutral))",
  negative: "hsl(var(--sentiment-negative))",
};

export const SentimentAnalysis = () => {
  const [timeframe, setTimeframe] = useState("7d");
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const t = {
    sentimentAnalysis: isArabic ? "تحليل المشاعر" : "Sentiment Analysis",
    sentimentOverTime: isArabic ? "توزيع المشاعر على مدار الوقت" : "Sentiment distribution over time",
    week: isArabic ? "أسبوع" : "Week",
    month: isArabic ? "شهر" : "Month",
    quarter: isArabic ? "ربع سنة" : "Quarter",
    positive: isArabic ? "إيجابي" : "Positive",
    neutral: isArabic ? "محايد" : "Neutral",
    negative: isArabic ? "سلبي" : "Negative",
  };

  return (
    <Card className="col-span-full lg:col-span-4">
      <CardHeader>
        <CardTitle>{t.sentimentAnalysis}</CardTitle>
        <CardDescription>
          {t.sentimentOverTime}
        </CardDescription>
        <Tabs defaultValue="7d" className="w-full" onValueChange={setTimeframe}>
          <TabsList className="grid w-full max-w-xs grid-cols-3">
            <TabsTrigger value="7d">{t.week}</TabsTrigger>
            <TabsTrigger value="30d">{t.month}</TabsTrigger>
            <TabsTrigger value="90d">{t.quarter}</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timeframeSentimentData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
              formatter={(value) => [`${value}%`, '']}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="positive" 
              name={t.positive} 
              stackId="1" 
              stroke={SENTIMENT_COLORS.positive} 
              fill={SENTIMENT_COLORS.positive}
              fillOpacity={0.6} 
            />
            <Area 
              type="monotone" 
              dataKey="neutral" 
              name={t.neutral} 
              stackId="1" 
              stroke={SENTIMENT_COLORS.neutral} 
              fill={SENTIMENT_COLORS.neutral}
              fillOpacity={0.6} 
            />
            <Area 
              type="monotone" 
              dataKey="negative" 
              name={t.negative} 
              stackId="1" 
              stroke={SENTIMENT_COLORS.negative} 
              fill={SENTIMENT_COLORS.negative}
              fillOpacity={0.6} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
