
import { ArrowRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { categories } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

// Updated with categories
const topicsData = [
  { topic: "السياسة", category: "politics", count: 850 },
  { topic: "الاقتصاد", category: "economy", count: 650 },
  { topic: "التعليم", category: "education", count: 550 },
  { topic: "الصحة", category: "health", count: 450 },
  { topic: "المجتمع", category: "society", count: 350 },
];

// Category colors
const CATEGORY_COLORS = [
  "#4f46e5", // politics - blue
  "#10b981", // economy - green
  "#f97316", // sports - orange
  "#8b5cf6", // technology - purple
  "#ef4444", // health - red
  "#eab308", // education - yellow
  "#6366f1", // society - indigo
];

export const TopTopics = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const t = {
    topTopics: isArabic ? "المواضيع الشائعة" : "Popular Topics",
    topicsDescription: isArabic ? "المواضيع الأكثر نقاشاً في المنشورات العربية" : "Most discussed topics in Arabic posts",
    viewAll: isArabic ? "عرض الكل" : "View All",
    posts: isArabic ? "منشور" : "posts",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{t.topTopics}</CardTitle>
          <CardDescription>{t.topicsDescription}</CardDescription>
        </div>
        <Button variant="ghost" size="icon">
          <ArrowRight className="h-4 w-4" />
          <span className="sr-only">{t.viewAll}</span>
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={topicsData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="topic" />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
              formatter={(value) => [`${value} ${t.posts}`, '']}
            />
            <Bar dataKey="count" name={t.posts}>
              {topicsData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={CATEGORY_COLORS[categories.findIndex(cat => cat.id === entry.category) % CATEGORY_COLORS.length]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
